// Explicit directed graph: sea and working fluid share a heat exchanger, never a fluid port.
const plantColors={sea:'#197caf',water:'#238874',mixture:'#c88421',steam:'#995576',superheated:'#d35338',makeup:'#768771',heat:'#dc9d49'};
const plantParts=[
 ['seaChest','Toma o caja de mar','sea','Agua de mar',[-9,-3,1],'chest','Capta agua del exterior a través de una rejilla.','Es el inicio del circuito de refrigeración, no de la alimentación.'],
 ['seaValve','Válvula de toma de mar','sea','Agua de mar',[-7.5,-3,1],'valve','Permite aislar la entrada de agua de mar.','No confundirla con una válvula de alimentación de caldera.'],
 ['seaFilter','Filtro de agua de mar','sea','Agua de mar',[-6,-3,1],'filter','Retiene residuos para proteger la bomba y los tubos del condensador.','Retener sólidos no desaliniza el agua.'],
 ['seaPump','Bomba de circulación','sea','Agua de mar',[-4.4,-3,1],'pump','Impulsa el caudal de refrigeración hacia el condensador.','Es independiente de las bombas de condensado y de alimentación.'],
 ['condenser','Condensador de superficie','exchange','Mar por tubos · vapor por carcasa',[-7,.35,0],'condenser','El vapor de escape cede calor y se condensa fuera de los tubos. El agua de mar recibe ese calor dentro de ellos.','Los dos fluidos no se mezclan. Una fuga sería una avería, no una conexión normal.'],
 ['discharge','Descarga al mar','sea','Agua de mar más caliente',[-2.5,-3,1],'outfall','Devuelve al exterior el agua que absorbió calor en el condensador.','Este recorrido es abierto: toma → refrigeración → descarga.'],
 ['hotwell','Pozo del condensador','cycle','Condensado',[-7,-1.1,0],'tank','Recoge el agua dulce condensada bajo la carcasa.','No recoge agua de mar en funcionamiento normal.'],
 ['condPump','Bomba de extracción','cycle','Condensado',[-5.2,-1.15,0],'pump','Extrae el condensado del pozo y lo impulsa hacia la alimentación.','No sustituye la bomba que vence la presión de la caldera.'],
 ['conditioning','Calentamiento / tratamiento','cycle','Agua dulce',[-3.5,-1.15,0],'skid','Bloque opcional de acondicionamiento: calentadores, filtros o equipos de tratamiento según la instalación.','La ubicación de filtros depende del plano; un filtro no elimina por sí solo sales disueltas.'],
 ['deaerator','Desaireador','cycle','Agua caliente + vapor de calentamiento',[-1.6,.55,0],'deaerator','Calienta el agua y facilita la eliminación de gases disueltos mediante venteo.','La línea fina de vapor desde la turbina representa una extracción de calentamiento, según diseño.'],
 ['feedTank','Tanque de alimentación','cycle','Agua preparada',[-1.6,-1.15,0],'tank','Almacena el agua preparada bajo el desaireador y abastece la aspiración de la bomba.','Desaireador y tanque tienen funciones distintas aunque integren un mismo conjunto.'],
 ['feedPump','Bomba de alimentación','cycle','Agua a presión elevada',[.2,-1.15,0],'pump','Eleva la presión para introducir agua en la caldera y vencer las pérdidas del circuito.','La presión de descarga debe ser suficiente para alimentar el generador.'],
 ['regValve','Válvula de regulación','cycle','Agua de alimentación',[1.5,-1.15,0],'controlValve','Modula el aporte de agua según el sistema de control de alimentación.','Se representa una función de regulación; el orden de válvulas puede variar.'],
 ['isolation','Válvula de aislamiento','cycle','Agua de alimentación',[2.45,-1.15,0],'valve','Permite aislar la línea de alimentación.','No cumple por sí sola la función de retención.'],
 ['check','Válvula de retención','cycle','Agua de alimentación',[3.35,-1.15,0],'check','Evita el retorno desde la caldera hacia la alimentación.','El sentido de la flecha es el sentido permitido de flujo.'],
 ['economizer','Economizador','cycle','Agua de alimentación',[6.5,4.6,-.16],'boiler','Precalienta el agua recuperando calor de los gases de salida.','Por dentro circula agua, no el vapor destinado a la turbina. Es opcional según diseño.'],
 ['upper','Colector superior','cycle','Agua y espacio de vapor',[5.55,3.49,0],'boiler','Recibe la alimentación y mantiene la reserva de agua; recibe también la mezcla de los ascendentes.','El agua separada vuelve a los descendentes; no toda la masa sale como vapor.'],
 ['down','Tubos descendentes','cycle','Agua',[5.55,2,-1.63],'boiler','Llevan agua desde el colector superior al inferior.','La diferencia de densidad con la mezcla ascendente sostiene la circulación natural.'],
 ['lower','Colector inferior','cycle','Agua',[5.55,.52,0],'boiler','Distribuye agua hacia los tubos hervidores y las superficies de pared.','Permanece lleno de agua; no es un segundo espacio de vapor.'],
 ['risers','Tubos hervidores','cycle','Mezcla agua-vapor',[5.8,2,0],'boiler','Reciben calor y conducen la mezcla hacia el colector superior.','Agua y vapor por dentro; gases de combustión por fuera.'],
 ['separator','Separadores del colector','cycle','Separación de gotas',[5.55,3.58,.55],'boiler','Reducen el arrastre de gotas antes de tomar vapor de la zona superior.','La rama de agua recircula. La rama de vapor va al sobrecalentador.'],
 ['sh1','Sobrecalentador · 1.ª etapa','cycle','Vapor',[3.6,2,2.3],'coil','Añade calor al vapor procedente de los separadores.','Se muestra separado del haz para reconocer las dos etapas; recibe calor de los gases.'],
 ['attemperator','Atemperador entre etapas','cycle','Vapor a temperatura regulada',[4.4,3.7,2.3],'attemperator','En este esquema de superficie, el vapor cede calor al agua del colector a través de la pared del intercambiador.','Está entre las dos etapas. La vista ampliada no representa una mezcla ni una inyección de agua.'],
 ['sh2','Sobrecalentador · 2.ª etapa','cycle','Vapor sobrecalentado',[5.5,2,2.3],'coil','Aporta calor de nuevo después de la atemperación para obtener el vapor de salida.','La secuencia es 1.ª etapa → atemperador → 2.ª etapa; no están en paralelo.'],
 ['mainValve','Válvula principal de vapor','cycle','Vapor sobrecalentado',[1.7,4.7,1],'valve','Aísla la caldera de la tubería principal que conduce vapor a la turbina.','No es una válvula de seguridad.'],
 ['turbine','Turbina de vapor','cycle','Vapor en expansión',[-6,4.1,0],'turbine','El vapor se expande y produce trabajo en el rotor. El escape vuelve al condensador.','La potencia mecánica sale por el eje. No se representa una nueva entrada de agua.'],
 ['makeup','Reposición de pérdidas','makeup','Agua dulce tratada',[.15,-3.05,-1.3],'tank','Repone pérdidas con agua de calidad adecuada, ya producida y acondicionada.','Si procede del mar, antes requiere una planta de agua dulce y tratamiento. Esa planta queda fuera de este esquema.'],
 ['furnace','Hogar y quemadores','heat','Combustión',[4.1,1.56,0],'boiler','Aportan calor a las superficies de generación y sobrecalentamiento; los gases siguen hacia la recuperación de calor.','Los gases no se mezclan con el agua ni con el vapor.'],
 ['airheater','Precalentador de aire','heat','Aire y gases separados',[6.595,5.245,-.165],'boiler','Recupera calor de los gases de salida para calentar el aire que llega a los quemadores. Es el bloque gris situado encima del economizador verde.','No es el hogar ni el economizador: el economizador precalienta agua; este equipo precalienta aire. Los conductos de aire y la salida final de gases no están dibujados.'],
];
const plantNodes=Object.fromEntries(plantParts.map((p,i)=>[p[0],{id:p[0],number:i+1,name:p[1],group:p[2],fluid:p[3],p:p[4],shape:p[5],description:p[6],note:p[7]}]));
const plantEdges=[];
function plantLink(from,to,kind,points,extra={}){plantEdges.push({from,to,kind,points,...extra})}
const P=id=>plantNodes[id].p;
for(const [a,b] of [['seaChest','seaValve'],['seaValve','seaFilter'],['seaFilter','seaPump']])plantLink(a,b,'sea',[P(a),P(b)]);
plantLink('seaPump','condenser','sea',[P('seaPump'),[-4.4,-2.2,1],[-9,-2.2,1],[-9,.35,0],[-8.3,.35,0]],{port:'tube-in'});
plantLink('condenser','discharge','sea',[[-5.7,.35,0],[-5.3,.35,-1.6],[-2.5,.35,-1.6],P('discharge')],{port:'tube-out'});
plantLink('condenser','hotwell','water',[[-7,-.25,0],P('hotwell')],{port:'shell-drain'});
for(const [a,b] of [['hotwell','condPump'],['condPump','conditioning']])plantLink(a,b,'water',[P(a),P(b)]);
plantLink('conditioning','deaerator','water',[P('conditioning'),[-3.5,.55,0],P('deaerator')]);
plantLink('deaerator','feedTank','water',[P('deaerator'),P('feedTank')]);
for(const [a,b] of [['feedTank','feedPump'],['feedPump','regValve'],['regValve','isolation'],['isolation','check']])plantLink(a,b,'water',[P(a),P(b)]);
plantLink('check','economizer','water',[P('check'),[3.35,-.6,-2.1],[7.6,-.6,-2.1],[7.6,3.98,-2.1],[6.155,3.98,-.165]]);
plantLink('economizer','upper','water',[[6.155,4.695,-.165],[6.155,4.695,-1.485],[5.55,3.353,-1.485],[5.55,3.353,-1.045]]);
plantLink('upper','down','water',[[5.55,3.36,-1.045],[5.55,3.36,-1.628]]);
plantLink('down','lower','water',[[5.55,3.36,-1.628],[5.55,.515,-1.628],[5.55,.515,-1.21]]);
plantLink('lower','risers','mixture',[[5.55,.768,1.045],[5.957,1.01,1.045],[5.55,3.155,1.045]]);
plantLink('risers','separator','mixture',[[5.55,3.155,1.045],[5.55,3.287,1.045],P('separator')]);
plantLink('separator','upper','water',[P('separator'),[5.55,3.36,.55]],{recirculation:true});
plantLink('separator','sh1','steam',[P('separator'),[5.55,3.65,1.8],[3.6,3.65,1.8],[3.6,1.3,2.3]]);
plantLink('sh1','attemperator','steam',[[3.6,2.7,2.3],[3.6,3.7,2.3],P('attemperator')]);
plantLink('attemperator','sh2','steam',[P('attemperator'),[5.5,3.7,2.3],[5.5,1.3,2.3]]);
plantLink('sh2','mainValve','superheated',[[5.5,2.7,2.3],[5.5,5.1,2.3],[1.7,5.1,1],P('mainValve')]);
plantLink('mainValve','turbine','superheated',[P('mainValve'),[-4.7,4.7,1],[-4.7,4.1,0]]);
plantLink('turbine','condenser','steam',[[-7.2,4.1,0],[-8.9,4.1,0],[-8.9,1.55,0],[-7,1.55,0],[-7,.95,0]],{port:'shell-steam'});
plantLink('turbine','deaerator','steam',[[-6,4.1,-.5],[-6,3.1,-2.2],[-1.6,3.1,-2.2],[-1.6,.9,0]],{aux:true});
plantLink('makeup','feedTank','makeup',[P('makeup'),[-1.6,-3.05,-1.3],[-1.6,-1.15,-1.3],P('feedTank')],{aux:true});
const plantTours={all:plantParts.map(p=>p[0]),sea:['seaChest','seaValve','seaFilter','seaPump','condenser','discharge'],cycle:['condenser','hotwell','condPump','conditioning','deaerator','feedTank','feedPump','regValve','isolation','check','economizer','upper','down','lower','risers','separator','upper','sh1','attemperator','sh2','mainValve','turbine','condenser'],makeup:['makeup','feedTank','feedPump']};
function plantEdgeVisible(edge,filter){return filter==='all'||(filter==='sea'?edge.kind==='sea':filter==='makeup'?edge.kind==='makeup':edge.kind!=='sea'&&edge.kind!=='makeup')}
function plantRelated(edge,id){return edge.from===id||edge.to===id}
function plantSample(points,t){let lengths=points.slice(1).map((p,i)=>Math.hypot(...p.map((v,k)=>v-points[i][k]))),d=Math.min(.999999,Math.max(0,t))*lengths.reduce((a,b)=>a+b,0);for(let i=0;i<lengths.length;i++){if(d<=lengths[i])return points[i].map((v,k)=>v+(points[i+1][k]-v)*d/lengths[i]);d-=lengths[i]}return points.at(-1)}
