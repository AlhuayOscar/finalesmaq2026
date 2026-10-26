// Schematic surfaces and connected paths share coordinates, including exploded view.
const boilerVec={add:(a,b)=>a.map((x,i)=>x+b[i]),sub:(a,b)=>a.map((x,i)=>x-b[i]),mul:(a,n)=>a.map(x=>x*n)};
function buildBoilerGeometry(type,explosion=0,layers=new Set()) {
  const {add,sub,mul}=boilerVec, faces=[], paths=[], anchors={}, bounds={};
  const norm=a=>mul(a,1/Math.hypot(...a));
  const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  const offsets={upper:[0,.65,0],lower:[-.25,-.5,0],lower2:[.3,-.5,0],risers:[0,0,.3],down:[0,0,-.65],furnace:[0,0,1.4],furnace2:[0,0,1.4],burner:[0,0,1.7],screen:[-.4,0,.4],superheater:[-.65,0,.8],economizer:[.6,.8,0],header:[-.6,-.4,0],wall:[-.65,0,0],floor:[0,-.65,0],takeoff:[0,1.2,.4],separator:[0,.8,.6],feed:[0,.3,.9],desuperheater:[0,.3,-.6],outlet:[.8,.6,0],airheater:[.9,1,0]};
  const shift=(p,id)=>add(p,mul(offsets[id]||[0,0,0],explosion));
  function face(v,id,shade=.8) {
    const center=mul(v.reduce((a,p)=>add(a,p),[0,0,0]),1/v.length);
    const internal=['separator','desuperheater'].includes(id)||(['takeoff','feed'].includes(id)&&Math.abs(center[2])<=1.16&&Math.hypot(center[0]-(type==='D'?.5:0),center[1]-1.35)<.36);
    const points=v.map(p=>shift(p,id));faces.push({v:points,id,shade,internal});
    if(!bounds[id])bounds[id]={min:[Infinity,Infinity,Infinity],max:[-Infinity,-Infinity,-Infinity]};
    for(const p of points)for(let i=0;i<3;i++){bounds[id].min[i]=Math.min(bounds[id].min[i],p[i]);bounds[id].max[i]=Math.max(bounds[id].max[i],p[i]);}
  }
  function cylinder(a,b,r,id,cut=false) {
    const dir=norm(sub(b,a)),u=norm(cross(dir,Math.abs(dir[1])>.95?[1,0,0]:[0,1,0])),v=cross(dir,u),n=16,A=[],B=[];
    for(let i=0;i<n;i++){const off=add(mul(u,r*Math.cos(i*2*Math.PI/n)),mul(v,r*Math.sin(i*2*Math.PI/n)));A.push(add(a,off));B.push(add(b,off));}
    for(let i=0;i<n;i++)face([A[i],A[(i+1)%n],B[(i+1)%n],B[i]],id,.64+.23*Math.sin(i*2*Math.PI/n));
    face(A,id,.85);if(!cut)face(B,id,.9);
  }
  function pipe(points,r,id,kind) {
    for(let i=1;i<points.length;i++)cylinder(points[i-1],points[i],r,id);
    if(kind)paths.push({id,kind,points:points.map(p=>shift(p,id))});
  }
  function box(c,size,id){const [a,b,d]=size.map(x=>x/2);const v=[[-a,-b,-d],[a,-b,-d],[a,b,-d],[-a,b,-d],[-a,-b,d],[a,-b,d],[a,b,d],[-a,b,d]].map(p=>add(p,c));[[0,1,2,3],[4,5,6,7],[0,1,5,4],[3,2,6,7],[1,2,6,5],[0,3,7,4]].forEach((f,i)=>face(f.map(k=>v[k]),id,.65+i*.045));}
  function coil(x,y,w,h,id,kind,z=0){const pts=[];for(let i=0;i<8;i++){const yy=y+h*i/7;pts.push([x+(i%2?w:0),yy,z],[x+(i%2?0:w),yy,z]);}pipe(pts,.045,id,kind);return pts;}
  const sx=type==='D'? .5:0, top=[sx,1.35,0];
  cylinder([sx,1.35,-1.15],[sx,1.35,1.15],.36,'upper');
  const lowers=type==='A'?[[-1.5,'lower'],[1.5,'lower2']]:type==='M'?[[0,'lower'],[1.5,'lower2']]:[[sx,'lower']];
  for(const [x,id]of lowers)cylinder([x,-1.35,-1.1],[x,-1.35,1.1],.24,id);
  for(const [x]of lowers){
    for(let z=-.95;z<=1;z+=.19){
      const mid=type==='D'?x+.37:x;
      pipe([[x,-1.12,z],[mid,-.9,z],[sx+(x-sx)*.3,1.05,z],[sx,1.17,z]],.037,'risers',z>.9?'mixture':null);
    }
    pipe([[sx,1.35,-1.18],[sx,1.35,-1.48],[x,-1.35,-1.48],[x,-1.35,-1.1]],.075,'down','water');
  }
  if(type==='simple') {
    box([-.48,-.3,0],[.65,1.6,1.6],'furnace');
    pipe([[sx,1.66,.35],[sx,2.15,.35],[sx+.7,2.15,.35]],.07,'outlet','steam');
  } else {
    const hx=type==='A'?-.65:type==='M'?-1.1:-.8;
    box([hx,-.4,0],[type==='D'?1.65:.8,1.55,1.8],'furnace');
    if(type!=='D')box([.65,-.4,0],[.85,1.55,1.8],'furnace2');
    for(const x of type==='D'?[hx]:[hx,.65])for(const y of [-.85,-.4]){
      cylinder([x,y,1.35],[x,y,.9],.14,'burner');
      cylinder([x,y,1.42],[x,y,1.34],.2,'burner');
    }
    const headerX=type==='A'?0:-1.9;
    cylinder([headerX,-1.6,-1.1],[headerX,-1.6,1.1],.11,'header');
    // Each screen is fed from a lower water space; A has its own central header.
    const screenX=type==='D'?.08:type==='M'?-.22:0;
    for(let z=-.95;z<=1;z+=.19){
      const baseX=type==='A'?0:lowers[0][0];
      pipe([[baseX,type==='A'?-1.6:-1.35,z],[screenX,-1.1,z],[screenX,.85,z],[sx,1.15,z]],.033,'screen',z>.9?'mixture':null);
      if(type!=='A'){
        if(type==='D')pipe([[lowers[0][0],-1.35,z],[headerX,-1.6,z]],.035,'floor',z>.9?'water':null);
        pipe([[headerX,-1.6,z],[headerX,.45,z],[sx,1.23,z]],.039,'wall',z>.9?'mixture':null);
      }
    }
    if(type==='A')pipe([[0,1.35,-1.2],[0,1.35,-1.55],[0,-1.6,-1.55],[0,-1.6,-1.1]],.07,'down','water');
    if(type==='M')pipe([[0,1.35,-1.2],[0,1.35,-1.65],[headerX,-1.6,-1.65],[headerX,-1.6,-1.1]],.07,'down','water');
    const shx=type==='A'?-.8:type==='M'?-.68:-.4;
    const sh=coil(shx,-1,.34,1.8,'superheater','steam',.4);
    // Saturated steam takeoff and the outlet are different selectable components.
    pipe([[sx,1.48,-.95],[sx,1.48,.95],[sx,1.48,1.25],[sh[0][0],sh[0][1],1.25],sh[0]],.045,'takeoff','steam');
    pipe([sh[sh.length-1],[sh[sh.length-1][0],.8,1.3],[1.9,.8,1.3]],.06,'outlet','steam');
    for(let z=-.7;z<1;z+=.4)box([sx,1.43,z],[.4,.13,.12],'separator');
    pipe([[sx,1.23,-.95],[sx,1.23,.95]],.04,'feed','water');
    const ex=type==='D'?1.05:.65;
    const ec=coil(ex,1.8,.75,.65,'economizer','water',-.15);
    pipe([ec[ec.length-1],[ex,2.45,-1.35],[sx,1.23,-1.35],[sx,1.23,-.95]],.045,'feed','water');
    if(type==='A'){
      const leftEconomizer=coil(-1.4,1.8,.75,.65,'economizer','water',-.15);
      pipe([leftEconomizer[leftEconomizer.length-1],[-1.4,2.45,-1.35],[sx,1.23,-1.35]],.045,'feed','water');
    }
    if(type!=='M')coil(sx-.2,1.18,.4,.08,'desuperheater','steam',-.3);
    if(type==='D'){
      box([1.45,2.95,-.15],[.75,.55,.65],'airheater');
      for(let y=2.75;y<3.2;y+=.12)cylinder([1.04,y,.2],[1.86,y,.2],.025,'airheater');
    }
    const gases=type==='A'?[[hx,-.5,0],[-.8,.2,0],[-1,1.8,0],[-1,2.8,0]]:type==='M'?[[hx,-.5,0],[-.55,.5,0],[.6,.65,0],[1.05,1.8,0],[1.05,2.9,0]]:[[hx,-.5,0],[0,.2,0],[.8,.6,0],[1.4,1.8,0],[1.4,3.3,0]];
    // Gas arrows are conceptual paths between heat-transfer zones, not piping.
    paths.push({id:'furnace',kind:'gas',points:gases});
    if(type!=='D')paths.push({id:'furnace2',kind:'gas',points:[[.65,-.5,.2],[.85,.5,.2],[1.05,1.8,.2],[1.05,2.8,.2]]});
  }
  addBoilerSystems(type,layers,{pipe,box,cylinder,face,paths});
  for(const [id,b]of Object.entries(bounds)){
    const center=mul(add(b.min,b.max),.5);
    // Attach leaders to an actual surface, not to empty space between grouped tubes.
    anchors[id]=faces.filter(f=>f.id===id).map(f=>mul(f.v.reduce((a,p)=>add(a,p),[0,0,0]),1/f.v.length)).reduce((best,p)=>Math.hypot(...sub(p,center))<Math.hypot(...sub(best,center))?p:best);
  }
  return {faces,paths,anchors,bounds};
}
function sampleBoilerPath(points,t){
  const lengths=points.slice(1).map((p,i)=>Math.hypot(...boilerVec.sub(p,points[i]))),total=lengths.reduce((a,b)=>a+b,0);
  let d=Math.max(0,Math.min(1,t))*total;
  for(let i=0;i<lengths.length;i++){if(d<=lengths[i]||i===lengths.length-1)return boilerVec.add(points[i],boilerVec.mul(boilerVec.sub(points[i+1],points[i]),d/lengths[i]));d-=lengths[i];}
  return points[0];
}
