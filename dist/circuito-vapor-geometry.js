function buildPlantGeometry(){
 const faces=[],anchors={},paths=[],add=(a,b)=>a.map((v,i)=>v+b[i]);
 function face(v,id,color,alpha=1){faces.push({v,id,color,alpha})}
 function box(c,s,id,color,alpha=1){const v=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(p=>p.map((v,i)=>c[i]+v*s[i]/2));for(const f of [[0,1,2,3],[4,7,6,5],[0,4,5,1],[3,2,6,7],[1,5,6,2],[0,3,7,4]])face(f.map(i=>v[i]),id,color,alpha)}
 function cylinder(a,b,r,id,color,alpha=1,n=10){const d=b.map((v,i)=>v-a[i]),len=Math.hypot(...d);if(len<1e-8)return;const u=d.map(v=>v/len),t=Math.abs(u[1])>.9?[1,0,0]:[0,1,0],cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],q=cross(u,t),ql=Math.hypot(...q),v=q.map(x=>x/ql),w=cross(u,v),A=[],B=[];for(let i=0;i<n;i++){const angle=i*Math.PI*2/n,off=v.map((x,j)=>r*(x*Math.cos(angle)+w[j]*Math.sin(angle)));A.push(add(a,off));B.push(add(b,off))}for(let i=0;i<n;i++)face([A[i],A[(i+1)%n],B[(i+1)%n],B[i]],id,color,alpha);face(A,id,color,alpha);face(B,id,color,alpha)}
 function pipe(points,r,id,color,alpha=1){for(let i=1;i<points.length;i++)cylinder(points[i-1],points[i],r,id,color,alpha,7)}
 function wheel(c,id,color){const pts=Array.from({length:13},(_,i)=>[c[0]+.2*Math.cos(i*Math.PI/6),c[1],c[2]+.2*Math.sin(i*Math.PI/6)]);pipe(pts,.025,id,color);for(const dx of [-.2,.2])cylinder(c,add(c,[dx,0,0]),.02,id,color)}
 function tank(p,id,color,r=.45,length=1.4){cylinder(add(p,[-length/2,0,0]),add(p,[length/2,0,0]),r,id,color,1,16);for(const x of [-length/2,length/2])cylinder(add(p,[x-.035,0,0]),add(p,[x+.035,0,0]),r*1.07,id,color);for(const x of [-.4,.4])box(add(p,[x,-r-.12,0]),[.13,.3,.55],id,'#597068')}
 const base=buildBoilerGeometry('D'),map=p=>[5+p[0]*1.1,2+p[1]*1.1,p[2]*1.1],omit=new Set(['superheater','desuperheater','outlet','takeoff']);
 for(const f of base.faces){if(omit.has(f.id))continue;const id=['screen','wall','floor','header'].includes(f.id)?'risers':['burner','airheater'].includes(f.id)?'furnace':f.id==='feed'?'upper':f.id;faces.push({v:f.v.map(p=>map(f.id==='down'&&p[1]>1?[p[0],p[1]-.14,p[2]]:p)),id,color:boilerParts[f.id][1],alpha:f.id==='furnace'?.12:1,drum:f.id==='upper',internal:f.internal,shade:f.shade})}
 for(const id of ['upper','lower','down','risers','economizer','separator','furnace'])if(base.anchors[id])anchors[id]=map(base.anchors[id]);
 for(const node of Object.values(plantNodes)){
  const {id,p,shape}=node,color=node.group==='sea'?'#508ca4':node.group==='makeup'?'#879b78':'#74a394';
  if(!anchors[id])anchors[id]=add(p,[0,.35,0]);
  if(shape==='boiler')continue;
  if(shape==='tank'){tank(p,id,color,id==='makeup'?.35:.43,id==='makeup'?1:1.4)}
  if(shape==='deaerator'){tank(p,id,'#9eb8b0',.34,1.15);cylinder(add(p,[0,.3,0]),add(p,[0,.85,0]),.08,id,'#94aaa2');box(add(p,[0,-.65,0]),[.13,.6,.13],id,'#839a92')}
  if(shape==='chest'){box(p,[.85,.8,.65],id,'#597b89',.6);for(let i=0;i<6;i++)cylinder(add(p,[-.4+i*.15,-.3,.36]),add(p,[-.4+i*.15,.3,.36]),.026,id,'#254f66');box(add(p,[-.55,0,0]),[.08,1.5,1.8],id,'#488eac',.16)}
  if(shape==='outfall'){pipe([add(p,[-.35,0,0]),p,add(p,[0,-.35,.3])],.16,id,color);box(add(p,[.5,-.2,0]),[1.2,.05,1.3],id,'#84bbcb',.5)}
  if(['valve','check','controlValve'].includes(shape)){cylinder(add(p,[-.3,0,0]),add(p,[.3,0,0]),.14,id,color);for(const x of [-.3,.3])cylinder(add(p,[x-.03,0,0]),add(p,[x+.03,0,0]),.2,id,'#466e72');if(shape!=='check'){cylinder(p,add(p,[0,.45,0]),.04,id,'#677c75');if(shape==='valve')wheel(add(p,[0,.46,0]),id,'#344f59');else cylinder(add(p,[0,.3,0]),add(p,[0,.62,0]),.18,id,'#476877')}else box(add(p,[0,.14,0]),[.18,.18,.2],id,'#607d75')}
  if(shape==='pump'){cylinder(add(p,[0,0,-.14]),add(p,[0,0,.18]),.3,id,color,1,16);cylinder(add(p,[0,0,.18]),add(p,[0,0,.4]),.08,id,'#9ca9a3');cylinder(add(p,[0,0,.4]),add(p,[0,0,.85]),.21,id,'#456a79');for(let i=0;i<5;i++)cylinder(add(p,[0,0,.42+i*.08]),add(p,[0,0,.44+i*.08]),.23,id,'#527787');box(add(p,[0,-.38,.32]),[.7,.13,1.2],id,'#6d837c')}
  if(shape==='filter'){cylinder(add(p,[0,-.3,0]),add(p,[0,.3,0]),.24,id,color);cylinder(add(p,[0,.3,0]),add(p,[0,.37,0]),.31,id,'#567c84');for(let i=0;i<5;i++)cylinder(add(p,[-.16+i*.08,-.2,.23]),add(p,[-.16+i*.08,.2,.23]),.01,id,'#b8d7d5')}
  if(shape==='skid'){tank(p,id,'#97b5a5',.26,.8);cylinder(add(p,[.45,-.24,0]),add(p,[.45,.28,0]),.14,id,'#597e79');box(add(p,[0,-.4,.1]),[1.15,.12,.75],id,'#6a8175')}
  if(shape==='condenser'){
   cylinder(add(p,[-1.3,0,0]),add(p,[1.3,0,0]),.64,id,'#9cb8ac',.23,18);
   for(const x of [-1.32,1.32])cylinder(add(p,[x-.08,0,0]),add(p,[x+.08,0,0]),.66,id,'#456f80',.7,16);
   for(const y of [-.25,0,.25])for(const z of [-.27,0,.27])cylinder(add(p,[-1.28,y,z]),add(p,[1.28,y,z]),.045,id,'#237fa8',1,7);
   paths.push({id,kind:'sea',points:[add(p,[-1.3,0,.27]),add(p,[1.3,0,.27])]});
   paths.push({id,kind:'steam',points:[add(p,[0,.6,.42]),add(p,[0,.3,.42]),add(p,[0,-.5,.42])]});
  }
  if(shape==='turbine'){
   for(let i=0;i<7;i++){const x=-1.15+i*.34,r=.3+(6-i)*.065;cylinder(add(p,[x,0,0]),add(p,[x+.28,0,0]),r,id,i%2?'#718b85':'#91aaa1',.78,14)}
   cylinder(add(p,[-1.6,0,0]),add(p,[1.7,0,0]),.075,id,'#475f64');for(const x of [-.8,.8])box(add(p,[x,-.78,0]),[.2,.35,.65],id,'#647970');
  }
  if(shape==='coil'){const pts=[];for(let i=0;i<8;i++){const y=p[1]-.7+i*.2;pts.push([p[0]+(i%2?.48:0),y,p[2]],[p[0]+(i%2?0:.48),y,p[2]])}pipe(pts,.06,id,id==='sh1'?'#ad7a98':'#cd654e');paths.push({id,kind:id==='sh1'?'steam':'superheated',points:pts});box(add(p,[.24,0,-.13]),[.9,1.7,.65],id,'#e1a755',.07)}
  if(shape==='attemperator'){cylinder(add(p,[-.4,0,0]),add(p,[.4,0,0]),.22,id,'#967ca7',.38,14);pipe([add(p,[-.42,0,0]),add(p,[-.25,.08,0]),add(p,[.25,.08,0]),add(p,[.42,0,0])],.06,id,'#955c85');}
 }
 // Dashed leader locates the enlarged surface attemperator in the drum's water space.
 const attemperatorLeader=[P('attemperator'),[5.55,3.3,.3]];
 for(const e of plantEdges)pipe(e.points,e.aux?.023:.045,e.from,plantColors[e.kind],.95);
 // Water surfaces and saturated-space separation visible through the opened upper drum.
 box([5.55,3.49,0],[.55,.015,2.3],'upper','#237f9a',.65);
 // Furnace heat is a separate energy path, never connected to fluid piping.
 paths.push({id:'furnace',kind:'heat',points:[[4.1,1,0],[4.7,2,0],[6.1,3.7,0],[6.5,5.2,0]]});
 return {faces,anchors,paths,attemperatorLeader};
}
