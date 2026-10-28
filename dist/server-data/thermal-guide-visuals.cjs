const figures=require('./thermal-source-figures.json');
// Four entries in reading order. Null means no matching original figure was verified;
// the existing, explicitly labelled teaching diagram still covers that step.
const stepFigures={
 rankine:['ciclo','ciclo','ciclo','condensador'],estados:['estados','estados','estados','estados'],diagramas:[null,null,null,null],
 clasificacion:['pirotubular','circulacion','tipo-d','pirotubular'],circulacion:['circulacion','circulacion','circulacion','ciclo'],
 'tipo-d':['tipo-d','tipo-d','tipo-d','tipo-d'],'tipo-a':['tipo-a','tipo-a','tipo-a','tipo-a'],'tipo-m':['tipo-m','tipo-m','tipo-m','tipo-a'],
 recuperacion:['economizador','economizador','pirotubular','ciclo'],construccion:['paredes','paredes','paredes','paredes'],
 domos:['circulacion','circulacion','domo','separador'],superficies:['sobrecalentador','atemperador','economizador','hollin'],
 valvulas:['comunicacion','retencion','seguridad','venteo'],seguridad:['manometro','seguridad','seguridad','seguridad'],
 'purgas-nivel':['purga','domo','venteo','nivel'],transferencia:['aire','transferencia','transferencia','transferencia'],
 combustion:['aire','quemador','aire','aire'],combustible:['combustible','combustible','combustible','quemador'],
 alimentacion:['condensador','desaireador','ciclo','ciclo'],desaireacion:['desaireador','desaireador','desaireador','ciclo'],
 'control-agua':['control-nivel','control-nivel','nivel','domo'],'preparar-caldera':['pirotubular','nivel','retencion','aire'],
 encendido:['aire','quemador','paredes','sobrecalentador'],comunicar:['comunicacion','comunicacion','ciclo','control-nivel'],
 'averias-caldera':['nivel','separador','circulacion','paredes'],'parar-caldera':['comunicacion','quemador','paredes','pirotubular'],
 'etapas-turbina':['tobera','etapas','etapas','ciclo'],velocidades:['velocidades','velocidades','velocidades','velocidades'],
 'mecanica-turbina':['aceite','aceite','sellos','ciar'],aceite:['aceite','aceite','aceite','aceite'],
 'aceite-contaminado':['aceite','sellado-vacio','aceite','aceite'],vacio:['condensador','condensador','condensador','sellado-vacio'],
 'arranque-turbina':['aceite','etapas','sellado-vacio','etapas'],'proteccion-turbina':['regulador','regulador','disparo','aceite'],
 'marcha-atras':['ciar','ciar','ciar','ciar'],'fluido-termico':['fluido','consumidor','expansion','fluido'],
 'operar-fluido':['fluido','fluido','expansion','fluido']
};
const defaults=['rankine:0','clasificacion:0','domos:2','combustion:0','alimentacion:2','preparar-caldera:1','etapas-turbina:0','aceite:0','arranque-turbina:0','fluido-termico:0','combustible:2','combustible:0','alimentacion:0','averias-caldera:0'];
// Explicit mappings to a relevant teaching step for every conceptual question.
const concepts=[
 ['estados:1','estados:1','estados:2','estados:0','estados:3','estados:1','diagramas:0','domos:3'],
 ['clasificacion:0','circulacion:1','tipo-d:0','tipo-a:0','circulacion:3','superficies:2','superficies:0','clasificacion:3'],
 ['domos:2','domos:3','superficies:0','seguridad:1','seguridad:0','purgas-nivel:3','valvulas:0','purgas-nivel:0'],
 ['combustion:0','combustible:3','combustible:2','combustion:2','transferencia:2','combustion:3','combustion:3','encendido:0'],
 ['alimentacion:2','alimentacion:2','valvulas:1','desaireacion:0','alimentacion:1','control-agua:3','desaireacion:3','alimentacion:3'],
 ['preparar-caldera:1','averias-caldera:0','averias-caldera:1','comunicar:3','encendido:2','superficies:3','control-agua:3','preparar-caldera:3'],
 ['etapas-turbina:1','etapas-turbina:2','etapas-turbina:0','etapas-turbina:1','mecanica-turbina:0','velocidades:1','etapas-turbina:3','diagramas:3'],
 ['aceite:2','mecanica-turbina:1','aceite:1','mecanica-turbina:2','vacio:0','vacio:2','mecanica-turbina:3','aceite:2'],
 ['arranque-turbina:3','proteccion-turbina:1','arranque-turbina:2','arranque-turbina:1','arranque-turbina:3','arranque-turbina:2','proteccion-turbina:2','proteccion-turbina:3'],
 ['fluido-termico:1','fluido-termico:2','fluido-termico:0','operar-fluido:2','fluido-termico:3','fluido-termico:1','operar-fluido:2','operar-fluido:2'],
 ['combustible:2','combustion:0','combustible:2','combustible:2','combustible:1','combustion:3','combustion:3','combustible:2'],
 ['combustible:0','combustible:0','combustible:1','combustible:1','combustible:1','combustible:0','combustible:1','combustible:3'],
 ['alimentacion:0','alimentacion:1','desaireacion:0','valvulas:1','control-agua:1','desaireacion:3','control-agua:3','control-agua:2'],
 ['averias-caldera:2','transferencia:3','control-agua:3','combustible:1','combustible:3','purgas-nivel:3','construccion:1','averias-caldera:3']
];
function sourceFigure(id,index){const key=stepFigures[id]?.[index];return key?{...figures[key],key}:null;}
function studyVisual(spec,modules){const [id,n]=spec.split(':'),index=Number(n),m=modules.find(m=>m.id===id);if(!m?.steps[index])throw Error('Invalid thermal visual '+spec);const step=m.steps[index];return {image:'/assets/guia-termicas/'+id+'-'+(index+1)+'.svg',alt:m.title+'. '+step.title,caption:step.title+'. '+step.text,sourceFigure:sourceFigure(id,index),moduleId:id,step:index};}
function enrichLesson(sections,unit,modules){for(const s of sections){if(s.steps||s.image)continue;const i=s.id.startsWith('concepto-')?Number(s.id.slice(9)):null;const spec=i===null?defaults[unit]:concepts[unit]?.[i];if(!spec)throw Error('Missing thermal visual '+unit+'/'+s.id);s.studyVisual=studyVisual(spec,modules);if(s.studyVisual.sourceFigure){const f=s.studyVisual.sourceFigure;s.sources=[...(s.sources||[]),{title:f.source+' · página PDF '+f.page,url:f.url}];}}}
module.exports={sourceFigure,enrichLesson,stepFigures};
