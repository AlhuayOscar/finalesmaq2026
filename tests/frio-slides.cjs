const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const S=require('../dist/server-data/frio-slides.cjs'),P=require('../dist/server-data/question-plan.cjs'),H=require('../dist/server-data/hdp-grading.cjs'),F=require('../dist/server-data/frio-grading.cjs'),parse=require('../dist/slide-selection.js').parse;
const settings={subject:'frio',unit:-1,scope:'completo',speed:'rapida',level:'examen',slideNumbers:[23,1,59]};
assert.equal(S.records.length,82);assert.equal(S.cards.length,76);
assert.deepEqual(parse('01, 23;59',S.records),{numbers:[1,23,59],error:''});
for(const value of ['1,1','2','48','49','56','54','57','1.5','1-6','0','100','1,3,4,5,6,7,8'])assert(parse(value,S.records).error,value);
assert.deepEqual(S.validate([1,3,4,5,6,7]),[1,3,4,5,6,7]);assert.throws(()=>S.validate(['1']));
const plan=P.createPlan(settings);assert.deepEqual(plan.ids,['frio-slide-23','frio-slide-1','frio-slide-59']);assert.equal(plan.limit,3);assert.equal(plan.includeVisual,true);
assert.equal(P.current(plan).visual.pdfPage,26);assert.equal(P.current(P.advance(plan)).visual.pdfPage,5);
assert.deepEqual(P.readPlan(P.signPlan(plan,'key'),'key').slideNumbers,[23,1,59]);
assert.throws(()=>P.createPlan({...settings,subject:'termicas'}));
for(const card of S.cards){const c=P.current({...plan,ids:[card.id],index:0});assert(c.question.includes('Diapositiva '+card.slideNumber));assert(fs.statSync(path.join(__dirname,'../dist/server-data/frio-slide-images',card.slideNumber+'.jpg')).size>1000);assert(c.keyPoints.length>=4);}
for(const level of ['examen','hdp']){
 const card=P.current({...plan,level});const req=H.requirements(card);const text='Respuesta técnica real';
 const answer=()=>({score:10,feedback:'Explicación.',criteria:['concepto','componentes','funcionamiento','conexiones','precision','mantenimiento','fallas'].map(name=>({name,value:100,applicable:true,reason:'Correcto'})),hdpCoverage:req.map(r=>({id:r.id,status:'complete',evidence:text,reason:'Correcto'}))});
 let a=answer();F.grade(a,{card,text},level);assert.equal(a.score,10);
 a=answer();a.hdpCoverage[0].status='partial';a.hdpCoverage[0].reason='Omitió una conexión.';F.grade(a,{card,text},level);assert.equal(a.score,level==='hdp'?5.9:6.9);assert(a.omissions[0].includes('Omitió una conexión'));assert(!a.feedback.includes('Se aplica el menor: 10'));
 a=answer();a.hdpCoverage.forEach(c=>{c.status='missing';c.evidence=''});F.grade(a,{card,text},level);assert.equal(a.score,0);assert.equal(a.omissions.length,req.length);
 a=answer();a.hdpCoverage[0].evidence='Texto presente sólo en la lámina';assert.throws(()=>F.grade(a,{card,text},level));
 assert.equal(P.current({...plan,level,speed:'rapida'}).keyPoints.length,P.current({...plan,level,speed:'sobrepensada'}).keyPoints.length);
}
// Live endpoint contract, no external inference or account mutation.
const api=require('../dist/api/exam.js'),originalFetch=global.fetch,key=process.env.GEMINI_API_KEY,secret=process.env.SUPABASE_SECRET_KEY;
process.env.GEMINI_API_KEY='test-frio';delete process.env.SUPABASE_SECRET_KEY;
async function call(body){const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(b){this.body=b;return this}};await api({method:'POST',headers:{host:'localhost'},body},res);return res}
(async()=>{
 let called=0,omitCoverage=false;global.fetch=async(url,opts)=>{
  called++;const request=JSON.parse(opts.body);assert(request.generationConfig.responseSchema.required.includes('hdpCoverage'));
  assert(request.contents.at(-1).parts.some(p=>p.inlineData?.mimeType==='image/jpeg'),'Exam source image must be provided to evaluator');
  assert(request.contents.at(-1).parts[0].text.includes('NO RESPUESTA DEL ALUMNO'));
  const card=P.current(P.createPlan({...settings,slideNumbers:[23]}));
  const response={speech:'Falta explicar conexiones.',transcript:'Respuesta técnica real',feedback:'Revisar el recorrido.',score:10,finished:false,evaluated:true,strengths:[],improvements:[],omissions:[],sourceIds:[],betterAnswer:'',criteria:['concepto','componentes','funcionamiento','conexiones','precision','mantenimiento','fallas'].map(name=>({name,value:100,applicable:true,reason:'Explicado'})),...(!omitCoverage?{hdpCoverage:H.requirements(card).map((r,i)=>({id:r.id,status:i?'complete':'partial',evidence:'Respuesta técnica real',reason:i?'Correcto':'Omitió una conexión.'}))}:{})};
  return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(response)}]}}]})};
 };
 const bad=await call({...settings,action:'start',slideNumbers:[1,2]});assert.equal(bad.statusCode,400);assert.equal(bad.body.code,'invalid_slides');assert.equal(called,0);
 const start=await call({...settings,slideNumbers:[23],action:'start'});assert.equal(start.statusCode,200);assert.equal(start.body.visual.slideNumber,23);assert.equal(start.body.planProgress.limit,1);assert.equal(called,0);
 const graded=await call({...settings,action:'answer',text:'Respuesta técnica real',planToken:start.body.planToken});assert.equal(graded.statusCode,200);assert.equal(graded.body.score,6.9);assert.equal(graded.body.finished,true);assert(graded.body.omissions[0].includes('conexión'));
 omitCoverage=true;assert.equal((await call({...settings,action:'answer',text:'Respuesta técnica real',planToken:start.body.planToken})).statusCode,502);
 console.log('OK: 82 fichas, selección 1–6, números originales, aislamiento del plan, imágenes fuente, Simulacro/HDP estrictos y rechazo de evaluación sin evidencia. Gemini simulado.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=originalFetch;if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;if(secret===undefined)delete process.env.SUPABASE_SECRET_KEY;else process.env.SUPABASE_SECRET_KEY=secret});
