const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
(async()=>{
 const workers=[];let saved=0;
 const context={crypto,Blob,Uint8Array,Float32Array,atob,setTimeout,clearTimeout,exam:{messages:[],reviewItems:[]},maqAccount:{user:{id:'a'}},currentSubject:'frio',examElement(){return null},document:{querySelectorAll(){return[]}},Worker:class{constructor(){workers.push(this)}postMessage(data){this.sent=data}terminate(){this.stopped=true}},window:null};
 context.window=context;context.persistDeferredExam=async()=>{saved++};context.renderDeferredExam=()=>{};
 vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/exam-transcription.js'),'utf8'),context);vm.runInContext('decodeTranscriptionAudio=async()=>new Float32Array(16000)',context);
 const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve()};
 const record=context.newAudioTranscript(),blob=new Blob(['audio']);context.exam.recordedTranscript=record;
 context.queueAudioTranscription(blob,record);await flush();assert.equal(workers.length,1);assert.equal(workers[0].sent.id,record.id);
 // Advancing to another question must not attach this transcript to the new one.
 context.exam.reviewItems.push({audioText:record,audio:{mimeType:'audio/webm',data:'YXVkaW8='}});context.exam.recordedTranscript=null;
 workers[0].onmessage({data:{id:record.id,status:'done',text:'La bomba impulsa agua.'}});await flush();assert.equal(context.exam.reviewItems[0].audioText.text,'La bomba impulsa agua.');assert.equal(context.exam.recordedTranscript,null);assert(saved>0);
 const edited=context.newAudioTranscript();edited.edited=true;edited.text='Mi corrección manual';context.exam.reviewItems.push({audioText:edited});context.queueAudioTranscription(blob,edited);await flush();workers[0].onmessage({data:{id:edited.id,status:'done',text:'Texto automático'}});await flush();assert.equal(edited.text,'Mi corrección manual');assert.equal(edited.rawText,'Texto automático');
 const cancelled=context.newAudioTranscript();context.queueAudioTranscription(blob,cancelled);await flush();context.cancelAudioTranscription(cancelled.id);assert.equal(cancelled.state,'cancelled');assert(workers[0].stopped);assert.equal(context.hasActiveTranscriptions(),false);
 const failure=context.newAudioTranscript();context.queueAudioTranscription(blob,failure);await flush();workers[1].onmessage({data:{id:failure.id,status:'error',message:'Motor no disponible'}});await flush();assert.equal(failure.state,'error');assert.equal(failure.text,'');
 const other=context.newAudioTranscript();context.queueAudioTranscription(blob,other);await flush();context.maqAccount.user={id:'b'};workers[1].onmessage({data:{id:other.id,status:'done',text:'No debe aparecer en otra cuenta'}});assert.equal(other.text,'');context.cleanupAudioTranscription();
 assert.equal(await context.audioBlobFromData({mimeType:'audio/webm',data:'YXVkaW8='}).text(),'audio');
 console.log('OK: transcripción independiente en worker, asociación al audio correcto al avanzar, correcciones manuales, cancelación, errores y aislamiento por cuenta.');
})().catch(e=>{console.error(e);process.exitCode=1});
