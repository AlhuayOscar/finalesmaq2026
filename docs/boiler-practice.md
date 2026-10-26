# Práctica de identificación 3D

Entrada: Taller 3D → Practicar, o botón Practicar en los pasos visuales de las unidades 2–6 de Máquinas Térmicas. Las lecciones A, M y D preseleccionan su modelo.

Sesiones locales de seis desafíos, sin repetir un desafío dentro de la sesión. Hay identificación por función, por número y ocho casos de fallas con mantenimiento. El modo combinado intercala las tres variantes. Los casos incompatibles con la geometría simple se excluyen. No usa el servidor de IA ni escribe calificaciones de examen.

La identificación requiere una pieza. En fallas se comprueban cinco dimensiones: zonas solicitadas, síntomas, causa, efecto y mantenimiento. Cada dimensión vale 20%. La ubicación se puntúa como `max(0, (aciertos - extras) / zonas esperadas)`; las respuestas omitidas valen cero. La corrección enumera faltantes, sobrantes y las explicaciones correctas. Las alternativas pertenecen a otros grupos de fallas para evitar confundir causas compatibles del mismo problema. No evalúa redacción libre ni reemplaza el examen oral.

Los casos de tratamiento y mantenimiento se vinculan a Bobbio I/II. La cavitación utiliza una referencia externa identificada de TLV. El ejemplo de fosfato e hidróxido corresponde al tratamiento interno descrito por Bobbio II (PDF 63–64): no se presenta como una receta de eliminación de incrustaciones ni prescribe dosis. No se incorporan maniobras universales de intervención.

Al entrar se conservan modelo, capas, avería, montaje, vista y ruta. Salir restablece ese estado; desde la guía se vuelve a la lección y sección guardadas. La narración se detiene al entrar.

La geometría es propia y procedural: cabezas curvas de colectores, codos redondeados, bridas y volantes, cuerpos cilíndricos de filtros/calentadores, motor/base de bombas, registros con aletas y llama fusiforme. Las disposiciones de caldera siguen el apunte. Las formas genéricas de bombas y accesorios se contrastan con KSB y Spirax Sarco, enlazados en el taller. No se incluyen modelos externos descargados ni se afirma reproducir un fabricante.

Verificación desde la raíz:

```sh
node tests/boiler-practice.cjs
node tests/boiler-models.cjs
node tests/thermal-guide.cjs
node tests/guided.cjs
```

Construcción: `node build-static.cjs` desde `dist/`. Prueba visual: entrar en los tres modos, corregir una omisión y una pieza extra, terminar una sesión, salir desde la guía y verificar el regreso a la misma sección. Las pruebas de geometría cubren las combinaciones de capas, despiece y fallas existentes.
