const assert=require('node:assert/strict');
const A=require('../dist/server-data/accounts.cjs'),L=require('../dist/server-data/learning.cjs'),P=require('../dist/server-data/question-plan.cjs'),handler=require('../dist/api/exam.js');
process.env.GEMINI_API_KEY='test-key';process.env.SUPABASE_SECRET_KEY='test-secret';
const settings={subject:'termicas',unit:0,scope:'completo',level:'hdp',speed:'normal'};
const plan={...P.createPlan(settings),userId:'u',sessionId:'s'};plan.index=plan.limit-1;
const token=P.signPlan(plan,'test-key'),summary={speech:'Examen terminado.',feedback:'Resumen guardado.',score:5.6,finished:true,planToken:token};
let saved={evaluated:true,score:6};
A.requireUser=async()=>({user:{id:'u'}});A.session=async()=>({status:'finished',summary});A.progress=async()=>({attempts:1});L.cached=async()=>saved;
global.fetch=async()=>{throw Error('Un reintento de una respuesta guardada no consulta Gemini')};L.record=async()=>{throw Error('No duplicar intentos')};L.finish=async()=>{throw Error('No volver a finalizar')};
async function call(){const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(b){this.body=b;return this}};await handler({method:'POST',headers:{host:'localhost'},body:{...settings,action:'answer',planToken:token,text:'Última respuesta'}},res);return res}
(async()=>{
 for(let retry=0;retry<3;retry++){const result=await call();assert.equal(result.statusCode,200);assert.equal(result.body.score,summary.score);assert.equal(result.body.finished,true)}
 saved={evaluated:false,skipped:true};assert.equal((await call()).statusCode,409);
 saved=null;assert.equal((await call()).statusCode,409);
 console.log('OK: reintentar la última respuesta recupera el resumen ya guardado, sin recalificar ni duplicar notas; una pregunta omitida no se convierte en respondida.');
})().catch(e=>{console.error(e);process.exitCode=1});
