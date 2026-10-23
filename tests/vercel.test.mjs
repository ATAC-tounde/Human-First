import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

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
 ],{cwd:fileURLToPath(new URL('..',import.meta.url)),env:{...process.env,VERCEL:'1'},timeout:5000,encoding:'utf8'});
 assert.equal(result.error,undefined,result.error?.message);
 assert.equal(result.status,0,result.stderr||result.stdout);
});

test('Vercel rewrite reaches the existing GET API routes without leaking the private route parameter',()=>{
 const script=`
  import handler from './api/index.mjs';
  const response=()=>({
   headersSent:false,statusCode:0,payload:'',
   writeHead(code,headers){this.statusCode=code;this.headers=headers;this.headersSent=true;},
   end(body){this.payload=body||'';}
  });
  const tests=[
   ['/api/index?__hf_route=health','/api/health',undefined],
   ['/api/index?lang=en&__hf_route=catalog','/api/catalog?lang=en','en'],
   ['/api/index?__hf_route=../private',null,undefined]
  ];
  for(const [path,expected,language] of tests){
   const req={url:path,method:'GET',headers:{host:'example.vercel.app'}};
   const res=response();
   await handler(req,res);
   if(expected===null) {
    if(res.statusCode!==404)process.exit(10);
   } else {
    if(req.url!==expected)process.exit(11);
    if(![200,503].includes(res.statusCode))process.exit(12);
    if(language&&JSON.parse(res.payload).locale!==language)process.exit(13);
   }
  }
 `;
 const result=spawnSync(process.execPath,['--input-type=module','-e',script],
  {cwd:fileURLToPath(new URL('..',import.meta.url)),env:{...process.env,VERCEL:'1'},timeout:5000,encoding:'utf8'});
 assert.equal(result.error,undefined,result.error?.message);
 assert.equal(result.status,0,result.stderr||result.stdout);
});
