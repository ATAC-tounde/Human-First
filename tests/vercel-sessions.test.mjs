import { before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { Readable } from 'node:stream';

let handler;
before(async () => {
  process.env.VERCEL = '1';
  process.env.HF_SESSION_SECRET = randomBytes(32).toString('hex');
  ({ default: handler } = await import('../api/index.mjs'));
});

async function invoke(route, { body, cookie } = {}) {
  const req = Readable.from(body === undefined ? [] : [Buffer.from(JSON.stringify(body))]);
  req.url = '/api/index?__hf_route=' + route;
  req.method = body === undefined ? 'GET' : 'POST';
  req.headers = { host: 'example.vercel.app', origin: 'https://example.vercel.app' };
  if (body !== undefined) {
    req.headers['content-type'] = 'application/json';
    req.headers['x-think-first'] = '1';
  }
  if (cookie) req.headers.cookie = cookie;
  const res = {
    writeHead(status, headers) { this.status = status; this.headers = headers; },
    end(payload) { this.data = JSON.parse(payload); }
  };
  await handler(req, res);
  return res;
}

const cases = [
  { pillar: 'THINK', base: 'session', read: 'session', name: 'hf_session',
    body: { exerciseId: 'causalite', adult: true }, stage: 'training' },
  { pillar: 'LEARN', base: 'learn', read: 'learn/session', name: 'hf_learn',
    body: { lessonId: 'evidence', adult: true }, stage: 'learn-study' }
];

for (const item of cases) {
  test(item.pillar + ' issues, reads and clears its secure cookie on Vercel without a socket', async () => {
    const started = await invoke(item.base + '/start', { body: item.body });
    assert.equal(started.status, 200);
    assert.equal(started.data.stage, item.stage);
    const [cookie, ...attributes] = started.headers['Set-Cookie'].split('; ');
    assert.ok(cookie.startsWith(item.name + '=v1.'));
    for (const flag of ['Secure', 'HttpOnly', 'SameSite=Strict', 'Path=/', 'Max-Age=7200']) {
      assert.ok(attributes.includes(flag), flag);
    }
    const resumed = await invoke(item.read, { cookie });
    assert.equal(resumed.status, 200);
    assert.equal(resumed.data.stage, item.stage);
    const ended = await invoke(item.base + '/reset', { body: {}, cookie });
    assert.equal(ended.status, 200);
    assert.equal(ended.data.stage, 'idle');
    const [cleared, ...flags] = ended.headers['Set-Cookie'].split('; ');
    assert.equal(cleared, item.name + '=');
    assert.ok(flags.includes('Max-Age=0') && flags.includes('Secure'));
  });
}
