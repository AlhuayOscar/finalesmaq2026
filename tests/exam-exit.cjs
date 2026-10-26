const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const nodes=new Map(),store=new Map(),revoked=[];let requests=0;
const node=id=>{if(!nodes.has(id))nodes.set(id,{value:'',hidden:false,disabled:false,innerHTML:'',textContent:'',scrollHeight:0});return nodes.get(id)};
const context={location:{hash:'#test'},console,units:[],URL:{revokeObjectURL:s=>revoked.push(s)},AbortController,AbortSignal,setTimeout,clearTimeout,setInterval,clearInterval,atob,currentSubject:'termicas',maqAccount:{user:{id:'a'},loading:false},navigator:{},navalSubjects:{termicas:{name:'Máquinas Térmicas',icon:'T'}},coursePractice:{termicas:{basis:'programa'}},app:{innerHTML:''},head:()=>'',progressMarkup:()=>'',esc:s=>String(s),document:{getElementById:node,querySelectorAll:()=>[]},window:null,fetch:async()=>{requests++;throw Error('Salir no debe llamar al servidor')}};
context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(require.resolve('../dist/profesor.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(require.resolve('../dist/deferred-exam.js'),'utf8'),context);
context.memoryStore=async(mode,key,value)=>mode==='readonly'?store.get(key):store.set(key,value);
vm.runInContext('deferredStore=(...args)=>memoryStore(...args);renderDeferredExam=()=>{}',context);
const get=expr=>vm.runInContext(expr,context);
const set=code=>vm.runInContext(code,context);
async function flush(){for(let i=0;i<15;i++)await Promise.resolve()}
(async()=>{
 for(const level of ['acompanado','examen','hdp']){
  set(`exam=createExamState({started:true,level:'${level}',unit:2,scope:'completo',speed:'sobrepensada',planToken:'old',reviewQueue:[{id:'old'}],reviewItems:[{text:'Borrador'}],messages:[],blobURL:'blob:audio',imageURL:'blob:photo',draft:'Borrador'})`);
  store.set('a:termicas',{reviewQueue:[{id:'old'}],started:true});
  await context.exitProfessorExam();
  assert.equal(get('exam.started'),false);assert.equal(get('exam.finished'),false);assert.equal(get('exam.planToken'),null);assert.equal(get('exam.messages.length'),0);assert.equal(get('exam.reviewItems.length'),0);
  assert.equal(get('exam.level'),level);assert.equal(get('exam.unit'),2);assert.equal(get('exam.speed'),'sobrepensada');
  assert.equal(node('exam-unit').disabled,false);assert.equal(node('exam-level').disabled,false);assert.equal(node('exam-scope').disabled,false);assert.equal(node('exam-speed').disabled,false);assert.equal(node('exam-start').disabled,false);
  assert.equal(node('exam-start').textContent,'Comenzar examen');assert.equal(node('exam-exit').hidden,true);assert(context.app.innerHTML.includes('class="exam-exit"'));assert(node('exam-notice').textContent.includes('sin generar una nota final'));
  assert.equal(store.get('a:termicas'),null);await context.restoreDeferredExam('a:termicas');assert.equal(get('exam.started'),false);
 }
 assert(revoked.includes('blob:audio'));assert(revoked.includes('blob:photo'));assert.equal(requests,0,'Salir no manda finish, skip ni answer');
 // A queued snapshot must be cleared after the old write completes.
 set("exam=createExamState({started:true,reviewQueue:[{id:'old'}],planToken:'old'})");
 let releaseWrite;context.memoryStore=(mode,key,value)=>value?new Promise(resolve=>{releaseWrite=()=>{store.set(key,value);resolve()}}):Promise.resolve(store.set(key,value));
 const saving=context.persistDeferredExam();await flush();const exiting=context.exitProfessorExam();assert.equal(get('exam.started'),false);releaseWrite();await saving;await exiting;assert.equal(store.get('a:termicas'),null);
 // A restore which started before exiting may not resurrect the old session.
 let releaseRead;context.memoryStore=(mode,key,value)=>mode==='readonly'?new Promise(resolve=>releaseRead=resolve):Promise.resolve(store.set(key,value));
 set('exam=createExamState({busy:true})');const restoring=context.restoreDeferredExam('a:termicas');await context.exitProfessorExam();
 releaseRead({owner:'a',subject:'termicas',reviewQueue:[{id:'old'}],started:true,reviewItems:[]});await restoring;assert.equal(get('exam.started'),false);
 context.memoryStore=async(mode,key,value)=>mode==='readonly'?store.get(key):store.set(key,value);
 // Ignore a late network success even if the transport disregards abort.
 set("exam=createExamState({started:true,planToken:'old',unit:0,voice:false})");node('exam-text').value='Respuesta pendiente';let reply;
 context.fetch=async()=>{requests++;return new Promise(resolve=>reply=resolve)};
 const pending=context.askExam('answer');await flush();await context.exitProfessorExam();
 set("exam.planToken='new';exam.busy=true;exam.draft='Nuevo borrador'");node('exam-text').value='Nuevo borrador';
 reply({ok:true,json:async()=>({speech:'Tardía',score:0,feedback:'No debe aparecer',evaluated:true,finished:true,planToken:'old-next'})});await pending;
 assert.equal(get('exam.planToken'),'new');assert.equal(get('exam.busy'),true);assert.equal(get('exam.messages.length'),0);assert.equal(node('exam-text').value,'Nuevo borrador');assert.equal(requests,1);
 console.log('OK: salida sin evaluación ni petición, configuraciones liberadas, medios descartados, guardado local eliminado y respuestas/restauraciones tardías ignoradas.');
})().catch(e=>{console.error(e);process.exitCode=1});
