# Cuaderno naval · Finales 2026

Aplicación de estudio para Máquinas térmicas, Sistemas de frío, Motores navales, Electrotecnia, Electrónica y Economía naviera.

**Sitio:** https://finalesmaq2026.vercel.app

## Funciones

- Repaso guiado: 50 lecciones con voz del navegador, mapas conceptuales, ejemplos, esquemas, listas y práctica por tema.
- Profesor oral con Gemini: texto o audio, niveles de profundidad, velocidades, modo bucle, ayudas y devolución final.
- Continuación sin Gemini: preguntas precargadas al iniciar, guardado local de respuestas y adjuntos, revisión por pregunta con referencia preparada y «Consultar resolución» al recuperar el servicio. Las consultas no generan calificaciones ni modifican progreso.
- «Consultar resolución», «Preguntar al profesor» y «Revisar nota seleccionada» reintentan sin límite de intentos hasta recibir respuesta. El mismo botón permite detener la petición o la espera; cambiar de materia, cuenta o salir del oral cancela los reintentos. El intervalo aumenta hasta 30 segundos y respeta las pausas que indique el servidor. Las revisiones ya guardadas se recuperan al reintentar con el mismo identificador.
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

Simulacro y HDP incorporan 90 consignas (dos enfoques para 45 títulos), con páginas verificadas del PDF de Fernandez Hanna Jorge Gabriel. Se mezclan con el banco existente dentro de la unidad elegida. Práctica acompañada conserva su banco. Cada tema define dos criterios básicos, tres en Simulacro (+50 %) y cuatro en HDP (+100 %); los porcentajes describen cantidad de criterios, no una medición objetiva de dificultad. La velocidad modifica la devolución, no elimina criterios del nuevo banco. Las referencias revisadas aclaran contradicciones del apunte y no convierten valores o maniobras históricas en procedimientos universales.

Verificación: `node tests/thermal-pdf.cjs`.
