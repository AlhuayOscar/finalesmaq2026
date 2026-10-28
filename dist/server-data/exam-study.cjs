const P=require('./question-plan.cjs'),G=require('./guided-review.cjs');
const explanations=require('./study-explanation.cjs');
function figures(card,subject){
 if(card.slideNumber)return [{image:card.visual.url,title:card.visual.title,alt:card.visual.title,source:card.sources[0].title,url:card.sources[0].url,page:card.visual.pdfPage}];
 if(subject!=='termicas')return [];
 const catalogue=require('./thermal-source-figures.json');
 if(card.pdfTopic){
  // Reviewed topic-to-original mappings. Empty entries have no verified figure.
  const keys=[['estados'],['sobrecalentador'],['transferencia'],['transferencia'],[],['pirotubular','circulacion'],['circulacion'],[],['tipo-a'],['tipo-m'],['tipo-d'],[],['domo'],['domo'],['separador'],['sobrecalentador'],['atemperador'],[],['hollin'],['comunicacion'],['retencion'],['purga'],['seguridad'],['venteo'],['manometro','nivel'],[],['control-nivel'],['aire'],['economizador'],['aire','quemador'],['quemador'],['combustible'],['ciclo','desaireador'],['nivel'],[],['tobera','etapas'],['tobera'],['velocidades'],['tobera'],['etapas'],['velocidades'],['etapas'],['etapas'],['aceite','regulador'],[]];
  const topic=Number(card.topicKey.split('-')[1]);return (keys[topic]||[]).map(key=>catalogue[key]);
 }
 if(card.visual){const key={'simple':'circulacion','tipo-d':'tipo-d','tipo-a':'tipo-a','tipo-m':'tipo-m','humotubular':'pirotubular','alimentacion':'ciclo'}[card.visual.id];const figure=require('./thermal-source-figures.json')[key];return figure?[figure]:[];}
 const lesson=G.lesson(subject,card.unit),match=card.id.match(/^u\d+-q(\d+)$/);
 const section=match?lesson?.sections.find(s=>s.id==='concepto-'+match[1]):null;
 // Only exact concept mappings are used; unrelated figures are never substituted.
 const f=section?.studyVisual?.sourceFigure;return f?[f]:[];
}
async function present(plan,key){
 const card=P.current(plan),originals=figures(card,plan.subject),result=P.initial(plan,key);
 result.planProgress.limit=result.planProgress.total;
 if(card.visual&&!card.slideNumber)result.question='Explicá '+card.visual.title+': sus elementos, su función y las relaciones entre ellos.';
 let answer=card.answer,sections=[],components=[],componentsUnavailableReason='';
 if(card.referenceOnly){const resolved=await explanations.generate(card,result.question,key);answer=resolved.answer;sections=resolved.sections;components=resolved.components;componentsUnavailableReason=resolved.componentsUnavailableReason;}
 else if(card.visual){components=explanations.preparedComponents(card);answer='La consigna pide identificar los elementos y explicar su función. Estas son las funciones de cada parte solicitada; la numeración de la figura original puede ser diferente a la del ejercicio.';}
 const spoken=[result.question,answer,...components.map(c=>c.name+': '+c.function+(c.connection?' '+c.connection:'')),...sections.map(s=>s.title+'\n'+s.answer),componentsUnavailableReason].filter(Boolean).join('\n\n');
 return {...result,study:true,studyAnswer:answer,studySections:sections,studyComponents:components,componentsUnavailableReason,sourceFigures:originals,visual:null,speech:spoken,studyNotice:originals.length?'Figura original del material; las funciones y la resolución están explicadas arriba.':'No hay una figura original verificada para esta pregunta. Consultá el apunte enlazado; no se reemplaza por un dibujo inventado.',sources:card.sources,finished:false};
}
module.exports={figures,present};
