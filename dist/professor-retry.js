// One cancellable request at a time per job; retries have no attempt limit.
function createProfessorRetry({isCurrent,onState=()=>{}}){
 const job={attempt:0,error:'',waiting:false,cancelled:false,controller:null,timer:null,wake:null};
 job.cancel=()=>{job.cancelled=true;job.controller?.abort();clearTimeout(job.timer);job.wake?.();job.wake=null};
 job.run=async request=>{
  let delay=2000;
  while(!job.cancelled&&isCurrent()){
   job.attempt++;job.waiting=false;job.controller=new AbortController();onState(job);
   const timeout=setTimeout(()=>job.controller?.abort(),55000);
   try{
    const result=await request(job.controller.signal);
    if(job.cancelled||!isCurrent())return null;
    return result;
   }catch(e){
    if(job.cancelled||!isCurrent())return null;
    job.error=e.name==='AbortError'||e.name==='TimeoutError'?'El profesor tardó demasiado.':e.message||'No se pudo conectar con el profesor.';
    job.waiting=true;onState(job);
    // Respect server throttling without a tight retry loop.
    const wait=Math.max(delay,Math.min(120000,Number(e.retryAfter)||0));
    clearTimeout(timeout);
    await new Promise(resolve=>{job.wake=resolve;job.timer=setTimeout(resolve,wait)});
    job.wake=null;job.timer=null;delay=Math.min(30000,Math.round(delay*1.7));
   }finally{clearTimeout(timeout)}
  }
  return null;
 };
 return job;
}
async function professorRetryJSON(url,body,signal){
 const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify(body),signal});
 let data;try{data=await response.json()}catch{throw Error('El servidor no devolvió una respuesta válida.')}
 if(!response.ok){const error=Error(data.error||'No se pudo consultar al profesor.');const retryAfter=response.headers?.get('Retry-After');error.retryAfter=/^\d+$/.test(retryAfter||'')?Number(retryAfter)*1000:Math.max(0,Date.parse(retryAfter)-Date.now())||0;throw error}
 return data;
}
