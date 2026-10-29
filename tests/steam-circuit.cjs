const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const c=vm.createContext({console,Set,Math});for(const f of ['boiler-data','boiler-systems','boiler-geometry','circuito-vapor-data','circuito-vapor-geometry'])vm.runInContext(fs.readFileSync('dist/'+f+'.js','utf8'),c);
const run=s=>vm.runInContext(s,c),nodes=run('plantNodes'),edges=run('plantEdges'),mesh=run('buildPlantGeometry()');
assert.equal(Object.keys(nodes).length,29);
for(const n of Object.values(nodes)){assert(mesh.faces.some(f=>f.id===n.id),'missing model '+n.id);assert(mesh.anchors[n.id].every(Number.isFinite));assert(n.description&&n.note)}
for(const f of mesh.faces)for(const p of f.v)assert(p.every(Number.isFinite));
for(const e of edges){assert(nodes[e.from]&&nodes[e.to]);assert(e.points.length>=2);for(let i=1;i<e.points.length;i++)assert(Math.hypot(...e.points[i].map((v,k)=>v-e.points[i-1][k]))>0)}
const sea=edges.filter(e=>e.kind==='sea');assert.equal(sea.length,5);assert(sea.every(e=>[e.from,e.to].every(id=>nodes[id].group==='sea'||id==='condenser')));
assert.deepEqual(JSON.parse(JSON.stringify(sea.map(e=>[e.from,e.to]))),[['seaChest','seaValve'],['seaValve','seaFilter'],['seaFilter','seaPump'],['seaPump','condenser'],['condenser','discharge']]);
const ports=edges.filter(e=>e.port).map(e=>e.port);for(const p of ['tube-in','tube-out','shell-drain','shell-steam'])assert(ports.includes(p));
assert(edges.some(e=>e.from==='separator'&&e.to==='upper'&&e.kind==='water'&&e.recirculation));
for(const [a,b]of [['upper','down'],['down','lower'],['lower','risers'],['risers','separator'],['separator','sh1'],['sh1','attemperator'],['attemperator','sh2'],['sh2','mainValve'],['mainValve','turbine'],['turbine','condenser']])assert(edges.some(e=>e.from===a&&e.to===b),a+' → '+b);
assert(edges.some(e=>e.from==='makeup'&&e.to==='feedTank'&&e.kind==='makeup'));assert(!edges.some(e=>e.kind==='sea'&&['feedTank','upper','feedPump'].includes(e.to)));
assert.equal(edges.filter(e=>e.to==='sh2').length,1);assert.equal(edges.find(e=>e.to==='sh2').from,'attemperator');
for(const e of edges)for(const t of [0,.2,.5,.9,1])assert(run(`plantSample(${JSON.stringify(e.points)},${t})`).every(Number.isFinite));
assert.equal(run("plantEdgeVisible(plantEdges[0],'cycle')"),false);assert.equal(run("plantEdgeVisible(plantEdges[0],'sea')"),true);
const html=fs.readFileSync('dist/circuito-vapor.html','utf8'),js=fs.readFileSync('dist/circuito-vapor.js','utf8');assert(html.includes('boiler-geometry.js'));assert(html.includes('atemperador'));assert(js.includes('cancelAnimationFrame'));assert(js.includes('pointercancel'));assert(fs.readFileSync('dist/model.js','utf8').includes('circuito-vapor.html'));
console.log('OK: 29 modelos, geometría finita, dos circuitos sin mezcla, cuatro puertos del condensador, recirculación natural, dos etapas en serie, reposición y dirección del flujo.');

assert(mesh.faces.some(f=>f.id==='airheater'));
assert(mesh.anchors.airheater[1]>mesh.anchors.furnace[1]);
assert(mesh.faces.filter(f=>f.id==='furnace'&&!f.connection).every(f=>f.v.every(p=>p[1]<4)),'El hogar no debe incluir el precalentador elevado');
