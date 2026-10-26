const assert=require('node:assert/strict');
const subjects=require('../dist/server-data/subjects.cjs');
const handler=require('../dist/api/exam.js');
const originalKey=process.env.GEMINI_API_KEY,originalSecret=process.env.SUPABASE_SECRET_KEY,originalFetch=global.fetch;
process.env.GEMINI_API_KEY='test-key';
delete process.env.SUPABASE_SECRET_KEY;
async function call(body,method='POST'){
 const req={method,body,headers:{host:'localhost',origin:'http://localhost'}};
 const res={statusCode:200,setHeader(){},status(code){this.statusCode=code;return this},json(body){this.body=body;return this}};
 await handler(req,res);return res;
}
(async()=>{
 assert.equal((await call({},'GET')).statusCode,405);
 assert.equal((await call({action:'unknown'})).statusCode,400);
 for(const subject of subjects.ids){
  const start=await call({action:'start',subject,unit:-1});
  assert.equal(start.statusCode,200,subject);
  assert(start.body.question.length>0,subject);
  assert(start.body.planToken,subject);
  assert.equal(typeof start.body.speech,'string');
 }
 const start=await call({action:'start',subject:'termicas',unit:-1});
 let upstreamCalls=0;
 global.fetch=async(url,options)=>{
  upstreamCalls++;
  const payload=JSON.parse(options.body);
  assert.equal(payload.generationConfig.responseSchema.type,'OBJECT');
  assert(payload.contents[0].parts[0].text.includes('Explicá'));
  return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({speech:'Una explicación de práctica.',feedback:'',score:0,sourceIds:[],transcript:'',evaluated:false,finished:false,strengths:[],improvements:[]})}]}}]})};
 };
 const followup=await call({action:'clarify',subject:'termicas',unit:-1,planToken:start.body.planToken,text:'Explicá el concepto.'});
 assert.equal(followup.statusCode,200);
 assert.equal(upstreamCalls,1);
 assert.equal(followup.body.speech,'Una explicación de práctica.');
 assert.equal(followup.body.evaluated,false);
 delete process.env.GEMINI_API_KEY;
 assert.equal((await call({action:'start',subject:'termicas',unit:-1})).statusCode,503);
 console.log('OK: carga de API, validación, inicio en las seis materias, consulta con Gemini simulado y configuración ausente.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{
 global.fetch=originalFetch;
 if(originalKey===undefined)delete process.env.GEMINI_API_KEY;else process.env.GEMINI_API_KEY=originalKey;
 if(originalSecret===undefined)delete process.env.SUPABASE_SECRET_KEY;else process.env.SUPABASE_SECRET_KEY=originalSecret;
});
