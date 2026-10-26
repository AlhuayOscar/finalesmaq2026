function frioSlideSelectorMarkup(){
 if(currentSubject!=='frio')return '';
 return `<section class="frio-slide-selector"><label for="exam-slides">Elegir diapositivas</label><input id="exam-slides" type="text" inputmode="text" maxlength="80" placeholder="Ej.: 1, 23, 53" aria-describedby="exam-slides-help exam-slides-status" autocomplete="off"><p id="exam-slides-help">Escribí hasta 6 números originales, separados por comas. Se toma una explicación completa por diapositiva, en ese orden. Dejalo vacío para rendir por tema.</p><div id="exam-slides-status" role="status" aria-live="polite"></div><ol id="exam-slides-preview"></ol><details><summary>Ver números disponibles</summary><div class="frio-slide-index">${(window.frioSlideCatalog||[]).map(s=>`<p><strong>${s.number}</strong> · ${esc(s.title)} <small>PDF ${s.page}${s.available?'':' · pendiente de identificación'}</small></p>`).join('')}</div></details><a href="https://drive.google.com/file/d/1fvPtD1mW_xkfpKaNKIygVl4J5rYK4FQ-/view" target="_blank" rel="noopener">Abrir archivo de diapositivas ↗</a><p class="frio-rigor">Simulacro: difícil. HDP: muy difícil. Se exige explicar todos los pasos y partes solicitados, con terminología y relaciones precisas. Desarrollo incompleto: máximo 6,90 en Simulacro y 5,90 en HDP; puede ser menor según las omisiones.</p></section>`;
}
function frioSlideResult(){return currentSubject==='frio'?window.frioSlideSelection.parse(exam.slideInput||'',window.frioSlideCatalog||[]):{numbers:[],error:''}}
window.frioSlideError=()=>frioSlideResult().error;
window.mountFrioSlideSelector=()=>{
 const input=examElement('exam-slides');if(!input)return;input.value=exam.slideInput||'';
 input.oninput=e=>{exam.slideInput=e.target.value;const result=frioSlideResult();exam.slideNumbers=result.numbers;if(!result.error&&result.numbers.length){exam.unit=-1;exam.includeVisual=true;exam.loop=false;examElement('exam-unit').value='-1';examElement('exam-visual').checked=true;examElement('exam-loop').checked=false}updateExam()};
};
window.updateFrioSlideSelector=()=>{
 const input=examElement('exam-slides');if(!input)return;
 const result=frioSlideResult(),selected=!!String(exam.slideInput||'').trim(),locked=exam.busy||exam.recording||(exam.started&&!exam.finished);
 input.disabled=locked;input.setAttribute('aria-invalid',String(!!result.error));
 examElement('exam-slides-status').textContent=result.error||(selected?result.numbers.length+' / 6 diapositivas elegidas':'Sin selección: examen por tema.');
 examElement('exam-slides-preview').innerHTML=result.error?'':result.numbers.map(n=>{const s=window.frioSlideCatalog.find(s=>s.number===n);return `<li><strong>Diapositiva ${n}</strong> · ${esc(s.title)} <a target="_blank" rel="noopener" href="/assets/frio-slides/${n}.jpg">Ver lámina ↗</a></li>`}).join('');
 if(selected){for(const id of ['exam-unit','exam-visual','exam-loop'])examElement(id).disabled=true;}
};
