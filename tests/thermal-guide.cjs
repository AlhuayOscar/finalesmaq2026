const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.join(__dirname,'../dist'),TG=require(root+'/server-data/thermal-guide.cjs'),G=require(root+'/server-data/guided-review.cjs');
const seen=[];let steps=0,gifs=0;
assert.equal(TG.navigation.length,150);
for(let unit=0;unit<10;unit++){
 const l=G.lesson('termicas',unit);assert.equal(l.version,2);assert.equal(l.documentQuestions.length,150);
 for(const s of l.sections.filter(s=>s.steps)){
  assert.equal(s.steps.length,4);assert(s.sources.length);assert(s.pitfall);
  for(const q of s.questions){assert.equal(q.unit,unit);assert.equal(TG.navigation.find(n=>n.number===q.number).sectionId,s.id);seen.push(q.number)}
  for(const step of s.steps){steps++;assert(step.text.length>120);assert(step.alt.includes(step.title));assert(fs.existsSync(root+step.image));const svg=fs.readFileSync(root+step.image,'utf8');assert(svg.startsWith('<svg'));assert(svg.includes('viewBox="0 0 1000 620"'));assert(!svg.includes('undefined'));assert(!svg.includes('NaN'));assert(!svg.includes('<script'));}
  if(s.animation){gifs++;const buf=fs.readFileSync(root+s.animation);assert.equal(buf.subarray(0,3).toString(),'GIF');assert(buf.length>10000)}
  if(s.plate)assert(fs.existsSync(root+s.plate));
 }
}
assert.deepEqual(seen.sort((a,b)=>a-b),Array.from({length:150},(_,i)=>i+1),'Every original question maps exactly once');assert.equal(steps,148);assert.equal(gifs,3);
assert(!G.lesson('frio',0).documentQuestions);
// Use the real speech/step functions to verify continuous narration advances within a module first.
const nodes=new Map(),engine={queue:[],speak(u){this.queue.push(u)},cancel(){},pause(){},resume(){},getVoices(){return[]},addEventListener(){}};
const noop=()=>{},ctx={console,location:{hash:'#oral'},currentSubject:'termicas',saved:{},persist:noop,esc:s=>String(s),SpeechSynthesisUtterance:function(text){this.text=text},speechSynthesis:engine,addEventListener:noop,document:{querySelector(id){if(!nodes.has(id))nodes.set(id,{textContent:'',value:0,innerHTML:'',hidden:false,addEventListener:noop,scrollIntoView:noop});return nodes.get(id)},querySelectorAll(){return[]}},window:null};ctx.window=ctx;
vm.createContext(ctx);vm.runInContext(fs.readFileSync(root+'/speech-voice.js','utf8'),ctx);for(const name of ['guided-thermal.js','guided-review.js'])vm.runInContext(fs.readFileSync(root+'/'+name,'utf8').replace("if(location.hash==='#oral')render();",''),ctx);
ctx.lesson=G.lesson('termicas',0);const run=s=>vm.runInContext(s,ctx);
run("guided.lesson=lesson;guided.index=lesson.sections.findIndex(s=>s.id==='documento-rankine');guidedSection();guidedSpeak()");
const section=run('guided.index');let guard=0;while(run('guidedVisual.index')===0&&guard++<100)engine.queue.at(-1).onend();assert.equal(run('guidedVisual.index'),1);assert.equal(run('guided.index'),section);assert(engine.queue.at(-1).text.includes('Paso 2'));
run('guided.continuous=false;guidedSetVisual(2);guidedSpeak()');guard=0;while(run('guided.playing')&&guard++<100)engine.queue.at(-1).onend();assert.equal(run('guidedVisual.index'),2);assert.equal(run('guided.index'),section);
run('guidedVisual.animation=true;guidedSetVisual(3)');assert.equal(run('guidedVisual.animation'),false);assert(nodes.get('#guided-content').innerHTML.includes('PASO 4 DE 4'));
run('window.cleanupGuided()');const count=engine.queue.length;engine.queue.at(-1).onend();assert.equal(engine.queue.length,count);
console.log('OK: 150 exact question mappings, 148 SVG steps, 3 GIFs, cross-unit coverage and step-by-step speech lifecycle.');
