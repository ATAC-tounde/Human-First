// Stateless, authenticated session for ephemeral demonstrations behind serverless proxies.
// Never persist user text inside this cookie or any server-side database.
import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

export const ttlMs = 2 * 60 * 60 * 1000;
const aad = Buffer.from('human-first/think-first/demo/v1');
const configured = process.env.HF_SESSION_SECRET;
// Local-only convenience: a restart invalidates the demo cookie.
// Remote deployments must share a stable 256-bit key across all instances.
const local = !process.env.VERCEL && process.env.NODE_ENV !== 'production';
let key = null;
if (configured) {
  if (!/^[a-f0-9]{64}$/i.test(configured)) throw new Error('HF_SESSION_SECRET must be 64 hexadecimal characters (32 random bytes).');
  key = Buffer.from(configured, 'hex');
} else if (local) {
  key = randomBytes(32);
  if (process.env.NODE_ENV !== 'test') console.warn('THINK FIRST: ephemeral local-only cookie key. Set HF_SESSION_SECRET for stable sessions.');
}

export function sessionReady() { return Boolean(key); }
export function sealSession(payload) {
  if (!key) throw new Error('session-secret-missing');
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  cipher.setAAD(aad);
  const encrypted = Buffer.concat([cipher.update(Buffer.from(JSON.stringify(payload), 'utf8')), cipher.final()]);
  return `v1.${Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString('base64url')}`;
}
export function readSession(token) {
  if (!key || typeof token !== 'string' || !/^v1\.[A-Za-z0-9_-]{36,1600}$/.test(token)) return null;
  try {
    const raw = Buffer.from(token.slice(3), 'base64url');
    if (raw.length < 29) return null;
    const iv = raw.subarray(0, 12);
    const tag = raw.subarray(12, 28);
    const encrypted = raw.subarray(28);
    const decipher = createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(aad);
    decipher.setAuthTag(tag);
    const decoded = JSON.parse(Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8'));
    if (decoded?.v !== 1 || typeof decoded.ex !== 'string' || !['fr','en'].includes(decoded.l) ||
        !['training','explanation','transfer','finished'].includes(decoded.stage) ||
        !Number.isInteger(decoded.h) || decoded.h < 0 || decoded.h > 3 ||
        typeof decoded.a !== 'boolean' || typeof decoded.s !== 'boolean' ||
        typeof decoded.d !== 'boolean' || typeof decoded.t !== 'boolean' ||
        !Number.isFinite(decoded.exp) || !Number.isFinite(decoded.iat) ||
        decoded.exp < Date.now() || decoded.iat > Date.now() + 60_000 ||
        decoded.exp - decoded.iat > ttlMs || !/^[0-9a-f]{24}$/.test(decoded.j)) return null;
    return {
      exerciseId: decoded.ex,
      locale: decoded.l,
      stage: decoded.stage,
      attempted: decoded.a,
      skipped: decoded.s,
      hintsUsed: decoded.h,
      openedDirectly: decoded.d,
      transferAnswered: decoded.t,
      expiry: decoded.exp,
      issuedAt: decoded.iat,
      nonce: decoded.j
    };
  } catch { return null; }
}
export function makeSession(exerciseId, locale) {
  const issuedAt = Date.now();
  return {exerciseId,locale,stage:'training',attempted:false,skipped:false,hintsUsed:0,
    openedDirectly:false,transferAnswered:false,issuedAt,expiry:issuedAt+ttlMs,nonce:randomBytes(12).toString('hex')};
}
export function tokenFor(session) {
  return sealSession({v:1,ex:session.exerciseId,l:session.locale,stage:session.stage,
    a:session.attempted,s:session.skipped,h:session.hintsUsed,d:session.openedDirectly,
    t:session.transferAnswered,iat:session.issuedAt,exp:session.expiry,j:session.nonce});
}