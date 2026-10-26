# Taller de frío · Robbio

Primera entrega: cinco temas, veinte pasos de explicación, diez preguntas de autoevaluación sin nota, ocho fotografías originales con puntos seleccionables y un esquema conceptual del ciclo.

La carpeta de clase consultada contiene 26 imágenes y 2 videos: https://drive.google.com/drive/folders/1xbJcXy_Acie0QDupMwCcDH4f2MaoBDRG . Se incorporaron las tres imágenes añadidas al final de la revisión (WA0122, WA0123 y WA0139). Los videos se enlazan desde la carpeta, pero no sustentan identificaciones ni procedimientos en esta entrega.

## Fuentes y límites

- Lijó, Manual de Refrigeración: https://drive.google.com/file/d/1Pp6UUwjHF843jgCtpaJRGNaolx8WzDrU/view . Compresores herméticos, sección 3.2 (PDF 59–61); capilar (PDF 141); VET y bulbo (PDF 143–152); ciclos, condensadores, evaporadores y operaciones en sus capítulos respectivos. Las páginas indicadas en pantalla son del PDF, no la numeración impresa.
- Documentación de válvulas de expansión: https://drive.google.com/file/d/11eOLh2icIEO5PJqTYEw190kcCodlGkOl/view .
- Danfoss Maneurop NTZ: https://drive.google.com/file/d/1Pq9cDXiYLA5aMU4nFHYO25kOWttHjOnP/view . Se identifica como documentación de esa familia, no como ficha del Toshiba fotografiado.
- Danfoss, notas de instalación de VET: https://assets.danfoss.com/documents/latest/50825/AX266348279899en-000101.pdf .

Las fotos no permiten confirmar toda la tubería, el cableado, el refrigerante ni la lógica de control. Los recipientes auxiliares, la inversora y algunos controles están señalados como identificaciones pendientes o compatibles visualmente. Las anotaciones de números del tablero no se convierten en una secuencia de arranque. La ubicación real del bulbo no está confirmada. El diagrama dibujado es conceptual, no un plano del equipo.

## Integración

`frio-workshop-data.js` contiene las fuentes, pasos, fotos y coordenadas. `frio-workshop.js` presenta el módulo dentro de `taller-control-frio`. El taller conserva `underConstruction` para no habilitar exámenes automáticos sin banco propio. Las otras tres páginas de taller permanecen en preparación. `frio` sigue siendo la materia teórica de Dambrossi.

## Validación

- Sintaxis Node y build estático correctos.
- Integridad: cinco temas, cuatro pasos por tema, diez preguntas, ocho fotos únicas existentes; todas referenciadas y con coordenadas dentro de la foto.
- Navegador: cambio de los cinco temas, selector de fotos, selección de punto del tablero, cambio de etapa del ciclo y apertura de respuesta orientativa.
- Cambio a Sistemas de frío conserva Dambrossi; Taller: Motores conserva su página en construcción. Sin errores de consola durante estas acciones.
