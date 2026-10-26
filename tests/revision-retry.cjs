const assert=require('node:assert/strict');
const A=require('../dist/server-data/accounts.cjs'),L=require('../dist/server-data/learning.cjs'),P=require('../dist/server-data/question-plan.cjs');
const handler=require('../dist/api/exam.js');
const original={user:A.requireUser,session:A.session,progress:A.progress,cached:L.cached,revise:L.revise,fetch:global.fetch,key:process.env.GEMINI_API_KEY,secret:process.env.SUPABASE_SECRET_KEY};
process.env.GEMINI_API_KEY='test-key';process.env.SUPABASE_SECRET_KEY='test-secret';
(async()=>{
 const plan={...P.createPlan({subject:'termicas',unit:0,scope:'simplificado',speed:'normal'}),sessionId:'session-a',userId:'user-a'};
 const token=P.signPlan(plan,'test-key');
 let saved={transcript:'Respuesta original',score:5,feedback:'Faltan conceptos'},writes=0,calls=0,progressCalls=0;
 A.requireUser=async()=>({user:{id:'user-a'}});A.session=async()=>({status:'active'});
 L.cached=async()=>saved;L.revise=async(plan,user,previous,answer)=>{writes++;saved=structuredClone(answer)};
 A.progress=async()=>{if(++progressCalls===1)throw Error('Se perdió la respuesta después de guardar');return {attempts:1}};
 global.fetch=async()=>{calls++;return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({speech:'Nota revisada',feedback:'Ampliación válida',score:8,sourceIds:[],transcript:'Ampliación',strengths:[],improvements:[]})}]}}]})}};
 const body={action:'revise',subject:'termicas',unit:0,scope:'simplificado',speed:'normal',planToken:token,attemptToken:token,requestId:'retry-request-id-0001',text:'Ampliación'};
 async function call(){const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(b){this.body=b;return this}};await handler({method:'POST',headers:{host:'localhost',origin:'http://localhost'},body},res);return res}
 assert.equal((await call()).statusCode,502);
 assert.equal(writes,1);assert.equal(saved.revisionRequestId,body.requestId);
 const retry=await call();assert.equal(retry.statusCode,200);assert.equal(retry.body.score,8);assert.equal(retry.body.attemptToken,token);
 assert.equal(writes,1,'Una revisión guardada no se vuelve a aplicar');assert.equal(calls,1,'Una respuesta guardada no vuelve a consumir Gemini');
 console.log('OK: reintentar tras perder la respuesta recupera la misma revisión, sin duplicar la nota ni consultar Gemini otra vez.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{
 A.requireUser=original.user;A.session=original.session;A.progress=original.progress;L.cached=original.cached;L.revise=original.revise;global.fetch=original.fetch;
 for(const [name,value]of [['GEMINI_API_KEY',original.key],['SUPABASE_SECRET_KEY',original.secret]])if(value===undefined)delete process.env[name];else process.env[name]=value;
});
