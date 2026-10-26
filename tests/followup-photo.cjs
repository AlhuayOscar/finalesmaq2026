const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const handler=require('../dist/api/exam.js');
const original={key:process.env.GEMINI_API_KEY,secret:process.env.SUPABASE_SECRET_KEY,fetch:global.fetch};
process.env.GEMINI_API_KEY='test-key';delete process.env.SUPABASE_SECRET_KEY;
const photo={mimeType:'image/png',data:'aW1hZ2U=',name:'esquema.png'};
async function call(body){const res={statusCode:200,setHeader(){},status(n){this.statusCode=n;return this},json(b){this.body=b;return this}};await handler({method:'POST',headers:{host:'localhost',origin:'http://localhost'},body},res);return res}
(async()=>{
 const start=await call({action:'start',subject:'frio',unit:0});assert.equal(start.statusCode,200);
 let payload,requests=0;
 global.fetch=async(url,options)=>{requests++;payload=JSON.parse(options.body);return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify({speech:'Identificación orientativa de la foto.',feedback:'',score:0,sourceIds:[],transcript:'',strengths:[],improvements:[]})}]}}]})}};
 const base={action:'clarify',subject:'frio',unit:0,planToken:start.body.planToken};
 const response=await call({...base,image:photo});assert.equal(response.statusCode,200);
 assert.equal(payload.contents[0].parts[1].inlineData.mimeType,'image/png');assert.equal(payload.contents[0].parts[1].inlineData.data,photo.data);
 assert(payload.contents[0].parts[0].text.includes('¿Qué es lo que aparece en esta foto'));
 assert(payload.systemInstruction.parts[0].text.includes('no inventes marcas'));
 assert.equal(response.body.evaluated,false);assert.equal(response.body.score,0);
 const standalone=await call({action:'clarify',subject:'frio',unit:0,image:photo});assert.equal(standalone.statusCode,200);assert.equal(standalone.body.planToken,null);
 const before=requests;
 for(const image of [{...photo,mimeType:'image/svg+xml'},{...photo,data:'<script>'},{...photo,data:'a'.repeat(2800001)}])assert.equal((await call({...base,image})).statusCode,400);
 assert.equal((await call({...base,action:'revise',text:'Revisar',image:photo})).statusCode,400);
 assert.equal(requests,before,'Fotos inválidas no llegan a Gemini');
 const field={value:''},nodes=new Map([['#exam-followup-text',field],['#exam-followup-send',{textContent:''}],['#exam-revise-send',{textContent:''}],['#exam-followup-status',{textContent:''}]]);
 const context={crypto,AbortController,setTimeout,clearTimeout,Date,console,exam:{subject:'frio',messages:[],history:[],followupImage:photo,planToken:'plan',depth:'normal'},maqAccount:{user:{id:'user-a'}},currentSubject:'frio',depthLabels:{normal:'Normal'},document:{querySelector:s=>nodes.get(s)||null,querySelectorAll:()=>[],addEventListener(){}},MutationObserver:class{observe(){}},updateAccountUI(){},encodeAudio:async()=>photo.data,esc:s=>String(s),window:null};context.window=context;vm.createContext(context);
 vm.runInContext(fs.readFileSync(require.resolve('../dist/professor-retry.js'),'utf8'),context);vm.runInContext(fs.readFileSync(require.resolve('../dist/followup.js'),'utf8'),context);context.updateExam=()=>context.syncFollowupRetryUI();
 let sent;context.fetch=async(url,options)=>{sent=JSON.parse(options.body);return {ok:true,json:async()=>({speech:'Es un esquema.',feedback:'',score:0,strengths:[],improvements:[]})}};
 await context.sendExamFollowup('clarify');assert.equal(sent.image.data,photo.data);assert(sent.text.includes('foto'));assert.equal(context.exam.followupImage,null);assert.equal(context.exam.messages[0].image.data,photo.data);
 // Stopping an in-flight request must retain the exact image and typed question.
 field.value='¿Qué componente es?';context.exam.followupImage=photo;
 context.fetch=async(url,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Object.assign(Error('Abortado'),{name:'AbortError'})),{once:true}));
 const pending=context.sendExamFollowup('clarify');await Promise.resolve();await context.sendExamFollowup('clarify');await pending;
 assert.equal(context.exam.followupImage,photo);assert.equal(field.value,'¿Qué componente es?');assert.equal(context.exam.messages.length,2);
 const invalidInput={files:[{type:'image/gif',size:3}],value:'invalid'};await context.loadFollowupPhoto({target:invalidInput});assert.equal(invalidInput.value,'');assert.equal(context.exam.followupImage,photo);
 const input={files:[{type:'image/jpeg',size:20,name:'foto.jpg'}],value:'selected'};await context.loadFollowupPhoto({target:input});assert.equal(context.exam.followupImage.mimeType,'image/jpeg');assert.equal(context.exam.followupImage.name,'foto.jpg');assert.equal(context.exam.followupImage.data,photo.data);
 console.log('OK: foto sola o con consulta, envío multimodal a Gemini, límites, sin cambio de nota, imagen en conversación, cancelación sin perder adjunto y selección de archivo.');
})().catch(e=>{console.error(e);process.exitCode=1}).finally(()=>{global.fetch=original.fetch;for(const [name,value]of [['GEMINI_API_KEY',original.key],['SUPABASE_SECRET_KEY',original.secret]])if(value===undefined)delete process.env[name];else process.env[name]=value});
