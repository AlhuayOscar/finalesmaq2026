// The same subject profile drives the initial guidance and the grading contract.
const ids=['principio','componentes','funciones','conexiones','recorrido','sistema','condiciones'];
const criteria=['concepto','componentes','funcionamiento','conexiones','funcionamiento','conexiones','concepto'];
const profiles={
 termicas:{
  aspects:['Principio de funcionamiento o fundamento físico','Componentes, elementos o variables que intervienen','Función de los componentes o papel de las variables','Conexiones o relaciones técnicas entre los elementos','Recorrido del fluido, transformación de energía o evolución del proceso','Relación con el sistema o aplicación del concepto','Condiciones relevantes y límites de validez'],
  guide:'Desarrollá el principio de funcionamiento, los componentes o variables y su función, las conexiones, el recorrido del fluido o la transformación de energía, la relación con el sistema y las condiciones relevantes. En temas conceptuales explicá las variables y la evolución del proceso. Mantenimiento y fallas sólo cuando se pidan.',
  labels:{concepto:'Concepto',componentes:'Componentes y variables',funcionamiento:'Funcionamiento',conexiones:'Conexiones y sistema',precision:'Precisión técnica',mantenimiento:'Mantenimiento',fallas:'Fallas'}
 },
 economia:{
  aspects:['Definición del concepto económico o contractual y su alcance','Actores, variables o elementos de la operación estudiada','Papel de cada actor, variable o elemento contractual','Relaciones causales entre las variables o partes del caso','Mecanismo económico o secuencia de la operación estudiada','Aplicación al negocio naviero o al contrato planteado','Supuestos, condiciones y límites del caso'],
  guide:'Desarrollá el concepto económico o contractual y su alcance, los actores y variables que intervienen, su papel, las relaciones causales, el mecanismo de la operación, su aplicación al negocio naviero y los supuestos o condiciones del caso. Justificá las relaciones con terminología económica y contractual precisa.',
  labels:{concepto:'Concepto y alcance',componentes:'Actores y variables',funcionamiento:'Mecanismo económico',conexiones:'Relaciones y aplicación',precision:'Precisión económica y contractual',mantenimiento:'Gestión',fallas:'Riesgos y excepciones'},maintenance:false
 },
 frio:{
  aspects:['Principio termodinámico o fundamento frigorífico','Componentes, refrigerante o variables que intervienen','Función de los componentes o papel de las variables','Conexiones y relaciones de presión, temperatura o estado','Recorrido del refrigerante, transferencia de calor o evolución del ciclo','Relación con la instalación frigorífica o su aplicación','Condiciones de trabajo y límites de validez'],
  guide:'Desarrollá el fundamento frigorífico, los componentes o variables y su función, las conexiones, el recorrido del refrigerante y la transferencia de calor, su relación con el ciclo o la instalación y las condiciones de trabajo. Operación, mantenimiento y fallas sólo cuando se pidan.',
  labels:{concepto:'Fundamento frigorífico',componentes:'Componentes y refrigerante',funcionamiento:'Ciclo y transferencia de calor',conexiones:'Conexiones e instalación',precision:'Precisión técnica',mantenimiento:'Mantenimiento',fallas:'Fallas'}
 },
 electrotecnia:{
  aspects:['Principio eléctrico o electromagnético','Elementos y magnitudes eléctricas que intervienen','Función de los elementos o papel de las magnitudes','Conexiones y relaciones eléctricas del circuito','Recorrido de la corriente o conversión de energía','Aplicación al circuito, máquina o instalación eléctrica','Condiciones de funcionamiento y límites de validez'],
  guide:'Desarrollá el principio eléctrico o electromagnético, los elementos y magnitudes, sus funciones, las conexiones, el recorrido de la corriente o la conversión de energía, la aplicación al circuito o máquina y las condiciones de funcionamiento. Protecciones, seguridad y mantenimiento sólo cuando se pidan.',
  labels:{concepto:'Principio eléctrico',componentes:'Elementos y magnitudes',funcionamiento:'Funcionamiento eléctrico',conexiones:'Circuito y aplicación',precision:'Precisión eléctrica',mantenimiento:'Mantenimiento',fallas:'Fallas eléctricas'}
 },
 electronica:{
  aspects:['Fundamento electrónico o lógico','Componentes, señales o variables que intervienen','Función de los componentes o papel de las señales','Conexiones y relaciones entre entradas y salidas','Recorrido o transformación de la señal y comportamiento del circuito','Aplicación al circuito, dispositivo o sistema electrónico','Condiciones de polarización, operación o límites del modelo'],
  guide:'Desarrollá el fundamento electrónico o lógico, los componentes o señales y su función, las conexiones y relaciones entre entradas y salidas, la transformación de la señal, la aplicación del circuito y sus condiciones de operación. Usá con precisión los conceptos de polarización, control o lógica que correspondan al tema.',
  labels:{concepto:'Fundamento electrónico',componentes:'Componentes y señales',funcionamiento:'Comportamiento y señales',conexiones:'Entradas, salidas y aplicación',precision:'Precisión electrónica',mantenimiento:'Mantenimiento',fallas:'Fallas del circuito'}
 },
 motores:{
  aspects:['Principio mecánico o de combustión','Piezas, conjuntos o variables que intervienen','Función de cada pieza o conjunto','Relaciones mecánicas y conexiones entre sistemas','Movimientos, recorridos de fluidos o transformación de energía','Relación con el funcionamiento del motor y sus auxiliares','Condiciones de trabajo y límites de funcionamiento'],
  guide:'Desarrollá el principio mecánico o de combustión, las piezas y su función, las relaciones entre conjuntos, los movimientos o recorridos de fluidos, la transformación de energía, su relación con el motor y las condiciones de trabajo. Lubricación, refrigeración, mantenimiento y fallas sólo cuando se pidan.',
  labels:{concepto:'Principio del motor',componentes:'Piezas y conjuntos',funcionamiento:'Movimientos y funcionamiento',conexiones:'Sistemas y relaciones',precision:'Precisión mecánica',mantenimiento:'Mantenimiento',fallas:'Fallas del motor'}
 }
};
function get(subject='termicas'){return profiles[subject]||profiles.termicas}
function requirements(subject){return get(subject).aspects.map((label,i)=>({id:ids[i],label,criterion:criteria[i]}))}
function introduction(subject){return get(subject).guide+' En láminas o consignas que enumeren puntos específicos, respondé sólo esos puntos. Esta pauta se muestra una vez por examen; la exigencia se mantiene en las preguntas siguientes.'}
module.exports={get,requirements,introduction};
