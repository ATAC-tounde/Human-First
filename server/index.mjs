import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicCatalog, getExercise, publicTraining, localizeExercise } from './catalog.mjs';
import { sessionReady, readSession, makeSession, tokenFor } from './session-crypto.mjs';
import {publicPaths,enhanceCatalog,metadataFor} from './tracks.mjs';
import {reviewTask} from './reviews.mjs';
import {coachSettings,askCoach} from './coach.mjs';
import {offlineCard} from './offline.mjs';
import {handleLearn} from './learn-routes.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '../public');
const PORT = Number(process.env.PORT || 4173);
const HOST = process.env.HOST || '127.0.0.1';
const maxBodyBytes = 12_000;
const publicFiles = {
  '/': ['index.html', 'text/html; charset=utf-8'],
  '/index.html': ['index.html', 'text/html; charset=utf-8'],
  '/app.js': ['app.js', 'text/javascript; charset=utf-8'],
  '/i18n.js': ['i18n.js', 'text/javascript; charset=utf-8'],
  '/language.mjs': ['language.mjs', 'text/javascript; charset=utf-8'],
  '/focus': ['focus.html', 'text/html; charset=utf-8'],
  '/focus.html': ['focus.html', 'text/html; charset=utf-8'],
  '/focus.js': ['focus.js', 'text/javascript; charset=utf-8'],
  '/focus.css': ['focus.css', 'text/css; charset=utf-8'],
  '/focus-library.mjs': ['focus-library.mjs', 'text/javascript; charset=utf-8'],
  '/learn': ['learn.html', 'text/html; charset=utf-8'],
  '/learn.html': ['learn.html', 'text/html; charset=utf-8'],
  '/learn.js': ['learn.js', 'text/javascript; charset=utf-8'],
  '/learn.css': ['learn.css', 'text/css; charset=utf-8'],
  '/decide': ['decide.html', 'text/html; charset=utf-8'],
  '/decide.html': ['decide.html', 'text/html; charset=utf-8'],
  '/decide.js': ['decide.js', 'text/javascript; charset=utf-8'],
  '/decide-data.mjs': ['decide-data.mjs', 'text/javascript; charset=utf-8'],
  '/decide.css': ['decide.css', 'text/css; charset=utf-8'],
  '/journey': ['journey.html', 'text/html; charset=utf-8'],
  '/journey.html': ['journey.html', 'text/html; charset=utf-8'],
  '/journey.css': ['journey.css', 'text/css; charset=utf-8'],
  '/journey/engine.mjs': ['journey/engine.mjs', 'text/javascript; charset=utf-8'],
  '/journey/packs.mjs': ['journey/packs.mjs', 'text/javascript; charset=utf-8'],
  '/journey/app.mjs': ['journey/app.mjs', 'text/javascript; charset=utf-8'],
  '/journey/assessment.mjs': ['journey/assessment.mjs', 'text/javascript; charset=utf-8'],
  '/journey/continuity.mjs': ['journey/continuity.mjs', 'text/javascript; charset=utf-8'],
  '/journey/restore.mjs': ['journey/restore.mjs', 'text/javascript; charset=utf-8'],
  '/journey/vault.mjs': ['journey/vault.mjs', 'text/javascript; charset=utf-8'],
  '/journey/device-vault.mjs': ['journey/device-vault.mjs', 'text/javascript; charset=utf-8'],
  '/studio': ['studio.html', 'text/html; charset=utf-8'],
  '/studio.html': ['studio.html', 'text/html; charset=utf-8'],
  '/studio/studio.css': ['studio/studio.css', 'text/css; charset=utf-8'],
  '/studio/app.mjs': ['studio/app.mjs', 'text/javascript; charset=utf-8'],
  '/studio/model.mjs': ['studio/model.mjs', 'text/javascript; charset=utf-8'],
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
  res.writeHead(code, {...commonHeaders,'Content-Type': 'application/json; charset=utf-8','Cache-Control':'no-store',...extra});
  res.end(JSON.stringify(data));
}
function reject(res, code, message) { json(res,code,{error:message}); }
function cookieValue(req) {
  const item=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith('hf_session='));
  return item ? item.slice('hf_session='.length) : null;
}
function currentSession(req) {
  const session=readSession(cookieValue(req));
  return session && getExercise(session.exerciseId) ? session : null;
}
function cookieSecure(req) {
  return Boolean(req.socket.encrypted) || Boolean(process.env.VERCEL) ||
    (process.env.TRUST_PROXY === '1' && req.headers['x-forwarded-proto'] === 'https');
}
function sessionCookie(req,session) {
  const token=tokenFor(session);
  return `hf_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=7200${cookieSecure(req)?'; Secure':''}`;
}
function clearCookie(req) {
  return `hf_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${cookieSecure(req)?'; Secure':''}`;
}
function allowMutation(req) {
  if (req.headers['x-think-first'] !== '1' || req.headers['content-type']?.split(';')[0].trim() !== 'application/json') return false;
  const origin=req.headers.origin;
  if(!origin) return true; // Non-browser clients must provide the custom header.
  try {const u=new URL(origin);return u.host===req.headers.host && ['http:','https:'].includes(u.protocol);}catch{return false;}
}
async function body(req) {
  const chunks=[];let total=0;
  for await (const chunk of req) {
    total+=chunk.length;
    if(total>maxBodyBytes){const err=new Error('Corps de requête trop volumineux.');err.httpCode=413;throw err;}
    chunks.push(chunk);
  }
  try {return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}
  catch{const e=new Error('JSON invalide.');e.httpCode=400;throw e;}
}
function textAnswer(value) {return typeof value==='string'?value.trim().slice(0,2000):'';}
function response(session,{attempt='',transferAnswer=''}={}) {
  const ex=localizeExercise(getExercise(session.exerciseId),session.locale);
  const revealedHints=[ex.guide,...ex.hints].slice(0,session.hintsUsed);
  const common={stage:session.stage,sessionId:session.nonce,exercise:{id:ex.id,title:ex.title,category:ex.category,progression:metadataFor(ex.id)},locale:session.locale,
    hintsUsed:session.hintsUsed,attempted:session.attempted,skipped:session.skipped,coachTurns:session.coachTurns};
  if(session.stage==='training')return {...common,training:publicTraining(ex),attempt,revealedHints};
  if(session.stage==='explanation')return {...common,training:publicTraining(ex),attempt,explanation:ex.explanation};
  if(session.stage==='transfer')return {...common,transfer:ex.transfer};
  if(session.stage==='recall')return {...common,recall:reviewTask(ex.id,session.locale)?.prompt};
  if(session.stage==='recall-finished')return {...common,recall:reviewTask(ex.id,session.locale)?.prompt,
    recalled:session.transferAnswered,reference:reviewTask(ex.id,session.locale)?.example,offlineCard:offlineCard(ex.id,session.locale)};
  if(session.stage==='finished')return {...common,transfer:ex.transfer,transferAnswer,transferAnswered:session.transferAnswered,
    reflection:{review:ex.review,example:ex.example,offlineChallenge:ex.offlineChallenge},offlineCard:offlineCard(ex.id,session.locale),
    summary:{assistance:session.hintsUsed>0?'indices':session.openedDirectly?'explication directe':'aucune',
      hintsUsed:session.hintsUsed,attempted:session.attempted,skipped:session.skipped,transferAnswered:session.transferAnswered}};
  return common;
}
const app=createServer(async(req,res)=>{
  try {
    const url=new URL(req.url||'/','http://localhost');
    if(await handleLearn(req,res,url,{json,reject,body,allowMutation}))return;
    if(req.method==='GET'&&Object.hasOwn(publicFiles,url.pathname)) {
      const [name,type]=publicFiles[url.pathname];const bytes=await readFile(join(publicDir,name));
      res.writeHead(200,{...commonHeaders,'Content-Type':type,'Cache-Control':'no-store'});res.end(bytes);return;
    }
    if(req.method==='GET'&&url.pathname==='/api/health') {
      json(res,sessionReady()?200:503,{status:sessionReady()?'ok':'configuration_required',service:'think-first',
        research:'disabled',ai:coachSettings().enabled?'opt_in_available':'disabled',sessionStorage:'encrypted_cookie',sessionsReady:sessionReady()});return;
    }
    if(req.method==='GET'&&url.pathname==='/api/catalog') {
      const locale=url.searchParams.get('lang')==='en'?'en':'fr';
      json(res,200,{locale,notice:locale==='en'?'Demonstration exercises, not validated for scientific studies.':'Contenus de démonstration non validés pour une étude scientifique.',exercises:enhanceCatalog(publicCatalog(locale))});return;
    }
    if(req.method==='GET'&&url.pathname==='/api/paths') {
      const locale=url.searchParams.get('lang')==='en'?'en':'fr';
      json(res,200,{locale,paths:publicPaths(locale,publicCatalog(locale).map(x=>x.id))});return;
    }
    if(req.method==='GET'&&url.pathname==='/api/coach/config') {
      json(res,200,coachSettings());return;
    }
    if(req.method==='GET'&&url.pathname==='/api/session') {
      const session=currentSession(req);
      json(res,200,session?response(session):{stage:'idle'});return;
    }
    if(url.pathname.startsWith('/api/')&&req.method==='POST') {
      if(!allowMutation(req)){reject(res,403,'Requête refusée.');return;}
      if(!sessionReady()){reject(res,503,'Sessions indisponibles : configurer HF_SESSION_SECRET sur cet environnement.');return;}
      const input=await body(req);
      if(url.pathname==='/api/session/start') {
        if(input.adult!==true){reject(res,400,'La démonstration est réservée aux adultes de 18 ans et plus.');return;}
        const ex=getExercise(input.exerciseId);if(!ex){reject(res,404,'Exercice introuvable.');return;}
        const session=makeSession(ex.id,input.locale==='en'?'en':'fr');
        json(res,200,response(session),{'Set-Cookie':sessionCookie(req,session)});return;
      }
      if(url.pathname==='/api/session/recall/start') {
        if(input.adult!==true){reject(res,400,'Démonstration réservée aux adultes.');return;}
        const ex=getExercise(input.exerciseId);
        if(!ex||!reviewTask(ex.id,input.locale)){reject(res,404,'Révision introuvable.');return;}
        const session=makeSession(ex.id,input.locale==='en'?'en':'fr');
        session.stage='recall';
        json(res,200,response(session),{'Set-Cookie':sessionCookie(req,session)});return;
      }
      if(url.pathname==='/api/session/reset') {
        json(res,200,{stage:'idle'},{'Set-Cookie':clearCookie(req)});return;
      }
      const s=currentSession(req);
      if(!s){reject(res,401,'Session expirée ou invalide. Recommence la démonstration.');return;}
      if(url.pathname==='/api/session/recall/answer') {
        if(s.stage!=='recall'){reject(res,409,'La révision autonome n’est pas ouverte.');return;}
        if(input.hasAnswer!==true && input.skip!==true){reject(res,400,'Rédige une réponse ou passe.');return;}
        // Deliberately do not accept nor transmit free-text during retrieval.
        if(Object.hasOwn(input,'answer')){reject(res,400,'Ne transmets pas de texte : seule la présence d’une réponse est requise.');return;}
        s.transferAnswered=input.hasAnswer===true;s.stage='recall-finished';
        json(res,200,response(s),{'Set-Cookie':sessionCookie(req,s)});return;
      }
      if(url.pathname==='/api/session/coach') {
        if(s.stage!=='training'||!s.attempted||s.skipped){reject(res,409,'Propose d’abord une réflexion personnelle.');return;}
        if(!coachSettings().enabled){reject(res,503,'Assistance IA désactivée dans cet environnement. Les indices sont disponibles.');return;}
        if(input.consent!==true){reject(res,400,'Accord explicite requis avant transfert au prestataire IA.');return;}
        if(s.coachTurns>=2){reject(res,429,'Limite de deux questions par séance atteinte.');return;}
        const answer=textAnswer(input.answer);
        if(answer.length<15){reject(res,400,'Saisis au moins quinze caractères de réflexion.');return;}
        const exercise=localizeExercise(getExercise(s.exerciseId),s.locale);
        const result=await askCoach({exercise,attempt:answer,locale:s.locale});
        s.coachTurns+=1;
        json(res,200,{question:result.question,generated:result.available,coachTurns:s.coachTurns,limit:2},
          {'Set-Cookie':sessionCookie(req,s)});return;
      }
      if(url.pathname==='/api/session/attempt') {
        if(s.stage!=='training'){reject(res,409,'Étape non autorisée.');return;}
        if(s.attempted||s.skipped){reject(res,409,'Une tentative a déjà été soumise.');return;}
        const attempt=textAnswer(input.answer);
        if(!attempt&&input.skip!==true){reject(res,400,'Écris une tentative ou utilise « Passer ».');return;}
        s.attempted=Boolean(attempt);s.skipped=!attempt;
        json(res,200,response(s,{attempt}),{'Set-Cookie':sessionCookie(req,s)});return;
      }
      if(url.pathname==='/api/session/hint') {
        if(s.stage!=='training'||(!s.attempted&&!s.skipped)){reject(res,409,'Essaie ou passe avant de demander un indice.');return;}
        if(s.hintsUsed>=3){reject(res,409,'Tous les indices ont été consultés.');return;}
        s.hintsUsed+=1;
        json(res,200,response(s),{'Set-Cookie':sessionCookie(req,s)});return;
      }
      if(url.pathname==='/api/session/explanation') {
        if(s.stage!=='training'&&s.stage!=='explanation'){reject(res,409,'Étape non autorisée.');return;}
        if(!s.attempted&&!s.skipped)s.openedDirectly=true;
        s.stage='explanation';
        json(res,200,response(s),{'Set-Cookie':sessionCookie(req,s)});return;
      }
      if(url.pathname==='/api/session/transfer') {
        if(s.stage!=='explanation'){reject(res,409,'Consulte d’abord l’explication.');return;}
        s.stage='transfer';json(res,200,response(s),{'Set-Cookie':sessionCookie(req,s)});return;
      }
      if(url.pathname==='/api/session/answer') {
        if(s.stage!=='transfer'){reject(res,409,'Le transfert n’est pas ouvert.');return;}
        const transferAnswer=textAnswer(input.answer);
        if(!transferAnswer&&input.skip!==true){reject(res,400,'Écris une réponse ou passe sans répondre.');return;}
        s.transferAnswered=Boolean(transferAnswer);
        s.stage='finished';json(res,200,response(s,{transferAnswer}),{'Set-Cookie':sessionCookie(req,s)});return;
      }
      reject(res,404,'Route inexistante.');return;
    }
    reject(res,404,'Ressource introuvable.');
  }catch(error) {
    if(!res.headersSent)reject(res,error.httpCode||500,error.httpCode?error.message:'Erreur interne.');
  }
});
if(process.env.NODE_ENV!=='test'||process.env.THINK_FIRST_RUN_TEST_SERVER==='1') {
  app.listen(PORT,HOST,()=>console.log(`THINK FIRST : http://${HOST}:${PORT}`));
}
export {app};