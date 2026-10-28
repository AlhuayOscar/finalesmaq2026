function renderStudyExplanation(data){
 const components=data.studyComponents||[],sections=data.studySections||[],connections=components.some(c=>c.connection);
 return `<div class="better-answer"><strong>El profesor responde</strong><p class="technical-feedback">${esc(data.studyAnswer||'')}</p></div>${components.length?`<section class="study-functions"><h3>Elementos y funciones que pide la pregunta</h3><div class="study-functions-scroll"><table><thead><tr><th scope="col">Elemento</th><th scope="col">Función: qué hace y para qué sirve</th>${connections?'<th scope="col">Conexión, recorrido o relación</th>':''}</tr></thead><tbody>${components.map(c=>`<tr><th scope="row">${esc(c.name)}</th><td>${esc(c.function)}</td>${connections?`<td>${esc(c.connection||'')}</td>`:''}</tr>`).join('')}</tbody></table></div></section>`:''}${sections.length?`<section class="study-point-answers"><h3>Respuesta a cada punto de la consigna</h3>${sections.map((s,i)=>`<section class="study-point-answer"><h4>${i+1}. ${esc(s.title)}</h4>${s.limited?'<strong class="source">Límite de la fuente</strong>':''}<p class="technical-feedback">${esc(s.answer)}</p></section>`).join('')}</section>`:''}${data.componentsUnavailableReason?`<p class="source"><strong>Identificación de elementos:</strong> ${esc(data.componentsUnavailableReason)}</p>`:''}`;
}
function renderStudyMessage(data,index){
 const figures=(data.sourceFigures||[]).filter(f=>/^\/assets\/(?:termicas-fuentes\/[a-z-]+\.webp|frio-slides\/\d+\.jpg)$/.test(f.image));
 return `<div class="question-block"><div class="question-heading"><span>ESTUDIAR EXAMEN · PREGUNTA</span><button class="repeat-question" data-repeat-index="${index}" aria-label="Escuchar pregunta y respuesta">↻</button></div><p class="question-text"><strong>${esc(data.question||'Estudio completado')}</strong></p></div>${renderStudyExplanation(data)}${figures.map(f=>`<figure class="identify-figure study-original"><a href="${esc(f.image)}" target="_blank" rel="noopener"><img src="${esc(f.image)}" alt="${esc(f.alt||f.title)}" loading="lazy"></a><figcaption><strong>${esc(f.title)}</strong><p>${esc(f.caption||'')}</p><a href="${esc(f.url)}" target="_blank" rel="noopener">${esc(f.source)}${f.page?' · página PDF '+Number(f.page):''} ↗</a></figcaption></figure>`).join('')}<p class="source">${esc(data.studyNotice||'')} Respuesta de estudio basada en el material disponible; no implica una cita literal.</p><div class="source-links">${(data.sources||[]).map(s=>`<a href="${esc(examSourceURL(s))}" target="_blank" rel="noopener">${esc(s.title)} ↗</a>`).join('')}</div>`;
}
let studyStartJob=null;
window.studyStartPending=()=>!!studyStartJob;
window.cancelStudyStart=()=>{const job=studyStartJob;studyStartJob=null;job?.cancel()};
window.stopStudyStart=()=>{window.cancelStudyStart();exam.busy=false;exam.error='Inicio detenido. Podés volver a pulsar «Comenzar a estudiar» para intentarlo de nuevo.';updateExam()};
async function askStudyExam(action){
 if(action==='start'&&studyStartJob){window.stopStudyStart();return}
 if(exam.busy)return;
 if(action==='finish'){exam.finished=true;window.speechSynthesis?.cancel();updateExam();return}
 if(!['start','answer'].includes(action))return;
 const active=exam,owner=maqAccount.user?.id,subject=currentSubject;
 if(action==='start'){exam.notice='';window.enterProfessorZen?.()}
 exam.busy=true;exam.error='';window.speechSynthesis?.cancel();updateExam();
 const body={action:action==='start'?'start':'study-next',subject:exam.subject||currentSubject,unit:exam.unit,level:'estudiar',scope:exam.scope,speed:exam.speed,includeVisual:exam.includeVisual,slideNumbers:subject==='frio'?[...(exam.slideNumbers||[])]:[],loop:exam.loop,planToken:action==='start'?null:exam.planToken};
 const isCurrent=()=>active===exam&&owner===maqAccount.user?.id&&subject===currentSubject&&exam.level==='estudiar';
 const job=action==='start'?createProfessorRetry({repeat:true,isCurrent,onState:state=>{if(isCurrent()){exam.error=state.waiting?state.error+' Reintentando automáticamente · intento '+state.attempt+'. Pulsá «Detener inicio» para cancelar.':'';updateExam()}}}):null;
 if(job){studyStartJob=job;updateExam()}
 let timeout=null;
 try{
  const request=async signal=>{const data=await professorRetryJSON('/api/exam',body,signal);if(!data.study||typeof data.studyAnswer!=='string'||!data.studyAnswer.trim()||typeof data.speech!=='string'||!data.speech.trim())throw Error('La explicación llegó incompleta.');return data};
  let data;
  if(job){data=await job.run(request);if(!data)return}
  else{const controller=new AbortController();examAbort=controller;timeout=setTimeout(()=>controller.abort(),60000);data=await request(controller.signal)}
  if(!isCurrent()||job?.cancelled)return;
  exam.error='';
  if(data.planToken)exam.planToken=data.planToken;if(data.planProgress)exam.planProgress=data.planProgress;
  exam.messages.push({role:'model',data});exam.started=true;exam.finished=data.finished===true;
  if(exam.voice)speakProfessor(data.speech);
 }catch(e){if(active===exam)exam.error=e.name==='AbortError'?'Se detuvo la explicación. Podés volver a intentar.':e.message}
 finally{clearTimeout(timeout);if(job&&studyStartJob===job)studyStartJob=null;if(active===exam&&(!job||!studyStartJob||studyStartJob===job)){exam.busy=false;updateExam()}}
}
const updateExamBeforeStudy=updateExam;
updateExam=function(){
 updateExamBeforeStudy();if(!examElement('exam-state'))return;
 const study=exam.level==='estudiar',composer=examElement('exam-composer');composer.hidden=study;
 let controls=examElement('study-exam-controls');
 if(!controls){controls=document.createElement('section');controls.id='study-exam-controls';controls.className='exam-bottom-actions';controls.innerHTML='<button id="study-exam-next">Siguiente pregunta y respuesta →</button><button id="study-exam-listen" class="secondary">Escuchar explicación</button><button id="study-exam-stop" class="text-button">Detener voz</button><button id="study-exam-finish" class="text-button">Finalizar estudio</button><button id="study-exam-download" class="text-button">Descargar texto y copiar</button>';composer.before(controls);examElement('study-exam-next').onclick=()=>askExam('answer');examElement('study-exam-listen').onclick=()=>{const m=exam.messages.at(-1);if(m?.data)speakProfessor(m.data.speech)};examElement('study-exam-stop').onclick=()=>window.speechSynthesis?.cancel();examElement('study-exam-finish').onclick=()=>askExam('finish');examElement('study-exam-download').onclick=downloadExam}
 controls.hidden=!study;
 if(study){examElement('exam-state').textContent=studyStartJob?(studyStartJob.waiting?'Esperando para reintentar':'Preparando explicación')+' · intento '+studyStartJob.attempt:exam.busy?'Preparando explicación…':exam.finished?'Estudio finalizado':exam.started?'El profesor pregunta y responde · sin nota':'Listo para estudiar';examElement('exam-start').textContent=studyStartJob?'Detener inicio · intento '+studyStartJob.attempt:exam.started?'Nuevo estudio':'Comenzar a estudiar';if(studyStartJob)examElement('exam-start').disabled=false;for(const id of ['study-exam-next','study-exam-listen','study-exam-finish'])examElement(id).disabled=exam.busy||!exam.started||exam.finished;examElement('study-exam-download').disabled=!exam.messages.length}
};
