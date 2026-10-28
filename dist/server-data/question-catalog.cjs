const S=require('./subjects.cjs');
const P=require('./question-plan.cjs');
const pdf=require('./thermal-pdf-bank.cjs');
const {hdpQuestion}=require('./question-wording.cjs');
const speeds=['rapida','normal','sobrepensada'],levels=['estudiar','acompanado','examen','hdp','rhdp'];
function createCatalogue(){
 const banks=['question-bank','course-bank','visual-bank','course-visual-bank'];
 const raw=banks.flatMap(bank=>require('./'+bank+'.json').cards.map(c=>({...c,bank}))).concat(pdf.cards.map(c=>({...c,bank:'thermal-pdf-bank'})),require('./frio-slides.cjs').cards.map(c=>({...c,bank:'frio-slides'})));
 const cards=raw.map(c=>{
  const subject=c.subject||'termicas',modes=c.pdfTopic?['estudiar','examen','hdp','rhdp']:levels;
  const questions=Object.fromEntries(modes.map(level=>[level,Object.fromEntries(speeds.map(speed=>{
   const current=P.current({ids:[c.id],index:0,level,speed});
   const text=current.bookPrompt||current.question;
   return [speed,['hdp','rhdp'].includes(level)?hdpQuestion(text,current):text];
  }))]));
  return {id:c.id,subject,subjectName:S.get(subject).name,unit:c.unit,unitName:S.get(subject).topics[c.unit],bank:c.bank,modes,extended:!!c.extended,visual:c.visual?{title:c.visual.title,url:c.visual.url}:null,topicKey:c.topicKey||c.id,title:c.title||'',variant:c.variant,questions,sources:(c.sources||[]).map(s=>({title:s.title}))};
 });
 return {version:1,subjects:S.ids.map(id=>({id,...S.get(id)})),cards};
}
function auditCatalogue(catalogue=createCatalogue()){
 const normalize=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
 const exact=[];
 for(const level of levels)for(const speed of speeds){
  const groups=new Map();for(const c of catalogue.cards.filter(c=>c.modes.includes(level))){
   const key=c.subject+':'+normalize(c.questions[level][speed]);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(c.id);
  }
  for(const ids of groups.values())if(ids.length>1)exact.push({level,speed,ids});
 }
 const pairs=pdf.cards.filter(c=>c.variant===0).map(c=>({topic:c.title,ids:pdf.cards.filter(v=>v.topicKey===c.topicKey).map(v=>v.id),sameHdpCriteria:true}));
 const thematicOverlaps=[
  {topic:'Economizador',ids:['u1-q6','mtpdf-28-0','mtpdf-28-1'],finding:'Función breve frente a explicación de fluido, fuente térmica, ubicación y consumo.'},
  {topic:'Válvula de seguridad',ids:['u2-q3','mtpdf-22-0','mtpdf-22-1'],finding:'Función breve frente a apertura, recierre y diferencia con regulación.'},
  {topic:'Retención y alimentación',ids:['u4-q2','u12-q3','mtpdf-20-0','mtpdf-20-1'],finding:'Comparten función de retención; las consignas amplias incorporan aislamiento y diferencia de presión.'},
  {topic:'Extracción de condensado',ids:['u4-q4','u12-q1'],finding:'La primera pide la función de la bomba; la segunda contrasta extracción y alimentación.'},
  {topic:'Sobrecalentador',ids:['u2-q2','mtpdf-15-0','mtpdf-15-1'],finding:'Comparten definición y estado; el PDF agrega contraste con economizador.'}
 ];
 return {totalCards:catalogue.cards.length,bySubject:catalogue.subjects.map(s=>({subject:s.id,name:s.name,count:catalogue.cards.filter(c=>c.subject===s.id).length})),exactDuplicates:exact,pdfRedundantPairs:pairs,thematicOverlaps,notes:['Las velocidades y modalidades son presentaciones de las mismas tarjetas; no se cuentan como temas independientes.','Las 45 parejas PDF evalúan los mismos cuatro puntos en HDP; Simulacro comparte dos de tres puntos. El plan nuevo elige una variante por tema.','El banco base y el apunte también comparten conceptos: economizador, válvula de seguridad, tipos de caldera, vapor y alimentación. Coincidencia temática no implica una consigna idéntica.','Un ID aparece una vez por vuelta. En modo bucle se vuelve a recorrer el plan al agotar la vuelta; un examen nuevo puede volver a seleccionar temas.','La detección literal es automática. El hallazgo sobre parejas PDF se verifica comparando sus criterios; no es una revisión pedagógica exhaustiva de cada solapamiento entre fuentes.']};
}
module.exports={createCatalogue,auditCatalogue};
