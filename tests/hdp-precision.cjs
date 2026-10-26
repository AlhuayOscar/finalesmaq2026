const assert=require('node:assert/strict');
const handler=require('../dist/api/exam.js');
const P=require('../dist/server-data/question-plan.cjs');
process.env.GEMINI_API_KEY='test-key';delete process.env.SUPABASE_SECRET_KEY;
const originalFetch=global.fetch;
async function call(body){const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(b){this.body=b;return this}};await handler({method:'POST',headers:{host:'localhost'},body},res);assert.equal(res.statusCode,200,JSON.stringify(res.body));return res.body}
(async()=>{
 for(const level of ['hdp','examen','acompanado'])for(const speed of ['rapida','normal']){
  const settings={subject:'termicas',unit:0,scope:'completo',level,speed};
  const start=await call({...settings,action:'start'});
  const plan=P.readPlan(start.planToken,'test-key'),card=P.current(plan);
  global.fetch=async(url,options)=>{
   const request=JSON.parse(options.body),system=request.systemInstruction.parts[0].text;
   assert.equal(system.includes('HDP: EXIGENCIA DE PRECISIÓN TÉCNICA.'),level==='hdp');
   if(level==='hdp'){assert(system.includes('Qué dijiste de más'));assert(system.includes('frase breve y literal'));assert(system.includes('no resta puntos'));}
   return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({speech:'Revisá la precisión.',feedback:'Precisión técnica: «calienta» no define el cambio de estado. Qué dijiste de más: No detecté contenido de más. Qué faltó: especificar las condiciones.',transcript:'calienta',score:8,finished:false,evaluated:true,strengths:[],improvements:[],omissions:[],sourceIds:[],betterAnswer:'',keyChecks:card.keyPoints.map((_,index)=>({index,covered:true})),criteria:['concepto','componentes','funcionamiento','conexiones','precision','mantenimiento','fallas'].map(name=>({name,value:name==='precision'?40:100,applicable:true,reason:'Evidencia de prueba'}))})}]}}]})};
  };
  const result=await call({...settings,action:'answer',text:'calienta',planToken:start.planToken});
  assert.equal(result.criteria.find(c=>c.name==='precision').weight,level==='hdp'?30:15);
  assert.equal(result.score,level==='hdp'?8.2:9.1);
  assert(result.feedback.includes('Qué dijiste de más'));
 }
 console.log('OK: política HDP aislada, corrección explícita y peso real de precisión en rápida y normal. Gemini simulado.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=originalFetch});
