# Taller de carga de split

Entrada: `dist/carga-split.html`; enlace desde Taller: Sistemas de control y Frío. Módulos ES con Three.js y OrbitControls ya alojados en el sitio, sin CDN adicional.

Referencia: Toshiba SVM-12071, RAS-18N3KV-E / RAS-18N3AV-E, R410A. Se verificaron visualmente páginas impresas 12 y 19 y se extrajo el texto de 12, 13, 19 y 20. Caso de 5 m, carga total de 1,40 kg; expansión electrónica en unidad exterior, acumulador antes del compresor, inversora fija en frío. Es una representación conceptual, no CAD del fabricante.

La recarga completa parte de un equipo aún operativo, tras diagnóstico y pérdida confirmada. Incluye aislamiento, recuperación, reparación, ensayo con nitrógeno, evacuación de todo el circuito, comprobación, preparación del conjunto de carga, carga inicial parada, preparación de arranque, rama condicional para completar en frío, cierre del aporte, pruebas, retirada del instrumental, tapas, servicio final y parada normal. No aplica a instalación nueva con carga retenida. No se inventan presiones, vacío objetivo, pares ni tiempos de trabajo. El plazo de 18 segundos por paso es sólo narrativo.

La figura 3-4-1 del manual respalda un único puerto de servicio en gas. Alta del manifold permanece cerrada y sin conexión. Se diferencia extracción líquida del cilindro con sifón de admisión de vapor al compresor. Recuperadora y bomba son dispositivos externos; el compresor nunca trabaja en vacío. Las partículas invierten su dirección en la manguera azul entre entrada y extracción.

Geometría: carcasa transparente, motor/eje/rodillo simplificados, tubo interno de acumulador y aceite en fondo, PMV, baterías, ventilador exterior y rodete interior, conexiones, manifold, cilindros, regulador, balanza, máquina de servicio, vacuómetro y tapas. Los indicadores carecen intencionalmente de cifras de presión ficticias. Las masas intermedias no se inventan.

Fuentes enlazadas en la página: manual Toshiba (copia técnica), Parker Sporlan, Copeland, guía complementaria Daikin (sin trasladar valores al Toshiba).

Validación: `node tests/split-charge.cjs`; sintaxis ESM con `node --input-type=module --check` por stdin; build `node build-static.cjs` desde dist. Navegador: render WebGL, vistas interiores, recuperación, carga parada, vacío; sin errores de consola; ancho móvil de 390 px sin desbordamiento. No es una validación de intervención sobre equipo real.
