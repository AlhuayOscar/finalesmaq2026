const assert=require('node:assert/strict');
const api=require('../dist/api/exam.js'),P=require('../dist/server-data/question-plan.cjs'),H=require('../dist/server-data/hdp-grading.cjs');
const originalFetch=global.fetch,key=process.env.GEMINI_API_KEY,secret=process.env.SUPABASE_SECRET_KEY;process.env.GEMINI_API_KEY='test';delete process.env.SUPABASE_SECRET_KEY;
async function call(body){const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(b){this.body=b;return this}};await api({method:'POST',headers:{host:'localhost'},body},res);return res}
(async()=>{for(const level of ['examen','hdp']){
 const settings={subject:'frio',unit:-1,scope:'completo',speed:'normal',level,slideNumbers:[1,3,9]};const start=await call({...settings,action:'start'});assert.equal(start.statusCode,200);let calls=0;const card=P.current(P.readPlan(start.body.planToken,'test'));
 global.fetch=async(url,opts)=>{calls++;const req=JSON.parse(opts.body),system=req.systemInstruction.parts[0].text;
 assert(system.includes('SOLAMENTE la diapositiva 1'));assert(system.includes('NO omisiones'));assert(!req.contents.some(c=>c.parts.some(p=>p.text?.includes('Ya respondiste diapositivas 3 y 9'))));
 assert(req.contents.at(-1).parts.some(p=>p.inlineData?.mimeType==='audio/webm'));
 assert.equal(req.generationConfig.responseSchema.properties.hdpCoverage.type,'OBJECT');assert.deepEqual(req.generationConfig.responseSchema.properties.hdpCoverage.required,H.requirements(card).map(r=>r.id));
 const a={speech:'La explicación es incorrecta.',transcript:'El refrigerante produce electricidad.',feedback:'Confundiste las transformaciones de energía de esta lámina.',score:0,evaluated:true,finished:false,strengths:[],improvements:[],criteria:['concepto','componentes','funcionamiento','conexiones','precision','mantenimiento','fallas'].map(name=>({name,value:0,applicable:true,reason:'Respuesta incorrecta'})),sourceIds:[]};
 if(calls>1)a.hdpCoverage=Object.fromEntries(H.requirements(card).map(r=>[r.id,{status:'missing',evidence:'',reason:'No se explicó correctamente este punto de la lámina 1.'}]));
 return{ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(a)}]}}]})};};
 const result=await call({...settings,action:'answer',audio:{mimeType:'audio/webm',data:'AAAA'},history:[{role:'model',text:'Ya respondiste diapositivas 3 y 9'}],planToken:start.body.planToken});assert.equal(result.statusCode,200,JSON.stringify(result.body));assert.equal(calls,2,'Una reparación interna');assert.equal(result.body.score,0,'Aceptar equivocación con nota cero');assert.equal(result.body.evaluated,true);assert.equal(result.body.visual.slideNumber,3,'Solo avanza de 1 a 3');const next=P.readPlan(result.body.planToken,'test');assert.equal(next.index,1);assert.deepEqual(next.ids,['frio-slide-1','frio-slide-3','frio-slide-9']);assert(result.body.omissions.every(o=>!o.includes('lámina 3')&&!o.includes('lámina 9')));
 }
 console.log('OK: audio erróneo aceptado con 0, reparación interna de cobertura, aislamiento de historial y avance 1 → 3 con 9 pendiente, Simulacro y HDP.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=originalFetch;if(key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=key;if(secret===undefined)delete process.env.SUPABASE_SECRET_KEY;else process.env.SUPABASE_SECRET_KEY=secret});
