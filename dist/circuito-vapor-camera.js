function plantCameraPoint(p,target,yaw,pitch){
 const a=p.map((v,i)=>v-target[i]),x=a[0]*Math.cos(yaw)+a[2]*Math.sin(yaw),z=-a[0]*Math.sin(yaw)+a[2]*Math.cos(yaw);
 return [x,a[1]*Math.cos(pitch)+z*Math.sin(pitch),a[1]*Math.sin(pitch)-z*Math.cos(pitch)];
}
function plantFocusCamera(mesh,id,yaw,pitch,width,height){
 // Frame the equipment, not its long connecting pipes.
 const points=mesh.faces.filter(f=>f.id===id&&!f.connection).flatMap(f=>f.v);
 if(!points.length)return null;
 const min=[0,1,2].map(i=>Math.min(...points.map(p=>p[i]))),max=[0,1,2].map(i=>Math.max(...points.map(p=>p[i]))),target=min.map((v,i)=>(v+max[i])/2);
 const projected=points.map(p=>plantCameraPoint(p,target,yaw,pitch));
 const span=[0,1].map(i=>Math.max(...projected.map(p=>p[i]))-Math.min(...projected.map(p=>p[i])));
 const scale=Math.max(1,Math.min((width-70)/19.8,(height-85)/11));
 const zoom=Math.max(.6,Math.min(14,(width*.62)/(Math.max(span[0],.25)*scale),(height*.62)/(Math.max(span[1],.25)*scale)));
 return {target,zoom};
}
