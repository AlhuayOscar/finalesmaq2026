import * as T from 'three';
import {OrbitControls} from './assets/vendor/OrbitControls.js';
export async function createScene(canvas,labelsHost){
 const scene=new T.Scene();scene.background=new T.Color('#eaf0eb');scene.fog=new T.Fog('#eaf0eb',25,55);
 const renderer=new T.WebGLRenderer({canvas,antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const camera=new T.PerspectiveCamera(38,1,.1,80),controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.minDistance=3;controls.maxDistance=28;controls.maxPolarAngle=Math.PI*.48;controls.target.set(0,1.8,0);
 scene.add(new T.HemisphereLight(0xffffff,0x8b9989,2.4));const light=new T.DirectionalLight(0xfff8e8,3.5);light.position.set(5,12,8);light.castShadow=true;light.shadow.mapSize.set(2048,2048);Object.assign(light.shadow.camera,{left:-12,right:12,top:12,bottom:-12});scene.add(light);
 const objects={},tags=[],paths=[],shells=[],fans=[];let state=null,index=0,clock=0,interior=true,currentView='all';
 const lines=document.createElementNS('http://www.w3.org/2000/svg','svg');lines.style.cssText='position:absolute;inset:0;width:100%;height:100%;overflow:visible';labelsHost.appendChild(lines);
 const mat=(c,extra={})=>new T.MeshStandardMaterial({color:c,roughness:.45,metalness:.2,...extra});
 const white=mat('#f4f2e9'),metal=mat('#8d9fa5'),dark=mat('#263d46'),copper=mat('#be8754'),blue=mat('#328dde'),red=mat('#c64c36'),gold=mat('#cca34b'),green=mat('#68b29b');
 function mesh(g,m,pos,parent=scene){const o=new T.Mesh(g,m);o.position.set(...pos);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o}
 function box(w,h,d,m,p,parent){return mesh(new T.BoxGeometry(w,h,d),m,p,parent)}
 function cyl(r,h,m,p,parent){return mesh(new T.CylinderGeometry(r,r,h,40),m,p,parent)}
 function group(name){const g=new T.Group();scene.add(g);objects[name]=g;return g}
 function tag(name,p,owner=null,key=''){const el=document.createElement('div');el.className='tag';el.textContent=name;labelsHost.appendChild(el);const line=document.createElementNS('http://www.w3.org/2000/svg','line');line.setAttribute('stroke','#6a8c7b');line.setAttribute('stroke-width','1');lines.appendChild(line);tags.push({el,line,p:new T.Vector3(...p),owner,key});return el}
 function tube(points,color,r=.045,parent=scene,flow=null){const curve=new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p)),false,'centripetal');const o=mesh(new T.TubeGeometry(curve,64,r,8,false),mat(color),[0,0,0],parent);if(flow){const particles=[];for(let i=0;i<9;i++){const p=mesh(new T.SphereGeometry(r*1.8,8,6),mat('#fff9c9',{emissive:color,emissiveIntensity:.7}),[0,0,0],parent);particles.push(p)}paths.push({curve,particles,flow,owner:parent});}return o}
 function coil(x,y,z,w,h,parent){box(w,h,.24,metal,[x,y,z],parent);for(let i=0;i<20;i++)box(.025,h+.05,.44,white,[x-w/2+i*w/19,y,z],parent);const pts=[];for(let j=0;j<6;j++){pts.push([x-w*.46,y-h*.44+j*h*.176,z+.26],[x+w*.46,y-h*.44+j*h*.176,z+.26]);if(j<5)pts.push([x+w*.48,y-h*.44+(j+.5)*h*.176,z+.26]);}tube(pts,'#ba8657',.028,parent)}
 function fan(x,y,z,r,parent){const f=new T.Group();f.position.set(x,y,z);parent.add(f);const hub=cyl(r*.18,.15,dark,[0,0,0],f);hub.rotation.x=Math.PI/2;for(let i=0;i<3;i++){const blade=box(r*.28,r*.83,.055,dark,[0,r*.4,0],f);const pivot=new T.Group();f.remove(blade);pivot.rotation.z=i*Math.PI*2/3;f.add(pivot);pivot.add(blade)}const ring=mesh(new T.TorusGeometry(r,.035,8,60),metal,[0,0,.08],f);fans.push(f);return f}
 const floor=mesh(new T.PlaneGeometry(200,200),mat('#e3e9e1'),[0,-.08,0]);floor.rotation.x=-Math.PI/2;
 const base=group('base');box(10,.12,4.4,mat('#c8d4c8'),[0,0,0],base);const grid=new T.GridHelper(10,20,0xaebdaf,0xd3ddd2);grid.position.y=.07;scene.add(grid);
 // Unidad interior elevada a la izquierda. Interconexión trazada en modo frío.
 const indoor=group('indoor');box(3.5,1.15,.86,white,[-3,4.5,-.2],indoor);coil(-3,4.55,.29,3.1,.78,indoor);box(3.1,.12,.5,dark,[-3,3.94,.3],indoor);for(let i=0;i<9;i++)box(.027,.2,.4,white,[-4.38+i*.34,3.98,.45],indoor);
 const blower=new T.Group();blower.position.set(-3,4.02,.48);indoor.add(blower);for(let i=0;i<12;i++)box(2.95,.025,.025,metal,[0,Math.cos(i*Math.PI/6)*.11,Math.sin(i*Math.PI/6)*.11],blower);
 tag('1 · Evaporador / unidad interior',[-3,5.3,0],indoor,'indoor');
 const outdoor=group('outdoor');box(4.35,.18,2.15,white,[1.55,.25,-.25],outdoor);box(4.35,.14,2.15,white,[1.55,3.05,-.25],outdoor);for(const x of [-.55,3.65])for(const z of [-1.25,.75])box(.07,2.75,.07,white,[x,1.65,z],outdoor);coil(.6,1.7,-.9,2.1,2.3,outdoor);fan(.45,1.65,.55,1.02,outdoor);
 const caseMat=mat('#eaf0e8',{transparent:true,opacity:.11,depthWrite:false,side:T.DoubleSide});const outdoorShell=box(4.3,2.68,2.1,caseMat,[1.55,1.65,-.25],outdoor);shells.push({mesh:outdoorShell,open:.1,closed:1});
 tag('2 · Condensador',[.2,3.32,-.5],outdoor,'condenser');
 const compressor=group('compressor');cyl(.48,.12,dark,[2.55,.45,.15],compressor);const compMat=mat('#38505c',{transparent:true,opacity:.2,depthWrite:false});const compShell=cyl(.44,1.72,compMat,[2.55,1.35,.15],compressor);shells.push({mesh:compShell,open:.18,closed:1});cyl(.44,.1,dark,[2.55,2.24,.15],compressor);
 const stator=cyl(.32,.6,copper,[2.55,1.6,.15],compressor);cyl(.14,1.35,metal,[2.55,1.32,.15],compressor);const rotor=cyl(.22,.22,gold,[2.65,.85,.15],compressor);const vane=box(.3,.22,.045,metal,[2.35,.85,.15],compressor);cyl(.35,.13,mat('#a17d39'),[2.55,.58,.15],compressor);tag('4 · Compresor rotativo',[2.8,2.65,.6],compressor,'compressor');
 const accumulator=group('accumulator');const accMat=mat('#445c66',{transparent:true,opacity:.18,depthWrite:false});const accShell=cyl(.28,1.32,accMat,[1.55,1.29,.65],accumulator);shells.push({mesh:accShell,open:.16,closed:1});cyl(.28,.06,dark,[1.55,1.98,.65],accumulator);cyl(.28,.06,dark,[1.55,.6,.65],accumulator);
 tube([[1.5,1.85,.65],[1.5,.82,.65],[1.63,.76,.65],[1.7,.88,.65],[1.7,2.12,.65]],'#92bfe2',.045,accumulator,'internal');const oil=cyl(.24,.09,mat('#c8a64e',{transparent:true,opacity:.7}),[1.55,.68,.65],accumulator);mesh(new T.SphereGeometry(.045,12,10),gold,[1.63,.79,.69],accumulator);tag('3 · Acumulador de aspiración',[1.3,2.35,1.05],accumulator,'accumulator');
 const reverse=group('reverse');const rev=cyl(.12,.65,copper,[2,2.63,-.18],reverse);rev.rotation.z=Math.PI/2;tag('Inversora · fija en frío',[2.05,3.25,-.1],reverse);
 const expansion=group('expansion');cyl(.12,.33,copper,[-.15,.78,-.75],expansion);cyl(.15,.16,dark,[-.15,1.02,-.75],expansion);tag('5 · Expansión electrónica',[-.8,1.25,-.75],expansion);
 const service=group('service');for(const y of [.65,1.14]){const v=cyl(.12,.25,copper,[3.98,y,.4],service);v.rotation.z=Math.PI/2;box(.2,.15,.16,copper,[3.98,y,.4],service)}
 tag('6 · Puerto de gas',[4.15,1.7,.65],service,'service');
 // Circuito: gas interior -> inversora -> acumulador -> compresor -> inversora -> condensador -> PMV -> interior.
 tube([[-4.6,4.4,.2],[-5,4.2,.2],[-5,.9,0],[4.1,.9,-1.7],[3.98,1.14,.4]],'#60adfa',.06,scene,'cycle');
 tube([[3.98,1.14,.4],[3.5,1.35,.5],[3.4,2.63,-.18],[2.3,2.63,-.18]],'#60adfa',.06,scene,'cycle');
 tube([[1.8,2.63,-.18],[1.3,2.55,.65],[1.38,1.95,.65]],'#60adfa',.06,scene,'cycle');
 tube([[1.7,2.12,.65],[1.92,2.1,.65],[2.12,.87,.15],[2.4,.87,.15]],'#60adfa',.06,scene,'cycle');
 tube([[2.55,2.25,.15],[2.8,2.65,.15],[2.12,2.7,-.22]],'#ed684c',.052,scene,'cycle');
 tube([[1.93,2.62,-.25],[1.2,2.65,-.8],[.5,2.7,-.9]],'#ed684c',.052,scene,'cycle');
 tube([[.5,2.7,-.65],[-.35,2.6,-.65],[-.35,2.3,-.65],[1.4,2.3,-.65],[1.4,2,-.65],[-.35,2,-.65],[-.35,1.7,-.65],[1.4,1.7,-.65],[1.4,1.4,-.65],[-.35,1.4,-.65],[-.35,.7,-.65],[-.15,.7,-.75]],'#eab54e',.034,scene,'cycle');
 tube([[-.15,.78,-.75],[-.15,.5,-1.3],[3.8,.5,-1.3],[3.98,.65,.4]],'#6cd3b4',.045,scene,'cycle');
 tube([[3.98,.65,.4],[4.5,.6,-1.5],[-4.7,.6,-1.5],[-4.7,3.65,-.2],[-1.4,3.65,-.2],[-1.4,4.5,.2]],'#6cd3b4',.045,scene,'cycle');
 tube([[-1.4,4.5,.55],[-1.6,4.7,.55],[-4.4,4.7,.55],[-4.4,4.4,.55],[-1.6,4.4,.55],[-1.6,4.15,.55],[-4.6,4.15,.55],[-4.6,4.4,.2]],'#60adfa',.032,scene,'cycle');
 // Flujo de aire independiente de los tubos.
 const air=group('air');for(let i=0;i<4;i++){tube([[-4+i*.6,3.9,.6],[-4+i*.6,3.6,1.1],[-4+i*.6,3.35,1.8]],'#8bcfc8',.008,air,'air');tube([[-.15+i*.4,1.4,.7],[-.15+i*.4,1.4,1.4],[-.15+i*.4,1.4,2.1]],'#c9aa7f',.008,air,'air')}
 const manifold=group('manifold');box(1.15,.25,.22,metal,[3.2,1.8,2.65],manifold);const needles=[],knobs=[];for(const [x,m] of [[2.86,blue],[3.55,red]]){const dial=cyl(.24,.1,white,[x,2.2,2.65],manifold);dial.rotation.x=Math.PI/2;const rim=mesh(new T.TorusGeometry(.24,.025,8,32),m,[x,2.2,2.72],manifold);const needle=box(.018,.18,.018,dark,[x,2.2,2.72],manifold);needles.push(needle);cyl(.11,.1,m,[x,1.76,2.7],manifold);knobs.push(box(.28,.05,.05,m,[x,1.78,2.8],manifold))}
 tag('Manifold · alta cerrada',[3.2,2.65,2.7],manifold,'service');
 const hose=group('hose');tube([[3.98,1.14,.45],[4.45,.8,1.1],[4.4,.3,2.5],[2.85,1.6,2.65]],'#398bd0',.037,hose,'service');
 const equipment=group('equipment');const tank=group('tank');const tankBody=cyl(.39,1.22,mat('#7f99aa'),[-1.85,.96,2.9],tank);const top=mesh(new T.SphereGeometry(.39,24,16),tankBody.material,[-1.85,1.57,2.9],tank);top.scale.y=.45;cyl(.07,.2,copper,[-1.85,1.83,2.9],tank);box(.35,.045,.09,green,[-1.85,1.96,2.9],tank);const siphon=tube([[-1.85,1.8,2.9],[-1.85,.53,2.9]],'#d8d6a6',.035,tank);const tankLabel=tag('R410A · CON sifón',[-1.85,2.25,2.9],tank,'service');
 const scale=group('scale');box(1.22,.18,1.04,dark,[-1.85,.22,2.9],scale);box(.6,.15,.1,green,[-1.85,.26,3.43],scale);const scaleTag=tag('Balanza · objetivo 1,40 kg',[-1.85,.2,3.8],scale);
 const machine=group('machine');box(1.1,.65,.65,mat('#4b8076'),[.1,.55,2.9],machine);box(.5,.08,.2,dark,[.1,.96,2.9],machine);for(let i=0;i<6;i++)box(.035,.35,.03,dark,[-.25+i*.12,.55,3.24],machine);const machineTag=tag('Recuperadora',[.1,1.25,2.9],machine);const machineLed=mesh(new T.SphereGeometry(.045,12,8),mat('#89df93',{emissive:'#52ce7d',emissiveIntensity:1}),[.46,.73,3.24],machine);
 const centerHose=group('centerHose');tube([[3.2,1.65,2.65],[2.4,.3,3.4],[.7,.28,3.5],[.3,.75,2.9]],'#dfb74a',.04,centerHose,'central');
 const tankHose=group('tankHose');tube([[-.3,.75,2.9],[-.7,.4,3.3],[-1.25,.6,3.3],[-1.85,1.85,2.9]],'#dfb74a',.04,tankHose,'tank');
 const directHose=group('directHose');tube([[-1.85,1.85,2.9],[-1,.5,3.5],[1.5,.35,3.4],[3.2,1.65,2.65]],'#dfb74a',.04,directHose,'direct');
 const meter=group('meter');box(.4,.6,.13,dark,[4.65,1.7,1.25],meter);box(.3,.22,.03,green,[4.65,1.8,1.33],meter);tag('Vacuómetro / sondas',[4.6,2.2,1.3],meter);
 const caps=group('caps');for(const y of [.65,1.14]){const c=cyl(.145,.15,metal,[4.13,y,.4],caps);c.rotation.z=Math.PI/2}
 const leak=group('leak');mesh(new T.TorusGeometry(.18,.04,8,24),mat('#dc7a33',{emissive:'#eeb15d',emissiveIntensity:.5}),[3.98,1.14,.5],leak);tag('Unión reparada / ensayada',[4.2,1.85,.5],leak);
 const regulator=group('regulator');cyl(.1,.22,copper,[-1.85,1.85,2.9],regulator);const rg=cyl(.18,.08,white,[-1.6,1.85,3],regulator);rg.rotation.x=Math.PI/2;tag('N₂ seco + regulador',[-1.8,2.4,2.9],regulator);
 // Tres representaciones internas, con rótulos sólo en sus vistas cercanas.
 const inletTag=tag('Toma de vapor superior',[1.5,1.82,.75],accumulator,'acc-detail');
 const oilTag=tag('Retorno dosificado de aceite',[1.6,.74,.8],accumulator,'acc-detail');
 const motorTag=tag('Motor → eje → rodillo',[2.7,1.65,.5],compressor,'comp-detail');
 function focus(key){currentView=key;const portrait=canvas.clientWidth/canvas.clientHeight<1.1;const views={all:{target:[-.2,2,1],pos:portrait?[12,11,19]:[10,8.5,16]},compressor:{target:[2.2,1.6,.5],pos:[6.8,4.3,8.2]},accumulator:{target:[1.6,1.4,.7],pos:[3.7,2.8,6]},service:{target:[1.2,1.35,2.1],pos:[9,6.8,12]}};const v=views[key]||views.all;controls.target.set(...v.target);camera.position.set(...v.pos);controls.update()}
 function setStep(s,i){state=s;index=i;clock=0;const serviceOn=i>=2&&i<=14;manifold.visible=hose.visible=serviceOn;machine.visible=['recovery','vacuum','hold'].includes(s.tool);tank.visible=['recovery','nitrogen','charge'].includes(s.tool);scale.visible=tank.visible&&s.tool!=='nitrogen';centerHose.visible=machine.visible;tankHose.visible=s.tool==='recovery';directHose.visible=['nitrogen','charge'].includes(s.tool);regulator.visible=s.tool==='nitrogen';meter.visible=['vacuum','hold','test'].includes(s.tool);caps.visible=i<2||i>=15;leak.visible=['repair','nitrogen','caps'].includes(s.tool);air.visible=s.run;
 tankBody.material.color.set(s.tool==='recovery'?'#d5b360':s.tool==='nitrogen'?'#78948c':'#8ea5b7');tankLabel.textContent=s.tool==='recovery'?'Cilindro de recuperación':s.tool==='nitrogen'?'Nitrógeno seco':'R410A · CON sifón';machineTag.textContent=s.tool==='recovery'?'Recuperadora':s.tool==='hold'?'Bomba aislada':'Bomba de vacío';scaleTag.textContent=s.tool==='recovery'?'Balanza · controlar capacidad':'Balanza · objetivo 1,40 kg';siphon.visible=s.tool==='charge';
 for(const p of paths)for(const dot of p.particles)dot.visible=false;
 }
 function allowed(flow,p){if(!state)return false;const f=state.flow;if(flow==='cycle'||flow==='air'||flow==='internal')return state.run;if(flow==='service')return['recover','vacuum','nitrogen','charge','topup'].includes(f)&&(f!=='nitrogen'||p<.42);if(flow==='central')return['recover','vacuum'].includes(f);if(flow==='tank')return f==='recover';if(flow==='direct')return['nitrogen','charge','topup'].includes(f)&&(f!=='nitrogen'||p<.42);return false}
 function cut(on){interior=on;for(const s of shells){s.mesh.material.opacity=on?s.open:s.closed;s.mesh.material.transparent=on;s.mesh.material.depthWrite=!on;s.mesh.material.needsUpdate=true}}
 function update(dt,progress){clock+=dt;controls.update();if(state?.run){for(const f of fans)f.rotation.z-=dt*7;blower.rotation.x+=dt*7;rotor.position.x=2.55+Math.cos(clock*7)*.095;rotor.position.z=.15+Math.sin(clock*7)*.095;vane.scale.x=1+Math.cos(clock*7)*.2}
 const open=['recover','vacuum','nitrogen','charge','topup'].includes(state?.flow)&&(state?.flow!=='nitrogen'||progress<.42);knobs[0].rotation.z=open?-Math.min(progress*8,1)*Math.PI/2:0;knobs[1].rotation.z=0;machineLed.material.emissiveIntensity=state?.tool==='hold'?0:.6+Math.sin(clock*3)*.3;leak.children[0].scale.setScalar(1+Math.sin(clock*3)*.12);
 // Los objetos cambian por etapa y la transferencia se detiene al finalizarla.
 for(const p of paths){const active=allowed(p.flow,progress);for(let j=0;j<p.particles.length;j++){const dot=p.particles[j];dot.visible=active;let u=(clock*.12+j/p.particles.length)%1;const outgoing=['recover','vacuum'].includes(state?.flow);if(p.flow==='service'&&!outgoing)u=1-u;dot.position.copy(p.curve.getPoint(u))}}
 if(index===14){hose.scale.setScalar(1-progress*.7);manifold.position.y=-progress*.35;hose.visible=progress<.85;manifold.visible=progress<.85}else{hose.scale.setScalar(1);manifold.position.y=0}
 if(index===15)caps.position.x=(1-progress)*.5;else caps.position.x=0;
 if(index===9)scaleTag.textContent=progress>=1?'Balanza · verificar masa transferida':'Carga por masa · avance ilustrativo';
 if(index===11)scaleTag.textContent=progress>=1?'Carga total del caso: 1,40 kg':'Completar sólo la masa pendiente';
 if(state?.tool==='nitrogen')tank.visible=directHose.visible=regulator.visible=progress<.85;
 const w=canvas.clientWidth,h=canvas.clientHeight,placed=[];for(const tag of tags){let show=!tag.owner||tag.owner.visible;if(tag.key==='acc-detail')show=show&&interior&&currentView==='accumulator';if(tag.key==='comp-detail')show=show&&interior&&currentView==='compressor';if(currentView==='accumulator'&&!['acc-detail','accumulator','compressor'].includes(tag.key))show=false;if(currentView==='compressor'&&!['comp-detail','accumulator','compressor'].includes(tag.key))show=false;const p=tag.p.clone().project(camera);show=show&&p.z<1&&p.z>-1&&Math.abs(p.x)<.98&&Math.abs(p.y)<.98;tag.el.hidden=!show;tag.line.style.display=show?'':'none';if(show){const px=(p.x*.5+.5)*w,py=(-p.y*.5+.5)*h,tw=tag.el.offsetWidth,th=tag.el.offsetHeight;let x=Math.max(tw/2+6,Math.min(w-tw/2-6,px)),y=py;for(let n=0;n<18;n++){if(!placed.some(r=>Math.abs(x-r.x)<(tw+r.w)/2+4&&Math.abs(y-r.y)<Math.max(th,r.h)+4))break;y-=th+5;if(y<th+6){y=py+th+5;x=Math.min(w-tw/2-6,x+tw*.65)}}placed.push({x,y,w:tw,h:th});tag.el.style.left=x+'px';tag.el.style.top=y+'px';tag.el.classList.toggle('active',tag.key===currentView);tag.line.setAttribute('x1',px);tag.line.setAttribute('y1',py+5);tag.line.setAttribute('x2',x);tag.line.setAttribute('y2',y)}}
 renderer.render(scene,camera);
 }
 const observer=new ResizeObserver(()=>{const w=canvas.clientWidth,h=canvas.clientHeight;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()});observer.observe(canvas);focus('all');
 return {setStep,update,focus,cut,dispose(){observer.disconnect();controls.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose())}});renderer.dispose();labelsHost.replaceChildren()}};
}
