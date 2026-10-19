// V0.4-alpha - optional, explicitly consented Socratic coaching. No model is called by default.
// Never transmit the answer key, retrieval tasks or the independent-transfer item to a provider.
const endpoint='https://api.groq.com/openai/v1/chat/completions';
const model='openai/gpt-oss-20b';
const maxTurns=2;
export function coachSettings(){return {enabled:process.env.HF_AI_ENABLED==='1' && Boolean(process.env.GROQ_API_KEY),provider:'Groq',model,limit:maxTurns,personalDataWarning:true};}
export function heuristicQuestion(locale,exercise){
 return locale==='en' ? `Which assumption in your reasoning would be most useful to test for “${exercise.title}”?` : `Quelle hypothèse de ton raisonnement faudrait-il vérifier en premier pour « ${exercise.title} » ?`;
}
export function parseQuestion(content,locale){
  let output;
  try {output=JSON.parse(content).question;}catch{return null;}
  if(typeof output!=='string')return null;
  output=output.trim();
  // A single brief question, no link, no markdown, no numerical calculation/answer dump.
  if(output.length<18||output.length>240||!output.endsWith('?')||output.split('?').length!==2||/[\d%\n\r<>`]|https?:|www\./i.test(output))return null;
  if(/\b(answer|solution|correct answer|réponse correcte|la solution)\s*[:=]/i.test(output))return null;
  return output;
}
export async function askCoach({exercise,attempt,locale,fetcher=fetch}){
  if(!coachSettings().enabled)return {available:false,question:heuristicQuestion(locale,exercise)};
  const prompt=locale==='en'
    ? 'You are a Socratic tutor. Ask exactly ONE short open question that encourages independent thinking. Do not solve the task or judge the student. Do not include facts, numbers or answers beyond what the student already wrote. Do not mention policies. Respond with JSON {"question":"... ?"} only.'
    : 'Tu es un tuteur socratique. Pose exactement UNE question ouverte et courte qui aide à réfléchir sans donner la solution ou évaluer la personne. Ne fournis aucun fait, chiffre ou réponse non présent dans le texte soumis. Réponds exclusivement en JSON {"question":"... ?"}.';
  const abort=new AbortController();
  const timer=setTimeout(()=>abort.abort(),8500);
  try{
    const response=await fetcher(endpoint,{method:'POST',signal:abort.signal,
      headers:{Authorization:`Bearer ${process.env.GROQ_API_KEY}`,'Content-Type':'application/json'},
      body:JSON.stringify({model,messages:[{role:'system',content:prompt},{role:'user',content:JSON.stringify({task:exercise.prompt,attempt:attempt.slice(0,800)})}],temperature:0.2,max_completion_tokens:120,response_format:{type:'json_object'}})});
    if(!response.ok)return {available:false,question:heuristicQuestion(locale,exercise)};
    const payload=await response.json();
    const question=parseQuestion(payload?.choices?.[0]?.message?.content,locale);
    return {available:Boolean(question),question:question || heuristicQuestion(locale,exercise)};
  }catch{return {available:false,question:heuristicQuestion(locale,exercise)};}
  finally{clearTimeout(timer);}
}