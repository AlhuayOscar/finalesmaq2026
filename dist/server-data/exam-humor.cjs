const {createHash,randomInt}=require('node:crypto');
const jokes=Object.freeze([
 'Te falta calle, papi.',
 '¿Sos loco vo? Revisá ese concepto.',
 'Al Chiqui Tapia no le gusta esto.',
 'No es perfeeeecto, cabashedo.',
 'Ahí derrapaste como bondi en adoquines.',
 'Te fuiste a la banquina con ese concepto.',
 'Está medio atado con alambre, che.',
 'Bajá un cambio y ordená la explicación.',
 'Pegó en el palo, pero todavía no entró.',
 'Le falta un golpe de horno a esa explicación.'
]);
function addExamJoke(answer,{plan=null,history=[]}={}){
 if(answer.evaluated!==true||!Number.isFinite(answer.score)||answer.score>=7||answer.joke)return answer;
 const recent=history.filter(m=>m.role==='model').slice(-3).map(m=>String(m.text||'')).join('\n');
 const seed=plan?createHash('sha256').update(String(plan.sessionId||plan.ids?.join(',')||'oral')).digest().readUInt32BE(0):randomInt(jokes.length);
 let index=(seed+(plan?.index||0)+((plan?.cycle||1)-1)*(plan?.ids?.length||1))%jokes.length;
 for(let step=0;step<jokes.length&&recent.includes(jokes[index]);step++)index=(index+1)%jokes.length;
 const joke=jokes[index];answer.joke=joke;
 answer.feedback=[answer.feedback,joke].filter(Boolean).join('\n\n');
 if(typeof answer.feedbackSpeech==='string'){
  answer.feedbackSpeech=[answer.feedbackSpeech,joke].filter(Boolean).join(' ');
  answer.speech=[answer.feedbackSpeech,answer.question].filter(Boolean).join('\n\n');
 }else answer.speech=[answer.speech,joke].filter(Boolean).join('\n\n');
 return answer;
}
module.exports={jokes,addExamJoke};
