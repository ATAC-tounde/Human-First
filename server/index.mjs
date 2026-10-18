import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { publicCatalog, getExercise, publicTraining } from './catalog.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '../public');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';
const maxBodyBytes = 12_000;
const ttl = 2 * 60 * 60 * 1000;
const sessions = new Map();
const publicFiles = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/styles.css': ['styles.css', 'text/css; charset=utf-8'],
  '/favicon.svg': ['favicon.svg', 'image/svg+xml']
};
const commonHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Content-Security-Policy': "default-src 'none'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; base-uri 'none'; form-action 'self'; frame-ancestors 'none'"
};
function json(res, code, data, extra = {}) {
  res.writeHead(code, {...commonHeaders, 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra});
  res.end(JSON.stringify(data));
}
function reject(res, code, message) {json(res, code, {error: message});}
function cookieId(req) {
  const raw = req.headers.cookie || '';
  const value = raw.split(';').map(x => x.trim()).find(x => x.startsWith('hf_session='));
  return value ? value.slice('hf_session='.length) : null;
}
function currentSession(req) {
  const id = cookieId(req);
  if (!id || !/^[a-zA-Z0-9_-]{32,80}$/.test(id)) return null;
  const session = sessions.get(id);
  if (!session) return null;
  if (session.expiry < Date.now()) {sessions.delete(id); return null;}
  return session;
}
function cookie(req, id) {
  const forwarded = process.env.TRUST_PROXY === '1' && req.headers['x-forwarded-proto'] === 'https';
  const isHttps = Boolean(req.socket.encrypted) || forwarded;
  return `hf_session=${id}; HttpOnly; SameSite=Strict; Path=/; Max-Age=7200${isHttps ? '; Secure' : ''}`;
}
function cleanCookie(req) {
  return `hf_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${Boolean(req.socket.encrypted) || (process.env.TRUST_PROXY === '1' && req.headers['x-forwarded-proto'] === 'https') ? '; Secure' : ''}`;
}
function allowMutation(req) {
  if (req.headers['x-think-first'] !== '1') return false;
  const origin = req.headers.origin;
  if (!origin) return true; // Non-browser clients must still send custom header.
  try {const url = new URL(origin); return url.host === req.headers.host && ['http:', 'https:'].includes(url.protocol);} catch {return false;}
}
async function body(req) {
  const chunks = []; let total = 0;
  for await (const chunk of req) {
    total += chunk.length;
    if (total > maxBodyBytes) {const e = new Error('Corps de requête trop volumineux.'); e.httpCode = 413; throw e;}
    chunks.push(chunk);
  }
  try {return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');}
  catch {const e = new Error('JSON invalide.');e.httpCode=400;throw e;}
}
function textAnswer(value) {return typeof value === 'string' ? value.trim().slice(0, 2000) : '';}
function response(session) {
  const ex = getExercise(session.exerciseId);
  const common = {stage: session.stage, exercise: {id: ex.id, title: ex.title, category: ex.category}, hintsUsed: session.hintsUsed, attempted: session.attempted, skipped: session.skipped};
  if (session.stage === 'training') return {...common, training: publicTraining(ex), attempt: session.attempt};
  if (session.stage === 'explanation') return {...common, training: publicTraining(ex), attempt: session.attempt, explanation: ex.explanation};
  if (session.stage === 'transfer') return {...common, transfer: ex.transfer};
  if (session.stage === 'finished') return {...common, transfer: ex.transfer, transferAnswer: session.transferAnswer, reflection: {review:ex.review, example:ex.example}, summary: {assistance: session.hintsUsed > 0 ? 'indices' : session.openedDirectly ? 'explication directe' : 'aucune', hintsUsed:session.hintsUsed, attempted:session.attempted, skipped:session.skipped}};
  return common;
}
function pruneSessions() {
  const now=Date.now(); for (const [key, session] of sessions) if (session.expiry < now) sessions.delete(key);
}
const app = createServer(async(req,res) => {
  try {
    if (req.method === 'GET' && req.url in publicFiles) {
      const [name, type] = publicFiles[req.url];
      const bytes = await readFile(join(publicDir,name));
      res.writeHead(200, {...commonHeaders,'Content-Type':type, 'Cache-Control':'no-store'});res.end(bytes);return;
    }
    const url = new URL(req.url || '/', 'http://localhost');
    if (req.method === 'GET' && url.pathname === '/api/health') {json(res,200,{status:'ok',service:'think-first',research:'disabled',ai:'disabled'});return;}
    if (req.method === 'GET' && url.pathname === '/api/catalog') {json(res,200,{notice:'Contenus de démonstration non validés pour une étude scientifique.', exercises:publicCatalog()});return;}
    if (req.method === 'GET' && url.pathname === '/api/session') {
      const session=currentSession(req);
      json(res,200,session ? response(session) : {stage:'idle'});return;
    }
    if (url.pathname.startsWith('/api/') && req.method === 'POST') {
      if (!allowMutation(req)) {reject(res,403,'Requête refusée.');return;}
      const input = await body(req);
      if (url.pathname === '/api/session/start') {
        if (input.adult !== true) {reject(res,400,'La démonstration est réservée aux adultes de 18 ans et plus.');return;}
        const ex=getExercise(input.exerciseId);
        if (!ex) {reject(res,404,'Exercice introuvable.');return;}
        const old=cookieId(req);if(old) sessions.delete(old);
        const id=randomBytes(32).toString('base64url');
        const session={exerciseId:ex.id,stage:'training',attempt:'',attempted:false,skipped:false,hintsUsed:0,openedDirectly:false,expiry:Date.now()+ttl};
        sessions.set(id,session);
        if(sessions.size>1000) pruneSessions();
        // Aucune collecte durable et limite de sessions pour la démonstration.
        if (sessions.size>1000) {sessions.delete(id);reject(res,503,'Démonstration temporairement saturée.');return;}
        json(res,200,response(session),{'Set-Cookie':cookie(req,id)});return;
      }
      if(url.pathname==='/api/session/reset') {
        const id=cookieId(req);if(id)sessions.delete(id);
        json(res,200,{stage:'idle'},{'Set-Cookie':cleanCookie(req)});return;
      }
      const s=currentSession(req);
      if(!s){reject(res,401,'Session expirée. Recommence la démonstration.');return;}
      if(url.pathname==='/api/session/attempt') {
        if(s.stage!=='training'){reject(res,409,'Étape non autorisée.');return;}
        const answer=textAnswer(input.answer);
        if(!answer && input.skip!==true){reject(res,400,'Écris une tentative ou utilise « Passer ».');return;}
        s.attempt=answer;s.attempted=Boolean(answer);s.skipped=!answer;
        json(res,200,response(s));return;
      }
      if(url.pathname==='/api/session/hint') {
        if(s.stage!=='training'||(!s.attempted&&!s.skipped)){reject(res,409,'Essaie ou passe avant de demander un indice.');return;}
        const ex=getExercise(s.exerciseId);
        if(s.hintsUsed >= 3){reject(res,409,'Tous les indices ont été consultés.');return;}
        s.hintsUsed += 1;
        const hint=s.hintsUsed===1?ex.guide:ex.hints[s.hintsUsed-2];
        json(res,200,{hint,level:s.hintsUsed,hintsUsed:s.hintsUsed});return;
      }
      if(url.pathname==='/api/session/explanation') {
        if(s.stage!=='training'&&s.stage!=='explanation'){reject(res,409,'Étape non autorisée.');return;}
        if(!s.attempted&&!s.skipped)s.openedDirectly=true;
        s.stage='explanation';json(res,200,response(s));return;
      }
      if(url.pathname==='/api/session/transfer') {
        if(s.stage!=='explanation'){reject(res,409,'Consulte d’abord l’explication.');return;}
        s.stage='transfer';json(res,200,response(s));return;
      }
      if(url.pathname==='/api/session/answer') {
        if(s.stage!=='transfer'){reject(res,409,'Le transfert n’est pas ouvert.');return;}
        const answer=textAnswer(input.answer);
        if(!answer && input.skip!==true){reject(res,400,'Écris une réponse ou passe sans répondre.');return;}
        s.transferAnswer=answer;s.stage='finished';json(res,200,response(s));return;
      }
      reject(res,404,'Route inexistante.');return;
    }
    reject(res,404,'Ressource introuvable.');
  } catch (error) {
    if(!res.headersSent)reject(res,error.httpCode||500,error.httpCode?error.message:'Erreur interne.');
  }
});

if (process.env.NODE_ENV !== 'test' || process.env.THINK_FIRST_RUN_TEST_SERVER === '1') {
  app.listen(PORT, HOST, () => console.log(`THINK FIRST : http://${HOST}:${PORT}`));
}
export {app};
