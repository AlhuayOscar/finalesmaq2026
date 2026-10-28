function renderStudyMessage(data,index){
 const figures=(data.sourceFigures||[]).filter(f=>/^\/assets\/(?:termicas-fuentes\/[a-z-]+\.webp|frio-slides\/\d+\.jpg)$/.test(f.image));
 return `<div class="question-block"><div class="question-heading"><span>ESTUDIAR EXAMEN · PREGUNTA</span><button class="repeat-question" data-repeat-index="${index}" aria-label="Escuchar pregunta y respuesta">↻</button></div><p class="question-text"><strong>${esc(data.question||'Estudio completado')}</strong></p></div><div class="better-answer"><strong>El profesor responde</strong><p class="technical-feedback">${esc(data.studyAnswer||'')}</p></div>${figures.map(f=>`<figure class="identify-figure study-original"><a href="${esc(f.image)}" target="_blank" rel="noopener"><img src="${esc(f.image)}" alt="${esc(f.alt||f.title)}" loading="lazy"></a><figcaption><strong>${esc(f.title)}</strong><p>${esc(f.caption||'')}</p><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.source)}${f.page?' · página PDF '+Number(f.page):''} ↗</a></figcaption></figure>`).join('')}<p class="source">${esc(data.studyNotice||'')} Respuesta de estudio basada en el material disponible; no implica una cita literal.</p><div class="source-links">${(data.sources||[]).map(s=>`<a href="${esc(examSourceURL(s))}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`).join('')}</div>`;
}
async function askStudyExam(action){
 if(exam.busy)return;
 if(action==='finish'){exam.finished=true;window.speechSynthesis?.cancel();updateExam();return}
 if(!['start','answer'].includes(action))return;
 const active=exam,owner=maqAccount.user?.id,subject=currentSubject;
 exam.busy=true;exam.error='';window.speechSynthesis?.cancel();updateExam();
 const controller=new AbortController();examAbort=controller;const timeout=setTimeout(()=>controller.abort(),60000);
 try{
  const response=await fetch('/api/exam',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({action:action==='start'?'start':'study-next',subject:exam.subject||currentSubject,unit:exam.unit,level:'estudiar',scope:exam.scope,speed:exam.speed,includeVisual:exam.includeVisual,slideNumbers:subject==='frio'?exam.slideNumbers:[],loop:exam.loop,planToken:action==='start'?null:exam.planToken})});
  const data=await response.json();if(active!==exam||owner!==maqAccount.user?.id||subject!==currentSubject)return;
  if(!response.ok)throw Error(data.error||'No se pudo preparar la explicación.');
  if(!data.study||typeof data.studyAnswer!=='string')throw Error('La explicación llegó incompleta.');
  if(data.planToken)exam.planToken=data.planToken;if(data.planProgress)exam.planProgress=data.planProgress;
  exam.messages.push({role:'model',data});exam.started=true;exam.finished=data.finished===true;
  if(exam.voice)speakProfessor(data.speech);
 }catch(e){if(active===exam)exam.error=e.name==='AbortError'?'Se detuvo la explicación. Podés volver a intentar.':e.message}
 finally{clearTimeout(timeout);if(active===exam){exam.busy=false;updateExam()}}
}
const updateExamBeforeStudy=updateExam;
updateExam=function(){
 updateExamBeforeStudy();if(!examElement('exam-state'))return;
 const study=exam.level==='estudiar',composer=examElement('exam-composer');composer.hidden=study;
 let controls=examElement('study-exam-controls');
 if(!controls){controls=document.createElement('section');controls.id='study-exam-controls';controls.className='exam-bottom-actions';controls.innerHTML='<button id="study-exam-next">Siguiente pregunta y respuesta →</button><button id="study-exam-listen" class="secondary">Escuchar explicación</button><button id="study-exam-stop" class="text-button">Detener voz</button><button id="study-exam-finish" class="text-button">Finalizar estudio</button><button id="study-exam-download" class="text-button">Descargar texto y copiar</button>';composer.before(controls);examElement('study-exam-next').onclick=()=>askExam('answer');examElement('study-exam-listen').onclick=()=>{const m=exam.messages.at(-1);if(m?.data)speakProfessor(m.data.speech)};examElement('study-exam-stop').onclick=()=>window.speechSynthesis?.cancel();examElement('study-exam-finish').onclick=()=>askExam('finish');examElement('study-exam-download').onclick=downloadExam}
 controls.hidden=!study;
 if(study){examElement('exam-state').textContent=exam.busy?'Preparando explicación…':exam.finished?'Estudio finalizado':exam.started?'El profesor pregunta y responde · sin nota':'Listo para estudiar';examElement('exam-start').textContent=exam.started?'Nuevo estudio':'Comenzar a estudiar';for(const id of ['study-exam-next','study-exam-listen','study-exam-finish'])examElement(id).disabled=exam.busy||!exam.started||exam.finished;examElement('study-exam-download').disabled=!exam.messages.length}
};
