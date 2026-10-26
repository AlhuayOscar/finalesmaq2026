const assert=require('node:assert/strict');
const profiles=require('../dist/server-data/hdp-profiles.cjs'),H=require('../dist/server-data/hdp-grading.cjs'),P=require('../dist/server-data/question-plan.cjs'),S=require('../dist/server-data/subjects.cjs');
const handler=require('../dist/api/exam.js');
const original={fetch:global.fetch,key:process.env.GEMINI_API_KEY,secret:process.env.SUPABASE_SECRET_KEY};
process.env.GEMINI_API_KEY='test-key';delete process.env.SUPABASE_SECRET_KEY;
let activeCard;
async function call(body){if(body.planToken)activeCard=P.current(P.readPlan(body.planToken,'test-key'));const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(b){this.body=b;return this}};await handler({method:'POST',headers:{host:'localhost'},body},res);assert.equal(res.statusCode,200,JSON.stringify(res.body));return res.body}
global.fetch=async(url,options)=>{
 const body=JSON.parse(options.body),system=body.systemInstruction.parts[0].text;
 assert(system.includes(profiles.get(activeCard.subject||'termicas').guide));
 if(activeCard.subject==='economia'){
  const contract=JSON.parse(system.split('CONTRATO DE COBERTURA HDP PARA ESTA PREGUNTA:\n')[1].split('\n')[0]);
  assert(contract.some(c=>c.label.includes('económico')));assert(!contract.some(c=>/fluido|energía|mecánic/i.test(c.label)));
 }
 const response={speech:'Devolución breve.',feedback:'Respuesta completa.',score:10,evaluated:true,finished:false,transcript:'Respuesta del alumno',sourceIds:[],strengths:[],improvements:[],omissions:[],betterAnswer:'',keyChecks:activeCard.keyPoints.map((_,index)=>({index,covered:true})),criteria:['concepto','componentes','funcionamiento','conexiones','precision','mantenimiento','fallas'].map(name=>({name,value:100,applicable:false,reason:'Evidencia de prueba'})),hdpCoverage:H.requirements(activeCard).map(r=>({id:r.id,status:'complete',evidence:'Respuesta del alumno',reason:'Desarrollado.'}))};
 return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(response)}]}}]})};
};
(async()=>{
 assert.equal(new Set(S.ids.map(id=>profiles.get(id).guide)).size,6);
 for(const subject of S.ids){
  const settings={subject,unit:0,scope:'completo',level:'hdp',speed:'normal',loop:true};
  const start=await call({...settings,action:'start'});
  assert.equal(start.hdpIntro,profiles.introduction(subject));assert.equal(start.hdpSubject,S.get(subject).name);
  assert.equal(start.speech.split(start.hdpIntro).length,2,'Se lee la pauta sólo en la presentación inicial');
  assert(!start.question.includes(start.hdpIntro));assert(start.reviewQueue.every(q=>!q.question.includes(profiles.get(subject).guide)));
  assert(start.reviewQueue.every(q=>!q.question.includes('Desarrollá una explicación técnica completa')));
  if(subject==='economia'){assert(start.hdpIntro.includes('actores'));assert(!/fluido|energía|mantenimiento|mecánic/i.test(start.hdpIntro));}
  const next=await call({...settings,action:'answer',planToken:start.planToken,text:'Respuesta del alumno'});
  assert.equal(next.hdpIntro,undefined);assert(!next.speech.includes(start.hdpIntro));assert.equal(next.score,10);
  if(subject==='economia')assert.equal(next.criteria.find(c=>c.name==='componentes').label,'Actores y variables');
  const skipped=await call({...settings,action:'skip',planToken:next.planToken});assert.equal(skipped.hdpIntro,undefined);assert(!skipped.speech.includes(start.hdpIntro));
  const last=P.readPlan(skipped.planToken,'test-key');last.index=last.ids.length-1;
  const loop=await call({...settings,action:'answer',text:'Respuesta del alumno',planToken:P.signPlan(last,'test-key')});
  assert.equal(loop.planProgress.position,1);assert.equal(loop.hdpIntro,undefined);assert(!loop.speech.includes(start.hdpIntro),'El bucle no repite la pauta al volver al principio');
 }
 const normal=await call({subject:'economia',unit:0,level:'acompanado',action:'start'});assert.equal(normal.hdpIntro,undefined);
 console.log('OK: seis pautas y criterios propios, introducción una vez por examen, preguntas breves y sin repetición al responder, omitir o completar el bucle. Gemini simulado.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=original.fetch;for(const [name,value]of [['GEMINI_API_KEY',original.key],['SUPABASE_SECRET_KEY',original.secret]])if(value===undefined)delete process.env[name];else process.env[name]=value});
