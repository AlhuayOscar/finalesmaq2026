const H=require('./hdp-grading.cjs');
const guide=`RHDP: esta pauta sustituye los topes y pesos de HDP. Se parte de 10 y se restan exactamente 2 puntos por cada error u omisión independiente, con piso 0. Cada aspecto partial o missing cuenta una vez; no dupliques un error como omisión y error extra. Definiciones y conceptos deben ser casi exactos a la fuente: conservar términos, condiciones y relaciones esenciales. Aceptar cambios de orden o sinónimos inequívocos; no castigar muletillas ni diferencias cosméticas. Comparar con pasajes originales disponibles y la referencia revisada; no exigir errores del OCR ni del apunte. Si falta una definición verificable, reconocerlo y no inventar exigencias. No penalizar contenido correcto de más. rhdpErrors enumera errores técnicos adicionales con id estable, requirementId (id del contrato si corresponde, vacío si es independiente), evidence (cita literal del alumno), correction y sourceId (ID provisto). Para errores ya incluidos en cobertura usar el mismo requirementId. No contar dos veces el mismo error. La velocidad no reduce cobertura ni desglose. La nota la calcula el servidor.`;
function schemaFor(base){const schema=H.schemaFor(base);return {...schema,properties:{...schema.properties,rhdpErrors:{type:'ARRAY',items:{type:'OBJECT',properties:{id:{type:'STRING'},requirementId:{type:'STRING'},evidence:{type:'STRING'},correction:{type:'STRING'},sourceId:{type:'STRING'}},required:['id','requirementId','evidence','correction','sourceId']}}},required:[...schema.required,'rhdpErrors']}}
const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function grade(answer,options){
 const feedback=answer.feedback||'';H.grade(answer,options);
 if(!Array.isArray(answer.rhdpErrors))throw Error('Falta el desglose RHDP');
 const faults=new Map(answer.hdpCoverage.filter(c=>c.status!=='complete').map(c=>[c.id,{id:c.id,type:'omision',reason:c.label+': '+c.reason,points:2}]));
 const requirements=new Set(answer.hdpCoverage.map(c=>c.id)),sources=new Set(options.card.sources.map(s=>s.id)),seen=new Set();
 for(const e of answer.rhdpErrors){
  if(!e||typeof e.id!=='string'||!e.id.trim()||typeof e.evidence!=='string'||typeof e.correction!=='string'||!e.correction.trim()||typeof e.requirementId!=='string'||!sources.has(e.sourceId))throw Error('Error RHDP sin fuente');
  const quote=normalize(e.evidence),id=e.requirementId||e.id;
  if(!quote||(!options.hasImage&&!normalize(options.text||'').includes(quote)))throw Error('Error RHDP sin evidencia del alumno');
  if(e.requirementId&&!requirements.has(e.requirementId))throw Error('Aspecto RHDP inválido');
  const signature=quote+'|'+normalize(e.correction);if(seen.has(signature))continue;seen.add(signature);
  if(!faults.has(id))faults.set(id,{id,type:'error',evidence:e.evidence,reason:e.correction,sourceId:e.sourceId,points:2});
 }
 answer.rhdpAssessment={base:10,pointsPerFault:2,faults:[...faults.values()],deduction:faults.size*2};
 answer.score=Math.max(0,10-faults.size*2);
 answer.omissions=[...faults.values()].map(f=>f.reason);
 answer.feedback=feedback+`\n\nRHDP: 10 − ${faults.size} × 2 = ${answer.score.toFixed(2)}/10 (mínimo 0).`+([...faults.values()].map(f=>'\n−2 · '+f.reason).join('')||' Sin errores ni omisiones identificados.');
 return answer;
}
module.exports={guide,schemaFor,grade};
