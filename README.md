# Cuaderno naval · Finales 2026

Aplicación de estudio para Máquinas térmicas, Sistemas de frío, Motores navales, Electrotecnia, Electrónica y Economía naviera.

**Sitio:** https://finalesmaq2026.vercel.app

## Funciones

- Repaso guiado: 50 lecciones con voz del navegador, mapas conceptuales, ejemplos, esquemas, listas y práctica por tema.
- Profesor oral con Gemini: texto o audio, niveles de profundidad, velocidades, modo bucle, ayudas y devolución final.
- Continuación sin Gemini: preguntas precargadas al iniciar, guardado local de respuestas y adjuntos, revisión por pregunta con referencia preparada y «Consultar resolución» al recuperar el servicio. Las consultas no generan calificaciones ni modifican progreso.
- «Enviar respuesta» reintenta automáticamente sin límite hasta recibir una respuesta válida o pulsar de nuevo el mismo botón («Detener envío»). Conserva el mismo texto, audio, imagen y token; usa pausas progresivas y respeta Retry-After. Las consultas, revisiones y resoluciones conservan el reintento manual. Las consultas y resoluciones permiten cancelar una petición en curso. Las revisiones ya guardadas se recuperan al reintentar manualmente con el mismo identificador.
- Preguntas con foto: «Preguntar al profesor» admite una imagen PNG, JPG o WebP de hasta 2 MB, con vista previa y opción de quitarla. Puede enviarse sola para pedir identificación y función, o con una consulta escrita. La foto se conserva al detener/reintentar y aparece en la conversación; no modifica calificaciones y también se puede consultar antes de iniciar un examen.
- Transcripción independiente de Gemini: Whisper tiny multilingüe se ejecuta en un worker del navegador con Transformers.js. Transcribe automáticamente al detener una grabación o cargar un audio, permite corregir el texto y volver a transcribir audios guardados. La primera ejecución descarga el motor/modelo desde jsDelivr y Hugging Face; el audio se procesa localmente. Puede demorar según conexión y dispositivo y permite detener/reintentar o escribir el texto si falla.
- «Descargar texto y copiar» genera el mismo contenido en el archivo y el portapapeles: preguntas, respuestas escritas, transcripciones identificadas por motor, consultas, devoluciones, resoluciones y borradores. Espera a que terminen las transcripciones activas; si el navegador bloquea la copia, ofrece un campo para copiar manualmente. El texto queda preparado para pegar en ChatGPT.
- Autenticación y progreso con Supabase: intentos, puntuaciones e historial separados por materia y usuario.
- Taller conceptual de calderas con modelos interactivos y ejercicios de identificación.
- Biblioteca, programas y notas por materia.

El avance de lectura y las notas se conservan en el navegador, separados por cuenta y materia. Las calificaciones del profesor se guardan en Supabase. Motores y Economía se organizan según los apuntes disponibles; su organización no representa un programa oficial completo.

## Estructura

`dist/` contiene el código fuente de la aplicación, pese al nombre heredado:

- HTML, CSS y JavaScript sin compilador ni dependencias de frontend.
- `api/`: funciones Node.js para Vercel.
- `server-data/`: lógica de servidor, bancos didácticos y lecturas de referencia.
- `assets/`: imágenes y esquemas.
- `build-static.cjs`: copia únicamente los archivos públicos a `dist/public/`.
- `vercel.json`: configuración del despliegue.

`supabase/` contiene las migraciones SQL y `tests/` la verificación del repaso guiado.

## Desarrollo y despliegue

Requiere Node.js 20 o superior. Desde `dist/`, ejecutar `vercel dev` con la CLI oficial de Vercel para disponer del frontend y las rutas API. Un servidor estático por sí solo no ejecuta las funciones del profesor, las cuentas ni el repaso.

Configurar en Vercel, exclusivamente como variables de servidor:

| Variable | Uso |
| --- | --- |
| `GEMINI_API_KEY` | Evaluación del profesor mediante Gemini |
| `SUPABASE_SECRET_KEY` | Operaciones autorizadas del backend con Supabase |

