// Two basic criteria, three in Simulacro (+50%), four in HDP (+100%).
// Percentages describe scope of assessment, not a measured psychological difficulty.
const topics=require('./thermal-pdf-topics.json');
const url='https://drive.google.com/file/d/1jQPExdrC_D9CDQJkb0_-Oskt7DrSO9EY/view';
const cards=topics.flatMap(([unit,page,title,labels,answers],topic)=>{
 const prompts=labels.split('|'),points=answers.split('|');
 return [0,1].map(variant=>({id:`mtpdf-${topic}-${variant}`,subject:'termicas',unit,extended:unit>=10,pdfTopic:true,title,variant,
  sources:[{id:`MTPDF-${page}`,title:`Máquinas Térmicas · ${title} · página PDF ${page} (impresa ${page-1})`,url}],
  prompts,points,bookCheck:true}));
});
function adapt(card,level){
 const order=card.variant?[0,1,3,2]:[0,1,2,3];
 const selected=order.slice(0,level==='hdp'?4:3);
 const criteria=selected.map(i=>card.prompts[i]);
 const question=`${level==='hdp'?'Hablame sobre: ':''}${card.title}. ${card.variant?'Analizá y relacioná':'Explicá y justificá'} ${criteria.join(', ')} en una exposición integrada.`;
 const keyPoints=selected.map(i=>card.points[i]);
 return {...card,question,answer:keyPoints.join(' '),keyPoints};
}
module.exports={cards,adapt};
