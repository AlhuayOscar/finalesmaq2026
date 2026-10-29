# Circuito naval de agua y vapor

Página `dist/circuito-vapor.html`, enlazada desde el Taller 3D y la navegación de Máquinas Térmicas. No requiere cuenta, IA ni dependencias externas nuevas.

Reutiliza las caras y coordenadas de la caldera tipo D de `buildBoilerGeometry`. La planta añade 29 conjuntos seleccionables en total: toma, válvula, filtro y bomba de mar; condensador y descarga; pozo, extracción, acondicionamiento, desaireador, tanque, alimentación, regulación, aislamiento, retención, economizador, colectores, descendentes, hervidores, separadores, dos etapas de sobrecalentador, atemperador, válvula principal, turbina, reposición, hogar y precalentador de aire.

El grafo dirigido se define en `circuito-vapor-data.js`. El condensador posee puertos diferenciados para tubos y carcasa. Ninguna arista de mar alcanza la alimentación. El agua separada recircula al colector; el vapor sigue hacia las dos etapas. La extracción de turbina al desaireador es un ejemplo auxiliar. La reposición entra ya como agua dulce tratada; la planta de producción y acondicionamiento previa no se dibuja.

El sobrecalentador de dos etapas es una ampliación didáctica, no una reproducción literal del modelo D del apunte. El atemperador elegido es de superficie y se muestra ampliado con una línea discontinua que lo sitúa en el agua del colector. No se reutiliza el desobrecalentador auxiliar existente como si tuviera la misma función.

El visor proyecta superficies tridimensionales, permite rotación con puntero o teclado, zoom, selección, vista frontal, números e interior del domo. Conserva una imagen base hasta cambiar la cámara o selección y anima flechas por distancia recorrida. Inicia pausado. Los recorridos son esquemáticos y su velocidad no representa caudal, presión ni temperatura.

Validación: `node tests/steam-circuit.cjs`, `node tests/boiler-models.cjs`, `node tests/boiler-practice.cjs`; revisión en navegador de filtros, búsqueda, reproducción/pausa y cierre del recorrido agua-vapor.

Navegación de cámara: doble clic en nombre o pieza centra y encuadra el equipo, excluyendo tuberías de conexión. Shift + arrastre, botón central/derecho o modo Desplazar mueven la vista; también Shift + flechas. La rueda acerca hacia el cursor. Enter enfoca la selección; Escape y Ver circuito completo restablecen la cámara. Se conserva la rotación al enfocar. Las etiquetas fuera de pantalla se ocultan. Validación adicional: node tests/steam-camera.cjs y pruebas de doble clic en lista y turbina en navegador.

El precalentador de aire (pieza 29, bloque gris sobre el economizador) tiene identidad y enfoque propios; no pertenece a Hogar y quemadores. El inspector distingue el aire calentado del agua del economizador.
