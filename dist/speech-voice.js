// Usa exclusivamente las voces que expone el navegador; sin API ni cuentas.
(()=>{
  const engine=window.speechSynthesis;
  if(!engine)return;
  let generation=0;
  const cancel=engine.cancel.bind(engine);
  engine.cancel=()=>{generation++;cancel()};
  const language=v=>(v.lang||'').replace(/_/g,'-').toLowerCase();
  function choose(preferred){
    const voices=engine.getVoices();
    const spanish=voices.filter(v=>/^es(?:-|$)/.test(language(v)));
    const google=v=>/google/i.test((v.name||'')+' '+(v.voiceURI||''));
    return voices.find(v=>preferred&&v.voiceURI===preferred)
      ||spanish.find(v=>language(v)==='es-ar'&&google(v))
      ||spanish.find(v=>language(v)==='es-ar')
      ||spanish.find(google)||null;
  }
  window.finalesSpeech={choose,speak(utterance,{preferred='',isCurrent=()=>true,onUtterance=()=>{}}={}){
    const current=generation,chosen=choose(preferred);
    const end=utterance.onend,error=utterance.onerror;
    const valid=()=>current===generation&&isCurrent();
    function play(u,fallback){
      u.onend=e=>{if(valid())end?.(e)};
      u.onerror=e=>{
        if(!valid())return;
        if(!fallback&&chosen&&['voice-unavailable','language-unavailable','synthesis-unavailable','synthesis-failed','audio-busy','audio-hardware','network'].includes(e.error)){
          const system=new SpeechSynthesisUtterance(utterance.text);
          system.rate=utterance.rate;system.pitch=utterance.pitch;system.volume=utterance.volume;
          // Sin voice ni lang: se delega la elección al sistema.
          play(system,true);
        }else error?.(e);
      };
      onUtterance(u);
      try{engine.speak(u)}catch(e){u.onerror({error:'synthesis-failed',cause:e})}
    }
    if(chosen){utterance.voice=chosen;utterance.lang=chosen.lang}
    else{utterance.voice=null;utterance.lang=''}
    play(utterance,false);
  }};
})();
