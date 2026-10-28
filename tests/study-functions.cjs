const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const Study=require('../dist/server-data/exam-study.cjs'),E=require('../dist/server-data/study-explanation.cjs'),P=require('../dist/server-data/question-plan.cjs');
const visualIds=[...require('../dist/server-data/visual-bank.json').cards,...require('../dist/server-data/course-visual-bank.json').cards].map(c=>c.id);
const planFor=id=>({ids:[id],index:0,cycle:1,unit:1,level:'estudiar',scope:'completo',speed:'normal',subject:id.startsWith('frio-')?'frio':'termicas',limit:1});
const slideCard=P.current(planFor('frio-slide-10'));
function complete(){return {answer:'La inyección permite controlar las condiciones del refrigerante durante el ciclo.',explanations:Object.fromEntries(slideCard.keyPoints.map((_,i)=>['point-'+i,{answer:'El refrigerante circula por el ramal de inyección para modificar las condiciones de compresión según el circuito mostrado.',limited:false}])),components:[{name:'Compresor scroll',function:'Comprime el vapor refrigerante al reducir el volumen entre las espirales.',connection:'Recibe vapor de la aspiración y lo entrega hacia la descarga.'}],componentsUnavailableReason:''}}
assert.throws(()=>E.validate({answer:'Ver diagrama.'},slideCard),/introductoria/);
let bad=complete();delete bad.explanations['point-0'];assert.throws(()=>E.validate(bad,slideCard),/punto 1/);
bad=complete();bad.explanations['point-0'].answer=slideCard.keyPoints[0];assert.throws(()=>E.validate(bad,slideCard),/repetirlo/);
bad=complete();bad.components[0].function='Ver diagrama.';assert.throws(()=>E.validate(bad,slideCard),/función/);
bad=complete();bad.components=[];assert.throws(()=>E.validate(bad,slideCard),/limitación concreta/);
const limited=complete();limited.components=[];limited.componentsUnavailableReason='La fuente no permite identificar los rótulos de las conexiones en esta copia.';limited.explanations['point-0']={answer:'Se observa el ramal de inyección, pero la copia no permite leer su punto exacto de conexión.',limited:true};assert(E.validate(limited,slideCard).sections[0].limited);
const originalFetch=global.fetch;let calls=0;
(async()=>{
 global.fetch=async()=>{throw Error('Una función preparada no debe depender de Gemini')};
 for(const id of visualIds){
  const c=P.current(planFor(id)),r=await Study.present(planFor(id),'test-key');assert.equal(r.studyComponents.length,c.keyPoints.length,id);assert(!r.studySections.length);for(const item of r.studyComponents){assert(item.name&&item.function.length>15);assert(r.speech.includes(item.function))}assert.equal(r.evaluated,false);
 }
 global.fetch=async(url,options)=>{
  calls++;const body=JSON.parse(options.body);assert.equal(body.contents[0].parts.filter(p=>p.inlineData).length,1,'El modelo ve la lámina original');
  assert(body.generationConfig.responseSchema.properties.explanations.required.includes('point-4'));
  const response=calls===1?{answer:'Ver diagrama.'}:complete();return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify(response)}]}}]})};
 };
 const generated=await Study.present(planFor('frio-slide-10'),'test-key');assert.equal(calls,2,'Repara una explicación que sólo remite a la imagen');assert.equal(generated.studySections.length,slideCard.keyPoints.length);assert.equal(generated.studyComponents[0].name,'Compresor scroll');assert(generated.speech.includes(generated.studyComponents[0].function));assert(generated.speech.includes(generated.studySections[0].answer));
 calls=0;global.fetch=async()=>{calls++;return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({answer:'Ver diagrama.'})}]}}]})}};await assert.rejects(()=>Study.present(planFor('frio-slide-10'),'test-key'),/sin resolver todos los puntos/);assert.equal(calls,2,'Nunca publica sólo la imagen tras agotar la reparación');
 const context={updateExam(){},esc:s=>String(s).replaceAll('<','&lt;'),examSourceURL:s=>s.url};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/exam-study.js'),'utf8'),context);context.data=generated;
 const html=vm.runInContext('renderStudyMessage(data,0)',context);assert(html.includes('Elementos y funciones que pide la pregunta'));assert(html.includes('Compresor scroll'));assert(html.includes('Comprime el vapor'));assert(html.includes('Respuesta a cada punto de la consigna'));assert(html.indexOf('Comprime el vapor')<html.indexOf('<figure'),'Las funciones aparecen antes del diagrama');assert(html.includes('connection')===false);
 const exported={...context,window:{},location:{hash:''},exam:{subject:'frio',level:'estudiar',unit:-1,depth:'normal',scope:'completo',speed:'normal',messages:[{role:'model',data:generated}]},currentSubject:'frio',navalSubjects:{frio:{name:'Frío'}},depthLabels:{normal:'Normal'},speedLabels:{normal:'Normal'},examElement:()=>null};vm.createContext(exported);vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/exam-export.js'),'utf8'),exported);const text=vm.runInContext('buildExamExport()',exported);assert(text.includes('Comprime el vapor'));assert(text.includes(generated.studySections[0].answer));
 global.fetch=originalFetch;console.log('OK: las 11 láminas preparadas conservan todas las funciones; Frío exige resolver cada consigna y explicar componentes/recorridos; repara respuestas vacías y rechaza imagen sin explicación; funciones visibles, narradas y exportadas.');
})().catch(e=>{global.fetch=originalFetch;console.error(e);process.exitCode=1});
