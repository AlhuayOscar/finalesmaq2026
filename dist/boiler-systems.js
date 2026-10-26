// Optional teaching systems: positions are illustrative, not manufacturer piping plans.
const boilerSystemSources={
 fuel:['Bobbio II · PDF 9–26 y 79 · preparación y quemadores','https://drive.google.com/file/d/1eK0ar8DqgNc-jdxkMpxSqck99HfkB_DU/view#page=9'],
 feed:['Bobbio II · PDF 27–37 · sistema de alimentación','https://drive.google.com/file/d/1eK0ar8DqgNc-jdxkMpxSqck99HfkB_DU/view#page=27'],
 water:['Bobbio I · PDF 105 · extracciones de superficie y fondo','https://drive.google.com/file/d/1bQt9DS_V2dEgTa2SbswRXeJSXOc3-ed7/view#page=105'],
 controls:['ASHRAE · Automatic Fuel-Burning Systems · controles genéricos','https://handbook.ashrae.org/handbooks/S20/SI/s20_ch31/s20_ch31_si.aspx'],
 chemistry:['Bobbio II · PDF 61–75 · agua y análisis','https://drive.google.com/file/d/1eK0ar8DqgNc-jdxkMpxSqck99HfkB_DU/view#page=61'],
 faults:['Bobbio II · PDF 78–81 · averías','https://drive.google.com/file/d/1eK0ar8DqgNc-jdxkMpxSqck99HfkB_DU/view#page=78'],
 soot:['Bobbio I · PDF 13–14 y 93–97 · transmisión y sopladores','https://drive.google.com/file/d/1bQt9DS_V2dEgTa2SbswRXeJSXOc3-ed7/view#page=93'],
 cavitation:['TLV · Cavitation in Condensate Pumps','https://www.tlv.com/en-gb/steam-info/steam-theory/problems/cavitation-in-condensate-pumps'],
 oil:['STLE · Lubrication Fundamentals · turbinas','https://www.stle.org/files/TLTArchives/2015/06_June/Lubrication_Fundamentals.aspx'],
 carry:['Spirax Sarco · Water for the Boiler','https://www.spiraxsarco.com/learn-about-steam/the-boiler-house/water-for-the-boiler']
};
const boilerLayers={
 fuel:{name:'Añadir combustible, quemador, pulverización y llama',ids:['fuelTank','fuelPump','fuelHeater','fuelFilter','fuelValve','fuelLine','atomizer','flame','airRegister'],source:'fuel'},
 controls:{name:'Añadir válvulas, presostato, termostato y control',ids:['safetyValve','steamStop','pressureSwitch','temperatureControl','levelControl','flameDetector'],source:'controls'},
 water:{name:'Añadir alimentación, colectores y purgas',ids:['feedPump','feedValve','bottomBlow','surfaceBlow'],source:'water'}
};
Object.assign(boilerParts,{
 fuelTank:['Tanque de servicio de combustible','#9c7645','Reserva de combustible preparada para el servicio.','Tanque → bomba → calentador → filtro → válvula → colector de quemadores.','Orden y retornos dependen de la instalación; esquema simplificado.'],
 fuelPump:['Bomba de combustible','#9c7645','Aporta presión y caudal al circuito.','Aspira del tanque y descarga hacia la preparación del combustible.','No confundir presión de combustible con presión de vapor.'],
 fuelHeater:['Calentador de combustible','#cf8845','Ajusta la viscosidad del combustible que requiere precalentamiento.','Entre bomba y filtrado final en este esquema; intercambia calor sin mezclar fluidos.','Temperatura adecuada según combustible y fabricante; no todos los combustibles requieren igual calentamiento.'],
 fuelFilter:['Filtro de combustible','#a78d58','Retiene sólidos que pueden obstruir el pulverizador.','Antes del colector de quemadores; vigilar diferencia de presión.','Filtro obstruido reduce caudal; filtro dañado permite pasar partículas.'],
 fuelValve:['Válvula de corte de combustible','#bd6450','Interrumpe el aporte al quemador cuando actúa la cadena de seguridad.','En la línea previa al pulverizador; recibe orden de protección.','Corte y regulación son funciones diferentes. No representa una secuencia específica de encendido.'],
 fuelLine:['Tubería y colector de combustible','#a57839','Distribuye combustible acondicionado a los quemadores.','Une los elementos del circuito y las ramas hacia cada quemador.','Las ramas del esquema se simplifican; no se representan retornos ni redundancias.'],
 atomizer:['Pulverizador · cono de rocío','#dfad49','Divide el combustible en gotas para facilitar evaporación y mezcla con aire.','A la salida del quemador; cono mecánico representativo.','La niebla fina uniforme es deseable. Gotas gruesas, chorros o asimetría indican mala pulverización. El tipo con vapor requiere otro circuito.'],
 flame:['Llama del quemador','#ee7435','Zona de combustión que entrega calor a las superficies del horno.','Rocío + aire del registro → combustión → gases hacia superficies de intercambio.','Forma ilustrativa, no predicción de llama. No debe confundirse con tubería ni con combustible líquido.'],
 airRegister:['Registro de aire','#6aa6a5','Distribuye y orienta el aire de combustión alrededor del quemador.','Recibe aire del sistema de tiro y lo mezcla con el rocío.','La relación aire/combustible y la estabilidad de llama deben evaluarse juntas.'],
 safetyValve:['Válvula de seguridad','#b77d91','Alivia sobrepresión por apertura mecánica.','Conectada al espacio de vapor; descarga por su conducción prevista.','No es el presostato ni el dispositivo normal para regular presión. Se muestra una válvula representativa.'],
 steamStop:['Válvula de comunicación de vapor','#b77d91','Comunica o aísla la salida hacia consumidores.','En la salida de vapor de la caldera.','No confundir con la válvula de seguridad.'],
 pressureSwitch:['Presostato / límite de presión','#8776af','Detecta que se alcanzó un umbral de presión y cambia una señal eléctrica.','Toma de presión de vapor → dispositivo → cadena de control o seguridad.','El límite de seguridad es distinto de la regulación modulante y de la válvula mecánica de seguridad.'],
 temperatureControl:['Termostato / control de temperatura','#8776af','Supervisa temperatura del combustible calentado en este ejemplo.','Sensor en calentador → controlador → aporte de calor.','No regula directamente el nivel de agua. Ubicación funcional genérica; puede emplearse otro tipo de sensor.'],
 levelControl:['Indicador, sensor y control de nivel','#5b929e','Permite conocer el nivel y controlar alimentación; el límite de bajo nivel protege la caldera.','Domo → medición → regulador de alimentación; protección independiente según diseño.','El indicador, regulador y limitador son funciones distintas, agrupadas sólo para lectura del dibujo.'],
 flameDetector:['Detector de llama','#8776af','Supervisa presencia de llama y comunica una falla al control de quemadores.','Mira la zona de combustión; su señal interviene en la autorización de combustible.','No sustituye la verificación de aire, presión ni nivel.'],
 feedPump:['Bomba de alimentación','#367fc1','Eleva la presión del agua para ingresar a la caldera.','Desde el sistema de alimentación → válvulas → economizador, si existe → domo.','Cavitación o pérdida de caudal pueden comprometer el nivel. El circuito de agua es independiente del combustible.'],
 feedValve:['Válvulas de alimentación y retención','#367fc1','Regulan/admiten el agua y evitan retorno según su función.','Descarga de bomba → economizador o domo.','Se representan juntas; retención y regulación no son la misma válvula.'],
 bottomBlow:['Extracción de fondo · fangos','#8b8663','Permite retirar lodos sedimentados de las zonas inferiores.','Tomas en colectores inferiores → válvulas → sistema receptor de purgas.','No es la extracción superficial. El receptor queda fuera del modelo; no se representa descarga al mar.'],
 surfaceBlow:['Extracción de superficie','#609a9b','Extrae agua próxima a la superficie y ayuda al control de concentración e impurezas.','Toma en domo → válvula → sistema receptor de purgas.','No elimina por sí sola incrustaciones adheridas. No es otro colector inferior.']
});
const boilerFaults=[
 {id:'soot',name:'Hollín en horno y superficies',group:'Combustión',layers:['fuel'],parts:['furnace','furnace2','risers','superheater','economizer'],symptom:'Superficies sucias, menor transferencia de calor y mayor consumo para igual producción.',cause:'Depósitos del lado de gases agregan resistencia térmica. La combustión deficiente favorece su formación.',check:'Distinguir hollín del lado de fuego de incrustaciones del lado del agua; relacionar con aire, pulverización y estado de superficies.',source:'soot'},
 {id:'carbon',name:'Depósito carbonoso / «muñeco»',group:'Combustión',layers:['fuel'],parts:['atomizer','burner','furnace'],symptom:'Acumulación carbonosa cerca del quemador, rocío deformado o combustión irregular.',cause:'Bobbio describe carbonización dentro del quemador y obturación. Puede coexistir con depósitos en el horno.',check:'«Muñeco» se conserva como término coloquial solicitado: no se confirmó ese nombre en el libro. Ubicar el depósito real antes de atribuirlo a una causa.',source:'faults'},
 {id:'spray',name:'Mala pulverización · gotas gruesas',group:'Combustión',layers:['fuel'],parts:['fuelHeater','fuelFilter','atomizer','flame'],symptom:'Rocío asimétrico, gotas gruesas, llama irregular o humo.',cause:'Viscosidad inadecuada, presión insuficiente o paso del pulverizador sucio/dañado deterioran la atomización.',check:'La niebla fina uniforme NO es una falla. Relacionar temperatura/viscosidad, presión y estado del pulverizador sin asumir una causa única.',source:'fuel'},
 {id:'blocked',name:'Quemador obturado',group:'Combustión',layers:['fuel'],parts:['fuelFilter','atomizer','flame'],symptom:'Caudal reducido o apagado accidental de un quemador.',cause:'Partículas o combustible carbonizado pueden obstruir sus pasajes.',check:'Bobbio también enumera agua y aire arrastrado entre las causas de apagado: no todo apagado prueba una obstrucción.',source:'faults'},
 {id:'waterFuel',name:'Agua en combustible',group:'Combustión',layers:['fuel'],parts:['fuelTank','fuelPump','atomizer','flame'],symptom:'Chisporroteo e inestabilidad del quemador; posible interrupción del suministro.',cause:'Agua mezclada en el tanque o ingreso por pérdidas de calentadores altera la combustión.',check:'Relacionar el síntoma con el circuito de combustible y confirmar origen; no confundir con agua de alimentación.',source:'faults'},
 {id:'air',name:'Aire insuficiente / combustión intermitente',group:'Combustión',layers:['fuel'],parts:['airRegister','flame','furnace','furnace2'],symptom:'Combustión irregular, humo y fluctuaciones de presión del horno.',cause:'Una alimentación de aire insuficiente puede provocar combustiones intermitentes y vibración de las envueltas.',check:'Bobbio vincula estas oscilaciones con daños de anclaje de refractarios. Revisar conjuntamente aire y combustible.',source:'faults'},
 {id:'flameLoss',name:'Pérdida de llama y combustible sin quemar',group:'Control',layers:['fuel','controls'],parts:['flame','flameDetector','fuelValve'],symptom:'Se pierde la llama aunque exista demanda de vapor.',cause:'Si continuara ingresando combustible sin quemarse, podría acumularse una mezcla peligrosa en el horno.',check:'Explicar detección → señal de falla → corte de combustible. El rearme y la secuencia de purga dependen del sistema instalado.',source:'controls'},
 {id:'scale',name:'Incrustaciones en tubos',group:'Agua',layers:['water'],parts:['risers','screen','wall','floor'],symptom:'Peor intercambio térmico y sobrecalentamiento local del metal.',cause:'Depósitos adheridos del lado del agua dificultan la transferencia de calor y pueden comprometer los tubos.',check:'Distinguir incrustación adherida de lodo removible; el análisis y tratamiento del agua dependen de presión y especificación de la caldera.',source:'chemistry'},
 {id:'sludge',name:'Fangos / lodos en colectores',group:'Agua',layers:['water'],parts:['lower','lower2','header','bottomBlow'],symptom:'Acumulación en puntos bajos y posible restricción de circulación.',cause:'Sólidos suspendidos sedimentan en colectores inferiores y zonas de baja velocidad.',check:'Identificar tomas de fondo y explicar su diferencia con extracción de superficie. Una purga no repara tubos ya dañados.',source:'water'},
 {id:'chlorides',name:'Contaminación por cloruros',group:'Agua',layers:['water'],parts:['feedPump','feedValve','upper','surfaceBlow'],aux:['condenser'],symptom:'Aumento de cloruros detectado por análisis; no tiene una apariencia visible fiable.',cause:'Puede indicar ingreso de agua salina al circuito, por ejemplo por un intercambiador con pérdidas.',check:'Comparar muestras en distintos puntos para localizar el ingreso. Cloruros no equivale automáticamente a dureza o incrustación; el resaltado indica circulación, no una lesión visible.',source:'chemistry'},
 {id:'oilWater',name:'Aceite en agua de alimentación',group:'Agua',layers:['water'],parts:['feedPump','upper','risers','surfaceBlow'],symptom:'Película aceitosa o contaminación confirmada por muestras del circuito.',cause:'Un retorno contaminado puede transportar aceite hasta la caldera y perjudicar las superficies de intercambio.',check:'Localizar el punto de ingreso y distinguir el circuito de lubricación del circuito agua/vapor. Bobbio trata esta avería en PDF 78–79.',source:'faults'},
 {id:'carryover',name:'Espuma / arrastre de agua con el vapor',group:'Agua',layers:['water','controls'],parts:['upper','separator','takeoff','superheater','outlet'],aux:['turbine'],symptom:'Vapor con gotas e impurezas que alcanza sobrecalentador y consumidores.',cause:'Nivel alto y condiciones inadecuadas del agua pueden favorecer arrastre; los depósitos transportados perjudican el sobrecalentador.',check:'Separar arrastre desde la caldera de condensación posterior del vapor. No denominar automáticamente cavitación a un daño de turbina.',source:'carry'},
 {id:'lowLevel',name:'Bajo nivel de agua',group:'Agua',layers:['water','controls'],parts:['feedPump','feedValve','levelControl','upper','risers'],symptom:'Nivel insuficiente: partes calentadas pueden quedar sin refrigeración adecuada.',cause:'Bobbio enumera fallas de bomba, pérdidas, válvula defectuosa y medición/control incorrectos.',check:'Relacionar bajo nivel con sobrecalentamiento y daño de tubos. Un indicador totalmente lleno puede confundirse con vacío; no deducir nivel sólo de la presión.',source:'faults'},
 {id:'lowPressure',name:'Baja presión de vapor',group:'Control',layers:['water','controls','fuel'],parts:['upper','pressureSwitch','levelControl','feedPump','flame','outlet'],symptom:'Presión inferior a la esperada para la condición de servicio.',cause:'Puede existir mayor demanda, menor aporte térmico, pérdidas o bajo nivel. No es un diagnóstico único.',check:'Bobbio advierte que aumentar combustión si la causa es bajo nivel agrava el daño. Explicar primero balance de vapor, nivel y alimentación.',source:'faults'},
 {id:'highPressure',name:'Sobrepresión / falla de regulación',group:'Control',layers:['controls'],parts:['pressureSwitch','safetyValve','steamStop','upper'],symptom:'La presión sigue aumentando fuera del régimen previsto.',cause:'Desajuste entre producción y consumo o falla de regulación; deben distinguirse regulación y protecciones.',check:'Identificar presostato/límite, corte de combustible y válvula de seguridad mecánica como funciones diferentes. Sin consignas universales de ajuste.',source:'controls'},
 {id:'cavitation',name:'Cavitación en bombas de agua',group:'Auxiliares',layers:['water'],parts:['feedPump'],aux:['condensate','feedAux'],symptom:'Ruido, vibración y pérdida de prestaciones de la bomba; posible daño del rodete.',cause:'La presión local cae por debajo de la de vapor del líquido; aparecen burbujas que colapsan al recuperar presión.',check:'Revisar conceptualmente temperatura, altura disponible y pérdidas de aspiración. Aquí afecta bombas de condensado/alimentación: no se presenta como una falla propia de álabes de turbina de vapor.',source:'cavitation'},
 {id:'lubrication',name:'Lubricación insuficiente en auxiliares/turbina',group:'Auxiliares',layers:[],parts:[],aux:['oilPump','oilCooler','bearings'],symptom:'Presión/caudal de aceite insuficiente o aumento de temperatura de cojinetes.',cause:'La película de aceite y la evacuación de calor dependen de un suministro adecuado y limpio.',check:'Seguir tanque → bomba → filtro/enfriador → cojinetes → retorno. Es un circuito externo: el aceite no debe circular dentro de los tubos de la caldera.',source:'oil'}
];
function boilerLayerIds(layers){return [...new Set([...layers].flatMap(k=>boilerLayers[k]?.ids||[]))]}
function boilerFaultParts(f,type){return f.parts.filter(id=>[...boilerIds(type),...boilerLayerIds(f.layers)].includes(id))}
function addBoilerSystems(type,layers,{pipe,box,cylinder,face,paths}){
 const sx=type==='D'?.5:0,hx=type==='simple'?-.48:type==='A'?-.65:type==='M'?-1.1:-.8;
 if(layers.has('fuel')){
  box([-2.7,-1.1,1.4],[.5,.65,.5],'fuelTank');
  cylinder([-2.7,-.55,1.25],[-2.7,-.55,1.55],.17,'fuelPump');
  box([-2.7,.05,1.4],[.32,.38,.3],'fuelHeater');box([-2.7,.65,1.4],[.25,.28,.25],'fuelFilter');
  box([-2.1,.65,1.4],[.24,.2,.24],'fuelValve');
  pipe([[-2.7,-1.1,1.4],[-2.7,.65,1.4],[-1.8,.65,1.4],[-1.8,-.85,1.4],[hx,-.85,1.4]],.035,'fuelLine','fuel');
  const burners=type==='simple'?[[hx,-.85]]:(type==='D'?[hx]:[hx,.65]).flatMap(x=>[-.85,-.4].map(y=>[x,y]));
  for(const [x,y]of burners){
   pipe([[hx,-.85,1.4],[x,-.85,1.4],...(y===-.85?[]:[[x,y,1.4]])].filter((p,i,a)=>!i||p.some((v,j)=>v!==a[i-1][j])),.025,'fuelLine');
   cylinder([x,y,1.35],[x,y,1.27],.24,'airRegister');
   cylinder([x,y,1.26],[x,y,.86],.07,'atomizer');
   for(let i=0;i<8;i++){const a=i*Math.PI/4,b=(i+1)*Math.PI/4;face([[x,y,.86],[x+.16*Math.cos(a),y+.16*Math.sin(a),.45],[x+.16*Math.cos(b),y+.16*Math.sin(b),.45]],'atomizer',.9);face([[x,y,-.6],[x+.21*Math.cos(a),y+.21*Math.sin(a),.42],[x+.21*Math.cos(b),y+.21*Math.sin(b),.42]],'flame',.8+i*.03);}
  }
 }
 if(layers.has('controls')){
  pipe([[sx,1.65,-.65],[sx,2,-.65],[sx+.3,2,-.65]],.07,'safetyValve');box([sx,1.85,-.65],[.22,.23,.22],'safetyValve');
  const stop=type==='simple'?[sx+.45,2.15,.35]:[1.65,.8,1.3];box(stop,[.25,.22,.25],'steamStop');
  pipe([[sx,1.5,-.9],[2.45,1.5,-.9]],.018,'pressureSwitch');box([2.45,1.5,-.9],[.32,.32,.22],'pressureSwitch');
  box([-2.7,.05,1.75],[.23,.22,.18],'temperatureControl');
  pipe([[sx,1.57,1.05],[sx+.55,1.57,1.05],[sx+.55,.95,1.05],[sx,1.15,1.05]],.035,'levelControl');
  cylinder([hx+.3,-.6,1.5],[hx+.3,-.6,.9],.06,'flameDetector');
  if(layers.has('fuel')){
   paths.push({id:'pressureSwitch',kind:'control',points:[[2.45,1.5,-.9],[2.45,2.7,1.8],[-2.1,2.7,1.8],[-2.1,.65,1.4]]});
   paths.push({id:'flameDetector',kind:'control',points:[[hx+.3,-.6,1.5],[hx+.3,.65,1.8],[-2.1,.65,1.4]]});
   paths.push({id:'temperatureControl',kind:'control',points:[[-2.7,.05,1.75],[-2.7,.05,1.4]]});
  }
  if(layers.has('water'))paths.push({id:'levelControl',kind:'control',points:[[sx+.55,1.3,1.05],[2.65,1.3,1.05],[2.65,-.6,.68]]});
 }
 if(layers.has('water')){
  cylinder([2.65,-1.4,.5],[2.65,-1.4,.85],.22,'feedPump');box([2.65,-.6,.68],[.25,.25,.25],'feedValve');
  const target=type==='simple'?[sx,1.23,-.95]:[type==='D'?1.05:.65,1.8,-.15];
  pipe([[2.65,-1.4,.68],[2.65,-.6,.68],[2.65,1.8,.68],target],.045,'feedValve','water');
  for(const x of type==='A'?[-1.5,1.5]:type==='M'?[0,1.5]:[sx]){pipe([[x,-1.55,.8],[x,-2,.8],[2,-2,.8]],.045,'bottomBlow','blow');box([x,-1.8,.8],[.18,.18,.18],'bottomBlow');}
  pipe([[sx,1.35,.65],[2.1,1.35,.65],[2.1,-2,.65]],.04,'surfaceBlow','blow');box([2.1,.4,.65],[.2,.2,.2],'surfaceBlow');
 }
}
