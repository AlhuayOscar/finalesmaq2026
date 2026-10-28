const { wrapSVG, isAct, strokeCol, fillCol, strokeW, glow } = require('./svg-helpers.cjs');

// ==================== PROCESS LOOP DIAGRAMS ====================
// Used for rankine, oil, thermal, fuel, feed
function drawProcessLoop(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;
  const id = m.id;

  let stations = [];
  let pipes = [];
  let legendBadges = '';

  if (id === 'rankine') {
    stations = [
      { key: 'boiler', x: 560, y: 110, w: 320, h: 140, title: 'CALDERA NAVAL (GENERADOR)', desc: 'Combustión aporta calor Qin\nAgua líquida -> Vapor sobrecalentado\nAlta presión y alta temperatura', color: '#e11d48' },
      { key: 'turbine', x: 560, y: 350, w: 320, h: 140, title: 'TURBINA DE VAPOR', desc: 'Expansión de vapor en toberas y álabes\nEntrega trabajo útil Wneto al eje\nCaída de entalpía y presión', color: '#059669' },
      { key: 'condenser', x: 100, y: 350, w: 320, h: 140, title: 'CONDENSADOR DE SUPERFICIE', desc: 'Rechaza calor Qout al agua de mar\nVapor de escape condensa a líquido\nMantiene vacío de condensación', color: '#0284c7' },
      { key: 'pump', x: 100, y: 110, w: 320, h: 140, title: 'BOMBA DE ALIMENTACIÓN', desc: 'Consume trabajo Wb de accionamiento\nEleva presión del líquido sobrecaldera\nAlimenta el domo continuamente', color: '#d97706' },
    ];
    pipes = [
      { from: [260, 110], to: [560, 110], color: '#0284c7', label: 'Agua líquida a alta presión', arrow: 'arrowBlue' },
      { from: [720, 250], to: [720, 350], color: '#e11d48', label: 'Vapor vivo sobrecalentado', arrow: 'arrowRed' },
      { from: [560, 420], to: [420, 420], color: '#9f1239', label: 'Vapor húmedo de escape', arrow: 'arrowRed' },
      { from: [260, 350], to: [260, 250], color: '#0284c7', label: 'Condensado líquido (baja presión)', arrow: 'arrowBlue' },
    ];
    legendBadges = `
      <circle cx="20" cy="17" r="5" fill="#e11d48"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Aporte de calor (Qin)</text>
      <circle cx="200" cy="17" r="5" fill="#059669"/><text x="212" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Trabajo al eje (Wt)</text>
      <circle cx="360" cy="17" r="5" fill="#0284c7"/><text x="372" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Rechazo de calor (Qout)</text>
      <circle cx="560" cy="17" r="5" fill="#d97706"/><text x="572" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco activo del paso</text>
    `;
  } else if (id === 'oil' || id === 'aceite' || id === 'aceite-contaminado') {
    stations = [
      { key: 'tank', x: 100, y: 110, w: 320, h: 140, title: 'TANQUE SUMIDERO / CÁRTER', desc: 'Reserva de aceite en doble fondo\nBombas de servicio (presión y caudal)\nMonitoreo de nivel y sedimentación', color: '#d97706' },
      { key: 'condition', x: 560, y: 110, w: 320, h: 140, title: 'FILTROS DÚPLEX Y ENFRIADOR', desc: 'Filtrado fino de partículas sólidas\nControl de viscosidad y temperatura\nSeparación de impurezas', color: '#0284c7' },
      { key: 'bearings', x: 560, y: 350, w: 320, h: 140, title: 'COJINETES RADIALES Y EMPUJE', desc: 'Lubricación hidrodinámica (cuña de aceite)\nRefrigeración de metales de fricción\nEvita contacto metal-metal', color: '#059669' },
      { key: 'return', x: 100, y: 350, w: 320, h: 140, title: 'LÍNEAS DE RETORNO POR GRAVEDAD', desc: 'Drenaje libre hacia el sumidero\nVisores de flujo y termómetros\nRetorno de cárter sin contrapresión', color: '#b45309' },
    ];
    pipes = [
      { from: [420, 180], to: [560, 180], color: '#d97706', label: 'Aceite presurizado hacia acondicionamiento', arrow: 'arrowOrange' },
      { from: [720, 250], to: [720, 350], color: '#0284c7', label: 'Aceite limpio y refrigerado', arrow: 'arrowBlue' },
      { from: [560, 420], to: [420, 420], color: '#b45309', label: 'Retorno por gravedad desde cojinetes', arrow: 'arrowOrange' },
      { from: [260, 350], to: [260, 250], color: '#d97706', label: 'Ingreso al sumidero / desaireación', arrow: 'arrowOrange' },
    ];
    legendBadges = `
      <circle cx="20" cy="17" r="5" fill="#d97706"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Aceite a presión / Succión</text>
      <circle cx="210" cy="17" r="5" fill="#0284c7"/><text x="222" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Filtrado y enfriado</text>
      <circle cx="390" cy="17" r="5" fill="#059669"/><text x="402" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Puntos lubricados</text>
      <circle cx="560" cy="17" r="5" fill="#d97706"/><text x="572" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Componente activo</text>
    `;
  } else if (id === 'thermal' || id === 'fluido-termico') {
    stations = [
      { key: 'pump', x: 100, y: 110, w: 320, h: 140, title: 'BOMBA DE CIRCULACIÓN', desc: 'Impulso continuo del fluido térmico\nMantiene velocidad para evitar degradación\nCaudal constante sin evaporación', color: '#0284c7' },
      { key: 'heater', x: 560, y: 110, w: 320, h: 140, title: 'CALENTADOR / CALDERA TÉRMICA', desc: 'Aporte de calor por combustión o escape\nCalentamiento en fase líquida\nSin presiones elevadas de vapor', color: '#e11d48' },
      { key: 'consumer', x: 560, y: 350, w: 320, h: 140, title: 'CONSUMIDORES DE CALOR NAVALES', desc: 'Calefacción de tanques de combustible\nEvaporadores y servicios de acomodación\nEntrega de calor sensible', color: '#059669' },
      { key: 'expansion', x: 100, y: 350, w: 320, h: 140, title: 'TANQUE DE EXPANSIÓN', desc: 'Absorbe dilatación térmica del fluido\nColchón de nitrógeno o sello frío\nConectado a la aspiración de la bomba', color: '#d97706' },
    ];
    pipes = [
      { from: [420, 180], to: [560, 180], color: '#0284c7', label: 'Fluido térmico hacia calentador', arrow: 'arrowBlue' },
      { from: [720, 250], to: [720, 350], color: '#e11d48', label: 'Fluido caliente hacia servicios', arrow: 'arrowRed' },
      { from: [560, 420], to: [420, 420], color: '#059669', label: 'Retorno desde consumidores', arrow: 'arrowGreen' },
      { from: [260, 350], to: [260, 250], color: '#d97706', label: 'Presión estática y desgasificado', arrow: 'arrowOrange' },
    ];
    legendBadges = `
      <circle cx="20" cy="17" r="5" fill="#e11d48"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Fluido caliente (impulso)</text>
      <circle cx="210" cy="17" r="5" fill="#059669"/><text x="222" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Retorno enfriado</text>
      <circle cx="380" cy="17" r="5" fill="#d97706"/><text x="392" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Tanque de expansión</text>
      <circle cx="560" cy="17" r="5" fill="#d97706"/><text x="572" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Paso activo</text>
    `;
  } else if (id === 'fuel' || id === 'combustible') {
    stations = [
      { key: 'tank', x: 100, y: 110, w: 320, h: 140, title: 'ALMACENAMIENTO Y SERVICIO', desc: 'Tanque de sedimentación y servicio diario\nDecantación de agua y lodos\nTemperatura de bombeo inicial', color: '#d97706' },
      { key: 'heater', x: 560, y: 110, w: 320, h: 140, title: 'BOMBA Y CALENTADOR DE FO', desc: 'Bomba de presurización de circuito\nCalentador de vapor para viscosidad\nControl de viscosímetro automático', color: '#e11d48' },
      { key: 'filter', x: 560, y: 350, w: 320, h: 140, title: 'FILTROS FINOS Y DESGASIFICADOR', desc: 'Retención de partículas abrasivas\nDesaireación y cámara de mezcla\nVálvula reguladora de contrapresión', color: '#0284c7' },
      { key: 'nozzle', x: 100, y: 350, w: 320, h: 140, title: 'PULVERIZADOR / QUEMADOR', desc: 'Atomización mecánica o por vapor\nFormación de niebla de microgotas\nCombustión en el hogar sin retorno', color: '#ea580c' },
    ];
    pipes = [
      { from: [420, 180], to: [560, 180], color: '#d97706', label: 'Fuel oil hacia calentamiento', arrow: 'arrowOrange' },
      { from: [720, 250], to: [720, 350], color: '#e11d48', label: 'Combustible caliente a baja viscosidad', arrow: 'arrowRed' },
      { from: [560, 420], to: [420, 420], color: '#0284c7', label: 'Alimentación presurizada a quemador', arrow: 'arrowBlue' },
      { from: [260, 350], to: [260, 250], color: '#ea580c', label: 'Retorno recirculación de servicio', arrow: 'arrowOrange' },
    ];
    legendBadges = `
      <circle cx="20" cy="17" r="5" fill="#d97706"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Almacenamiento</text>
      <circle cx="170" cy="17" r="5" fill="#e11d48"/><text x="182" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Calentamiento</text>
      <circle cx="310" cy="17" r="5" fill="#0284c7"/><text x="322" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Filtrado fino</text>
      <circle cx="430" cy="17" r="5" fill="#ea580c"/><text x="442" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Pulverizador</text>
      <circle cx="560" cy="17" r="5" fill="#d97706"/><text x="572" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Componente activo</text>
    `;
  } else {
    // feed / alimentacion
    stations = [
      { key: 'condenser', x: 100, y: 110, w: 320, h: 140, title: 'CONDENSADOR Y POZO CALIENTE', desc: 'Recolección del condensado líquido\nHotwell con reserva de aspiración\nSeparación de fases bajo vacío', color: '#0284c7' },
      { key: 'condensate', x: 560, y: 110, w: 320, h: 140, title: 'EXTRACCIÓN Y CALENTADORES BP', desc: 'Bomba de extracción de condensado\nEnfriador de eyectores de aire\nCalentador de baja presión', color: '#0284c7' },
      { key: 'feedPump', x: 560, y: 350, w: 320, h: 140, title: 'DESAIREADOR Y BOMBA ALIMENTACIÓN', desc: 'Eliminación de O2 y CO2 por vapor\nReserva de agua caliente elevada\nBomba multietapa vence presión caldera', color: '#059669' },
      { key: 'boiler', x: 100, y: 350, w: 320, h: 140, title: 'CALDERA Y ECONOMIZADOR', desc: 'Economizador aprovecha calor de gases\nVálvulas de retención y corte (SDNR)\nIngreso al domo de la caldera', color: '#e11d48' },
    ];
    pipes = [
      { from: [420, 180], to: [560, 180], color: '#0284c7', label: 'Condensado hacia calentamiento', arrow: 'arrowBlue' },
      { from: [720, 250], to: [720, 350], color: '#0284c7', label: 'Agua hacia desaireador térmico', arrow: 'arrowBlue' },
      { from: [560, 420], to: [420, 420], color: '#059669', label: 'Agua desaireada a alta presión', arrow: 'arrowGreen' },
      { from: [260, 350], to: [260, 250], color: '#e11d48', label: 'Vapor producido retorna al ciclo', arrow: 'arrowRed' },
    ];
    legendBadges = `
      <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Condensado (BP)</text>
      <circle cx="180" cy="17" r="5" fill="#059669"/><text x="192" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Agua de alimentación (AP)</text>
      <circle cx="390" cy="17" r="5" fill="#e11d48"/><text x="402" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Vapor / Caldera</text>
      <circle cx="560" cy="17" r="5" fill="#d97706"/><text x="572" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco activo</text>
    `;
  }

  const content = `
    <!-- Connecting pipes -->
    <g stroke-linecap="round">
      ${pipes.map(p => `
        <line x1="${p.from[0]}" y1="${p.from[1]}" x2="${p.to[0]}" y2="${p.to[1]}" stroke="${p.color}" stroke-width="4.5" marker-end="url(#${p.arrow})"/>
        <rect x="${(p.from[0]+p.to[0])/2 - 75}" y="${(p.from[1]+p.to[1])/2 - 12}" width="150" height="22" rx="4" fill="#ffffff" stroke="${p.color}" stroke-width="1" filter="url(#cardShadow)"/>
        <text x="${(p.from[0]+p.to[0])/2}" y="${(p.from[1]+p.to[1])/2 + 3}" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="600" fill="#1e293b">${escapeXML(p.label)}</text>
      `).join('')}
    </g>

    <!-- Stations Cards -->
    ${stations.map(s => {
      const active = isAct(focus, s.key);
      const lines = s.desc.split('\n');
      return `
      <g id="station-${s.key}" ${glow(focus, s.key)}>
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="${s.h}" rx="14" fill="${active ? 'url(#activeGrad)' : 'url(#steelGrad)'}" stroke="${active ? '#d97706' : s.color}" stroke-width="${active ? 3.5 : 2}" filter="url(#cardShadow)"/>
        <!-- Header bar -->
        <rect x="${s.x}" y="${s.y}" width="${s.w}" height="36" rx="14" fill="${s.color}"/>
        <rect x="${s.x}" y="${s.y+20}" width="${s.w}" height="16" fill="${s.color}"/>
        <text x="${s.x + s.w/2}" y="${s.y + 23}" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#ffffff">${escapeXML(s.title)}</text>
        ${lines.map((l, i) => `
          <text x="${s.x + 20}" y="${s.y + 60 + i*20}" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="${i===0?'600':'400'}" fill="#1e293b">• ${escapeXML(l)}</text>
        `).join('')}
      </g>
      `;
    }).join('')}
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend: legendBadges,
    content
  });
}

function escapeXML(str) {
  return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

module.exports = {
  drawProcessLoop
};
