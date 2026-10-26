const assert=require('node:assert/strict');
const {jokes,addExamJoke}=require('../dist/server-data/exam-humor.cjs');
const base={evaluated:true,score:5,feedback:'Corrección técnica.',feedbackSpeech:'Revisá el concepto.',question:'Pregunta siguiente',speech:'Revisá el concepto.\n\nPregunta siguiente'};
const history=[],picked=[];
for(let index=0;index<jokes.length;index++){
 const answer=addExamJoke({...base},{plan:{sessionId:'a',index,cycle:1,ids:Array(12).fill('q')},history});
 picked.push(answer.joke);assert(jokes.includes(answer.joke));
 assert(answer.feedback.startsWith(base.feedback));assert(answer.speech.indexOf(answer.joke)<answer.speech.indexOf(answer.question));
 history.push({role:'model',text:answer.speech});
 const once=answer.speech;addExamJoke(answer);assert.equal(answer.speech,once,'Una sola broma por devolución');
}
assert.equal(new Set(picked).size,jokes.length,'Rotación sin repetir en turnos consecutivos');
for(const settings of [{evaluated:false,score:0},{evaluated:true,score:7},{evaluated:true,score:10}]){
 const answer=addExamJoke({...base,...settings});assert(!answer.joke);assert.equal(answer.feedback,base.feedback);
}
const plan={sessionId:'a',index:0,cycle:1,ids:['q']};
assert.equal(addExamJoke({...base},{plan}).joke,addExamJoke({...base},{plan}).joke,'La misma respuesta conserva su broma ante reintentos');
const previous=addExamJoke({...base},{plan});const next=addExamJoke({...base},{plan,history:[{role:'model',text:previous.speech}]});assert.notEqual(previous.joke,next.joke);
console.log('OK: bromas argentinas variadas, una por devolución, sin repetición reciente ni bromas con nota 7 o más.');
// Verify the policy is wired into the actual API after rubric scoring.
const handler=require('../dist/api/exam.js');
const original={fetch:global.fetch,key:process.env.GEMINI_API_KEY,secret:process.env.SUPABASE_SECRET_KEY};
process.env.GEMINI_API_KEY='test-key';delete process.env.SUPABASE_SECRET_KEY;
async function call(body){const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(b){this.body=b;return this}};await handler({method:'POST',headers:{host:'localhost'},body},res);assert.equal(res.statusCode,200);return res.body}
(async()=>{
 const settings={subject:'termicas',unit:0,scope:'completo',level:'hdp',speed:'normal'};
 const start=await call({...settings,action:'start'});
 global.fetch=async(url,options)=>{
  const request=JSON.parse(options.body);assert(request.systemInstruction.parts[0].text.includes('No agregues bromas'));
  return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({speech:'Revisá la definición.',feedback:'Falta precisión técnica.',score:6,evaluated:true,finished:false,transcript:'Respuesta de prueba',sourceIds:[],strengths:[],improvements:[],omissions:[],keyChecks:[],criteria:[{name:'precision',value:60,applicable:true,reason:'Falta precisión'}]})}]}}]})};
 };
 const answer=await call({...settings,action:'answer',text:'Respuesta de prueba',planToken:start.planToken});
 assert.equal(answer.score,6);assert(jokes.includes(answer.joke));assert.equal(answer.feedback.split(answer.joke).length,2);assert.equal(answer.speech.split(answer.joke).length,2);assert(answer.speech.indexOf(answer.joke)<answer.speech.indexOf(answer.question));
 console.log('OK: la API aplica una sola broma del repertorio después de calcular la nota y antes de leer la próxima pregunta.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=original.fetch;for(const [key,value]of [['GEMINI_API_KEY',original.key],['SUPABASE_SECRET_KEY',original.secret]])if(value===undefined)delete process.env[key];else process.env[key]=value});
