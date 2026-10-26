const assert=require('node:assert/strict');
const P=require('../dist/server-data/question-plan.cjs');
const bank=require('../dist/server-data/thermal-pdf-bank.cjs');
const {sourceTexts}=require('../dist/server-data/retrieve.cjs');
const handler=require('../dist/api/exam.js');
async function call(body){const res={statusCode:200,setHeader(){},status(s){this.statusCode=s;return this},json(b){this.body=b;return this}};await handler({method:'POST',headers:{host:'localhost'},body},res);return res}
(async()=>{
 assert.equal(bank.cards.length,90);
 for(const c of bank.cards){assert.equal(c.prompts.length,4);assert.equal(c.points.length,4);assert(sourceTexts(c.sources.map(s=>s.id)).length>100)}
 for(const level of ['acompanado','examen','hdp'])for(const speed of ['rapida','normal','sobrepensada']){
  const plan=P.createPlan({subject:'termicas',unit:-1,scope:'completo',speed,level,includeVisual:true});
  assert.equal(P.readPlan(P.signPlan(plan,'test'),'test').ids.length,plan.ids.length);
  const queue=P.reviewQueue(plan,'test');
  assert.equal(queue.filter(q=>q.id.startsWith('mtpdf-')).length,level==='acompanado'?0:90);
  for(let index=0;index<plan.ids.length;index++){
   const card=P.current({...plan,index});if(!card.pdfTopic)continue;
   assert.equal(card.keyPoints.length,level==='hdp'?4:3);
   assert.equal(queue[index].referenceAnswer,card.answer);
   assert.equal(queue[index].question,card.question);
  }
 }
 for(const unit of [0,1,2,3,4,5,6,8,11]){
  const plan=P.createPlan({unit,scope:'completo',speed:'normal',level:'hdp'});
  for(let index=0;index<plan.ids.length;index++)assert.equal(P.current({...plan,index}).unit,unit);
 }
 const other=P.createPlan({subject:'frio',unit:-1,scope:'completo',speed:'normal',level:'hdp'});
 assert(other.ids.every(id=>!id.startsWith('mtpdf-')));
 process.env.GEMINI_API_KEY='test-key';delete process.env.SUPABASE_SECRET_KEY;
 for(const level of ['examen','hdp']){
  const start=await call({action:'start',unit:-1,subject:'termicas',level,scope:'completo',speed:'normal'});
  assert.equal(start.statusCode,200);assert.equal(start.body.reviewQueue.filter(q=>q.id.startsWith('mtpdf-')).length,90);
  const mismatch=await call({action:'hint',unit:-1,subject:'termicas',level:level==='hdp'?'examen':'hdp',scope:'completo',speed:'normal',planToken:start.body.planToken});
  assert.equal(mismatch.statusCode,400);
 }
 console.log('OK: 90 consignas, referencias, criterios por modalidad/velocidad, colas, planes grandes, unidades y aislamiento de materias.');
})().catch(e=>{console.error(e);process.exitCode=1});
