import {handleRequest} from '../server/index.mjs';

/**
 * Vercel Node.js Function adapter: use the same routes and privacy/security
 * checks as npm start, without starting a long-running HTTP listener.
 * The rewrite passes the original /api/* suffix in a private query parameter.
 */
export default function handler(req,res) {
 const url=new URL(req.url||'/','http://localhost');
 const route=url.searchParams.get('__hf_route');
 if(route!==null) {
  if(!/^[a-z0-9/-]{1,120}$/.test(route)||route.includes('//')||route.includes('..')) {
   res.writeHead(404,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
   res.end('{"error":"Ressource introuvable."}');
   return;
  }
  url.searchParams.delete('__hf_route');
  req.url='/api/'+route+url.search;
 }
 return handleRequest(req,res);
}
