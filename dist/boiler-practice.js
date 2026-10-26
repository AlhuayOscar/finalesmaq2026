// Local study game. It does not write oral-exam marks or require an AI request.
const boilerPractice={active:false,screen:'setup',deck:[],index:0,picks:new Set(),answers:{},result:null,results:[],saved:null};
const boilerMaintenance={
 soot:{targets:['risers','economizer'],scenario:'Se verificó hollín sobre el haz vaporizador y el economizador. Marcá esas dos superficies de intercambio.',effect:'La capa del lado de gases reduce el calor transmitido al agua y aumenta el consumo para igual producción.',action:'Relacionar limpieza del lado de fuego y sopladores con el estado de las superficies; corregir también la combustión que produce el depósito.',source:'soot'},
 blocked:{targets:['atomizer','fuelFilter'],scenario:'Se confirmó obturación por partículas en el pulverizador. Marcá el elemento obstruido y el filtro que debía retener esos sólidos.',effect:'Disminuye el paso de combustible; el quemador puede apagarse y deja de aportar el calor esperado.',action:'Revisar filtrado y limpiar los pasajes del quemador sin agrandar, deformar ni dañar los orificios. Bobbio no propone perforarlos para recuperar caudal.',source:'faults'},
 spray:{targets:['fuelHeater','atomizer'],scenario:'El combustible que requiere precalentamiento llega demasiado viscoso al pulverizador. Marcá el equipo de acondicionamiento térmico y el que forma el rocío.',effect:'Las gotas gruesas dificultan la preparación de la mezcla y favorecen combustión irregular y depósitos.',action:'Comprobar temperatura/viscosidad, presión y estado del pulverizador según combustible y equipo; limpiar o reparar el componente defectuoso sin adoptar una temperatura universal.',source:'fuel'},
 scale:{targets:['risers'],scenario:'Se confirmó una incrustación adherida en el interior de los tubos vaporizadores. Marcá el conjunto afectado, no los conductos de purga.',effect:'La resistencia térmica del depósito eleva la temperatura del metal y puede dañar el tubo.',action:'El libro distingue fosfato sódico para precipitar calcio e hidróxido sódico para magnesio en su tratamiento interno. Se controlan mediante análisis; no son una receta de desincrustación ni se dosifican sin el programa del equipo.',source:'chemistry'},
 sludge:{targets:['lower','bottomBlow'],scenario:'Se verificaron lodos en el colector inferior principal (no en el segundo colector). Marcá ese colector y la extracción asociada.',effect:'La acumulación de sedimentos en zonas bajas puede restringir circulación y perjudicar la refrigeración.',action:'Relacionar extracción de fondo con remoción de fangos y control del agua. La extracción superficial tiene otra toma y no sustituye la limpieza de depósitos adheridos.',source:'water'},
 chlorides:{targets:['feedPump','upper'],scenario:'Las muestras confirman ingreso de agua con cloruros por la alimentación. Marcá la bomba de ese circuito y el domo al que llega el agua; el punto de ingreso externo no está representado.',effect:'La contaminación se transporta al inventario de agua de caldera y exige investigar su origen mediante análisis.',action:'Comparar análisis de agua y alimentación para localizar y corregir el ingreso contaminante. Un ensayo de cloruros no equivale a un ensayo de dureza; no agregar reactivos a ciegas.',source:'chemistry'},
 lowLevel:{targets:['levelControl','risers'],scenario:'Se confirma bajo nivel. Marcá el conjunto que lo indica/controla y el haz vaporizador cuya refrigeración queda comprometida.',effect:'Las superficies calentadas sin refrigeración suficiente pueden sobrecalentarse y sufrir daños.',action:'Investigar alimentación, pérdidas, válvulas e indicación de nivel. Bobbio advierte que aumentar el fuego por baja presión cuando falta agua agrava el daño; la maniobra concreta sigue el procedimiento del equipo.',source:'faults'},
 cavitation:{targets:['feedPump'],scenario:'Ruido y pérdida de caudal se localizaron en la bomba de alimentación; la presión local de aspiración cae por debajo de la presión de vapor. Marcá la bomba afectada.',effect:'El colapso de burbujas produce ruido, vibración, erosión y pérdida de prestaciones.',action:'Revisar temperatura, altura disponible y pérdidas de aspiración; corregir la condición que reduce el margen de aspiración antes de limitarse a sustituir piezas dañadas.',source:'cavitation'}
};
function practiceShuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function practiceChoices(correct,pool){return practiceShuffle([correct,...practiceShuffle([...new Set(pool)].filter(x=>x!==correct)).slice(0,3)])}
function practiceDeck(type,kind,count){
 const ids=[...boilerIds(type),...boilerLayerIds(new Set(['fuel','water','controls']))];
 const identification=practiceShuffle(ids).map((id,i)=>({key:'part:'+id,kind:kind==='mixed'?(i%2?'number':'description'):kind,id,layers:Object.keys(boilerLayers).filter(k=>boilerLayers[k].ids.includes(id)),choices:practiceChoices(id,ids)}));
 const faults=practiceShuffle(Object.entries(boilerMaintenance)).filter(([,c])=>c.targets.every(id=>ids.includes(id))).map(([id,c])=>{
  const f=boilerFaults.find(f=>f.id===id),otherFaults=boilerFaults.filter(x=>x.group!==f.group),otherCases=Object.entries(boilerMaintenance).filter(([key])=>otherFaults.some(x=>x.id===key)).map(([,v])=>v);
  return {key:'fault:'+id,kind:'fault',id,layers:f.layers,targets:c.targets,scenario:c.scenario+(id==='sludge'&&type==='A'?' En esta tipo A es el colector izquierdo de la vista frontal.':''),fields:[
   {id:'symptom',label:'¿Cómo se observa o se confirma?',correct:f.symptom,pool:otherFaults.map(x=>x.symptom)},
   {id:'cause',label:'¿Por qué ocurre?',correct:f.cause,pool:otherFaults.map(x=>x.cause)},
   {id:'effect',label:'¿Cómo afecta al sistema?',correct:c.effect,pool:otherCases.map(x=>x.effect)},
   {id:'maintenance',label:'¿Qué comprobación, elemento o mantenimiento corresponde?',correct:c.action,pool:otherCases.map(x=>x.action)}
  ].map(q=>({...q,choices:practiceChoices(q.correct,q.pool)}))};
 });
 // Interleave to guarantee all three modes in a mixed six-question session.
 const deck=kind==='fault'?faults:kind==='mixed'?faults.flatMap((f,i)=>[identification[i*2],identification[i*2+1],f]).filter(Boolean):identification;
 return deck.slice(0,count);
}
function practiceGrade(q,picks,answers){
 const expected=q.kind==='fault'?q.targets:[q.id],missing=expected.filter(id=>!picks.has(id)),extra=[...picks].filter(id=>!expected.includes(id));
 const location=Math.max(0,(expected.length-missing.length-extra.length)/expected.length);
 const fields=(q.fields||[]).map(f=>({...f,answer:answers[f.id]||'',ok:answers[f.id]===f.correct}));
 const score=Math.round(100*(q.kind==='fault'?(location+fields.filter(f=>f.ok).length)/5:location));
 return {score,missing,extra,fields,expected};
}
function practiceCurrent(){return boilerPractice.deck[boilerPractice.index]}
function practiceDescription(id){
 let text=part(id)[2];
 if(id==='fuelPump')text+=' Buscá el equipo del circuito de combustible.';
 if(id==='lower'&&['A','M'].includes(model))text+=model==='A'?' Identificá el colector izquierdo de la vista frontal.':'Identificá el colector central.';
 if(['furnace','furnace2'].includes(id)&&['A','M'].includes(model))text+=` Buscá el sector ${id==='furnace'?'izquierdo':'derecho'} en la vista frontal.`;
 return text;
}
function practicePartSelected(id){const p=boilerPractice;if(!p.active||p.screen!=='game'||p.result||practiceCurrent().kind==='number')return;
 if(practiceCurrent().kind==='fault'){p.picks.has(id)?p.picks.delete(id):p.picks.add(id)}else{p.picks=new Set([id])}
 selected=id;practiceRefreshSelection();
}
function practiceHot(id){const p=boilerPractice;if(!p.active||p.screen!=='game')return id===selected;return practiceCurrent().kind==='number'?id===practiceCurrent().id:p.picks.has(id)}
function practiceRefreshSelection(){
 document.querySelectorAll('[data-practice-zone]').forEach(b=>b.setAttribute('aria-pressed',String(boilerPractice.picks.has(b.dataset.practiceZone))));
 const status=document.querySelector('#practice-selection');if(status)status.textContent=boilerPractice.picks.size?'Seleccionaste: '+[...boilerPractice.picks].map(id=>'zona '+(partIds().indexOf(id)+1)).join(', '):'Todavía no seleccionaste una zona.';
}
window.startBoilerPractice=(type)=>{
 const p=boilerPractice;if(p.active)return;
 p.saved={model,mode,selected,placed:new Set(placed),explode,flow,flowKind,yaw,pitch,zoom,showLabels,focusPart,cutaway,layers:new Set(activeBoilerLayers),fault:activeBoilerFault,route:location.hash||'#taller'};
 window.cleanupGuided?.();p.active=true;p.screen='setup';p.results=[];model=['simple','A','M','D'].includes(type)?type:(model==='catalog'?'D':model);document.body.classList.add('boiler-practice-zen');
 if(location.hash==='#taller')renderWorkshop();else location.hash='taller';
};
function practiceRestore(){const p=boilerPractice;if(!p.active)return;window.stopModel?.();const s=p.saved;p.active=false;document.body.classList.remove('boiler-practice-zen');
 model=s.model;mode=s.mode;selected=s.selected;placed=s.placed;explode=s.explode;flow=s.flow;flowKind=s.flowKind;yaw=s.yaw;pitch=s.pitch;zoom=s.zoom;showLabels=s.showLabels;focusPart=s.focusPart;cutaway=s.cutaway;activeBoilerLayers=s.layers;activeBoilerFault=s.fault;geometryKey='';
}
function practiceExit(){const route=boilerPractice.saved.route;practiceRestore();if(location.hash===route)render();else location.hash=route}
window.addEventListener('hashchange',()=>{if(boilerPractice.active&&location.hash!=='#taller')practiceRestore()});
function practiceBegin(type,kind){model=type;boilerPractice.deck=practiceDeck(type,kind,6);boilerPractice.index=0;boilerPractice.results=[];boilerPractice.screen='game';practicePrepare();renderBoilerPractice()}
function practicePrepare(){const p=boilerPractice,q=practiceCurrent();p.picks=new Set();p.answers={};p.result=null;activeBoilerLayers=new Set(q.layers);activeBoilerFault='';mode='explore';selected='';explode=0;flow=false;flowKind='off';showLabels=true;focusPart=false;cutaway=true;zoom=1;yaw=-.38;pitch=.16;geometryKey=''}
function practiceSubmit(){const p=boilerPractice;if(p.result)return;p.result=practiceGrade(practiceCurrent(),p.picks,p.answers);p.results.push(p.result);renderBoilerPractice()}
function practiceFeedback(q,r){const names=ids=>ids.map(id=>esc(part(id)[0])).join(', ');
 return `<section class="practice-feedback" tabindex="-1" role="status"><h2>${r.score}/100 · Corrección</h2><p><strong>Correspondía:</strong> ${names(r.expected)}.</p><p><strong>Te faltó:</strong> ${r.missing.length?names(r.missing):'ninguna pieza'}.</p><p><strong>Marcaste de más:</strong> ${r.extra.length?names(r.extra):'ninguna pieza'}.</p>${r.fields.map(f=>`<div class="practice-correction ${f.ok?'correct':'incorrect'}"><strong>${f.ok?'✓':'✕'} ${esc(f.label)}</strong>${!f.ok?`<p>Tu respuesta: ${esc(f.answer||'Sin responder')}.</p>`:''}<p>${esc(f.correct)}</p></div>`).join('')}${q.kind!=='fault'?`<p>${esc(part(q.id)[2])}</p><p>${esc(part(q.id)[3])}</p><p>${esc(part(q.id)[4])}</p>`:''}<p class="source">${practiceSource(q)}</p><button id="practice-next">${boilerPractice.index===boilerPractice.deck.length-1?'Ver resultado':'Siguiente desafío →'}</button></section>`;
}
function practiceSource(q){const source=q.kind==='fault'?boilerSystemSources[boilerMaintenance[q.id].source]:boilerSystemReference(q.id);return source?`<a href="${esc(source[1])}" target="_blank" rel="noopener">${esc(source[0])} ↗</a>`:`Apunte «Máquinas Térmicas» · páginas PDF ${boilerReference[model].pages}. <a href="${esc(sources.book)}" target="_blank" rel="noopener">Ampliar con Bobbio ↗</a>`}
function renderBoilerPractice(){
 window.stopModel?.();const p=boilerPractice;
 const toolbar=`<div class="practice-toolbar"><strong>PRÁCTICA 3D · ${p.screen==='game'?`${p.index+1} / ${p.deck.length}`:'MODO ZEN'}</strong><button id="practice-exit">Salir de la práctica</button></div>`;
 if(p.screen==='setup'){
 app.innerHTML=toolbar+`<section class="practice-setup"><div class="eyebrow">MIRÁ · IDENTIFICÁ · EXPLICÁ</div><h1>Conocé la caldera por dentro.</h1><p>Seis desafíos sin repetir. Girá el modelo, seguí las llamadas numeradas y comprobá tu respuesta antes de continuar.</p><label for="practice-model">Caldera</label><select id="practice-model">${['simple','A','M','D'].map(id=>`<option value="${id}" ${id===model?'selected':''}>${types[id].name}</option>`).join('')}</select><label for="practice-kind">Qué querés practicar</label><select id="practice-kind"><option value="mixed">Combinado: descripción, número y fallas</option><option value="description">Identificar por descripción</option><option value="number">Reconocer la pieza señalada por número</option><option value="fault">Fallas, causas, efectos y mantenimiento</option></select><p>En fallas: marcá las zonas solicitadas y resolvé cuatro preguntas. Cada dimensión vale 20%; marcar piezas de más resta precisión. Las omisiones valen cero. El resultado es de esta práctica y no modifica tus exámenes.</p><button id="practice-start">Comenzar práctica →</button></section>`;
 document.querySelector('#practice-start').onclick=()=>practiceBegin(document.querySelector('#practice-model').value,document.querySelector('#practice-kind').value);
 }else if(p.screen==='summary'){
 const average=Math.round(p.results.reduce((n,r)=>n+r.score,0)/p.results.length);
 app.innerHTML=toolbar+`<section class="practice-setup"><div class="eyebrow">PRÁCTICA TERMINADA</div><h1>${average}/100</h1><p>${p.results.filter(r=>r.score===100).length} de ${p.results.length} desafíos completos. Identificar una pieza es el comienzo: seguí explicando sus conexiones y su efecto sobre el sistema.</p><ol>${p.results.map((r,i)=>`<li>Desafío ${i+1}: ${r.score}/100 · faltaron ${r.missing.length} piezas · sobraron ${r.extra.length}</li>`).join('')}</ol><button id="practice-again">Elegir otra práctica</button></section>`;
 document.querySelector('#practice-again').onclick=()=>{p.screen='setup';renderBoilerPractice()};
 }else{
 const q=practiceCurrent(),ids=partIds(),number=ids.indexOf(q.id)+1;
 const prompt=q.kind==='description'?practiceDescription(q.id):q.kind==='number'?`¿Cómo se llama la pieza señalada con el número ${number}? La llamada oscura apunta a su superficie.`:q.scenario;
 app.innerHTML=toolbar+`<div class="practice-layout"><section class="viewport practice-viewport"><div class="viewport-top"><strong>${types[model].name}</strong><span class="tag">CORTE DIDÁCTICO</span></div><canvas id="model-canvas" tabindex="0" aria-label="Modelo de caldera. Flechas para girar, más y menos para zoom. Los botones Zona ofrecen las mismas selecciones."></canvas><div class="canvas-help">Arrastrá para girar · Tocá un número o una pieza · Rueda para acercar</div><div class="viewport-tools"><button class="secondary" id="practice-front">Vista frontal</button><button class="secondary" id="practice-reset">Vista inicial</button><button class="secondary" id="practice-zoom-out" aria-label="Alejar">−</button><button class="secondary" id="practice-zoom-in" aria-label="Acercar">+</button></div></section><section class="practice-question"><div class="eyebrow">${q.kind==='fault'?'DIAGNÓSTICO Y MANTENIMIENTO':q.kind==='number'?'IDENTIFICACIÓN POR NÚMERO':'IDENTIFICACIÓN POR FUNCIÓN'}</div><h2>${esc(prompt)}</h2>${q.kind!=='number'?`<p>${q.kind==='fault'?'Marcá todas las zonas solicitadas.':'Elegí una sola zona.'} Podés usar el modelo o estos botones.</p><div class="practice-zones">${ids.map((id,i)=>`<button class="secondary" data-practice-zone="${id}" aria-pressed="${p.picks.has(id)}" ${p.result?'disabled':''}>Zona ${i+1}</button>`).join('')}</div><p id="practice-selection" aria-live="polite"></p>`:`<fieldset ${p.result?'disabled':''}><legend>Elegí el nombre</legend>${q.choices.map(id=>`<label class="practice-choice"><input type="radio" name="practice-name" value="${id}" ${p.picks.has(id)?'checked':''}>${esc(part(id)[0])}</label>`).join('')}</fieldset>`}
 ${q.kind==='fault'?q.fields.map(f=>`<fieldset ${p.result?'disabled':''}><legend>${esc(f.label)}</legend>${f.choices.map((value,i)=>`<label class="practice-choice"><input type="radio" name="practice-${f.id}" data-practice-field="${f.id}" value="${i}" ${p.answers[f.id]===value?'checked':''}>${esc(value)}</label>`).join('')}</fieldset>`).join(''):''}
 ${p.result?practiceFeedback(q,p.result):'<button id="practice-check">Comprobar respuesta</button><p class="source">Lo que dejes sin responder contará como omitido. La solución aparece después de comprobar.</p>'}</section></div>`;
 document.querySelectorAll('[data-practice-zone]').forEach(b=>b.onclick=()=>practicePartSelected(b.dataset.practiceZone));
 document.querySelectorAll('[name="practice-name"]').forEach(b=>b.onchange=()=>{p.picks=new Set([b.value])});
 document.querySelectorAll('[data-practice-field]').forEach(b=>b.onchange=()=>{const f=q.fields.find(f=>f.id===b.dataset.practiceField);p.answers[f.id]=f.choices[+b.value]});
 document.querySelector('#practice-check')?.addEventListener('click',practiceSubmit);
 document.querySelector('#practice-next')?.addEventListener('click',()=>{if(p.screen!=='game'||!p.result)return;if(++p.index===p.deck.length)p.screen='summary';else practicePrepare();renderBoilerPractice()});
 canvas=document.querySelector('#model-canvas');ctx=canvas.getContext('2d');canvas.style.height=Math.max(520,Math.ceil(ids.length/2)*28+100)+'px';bindCanvas();
 document.querySelector('#practice-front').onclick=()=>{yaw=0;pitch=0;zoom=1};document.querySelector('#practice-reset').onclick=()=>{yaw=-.38;pitch=.16;zoom=1};document.querySelector('#practice-zoom-out').onclick=()=>zoom=Math.max(.55,zoom-.15);document.querySelector('#practice-zoom-in').onclick=()=>zoom=Math.min(1.7,zoom+.15);
 practiceRefreshSelection();raf=requestAnimationFrame(draw);if(p.result)document.querySelector('.practice-feedback')?.focus();
 }
 document.querySelector('#practice-exit').onclick=practiceExit;
 if(!p.result||p.screen!=='game')document.querySelector('#app')?.scrollIntoView?.({block:'start'});
}
