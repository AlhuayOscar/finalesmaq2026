let yaw=-.38,pitch=.16,zoom=1,raf,drawn=[],canvas,ctx,W,H;
let showLabels=true,focusPart=false,cutaway=false,flowKind='water',labelHits=[],geometryKey='',mesh;
const internalParts=new Set(['takeoff','separator','feed','desuperheater']);
function partIds(){return boilerIds(model)}
function part(id){return boilerPart(id,model)}
function renderWorkshop(){
  window.stopModel?.();const t=types[model];
  if(model!=='catalog'&&!partIds().includes(selected))selected='upper';
  if(model==='simple'&&flowKind==='gas')flowKind='water';
  app.innerHTML=`<div class="workshop-head"><div><div class="eyebrow">LABORATORIO INTERACTIVO · CALDERAS ACUOTUBULARES</div><h1>Reconocé cada parte.<br><em>Seguí el recorrido.</em></h1></div><span class="lab-badge">3D · EXPLORACIÓN + MONTAJE</span></div><div class="model-tabs" aria-label="Tipos de caldera">${Object.entries(types).map(([id,t])=>`<button data-model="${id}" class="${model===id?'active':''}">${t.name}</button>`).join('')}</div>${model==='catalog'?catalog():workshopBody(t)}`;
  document.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>{model=b.dataset.model;placed.clear();selected='upper';explode=0;zoom=1;focusPart=false;cutaway=false;geometryKey='';renderWorkshop()});
  if(model==='catalog')return;
  canvas=document.querySelector('#model-canvas');ctx=canvas.getContext('2d');
  document.querySelector('#explore').onclick=()=>{mode='explore';renderWorkshop()};
  document.querySelector('#assemble').onclick=()=>{mode='assemble';placed.clear();renderWorkshop()};
  document.querySelector('#explode').oninput=e=>{explode=+e.target.value/100;document.querySelector('#flow-note').textContent=explode?'Despiece: conexiones separadas; circulación pausada.':'Las flechas indican el sentido. Recorrido esquemático.'};
  document.querySelector('#reset-view').onclick=()=>{yaw=-.38;pitch=.16;zoom=1;explode=0;document.querySelector('#explode').value=0;document.querySelector('#flow-note').textContent='Las flechas indican el sentido. Recorrido esquemático.'};
  document.querySelector('#front-view').onclick=()=>{yaw=0;pitch=0;zoom=1};
  document.querySelector('#zoom-in').onclick=()=>zoom=Math.min(1.7,zoom+.15);
  document.querySelector('#zoom-out').onclick=()=>zoom=Math.max(.55,zoom-.15);
  for(const [id,get,set] of [['labels-toggle',()=>showLabels,v=>showLabels=v],['focus-toggle',()=>focusPart,v=>focusPart=v],['cut-toggle',()=>cutaway,v=>cutaway=v]])document.querySelector('#'+id).onclick=e=>{set(!get());e.currentTarget.setAttribute('aria-pressed',String(get()))};
  document.querySelector('#flow-select').onchange=e=>{flowKind=e.target.value;flow=flowKind!=='off'};
  document.querySelector('#restart')?.addEventListener('click',()=>{placed.clear();updateParts();document.querySelector('#feedback').textContent='Montaje reiniciado.'});
  updateParts();bindCanvas();raf=requestAnimationFrame(draw);
}
function workshopBody(t){
  const ref=boilerReference[model];
  return `<div class="model-intro"><div><h2>${t.name}</h2><p>${ref.feature}</p></div><div class="segmented"><button id="explore" class="${mode==='explore'?'active':''}">Explorar</button><button id="assemble" class="${mode==='assemble'?'active':''}">Armar caldera</button></div></div>
  <div class="lab-layout"><section class="viewport"><div class="viewport-top"><span class="tag">CORTE DIDÁCTICO · SIN ESCALA</span><span id="counter"></span></div>
  <canvas id="model-canvas" tabindex="0" aria-label="Caldera 3D. Arrastrá para girar, flechas para rotar, más y menos para zoom. Las piezas también se seleccionan en el inspector."></canvas>
  <div class="canvas-help">Arrastrá para girar · Tocá una pieza o su número · Rueda para zoom</div>
  <div class="viewport-tools"><button id="reset-view" class="secondary">↺ Vista inicial</button><button id="front-view" class="secondary">Vista frontal</button><button id="zoom-out" class="secondary" aria-label="Alejar">−</button><button id="zoom-in" class="secondary" aria-label="Acercar">+</button></div>
  <div class="viewport-tools"><button id="labels-toggle" class="secondary" aria-pressed="${showLabels}">Números</button><button id="focus-toggle" class="secondary" aria-pressed="${focusPart}">Aislar selección</button><button id="cut-toggle" class="secondary" aria-pressed="${cutaway}">Ver interior del domo</button></div>
  <div class="flow-control"><label for="flow-select">Recorrido</label><select id="flow-select">${[['water','Agua y mezcla'],['steam','Vapor'],...(model==='simple'?[]:[['gas','Gases calientes']]),['off','Sin animación']].map(([v,l])=>`<option value="${v}" ${flowKind===v?'selected':''}>${l}</option>`).join('')}</select><small id="flow-note">${explode?'Despiece: conexiones separadas; circulación pausada.':'Las flechas indican el sentido. Recorrido esquemático.'}</small></div>
  <div class="explode-control"><label for="explode">Despiece</label><input id="explode" type="range" min="0" max="100" value="${explode*100}" aria-label="Separación de las piezas"><span>Montada ↔ Separada</span></div>
  <div class="legend"><span><i style="background:#367fc1"></i>Agua</span><span><i style="background:#ca8946"></i>Mezcla</span><span><i style="background:#ba5f7b"></i>Vapor</span><span><i style="background:#e57745"></i>Gases</span></div></section>
  <section class="parts-panel"><div class="eyebrow">${mode==='assemble'?'BANCO DE PIEZAS':'INSPECTOR DE COMPONENTES'}</div><p class="panel-help">${mode==='assemble'?'Elegí una pieza y tocá su ubicación. Los contornos muestran lo que falta.':'Cada número identifica una pieza del modelo. Seleccionala para ver su función, conexiones y referencia en el apunte.'}</p><div id="parts-list"></div><div id="part-detail" aria-live="polite"></div><div class="feedback" id="feedback" role="status"></div>${mode==='assemble'?'<button id="restart" class="secondary">Reiniciar montaje</button>':''}</section></div>
  <div class="source-bar"><strong>Referencia del modelo</strong><p>Apunte «Máquinas Térmicas», páginas PDF ${ref.pages} (impresas ${ref.printed}). Los números del visor son propios; el inspector indica las referencias originales. Se simplifican tubos y accesorios. Envuelta retirada para ver el interior; no es un plano constructivo. ${model==='M'?'El sobrecalentador se representa como un conjunto, sin reproducir sus etapas.':''}</p><a href="${sources.book}" target="_blank" rel="noopener">Ampliar con Bobbio ↗</a></div>
  <div class="study-strip"><div><h3>Explicá el recorrido.</h3><p>Distinguí agua, mezcla, vapor y gases. ¿Qué circula dentro de cada componente y qué intercambia calor por fuera?</p></div><a class="button" href="#profesor">Practicar el oral →</a></div>`;
}
function updateParts(){
  const ids=partIds();
  document.querySelector('#parts-list').innerHTML=ids.map((id,i)=>`<button class="part-item ${id===selected?'selected':''}" data-part="${id}" aria-pressed="${id===selected}"><b class="part-number">${i+1}</b><i style="background:${part(id)[1]}"></i><span>${part(id)[0]}</span><small>${mode==='assemble'?(placed.has(id)?'✓':'＋'):'↗'}</small></button>`).join('');
  document.querySelectorAll('[data-part]').forEach(b=>b.onclick=()=>{selected=b.dataset.part;if(internalParts.has(selected))cutaway=true;document.querySelector('#cut-toggle').setAttribute('aria-pressed',String(cutaway));updateParts();if(mode==='assemble')document.querySelector('#feedback').textContent=placed.has(selected)?'Esta pieza ya está colocada.':'Tocá su ubicación en el modelo.'});
  const p=part(selected),ref=boilerReference[model],number=ref.numbers[selected],accessoryPage={takeoff:'15',feed:'15',separator:'16',desuperheater:'17'}[selected];
  document.querySelector('#part-detail').innerHTML=`<div class="detail-number">PIEZA ${ids.indexOf(selected)+1} / ${ids.length}</div><h3>${p[0]}</h3><h4>Función</h4><p>${p[2]}</p><h4>Conexiones y recorrido</h4><p>${p[3]}</p><div class="part-caution">${p[4]}</div><p class="part-reference">Apunte · PDF ${accessoryPage||ref.pages}${number&&!accessoryPage?' · referencia '+number+(model==='D'?' del esquema inferior':model==='M'?' de la lista «Elementos»':''):accessoryPage?' · accesorios internos (ubicación esquemática)':' · circuito descrito en el texto'}</p>${mode==='assemble'&&!placed.has(selected)?'<button id="guided-place" class="secondary">Colocar con ayuda</button>':''}`;
  document.querySelector('#guided-place')?.addEventListener('click',()=>place(selected,true));
  document.querySelector('#counter').textContent=mode==='assemble'?`${placed.size} / ${ids.length} PIEZAS`:`${ids.length} COMPONENTES`;
}
function place(id,help=false){
  const feedback=document.querySelector('#feedback');if(placed.has(id)){feedback.textContent='Esa pieza ya está instalada.';return}
  if(id!==selected){feedback.textContent='Ese lugar corresponde a '+part(id)[0]+'. Probá otra ubicación.';return}
  placed.add(id);updateParts();feedback.textContent=placed.size===partIds().length?'✓ Montaje completo. Ahora explicá los recorridos de agua, vapor y gases.':(help?'Colocada con ayuda: ':'¡Ubicación correcta! ')+part(id)[0];
}
function project(p){
  const x=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),z=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw),y=(p[1]-.5)*Math.cos(pitch)+z*Math.sin(pitch),d=(p[1]-.5)*Math.sin(pitch)-z*Math.cos(pitch);
  const scale=Math.min((W-80)/6.4,(H-85)/5.9)*zoom*9/(9+d);return [W/2+x*scale,H*.52-y*scale,d];
}
function shade(hex,n){return 'rgb('+hex.match(/\w\w/g).map(x=>Math.min(255,Math.round(parseInt(x,16)*n))).join(',')+')'}
function visiblePart(id){return !(focusPart&&id!==selected)&&!(['separator','desuperheater'].includes(id)&&!cutaway)}
function draw(time){
  if(!canvas?.isConnected)return;
  const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);W=r.width;H=r.height;
  if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr)}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);ctx.strokeStyle='#d5e2d8';ctx.lineWidth=.6;
  for(let n=-3;n<=3;n++){const a=project([n,-1.9,-3]),b=project([n,-1.9,3]),c=project([-3,-1.9,n]),d=project([3,-1.9,n]);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.moveTo(c[0],c[1]);ctx.lineTo(d[0],d[1]);ctx.stroke()}
  const key=model+':'+explode;if(key!==geometryKey){mesh=buildBoilerGeometry(model,explode);geometryKey=key}
  drawn=mesh.faces.map(f=>({...f,p:f.v.map(project)})).map(f=>({...f,depth:f.p.reduce((s,p)=>s+p[2],0)/f.p.length})).sort((a,b)=>b.depth-a.depth);
  for(const f of drawn){
    if(f.internal&&!cutaway)continue;
    const ghost=mode==='assemble'&&!placed.has(f.id),hot=f.id===selected,dim=focusPart&&!hot,glass=(f.id==='upper'&&cutaway)||f.id.startsWith('furnace');
    ctx.beginPath();f.p.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath();ctx.globalAlpha=dim?.035:ghost?.08:glass?.1:1;
    ctx.fillStyle=shade(part(f.id)[1],hot?f.shade+.15:f.shade);ctx.fill();ctx.globalAlpha=dim?.04:ghost?.25:glass?.2:.5;ctx.strokeStyle=hot?'#143f3d':shade(part(f.id)[1],.7);ctx.lineWidth=hot?.85:.22;ctx.stroke();
  }
  ctx.globalAlpha=1;
  if(flow&&flowKind!=='off'&&!explode&&(mode==='explore'||placed.size===partIds().length)){
    for(const path of mesh.paths){if(!visiblePart(path.id))continue;if(flowKind==='water'?!['water','mixture'].includes(path.kind):path.kind!==flowKind)continue;
      const color={water:'#246db2',mixture:'#c97928',steam:'#a34167',gas:'#d95c25'}[path.kind];ctx.setLineDash([4,5]);ctx.strokeStyle=color;ctx.lineWidth=1.3;ctx.beginPath();path.points.map(project).forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.stroke();ctx.setLineDash([]);
      for(let i=0;i<3;i++){const t=(time/5500+i/3)%1,a=project(sampleBoilerPath(path.points,t)),b=project(sampleBoilerPath(path.points,Math.min(1,t+.012))),angle=Math.atan2(b[1]-a[1],b[0]-a[0]);ctx.save();ctx.translate(a[0],a[1]);ctx.rotate(angle);ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(-4,-3.5);ctx.lineTo(-4,3.5);ctx.closePath();ctx.fill();ctx.restore();}
    }
  }
  drawLabels();raf=requestAnimationFrame(draw);
}
function drawLabels(){
  labelHits=[];if(!showLabels)return;const ids=partIds().filter(id=>visiblePart(id)),sides=[[],[]];
  ids.map(id=>({id,p:project(mesh.anchors[id])})).sort((a,b)=>a.p[0]-b.p[0]).forEach((item,i)=>sides[i<Math.ceil(ids.length/2)?0:1].push(item));
  sides.forEach((items,side)=>{items.sort((a,b)=>a.p[1]-b.p[1]);items.forEach(({id,p},i)=>{
    const x=side?W-27:27,y=65+(H-110)*(i+.5)/Math.max(1,items.length),hot=id===selected;ctx.globalAlpha=mode==='assemble'&&!placed.has(id)?.5:1;
    ctx.strokeStyle=hot?'#163e3c':'#8a9e96';ctx.lineWidth=hot?1.4:.7;ctx.beginPath();ctx.moveTo(p[0],p[1]);ctx.lineTo(x+(side?-17:17),y);ctx.lineTo(x,y);ctx.stroke();ctx.beginPath();ctx.arc(p[0],p[1],2.5,0,Math.PI*2);ctx.fillStyle=part(id)[1];ctx.fill();
    ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.fillStyle=hot?'#163e3c':'#fffff7';ctx.fill();ctx.stroke();ctx.fillStyle=hot?'#fff':'#163e3c';ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(partIds().indexOf(id)+1),x,y);labelHits.push({id,x,y});
  })});ctx.globalAlpha=1;
}
function inside(p,vs){let hit=false;for(let i=0,j=vs.length-1;i<vs.length;j=i++){const a=vs[i],b=vs[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])hit=!hit}return hit}
function bindCanvas(){
  let last=null,start=null,moved=false;canvas.onpointerdown=e=>{last=[e.clientX,e.clientY];start=last;moved=false;canvas.setPointerCapture(e.pointerId)};
  canvas.onpointermove=e=>{if(!last)return;if(Math.hypot(e.clientX-start[0],e.clientY-start[1])>5)moved=true;yaw+=(e.clientX-last[0])*.008;pitch=Math.max(-.7,Math.min(.9,pitch+(e.clientY-last[1])*.006));last=[e.clientX,e.clientY]};
  canvas.onpointerup=e=>{last=null;if(moved)return;const r=canvas.getBoundingClientRect(),p=[e.clientX-r.left,e.clientY-r.top],marker=labelHits.find(h=>Math.hypot(p[0]-h.x,p[1]-h.y)<16),hits=[...drawn].reverse().filter(f=>visiblePart(f.id)&&inside(p,f.p));
    const hit=marker||hits.filter(f=>!f.internal||cutaway).find(f=>!f.id.startsWith('furnace')&&!(f.id==='upper'&&cutaway))||hits.find(f=>!f.internal||cutaway);if(!hit)return;if(mode==='assemble')place(hit.id);else{selected=hit.id;if(internalParts.has(selected)){cutaway=true;document.querySelector('#cut-toggle').setAttribute('aria-pressed','true')}updateParts()}
  };
  canvas.onpointercancel=()=>last=null;canvas.onwheel=e=>{e.preventDefault();zoom=Math.max(.55,Math.min(1.7,zoom-e.deltaY*.001))};
  canvas.onkeydown=e=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key)){e.preventDefault();if(e.key==='ArrowLeft')yaw-=.12;if(e.key==='ArrowRight')yaw+=.12;if(e.key==='ArrowUp')pitch=Math.min(.9,pitch+.1);if(e.key==='ArrowDown')pitch=Math.max(-.7,pitch-.1);if(e.key==='+'||e.key==='=')zoom=Math.min(1.7,zoom+.1);if(e.key==='-')zoom=Math.max(.55,zoom-.1)}};
}
window.stopModel=()=>cancelAnimationFrame(raf);

