let transcriptionWorker=null,transcriptionJob=null,transcriptionQueue=[];
function newAudioTranscript(){return {id:crypto.randomUUID(),text:'',rawText:'',source:'Whisper local',state:'pending',edited:false,message:'Audio listo para transcribir.'}}
function audioRecordText(record){return String(record?.text||'').trim()}
function audioBlobFromData(audio){const bytes=Uint8Array.from(atob(audio.data),c=>c.charCodeAt(0));return new Blob([bytes],{type:audio.mimeType})}
async function decodeTranscriptionAudio(blob){
 const AudioEngine=window.AudioContext||window.webkitAudioContext;
 if(!AudioEngine||!window.OfflineAudioContext)throw Error('Este navegador no puede preparar el audio. Podés escribir la transcripción manualmente.');
 const context=new AudioEngine();let decoded;
 try{decoded=await context.decodeAudioData(await blob.arrayBuffer())}finally{await context.close()}
 if(!decoded.length||decoded.duration>96)throw Error('Usá un audio de hasta 90 segundos.');
 const offline=new OfflineAudioContext(1,Math.ceil(decoded.duration*16000),16000),source=offline.createBufferSource();source.buffer=decoded;source.connect(offline.destination);source.start();
 return (await offline.startRendering()).getChannelData(0);
}
function transcriptionCurrent(job){return job.exam===exam&&job.owner===maqAccount.user?.id&&job.subject===currentSubject}
function refreshTranscriptionUI(){
 if(!examElement('exam-composer'))return;
 window.renderExamTranscription?.();
 document.querySelectorAll('[data-transcription-status]').forEach(node=>{const record=findAudioRecord(node.dataset.transcriptionStatus);if(record){const text=transcriptionStatus(record);if(node.textContent!==text)node.textContent=text}});
}
function transcriptionStatus(record){return record.edited&&record.text?'Transcripción revisada por vos.':record.state==='ready'?'Transcripción lista · Whisper local.':record.message||'Transcripción pendiente.'}
function findAudioRecord(id){return [exam.recordedTranscript,...(exam.reviewItems||[]).map(i=>i.audioText),...exam.messages.map(m=>m.audioText)].find(r=>r?.id===id)}
function saveTranscription(job){if(transcriptionCurrent(job))Promise.resolve(window.persistDeferredExam?.()).catch(e=>{job.record.message+=' '+e.message})}
function finishTranscriptionJob(job){clearTimeout(job.timeout);if(transcriptionJob===job)transcriptionJob=null;saveTranscription(job);if(transcriptionCurrent(job)){window.renderDeferredExam?.();refreshTranscriptionUI()}pumpTranscriptionQueue()}
async function pumpTranscriptionQueue(){
 if(transcriptionJob)return;
 const job=transcriptionQueue.shift();if(!job)return;
 if(!transcriptionCurrent(job)){job.record.state='cancelled';return pumpTranscriptionQueue()}
 transcriptionJob=job;job.record.state='loading';job.record.message='Preparando el audio para transcribir…';refreshTranscriptionUI();
 try{
  const audio=await decodeTranscriptionAudio(job.blob);
  if(transcriptionJob!==job||!transcriptionCurrent(job))return;
  if(!transcriptionWorker){transcriptionWorker=new Worker('/transcription-worker.js',{type:'module'});
   transcriptionWorker.onmessage=({data})=>{const current=transcriptionJob;if(!current||data.id!==current.record.id||!transcriptionCurrent(current))return;
    if(data.status==='done'){current.record.rawText=data.text;if(!current.record.edited)current.record.text=data.text;current.record.state=data.text?'ready':'error';current.record.message=data.text?'Transcripción lista.':'No se reconoció voz. Podés reintentar o escribir la transcripción.';finishTranscriptionJob(current)}
    else if(data.status==='error'){current.record.state='error';current.record.message=data.message;finishTranscriptionJob(current)}
    else{current.record.state=data.status;current.record.message=data.message;refreshTranscriptionUI()}
   };
   transcriptionWorker.onerror=()=>{const current=transcriptionJob;transcriptionWorker?.terminate();transcriptionWorker=null;if(current){current.record.state='error';current.record.message='No se pudo cargar Whisper. Reintentá o escribí la transcripción.';finishTranscriptionJob(current)}};
  }
  job.timeout=setTimeout(()=>{if(transcriptionJob===job)cancelAudioTranscription(job.record.id,'La transcripción tardó demasiado. Podés reintentar o escribirla.')},300000);
  transcriptionWorker.postMessage({id:job.record.id,audio},[audio.buffer]);
 }catch(e){if(transcriptionJob===job){job.record.state='error';job.record.message=e.message;finishTranscriptionJob(job)}}
}
function queueAudioTranscription(blob,record){
 if(transcriptionJob?.record.id===record.id||transcriptionQueue.some(j=>j.record.id===record.id))return;
 record.state='queued';record.message='Esperando turno para transcribir…';const job={blob,record,exam,owner:maqAccount.user?.id,subject:currentSubject};transcriptionQueue.push(job);saveTranscription(job);pumpTranscriptionQueue();refreshTranscriptionUI();
}
function cancelAudioTranscription(id,message='Transcripción detenida. El audio se conserva.'){
 const waiting=transcriptionQueue.find(j=>j.record.id===id);transcriptionQueue=transcriptionQueue.filter(j=>j.record.id!==id);if(waiting){waiting.record.state='cancelled';waiting.record.message=message;saveTranscription(waiting)}
 const job=transcriptionJob;
 if(job?.record.id===id){transcriptionWorker?.terminate();transcriptionWorker=null;job.record.state='cancelled';job.record.message=message;finishTranscriptionJob(job)}else refreshTranscriptionUI();
}
window.cleanupAudioTranscription=()=>{for(const job of transcriptionQueue){job.record.state='cancelled';job.record.message='Transcripción pendiente; podés retomarla.'}transcriptionQueue=[];if(transcriptionJob)cancelAudioTranscription(transcriptionJob.record.id);transcriptionWorker?.terminate();transcriptionWorker=null};
window.startRecordedTranscription=()=>{const old=exam.recordedTranscript;if(old&&!exam.reviewItems?.some(i=>i.audioText===old))cancelAudioTranscription(old.id);exam.recordedTranscript=newAudioTranscript();queueAudioTranscription(exam.blob,exam.recordedTranscript)};
async function loadRecordedAudio(event){
 const file=event.target.files?.[0];if(!file||exam.busy||exam.recording||!exam.started||exam.finished)return;
 const mime=({'audio/x-wav':'audio/wav','audio/x-m4a':'audio/mp4'})[file.type]||file.type;
 if(!['audio/webm','audio/mp4','audio/ogg','audio/wav','audio/mpeg'].includes(mime)||file.size>2900000){exam.error='Usá un audio WAV, MP3, M4A, OGG o WebM de hasta 2,9 MB y 90 segundos.';event.target.value='';updateExam();return}
 if(exam.blobURL)URL.revokeObjectURL(exam.blobURL);exam.blob=new Blob([file],{type:mime});exam.blobURL=URL.createObjectURL(exam.blob);exam.error='';window.startRecordedTranscription();updateExam();event.target.value='';
}
function renderAudioTranscriptEditor(record){return '<div class="audio-transcript" data-audio-editor="'+record.id+'"><label>Transcripción del audio · podés corregirla<textarea data-audio-transcript="'+record.id+'" maxlength="12000" placeholder="El texto del audio aparecerá acá. También podés escribirlo o corregirlo.">'+esc(record.text||'')+'</textarea></label><p role="status" data-transcription-status="'+record.id+'">'+esc(transcriptionStatus(record))+'</p><button class="secondary" data-transcribe-audio="'+record.id+'">'+(['queued','loading','running'].includes(record.state)?'Detener transcripción':'Transcribir audio sin Gemini')+'</button></div>'}
function bindAudioTranscriptEditors(root){
 root.querySelectorAll('[data-audio-transcript]').forEach(field=>field.oninput=()=>{const record=findAudioRecord(field.dataset.audioTranscript);if(!record)return;record.text=field.value;record.edited=true;Promise.resolve(window.persistDeferredExam?.()).catch(()=>{});refreshTranscriptionUI()});
 root.querySelectorAll('[data-transcribe-audio]').forEach(button=>button.onclick=()=>{const id=button.dataset.transcribeAudio,record=findAudioRecord(id);if(!record)return;if(['queued','loading','running'].includes(record.state)){cancelAudioTranscription(id);window.renderDeferredExam?.();return}
  if(exam.recordedTranscript===record&&exam.blob)queueAudioTranscription(exam.blob,record);else{const item=exam.reviewItems?.find(i=>i.audioText?.id===id&&i.audio);if(item)queueAudioTranscription(audioBlobFromData(item.audio),record)}window.renderDeferredExam?.();
 });
}
window.ensureReviewAudioText=item=>{if(item.audio&&!item.audioText)item.audioText=newAudioTranscript();return item.audioText};
window.renderExamTranscription=()=>{
 const composer=examElement('exam-composer');if(!composer)return;
 let upload=examElement('exam-audio-upload');if(!upload){upload=document.createElement('div');upload.id='exam-audio-upload';upload.innerHTML='<label for="exam-audio-file">O cargar un audio para transcribir</label><input id="exam-audio-file" type="file" accept="audio/webm,audio/mp4,audio/ogg,audio/wav,audio/mpeg,audio/x-wav,audio/x-m4a"><p class="source">Hasta 90 segundos y 2,9 MB. Whisper descarga sus archivos la primera vez; el audio se procesa en tu dispositivo.</p>';composer.querySelector('#record-preview').before(upload);examElement('exam-audio-file').onchange=loadRecordedAudio}examElement('exam-audio-file').disabled=exam.busy||exam.recording||!exam.started||exam.finished;
 let panel=examElement('exam-transcription');if(!panel){panel=document.createElement('section');panel.id='exam-transcription';composer.querySelector('#record-preview').after(panel)}
 const record=exam.recordedTranscript;panel.hidden=!exam.blob||!record;
 if(exam.blob&&record){const field=panel.querySelector('[data-audio-transcript]');if(!field||field.dataset.audioTranscript!==record.id){panel.innerHTML=renderAudioTranscriptEditor(record);bindAudioTranscriptEditors(panel)}else{if(document.activeElement!==field&&field.value!==record.text)field.value=record.text||'';const status=panel.querySelector('[data-transcription-status]');if(status.textContent!==transcriptionStatus(record))status.textContent=transcriptionStatus(record);const button=panel.querySelector('[data-transcribe-audio]');const label=['queued','loading','running'].includes(record.state)?'Detener transcripción':'Transcribir audio sin Gemini';if(button.textContent!==label)button.textContent=label}}
 const busy=transcriptionJob?.exam===exam||transcriptionQueue.some(j=>j.exam===exam);
 const button=examElement('exam-download');if(button){button.disabled=!!busy||!exam.messages.length;button.textContent=busy?'Transcribiendo audio…':'Descargar texto y copiar'}
 window.renderExamExport?.();
};
window.hasActiveTranscriptions=()=>transcriptionJob?.exam===exam||transcriptionQueue.some(j=>j.exam===exam);
window.transcribePendingExamAudio=()=>{for(const item of exam.reviewItems||[])if(item.audio&&!audioRecordText(item.audioText)){window.ensureReviewAudioText(item);queueAudioTranscription(audioBlobFromData(item.audio),item.audioText)}window.renderDeferredExam?.()};
