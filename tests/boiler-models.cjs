const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.join(__dirname,'../dist');
const nodes=new Map();let frames=0,cancels=0;
const noop=()=>{};const context2d=new Proxy({}, {get:(t,k)=>t[k]||noop,set:(t,k,v)=>(t[k]=v,true)});
function node(id){if(!nodes.has(id))nodes.set(id,{innerHTML:'',textContent:'',value:0,addEventListener:noop,setAttribute:noop,getContext:()=>context2d,getBoundingClientRect:()=>({width:760,height:520,left:0,top:0}),isConnected:true,setPointerCapture:noop});return nodes.get(id)}
const c=vm.createContext({console,Set,Math,devicePixelRatio:1,window:{},document:{querySelector:node,querySelectorAll:()=>[]},requestAnimationFrame:()=>++frames,cancelAnimationFrame:()=>cancels++,render:noop,model:'simple',mode:'explore',selected:'upper',placed:new Set(),explode:0,flow:true,app:{innerHTML:''},types:{simple:{name:'Simple'},A:{name:'A'},M:{name:'M'},D:{name:'D'},catalog:{name:'Catalog'}},sources:{book:'https://example.org'}});
for(const f of ['boiler-data.js','boiler-geometry.js','model.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),c);
const run=s=>vm.runInContext(s,c);
for(const type of ['simple','A','M','D']){
 c.model=type;
 for(const e of [0,.5,1]){
  const g=run(`buildBoilerGeometry(model,${e})`),ids=Array.from(run('partIds()'));
  assert.deepEqual([...new Set(g.faces.map(f=>f.id))].sort(),[...ids].sort());
  for(const f of g.faces)for(const p of f.v)assert(p.every(Number.isFinite),`${type}: invalid surface`);
  for(const id of ids){assert(g.anchors[id].every(Number.isFinite));assert.equal(run(`part('${id}').length`),5)}
  for(const p of g.paths){assert(p.points.length>1);assert(p.points.flat().every(Number.isFinite));}
  for(const p of g.paths.filter(p=>p.id==='down'))assert(p.points[0][1]>p.points.at(-1)[1]);
  for(const p of g.paths.filter(p=>p.kind==='mixture'))assert(p.points[0][1]<p.points.at(-1)[1]);
 }
 run('renderWorkshop();cutaway=true;draw(500);');assert(c.app.innerHTML.includes('flow-select'));
 assert.equal(run('labelHits.length'),run('partIds().length'));
 c.mode='assemble';c.placed.clear();run('renderWorkshop();');
 const ids=Array.from(run('partIds()'));c.selected=ids[0];run(`place('${ids[1]}')`);assert.equal(c.placed.size,0);
 for(const id of ids){c.selected=id;run(`place('${id}',true)`)}
 assert.equal(c.placed.size,ids.length);assert(node('#feedback').textContent.includes('Montaje completo'));
 c.mode='explore';
}
const a=run('buildBoilerGeometry("A")'),m=run('buildBoilerGeometry("M")'),d=run('buildBoilerGeometry("D")');
assert(a.bounds.lower.max[0]<0);assert(m.bounds.lower.min[0]<0&&m.bounds.lower.max[0]>0);assert(m.bounds.lower2.min[0]>0);
assert(!d.bounds.lower2);for(const id of ['risers','wall','screen','floor','header'])assert(d.bounds[id]);
assert(!m.bounds.floor);assert(m.paths.some(p=>p.id==='down'&&p.points.at(-1)[0]===-1.9));
// Path interpolation is distance-based, so arrows do not jump on short bends.
assert.deepEqual(Array.from(run('sampleBoilerPath([[0,0,0],[1,0,0],[1,3,0]],.5)')),[1,1,0]);
assert(cancels>=8);console.log('Boiler models: topology, coordinates, labels, flow direction, mounting and lifecycle passed.');
