const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const P=require('../dist/server-data/question-plan.cjs'),A=require('../dist/server-data/accounts.cjs');
const resolution=require('../dist/api/resolution.js');
const original={key:process.env.GEMINI_API_KEY,user:A.requireUser,fetch:global.fetch};
process.env.GEMINI_API_KEY='test-secret';
const plan={...P.createPlan({unit:0,scope:'simplificado',speed:'normal',subject:'termicas'}),userId:'student-a',sessionId:'test-session'};
const queue=P.reviewQueue(plan,'test-secret');
async function call(body,method='POST',origin='http://localhost'){
 const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(body){this.body=body;return this}};
 await resolution({method,body,headers:{origin,host:'localhost'}},res);return res;
}
(async()=>{
 assert.equal(plan.index,0);
 for(let i=0;i<queue.length;i++){const signed=P.readPlan(queue[i].planToken,'test-secret');assert.equal(signed.index,i);assert.equal(P.current(signed).id,queue[i].id);assert.equal(P.current(signed).answer,queue[i].referenceAnswer)}
 A.requireUser=async()=>({user:{id:'student-a'}});
 let calls=0;global.fetch=async(url,options)=>{calls++;const body=JSON.parse(options.body);assert(body.contents[0].parts[0].text.includes(queue[1].referenceAnswer));assert(body.contents[0].parts[0].text.includes('Respuesta elegida'));return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({resolution:'Devolución de la segunda pregunta.',transcript:''})}]}}]})}};
 assert.equal((await call({},'GET')).statusCode,405);
 assert.equal((await call({planToken:queue[0].planToken},'POST','https://wrong.example')).statusCode,403);
 assert.equal((await call({planToken:queue[0].planToken+'bad'})).statusCode,400);
 A.requireUser=async()=>({user:{id:'other-student'}});
 assert.equal((await call({planToken:queue[0].planToken})).statusCode,403);
 assert.equal(calls,0,'No consultar Gemini para solicitudes inválidas o ajenas');
 A.requireUser=async()=>({user:{id:'student-a'}});
 const expired=P.signPlan({...P.readPlan(queue[1].planToken,'test-secret'),expires:1},'test-secret');
 assert.throws(()=>P.readPlan(expired,'test-secret'));
 const answer=await call({planToken:expired,text:'Respuesta elegida'});
 assert.equal(answer.statusCode,200);assert.equal(answer.body.questionId,queue[1].id);
 global.fetch=async()=>({ok:false,status:503});
 assert.equal((await call({planToken:queue[0].planToken})).statusCode,503);
 const field={value:'Mi respuesta escrita'},nodes=new Map([['exam-text',field],['exam-image',{value:'image'}]]);
 const context={console,Promise,atob,AbortSignal,URL,Blob,setTimeout,clearTimeout,location:{hash:'#test'},currentSubject:'termicas',maqAccount:{user:{id:'student-a'}},navalSubjects:{termicas:{name:'Térmicas'}},exam:{started:true,finished:false,busy:false,recording:false,reviewQueue:queue,reviewItems:[],planToken:queue[0].planToken,planProgress:{limit:2},messages:[],history:[],blob:new Blob(['audio']),image:new Blob(['image']),draft:field.value},examElement:id=>nodes.get(id),clearExamImage(){context.exam.image=null},encodeAudio:async blob=>Buffer.from(await blob.arrayBuffer()).toString('base64'),document:{querySelector(){return null}},updateExam(){},window:null};
 context.window=context;vm.createContext(context);vm.runInContext(fs.readFileSync(require.resolve('../dist/deferred-exam.js'),'utf8'),context);
 context.snapshots=[];vm.runInContext('renderDeferredExam=()=>{};persistDeferredExam=async()=>{snapshots.push(structuredCloneForTest(deferredSnapshot()))}',context);
 context.structuredCloneForTest=structuredClone;
 await vm.runInContext('nextDeferredQuestion()',context);
 assert.equal(context.exam.reviewItems.length,1);assert.equal(context.exam.reviewItems[0].text,'Mi respuesta escrita');assert(context.exam.reviewItems[0].audio.data);assert(context.exam.reviewItems[0].image.data);
 assert.equal(context.exam.planToken,queue[1].planToken);assert.equal(context.exam.deferredMode,true);assert.equal(context.exam.finished,false);assert.equal(field.value,'');
 assert(context.snapshots.some(s=>s.reviewItems[0]?.audio),'Se guarda el audio antes de avanzar');
 field.value='Segunda respuesta';await vm.runInContext('nextDeferredQuestion()',context);
 assert.equal(context.exam.finished,true);assert.equal(context.exam.reviewItems.length,2);
 assert(context.exam.reviewItems.every(i=>i.status==='pending'&&i.score===undefined),'La falla del servidor no genera notas ni penalizaciones');
 let request;context.fetch=async(url,options)=>{request=JSON.parse(options.body);return {ok:false,json:async()=>({error:'Gemini saturado'})}};
 await vm.runInContext('consultDeferredResolution(0)',context);assert.equal(context.exam.reviewItems[0].error,'Gemini saturado');assert.equal(context.exam.reviewItems[0].text,'Mi respuesta escrita');
 context.fetch=async(url,options)=>{request=JSON.parse(options.body);return {ok:true,json:async()=>({questionId:queue[1].id,resolution:'Resolución segunda',transcript:''})}};
 await vm.runInContext('consultDeferredResolution(1)',context);
 assert.equal(request.planToken,queue[1].planToken);assert.equal(request.text,'Segunda respuesta');assert.equal(context.exam.reviewItems[1].resolution,'Resolución segunda');assert.equal(context.exam.reviewItems[0].resolution,undefined);
 // Failed local persistence must keep the draft and the current question intact.
 context.exam.finished=false;context.exam.reviewItems=[];context.exam.planToken=queue[0].planToken;field.value='No perder';
 vm.runInContext("persistDeferredExam=async()=>{throw Error('Sin espacio local')}",context);
 await vm.runInContext('nextDeferredQuestion()',context);
 assert.equal(field.value,'No perder');assert.equal(context.exam.planToken,queue[0].planToken);assert.equal(context.exam.reviewItems.length,0);assert.equal(context.exam.error,'Sin espacio local');
 console.log('OK: cola firmada, aislamiento de cuentas, resolución de preguntas elegidas y vencidas, caída/recuperación de Gemini, guardado de texto/audio/imagen y fallos de almacenamiento.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{A.requireUser=original.user;global.fetch=original.fetch;if(original.key===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=original.key});
