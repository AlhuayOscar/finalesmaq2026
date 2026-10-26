const {weights}=require('./hdp-policy.cjs');
const names=['concepto','componentes','funcionamiento','conexiones','precision','mantenimiento','fallas'];
const development=[
 ['principio','Principio de funcionamiento o fundamento físico','concepto'],
 ['componentes','Componentes, elementos o variables que intervienen','componentes'],
 ['funciones','Función de los componentes o papel de las variables','funcionamiento'],
 ['conexiones','Conexiones o relaciones técnicas entre los elementos','conexiones'],
 ['recorrido','Recorrido del fluido, transformación de energía o evolución del proceso','funcionamiento'],
 ['sistema','Relación con el sistema o aplicación del concepto','conexiones'],
 ['condiciones','Condiciones relevantes y límites de validez','concepto']
];
function requirements(card){
 // PDF questions and diagrams already ask for specific, enumerated points.
 if(card?.pdfTopic||card?.visual)return card.keyPoints.map((label,i)=>({id:'punto-'+i,label,criterion:null}));
 const required=development.map(([id,label,criterion])=>({id,label,criterion}));
 const question=String(card?.bookPrompt||card?.question||'');
 if(/mantenimiento|inspecci[oó]n/i.test(question))required.push({id:'mantenimiento',label:'Mantenimiento solicitado y su justificación',criterion:'mantenimiento'});
 if(/falla|aver[ií]a|corrosi[oó]n|incrustaci[oó]n/i.test(question))required.push({id:'fallas',label:'Fallas o mecanismos de deterioro solicitados y sus consecuencias',criterion:'fallas'});
 return required;
}
const coverageSchema={type:'ARRAY',items:{type:'OBJECT',properties:{id:{type:'STRING'},status:{type:'STRING',enum:['complete','partial','missing']},evidence:{type:'STRING'},reason:{type:'STRING'}},required:['id','status','evidence','reason']}};
const criteriaSchema={type:'ARRAY',items:{type:'OBJECT',properties:{name:{type:'STRING',enum:names},value:{type:'NUMBER'},applicable:{type:'BOOLEAN'},reason:{type:'STRING'}},required:['name','value','applicable','reason']}};
function schemaFor(base){return {...base,properties:{...base.properties,criteria:criteriaSchema,hdpCoverage:coverageSchema},required:[...new Set([...base.required,'criteria','hdpCoverage'])]}}
function context(card){return `CONTRATO DE COBERTURA HDP PARA ESTA PREGUNTA:\n${JSON.stringify(requirements(card))}\nDevolvé hdpCoverage con una entrada por cada id de esta lista. complete: el aspecto se explica correctamente y de forma suficiente; partial: se menciona pero no se desarrolla o sólo se cubre una parte; missing: no se explica o es incorrecto. Para complete o partial incluí en evidence una cita literal de la respuesta ACTUAL del alumno, nunca de la referencia ni del profesor; en imágenes describí sólo lo observable. reason explica la cobertura o lo que faltó. No marques un aspecto completo por inferencia o por sólo nombrarlo. No elimines un aspecto porque el alumno lo omitió. En temas conceptuales evaluá elementos, variables y relaciones físicas, sin inventar piezas ni circuitos inexistentes. La referencia breve contiene mínimos y no sustituye el desarrollo expresamente pedido. Para el PDF o láminas evaluá exclusivamente los puntos enumerados, sin agregar la consigna genérica de otros temas. Mantenimiento y fallas sólo se exigen si están en esta lista. La nota final NO puede superar la fracción de aspectos cubiertos: complete=1, partial=0.5, missing=0; cada aspecto tiene el mismo peso. No se suman multas: se toma el menor valor entre rúbrica y cobertura. La velocidad no cambia esta lista. Explicá las omisiones aunque la terminología usada en la parte respondida sea correcta.`}
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
function grade(answer,{card,text='',hasImage=false}){
 const required=requirements(card),checks=answer.hdpCoverage;
 if(!Array.isArray(checks)||checks.length!==required.length)throw Error('Cobertura HDP incompleta');
 const seen=new Set(),student=normalize(text);
 const coverage=required.map(r=>{
  const matches=checks.filter(c=>c?.id===r.id);if(matches.length!==1||seen.has(r.id))throw Error('Cobertura HDP inválida');seen.add(r.id);
  const c=matches[0];if(!['complete','partial','missing'].includes(c.status)||typeof c.evidence!=='string'||typeof c.reason!=='string')throw Error('Cobertura HDP inválida');
  const evidence=c.evidence.trim().slice(0,600),quote=normalize(evidence);
  if(c.status!=='missing'&&(!quote||(!hasImage&&!student.includes(quote))))throw Error('La evidencia HDP no pertenece a la respuesta');
  return {...r,status:c.status,evidence:c.status==='missing'?'':evidence,reason:c.reason.slice(0,500),credit:c.status==='complete'?1:c.status==='partial'?.5:0};
 });
 const input=new Map((answer.criteria||[]).filter(c=>names.includes(c.name)&&Number.isFinite(c.value)).map(c=>[c.name,c]));
 const mandatory=new Set(['precision',...required.map(r=>r.criterion).filter(Boolean)]);
 if([...mandatory].some(name=>!input.has(name)))throw Error('Rúbrica HDP incompleta');
 answer.criteria=names.map((name,i)=>{
  const original=input.get(name),aspects=coverage.filter(c=>c.criterion===name);
  const ceiling=aspects.length?aspects.reduce((s,c)=>s+c.credit,0)/aspects.length*100:100;
  return {name,value:Math.min(ceiling,Math.max(0,Math.min(100,original?.value||0))),applicable:mandatory.has(name)||((card?.pdfTopic||card?.visual)&&original?.applicable===true),reason:aspects.some(c=>c.credit<1)?aspects.filter(c=>c.credit<1).map(c=>c.label+': '+c.reason).join(' · ').slice(0,500):String(original?.reason||''),weight:weights[i]};
 });
 const applicable=answer.criteria.filter(c=>c.applicable&&c.weight),total=applicable.reduce((s,c)=>s+c.weight,0);
 const rubricScore=total?applicable.reduce((s,c)=>s+c.value*c.weight,0)/total/10:0;
 const earned=coverage.reduce((s,c)=>s+c.credit,0),coverageScore=earned/required.length*10;
 answer.score=Math.round(Math.min(rubricScore,coverageScore)*100)/100;
 answer.hdpCoverage=coverage;
 answer.hdpAssessment={rubricScore:Math.round(rubricScore*100)/100,coverageScore:Math.round(coverageScore*100)/100,earned,total:required.length};
 answer.omissions=coverage.filter(c=>c.credit<1).map(c=>(c.status==='missing'?'No desarrollado: ':'Desarrollo parcial: ')+c.label+'. '+c.reason);
 answer.feedback=(answer.feedback||'')+`\n\nCobertura HDP: ${earned} de ${required.length} aspectos (${coverage.filter(c=>c.status==='complete').length} completos, ${coverage.filter(c=>c.status==='partial').length} parciales, ${coverage.filter(c=>c.status==='missing').length} sin desarrollar). Máximo por cobertura: ${coverageScore.toFixed(2)}/10. Rúbrica: ${rubricScore.toFixed(2)}/10. Se aplica el menor: ${answer.score.toFixed(2)}/10; no se acumulan dos descuentos por la misma omisión.`;
 if(answer.omissions.length)answer.feedback+='\n'+answer.omissions.join('\n');
 return answer;
}
module.exports={requirements,schemaFor,context,grade};
