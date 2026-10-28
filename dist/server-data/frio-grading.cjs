const H=require('./hdp-grading.cjs');
const active=(subject,level)=>subject==='frio'&&['examen','hdp'].includes(level);
function context(card,level){return H.context(card)+`\nFORMATO DE FRÍO: hdpCoverage es un objeto con una propiedad obligatoria por id del contrato, cada una con status, evidence y reason. Una respuesta equivocada o incompleta ES evaluable: usá missing y evidencia vacía para lo incorrecto o ausente; nunca rechaces la respuesta del alumno por sus errores. EXIGENCIA DE FRÍO: ${level==='hdp'?'MUY DIFÍCIL':'DIFÍCIL'}. Cada paso, ramal, componente o transformación solicitado debe explicarse y justificarse. Un criterio con una sola parte omitida es partial, nunca complete. En reason enumerá exactamente los pasos o componentes que faltaron; citá los errores y palabras de más realmente dichas. No otorgues dominio por inferencia ni por nombrar componentes sin explicar sus relaciones. Verificá los símbolos contra la lámina y el texto del libro suministrado. Si la fuente advierte incertidumbre, limitá el criterio a lo comprobable, sin castigar por información ilegible. Simulacro: un desarrollo incompleto no puede superar 6,90/10. HDP: no puede superar 5,90/10 y el desarrollo parcial cuenta 0,25. La velocidad y el alcance simplificado no reducen esta exigencia. No presentes la fuente como una respuesta del alumno.`}
function schemaFor(base,card){
 const schema=H.schemaFor(base),entry={type:"OBJECT",properties:{status:{type:"STRING",enum:["complete","partial","missing"]},evidence:{type:"STRING"},reason:{type:"STRING"}},required:["status","evidence","reason"]};
 const ids=H.requirements(card).map(r=>r.id);schema.properties.hdpCoverage={type:"OBJECT",properties:Object.fromEntries(ids.map(id=>[id,entry])),required:ids};return schema;
}
function grade(answer,options,level){
 if(answer.hdpCoverage&& !Array.isArray(answer.hdpCoverage)&&typeof answer.hdpCoverage==='object')answer.hdpCoverage=Object.entries(answer.hdpCoverage).map(([id,c])=>({...c,id}));
 H.grade(answer,options);
 const coverage=answer.hdpCoverage,partialCredit=level==='hdp'?.25:.5;
 const earned=coverage.reduce((s,c)=>s+(c.status==='complete'?1:c.status==='partial'?partialCredit:0),0),ceiling=earned/coverage.length*10;
 const incomplete=coverage.some(c=>c.status!=='complete'),limit=incomplete?(level==='hdp'?5.9:6.9):10;
 answer.score=Math.round(Math.min(answer.score,ceiling,limit)*100)/100;
 answer.hdpAssessment={...answer.hdpAssessment,earned,coverageScore:Math.round(ceiling*100)/100};
 answer.hdpCoverage=coverage.map(c=>({...c,credit:c.status==='complete'?1:c.status==='partial'?partialCredit:0}));
 answer.frioAssessment={level,earned,total:coverage.length,coverageCeiling:ceiling,incompleteCeiling:limit};
 // Replace the intermediate HDP summary, avoiding contradictory grades in the UI.
 answer.feedback=String(answer.feedback).split('\n\nCobertura HDP:')[0]+`\n\nFrío · ${level==='hdp'?'HDP muy difícil':'Simulacro difícil'}: ${earned} de ${coverage.length} aspectos. Tope por cobertura: ${ceiling.toFixed(2)}/10.${incomplete?' Desarrollo incompleto: máximo '+limit.toFixed(2)+'/10.':''} Nota final: ${answer.score.toFixed(2)}/10.\n`+answer.omissions.join('\n');
 return answer;
}
module.exports={active,context,grade,schemaFor};
