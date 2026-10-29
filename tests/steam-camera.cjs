const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),c=vm.createContext({console,Set,Math});
for(const name of ['boiler-data','boiler-systems','boiler-geometry','circuito-vapor-data','circuito-vapor-geometry','circuito-vapor-camera'])vm.runInContext(fs.readFileSync('dist/'+name+'.js','utf8'),c);
const run=s=>vm.runInContext(s,c);run('var focusMesh=buildPlantGeometry()');
for(const size of [[830,600],[350,460]])for(const angles of [[-.16,.22],[.9,.6]])for(const id of Object.keys(run('plantNodes'))){
 const f=run(`plantFocusCamera(focusMesh,'${id}',${angles[0]},${angles[1]},${size[0]},${size[1]})`);assert(f.target.every(Number.isFinite));assert(f.zoom>=.6&&f.zoom<=14);
 const points=run(`focusMesh.faces.filter(f=>f.id==='${id}'&&!f.connection).flatMap(f=>f.v)`),scale=Math.min((size[0]-70)/19.8,(size[1]-85)/11)*f.zoom;
 for(const p of points){const q=run(`plantCameraPoint(${JSON.stringify(p)},${JSON.stringify(f.target)},${angles[0]},${angles[1]})`);assert(Math.abs(q[0]*scale)<size[0]*.5);assert(Math.abs(q[1]*scale)<size[1]*.5)}
}
assert(run("plantFocusCamera(focusMesh,'feedPump',-.16,.22,830,600).zoom")>6);
console.log('OK: enfoque de 29 piezas, 2 tamaños y 2 ángulos; piezas dentro del encuadre y tuberías excluidas.');

