// Layout state does not rerender or interrupt an exam.
(()=>{
 const key='naval-sidebar-collapsed-v1';let collapsed=false,lastRoute='',zenDismissed=false;
 try{collapsed=localStorage.getItem(key)==='1'}catch{}
 function sync(route=location.hash.slice(1)||'taller'){
  if(route!==lastRoute){zenDismissed=false;lastRoute=route}
  const zen=route==='profesor'&&!zenDismissed;
  document.body.classList.toggle('sidebar-collapsed',collapsed);
  document.body.classList.toggle('professor-zen',zen);
  const sidebar=document.getElementById('app-sidebar');if(sidebar)sidebar.inert=collapsed||zen;
  const button=document.getElementById('sidebar-toggle');if(button){button.textContent=collapsed?'☰ Mostrar menú':'◀ Ocultar menú';button.setAttribute('aria-expanded',String(!collapsed&&!zen));button.title=collapsed?'Mostrar barra lateral':'Ocultar barra lateral'}
 }
 window.syncStudyLayout=sync;
 window.enterProfessorZen=()=>{zenDismissed=false;sync('profesor')};
 window.leaveProfessorZen=()=>{zenDismissed=true;lastRoute='profesor';sync('profesor')};
 const button=document.getElementById('sidebar-toggle');if(button)button.onclick=()=>{collapsed=!collapsed;try{localStorage.setItem(key,collapsed?'1':'0')}catch{}sync()};
 sync();
})();
