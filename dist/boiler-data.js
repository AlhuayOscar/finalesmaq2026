// References use PDF page numbers (cover included), not printed page numbers.
const boilerReference = {
  A: { pages: '8–9', printed: '7–8', feature: 'Dos hornos separados por una pared tubular; sobrecalentador protegido en un sector y economizadores en la salida de gases.', numbers: {upper:'1',risers:'2',lower:'3',lower2:'3',furnace:'4',furnace2:'4',burner:'5',superheater:'6',economizer:'7',screen:'8',takeoff:'9',separator:'10',header:'11',desuperheater:'14'} },
  M: { pages: '10–11', printed: '9–10', feature: 'Colector inferior central y lateral. Horno de sobrecalentado a la izquierda y de saturado a la derecha; pared y techo tubulares laterales.', numbers: {upper:'1',lower:'2',lower2:'3',header:'4',wall:'5',risers:'6',economizer:'7–8',superheater:'9–10 y 13–14'} },
  D: { pages: '12–13', printed: '11–12', feature: 'Un horno lateral; haz principal y pantalla diferenciados. Los tubos de piso alimentan el cabezal de la pared y techo.', numbers: {upper:'1',lower:'2',risers:'3',screen:'4',takeoff:'5',superheater:'6',desuperheater:'7',furnace:'8',wall:'9',header:'10',floor:'11',economizer:'14',airheater:'15',down:'16',feed:'17'} },
  simple: { pages: '5', printed: '4', feature: 'Circuito didáctico de circulación natural: descenso de agua y ascenso de mezcla agua-vapor. No reproduce una caldera comercial.', numbers: {} }
};
const boilerParts = {
  upper: ['Colector superior · agua y vapor','#49988e','Recibe la mezcla de los tubos generadores. La separación deja agua en la zona inferior y vapor en la cámara superior.','Tubos generadores → colector → toma de vapor. El agua vuelve por los tubos de caída.','No es un recipiente lleno solamente de vapor.'],
  lower: ['Colector inferior','#537f9c','Distribuye agua a los tubos generadores y recibe el retorno por los tubos de caída.','Colector superior → caída → colector inferior → tubos generadores.','No confundir un colector de agua con el cabezal más pequeño de la pared.'],
  lower2: ['Colector inferior lateral','#537f9c','Alimenta el segundo haz de tubos generadores. En la tipo M está a un lado del colector inferior central.','Tubos de caída → colector lateral → haz principal → colector superior.','La tipo M no tiene la misma disposición simétrica que la tipo A.'],
  risers: ['Haz de tubos generadores','#ca8946','El agua recibe calor a través de la pared metálica y forma una mezcla de agua y vapor que asciende.','Colector inferior → tubos calentados → colector superior.','En una acuotubular el agua circula dentro; los gases pasan por fuera.'],
  down: ['Tubos de caída','#367fc1','Conducen agua relativamente más fría hacia abajo. La diferencia de densidad respecto de la mezcla ascendente sostiene la circulación natural.','Colector superior → colectores inferiores.','No son los tubos que producen la mayor vaporización.'],
  furnace: ['Horno · zona de combustión','#e57745','Volumen donde se libera el calor de la combustión y se transfiere energía a las superficies de calefacción.','Quemadores → horno → superficies de intercambio → salida de gases.','El volumen naranja representa gases calientes, no agua.'],
  furnace2: ['Segundo horno','#dd9c48','Sector con combustión independiente. En la tipo M corresponde al horno de saturado; el otro regula el aporte de calor al sobrecalentador.','Sus gases se incorporan al recorrido hacia el haz principal y el economizador.','Dos hornos no significan dos calderas independientes.'],
  burner: ['Bocas de fuego y quemadores','#995c43','Introducen combustible y aire para establecer la combustión en el horno.','Aire + combustible → quemador → llama y gases calientes.','No representan válvulas de salida de vapor.'],
  superheater: ['Sobrecalentador','#ba5f7b','Recibe vapor saturado y le agrega calor para elevar su temperatura por encima de la saturación a esa presión.','Toma de vapor → sobrecalentador → salida de vapor sobrecalentado.','No es un economizador: por su interior pasa vapor, no agua de alimentación.'],
  economizer: ['Economizador','#55998a','Recupera calor de los gases de salida para precalentar el agua de alimentación.','Bomba de alimentación → economizador → tubo interno de alimentación.','Precalienta agua; el calentador de aire trabaja con aire.'],
  screen: ['Pantalla / pared tubular','#c7a16d','Superficie con circulación de agua que separa sectores y protege al sobrecalentador del calor directo.','Zona inferior de agua → tubos calentados → colector superior.','La pared divisoria de la tipo A incluye material refractario.'],
  header: ['Cabezal de pared tubular','#679ca5','Distribuye agua a los tubos de pared y techo. Tiene una función y ubicación distintas a las del colector inferior.','Alimentación inferior → cabezal → tubos de pared → colector superior.','En la tipo D recibe agua por los tubos de piso.'],
  wall: ['Tubos de pared lateral y techo','#b39a61','Delimitan el horno y absorben calor; su mezcla agua-vapor retorna al colector superior.','Cabezal inferior → pared lateral → techo → colector superior.','Son superficies de calefacción, no una pared maciza.'],
  floor: ['Tubos de piso','#468fae','Llevan agua desde el colector inferior hasta el cabezal lateral. En la tipo D están protegidos por refractario para limitar la vaporización en este tramo.','Colector inferior → tubos de piso → cabezal lateral.','Su misión de alimentación difiere de la de los tubos hervidores.'],
  takeoff: ['Toma interna de vapor','#d5b75d','Recoge vapor en la parte alta del colector y lo conduce a la tubería hacia el sobrecalentador.','Cámara de vapor → toma interna → sobrecalentador.','No confundir con la salida del vapor ya sobrecalentado.'],
  separator: ['Separadores de humedad','#8ba79f','Reducen el arrastre de gotas de agua antes de la salida del vapor. Se representan como deflectores simplificados.','Mezcla entrante → separación de agua → cámara de vapor.','Separar gotas no es sobrecalentar el vapor.'],
  feed: ['Tubo interno de alimentación','#4ca3bd','Distribuye el agua de alimentación a lo largo de la zona de agua del colector.','Economizador → tubo distribuidor → agua del colector superior.','Está en la zona de agua; la toma de vapor está arriba.'],
  desuperheater: ['Desobrecalentador','#9b82b6','Enfría una derivación del vapor sobrecalentado mediante intercambio con el agua del colector para servicios auxiliares.','Derivación de vapor sobrecalentado → serpentín sumergido → auxiliares.','Se muestra el serpentín interno; se omite su tubería exterior.'],
  outlet: ['Salida de vapor','#d7af51','Conecta el circuito de vapor con los consumidores. En los modelos A, M y D está después del sobrecalentador.','Sobrecalentador → toma principal → consumidores.','La toma principal no cumple la función de una válvula de seguridad.'],
  airheater: ['Calentador de aire','#8c9eac','Aprovecha los gases de salida para precalentar el aire destinado a la combustión.','Aire exterior → calentador → bocas de fuego.','Los circuitos de gases y aire intercambian calor sin mezclarse.']
};
function boilerIds(type) {
  if(type==='simple') return ['upper','lower','risers','down','furnace','outlet'];
  const common=['upper','lower',...(type==='D'?[]:['lower2']),'risers','down','furnace',...(type==='D'?[]:['furnace2']),'burner','screen','superheater','economizer','header',...(type==='A'?[]:['wall']),...(type==='D'?['floor']:[]),'takeoff','separator','feed',...(type==='M'?[]:['desuperheater']), 'outlet',...(type==='D'?['airheater']:[])];
  return common;
}
function boilerPart(id,type) {
  const p=[...boilerParts[id]];
  if(id==='lower'&&type==='M')p[0]='Colector inferior central';
  if(id==='lower'&&type==='A')p[0]='Colector inferior izquierdo';
  if(id==='lower2'&&type==='A')p[0]='Colector inferior derecho';
  if(id==='furnace'&&type==='M')p[0]='Horno de sobrecalentado';
  if(id==='furnace2'&&type==='M')p[0]='Horno de saturado';
  if(id==='screen'&&type==='A')p[0]='Pared divisoria tubular';
  if(id==='outlet'&&type!=='simple')p[0]='Salida de vapor sobrecalentado';
  if(id==='lower2'&&type==='A')p[2]='Alimenta el haz derecho de tubos generadores; junto con el colector izquierdo forma la base de la disposición A.';
  return p;
}
