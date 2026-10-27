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

## Segunda ampliación · lote de 90 archivos nuevos

Inventario paginado por imágenes (sin el límite de 100 hijos de la lectura simple de carpeta): 116 imágenes totales, 90 IDs nuevos respecto de las 26 anteriores. Las 90 se descargaron y revisaron visualmente en hojas de contacto; las 25 elegidas para explicación se inspeccionaron individualmente. No hay duplicados binarios dentro del lote nuevo; una imagen del tablero es idéntica por SHA-256 a la ya incorporada. Se marca en el índice y no se vuelve a publicar como foto comentada.

Resultado acumulado: 10 temas, 40 pasos, 20 preguntas sin nota y 33 fotos comentadas. Los 25 originales nuevos se preservan sin edición en `assets/frio-robbio`. Las vistas restantes se enlazan en un índice agrupado de 90 archivos en Drive; no se presentan como 90 lecciones diferentes. Incluye galería filtrada por tema y diálogo para ampliar fotos y leer pizarrones.

Nuevos temas: inversión frío/calor y check; arranque y mediciones; estados y diagrama p–h; Peltier; absorción por difusión. Los temas previos reciben fotos de despiece, solenoide, placa, manifold, bomba de vacío y cámara completa.

Precisiones de lectura: no llamar vapor seco a toda salida de expansión; el tramo inferior horizontal del p–h representa evaporación; distinguir Peltier de Seebeck; no confundir presión de diseño de placa con presión de trabajo; la caja R-410A de una foto no prueba el contenido del equipo. Las lecturas 3,4 Ω y 2,4 Ω no identifican todos los pares de bornes ni validan el aislamiento. La alimentación trifásica del esquema no se traslada al hermético monofásico.

Fuentes adicionales:

- Lijó, secciones 3.2.5 y 3.2.5.2, PDF 62–64: circuitos de arranque y componentes eléctricos.
- Secop, diseño mecánico y eléctrico: https://www.secop.com/fileadmin/user_upload/technical-literature/danfoss-lectures/compressor_design_mechanical_and_electrical.pdf .
- Ferrotec, tecnología termoeléctrica: https://thermal.ferrotec.com/technology/ y https://ferrotec.com.sg/product/thermo/technical_reference_guide/1/ .
- Dometic, absorción: https://support.dometic.com/en/cf-coolers/Cooling-technologies-explained-4910 y https://media.dometic.com/externalassets/dometic-rm-2350-_9600029484_81557.pdf .

Validación de la ampliación: sintaxis y build; integridad de los 10 temas/33 fotos/90 referencias, correspondencia de las 25 selecciones con el índice, todas las fotos existentes y referenciadas, coordenadas válidas. En navegador: cinco temas nuevos, diálogo y cierre con Escape, filtro de galería, selección de una foto desde otro tema, 90 enlaces presentes, sin desbordamiento horizontal de escritorio y sin errores de consola. El ciclo de compresión se oculta en Peltier y absorción para no atribuírselo a esos sistemas.