El proyecto utiliza el Supabase y el dominio de producción indicados en `dist/server-data/accounts.cjs`. Para migrarlo a otra cuenta, actualizar esa configuración y los destinos OAuth correspondientes. El inicio de sesión Google se configura en Supabase; el secreto OAuth no pertenece al frontend.

En Vercel seleccionar **Root Directory: `dist`**. La configuración ejecuta `node build-static.cjs`, publica `public/` y despliega `api/`. Para publicar con CLI, ejecutar `vercel --prod` desde `dist/` después de vincular el proyecto correcto.

El repositorio no contiene credenciales de despliegue ni archivos `.env`. El directorio generado `public/` y los metadatos locales de Vercel están excluidos de Git.

## Base de datos

Para una base nueva, revisar y aplicar las migraciones de `supabase/` en orden numérico. Incluyen tablas, políticas y funciones para las cuentas y el progreso. Revisar los datos de configuración antes de utilizarlas en otra instalación; no son copias de las respuestas ni del historial de usuarios reales.

## Verificación

Desde la raíz del repositorio:

```sh
node tests/guided.cjs
node tests/exam.cjs
node tests/followup.cjs
node tests/deferred-exam.cjs
node tests/professor-retry.cjs
node tests/revision-retry.cjs
node tests/followup-photo.cjs
node tests/exam-transcription.cjs
node tests/exam-export.cjs
```

Comprueba las 50 lecciones, los mapas, las referencias, las respuestas de práctica, la validación de la API y la pausa, reanudación y cancelación de la narración mediante un motor simulado. La calidad y disponibilidad de voces dependen del navegador y del sistema operativo.

Las pruebas del oral verifican carga de la API, inicio por materia, estabilización del observador, selección de la pregunta a resolver, aislamiento por usuario y conservación de texto/audio/imagen ante fallos. Gemini se simula en las pruebas. El último examen queda en IndexedDB, por cuenta y materia, en el mismo navegador; iniciar otro examen lo reemplaza. Las preguntas deben haberse cargado al comenzar para seguir durante una caída total del servidor. El archivo de descarga incluye texto y resoluciones, pero los adjuntos permanecen en el navegador.

