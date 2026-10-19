// Dedicated, stateless, adult-only LEARN demo workflow.
// A separate cookie prevents collisions with THINK and its recall workflow.
// No learner-written answer is accepted, logged, persisted or sent to third parties.
import {getLesson,syllabus,lessonForStage} from './learn-catalog.mjs';
import {sessionReady,readSession,makeSession,tokenFor} from './session-crypto.mjs';

const cookieName='hf_learn';
const stages=new Set(['learn-study','learn-recall','learn-feedback','learn-apply','learn-finished']);
function cookieValue(req){
  const raw=(req.headers.cookie||'').split(';').map(x=>x.trim()).find(x=>x.startsWith(cookieName+'='));
  return raw ? raw.substring(cookieName.length+1) : '';
}
function httpsCookie(req){
  return Boolean(req.socket.encrypted)||Boolean(process.env.VERCEL)||
      (process.env.TRUST_PROXY==='1'&&req.headers['x-forwarded-proto']==='https');
}
function cookie(req,session){
  return `${cookieName}=${tokenFor(session)}; HttpOnly; SameSite=Strict; Path=/; Max-Age=7200${httpsCookie(req)?'; Secure':''}`;
}
function clearCookie(req){
  return `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${httpsCookie(req)?'; Secure':''}`;
}
function current(req){
  const session=readSession(cookieValue(req));
  return session && stages.has(session.stage) && getLesson(session.exerciseId,session.locale) ? session : null;
}
function state(session){
  const lesson=getLesson(session.exerciseId,session.locale);
  return {...lessonForStage(lesson,session.stage),sessionId:session.nonce,
    recalled:session.stage==='learn-feedback' ? session.transferAnswered : undefined,
    completed:session.stage==='learn-finished' ? session.transferAnswered : undefined};
}
function response(res,json,req,s){return json(res,200,state(s),{'Set-Cookie':cookie(req,s)});}
function noTextInput(input){return !Object.hasOwn(input,'answer') && !Object.hasOwn(input,'text') &&
  !Object.hasOwn(input,'draft') && !Object.hasOwn(input,'response') &&
  Object.keys(input).every(x=>['hasAnswer','skip'].includes(x));}
function answered(input){return input.hasAnswer===true || input.skip===true;}
export async function handleLearn(req,res,url,{json,reject,body,allowMutation}){
  if(!url.pathname.startsWith('/api/learn/'))return false;
  if(req.method==='GET'&&url.pathname==='/api/learn/catalog'){
    const locale=url.searchParams.get('lang')==='en'?'en':'fr';
    json(res,200,{locale,notice:locale==='en'?'Demonstration lessons: effectiveness has not been established.':'Leçons de démonstration : efficacité non établie.',lessons:syllabus(locale)});return true;
  }
  if(req.method==='GET'&&url.pathname==='/api/learn/session'){
    const s=current(req);json(res,200,s?state(s):{stage:'idle'});return true;
  }
  if(req.method!=='POST'){reject(res,405,'Method not allowed.');return true;}
  if(!allowMutation(req)){reject(res,403,'Requête refusée.');return true;}
  if(!sessionReady()){reject(res,503,'Les sessions LEARN ne sont pas configurées.');return true;}
  const input=await body(req);
  if(!input||typeof input!=='object'||Array.isArray(input)){reject(res,400,'Corps invalide.');return true;}
  if(url.pathname==='/api/learn/start'){
    if(input.adult!==true){reject(res,400,'Démonstration réservée aux adultes de 18 ans et plus.');return true;}
    const locale=input.locale==='en'?'en':'fr';const lesson=getLesson(input.lessonId,locale);
    if(!lesson){reject(res,404,'Leçon inconnue.');return true;}
    if(input.mode!==undefined&&!['study','review'].includes(input.mode)){reject(res,400,'Mode inconnu.');return true;}
    const s=makeSession(lesson.id,locale);
    s.stage=input.mode==='review'?'learn-recall':'learn-study';
    response(res,json,req,s);return true;
  }
  if(url.pathname==='/api/learn/reset'){
    json(res,200,{stage:'idle'},{'Set-Cookie':clearCookie(req)});return true;
  }
  const s=current(req);
  if(!s){reject(res,401,'Séance absente ou expirée.');return true;}
  if(url.pathname==='/api/learn/study-done'){
    if(s.stage!=='learn-study'){reject(res,409,'Ordre des étapes invalide.');return true;}
    if(Object.keys(input).length){reject(res,400,'Paramètres non attendus.');return true;}
    s.stage='learn-recall';response(res,json,req,s);return true;
  }
  if(url.pathname==='/api/learn/recall-done'){
    if(s.stage!=='learn-recall'){reject(res,409,'Ordre des étapes invalide.');return true;}
    if(!noTextInput(input)||!answered(input)){reject(res,400,'Ne transmets pas ta réponse au serveur.');return true;}
    s.transferAnswered=input.hasAnswer===true;
    s.stage='learn-feedback';response(res,json,req,s);return true;
  }
  if(url.pathname==='/api/learn/apply'){
    if(s.stage!=='learn-feedback'){reject(res,409,'Ordre des étapes invalide.');return true;}
    if(Object.keys(input).length){reject(res,400,'Paramètres non attendus.');return true;}
    s.stage='learn-apply';response(res,json,req,s);return true;
  }
  if(url.pathname==='/api/learn/finish'){
    if(s.stage!=='learn-apply'){reject(res,409,'Ordre des étapes invalide.');return true;}
    if(!noTextInput(input)||!answered(input)){reject(res,400,'Ne transmets pas ta réponse au serveur.');return true;}
    s.transferAnswered=input.hasAnswer===true;
    s.stage='learn-finished';response(res,json,req,s);return true;
  }
  reject(res,404,'Route LEARN inconnue.');return true;
}