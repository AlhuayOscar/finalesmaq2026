/* Segunda selección: 90 imágenes nuevas revisadas, 25 vistas complementarias. */
const robbioNewPhotos=[
 {
  "id": "11USu3LpX6QbpLoCGpEXeZ9nC46K3QAs8",
  "file": "ciclo-pizarron.jpg",
  "title": "Ciclo básico en el pizarrón",
  "note": "El dibujo de clase relaciona compresor, condensador, expansión y evaporador. El esquema superior muestra cambios de estado, no un recorrido de tuberías.",
  "points": [
   [
    "Compresor",
    42,
    58,
    "Aporta trabajo al vapor y sostiene la diferencia de presión."
   ],
   [
    "Dispositivo de expansión",
    42,
    74,
    "Produce la caída de presión antes del evaporador. No es un compresor funcionando al revés."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0069.jpg"
 },
 {
  "id": "1XJbbCCXNyhIyXMaBzPyZoTvP1wcW9JUA",
  "file": "ph-pizarron.jpg",
  "title": "Diagrama p–h: lectura crítica",
  "note": "La palabra «expansión» quedó escrita junto al tramo inferior. En un ciclo p–h, la expansión ideal es el descenso aproximadamente vertical a entalpía constante; el tramo inferior horizontal corresponde a evaporación.",
  "points": [
   [
    "Compresión",
    61,
    42,
    "Aumentan presión y entalpía. En el ciclo real existen irreversibilidades."
   ],
   [
    "Evaporación",
    48,
    45,
    "A baja presión, el refrigerante absorbe calor y aumenta su entalpía."
   ],
   [
    "Condensación",
    51,
    39,
    "A alta presión cede calor y disminuye su entalpía."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0071.jpg"
 },
 {
  "id": "11uqbyUTIRazTVH5NfBVoeA6wLUPibI0L",
  "file": "vet-pizarron.jpg",
  "title": "VET: bulbo, diafragma y resorte",
  "note": "El pizarrón dice «gas» a la salida. La salida del dispositivo de expansión suele ser una mezcla de líquido y vapor, no vapor seco.",
  "points": [
   [
    "Bulbo y capilar de señal",
    80,
    35,
    "Detecta temperatura a la salida del evaporador. La carga del bulbo pertenece a un circuito sellado independiente."
   ],
   [
    "Diafragma",
    60,
    40,
    "Transforma el equilibrio de presiones en movimiento de la aguja."
   ],
   [
    "Resorte",
    61,
    51,
    "Se opone a la apertura y participa del ajuste de recalentamiento. No ajustarlo sin diagnóstico."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0072.jpg"
 },
 {
  "id": "1F6_yKw86umJx5n5tCTGt0aqyCraer96A",
  "file": "hermetico-abierto.jpg",
  "title": "Despiece didáctico del compresor",
  "note": "Se ven una carcasa cortada, un conjunto electromecánico y piezas de otro compresor sobre la mesa. No se asume que todas pertenezcan al mismo modelo.",
  "points": [
   [
    "Carcasa cortada",
    82,
    50,
    "Permite observar el interior con fines didácticos. No representa una operación rutinaria de mantenimiento de un hermético."
   ],
   [
    "Conjunto motor-compresor",
    33,
    44,
    "Relacioná motor, mecanismo compresor y suspensión. El mecanismo completo no se ve desde este ángulo."
   ],
   [
    "Suspensión",
    24,
    59,
    "Los resortes aíslan parte de la vibración del conjunto interno."
   ],
   [
    "Placa con láminas",
    55,
    25,
    "En el conjunto del fondo se distinguen láminas de válvulas. Su apertura depende de la diferencia de presión en un compresor alternativo."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0077.jpg"
 },
 {
  "id": "1yhfChQErjOGg0fWJJk9QyneB75Y4Gv6j",
  "file": "solenoide-cuerpo.jpg",
  "title": "Cuerpo de válvula sin bobina",
  "note": "Compará esta vista con la válvula armada y con la bobina desmontada. El sentido permitido y el estado sin tensión se verifican en la ficha.",
  "points": [
   [
    "Tubo del núcleo",
    52,
    46,
    "Aloja el mecanismo sobre el que actúa el campo de la bobina."
   ],
   [
    "Cuerpo y conexiones",
    53,
    61,
    "Contiene el paso del fluido; la bobina no está en contacto directo con el caudal principal."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0078.jpg"
 },
 {
  "id": "1d0WymSlzJ9tH2Y7CSF53HdvKq42m36RO",
  "file": "solenoide-bobina.jpg",
  "title": "Bobina de solenoide desmontada",
  "note": "La fotografía permite separar bobinado, envolvente y cuerpo de válvula. No demuestra su tensión nominal ni que sea una bobina en buen estado.",
  "points": [
   [
    "Bobinado",
    48,
    36,
    "La corriente produce un campo magnético que actúa sobre el núcleo del conjunto."
   ],
   [
    "Envolvente y cables",
    62,
    57,
    "Protegen y alimentan la bobina. Identificar tensión, frecuencia y servicio en la placa."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0079.jpg"
 },
 {
  "id": "14nX9BwYckIxYczq6fNcsxuzzgKdU-7p7",
  "file": "rele-corriente.jpg",
  "title": "Relé de arranque: bobina y contactos",
  "note": "Pieza compatible visualmente con un relé de corriente. Confirmar su referencia y montaje; no intercambiarla sólo porque encaje en los terminales.",
  "points": [
   [
    "Bobina de conductor grueso",
    55,
    56,
    "En un relé de corriente, la elevada corriente inicial acciona el contacto de arranque."
   ],
   [
    "Conexiones y soporte",
    55,
    42,
    "El circuito y la orientación de montaje deben coincidir con el modelo del compresor."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0081.jpg"
 },
 {
  "id": "1cW3_8FpSrIYidPBc4BPXn1Blu-q2AowD",
  "file": "protector.jpg",
  "title": "Protector del motor: identificación",
  "note": "La forma es compatible con un protector térmico/sobrecarga externo. La referencia y el esquema son necesarios para confirmar tipo y conexiones.",
  "points": [
   [
    "Cuerpo del protector",
    52,
    63,
    "Su función de protección no equivale a la de un relé de arranque. No puentearlo para sostener la marcha."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0082.jpg"
 },
 {
  "id": "1Ngm_V7OygmJkMToM4Iaxf8H17m8Si9vL",
  "file": "solenoide-armada.jpg",
  "title": "Válvula solenoide armada",
  "note": "Vista útil para relacionar la parte eléctrica con la parte frigorífica. La flecha y las especificaciones deben leerse en el cuerpo o documentación.",
  "points": [
   [
    "Bobina con cubierta",
    43,
    49,
    "Recibe la señal eléctrica; no regula por sí sola el recalentamiento."
   ],
   [
    "Cuerpo del paso",
    63,
    45,
    "Permite o interrumpe el refrigerante según el mecanismo y estado de mando."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0088.jpg"
 },
 {
  "id": "1fRiU4s0tm8ZV45oaHsg98sHEY2EzIln7",
  "file": "caja-electrica.jpg",
  "title": "Caja eléctrica del aire acondicionado",
  "note": "Se observan mandos, capacitor y conexiones. La fotografía no reemplaza el esquema eléctrico ni confirma el destino de cada conductor.",
  "points": [
   [
    "Capacitor",
    37,
    63,
    "Se ven tres grupos de terminales. Leer marcas y valores para determinar sus secciones y conexiones."
   ],
   [
    "Mandos y contactos",
    56,
    32,
    "Seguir cada conductor hacia su carga para reconstruir la orden de marcha."
   ],
   [
    "Conductor de protección",
    46,
    43,
    "La conexión a la estructura cumple una función de protección, diferente del neutro y de las señales de control."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0094.jpg"
 },
 {
  "id": "1RrATGP62ujLsUICA4xekS8kGZYNIUZYf",
  "file": "medicion-34.jpg",
  "title": "Medición de resistencia: 3,4 Ω",
  "note": "La pantalla muestra 3,4 Ω. Las puntas no permiten identificar con certeza ambos bornes; no asignar este valor a un bobinado específico.",
  "points": [
   [
    "Lectura y unidad",
    30,
    49,
    "Registrar el par de terminales, escala, temperatura y resistencia de las puntas. Un valor aislado no diagnostica el motor."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0109.jpg"
 },
 {
  "id": "1O7h62ucgX0ku-mmhTu9f9DwiwBtMcphb",
  "file": "medicion-24.jpg",
  "title": "Medición de resistencia: 2,4 Ω",
  "note": "Se lee 2,4 Ω y una marca C sobre la carcasa. Falta identificar el otro terminal y completar las tres mediciones.",
  "points": [
   [
    "Lectura",
    26,
    27,
    "Comparar los tres pares en un motor monofásico convencional desconectado; comprobar también aislamiento con el método adecuado."
   ],
   [
    "Marca C de clase",
    80,
    55,
    "Es una anotación visible. Confirmar el común con la ficha y las mediciones, no sólo con la pintura."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0110.jpg"
 },
 {
  "id": "1_qjuRQvIhabzQiS1SNDCq2bfpKIxuWJp",
  "file": "placa-daewoo.jpg",
  "title": "Placa Daewoo: datos antes de cargar",
  "note": "En esta placa se leen DSB-125LH, R-22 (0,9 kg) y alimentación monofásica. Son datos de ese equipo; no se trasladan automáticamente a otros bancos o equipos modificados.",
  "points": [
   [
    "Capacidad y potencia",
    47,
    45,
    "La capacidad frigorífica es calor retirado por tiempo; la potencia eléctrica es consumo. No son la misma magnitud."
   ],
   [
    "Refrigerante y presiones de diseño",
    47,
    58,
    "La presión de diseño no es una consigna de funcionamiento ni una presión objetivo de carga. Verificar correspondencia entre unidades."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0113.jpg"
 },
 {
  "id": "1ncYuv79WTLQ2c9IZrBpVZ8TRxYQ1_4Vw",
  "file": "bomba-vacio.jpg",
  "title": "Bomba de vacío: leer el envase",
  "note": "El envase presenta opciones de etapas, frecuencia y tensión. No hay una selección inequívoca visible para cada casilla.",
  "points": [
   [
    "Especificaciones",
    47,
    57,
    "El vacío final anunciado para una bomba no demuestra el vacío alcanzado en el circuito: hace falta medir y comprobar su estabilidad."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0120.jpg"
 },
 {
  "id": "18KpCW7AUK5MjsLwqM4_pvyyDuaYRvCs4",
  "file": "check-pizarron.jpg",
  "title": "Check y capilares: dos sentidos",
  "note": "El dibujo de clase muestra caminos distintos en frío y calor. Las flechas ayudan a explicar qué ramal circula y cuál queda bloqueado.",
  "points": [
   [
    "Paso en modo frío",
    27,
    45,
    "Seguí desde «ingreso» hasta «egreso» y explicá el papel del antirretorno y de las restricciones."
   ],
   [
    "Paso en modo calor",
    65,
    44,
    "Al invertirse la circulación, cambia el camino habilitado. Confirmar el trazado real antes de atribuir este arreglo al banco."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0119.jpg"
 },
 {
  "id": "1R4vD9F91bpOEqivxjp5IJWQo-eDBWDwF",
  "file": "inversora-calor.jpg",
  "title": "Válvula de cuatro vías · modo calor",
  "note": "En este esquema la batería interior es condensadora y la exterior evaporadora. La indicación de bobina energizada corresponde al ejemplo de clase, no a todas las marcas.",
  "points": [
   [
    "Batería interior",
    67,
    35,
    "Recibe descarga caliente, condensa refrigerante y entrega calor al local."
   ],
   [
    "Batería exterior",
    23,
    35,
    "Evapora refrigerante absorbiendo calor del aire exterior."
   ],
   [
    "Inversora",
    44,
    62,
    "Conecta descarga hacia una batería y retorno de la otra hacia aspiración. El compresor conserva sus funciones."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0123.jpg"
 },
 {
  "id": "1FV_ENfAHu_QucG2GzYMjvxPLTNfOD9eD",
  "file": "inversora-frio.jpg",
  "title": "Válvula de cuatro vías · modo frío",
  "note": "En frío, la unidad interior evapora y la exterior condensa. Los colores muestran alta y baja, no necesariamente sólo gas o sólo líquido.",
  "points": [
   [
    "Batería exterior",
    28,
    37,
    "Rechaza calor y condensa el vapor de alta presión."
   ],
   [
    "Batería interior",
    72,
    37,
    "Absorbe calor del ambiente y evapora la mezcla de baja presión."
   ],
   [
    "Inversora",
    49,
    61,
    "Redistribuye conexiones; no sustituye al dispositivo de expansión situado entre las baterías."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0124.jpg"
 },
 {
  "id": "1Um2ygxd65DbJuivXPjwcxyxEgJKwhqCe",
  "file": "peltier-equipo.jpg",
  "title": "Módulo termoeléctrico y disipadores",
  "note": "El conjunto coincide con el tema Peltier del pizarrón. La pastilla está entre las superficies y no se distingue completa; no asignar una cara caliente sin conocer polaridad y condiciones.",
  "points": [
   [
    "Disipadores",
    46,
    46,
    "Intercambian calor con el aire. Deben mantener buen contacto térmico con el módulo."
   ],
   [
    "Ventilador",
    62,
    45,
    "Mejora la transferencia de calor al aire. No mueve refrigerante ni reemplaza la pastilla termoeléctrica."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0127.jpg"
 },
 {
  "id": "1rlFTx7VrlZ7YDqAaCnOs8KtZqbAqpq2v",
  "file": "peltier-pizarron.jpg",
  "title": "Peltier y Seebeck: distinguir efectos",
  "note": "El título del pizarrón reúne ambos nombres. Para refrigerar con corriente se utiliza el efecto Peltier; Seebeck describe la generación de tensión por una diferencia de temperatura.",
  "points": [
   [
    "Cara que absorbe calor",
    48,
    37,
    "En funcionamiento frigorífico, extrae calor de la carga."
   ],
   [
    "Cara que cede calor",
    41,
    55,
    "Debe evacuar el calor absorbido y la energía eléctrica suministrada."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0129.jpg"
 },
 {
  "id": "10hlIxvnyJ7oLjyrpTwMU5-64GR92Uoyn",
  "file": "esquema-trifasico.jpg",
  "title": "Esquema eléctrico del equipo de dos ventiladores",
  "note": "Se leen COMP, dos FAN, MC y alimentación trifásica. Este esquema no debe trasladarse al hermético monofásico de banco.",
  "points": [
   [
    "Compresor y contactor",
    46,
    51,
    "Relacionar contactos de potencia con alimentación del compresor y la bobina de mando."
   ],
   [
    "Ventiladores",
    66,
    57,
    "Dos motores de ventilador aparecen como cargas diferenciadas, con sus capacitores."
   ],
   [
    "Contacto HI/LO",
    47,
    25,
    "Forma parte de la cadena de mando dibujada. Confirmar sus dispositivos y ajustes en el manual del equipo."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0139.jpg"
 },
 {
  "id": "1AP4U3DRrO_Y0sT81QANXGFX6eqVrB1jI",
  "file": "contactor.jpg",
  "title": "Contactor, bornera y capacitores",
  "note": "El contactor muestra tres polos principales. La placa y el esquema determinan tensiones, funciones y límites.",
  "points": [
   [
    "Contactor",
    33,
    37,
    "Una bobina de mando acciona los contactos de potencia. No confundir esos circuitos."
   ],
   [
    "Bornera",
    40,
    70,
    "Permite seguir las conexiones con el esquema; no deducir función sólo por color."
   ],
   [
    "Capacitores",
    74,
    46,
    "En el esquema asociado aparecen capacitores de ventiladores. Comprobar el cableado para vincular cada pieza a su motor."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0141.jpg"
 },
 {
  "id": "1qekqAJxz139MvgA5zCY6XG_iuLMFvehB",
  "file": "control-digital.jpg",
  "title": "Control digital y equipo abierto",
  "note": "Hay un envase R-410A detrás del equipo. Eso no prueba qué refrigerante contiene el circuito ni su compatibilidad con R-410A.",
  "points": [
   [
    "Visor del control",
    60,
    37,
    "Una cifra en pantalla puede ser consigna, temperatura u otro estado. Consultar el modo y manual del control."
   ],
   [
    "Batería",
    15,
    60,
    "Relacionar el intercambio de calor con caudal de aire y estado de aletas, no sólo con el número del visor."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0144.jpg"
 },
 {
  "id": "12svoKd9640-1V4Q-AJS3SDMBbqEVTnLO",
  "file": "manifold.jpg",
  "title": "Manifold y circuito del banco",
  "note": "Las mangueras y el manifold permiten conectar instrumentos. La foto no permite reconstruir todas las conexiones ni leer presiones fiables.",
  "points": [
   [
    "Manifold",
    19,
    42,
    "Confirmar qué toma comunica con alta/baja y qué válvula comunica cada manguera. El color no demuestra la conexión."
   ],
   [
    "Batería y aletas",
    88,
    39,
    "Antes de atribuir una falla a la carga, revisar intercambio, ventilación y condiciones de funcionamiento."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0145.jpg"
 },
 {
  "id": "19NZ1BvEI-N_sP9zo4pHWkA1KqWpf0pns",
  "file": "absorcion.jpg",
  "title": "Absorción: esquema de clase",
  "note": "El dibujo usa amoníaco, agua e hidrógeno: corresponde a un sistema de absorción por difusión, no al ciclo del compresor hermético.",
  "points": [
   [
    "Generador",
    66,
    70,
    "El aporte de calor separa refrigerante de la solución y sostiene la circulación del sistema."
   ],
   [
    "Condensador",
    63,
    33,
    "El vapor de amoníaco rechaza calor y condensa."
   ],
   [
    "Evaporador",
    28,
    31,
    "El amoníaco evapora en presencia de hidrógeno y absorbe calor del recinto."
   ],
   [
    "Absorbedor",
    49,
    53,
    "El agua absorbe amoníaco; el hidrógeno recircula. Hay que explicar los recorridos de cada sustancia."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0150.jpg"
 },
 {
  "id": "1LtKrOGy3Y2BRkO5-s24rUc-F033fCUfO",
  "file": "camara-completa.jpg",
  "title": "Cámara: batería, ventiladores y controles",
  "note": "Vista interior más completa que la anterior. La imagen no demuestra el estado de marcha de los ventiladores ni la ubicación exacta del bulbo.",
  "points": [
   [
    "Ventiladores",
    48,
    27,
    "Mueven el aire del recinto sobre la batería. Una foto fija no permite determinar su sentido de giro."
   ],
   [
    "Batería y bandeja",
    48,
    47,
    "El refrigerante absorbe calor en los tubos; la bandeja recoge agua de condensación o desescarche."
   ],
   [
    "VET",
    71,
    27,
    "Dosifica refrigerante hacia el evaporador según recalentamiento."
   ],
   [
    "Solenoide",
    74,
    43,
    "Interrumpe o habilita el ramal por orden eléctrica."
   ],
   [
    "Termostato",
    79,
    20,
    "Demanda frío según la temperatura del recinto."
   ]
  ],
  "newBatch": true,
  "originalName": "IMG-20261026-WA0052.jpg"
 }
];
const robbioPhotoIndex=Object.fromEntries(robbioNewPhotos.map((p,i)=>[p.file,robbioPhotos.length+i]));
robbioPhotos.push(...robbioNewPhotos);
function robbioPhotoIds(...files){return files.map(file=>robbioPhotoIndex[file+'.jpg'])}
robbioLessons[0].photos.push(...robbioPhotoIds('ciclo-pizarron','placa-daewoo','inversora-frio'));
robbioLessons[1].photos.push(...robbioPhotoIds('hermetico-abierto','rele-corriente','protector'));
robbioLessons[2].photos.unshift(...robbioPhotoIds('camara-completa'));
robbioLessons[3].photos.push(...robbioPhotoIds('vet-pizarron','solenoide-cuerpo','solenoide-bobina','solenoide-armada','check-pizarron'));
robbioLessons[4].photos.push(...robbioPhotoIds('placa-daewoo','bomba-vacio','manifold','control-digital'));
robbioLessons.push(...[
 {
  "id": "inversion",
  "title": "Frío / calor y check",
  "intro": "Compará los dos dibujos de clase. La inversora cambia el destino de aspiración y descarga; el compresor sigue comprimiendo vapor en el mismo sentido.",
  "files": [
   "inversora-frio",
   "inversora-calor",
   "check-pizarron"
  ],
  "ref": "Esquemas de clase de válvula de cuatro vías y check. Lijó: principios del ciclo y dispositivos de expansión.",
  "steps": [
   [
    "Recorrido en modo frío",
    "Descarga del compresor → inversora → batería exterior (condensación) → expansión → batería interior (evaporación) → inversora → aspiración. Señalá dónde hay vapor caliente, líquido de alta, mezcla de baja y vapor de retorno."
   ],
   [
    "Recorrido en modo calor",
    "Descarga → inversora → batería interior, que entrega calor al local y condensa → expansión → batería exterior, que absorbe calor y evapora → inversora → aspiración. El aire exterior puede ceder calor aun cuando su temperatura sea baja."
   ],
   [
    "Qué hacen la bobina y la corredera",
    "La señal eléctrica actúa sobre el mecanismo piloto; la diferencia de presión permite desplazar la corredera principal según el diseño. «Bobina energizada = calor» pertenece al ejemplo fotografiado: otros equipos pueden usar otra lógica. Confirmar tensión y conexiones."
   ],
   [
    "Qué cambia en las check y los capilares",
    "Seguí las flechas del dibujo de check desde el ingreso al egreso en ambos modos. El antirretorno permite un sentido y bloquea el opuesto, habilitando o evitando ramas de restricción según el circuito. No basta decir «invierte»: hay que señalar cada camino y dónde cae la presión."
   ]
  ],
  "questions": [
   [
    "En calor, ¿la unidad exterior sigue siendo condensadora?",
    "No: en el ciclo reversible dibujado es evaporadora. La unidad interior recibe la descarga y condensa, entregando calor al local. Explicá el recorrido completo hasta la aspiración."
   ],
   [
    "¿Qué diferencia hay entre inversora y check?",
    "La inversora redistribuye cuatro conexiones; la check se opone al retorno en un ramal. Explicá además cómo el arreglo de restricciones mantiene la expansión antes de la batería que evapora."
   ]
  ]
 },
 {
  "id": "electrico",
  "title": "Arranque y mediciones",
  "intro": "Relacioná piezas desmontadas, bornes, bobinados y esquema. Hay equipos monofásicos y uno con alimentación trifásica: no se diagnostican con el mismo circuito.",
  "files": [
   "caja-electrica",
   "rele-corriente",
   "protector",
   "medicion-34",
   "medicion-24",
   "esquema-trifasico",
   "contactor"
  ],
  "ref": "Lijó · secciones 3.2.5 y 3.2.5.2, páginas PDF 62–64. Secop: diseño mecánico y eléctrico del compresor.",
  "sources": [
   [
    "Manual de Lijó",
    "https://drive.google.com/file/d/1Pp6UUwjHF843jgCtpaJRGNaolx8WzDrU/view"
   ],
   [
    "Secop · diseño del compresor",
    "https://www.secop.com/fileadmin/user_upload/technical-literature/danfoss-lectures/compressor_design_mechanical_and_electrical.pdf"
   ]
  ],
  "steps": [
   [
    "Identificá alimentación y tipo de motor",
    "En un monofásico convencional distinguí común C, marcha R y arranque S según documentación. En el esquema trifásico fotografiado aparecen tres líneas de potencia al compresor y dos motores de ventilador: no aplicar allí una identificación C–R–S de monofásico."
   ],
   [
    "Relé, capacitor y protección",
    "En un sistema con relé de corriente, la corriente inicial acciona temporalmente el circuito de arranque. Un capacitor de arranque se desconecta según el sistema; uno de marcha permanece conectado. El protector abre por condiciones de sobrecarga/temperatura según su tipo. Ninguna de estas piezas se reemplaza por una de igual forma sin verificar especificación."
   ],
   [
    "Interpretá las resistencias",
    "Con equipo sin tensión y bobinados aislados del circuito, se comparan los tres pares de un monofásico convencional: la resistencia entre los extremos de marcha y arranque es aproximadamente la suma de las otras dos. Las fotos muestran 3,4 Ω y 2,4 Ω, pero no identifican todos los puntos de prueba. No bastan para concluir que el motor está sano ni para descartar defectos de aislamiento."
   ],
   [
    "Separá mando y potencia",
    "El termostato o control emite la orden; los permisos/protecciones pueden interrumpirla; la bobina de un contactor conmuta los contactos de potencia. Relacioná cada símbolo del esquema con la bornera y la carga. Un contacto cerrado o un clic no demuestran que el compresor reciba la alimentación correcta."
   ]
  ],
  "questions": [
   [
    "Con las fotos de 3,4 Ω y 2,4 Ω, ¿podés declarar sano el compresor?",
    "No. Faltan los pares exactos, tercera medición, referencia del motor y comprobación de aislamiento, entre otros datos. Si fueran dos ramas con común de un mismo motor convencional, su suma sería una comprobación de coherencia, no una certificación de funcionamiento."
   ],
   [
    "¿Por qué no sirve puentear el protector para que siga funcionando?",
    "El corte es una protección y puede responder a una causa real: sobrecarga, mala alimentación, arranque defectuoso o condiciones frigoríficas anormales. Hay que diagnosticar la causa y verificar el dispositivo con el procedimiento del fabricante."
   ]
  ]
 },
 {
  "id": "diagramas",
  "title": "Estados y diagrama p–h",
  "intro": "Pasá de nombrar componentes a explicar transformaciones. El esquema del pizarrón se conserva con aclaraciones para evitar memorizar rótulos imprecisos.",
  "files": [
   "ciclo-pizarron",
   "ph-pizarron",
   "vet-pizarron",
   "placa-daewoo"
  ],
  "ref": "Lijó · principios del ciclo, condensadores, evaporadores y sección 6.2 sobre recalentamiento. Esquemas de clase aportados.",
  "steps": [
   [
    "Ubicá ejes y zonas",
    "En p–h, presión en el eje vertical y entalpía específica en el horizontal. En cartas frigoríficas la presión suele representarse en escala logarítmica. La campana delimita la región de mezcla; a sus lados se interpretan líquido subenfriado y vapor sobrecalentado según la carta. No usar PV = mRT como descripción general de una mezcla bifásica."
   ],
   [
    "Compresión y condensación",
    "La compresión aumenta presión y entalpía mediante trabajo. En el condensador el refrigerante pierde entalpía: desrecalentamiento del vapor, condensación y eventual subenfriamiento. Un trazo horizontal idealiza presión constante; los equipos reales presentan pérdidas."
   ],
   [
    "Expansión y evaporación",
    "La expansión por estrangulamiento se aproxima por h constante: descenso vertical en p–h, con evaporación parcial. Después el evaporador absorbe calor a baja presión y aumenta h. En la foto, la palabra «expansión» está junto al tramo inferior; ese tramo representa evaporación, no el estrangulamiento."
   ],
   [
    "Conectá el gráfico con mediciones",
    "Recalentamiento = temperatura real del vapor − temperatura de saturación a la presión local. Subenfriamiento = temperatura de saturación a la presión de líquido − temperatura real del líquido. Usá el refrigerante y las referencias de rocío/burbuja que correspondan. Las diferencias de entalpía permiten calcular calor y trabajo específicos; no se leen como diferencias de temperatura."
   ]
  ],
  "questions": [
   [
    "¿Por qué expansión no significa que todo se vuelve gas?",
    "A la salida suele existir mezcla. Parte del líquido se evapora durante la caída de presión y el resto absorbe calor en el evaporador. Si ya todo fuera vapor, cambiaría el aprovechamiento del intercambio."
   ],
   [
    "¿Qué diferencia hay entre capacidad frigorífica y potencia eléctrica de placa?",
    "La capacidad es calor retirado por unidad de tiempo. La potencia eléctrica es energía eléctrica consumida por unidad de tiempo. Su cociente, con unidades compatibles y condiciones definidas, se relaciona con el rendimiento frigorífico."
   ]
  ]
 },
 {
  "id": "peltier",
  "title": "Refrigeración Peltier",
  "intro": "El conjunto con disipadores y ventilador corresponde a otra forma de transportar calor. Comparalo con el ciclo de compresión.",
  "files": [
   "peltier-equipo",
   "peltier-pizarron"
  ],
  "ref": "Pizarrón y módulo fotografiado. Ferrotec · tecnología termoeléctrica.",
  "sources": [
   [
    "Ferrotec · tecnología termoeléctrica",
    "https://thermal.ferrotec.com/technology/"
   ],
   [
    "Ferrotec · efectos termoeléctricos",
    "https://ferrotec.com.sg/product/thermo/technical_reference_guide/1/"
   ]
  ],
  "steps": [
   [
    "Reconocé el conjunto",
    "Módulo termoeléctrico, superficies de contacto, disipadores, aislamiento y ventilador. La pastilla no está completamente visible entre las placas."
   ],
   [
    "Explicá Peltier",
    "Una corriente eléctrica permite transportar calor entre las caras del módulo. Una absorbe calor y la otra lo rechaza; la polaridad influye en el sentido."
   ],
   [
    "Explicá la disipación",
    "La cara caliente debe evacuar el calor absorbido más la potencia eléctrica suministrada. Si la disipación empeora, también empeora la capacidad de enfriamiento."
   ],
   [
    "Distinguí Seebeck",
    "Seebeck: una diferencia de temperatura genera tensión. Peltier: la corriente produce transporte de calor. El título del pizarrón reúne ambos; no son nombres intercambiables."
   ]
  ],
  "questions": [
   [
    "¿Dónde están el compresor y el capilar en este módulo?",
    "No forman parte del principio termoeléctrico mostrado. Explicá entrada eléctrica, transporte de calor entre caras y disipación al aire."
   ],
   [
    "¿El ventilador produce el efecto Peltier?",
    "No. Ayuda al intercambio con el aire; el efecto termoeléctrico ocurre en el módulo. Identificá ambas funciones en la foto."
   ]
  ]
 },
 {
  "id": "absorcion",
  "title": "Refrigeración por absorción",
  "intro": "El esquema de clase incluye NH₃, agua e hidrógeno. Es el ejemplo de absorción por difusión; no todos los sistemas de absorción usan estos tres fluidos.",
  "files": [
   "absorcion"
  ],
  "ref": "Esquema de clase. Dometic · explicación de tecnologías y funcionamiento de refrigeradores de absorción.",
  "sources": [
   [
    "Dometic · tecnologías de refrigeración",
    "https://support.dometic.com/en/cf-coolers/Cooling-technologies-explained-4910"
   ],
   [
    "Dometic RM2350 · sistema de absorción",
    "https://media.dometic.com/externalassets/dometic-rm-2350-_9600029484_81557.pdf"
   ]
  ],
  "steps": [
   [
    "Aporte de calor y separación",
    "El generador recibe calor de una llama o resistencia. Se desprende amoníaco de la solución; el sistema separa y conduce el vapor hacia la condensación."
   ],
   [
    "Condensador y evaporador",
    "El amoníaco condensa cediendo calor. Luego evapora en presencia de hidrógeno y absorbe calor del recinto. El hidrógeno participa en las condiciones de presión parcial."
   ],
   [
    "Absorbedor y retorno",
    "El agua absorbe amoníaco; la solución retorna y el hidrógeno recircula. Hay que seguir por separado solución, refrigerante y gas auxiliar."
   ],
   [
    "Compará la fuente de energía",
    "El aporte térmico impulsa este proceso, en lugar del compresor eléctrico del ciclo anterior. También necesita rechazar calor al ambiente."
   ]
  ],
  "questions": [
   [
    "¿Qué función cumple cada sustancia del dibujo?",
    "Amoníaco: refrigerante. Agua: absorbente en la solución. Hidrógeno: gas auxiliar del ejemplo por difusión. No decir que los tres se comprimen en un compresor."
   ],
   [
    "¿Cómo puede una llama contribuir a enfriar?",
    "Aporta energía al generador para sostener el proceso; la absorción de calor útil ocurre al evaporar el refrigerante. Señalá también dónde se rechaza calor."
   ]
  ]
 }
].map(({files,...lesson})=>({...lesson,photos:robbioPhotoIds(...files)})));
