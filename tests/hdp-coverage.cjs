const assert=require('node:assert/strict');
const H=require('../dist/server-data/hdp-grading.cjs'),P=require('../dist/server-data/question-plan.cjs');
const names=['concepto','componentes','funcionamiento','conexiones','precision','mantenimiento','fallas'];
const card=P.current({ids:['u1-q2'],index:0,speed:'normal',level:'hdp'});
const student='Tiene dos colectores y un horno lateral.';
function answerFor(card,statuses,evidence=student){return {score:10,feedback:'Buena terminología.',criteria:names.map(name=>({name,value:100,applicable:false,reason:'Evaluación de prueba'})),hdpCoverage:H.requirements(card).map((r,i)=>({id:r.id,status:statuses[i]||'missing',evidence:statuses[i]&&statuses[i]!=='missing'?evidence:'',reason:statuses[i]==='complete'?'Desarrollado en la respuesta.':'Falta desarrollar el aspecto.'}))}}
for(const [statuses,expected]of [[['complete'],1.43],[['complete','complete'],2.86],[Array(7).fill('missing'),0],[Array(7).fill('complete'),10],[Array(5).fill('partial'),3.57]]){
 const result=H.grade(answerFor(card,statuses),{card,text:student});
 assert.equal(result.score,expected);assert(result.feedback.includes('Máximo por cobertura'));assert(result.criteria.find(c=>c.name==='precision').applicable);
 assert(result.criteria.filter(c=>!['mantenimiento','fallas'].includes(c.name)).every(c=>c.applicable),'No se excluyen aspectos omitidos del promedio');
 assert.equal(result.omissions.length,7-statuses.filter(s=>s==='complete').length);
}
const partial=H.grade(answerFor(card,['partial']),{card,text:student});assert.equal(partial.hdpAssessment.coverageScore,.71);assert.equal(partial.score,.71);
assert.throws(()=>H.grade(answerFor(card,['complete'],'Cita de la respuesta del profesor'),{card,text:student}),/evidencia/);
const incomplete=answerFor(card,['complete']);incomplete.hdpCoverage.pop();assert.throws(()=>H.grade(incomplete,{card,text:student}),/incompleta/);
const duplicate=answerFor(card,['complete']);duplicate.hdpCoverage[1].id=duplicate.hdpCoverage[0].id;assert.throws(()=>H.grade(duplicate,{card,text:student}),/inválida/);
for(const speed of ['rapida','normal','sobrepensada'])assert.equal(H.requirements(P.current({ids:['u1-q2'],index:0,speed,level:'hdp'})).length,7);
const pdf=P.current({ids:['mtpdf-10-0'],index:0,speed:'normal',level:'hdp'});
assert.equal(H.requirements(pdf).length,4);assert.equal(H.grade(answerFor(pdf,['complete']),{card:pdf,text:student}).score,2.5);
const visual=P.current({ids:['visual-tipo-d'],index:0,speed:'rapida',level:'hdp'});assert.equal(H.requirements(visual).length,visual.keyPoints.length);
assert.equal(H.requirements(card).some(r=>['mantenimiento','fallas'].includes(r.id)),false);
const maintenance=P.current({ids:['u13-q7'],index:0,speed:'normal',level:'hdp'});assert(H.requirements(maintenance).some(r=>r.id==='mantenimiento'));
console.log('OK: 2 de 7 aspectos limitan la nota a 2,86; cobertura parcial, precisión sin compensación, citas verificadas, velocidad constante y alcance de PDF/láminas.');
