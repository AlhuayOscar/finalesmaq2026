// Responses awaiting a resolution live only on this device, per account/subject.
let deferredDB=null,deferredWrites=Promise.resolve(),deferredLoading='',deferredLoaded='',resolutionBusy=false,resolutionRetry=null;
const deferredKey=()=>maqAccount.user?.id?maqAccount.user.id+':'+currentSubject:null;
function openDeferredDB(){return deferredDB||(deferredDB=new Promise((resolve,reject)=>{const r=indexedDB.open('naval-pending-exams-v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('exams');r.onsuccess=()=>resolve(r.result);r.onerror=()=>{deferredDB=null;reject(Error('No se pudo abrir el guardado local.'))}}))}
async function deferredStore(mode,key,value){const db=await openDeferredDB();return new Promise((resolve,reject)=>{const tx=db.transaction('exams',mode),store=tx.objectStore('exams');const r=mode==='readonly'?store.get(key):store.put(value,key);tx.oncomplete=()=>resolve(r.result);tx.onerror=()=>reject(Error('No se pudo guardar en este dispositivo. Descargá una copia antes de salir.'));tx.onabort=tx.onerror})}
function deferredSnapshot(){return {subject:currentSubject,owner:maqAccount.user.id,unit:exam.unit,level:exam.level,depth:exam.depth,scope:exam.scope,speed:exam.speed,includeVisual:exam.includeVisual,loop:exam.loop,voice:exam.voice,reviewQueue:exam.reviewQueue,reviewItems:exam.reviewItems||[],deferredMode:!!exam.deferredMode,planToken:exam.planToken,planProgress:exam.planProgress,messages:exam.messages,history:exam.history,recordedAudio:exam.blob||null,recordedTranscript:exam.recordedTranscript||null,started:exam.started,finished:exam.finished,followupImage:exam.followupImage||null,followupDraft:exam.followupDraft||'',followupRequest:exam.followupRequest||null,draft:examElement('exam-text')?.value||exam.draft||''}}
window.cancelResolutionRetry=()=>resolutionRetry?.cancel();
function persistDeferredExam(){const key=deferredKey();if(!key||!exam.reviewQueue)return Promise.resolve();const snapshot=deferredSnapshot();const write=deferredWrites.catch(()=>{}).then(()=>deferredStore('readwrite',key,snapshot));deferredWrites=write;return write}
window.deferredOwnerChanged=()=>{deferredLoaded='';deferredLoading=''};
window.clearDeferredExam=()=>{window.resetFollowupSelection?.();exam.recordedAudio=null;exam.recordedTranscript=null;exam.exportStatus='';exam.followupImage=null;exam.followupImageLoading=false;exam.followupDraft='';exam.followupStatus='';exam.followupRequest=null;exam.reviewQueue=null;exam.reviewItems=[];exam.deferredMode=false;exam.resolutionError='';deferredLoaded=deferredKey()||''};
function queuePosition(token=exam.planToken){try{const data=JSON.parse(atob(token.split('.')[0].replace(/-/g,'+').replace(/_/g,'/')));return data.index}catch{return -1}}
function currentQueuedQuestion(){return exam.reviewQueue?.[queuePosition()]}
window.acceptDeferredResult=(action,data,sent)=>{
 if(action==='start'){exam.reviewQueue=data.reviewQueue||null;exam.reviewItems=[];exam.deferredMode=false;deferredLoaded=deferredKey()||''}
 if(action==='answer'&&data.evaluated&&exam.reviewQueue){const q=exam.reviewQueue[queuePosition(sent.planToken)];if(q){exam.reviewItems||=[];exam.reviewItems.push({...q,planToken:sent.planToken,text:sent.text,audio:sent.audio,image:sent.image,audioText:sent.audioText,transcript:data.transcript||'',status:'evaluated',feedback:data.feedback,score:data.score})}}
 // The caller applies the result first; snapshot after its synchronous updates.
 Promise.resolve().then(()=>persistDeferredExam()).catch(e=>{exam.resolutionError=e.message;renderDeferredExam()});
};
function queuedMessage(q){const question=exam.level==='hdp'&&!q.question.startsWith('Hablame sobre: ')?'Hablame sobre: '+q.question:q.question;return {role:'model',data:{question,speech:question,visual:q.visual,feedback:'',feedbackSpeech:'',strengths:[],improvements:[],sources:q.sources,omissions:[],criteria:[],evaluated:false,finished:false}}}
async function retainCurrentAnswer(){
 const active=exam,key=deferredKey(),q=currentQueuedQuestion();if(!q)throw Error('No se cargaron las preguntas para continuar. Reintentá comenzar el examen.');
 const text=examElement('exam-text')?.value.trim()||exam.draft||'',blob=exam.blob,file=exam.image,token=exam.planToken;
 const audio=blob?{mimeType:blob.type.split(';')[0],data:await encodeAudio(blob)}:null;
 const image=file?{mimeType:file.type,data:await encodeAudio(file)}:null;
 if(active!==exam||key!==deferredKey())throw Error('La cuenta o materia cambió.');
 const item={...q,planToken:token,text,audio,image,audioText:active.recordedTranscript,status:'pending'};active.reviewItems||=[];
 const last=active.reviewItems.at(-1),replace=last?.planToken===token&&last.status==='pending';
 if(replace)active.reviewItems[active.reviewItems.length-1]=item;else active.reviewItems.push(item);
 try{await persistDeferredExam()}catch(e){if(replace)active.reviewItems[active.reviewItems.length-1]=last;else active.reviewItems.pop();throw e}return item;
}
function clearDeferredDraft(){exam.recordedTranscript=null;exam.draft='';if(examElement('exam-text'))examElement('exam-text').value='';if(exam.blobURL)URL.revokeObjectURL(exam.blobURL);exam.blob=null;exam.blobURL=null;clearExamImage();if(examElement('exam-image'))examElement('exam-image').value=''}
async function nextDeferredQuestion(finish=false){
 if(exam.recording||resolutionBusy||window.followupRetryActive?.()||!exam.started||exam.finished||exam.advancing)return;
 const active=exam,key=deferredKey(),token=exam.planToken;exam.advancing=true;
 try{
  if(exam.busy){examAbort?.abort();await window.examRequest;if(active!==exam||key!==deferredKey()||exam.planToken!==token)return}
  window.speechSynthesis?.cancel();
  const item=await retainCurrentAnswer();if(active!==exam||key!==deferredKey())return;
  exam.deferredMode=true;exam.error='';exam.resolutionError='';
  exam.messages.push({role:'user',text:item.text||(item.audio?'[Respuesta de audio guardada para consultar]':item.image?'[Imagen guardada para consultar]':'[Sin respuesta; pendiente de repaso]'),writtenText:item.text,hadAudio:!!item.audio,audioText:item.audioText});
  const index=queuePosition()+1,limit=exam.loop?exam.reviewQueue.length:Math.min(exam.reviewQueue.length,exam.planProgress?.limit||exam.reviewQueue.length);
  clearDeferredDraft();
  if(finish||(!exam.loop&&index>=limit)){exam.finished=true}
  else{const q=exam.reviewQueue[index%exam.reviewQueue.length];exam.planToken=q.planToken;exam.planProgress={...exam.planProgress,position:q.position};exam.messages.push(queuedMessage(q))}
  await persistDeferredExam();
 }catch(e){if(active===exam&&key===deferredKey())exam.error=e.message}finally{if(active===exam){exam.advancing=false;updateExam()}}
}
function finishDeferredExam(){return nextDeferredQuestion(true)}
function referenceHTML(item){return '<div class="deferred-reference"><strong>Resolución preparada · sin IA</strong><p>'+esc(item.referenceAnswer||'No hay una referencia disponible.')+'</p><p class="source">'+esc((item.sources||[]).map(s=>s.title).join(' · '))+'</p></div>'}
async function consultDeferredResolution(index){
 const item=exam.reviewItems?.[index];if(!item)return;
 if(resolutionRetry){if(resolutionRetry.item===item)resolutionRetry.cancel();return}
 if(resolutionBusy||exam.busy||exam.advancing)return;
 const active=exam,key=deferredKey(),isCurrent=()=>active===exam&&key===deferredKey();
 const body={planToken:item.planToken,text:item.text,audio:item.audio,image:item.image};
 const job=createProfessorRetry({isCurrent,onState:()=>{if(isCurrent()){item.retryAttempt=job.attempt;item.error=job.waiting?job.error+' Reintentando automáticamente. Volvé a tocar el botón para detener.':'';renderDeferredExam()}}});
 job.item=item;resolutionRetry=job;resolutionBusy=true;active.busy=true;item.consulting=true;item.error='';updateExam();
 try{
  const data=await job.run(async signal=>{const data=await professorRetryJSON('/api/resolution',body,signal);if(typeof data.resolution!=='string'||!data.resolution.trim()||data.questionId!==item.id)throw Error('La resolución no corresponde a esta pregunta.');return data});
  if(!data||!isCurrent()){if(isCurrent())item.error='Reintento detenido. Tu respuesta sigue guardada.';return}
  item.resolution=data.resolution;item.transcript=data.transcript;item.showReference=true;item.status=item.status==='evaluated'?'evaluated':'resolved';item.error='';
  try{await persistDeferredExam()}catch(e){item.error=e.message}
 }finally{
  active.busy=false;item.consulting=false;item.retryAttempt=0;
  if(resolutionRetry===job){resolutionRetry=null;resolutionBusy=false}
  if(isCurrent())updateExam();
 }
}
async function restoreDeferredExam(key){
 deferredLoading=key;
 try{const saved=await deferredStore('readonly',key);if(key!==deferredKey()||exam.started)return;deferredLoaded=key;if(saved?.reviewQueue?.length&&saved.owner===maqAccount.user.id&&saved.subject===currentSubject){saved.reviewItems=(saved.reviewItems||[]).map(item=>({...item,consulting:false}));for(const item of saved.reviewItems)if(item.audioText&&['queued','loading','running'].includes(item.audioText.state)){item.audioText.state='cancelled';item.audioText.message='Transcripción pendiente; podés retomarla.'}if(saved.recordedTranscript&&['queued','loading','running'].includes(saved.recordedTranscript.state)){saved.recordedTranscript.state='cancelled';saved.recordedTranscript.message='Transcripción pendiente; podés retomarla.'}exam={...exam,...saved,followupImageLoading:false,busy:false,recording:false,retrying:false,advancing:false,error:'',blob:saved.recordedAudio||null,blobURL:saved.recordedAudio?URL.createObjectURL(saved.recordedAudio):null,image:null,imageURL:null};renderProfessor()}}
 catch(e){if(key===deferredKey())exam.resolutionError=e.message}finally{if(deferredLoading===key)deferredLoading=''}
}
function renderDeferredExam(){
 const composer=examElement('exam-composer');if(!composer)return;
 const key=deferredKey();if(key&&!maqAccount.loading&&deferredLoaded!==key&&deferredLoading!==key&&!exam.started)restoreDeferredExam(key);
 let controls=examElement('deferred-controls');if(!controls){controls=document.createElement('section');controls.id='deferred-controls';composer.append(controls)}
 const available=exam.started&&!exam.finished&&!!exam.reviewQueue?.length;
 controls.innerHTML=(available?'<button id="exam-defer-next" class="secondary" '+(exam.recording||exam.advancing||resolutionBusy||window.followupRetryActive?.()?'disabled':'')+'>Guardar y pasar a la siguiente pregunta</button><button id="exam-defer-finish" class="text-button" '+(exam.recording||exam.advancing||resolutionBusy||window.followupRetryActive?.()?'disabled':'')+'>Guardar y finalizar para revisar</button><p class="source">Si Gemini no responde, seguí sin esperar. Las respuestas quedan pendientes en este dispositivo, sin descuento ni nota automática. Se guardan también el audio y las imágenes de cada pregunta.</p>':'')+(exam.resolutionError?'<p role="alert">'+esc(exam.resolutionError)+'</p>':'');
 if(available){examElement('exam-defer-next').onclick=()=>nextDeferredQuestion();examElement('exam-defer-finish').onclick=()=>finishDeferredExam()}
 if(exam.deferredMode){examElement('exam-send').textContent='Guardar respuesta y seguir →';examElement('exam-finish').textContent='Finalizar y revisar';examElement('exam-state').textContent=exam.finished?'Examen finalizado · resoluciones por revisar':'Respuesta pendiente · podés seguir sin Gemini';document.querySelector('#exam-skip')?.setAttribute('hidden','');document.querySelectorAll('[data-hint-index]').forEach(b=>b.hidden=true)}
 let panel=examElement('deferred-review');if(!panel){panel=document.createElement('section');panel.id='deferred-review';panel.className='deferred-review';composer.after(panel)}
 const items=exam.reviewItems||[];items.forEach(item=>window.ensureReviewAudioText?.(item));panel.hidden=!items.length;if(!items.length)return;
 panel.innerHTML='<h3>Revisar las preguntas del examen</h3><p class="source">Elegí qué respuesta revisar. La referencia preparada funciona sin Gemini. «Consultar resolución» envía únicamente esa pregunta y tu respuesta a Gemini; no modifica notas ni progreso. Si falla, reintenta hasta recibir respuesta; volvé a tocar el mismo botón para detener.</p>'+items.map((item,i)=>'<details '+(item.open?'open':'')+' data-deferred-detail="'+i+'"><summary>Pregunta '+(i+1)+' · '+esc(item.question)+' <span class="tag">'+(item.status==='evaluated'?'Evaluada · '+Number(item.score).toFixed(2)+'/10':item.status==='resolved'?'Resolución consultada':'Pendiente · sin nota')+'</span></summary><p><strong>Tu respuesta</strong></p><p>'+esc(item.text||'Sin respuesta escrita')+'</p>'+(item.audio?'<audio controls aria-label="Tu respuesta grabada" src="data:'+esc(item.audio.mimeType)+';base64,'+item.audio.data+'"></audio>':'')+(item.image?'<img class="deferred-image" alt="Tu imagen para esta pregunta" src="data:'+esc(item.image.mimeType)+';base64,'+item.image.data+'">':'')+(item.audioText&&window.renderAudioTranscriptEditor?renderAudioTranscriptEditor(item.audioText):'')+(item.transcript?'<p><strong>Transcripción de Gemini:</strong> '+esc(item.transcript)+'</p>':'')+(item.feedback?'<p><strong>Devolución del examen:</strong> '+esc(item.feedback)+'</p>':'')+'<div class="actions"><button class="secondary" data-deferred-reference="'+i+'">'+(item.showReference?'Ocultar referencia preparada':'Ver referencia preparada')+'</button><button data-deferred-consult="'+i+'" '+((resolutionBusy||exam.busy||exam.advancing)&&!item.consulting?'disabled':'')+'>'+(item.consulting?'Detener reintento · intento '+(item.retryAttempt||1):item.resolution?'Volver a consultar resolución':'Consultar resolución')+'</button></div>'+(item.error?'<p class="exam-error" role="alert">'+esc(item.error)+'</p>':'')+(item.showReference?referenceHTML(item):'')+(item.resolution?'<div class="deferred-resolution"><strong>Resolución de Gemini · orientativa</strong><p>'+esc(item.resolution)+'</p></div>':'')+'</details>').join('');
 panel.querySelectorAll('[data-deferred-detail]').forEach(d=>d.ontoggle=()=>{items[+d.dataset.deferredDetail].open=d.open});
 panel.querySelectorAll('[data-deferred-reference]').forEach(b=>b.onclick=()=>{const item=items[+b.dataset.deferredReference];item.showReference=!item.showReference;item.open=true;renderDeferredExam()});
 panel.querySelectorAll('[data-deferred-consult]').forEach(b=>b.onclick=()=>{items[+b.dataset.deferredConsult].open=true;consultDeferredResolution(+b.dataset.deferredConsult)});window.bindAudioTranscriptEditors?.(panel);
}
function downloadDeferredExam(){return window.downloadExamText()}
window.persistDeferredExam=persistDeferredExam;
window.renderDeferredExam=renderDeferredExam;
if(location.hash==='#profesor')updateExam();
