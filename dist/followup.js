let selectedReviewIndex=null,followupRetry=null;
window.resetFollowupSelection=()=>{selectedReviewIndex=null};
window.followupRetryActive=()=>!!followupRetry;
window.cancelProfessorRetries=()=>{followupRetry?.cancel();window.cancelResolutionRetry?.()};
function mountExamFollowup(){
 const composer=document.querySelector('#exam-composer');
 if(composer&&!document.querySelector('#exam-followup')){const section=document.createElement('section');section.id='exam-followup';section.className='exam-followup';section.innerHTML='<label for="exam-followup-text">Preguntarle algo al profesor o pedir que revise una nota</label><textarea id="exam-followup-text" maxlength="3000" placeholder="¿En qué archivo y sección aparece? ¿Podés mostrarme un esquema? Para revisar una nota, seleccioná primero su devolución."></textarea><div class="exam-composer-actions"><button id="exam-followup-send" class="secondary">Preguntar al profesor</button><button id="exam-revise-send" class="secondary" hidden>Revisar nota seleccionada</button></div><p class="source">Las consultas no cambian la nota. Una revisión compara tu ampliación con la respuesta original y puede subirla o bajarla.</p><p id="exam-followup-status" role="status"></p>';composer.append(section);const field=section.querySelector('#exam-followup-text');field.value=exam.followupDraft||'';field.oninput=()=>{exam.followupDraft=field.value}}
 if(composer&&!document.querySelector('#exam-skip')){const button=document.createElement('button');button.id='exam-skip';button.className='text-button';composer.querySelector('.exam-composer-actions')?.append(button)}
 const skip=document.querySelector('#exam-skip');if(skip){const current=exam.messages.at(-1)?.data;skip.hidden=exam.deferredMode||!['examen','hdp'].includes(exam.level)||!exam.started||exam.finished;skip.disabled=exam.busy||exam.recording;const label=`Pasar pregunta · −${current?.skipPenaltyNext||1} punto${(current?.skipPenaltyNext||1)===1?'':'s'}`;if(skip.textContent!==label)skip.textContent=label}
 const articles=[...document.querySelectorAll('#exam-messages .exam-message.teacher')];const graded=exam.messages.filter(m=>m.role==='model'&&m.data.evaluated&&!m.data.finished);
 graded.forEach((m,i)=>{const article=articles.filter(a=>a.querySelector('.turn-grade'))[i];if(article&&!article.querySelector('[data-review-index]')){const button=document.createElement('button');button.className='text-button review-answer';button.dataset.reviewIndex=String(exam.messages.indexOf(m));button.textContent='Revisar esta nota';article.append(button)}});
 syncFollowupRetryUI();
 const latest=exam.messages.at(-1)?.data;if(latest?.visualUrl){const article=articles.at(-1);if(article&&!article.querySelector('.followup-visual')){const figure=document.createElement('figure');figure.className='visual-hint followup-visual';figure.innerHTML='<a target="_blank" rel="noopener"><img alt="Esquema relacionado con la consulta"></a><figcaption>Esquema relacionado con la devolución; abrilo para ampliarlo.</figcaption>';figure.querySelector('a').href=latest.visualUrl;figure.querySelector('img').src=latest.visualUrl;article.append(figure)}}
}
function syncFollowupRetryUI(){
 const active=followupRetry;
 for(const [id,action,label]of [['exam-followup-send','clarify','Preguntar al profesor'],['exam-revise-send','revise','Revisar nota seleccionada']]){
  const button=document.querySelector('#'+id);if(!button)continue;
  const running=active?.action===action,text=running?'Detener reintento':label;
  if(button.textContent!==text)button.textContent=text;
  button.disabled=!!active&&!running||exam.busy&&!running;if(action==='revise')button.hidden=selectedReviewIndex===null&&!running;
 }
 const field=document.querySelector('#exam-followup-text');if(field)field.disabled=!!active;
 document.querySelectorAll('[data-review-index]').forEach(b=>b.disabled=!!active);
 const status=document.querySelector('#exam-followup-status');
 if(status){const text=active?(active.waiting?active.error+' Reintentando automáticamente · intento '+active.attempt+'. Volvé a tocar el botón para detener.':'Consultando al profesor · intento '+active.attempt+'. Volvé a tocar el botón para detener.'):(exam.followupStatus||'');if(status.textContent!==text)status.textContent=text}
}
async function sendExamFollowup(action){
 if(followupRetry){if(followupRetry.action===action)followupRetry.cancel();return}
 if(exam.busy)return;
 const field=document.querySelector('#exam-followup-text'),text=field?.value.trim()||'';
 if(!text){exam.error='Escribí tu consulta o ampliación.';updateExam();return}
 const target=selectedReviewIndex===null?null:exam.messages[selectedReviewIndex];
 if(action==='revise'&&!target?.data?.attemptToken){exam.error='Seleccioná primero la devolución que querés revisar.';updateExam();return}
 const active=exam,owner=maqAccount.user?.id,subject=currentSubject;
 const isCurrent=()=>exam===active&&maqAccount.user?.id===owner&&currentSubject===subject;
 const prior=[...exam.messages].reverse().find(m=>m.role==='model'&&m.data.evaluated);
 const body={action,subject:exam.subject||currentSubject,unit:exam.unit,level:exam.level,scope:exam.scope,speed:exam.speed,depth:exam.depth,loop:exam.loop,planToken:exam.planToken,attemptToken:target?.data.attemptToken,text,history:exam.history.slice(-12),visualUrl:prior?.data.attemptVisual?.url||null};
 const signature=JSON.stringify(body);if(active.followupRequest?.signature!==signature)active.followupRequest={signature,requestId:crypto.randomUUID()};body.requestId=active.followupRequest.requestId;
 const job=createProfessorRetry({isCurrent,onState:()=>{if(isCurrent())syncFollowupRetryUI()}});job.action=action;followupRetry=job;
 active.busy=true;active.error='';active.followupStatus='';active.followupDraft=text;updateExam();syncFollowupRetryUI();
 try{
  const data=await job.run(async signal=>{const data=await professorRetryJSON('/api/exam',body,signal);if(typeof data.speech!=='string'||!Array.isArray(data.strengths)||!Array.isArray(data.improvements)||(action==='revise'&&!Number.isFinite(data.score)))throw Error('El profesor devolvió una respuesta incompleta.');return data});
  if(!data||!isCurrent()){if(isCurrent())active.followupStatus='Reintento detenido. La consulta sigue disponible.';return}
  data.depthLabel=depthLabels[active.depth];
  if(action==='revise'){target.data.score=data.score;target.data.feedback=data.feedback;target.data.reference=data.reference;target.data.sources=data.sources;selectedReviewIndex=null;data.evaluated=false;data.revision=true;
   const item=active.reviewItems?.find(item=>item.planToken===target.data.attemptToken);if(item){item.score=data.score;item.feedback=data.feedback}
  }
  active.messages.push({role:'user',text:(action==='revise'?'Ampliación para revisar la nota: ':'Consulta al profesor: ')+text});active.history.push({role:'user',text:(action==='revise'?'Ampliación para revisar la nota: ':'Consulta al profesor: ')+text});active.history.push({role:'model',text:data.speech});active.messages.push({role:'model',data});
  active.followupDraft='';active.followupRequest=null;if(field.value.trim()===text)field.value='';active.followupStatus='Consulta recibida.';
  if(data.learningProgress){maqAccount.progress=data.learningProgress;updateAccountUI()}
  try{await window.persistDeferredExam?.()}catch(e){active.followupStatus+=' '+e.message}
 }finally{
  active.busy=false;if(followupRetry===job)followupRetry=null;
  if(isCurrent()){updateExam();syncFollowupRetryUI()}
 }
}
async function skipCurrentExamQuestion(){
 if(exam.busy||!['examen','hdp'].includes(exam.level))return;const field=document.querySelector('#exam-text');if((field?.value.trim()||exam.blob||exam.image)&&!confirm('Vas a descartar el borrador y pasar esta pregunta. ¿Continuar?'))return;
 exam.busy=true;exam.error='';updateExam();try{const response=await fetch('/api/exam',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'skip',subject:exam.subject||currentSubject,unit:exam.unit,level:exam.level,scope:exam.scope,speed:exam.speed,depth:exam.depth,loop:exam.loop,planToken:exam.planToken})});const data=await response.json();if(!response.ok)throw Error(data.error||'No se pudo pasar la pregunta.');data.depthLabel=depthLabels[exam.depth];exam.messages.push({role:'user',text:`Paso la pregunta sin responder (−${data.skipPenalty} punto${data.skipPenalty===1?'':'s'}).`});exam.history.push({role:'user',text:'Paso la pregunta sin responder.'});exam.planToken=data.planToken;exam.planProgress=data.planProgress;exam.messages.push({role:'model',data});exam.history.push({role:'model',text:data.speech});if(field)field.value='';exam.draft='';exam.blob=null;if(exam.blobURL){URL.revokeObjectURL(exam.blobURL);exam.blobURL=null}clearExamImage();const file=document.querySelector('#exam-image');if(file)file.value='';if(data.learningProgress){maqAccount.progress=data.learningProgress;updateAccountUI()}}catch(e){exam.error=e.message||'No se pudo pasar la pregunta.'}finally{exam.busy=false;updateExam()}
}
document.addEventListener('click',e=>{
 const review=e.target.closest('[data-review-index]');if(review&&!followupRetry){selectedReviewIndex=Number(review.dataset.reviewIndex);const revise=document.querySelector('#exam-revise-send');if(revise)revise.hidden=false;const field=document.querySelector('#exam-followup-text');if(field){field.placeholder='Ampliá o corregí tu respuesta; la nota se recalculará con lo que agregues.';field.focus()}}
 if(e.target.closest('#exam-followup-send'))sendExamFollowup('clarify');if(e.target.closest('#exam-revise-send'))sendExamFollowup('revise');if(e.target.closest('#exam-skip'))skipCurrentExamQuestion();
});
const observer=new MutationObserver(mountExamFollowup);observer.observe(document.querySelector('#app'),{childList:true,subtree:true});
mountExamFollowup();