function catalog(){return `<div class="page-top"><h2>Tipos encontrados en Bobbio</h2><p class="lead">Estas fichas organizan lo que sigue. Los modelos 3D disponibles son los de las pestañas anteriores.</p></div><div class="grid">${[['Tubos rectos','Capítulo 3 · desde p. 15','Cabezal y tubos rectos: otra disposición de caldera acuotubular.'],['ESD II · Foster Wheeler','Capítulo 6 · desde p. 39','Caldera con sobrecalentador externo.'],['MR y M12 · Babcock & Wilcox','Capítulo 7 · pp. 51–55','Diseños radiantes descritos en el libro.'],['V2M y V2M8 · Combustion Engineering','Capítulo 7 · pp. 55–61','Variantes con sobrecalentador vertical.'],['Circuitos UR y UB · Kawasaki','Capítulo 7 · pp. 61–69','Circuitos de alta eficiencia y recalentamiento.'],['¿Tipo W?','Pendiente de verificar','No se confirmó esta denominación en el índice consultado. No se presenta como tipo validado.']].map(([title,ref,text])=>`<article class="card"><span class="tag ${title.includes('W?')?'pending':''}">${title.includes('W?')?'POR CONFIRMAR':'REFERENCIA LOCALIZADA'}</span><h3>${title}</h3><p>${text}</p><p class="source">${ref}</p></article>`).join('')}</div><p class="source"><a href="${sources.book}" target="_blank" rel="noopener">Ver índice y capítulos en Bobbio ↗</a></p>`}

render();
