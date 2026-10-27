const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'../dist'),G=require(root+'/server-data/guided-review.cjs');
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname.startsWith('/api/')){
  res.setHeader('Content-Type','application/json');
  if(url.pathname==='/api/study'){let body='';for await(const chunk of req)body+=chunk;const data=JSON.parse(body);res.end(JSON.stringify(G.lesson(data.subject,data.unit)));return}
  res.end(JSON.stringify(url.pathname==='/api/account'?{user:null,profile:null}:{}));return;
 }
 const file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.statusCode=404;res.end();return}
 const type={'.js':'application/javascript','.css':'text/css','.html':'text/html','.json':'application/json','.svg':'image/svg+xml'}[path.extname(file)];if(type)res.setHeader('Content-Type',type);fs.createReadStream(file).pipe(res);
});
(async()=>{await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;try{
 browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:900}});await page.route('https://fonts.googleapis.com/**',r=>r.abort());
 await page.goto('http://127.0.0.1:'+server.address().port+'/#oral');await page.waitForSelector('#guided-content h2');await page.waitForTimeout(300);
 const heights=[];for(const y of [0,350,700,1000,1300,1600]){await page.evaluate(y=>scrollTo(0,y),y);await page.waitForTimeout(120);heights.push(await page.locator('.guided-player').evaluate(e=>e.getBoundingClientRect().height))}
 assert(Math.max(...heights)-Math.min(...heights)<2,'El reproductor no debe cambiar de altura mientras se desplaza');
 await page.evaluate(()=>scrollTo(0,950));await page.waitForTimeout(150);const before=await page.evaluate(()=>scrollY);await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>scrollY),before,'La página permanece donde se dejó');
 await page.evaluate(()=>location.hash='profesor');await page.waitForSelector('#exam-messages');
 const result=await page.evaluate(()=>{
  exam.messages=Array.from({length:12},(_,i)=>({role:'user',text:'Respuesta '+i+' '+('Explicación técnica. '.repeat(40))}));exam.started=true;updateExam();
  const messages=document.querySelector('#exam-messages');messages.style.scrollBehavior='auto';messages.scrollTop=180;const top=messages.scrollTop,child=messages.firstElementChild;
  exam.recording=true;exam.seconds=3;updateExam();const unchanged=messages.firstElementChild===child&&messages.scrollTop===top;
  exam.recording=false;exam.messages.push({role:'user',text:'Una respuesta nueva'});updateExam();const preserved=messages.scrollTop===top;
  messages.scrollTop=messages.scrollHeight;exam.messages.push({role:'user',text:'La última respuesta'});updateExam();
  return {unchanged,preserved,following:Math.abs(messages.scrollHeight-messages.clientHeight-messages.scrollTop)<2};
 });assert(result.unchanged,'El contador no reemplaza ni desplaza los mensajes');assert(result.preserved,'Las actualizaciones conservan una posición anterior');assert(result.following,'Si se estaba al final, sigue el nuevo mensaje');
 console.log('OK navegador: altura estable del reproductor, posición de página, historial durante grabación, lectura anterior y seguimiento al final.');
}finally{await browser?.close();await new Promise(r=>server.close(r))}})().catch(e=>{console.error(e);process.exitCode=1});
