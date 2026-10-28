// Paneles laterales y flotantes colapsables. El estado vive en clases de <body>,
// así sobrevive a cada re-render de #app sin tocar la lógica de las páginas.
(()=>{
 // Íconos estilo "panel": un rectángulo con la franja del panel resaltada.
 const icon=side=>{
  const strip={left:'<rect x="3" y="4" width="6" height="16" rx="1" fill="currentColor" opacity=".35"/><line x1="9" y1="4" x2="9" y2="20"/>',
   top:'<rect x="3" y="4" width="18" height="6" rx="1" fill="currentColor" opacity=".35"/><line x1="3" y1="10" x2="21" y2="10"/>'}[side];
  return `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/>${strip}</svg>`;
 };
 const panels=[
  {key:'outline',selector:'.guided-outline',host:'.guided-layout',kind:'side',icon:'left',show:'Mostrar temas de la lección',hide:'Ocultar temas de la lección'},
  {key:'exam',selector:'.exam-settings',host:'.exam-shell',kind:'side',icon:'left',show:'Mostrar ajustes del examen',hide:'Ocultar ajustes del examen'},
  {key:'player',selector:'.guided-player',inside:'.guided-player-heading',kind:'float',icon:'top',show:'Mostrar todos los controles de voz',hide:'Compactar controles de voz'}
 ];
 const storeKey=k=>'naval-panel-collapsed-'+k;
 const isCollapsed=k=>document.body.classList.contains('panel-collapsed-'+k);
 function setCollapsed(p,value){
  document.body.classList.toggle('panel-collapsed-'+p.key,value);
  try{localStorage.setItem(storeKey(p.key),value?'1':'0')}catch{}
  refresh(p);
 }
 function refresh(p){
  // Solo atributos: no modifica nodos hijos, así el MutationObserver no entra en bucle.
  document.querySelectorAll('[data-panel-toggle="'+p.key+'"]').forEach(b=>{
   const c=isCollapsed(p.key),label=c?p.show:p.hide;
   if(b.title!==label){b.title=label;b.setAttribute('aria-label',label)}
   b.setAttribute('aria-expanded',String(!c));
  });
 }
 function makeButton(p){
  const b=document.createElement('button');b.type='button';b.className='panel-toggle panel-toggle-'+p.icon;b.dataset.panelToggle=p.key;
  b.innerHTML=icon(p.icon);b.onclick=()=>setCollapsed(p,!isCollapsed(p.key));return b;
 }
 function ensure(){
  for(const p of panels){
   const panel=document.querySelector(p.selector);if(!panel)continue;
   if(p.kind==='side'){
    const host=panel.closest(p.host);if(!host)continue;
    const prev=host.previousElementSibling;
    if(!(prev&&prev.classList.contains('panel-bar')&&prev.querySelector('[data-panel-toggle="'+p.key+'"]'))){
     const bar=document.createElement('div');bar.className='panel-bar';bar.appendChild(makeButton(p));host.before(bar);
    }
   }else{
    const target=panel.querySelector(p.inside)||panel;
    if(!target.querySelector('[data-panel-toggle="'+p.key+'"]'))target.appendChild(makeButton(p));
   }
   refresh(p);
  }
 }
 for(const p of panels){try{document.body.classList.toggle('panel-collapsed-'+p.key,localStorage.getItem(storeKey(p.key))==='1')}catch{}}
 const app=document.getElementById('app');
 if(app)new MutationObserver(ensure).observe(app,{childList:true,subtree:true});
 ensure();
})();
