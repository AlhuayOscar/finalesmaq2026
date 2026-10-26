const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

// Model childList deliveries: even assigning the same textContent replaces
// text nodes in the browser and schedules another observer callback.
let pending=false,deliver;
const skip={hidden:false,disabled:false,_text:'',get textContent(){return this._text},set textContent(value){this._text=value;pending=true}};
const exam={messages:[],level:'acompanado',started:false,finished:false,busy:false,recording:false};
let mounted=true;
const context={exam,document:{querySelector(selector){return mounted&&selector==='#exam-skip'?skip:null},querySelectorAll(){return[]},addEventListener(){}},MutationObserver:class{constructor(callback){deliver=callback}observe(){}}};
context.window=context;vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'../dist/followup.js'),'utf8'),context);
function settle(){let count=0;while(pending){assert(++count<10,'El observador debe estabilizarse y permitir al navegador procesar eventos');pending=false;deliver()}return count}
assert.equal(settle(),1);
assert.equal(skip.textContent,'Pasar pregunta · −1 punto');
assert.equal(skip.hidden,true);
exam.level='examen';exam.started=true;exam.messages=[{role:'model',data:{skipPenaltyNext:2}}];
deliver();assert.equal(settle(),1);
assert.equal(skip.textContent,'Pasar pregunta · −2 puntos');
assert.equal(skip.hidden,false);
exam.busy=true;deliver();assert.equal(settle(),0);assert.equal(skip.disabled,true);
exam.busy=false;exam.recording=true;deliver();assert.equal(skip.disabled,true);
exam.recording=false;exam.finished=true;deliver();assert.equal(skip.hidden,true);
mounted=false;deliver();assert.equal(settle(),0);
mounted=true;exam.finished=false;deliver();assert.equal(skip.hidden,false);assert.equal(settle(),0);
console.log('OK: el observador del oral se estabiliza; penalidad, modalidad y estados siguen actualizándose.');
