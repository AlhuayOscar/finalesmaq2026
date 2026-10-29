const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const nodes=new Map(),make=()=>({textContent:'',innerHTML:'',disabled:false,hidden:false,checked:false,style:{},dataset:{},attrs:{},setAttribute(k,v){this.attrs[k]=String(v)},getAttribute(k){return this.attrs[k]},removeAttribute(k){delete this.attrs[k]}}),node=id=>{if(!nodes.has(id))nodes.set(id,make());return nodes.get(id)};
const buttons=Array.from({length:18},(_,i)=>Object.assign(make(),{dataset:{step:String(i)}}));let frame=null,cancelled=0;
const context={console,document:{getElementById:node,querySelectorAll:s=>s==='[data-step]'?buttons:[],addEventListener(){}},window:{addEventListener(){}},speechSynthesis:{cancel(){cancelled++}},requestAnimationFrame:cb=>(frame=cb,1),cancelAnimationFrame(){}};
vm.createContext(context);
vm.runInContext(fs.readFileSync('dist/carga-split-data.js','utf8').replace('export const','const'),context);
const source=fs.readFileSync('dist/carga-split.js','utf8').replace(/^import .*;\n/,'').replace(/try\{const \{createScene\}=await import[\s\S]*?console\.error\('Vista 3D:',e\)\}/,'');vm.runInContext(source,context);
const get=x=>vm.runInContext(x,context);
assert.equal(get('steps.length'),18);assert(node('previous').disabled);assert.equal(node('counter').textContent,'Paso 1 de 18');
for(let i=1;i<18;i++){node('next').onclick();assert.equal(get('step'),i);assert.equal(node('counter').textContent,`Paso ${i+1} de 18`);assert.equal(buttons[i].attrs['aria-current'],'step');}
assert(node('next').disabled);node('repeat').onclick();assert(get('playing'));assert.equal(get('elapsed'),0);
node('play').onclick();assert.equal(get('playing'),false);
buttons[6].onclick();assert.equal(get('step'),6);assert.equal(get('steps[step].run'),false);assert.equal(get('steps[step].flow'),'vacuum');
buttons[9].onclick();assert.equal(get('steps[step].run'),false);assert.equal(get('steps[step].flow'),'charge');
buttons[11].onclick();assert.equal(get('steps[step].run'),true);assert.equal(get('steps[step].flow'),'topup');
buttons[0].onclick();node('auto').checked=true;node('play').onclick();for(let t=80;t<370000;t+=80)frame(t);assert.equal(get('step'),17);assert.equal(get('playing'),false);assert.equal(get('steps[step].run'),false);
assert(cancelled>=18);
console.log('OK: navegación 18 pasos; selección directa; pausa/repetición; reproducción continua hasta parada final; vacío y carga inicial sin compresor; carga condicional en frío.');
