const assert=require('node:assert/strict');
const H=require('../dist/server-data/hdp-grading.cjs'),P=require('../dist/server-data/question-plan.cjs');
const A=require('../dist/server-data/accounts.cjs'),L=require('../dist/server-data/learning.cjs');
const handler=require('../dist/api/exam.js');
const original={fetch:global.fetch,user:A.requireUser,session:A.session,progress:A.progress,cached:L.cached,revise:L.revise,key:process.env.GEMINI_API_KEY,secret:process.env.SUPABASE_SECRET_KEY};
const settings={subject:'termicas',unit:1,scope:'completo',level:'hdp',speed:'rapida',loop:true};
const plan={...P.createPlan(settings),ids:['u1-q2','u1-q3'],index:0,userId:'u',sessionId:'s'};
const card=P.current(plan),names=['concepto','componentes','funcionamiento','conexiones','precision','mantenimiento','fallas'];
process.env.GEMINI_API_KEY='test-key';delete process.env.SUPABASE_SECRET_KEY;
async function call(body){const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(b){this.body=b;return this}};await handler({method:'POST',headers:{host:'localhost'},body},res);return res}
let complete=2,missingCoverage=false,invalidQuote=false;
global.fetch=async(url,options)=>{
 const request=JSON.parse(options.body);assert(request.generationConfig.responseSchema.required.includes('hdpCoverage'));assert(request.systemInstruction.parts[0].text.includes('CONTRATO DE COBERTURA HDP'));
 const hdpCoverage=H.requirements(card).map((r,i)=>({id:r.id,status:i<complete?'complete':'missing',evidence:i<complete?(invalidQuote?'Lo dijo el profesor':'Tiene dos colectores'):'',reason:i<complete?'Explicado.':'No lo desarrolla.'}));
 const response={speech:'Desarrollo incompleto.',transcript:'Tiene dos colectores',feedback:'La parte respondida es correcta.',score:10,finished:false,evaluated:true,strengths:[],improvements:[],omissions:[],sourceIds:[],betterAnswer:'',keyChecks:card.keyPoints.map((_,index)=>({index,covered:true})),criteria:names.map(name=>({name,value:100,applicable:false,reason:'De prueba'})),...(missingCoverage?{}:{hdpCoverage})};
 return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(response)}]}}]})};
};
(async()=>{
 const token=P.signPlan(plan,'test-key');
 const partial=await call({...settings,action:'answer',text:'Tiene dos colectores',planToken:token});
 assert.equal(partial.statusCode,200);assert.equal(partial.body.score,2.86);assert.equal(partial.body.omissions.length,5,'Rápida conserva todas las omisiones HDP');assert.equal(partial.body.hdpAssessment.total,7);
 missingCoverage=true;assert.equal((await call({...settings,action:'answer',text:'Tiene dos colectores',planToken:token})).body.code,'invalid_hdp_coverage');missingCoverage=false;
 invalidQuote=true;assert.equal((await call({...settings,action:'answer',text:'Tiene dos colectores',planToken:token})).body.code,'invalid_hdp_coverage');invalidQuote=false;
 // Reviews must use the same cap and must retain the full original answer.
 process.env.SUPABASE_SECRET_KEY='test-secret';A.requireUser=async()=>({user:{id:'u'}});A.session=async()=>({status:'active'});A.progress=async()=>({});
 let saved={transcript:'Tiene dos colectores',score:9,feedback:'Nota anterior'};L.cached=async()=>saved;L.revise=async(p,u,prev,result)=>{saved=structuredClone(result)};
 complete=1;const revision=await call({...settings,action:'revise',text:'No agrego nada.',planToken:token,attemptToken:token,requestId:'coverage-review-0001'});
 assert.equal(revision.statusCode,200);assert.equal(revision.body.score,1.43);assert(saved.fullTranscript.includes('Tiene dos colectores'));assert(saved.fullTranscript.includes('No agrego nada.'));
 complete=2;const second=await call({...settings,action:'revise',text:'Añado otra parte.',planToken:token,attemptToken:token,requestId:'coverage-review-0002'});
 assert.equal(second.statusCode,200);assert.equal(second.body.score,2.86);assert(saved.fullTranscript.includes('No agrego nada.'));assert(saved.fullTranscript.includes('Tiene dos colectores'));
 console.log('OK: cobertura obligatoria en la API, nota parcial con precisión alta, errores de evaluación sin nota inventada y revisiones con el mismo límite. Gemini simulado.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=original.fetch;A.requireUser=original.user;A.session=original.session;A.progress=original.progress;L.cached=original.cached;L.revise=original.revise;for(const [name,value]of [['GEMINI_API_KEY',original.key],['SUPABASE_SECRET_KEY',original.secret]])if(value===undefined)delete process.env[name];else process.env[name]=value});
