// Audio stays in this worker. Only runtime/model files are downloaded.
let transcriber=null;
self.onmessage=async({data})=>{
 const {id,audio}=data;
 try{
  if(!transcriber){
   self.postMessage({id,status:'loading',message:'Descargando el motor de transcripción…'});
   const {pipeline,env}=await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.1');
   env.allowLocalModels=false;env.backends.onnx.wasm.numThreads=1;
   transcriber=await pipeline('automatic-speech-recognition','Xenova/whisper-tiny',{
    revision:'5332fcc35e32a33b86612b9a57a89be7906102b1',device:'wasm',dtype:'q8',
    progress_callback:p=>{if(p.status==='progress')self.postMessage({id,status:'loading',message:'Descargando motor · '+Math.round(p.progress||0)+'% del archivo actual'})}
   });
  }
  self.postMessage({id,status:'running',message:'Transcribiendo el audio en este dispositivo…'});
  const result=await transcriber(audio,{language:'spanish',task:'transcribe',chunk_length_s:30,stride_length_s:5,return_timestamps:false});
  self.postMessage({id,status:'done',text:String(result.text||'').trim()});
 }catch(e){transcriber=null;self.postMessage({id,status:'error',message:'No se pudo transcribir localmente. Revisá la conexión para descargar el motor, reintentá o escribí la transcripción.'})}
};
