const books=require('./books.json');
const materials=require('./materials.json');
const topics=[
['Vapor','vapor saturado húmedo seco sobrecalentado termodinámica calor latente sensible presión temperatura'],
['Clasificación de calderas','caldera acuotubular humotubular clasificación colectores circulación tipos diseño'],
['Accesorios de calderas','accesorios válvulas seguridad manómetros niveles indicadores sobrecalentador economizador separadores'],
['Combustión','combustión combustible aire quemadores pulverización atomización llama transferencia calor tiro'],
['Alimentación','alimentación agua bombas regulación retención interceptora desaireador condensado'],
['Operación de calderas','operación encendido puesta servicio parada caldera conservación mantenimiento averías'],
['Turbinas de vapor','turbina vapor acción reacción álabes toberas rotor eje diafragmas'],
['Auxiliares de turbinas','turbinas auxiliares lubricación cojinetes empuje sellos condensador vacío'],
['Operación de turbinas','turbina operación virador calentamiento vibraciones velocidad protecciones'],
['Fluido térmico','fluido térmico calentador expansión circulación serpentín consumidores'],
['Propiedades del combustible','combustible propiedades viscosidad densidad poder calorífico inflamación escurrimiento agua sedimentos azufre cenizas carbono'],
['Circuito de combustible','combustible circuito tanques bombas filtros calentadores viscosidad quemadores pulverización retorno'],
['Alimentación de calderas · circuito completo','agua alimentación circuito cisterna condensado desaireador bombas regulación válvulas retención caldera calidad agua'],
['Mantenimiento y fallas','mantenimiento fallas averías corrosión incrustaciones fugas tubos hollín quemadores alimentación inspección']
];
const stop=new Set('para como porque donde cuando cuales cual esta este estos estas tiene tienen puede pueden debe deben una unas unos los las del por con que sus son hay mas sin sobre entre desde hasta mucho poco explicar respuesta pregunta alumno profesor caldera calderas'.split(' '));
function tokens(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().match(/[a-z0-9]{3,}/g)?.filter(w=>!stop.has(w))||[]}
const docs=books.filter(p=>p.text.length>120).map(p=>({...p,id:(p.book==='Bobbio I'?'BI':'BII')+'-'+p.pdfPage,title:p.book+' · página PDF '+p.pdfPage,priority:(p.text.match(/CAP[IÍ]TULO/gi)||[]).length>3?.2:1.15}));
for(const m of materials){let chunks=m.text.match(/[\s\S]{1,5000}/g)||[];chunks.forEach((text,i)=>docs.push({id:m.id+'-'+(i+1),title:m.title+' · sección de texto '+(i+1),text,priority:m.id==='clase'?.25:.8}))}
for(const d of docs){d.words=tokens(d.text);d.tf=new Map();for(const w of d.words)d.tf.set(w,(d.tf.get(w)||0)+1)}
const df=new Map();for(const d of docs)for(const w of d.tf.keys())df.set(w,(df.get(w)||0)+1);const avg=docs.reduce((s,d)=>s+d.words.length,0)/docs.length;
function retrieve({unit,history,text,scope}){const question=[...history].reverse().find(m=>m.role==='model')?.text||'';const terms=new Map();for(const [s,weight]of [[topics[unit]?.[1]||topics.map(t=>t[1]).join(' '),.55],[question,1.6],[text,1.2],[scope==='completo'?'componentes circuito mantenimiento fallas averías síntomas causas prevención':'',.3]])for(const w of tokens(s))terms.set(w,(terms.get(w)||0)+weight);
 const ranked=docs.map(d=>{let score=0;for(const [w,weight]of terms){const tf=d.tf.get(w)||0;if(!tf)continue;const idf=Math.log(1+(docs.length-(df.get(w)||0)+.5)/((df.get(w)||0)+.5));score+=weight*idf*(tf*2.2)/(tf+1.2*(.25+.75*d.words.length/avg))}return {d,score:score*d.priority}}).sort((a,b)=>b.score-a.score);
 let selected=ranked.filter(x=>x.score>0).slice(0,9).map(x=>x.d);if(unit>=6&&unit<=8){const turbine=docs.filter(d=>d.id.startsWith('turbinas-'));selected=[...turbine,...selected.filter(d=>!d.id.startsWith('turbinas-'))].slice(0,10)}
 const context=selected.map(d=>`[${d.id}] ${d.title}\n${d.text}`).join('\n\n');return {context,allowed:selected.map(d=>({id:d.id,title:d.title})),coverage:{bobbioI:books.filter(p=>p.book==='Bobbio I').length,bobbioII:books.filter(p=>p.book==='Bobbio II').length,searchablePages:books.filter(p=>p.text.length>120).length,units:10}}}
function sourceTexts(ids){const wanted=new Set(ids||[]);return docs.filter(d=>wanted.has(d.id)).map(d=>`[${d.id}] ${d.title}\n${d.text}`).join('\n\n')}
module.exports={retrieve,topics,sourceTexts};
