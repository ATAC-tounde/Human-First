import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';

test('Vercel uses a Node function rather than the unavailable container registry',async()=>{
 const file=JSON.parse(await readFile(new URL('../vercel.json',import.meta.url),'utf8'));
 assert.equal(file.framework,null);
 assert.equal(file.outputDirectory,'public');
 assert.deepEqual(file.functions['api/index.mjs'].includeFiles,'server/**');
 assert.deepEqual(file.rewrites[0],{source:'/api/:path*',destination:'/api/index?__hf_route=:path*'});
 for(const page of ['focus','learn','decide','journey','studio'])
  assert.ok(file.rewrites.some(x=>x.source==='/'+page&&x.destination==='/'+page+'.html'));
});

test('Serverless entry point can be imported without opening a listener',()=>{
 const result=spawnSync(process.execPath,['--input-type=module','-e',
  "import handler from './api/index.mjs'; if(typeof handler!=='function')process.exit(1);"
 ],{cwd:new URL('..',import.meta.url).pathname,env:{...process.env,VERCEL:'1'},timeout:5000,encoding:'utf8'});
 assert.equal(result.error,undefined,result.error?.message);
 assert.equal(result.status,0,result.stderr||result.stdout);
});
