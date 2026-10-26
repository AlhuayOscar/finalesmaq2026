function exportAudioLines(record,geminiTranscript,hasAudio){
 if(!hasAudio&&!record&&!geminiTranscript)return [];
 const local=String(record?.text||'').trim(),gemini=String(geminiTranscript||'').trim();
 const lines=['TRANSCRIPCIÓN INDEPENDIENTE DEL AUDIO ('+(record?.edited?'revisada por el alumno':'Whisper local')+'):',local||'[Sin transcripción independiente: pendiente, detenida o no disponible. No inventar lo dicho.]'];
 if(record?.edited&&record.rawText&&record.rawText!==local)lines.push('Texto original reconocido por Whisper:',record.rawText);
 if(gemini)lines.push('TRANSCRIPCIÓN DEVUELTA POR GEMINI:',gemini);
 return lines;
}
function buildExamExport(){
 const subject=exam.subject||currentSubject,name=navalSubjects[subject]?.name||subject;
 const lines=['EXAMEN ORAL · '+name,'Para revisar en ChatGPT: analizá mis respuestas, explicá los errores y sugerí qué repasar. Diferenciá lo que respondí de las referencias y devoluciones. No inventes texto de audios pendientes ni tomes una falla del servidor como una respuesta incorrecta.','Tema: '+(exam.unit===-1?'Integrador':examTopics[exam.unit]||exam.unit),'Modalidad: '+exam.level+' · Nivel: '+(depthLabels[exam.depth]||exam.depth)+' · Alcance: '+exam.scope+' · Velocidad: '+(speedLabels[exam.speed]||exam.speed),'Estado: '+(exam.finished?'Finalizado':'En curso'),'Las notas y resoluciones son orientativas. Las imágenes y archivos de audio no están incluidos en este texto.',''];
 if(exam.reviewItems?.length){lines.push('PREGUNTAS Y RESPUESTAS GUARDADAS','');
  exam.reviewItems.forEach((item,i)=>{lines.push('PREGUNTA '+(i+1),item.question,'RESPUESTA ESCRITA POR MÍ:',item.text||'[Sin respuesta escrita]',...exportAudioLines(item.audioText,item.audio?item.transcript:'',!!item.audio),'Estado: '+(item.status==='evaluated'?'Evaluada · '+Number(item.score).toFixed(2)+'/10':item.status==='resolved'?'Resolución consultada; sin nota automática':'Pendiente; sin nota'));
   if(item.image)lines.push('[Imagen adjunta a esta respuesta; no incluida en el texto.]');
   if(item.feedback)lines.push('DEVOLUCIÓN:',item.feedback);
   if(item.referenceAnswer)lines.push('RESPUESTA DE REFERENCIA (no es mi respuesta):',item.referenceAnswer);
   if(item.resolution)lines.push('RESOLUCIÓN CONSULTADA:',item.resolution);
   if(item.sources?.length)lines.push('Fuentes: '+item.sources.map(s=>s.title+(s.url?' · '+s.url:'')).join('; '));lines.push('');
  });
 }
 lines.push('CONVERSACIÓN COMPLETA EN ORDEN','');
 for(const m of exam.messages||[]){
  if(m.role==='user'){lines.push('YO:',m.writtenText!==undefined?m.writtenText||'[Sin texto escrito]':m.text||'[Sin texto]');lines.push(...exportAudioLines(m.audioText,m.geminiTranscript,m.hadAudio));if(m.image)lines.push('[Foto adjunta al profesor; no incluida en este texto.]')}
  else{const d=m.data||{};lines.push('PROFESOR:',d.speech||d.question||'');if(d.transcript)lines.push('Texto/transcripción registrado por Gemini para la respuesta anterior: '+d.transcript);if(d.feedback)lines.push('Devolución: '+d.feedback);if(d.strengths?.length)lines.push('Fortalezas: '+d.strengths.join('; '));if(d.improvements?.length)lines.push('Para repasar: '+d.improvements.join('; '));if(d.omissions?.length)lines.push('Omisiones: '+d.omissions.join('; '));if(d.betterAnswer)lines.push('Referencia preparada: '+d.betterAnswer);if(d.evaluated)lines.push('Nota orientativa: '+Number(d.score).toFixed(2)+'/10');if(d.sessionAverage!==undefined)lines.push('Promedio orientativo: '+Number(d.sessionAverage).toFixed(2)+'/10');if(d.visual?.url)lines.push('Lámina: https://finalesmaq2026.vercel.app'+d.visual.url);if(d.reference)lines.push('Fuente: '+d.reference)}lines.push('');
 }
 const draft=examElement('exam-text')?.value||exam.draft||'';
 if(draft||exam.blob){lines.push('RESPUESTA ACTUAL SIN ENVIAR:',draft||'[Sin texto escrito]',...exportAudioLines(exam.recordedTranscript,'',!!exam.blob),'')}
 const followup=examElement('exam-followup-text')?.value||exam.followupDraft||'';if(followup)lines.push('CONSULTA AL PROFESOR SIN ENVIAR:',followup);if(exam.followupImage)lines.push('[Foto adjunta pendiente de enviar al profesor: '+exam.followupImage.name+'; no incluida en el texto.]');
 return lines.join('\n');
}
function legacyCopyExamText(text){const field=document.createElement('textarea');field.value=text;field.setAttribute('readonly','');field.style.position='fixed';field.style.opacity='0';document.body.append(field);field.select();let copied=false;try{copied=document.execCommand('copy')}finally{field.remove()}return copied}
function copyExactExamText(text){if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);return legacyCopyExamText(text)?Promise.resolve():Promise.reject(Error('No se pudo acceder al portapapeles.'))}
function examExportStatus(text,manualText){exam.exportStatus=text;const status=examElement('exam-export-status');if(status)status.textContent=text;const manual=examElement('exam-export-manual');if(manual){manual.hidden=!manualText;if(manualText)manual.value=manualText}const label=examElement('exam-export-manual-label');if(label)label.hidden=!manualText}
async function downloadExamText(){
 if(window.hasActiveTranscriptions?.()){examExportStatus('Esperá a que termine la transcripción o detenela antes de descargar.');return}
 const text=buildExamExport(),active=exam,owner=maqAccount.user?.id;
 // Start clipboard access inside the original user gesture, before any await.
 let copying;try{copying=copyExactExamText(text)}catch(e){copying=Promise.reject(e)}
 const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='examen-oral-'+(exam.subject||currentSubject)+'.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 try{await copying;if(exam===active&&maqAccount.user?.id===owner)examExportStatus('Texto descargado y examen completo copiado al portapapeles. Ya podés pegarlo en ChatGPT.')}
 catch{if(exam===active&&maqAccount.user?.id===owner)examExportStatus('Texto descargado. El navegador bloqueó el portapapeles: usá «Copiar examen» o copiá el texto de abajo.',text)}
}
async function copyFullExam(){if(window.hasActiveTranscriptions?.())return;const text=buildExamExport(),active=exam,owner=maqAccount.user?.id;try{await copyExactExamText(text);if(exam===active&&maqAccount.user?.id===owner)examExportStatus('Examen completo copiado. Ya podés pegarlo en ChatGPT.')}catch{if(exam===active&&maqAccount.user?.id===owner)examExportStatus('No se pudo copiar automáticamente. Seleccioná y copiá el examen de abajo.',text)}}
window.downloadExamText=downloadExamText;
window.renderExamExport=()=>{
 const composer=examElement('exam-composer');if(!composer)return;
 let panel=examElement('exam-export');if(!panel){panel=document.createElement('section');panel.id='exam-export';panel.innerHTML='<button id="exam-copy" type="button" class="text-button">Copiar examen</button><button id="exam-transcribe-all" type="button" class="text-button">Transcribir audios pendientes sin Gemini</button><p id="exam-export-status" role="status"></p><label id="exam-export-manual-label">Texto completo para copiar<textarea id="exam-export-manual" readonly hidden aria-label="Examen completo para copiar manualmente"></textarea></label>';composer.append(panel);examElement('exam-copy').onclick=copyFullExam;examElement('exam-transcribe-all').onclick=()=>window.transcribePendingExamAudio?.()}
 const busy=window.hasActiveTranscriptions?.();examElement('exam-copy').disabled=!!busy||!exam.messages.length;const pending=(exam.reviewItems||[]).filter(i=>i.audio&&!String(i.audioText?.text||i.transcript||'').trim()).length;examElement('exam-transcribe-all').hidden=!pending;examElement('exam-transcribe-all').disabled=!!busy;
 const status=examElement('exam-export-status'),text=exam.exportStatus||(pending?pending+' audio(s) sin texto todavía. Podés transcribirlos sin Gemini antes de descargar.':'La descarga también copia el examen completo al portapapeles.');if(status.textContent!==text)status.textContent=text;
 const label=examElement('exam-export-manual-label');if(label)label.hidden=examElement('exam-export-manual').hidden;
};
if(location.hash==='#profesor')window.renderExamTranscription?.();
