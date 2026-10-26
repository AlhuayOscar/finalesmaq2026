(function(root){
  function parse(value,catalog){
    const raw=String(value??'').trim();if(!raw)return {numbers:[],error:''};
    if(!/^\d+(?:[\s,;]+\d+)*$/.test(raw))return {numbers:[],error:'Escribí números separados por comas o espacios; no rangos ni decimales.'};
    const numbers=raw.split(/[\s,;]+/).map(Number);
    if(numbers.length>6)return {numbers,error:'Podés elegir hasta 6 diapositivas.'};
    if(new Set(numbers).size!==numbers.length)return {numbers,error:'No repitas números de diapositiva.'};
    const absent=numbers.filter(n=>!catalog.some(s=>s.number===n));
    if(absent.length)return {numbers,error:'No existen estas diapositivas en el archivo: '+absent.join(', ')+'. Usá el número original, no la página del PDF.'};
    const blocked=numbers.filter(n=>catalog.find(s=>s.number===n)?.available===false);
    if(blocked.length)return {numbers,error:'Las diapositivas '+blocked.join(', ')+' existen, pero su figura no está identificada con certeza. No se pueden calificar hasta completar el material.'};
    return {numbers,error:''};
  }
  if(typeof module==='object'&&module.exports)module.exports={parse};else root.frioSlideSelection={parse};
})(typeof window==='object'?window:this);
