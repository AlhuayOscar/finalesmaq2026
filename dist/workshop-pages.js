const pendingWorkshops=[
 {id:'taller-control-frio',name:'Taller: Sistemas de control y Frío',palette:'frio',icon:'❄'},
 {id:'taller-motores',name:'Taller: Motores',palette:'motores',icon:'◉'},
 {id:'taller-electricidad',name:'Taller: Electricidad',palette:'electrotecnia',icon:'ϟ'},
 {id:'taller-soldadura',name:'Taller: Soldadura Autógena',palette:'motores',icon:'♨'}
];
function registerWorkshopSubjects(subjects){for(const w of pendingWorkshops)subjects[w.id]={...subjects[w.palette],name:w.name,icon:w.icon,teacher:w.id==='taller-control-frio'?'Robbio':'',folder:null,description:'Espacio en preparación.',detail:'Material pendiente de incorporar.',underConstruction:true}}
function renderPendingWorkshop(){
 const s=navalSubjects[currentSubject];window.syncStudyLayout?.('inicio');syncSubjectChrome();document.querySelector('#topics').innerHTML='';
 document.querySelectorAll('nav a').forEach(a=>a.classList.toggle('active',a.hash==='#inicio'));
 if(currentSubject==='taller-control-frio'){renderFrioWorkshop();return}
 app.innerHTML=`<section class="pending-workshop"><span class="pending-badge">EN CONSTRUCCIÓN</span><div class="pending-icon" aria-hidden="true">${s.icon}</div><h1>${esc(s.name)}</h1><p class="lead">Este taller está dando sus primeros pasos.</p><p>Todavía no incorporamos material de estudio específico. Cuando contemos con apuntes, imágenes y guías de clase, iremos completando este espacio.</p><div class="pending-material"><strong>Materiales y actividades pendientes</strong><p>Por ahora no hay modelos, prácticas ni exámenes disponibles en este taller.</p></div></section><section class="pending-workshop-list" aria-label="Otros talleres en construcción"><h2>Los talleres que estamos preparando</h2><div class="grid">${pendingWorkshops.map(w=>`<article class="card"><span class="eyebrow">EN CONSTRUCCIÓN</span><h3>${esc(w.name)}</h3><p>${w.id==='taller-control-frio'?'Robbio · Fotos y primeros recorridos de estudio.':'Contenido pendiente de incorporar.'}</p>${w.id===currentSubject?'<span class="pending-current">Estás en este taller</span>':`<button class="secondary" data-pending-workshop="${w.id}">Abrir taller →</button>`}</article>`).join('')}</div></section>`;
 document.querySelectorAll('[data-pending-workshop]').forEach(b=>b.onclick=()=>changeSubject(b.dataset.pendingWorkshop));
}
