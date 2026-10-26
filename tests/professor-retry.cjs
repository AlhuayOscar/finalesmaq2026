const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const source=fs.readFileSync(require.resolve('../dist/professor-retry.js'),'utf8');
const timers=new Map();let seq=0;
const context={AbortController,Date,console,setTimeout(fn,ms){const id=++seq;timers.set(id,{fn,ms});return id},clearTimeout(id){timers.delete(id)}};
vm.createContext(context);vm.runInContext(source,context);
async function flush(){for(let i=0;i<20;i++)await Promise.resolve()}
async function nextTimer(){await flush();const next=[...timers].sort((a,b)=>a[1].ms-b[1].ms)[0];assert(next,'Debe quedar un intento programado');timers.delete(next[0]);next[1].fn();await flush();return next[1].ms}
(async()=>{
 let calls=0;const job=context.createProfessorRetry({isCurrent:()=>true});
 const result=job.run(async()=>{if(++calls<=100)throw Error('Saturado');return 'OK'});
 for(let i=0;i<100;i++){const ms=await nextTimer();assert(ms>=2000&&ms<=30000)}
 assert.equal(await result,'OK');assert.equal(calls,101);assert.equal(timers.size,0);
 const waiting=context.createProfessorRetry({isCurrent:()=>true});const waitResult=waiting.run(async()=>{throw Error('Caída')});await flush();assert(waiting.waiting);waiting.cancel();assert.equal(await waitResult,null);assert.equal(timers.size,0);
 const running=context.createProfessorRetry({isCurrent:()=>true});let signal;
 const runningResult=running.run(s=>new Promise((resolve,reject)=>{signal=s;s.addEventListener('abort',()=>reject(Object.assign(Error('Abortado'),{name:'AbortError'})),{once:true})}));
 running.cancel();assert(signal.aborted);assert.equal(await runningResult,null);assert.equal(timers.size,0);
 let current=true,count=0;const stale=context.createProfessorRetry({isCurrent:()=>current});
 const staleResult=stale.run(async()=>{count++;throw Error('Caída')});await flush();current=false;await nextTimer();assert.equal(await staleResult,null);assert.equal(count,1);
 let reply;const late=context.createProfessorRetry({isCurrent:()=>true});const lateResult=late.run(()=>new Promise(resolve=>reply=resolve));late.cancel();reply('respuesta tardía');assert.equal(await lateResult,null);
 let timeoutCalls=0;const timeout=context.createProfessorRetry({isCurrent:()=>true});
 const timed=timeout.run(s=>++timeoutCalls===1?new Promise((resolve,reject)=>s.addEventListener('abort',()=>reject(Object.assign(Error('Timeout'),{name:'AbortError'})),{once:true})):Promise.resolve('recuperado'));
 assert.equal(await nextTimer(),55000);await nextTimer();assert.equal(await timed,'recuperado');assert.equal(timers.size,0);
 // Exercise the actual follow-up UI state and immutable request payload.
 const nodes=new Map([['#exam-followup-text',{value:'Revisá mi ampliación'}],['#exam-followup-send',{textContent:''}],['#exam-revise-send',{textContent:''}],['#exam-followup-status',{textContent:''}]]);
 Object.assign(context,{crypto,maqAccount:{user:{id:'a'}},currentSubject:'frio',depthLabels:{normal:'Normal'},exam:{subject:'frio',messages:[{role:'model',data:{attemptToken:'attempt-a',score:5}}],history:[],depth:'normal',planToken:'plan-a'},document:{querySelector:s=>nodes.get(s)||null,querySelectorAll:()=>[],addEventListener(){}},MutationObserver:class{observe(){}},window:context,updateAccountUI(){}});
 context.updateExam=()=>context.syncFollowupRetryUI();
 vm.runInContext(fs.readFileSync(require.resolve('../dist/followup.js'),'utf8'),context);
 vm.runInContext('selectedReviewIndex=0',context);
 const bodies=[];context.fetch=async(url,options)=>{bodies.push(JSON.parse(options.body));return bodies.length===1?{ok:false,status:503,json:async()=>({error:'Caída'})}:{ok:true,json:async()=>({speech:'Revisión lista',score:8,feedback:'Mejor',sources:[],strengths:[],improvements:[]})}};
 const revision=context.sendExamFollowup('revise');await flush();
 assert.equal(nodes.get('#exam-revise-send').textContent,'Detener reintento');assert.equal(nodes.get('#exam-revise-send').disabled,false);assert.equal(nodes.get('#exam-followup-send').disabled,true);assert.equal(nodes.get('#exam-followup-text').disabled,true);
 await nextTimer();await revision;assert.deepEqual(bodies[0],bodies[1]);assert.equal(context.exam.messages[0].data.score,8);assert.equal(context.exam.messages.length,3);assert.equal(nodes.get('#exam-followup-text').value,'');assert.equal(nodes.get('#exam-revise-send').textContent,'Revisar nota seleccionada');
 nodes.get('#exam-followup-text').value='Consulta que debe conservarse';context.fetch=async()=>({ok:false,json:async()=>({error:'Sin conexión'})});
 const clarify=context.sendExamFollowup('clarify');await flush();await context.sendExamFollowup('clarify');await clarify;
 assert.equal(nodes.get('#exam-followup-text').value,'Consulta que debe conservarse');assert(context.exam.followupStatus.includes('detenido'));assert.equal(context.exam.messages.length,3);assert.equal(timers.size,0);
 console.log('OK: más de 100 reintentos, backoff, cancelación durante espera/petición, timeout, respuestas tardías, cambio de contexto y revisión/consulta sin duplicar mensajes ni perder texto.');
})().catch(e=>{console.error(e);process.exitCode=1});
