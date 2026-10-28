const {sourceFigure}=require('./thermal-guide-visuals.cjs');
const {modules}=require('./thermal-guide-content.cjs'),document=require('./thermal-guide-questions.json');
const ref=(title,url)=>({title,url});
const books=[ref('Bobbio I · construcción y accesorios','https://drive.google.com/file/d/1bQt9DS_V2dEgTa2SbswRXeJSXOc3-ed7/view'),ref('Bobbio II · combustión, alimentación y operación','https://drive.google.com/file/d/1eK0ar8DqgNc-jdxkMpxSqck99HfkB_DU/view')];
const cls=ref('Clase de Daldin · turbinas, alimentación y calderas (contrastar generalizaciones con el diseño)','https://drive.google.com/file/d/13WZH1et0JIu_fIoSlmzqPxGIl57fqA8R/view');
const turbine=ref('Conceptos básicos de turbinas · material de consulta','https://docs.google.com/document/d/1CujspefAxXYjfAtg2geYngO7dhKUWcaB/edit');
const extra={
 safety:[ref('Spirax Sarco · selección y definiciones de válvulas de seguridad','https://www.spiraxsarco.com/learn-about-steam/safety-valves/safety-valve-selection')],
 triangles:[ref('MIT OpenCourseWare · triángulos de velocidades','https://ocw.mit.edu/ans7870/16/16.unified/propulsionS04/triangles/index.html')],
 cavitation:[ref('TLV · cavitación en bombas de condensado','https://www.tlv.com/en-gb/steam-info/steam-theory/problems/cavitation-in-condensate-pumps')],
 level:[ref('Spirax Sarco · control de nivel de uno, dos y tres elementos','https://www.spiraxsarco.com/learn-about-steam/the-boiler-house/automatic-level-control-systems')],
 thermal:[ref('Eastman Therminol · conexiones y cuidado del circuito térmico','https://www.therminol.com/resources/QandA'),ref('MultiTherm · fundamentos de arranque y parada','https://www.multitherm.com/technical_articles_proper_system_startup.html'),ref('Eastman Therminol · tanque de expansión','https://www.therminol.com/sites/therminol/files/documents/Thermal_Expansion_Tank_Design_and_Operation.pdf')]
};
function references(m){return [...(m.unit<3?[books[0],cls]:m.unit<6?[books[1],cls]:m.unit<9?[turbine,cls]:[]),...m.refs.flatMap(k=>extra[k]||[])]}
const navigation=document.questions.map(q=>{const m=modules.find(m=>m.questions.includes(q.number));if(!m||m.unit!==q.unit)throw Error('Pregunta sin guía: '+q.number);return {...q,sectionId:'documento-'+m.id}});
function sections(unit){return modules.filter(m=>m.unit===unit).map(m=>({
 id:'documento-'+m.id,label:'PASO A PASO · PREGUNTAS '+m.questions.map(n=>String(n).padStart(3,'0')).join(', '),title:m.title,paragraphs:[],
 steps:m.steps.map((s,i)=>({...s,sourceFigure:sourceFigure(m.id,i),image:'/assets/guia-termicas/'+m.id+'-'+(i+1)+'.svg',alt:`${m.title}. Paso ${i+1}: ${s.title}. ${s.text}`})),
 questions:document.questions.filter(q=>m.questions.includes(q.number)),
 animation:['rankine','combustible','aceite'].includes(m.id)?'/assets/guia-termicas/'+m.id+'.gif':null,
 plate:['tipo-d','tipo-a','tipo-m'].includes(m.id)?'/assets/identificar/'+m.id+'.svg':m.id==='valvulas'?'/assets/valvulas.png':null,
 pitfall:m.pitfall,sources:[...references(m),...m.steps.map((_,i)=>sourceFigure(m.id,i)).filter(Boolean).filter((f,i,a)=>a.findIndex(x=>x.url===f.url)===i).map(f=>({title:f.source+' · página PDF '+f.page,url:f.url}))]
}))}
module.exports={sections,navigation,notice:document.notice,modules};
