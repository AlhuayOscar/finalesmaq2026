const assert=require('node:assert/strict'),fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.join(__dirname,'../dist'),nodes=new Map(),classes=new Set();
const noop=()=>{},ctx=new Proxy({},{get:(t,k)=>t[k]||noop,set:(t,k,v)=>(t[k]=v,true)});
function node(id){if(!nodes.has(id))nodes.set(id,{style:{},innerHTML:'',textContent:'',value:'',addEventListener:noop,setAttribute:noop,focus:noop,getContext:()=>ctx,getBoundingClientRect:()=>({width:760,height:600}),isConnected:true});return nodes.get(id)}
const c=vm.createContext({console,Set,Math,window:{addEventListener:noop},location:{hash:'#taller'},document:{body:{classList:{add:x=>classes.add(x),remove:x=>classes.delete(x)}},querySelector:node,querySelectorAll:()=>[]},devicePixelRatio:1,requestAnimationFrame:()=>1,cancelAnimationFrame:noop,render:noop,model:'D',mode:'explore',selected:'upper',placed:new Set(),explode:0,flow:true,app:{innerHTML:''},types:{simple:{name:'Simple'},A:{name:'A'},M:{name:'M'},D:{name:'D'}},sources:{book:'https://example.org'},esc:s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;')});
for(const f of ['boiler-data.js','boiler-systems.js','boiler-geometry.js','boiler-system-ui.js','boiler-practice.js','model.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
const run=s=>vm.runInContext(s,c);
for(const type of ['simple','A','M','D'])for(const kind of ['mixed','number','description','fault'])for(let i=0;i<12;i++){
 const deck=run(`practiceDeck('${type}','${kind}',6)`);assert.equal(deck.length,6);assert.equal(new Set(deck.map(q=>q.key)).size,6);
 if(kind==='mixed')assert.deepEqual([...new Set(deck.map(q=>q.kind))].sort(),['description','fault','number']);
 for(const q of deck){c.q=q;const ids=run(`[...boilerIds('${type}'),...boilerLayerIds(q.layers)]`);if(q.kind==='fault'){
  assert(q.targets.every(id=>ids.includes(id)));assert.equal(q.fields.length,4);for(const f of q.fields){assert.equal(f.choices.length,4);assert.equal(f.choices.filter(x=>x===f.correct).length,1)}
  assert.equal(run('practiceGrade(q,new Set(q.targets),{}).score'),20);
  assert.equal(run('practiceGrade(q,new Set(q.targets),Object.fromEntries(q.fields.map(f=>[f.id,f.correct]))).score'),100);
  assert(run('practiceGrade(q,new Set([...q.targets,"wrong"]),Object.fromEntries(q.fields.map(f=>[f.id,f.correct]))).score')<100);
 }else{assert(ids.includes(q.id));assert.equal(new Set(q.choices).size,4);assert.equal(run('practiceGrade(q,new Set([q.id]),{}).score'),100)}
 assert.equal(run('practiceGrade(q,new Set(),{}).score'),0);
 }
}
run('activeBoilerLayers=new Set(["water"]);activeBoilerFault="sludge";yaw=.7;zoom=1.3;cutaway=false;window.startBoilerPractice("A")');
assert(classes.has('boiler-practice-zen'));assert(c.app.innerHTML.includes('practice-start'));
for(const kind of ['number','description','fault']){
 run(`practiceBegin('D','${kind}')`);assert(!c.app.innerHTML.includes('part-detail'));assert(!c.app.innerHTML.includes('practice-feedback'));assert(!c.app.innerHTML.includes('Te faltó:'));
 if(kind==='number'){run('practicePartSelected(practiceCurrent().id)');assert.equal(run('boilerPractice.picks.size'),0)}
 else{run('practicePartSelected("upper")');assert.equal(run('boilerPractice.picks.has("upper")'),true)}
 run('practiceSubmit();practiceSubmit()');assert.equal(run('boilerPractice.results.length'),1);assert(c.app.innerHTML.includes('Marcaste de más:'));assert(c.app.innerHTML.includes('practice-next'));
}
run('practiceRestore()');assert(!classes.has('boiler-practice-zen'));assert.equal(c.model,'D');assert.equal(run('yaw'),.7);assert.equal(run('zoom'),1.3);assert.equal(run('activeBoilerFault'),'sludge');assert.deepEqual(Array.from(run('[...activeBoilerLayers]')),['water']);assert.equal(run('cutaway'),false);
console.log('3D practice: all modes/models, unique decks, exact grading, omissions/extras, hidden feedback, duplicate submit and restoration passed.');
