'use strict';
const el=id=>document.getElementById(id);
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
let catalogue;
function updateUnits(){const config=catalogue.subjects.find(s=>s.id===el('subject').value);el('unit').innerHTML='<option value="">Todas las unidades</option>'+(config?config.topics.map((t,i)=>`<option value="${i}">${escapeHTML(t)}</option>`).join(''):'');el('unit').disabled=!config}
function render(){
 const subject=el('subject').value,unit=el('unit').value,level=el('level').value,speed=el('speed').value,search=normalize(el('search').value.trim());
 const cards=catalogue.cards.filter(c=>(!subject||c.subject===subject)&&(unit===''||c.unit===Number(unit))&&c.modes.includes(level)&&normalize([c.id,c.subjectName,c.unitName,c.title,c.questions[level][speed]].join(' ')).includes(search));
 el('count').textContent=`${cards.length} consignas visibles · ${catalogue.cards.length} tarjetas almacenadas entre todas las materias. Las parejas PDF son variantes del mismo tema.`;
 el('questions').innerHTML=cards.length?cards.map(c=>`<article class="question"><p class="meta">${escapeHTML(c.subjectName)} · ${escapeHTML(c.unitName)} · ${escapeHTML(c.id)}</p>${c.bank==='thermal-pdf-bank'?`<span class="tag">Apunte · Variante ${c.variant+1} de 2</span><span class="tag">Una variante por tema en cada examen</span>`:''}${c.visual?'<span class="tag">Ejercicio con lámina</span>':''}<h2>${escapeHTML(c.questions[level][speed])}</h2>${c.visual?`<details><summary>Ver lámina del ejercicio</summary><img class="diagram" loading="lazy" src="${escapeHTML(c.visual.url)}" alt="${escapeHTML(c.visual.title)}"></details>`:''}<p class="sources">${c.sources.map(s=>escapeHTML(s.title)).join(' · ')}</p></article>`).join(''):'<p>No hay preguntas con estos filtros.</p>';
}
async function start(){try{const response=await fetch('assets/question-catalog.json');if(!response.ok)throw Error();catalogue=await response.json();el('subject').innerHTML+='<option value="termicas">Máquinas Térmicas de Uso Naval</option>'+catalogue.subjects.filter(s=>s.id!=='termicas').map(s=>`<option value="${escapeHTML(s.id)}">${escapeHTML(s.name)}</option>`).join('');const requested=new URLSearchParams(location.search).get('materia');if(catalogue.subjects.some(s=>s.id===requested))el('subject').value=requested;updateUnits();el('subject').addEventListener('change',()=>{updateUnits();render()});['unit','level','speed'].forEach(id=>el(id).addEventListener('change',render));el('search').addEventListener('input',render);render()}catch{el('count').textContent='No se pudo cargar el banco. Recargá la página para reintentar.'}}
start();