La exportación distingue la respuesta escrita de las transcripciones local y de Gemini y marca explícitamente los audios sin transcripción. El worker usa `@huggingface/transformers@4.3.1` y `Xenova/whisper-tiny` con revisión fijada `5332fcc35e32a33b86612b9a57a89be7906102b1` y cuantización q8. No necesita una clave ni facturación de otra API. Referencias: [Transformers.js](https://github.com/huggingface/transformers.js), [modelo Whisper tiny](https://huggingface.co/Xenova/whisper-tiny).

## Materiales

Los desarrollos son ayudas didácticas; los modelos no son planos constructivos. Los materiales de referencia conservan sus derechos originales. Este repositorio se mantiene privado y su publicación en GitHub no modifica los permisos de los originales de Google Drive.

## Preguntas del apunte Máquinas Térmicas

Simulacro y HDP incorporan 90 consignas (dos enfoques para 45 títulos), con páginas verificadas del PDF de Fernandez Hanna Jorge Gabriel. Cada examen nuevo selecciona una variante aleatoria por título (45 preguntas PDF en el integrador completo), para evitar preguntar dos veces los mismos criterios. Se mezclan con el banco existente dentro de la unidad elegida. Práctica acompañada conserva su banco. Cada tema define dos criterios básicos, tres en Simulacro (+50 %) y cuatro en HDP (+100 %); los porcentajes describen cantidad de criterios, no una medición objetiva de dificultad. La velocidad modifica la devolución, no elimina criterios del nuevo banco. Las referencias revisadas aclaran contradicciones del apunte y no convierten valores o maniobras históricas en procedimientos universales.

Verificación: `node tests/thermal-pdf.cjs`.

## Precisión en HDP

HDP exige relaciones técnicas explícitas y revisa términos vagos y afirmaciones agregadas. La devolución cita la respuesta y separa precisión técnica, qué se dijo de más y qué faltó; distingue errores de contenido correcto innecesario, que no se penaliza. Precisión tiene peso 30; concepto 15, componentes 10, funcionamiento 20, conexiones 15, mantenimiento y fallas 5 cada uno. Se normalizan únicamente los criterios aplicables. La política también se envía al revisar notas y se conserva en velocidad rápida.

Verificación: `node tests/hdp-precision.cjs` (Gemini simulado; no acredita la calidad de respuestas del modelo real).

## Catálogo de preguntas y repeticiones

`/preguntas.html` permite buscar las preguntas reales del profesor por materia, unidad, modalidad y velocidad, incluidas las láminas. Se genera desde los bancos al construir el sitio; no publica respuestas ni fragmentos de libros. Los JSON descargables distinguen las 321 tarjetas almacenadas de las variantes de modalidad/velocidad y documentan las 45 parejas redundantes del PDF en HDP. El plan selecciona una sola variante de cada tema PDF por examen; los tokens anteriores conservan sus IDs y siguen siendo válidos. Los solapamientos temáticos entre preguntas de distinto alcance se conservan. Modo bucle repite la vuelta al agotarla.

Las devoluciones con nota menor a 7 pueden incluir una sola broma argentina de un repertorio del servidor; rota según el turno y evita las últimas frases del profesor. La broma acompaña la corrección técnica, se conserva al recuperar un resultado y no modifica la nota. Verificación: `node tests/exam-humor.cjs`.

## Cobertura obligatoria en HDP

Las consignas generales exigen siete aspectos de desarrollo, aunque la referencia breve sólo tenga uno o dos puntos. El servidor requiere una evaluación estructurada de cada aspecto: completo = 1, parcial = 0,5 y ausente = 0. La nota es el menor valor entre la rúbrica y `(aspectos cubiertos / aspectos exigidos) × 10`; no se acumulan multas por la misma omisión. Dos aspectos completos de siete, sin desarrollar el resto, dan como máximo 2,86/10. Los criterios pedidos no pueden desaparecer del promedio por marcarse no aplicables. En conceptos se evalúan elementos, variables y relaciones, sin inventar componentes físicos. Mantenimiento y fallas sólo se incluyen cuando se solicitan expresamente. PDF y láminas conservan el alcance de sus puntos específicos, sin sumarles la consigna general.

La evidencia textual de cobertura debe estar en la respuesta del alumno. Una evaluación incompleta o con citas ajenas se rechaza sin guardar una nota inventada. Esta política se conserva en velocidad rápida y al revisar una nota; la revisión evalúa la respuesta original y las ampliaciones acumuladas. La devolución muestra cobertura, límite y omisiones. Verificación con Gemini simulado: `node tests/hdp-coverage.cjs` y `node tests/hdp-coverage-api.cjs`.

## Pauta inicial de HDP por materia

Cada materia tiene su propia pauta y sus siete aspectos de cobertura en `dist/server-data/hdp-profiles.cjs`. Economía naviera evalúa conceptos económicos o contractuales, actores, variables, mecanismos, relaciones causales, aplicación y supuestos; no hereda exigencias de circuitos o fluidos de Máquinas Térmicas. Los rótulos de la rúbrica HDP también siguen la materia.

La pauta se entrega en `hdpIntro` sólo al comenzar un examen, se muestra en un bloque inicial y se lee una vez junto con la primera pregunta. Las preguntas, las colas para continuar sin IA y el catálogo contienen únicamente la consigna específica. Responder, omitir o completar una vuelta no vuelve a agregar la introducción. Restaurar un examen conserva su mensaje inicial y comenzar otro muestra la pauta de la materia elegida. La cobertura exigida se mantiene aunque la pauta ya no se repita. Verificación: `node tests/hdp-subject-guidance.cjs` con Gemini simulado.

## Salir del examen sin evaluar

El botón rojo «Salir del examen» cierra la práctica local y libera modalidad, unidad, alcance y velocidad para comenzar otra. No llama a `finish`, `skip` ni `answer`: no crea una nota final ni registra una omisión por salir. Los intentos que ya se corrigieron conservan su registro. Detiene grabación, voz y peticiones del navegador, descarta borradores y limpia la copia local del examen; las respuestas o restauraciones tardías no pueden reabrirlo ni cambiar la configuración nueva. Si el guardado local falla, se informa para reemplazar la copia antes de recargar. Verificación: `node tests/exam-exit.cjs`.

Prueba del envío automático y cancelable del oral: `node tests/oral-retry.cjs`. Salir del examen o continuar sin IA cancela el envío automático.

## Barra lateral y modo ZEN

«Ocultar menú / Mostrar menú» colapsa la barra lateral y recuerda la preferencia en este navegador. Entrar en Profesor IA activa ZEN: sólo quedan el chat, sus opciones de examen y una barra superior con «Salir del examen» a la derecha. Salir cierra la práctica sin una evaluación adicional, recupera la navegación y conserva la preferencia previa del menú. Se puede volver a activar ZEN con su botón o al comenzar otro examen. La ruta de cuenta conserva la navegación y, sin sesión iniciada, ZEN muestra el acceso para ingresar. Verificación: `node tests/study-layout.cjs` y `node tests/exam-exit.cjs`.

### Taller 3D: revisión con el apunte Máquinas Térmicas
Los modelos simple, A, M y D usan geometría y recorridos propios (dist/boiler-geometry.js), con 6, 17, 17 y 18 conjuntos seleccionables. Se corrigió la ubicación central/lateral de los colectores M y se separaron haz principal, pantalla, pared y piso de la D. El inspector distingue función, conexiones y referencias del PDF (páginas 5, 8–13 y 15–17); la numeración del visor es independiente. Incluye números con líneas guía, aislamiento, vista frontal, interior del domo y recorridos de agua/mezcla, vapor y gases. El despiece pausa la animación para no mostrar conexiones falsas. Son esquemas sin escala, con envuelta retirada y accesorios simplificados; no reproducen todas las etapas ni toda la tubería auxiliar. Validación: node tests/boiler-models.cjs y revisión visual en navegador.

### Frío: examen por diapositivas de Dambrossi
«Elegir diapositivas» acepta de 1 a 6 números originales distintos (no páginas del PDF); vacío mantiene el examen por tema. El plan firmado contiene sólo las fichas elegidas, conserva el orden y finaliza tras evaluarlas. La selección se guarda en la copia local y se preserva al salir. Se importaron 82 fichas de preguntas_de_frio_ilustraciones_revisadas.pdf (Drive 1fvPtD1mW_xkfpKaNKIygVl4J5rYK4FQ-); 76 son evaluables. Las 32, 33, 34, 54, 57 y 78 se listan pero no se habilitan hasta resolver la identificación insuficiente documentada por la propia guía. No se inventan números ausentes.

La corrección recibe la página original como imagen fuente, separada de la respuesta del alumno. Veintiuna fichas incorporan además pasajes de las páginas citadas de Lijó y su contexto inmediato; las restantes mantienen las figuras, procedencia y advertencias de la guía, sin afirmar que se recuperaron todos los libros. La ficha 59 conserva la contradicción alta/baja presión. La resolución y revisión usan la misma imagen.

Simulacro y HDP de Frío exigen cobertura con evidencia textual. Completo=1; parcial=0,5 en Simulacro y 0,25 en HDP; ausente=0. Cualquier aspecto incompleto limita a 6,90/10 o 5,90/10 respectivamente, además del límite proporcional y la rúbrica (se aplica el menor). Velocidad rápida no recorta requisitos ni omisiones. La identificación semántica sigue dependiendo de Gemini: las pruebas simulan sus respuestas y verifican el contrato, los topes y el rechazo de evidencia inválida.

Importación reproducible: python scripts/import-frio-slides.py guia.pdf lijo.pdf (PyMuPDF). Pruebas: node tests/frio-slides.cjs, node tests/question-catalog.cjs, node tests/hdp-coverage-api.cjs y regresiones del examen.

## Voz automática sin cuentas ni API

El profesor y el repaso usan `dist/speech-voice.js`: selección manual del repaso, Google argentino si está disponible, otra voz es-AR, Google en español y finalmente la voz predeterminada del sistema. La lista depende del navegador y dispositivo y se consulta en cada lectura. Los errores de síntesis reintentan una sola vez con la voz del sistema; cancelar, salir o bloquear la reproducción no dispara reintentos. No requiere tarjeta, clave ni plan de facturación. Verificación: `node tests/speech-voice.cjs`, `node tests/guided.cjs` y `node tests/thermal-guide.cjs`.

## Desplazamiento estable

El reproductor del repaso mantiene su altura al desplazarse. El profesor conserva los nodos de los mensajes durante actualizaciones de estado y no mueve la página al recibir una respuesta. Si se consulta un mensaje anterior, conserva esa posición; si se está al final de la conversación, sigue los mensajes nuevos. Prueba en Edge con Playwright: `node tests/scroll-browser.cjs` (requiere Playwright y Edge instalados).

## Explosividad en el cárter · Motores

La guía conserva 330 preguntas y los IDs M319/M320, amplía sus ejes y la aclaración técnica con fuentes de Wärtsilä, MAN y WinGD. El tema 8 del repaso incorpora cuatro tarjetas sobre mezcla inflamable, puntos calientes, detección/alivio y actuación ante alarma. Las mismas tarjetas están disponibles en el banco oral y el catálogo, sin desplazar IDs anteriores. La guía web y su PDF se regeneran con `study-sources/motores-guide/build_guide.py`. Verificación: `node tests/motores-carter.cjs`, `node tests/guided.cjs` y `node tests/question-catalog.cjs`.

## Cobertura de exámenes de Motores · revisión del 27/10/2026

La guía anual tiene 400 preguntas (conserva M001–M330 y las ampliaciones M331–M400). Se integran 140 consignas correspondientes a 15 exámenes, trabajos prácticos y cuestionarios docentes (siete exámenes únicos fotografiados y ocho exámenes y cuestionarios escritos de la carpeta de fuentes). El filtro EXAMEN y el anexo permiten recorrer cada origen. La selección del simulador y repaso pasa a 130 preguntas en 14 temas; se conservan los índices de los temas anteriores y los IDs de sus tarjetas.

study-sources/motores-guide/exam-coverage.json registra fuentes, alcance y correspondencias; eview-expansion.json contiene las 101 tarjetas preparadas y sus vínculos con la guía. Los bancos complementarios y las respuestas de compañeros se contrastan por temas; no se afirma lectura exhaustiva de los libros ni validación de sus solucionarios. Se distingue resolución de instrumentos, diseños de distribución frente a accionamiento valvular, función del sobrealimentador/soplante en cuatro y dos tiempos, construcción de cojinetes y efectos del reglaje sin convertir datos de un modelo en límites universales.

Verificación: ode tests/motores-coverage.cjs, ode tests/motores-carter.cjs, ode tests/guided.cjs, ode tests/question-catalog.cjs, ode tests/exam.cjs, ode tests/hdp-subject-guidance.cjs y ode tests/deferred-exam.cjs. QA de navegador: 400 preguntas, filtro EXAMEN, quince exámenes integrados, enlaces a ampliaciones, catorce temas y PDF enlazado. PDF renderizado y revisado: 69 páginas.

## Inyección diésel · primera serie 3D

`inyeccion.html` incorpora tres modelos WebGL seleccionables desde el inicio y la biblioteca de Motores: bomba e inyectores separados, distribuidor independiente y distribución por válvulas Poppet. Incluye geometría volumétrica escalonada, tuberías curvas, engranajes, resortes, nombres con líneas guía, inspector, giro/zoom, corte transparente, despiece gradual, aislamiento y animación por cuatro fases con control de velocidad. El despiece y el aislamiento pausan la animación; el despiece retira tuberías para evitar conexiones falsas. Las dependencias Three.js 0.170.0 y OrbitControls se sirven localmente, con licencia MIT incluida.

Fuentes revisadas visualmente: N9 Circuitos de combustible y cámara de combustión de CSMN Gastón Tolay (Drive `1Y4LHvF_CTLKORXzjsKsCSgwOikN6M9CQ`), diapositivas 29–33. N6 Sistemas de inyección y alimentación de combustible (Drive `1hHndzpO0U4zD0f1YUKbWKoH5but2qgAk`), diapositivas 3–4, 6 y 16–19, aporta el funcionamiento del sistema básico. Cada modelo enlaza y muestra su diapositiva de referencia.

Alcance: modelos didácticos sin escala ni validez constructiva. Cuatro cilindros para legibilidad (figura 442: seis), secuencia ilustrativa 1–2–3–4, desplazamientos ampliados; no se calculan presiones ni leyes de inyección. Auxiliares de contexto y detalles omitidos se declaran en cada ficha. El distribuidor independiente no representa la monobomba rotativa incorporada. Inyector-bomba y demás modelos quedan fuera de esta primera serie.

Validación: `node tests/inyeccion-browser.cjs` (Playwright y Edge): tres sistemas, fase de inyección, reproducción/pausa, despiece, ocultación de conexiones, selección, aislamiento, nombres, imágenes fuente, liberación de geometrías, ancho móvil y enlace desde Motores. `INJECTION_QA_DIR` permite guardar capturas fuera del repositorio.

## Inyector-bomba GM · cuarto modelo

Se agrega `inyeccion.html#unitario`, basado en N9, diapositivas 27–28, 34 y 60–61, revisadas visualmente. Representa una unidad GM, con alimentación/retorno externos a baja presión, generación interna de alta presión, leva perfilada, seguidor, varilla, balancín, émbolo descendente y resorte de recuperación sincronizados. Incluye despiece de camisa/lumbreras, cremallera, engranaje de regulación, filtros, válvulas de asiento plano y esférico, pequeño pistón y boquilla. No mezcla la variante Cummins de la diapositiva 62. Las carreras, canales y válvulas son didácticos; no se calculan presiones ni reglajes. Se conservan los tres modelos existentes y se mejora la distribución de etiquetas para evitar superposiciones al desarmar.

Inventario por configuraciones principales (sin contar dos veces esquemas repetidos ni cada variante de componente):

| Sistema | N9 | Estado |
| --- | --- | --- |
| Bomba e inyectores separados / multipistón | 25–26, 33 | Disponible |
| Distribuidor independiente | 31–32 | Disponible |
| Distribución por válvulas Poppet | 29–30 | Disponible |
| Inyector-bomba | 27–28, 34, 60–62 | Disponible tipo GM; Cummins no modelado |
| Monobomba y distribuidor rotativo incorporado | 35–36 | Pendiente |
| Conducto común con limitadora de presión | 20–22 | Pendiente |
| Acumulación con presión regulada | 23–24 | Pendiente |

De los cinco sistemas pedidos inicialmente, cuatro están disponibles y uno pendiente. Con los dos sistemas de conducto común del apunte se agrupan siete configuraciones principales, tres pendientes. «Elementos de inyección y del sistema» reúne componentes y variantes (émbolos, válvulas, alimentación, filtros, inyectores y toberas), no un octavo sistema ni una cantidad cerrada de modelos.

Validación: `tests/inyeccion-browser.cjs` recorre los cuatro modelos y verifica específicamente descenso del émbolo, ascenso de la varilla, inversión del balancín, ausencia de bomba/tubos exteriores de alta presión en GM, visualización del paso interno, despiece, aislamiento, recursos, móvil y regreso entre modelos sin acumulación de geometrías.

## Audio y alcance de evaluación de láminas de Frío

La corrección de una lámina recibe únicamente la respuesta actual, su imagen fuente y su contrato; el historial y las omisiones de otros turnos no amplían lo exigible. Las láminas elegidas siguen pendientes hasta mostrarse por separado. La cobertura de Frío usa un objeto con claves obligatorias por punto, acepta puntos missing y notas cero, y repara una vez el formato inválido sin repetir la grabación. Si también falla la reparación, no se guarda una nota inventada ni se reenvía indefinidamente desde el cliente. Se mantiene la exigencia de Simulacro/HDP. Validación con inferencia simulada: `node tests/frio-audio-coverage.cjs`, `node tests/frio-slides.cjs`, `node tests/professor-retry.cjs` y `node tests/hdp-coverage-api.cjs`.

## Siete configuraciones principales de inyección

Se incorporan tres modelos: `#monobomba` (radial CAV, N9 diapositiva 35 y N6 10–11), `#colector` (conducto común con limitadora, N9 20–22) y `#acumulador` (presión regulada, N9 23–24). Las diapositivas se revisaron visualmente y están accesibles junto a cada modelo. Todos conservan nombres, funciones, giro, vista interior, despiece, aislamiento y animación por fases.

La CAV separa carcasa, transferencia, dosificación, anillo fijo, rotor, émbolos opuestos, cabeza de salida y regulación. Su movimiento es una explicación por fases, no una simulación del perfil real de levas. El colector y sus ramas conservan representación de presión entre inyecciones. La limitadora muestra una apertura ilustrativa, explícitamente no periódica en servicio. El acumulador dispone de válvulas individuales antes de los pulverizadores y no representa una vejiga de gas. Depósito, filtrado y retornos auxiliares se identifican como contexto simplificado.

Estado actual: **7 configuraciones principales disponibles**, incluidos los cinco sistemas de la lista original. El inventario anterior describe el estado previo. Variantes no modeladas: elemento axial Bosch (36), inyector-bomba Cummins (62) y mecanismos específicos de regulación/despieces de componentes; no se consideran sistemas principales adicionales en este conteo.

Verificación ampliada: `tests/inyeccion-browser.cjs` recorre los siete modelos, comprueba émbolos opuestos CAV, ausencia de distribuidor separado, ramas presurizadas entre entregas, válvulas selectivas, despiece sin tuberías ni pulverización, pausa, aislamiento, fuentes, recursos WebGL, geometrías y ancho móvil. Las pruebas del modelo son didácticas y de interfaz, no validan un diseño de fabricación.

## Comparación visible y motor acoplado

El visor de inyección muestra la diapositiva original junto al 3D, con selector al lado/debajo/oculta y ampliación en diálogo. En pantallas estrechas se dispone debajo automáticamente. La referencia cambia con cualquiera de los siete sistemas; el bloque de fuentes y alcance permanece disponible.

«Mostrar motor acoplado» añade 19 conjuntos seleccionables: block, camisas, culata perforada para los inyectores, junta, pistones con cavidad, aros, bielas/bulones, cigüeñal, bancada/cojinetes, cárter, volante, válvulas, balancines, varillas, botadores, árbol de levas, escape, admisión y tapa. Se usan cuatro ejes coincidentes con las boquillas del sistema seleccionado, o un cilindro para GM. Las coronas quedan por debajo de las boquillas y el plano inferior de culata por encima. El volumen del motor es contextual, estático y sin escala: no se sincroniza con la animación de inyección ni reproduce un motor naval específico. La distribución lateral con varillas es genérica. Interior, selección, aislamiento, acercamiento y despiece funcionan también para las piezas añadidas. La animación permanece apagada al entrar y se conserva la optimización de no redibujar en reposo.

Validación: recorrido de los siete modelos en `tests/inyeccion-browser.cjs`, imagen y modal por sistema, posición de comparación, activación del motor, ejes/alturas de montaje, aislamiento de pistones, despiece, ocultación del motor, ancho móvil y regresión de controles de inyección. Inspección visual del conjunto y el GM, armado y desarmado. Estas comprobaciones verifican la representación didáctica, no tolerancias constructivas.

## RHDP y Estudiar examen

RHDP usa el banco completo y la cobertura de HDP en todas las materias. Cada aspecto parcial/ausente o error técnico adicional independiente descuenta exactamente 2 puntos desde 10, con piso 0. El servidor exige evidencia literal del alumno y una fuente válida para errores adicionales; no duplica el mismo aspecto. La revisión usa la misma regla. Definiciones casi exactas al material, sin castigar cambios cosméticos ni exigir errores de OCR.

Estudiar examen aparece antes de Práctica acompañada. El profesor plantea y responde sin registrar intentos, notas ni progreso. Usa respuestas desarrolladas del banco y genera una resolución contextual para láminas que sólo tienen material de referencia. Muestra recortes originales con correspondencia verificada o la diapositiva seleccionada; si no hay figura original verificada, lo informa y enlaza el material, sin sustituirlo por un dibujo generado. Permite escuchar, avanzar, finalizar y exportar.

Verificación: `node tests/rhdp-study.cjs` y pruebas existentes del oral. Gemini simulado.

Las láminas de Estudiar examen muestran cada elemento y su función por escrito, antes de la figura. Las diapositivas con resolución generada exigen una respuesta por cada punto y una lista de funciones y conexiones; se intenta reparar una salida incompleta y se conserva la pregunta si no se logra. La voz y la exportación incluyen el desarrollo completo. Verificación: node tests/study-functions.cjs (Gemini simulado).
