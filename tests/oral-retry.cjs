const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const timers=new Map();let sequence=0,calls=0;
const field={value:'Mi respuesta técnica'},nodes={'exam-text':field,'exam-image':{value:'foto.png'}};
const context={units:[],console,URL,AbortController,currentSubject:'termicas',maqAccount:{},document:{getElementById:id=>nodes[id]||null},setTimeout(fn,ms){const id=++sequence;timers.set(id,{fn,ms});return id},clearTimeout(id){timers.delete(id)},window:null};context.window=context;
vm.createContext(context);
for(const file of ['professor-retry.js','profesor.js'])vm.runInContext(fs.readFileSync(require.resolve('../dist/'+file),'utf8'),context);
vm.runInContext("updateExam=()=>{};encodeAudio=async()=> 'aW1hZ2U=';exam={...exam,started:true,voice:false,includeVisual:true,planToken:'current',blob:{type:'audio/webm',size:100},image:{type:'image/png',size:100,name:'foto.png'},draft:'Mi respuesta técnica'}",context);
async function flush(){for(let i=0;i<20;i++)await Promise.resolve()}
async function timer(){await flush();const next=[...timers].sort((a,b)=>a[1].ms-b[1].ms)[0];assert(next);timers.delete(next[0]);next[1].fn();await flush();return next[1].ms}
(async()=>{
 const bodies=[];context.fetch=async(url,options)=>{calls++;bodies.push(JSON.parse(options.body));return calls<=100?{ok:false,headers:{get:()=>null},json:async()=>({error:'Servidor caído'})}:{ok:true,json:async()=>({speech:'Devolución',feedback:'Técnica',score:6,finished:false,evaluated:true,planToken:'next',transcript:'Mi respuesta técnica'})}};
 const pending=context.askExam('answer');await flush();assert.equal(calls,1);assert.equal(field.value,'Mi respuesta técnica');assert(vm.runInContext('exam.busy',context));
 for(let i=0;i<100;i++)assert((await timer())>=2000);
 await pending;assert.equal(calls,101);assert.equal(timers.size,0);assert.equal(field.value,'');assert.equal(vm.runInContext('exam.messages.length',context),2);
 for(const body of bodies)assert.deepEqual(body,bodies[0],'Se reenvían el mismo texto, audio, foto y token');
 // Clicking the same answer button stops the wait and preserves the draft.
 field.value='Conservar esta respuesta';context.fetch=async()=>{calls++;return {ok:false,headers:{get:()=> '60'},json:async()=>({error:'Esperá'})}};
 const waiting=context.askExam('answer');await flush();assert.equal([...timers.values()][0].ms,60000,'Se respeta Retry-After');
 const before=calls;await context.askExam('answer');await waiting;assert.equal(calls,before);assert.equal(timers.size,0);assert.equal(field.value,'Conservar esta respuesta');assert.equal(vm.runInContext('exam.busy',context),false);
 // Cancel an active request even if a late response ignores abort.
 let reply;context.fetch=async()=>{calls++;return new Promise(resolve=>reply=resolve)};
 const running=context.askExam('answer');await flush();await context.askExam('answer');reply({ok:true,json:async()=>({speech:'No aplicar',planToken:'late',evaluated:true})});await running;
 assert.equal(vm.runInContext('exam.planToken',context),'next');assert.equal(vm.runInContext('exam.messages.length',context),2);assert.equal(field.value,'Conservar esta respuesta');assert.equal(timers.size,0);
 console.log('OK: 101 intentos sin límite, misma respuesta/adjuntos, Retry-After, cancelación por segundo clic y una sola devolución aplicada.');
})().catch(e=>{console.error(e);process.exitCode=1});
