import {steps} from './carga-split-data.js';
const $=id=>document.getElementById(id);
let step=0,elapsed=0,playing=false,speed=1,view=null,raf=0,last=0,voicing=false;
const duration=18;
function paint(){
 const s=steps[step];$('phase').textContent=s.phase;$('step-title').textContent=s.title;$('scene-title').textContent=s.title;
 for(const k of ['description','before','action','after','attention'])$(k).textContent=s[k];
 $('step-source').textContent='Referencia: '+s.source;$('scene-message').textContent=s.message;
 $('power-state').textContent=s.run?'COMPRESOR EN MARCHA':step===17?'PARADA NORMAL':'COMPRESOR DETENIDO';
 $('valves').innerHTML='<div><span>Válvula de servicio de gas</span><b>Abierta</b></div><div><span>Válvula de tubería pequeña</span><b>Abierta</b></div><div><span>Llave de baja del manifold</span><b>'+s.low+'</b></div><div><span>Llave de alta del manifold</span><b>Cerrada / sin conexión</b></div>';
 $('counter').textContent=`Paso ${step+1} de ${steps.length}`;$('previous').disabled=step===0;$('next').disabled=step===steps.length-1;
 document.querySelectorAll('[data-step]').forEach(b=>{if(+b.dataset.step===step)b.setAttribute('aria-current','step');else b.removeAttribute('aria-current')});
 $('progress').style.width=(elapsed/duration*100)+'%';$('play').textContent=playing?'Ⅱ Pausar':'▶ Reproducir paso';
 view?.setStep(s,step);view?.focus(s.focus);
}
function choose(i,continuePlaying=false){speechSynthesis?.cancel();voicing=false;step=Math.max(0,Math.min(i,steps.length-1));elapsed=0;playing=continuePlaying;paint();}
document.getElementById('steps').innerHTML=steps.map((s,i)=>`<button data-step="${i}"><span>${String(i+1).padStart(2,'0')}</span>${s.title}</button>`).join('');
document.querySelectorAll('[data-step]').forEach(b=>b.onclick=()=>{choose(+b.dataset.step);document.querySelector?.('.workspace')?.scrollIntoView({behavior:'smooth',block:'start'})});
$('previous').onclick=()=>choose(step-1);$('next').onclick=()=>choose(step+1);$('repeat').onclick=()=>choose(step,true);
$('play').onclick=()=>{if(elapsed>=duration)elapsed=0;playing=!playing;$('play').textContent=playing?'Ⅱ Pausar':'▶ Reproducir paso'};
$('speed').onchange=e=>speed=+e.target.value;
$('speak').onclick=()=>{if(!('speechSynthesis'in window)){$('step-source').textContent='Este navegador no dispone de voz. La explicación completa está escrita arriba.';return}speechSynthesis.cancel();const s=steps[step],u=new SpeechSynthesisUtterance(`${s.title}. ${s.description} Antes: ${s.before} Qué hacemos: ${s.action} Después: ${s.after} Atención: ${s.attention}`);u.lang='es-AR';u.rate=.95;u.voice=speechSynthesis.getVoices().find(v=>v.lang==='es-AR')||speechSynthesis.getVoices().find(v=>v.lang.startsWith('es'))||null;voicing=true;u.onend=u.onerror=()=>voicing=false;speechSynthesis.speak(u)};
$('stop-voice').onclick=()=>{speechSynthesis?.cancel();voicing=false};
document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>view?.focus(b.dataset.view));
$('cut').onclick=()=>{const on=$('cut').getAttribute('aria-pressed')!=='true';$('cut').setAttribute('aria-pressed',on);$('cut').textContent=on?'Interior visible':'Mostrar interior';view?.cut(on)};
$('label-toggle').onclick=()=>{const on=$('label-toggle').getAttribute('aria-pressed')!=='true';$('label-toggle').setAttribute('aria-pressed',on);$('labels').hidden=!on};
document.addEventListener('visibilitychange',()=>{last=0;if(document.hidden){playing=false;$('play').textContent='▶ Reproducir paso';speechSynthesis?.cancel();voicing=false}});
paint();
try{const {createScene}=await import('./carga-split-scene.js');view=await createScene($('scene'),$('labels'));paint();}catch(e){$('load-error').hidden=false;console.error('Vista 3D:',e)}
function tick(t){const dt=last?Math.min((t-last)/1000,.08):0;last=t;if(playing){elapsed=Math.min(duration,elapsed+dt*speed);$('progress').style.width=(elapsed/duration*100)+'%';if(elapsed>=duration&&!voicing){if($('auto').checked&&step<steps.length-1)choose(step+1,true);else{playing=false;$('play').textContent='▶ Reproducir paso'}}}view?.update(playing?dt*speed:0,elapsed/duration);raf=requestAnimationFrame(tick)}
raf=requestAnimationFrame(tick);
window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);speechSynthesis?.cancel();view?.dispose()},{once:true});
