const { wrapSVG, isAct, strokeCol, fillCol, strokeW, glow, escapeXML, renderTextLines } = require('./svg-helpers.cjs');

// ==================== 1. STATES (ESTADOS) ====================
function drawStates(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Líquido subenfriado</text>
    <circle cx="190" cy="17" r="5" fill="#ea580c"/><text x="202" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Mezcla bifásica (Tsat const.)</text>
    <circle cx="410" cy="17" r="5" fill="#e11d48"/><text x="422" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Vapor sobrecalentado</text>
    <circle cx="600" cy="17" r="5" fill="#d97706"/><text x="612" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco activo</text>
  `;

  const cards = [
    { key: 'liquid', x: 60, y: 110, w: 260, h: 160, title: '1. LÍQUIDO SUBENFRIADO', p1: 'T < Tsat a la presión de trabajo', p2: 'Calor sensible: eleva temperatura', p3: 'Sin presencia de vapor', col: '#0284c7' },
    { key: 'wet', x: 370, y: 110, w: 260, h: 160, title: '2. MEZCLA SATURADA', p1: 'T = Tsat (equilibrio líquido-vapor)', p2: 'Calor latente de vaporización', p3: 'Título 0 ≤ x ≤ 1 (fracción vapor)', col: '#ea580c' },
    { key: 'superheat', x: 680, y: 110, w: 260, h: 160, title: '3. VAPOR SOBRECALENTADO', p1: 'T > Tsat a la presión del sistema', p2: 'Vapor seco + calor añadido', p3: 'Grado sobrecalentamiento = T - Tsat', col: '#e11d48' },
  ];

  const content = `
    <!-- Top 3 Phase Cards -->
    ${cards.map(c => `
      <g id="card-${c.key}" ${glow(focus, c.key)}>
        <rect x="${c.x}" y="${c.y}" width="${c.w}" height="${c.h}" rx="12" fill="${isAct(focus, c.key) ? 'url(#activeGrad)' : '#ffffff'}" stroke="${isAct(focus, c.key) ? '#d97706' : c.col}" stroke-width="${isAct(focus, c.key) ? 3.5 : 2}" filter="url(#cardShadow)"/>
        <rect x="${c.x}" y="${c.y}" width="${c.w}" height="32" rx="12" fill="${c.col}"/>
        <rect x="${c.x}" y="${c.y+18}" width="${c.w}" height="14" fill="${c.col}"/>
        <text x="${c.x + c.w/2}" y="${c.y + 21}" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff">${escapeXML(c.title)}</text>
        <text x="${c.x + 16}" y="${c.y + 60}" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">• ${escapeXML(c.p1)}</text>
        <text x="${c.x + 16}" y="${c.y + 88}" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• ${escapeXML(c.p2)}</text>
        <text x="${c.x + 16}" y="${c.y + 116}" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• ${escapeXML(c.p3)}</text>
      </g>
    `).join('')}

    <!-- Bottom Isobaric Curve Diagram (P = cte) -->
    <g id="diagram-pressure" ${glow(focus, 'pressure')} transform="translate(60, 300)">
      <rect width="880" height="230" rx="14" fill="${isAct(focus, 'pressure') ? 'url(#activeGrad)' : '#ffffff'}" stroke="${isAct(focus, 'pressure') ? '#d97706' : '#cbd5e1'}" stroke-width="${isAct(focus, 'pressure') ? 3 : 1.5}" filter="url(#cardShadow)"/>
      <text x="30" y="32" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#133e36">PROCESO DE CALENTAMIENTO A PRESIÓN CONSTANTE (ISOBÁRICO)</text>
      
      <!-- Graph Axes -->
      <line x1="60" y1="180" x2="800" y2="180" stroke="#64748b" stroke-width="2" marker-end="url(#arrowGray)"/>
      <line x1="60" y1="180" x2="60" y2="50" stroke="#64748b" stroke-width="2" marker-end="url(#arrowGray)"/>
      <text x="815" y="184" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#64748b">Entalpía h / Calor aportado Q</text>
      <text x="40" y="44" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#64748b">Temp. T</text>

      <!-- Curve -->
      <path d="M 80 160 L 250 100 L 580 100 L 760 60" fill="none" stroke="#e11d48" stroke-width="4"/>

      <!---->
      <circle cx="250" cy="100" r="5" fill="#0284c7"/>
      <text x="210" y="85" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0284c7">x = 0 (Líq. sat)</text>

      <circle cx="580" cy="100" r="5" fill="#e11d48"/>
      <text x="560" y="85" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#e11d48">x = 1 (Vap. sat. seco)</text>

      <line x1="60" y1="100" x2="250" y2="100" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 3"/>
      <text x="15" y="104" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#9a3412">Tsat</text>

      <text x="350" y="125" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#ea580c">Zona de evaporación (Tsat constante)</text>
      <text x="120" y="145" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#0284c7">Calor sensible</text>
      <text x="630" y="75" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#e11d48">Sobrecalentamiento ΔT</text>
      
      <!-- Formula badge -->
      <rect x="250" y="185" width="400" height="30" rx="6" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
      <text x="450" y="204" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#334155">P absoluta = P manométrica + P atmosférica  |  Tsat obtenida de tabla de vapor</text>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 2. TS & MOLLIER DIAGRAM (DIAGRAMAS) ====================
function drawTS(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Campana de saturación</text>
    <circle cx="210" cy="17" r="5" fill="#059669"/><text x="222" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Expansión isentrópica (ideal)</text>
    <circle cx="430" cy="17" r="5" fill="#ea580c"/><text x="442" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Expansión real (irreversibilidades)</text>
    <circle cx="680" cy="17" r="5" fill="#d97706"/><text x="692" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco activo</text>
  `;

  const content = `
  <g transform="translate(60, 90)">
    <g id="ts-axes" ${glow(focus, 'axes')}>
      <line x1="80" y1="440" x2="840" y2="440" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowGray)"/>
      <line x1="80" y1="440" x2="80" y2="40" stroke="#334155" stroke-width="2.5" marker-end="url(#arrowGray)"/>
      <text x="850" y="445" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#334155">Entropía específica s [kJ/kg·K]</text>
      <text x="40" y="35" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#334155">Temp. T [°C]</text>
    </g>

    <g id="ts-dome" ${glow(focus, 'dome')}>
      <path d="M 140 420 Q 220 220 380 110 T 680 420" fill="#eff6ff" stroke="${strokeCol(focus, 'dome', '#0284c7')}" stroke-width="${strokeW(focus, 'dome', 3.5, 5)}"/>
      <circle cx="380" cy="110" r="6" fill="#d97706" stroke="#ffffff" stroke-width="2"/>
      <text x="380" y="90" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#92400e">PUNTO CRÍTICO (374°C, 221 bar)</text>
      <text x="180" y="320" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#0284c7">Líquido saturado (x=0)</text>
      <text x="630" y="320" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#0284c7">Vapor sat. seco (x=1)</text>
      <text x="380" y="280" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" fill="#93c5fd">ZONA DE MEZCLA BIFÁSICA</text>
    </g>

    <path d="M 120 400 L 220 240 L 460 240 L 680 140" fill="none" stroke="#cbd5e1" stroke-width="2" stroke-dasharray="4 3"/>
    <text x="690" y="145" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="600" fill="#64748b">Pcaldera = cte</text>

    <g id="ts-expansion" ${glow(focus, 'expansion')}>
      <circle cx="620" cy="165" r="5" fill="#e11d48"/>
      <text x="630" y="160" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#e11d48">1: Entrada turbina</text>
      <line x1="620" y1="165" x2="620" y2="380" stroke="#059669" stroke-width="3.5" stroke-dasharray="6 4" marker-end="url(#arrowGreen)"/>
      <text x="545" y="270" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#059669">Expansión ideal (Δs=0)</text>
      <path d="M 620 165 Q 670 260 700 380" fill="none" stroke="#ea580c" stroke-width="4" marker-end="url(#arrowOrange)"/>
      <text x="710" y="270" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#ea580c">Expansión real (Δs &gt; 0)</text>
    </g>

    <g id="ts-outlet" ${glow(focus, 'outlet')}>
      <circle cx="700" cy="380" r="6" fill="${strokeCol(focus, 'outlet', '#ea580c')}"/>
      <rect x="650" y="395" width="180" height="38" rx="6" fill="#fff7ed" stroke="${strokeCol(focus, 'outlet', '#fed7aa')}" stroke-width="1.5" filter="url(#cardShadow)"/>
      <text x="660" y="411" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#9a3412">2r: ESCAPE REAL AL CONDENSADOR</text>
      <text x="660" y="424" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#c2410c">Humedad final x &gt; 0.88 para evitar erosión</text>
    </g>
  </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 3. COMPARISON (CLASIFICACION) ====================
function drawComparison(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Acuotubulares (agua por tubos)</text>
    <circle cx="260" cy="17" r="5" fill="#ea580c"/><text x="272" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Humotubulares (gases por tubos)</text>
    <circle cx="560" cy="17" r="5" fill="#d97706"/><text x="572" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Componente activo</text>
  `;

  const content = `
    <g id="card-waterTube" ${glow(focus, 'waterTube')} transform="translate(60, 100)">
      <rect width="400" height="280" rx="14" fill="${isAct(focus, 'waterTube') ? 'url(#activeGrad)' : '#ffffff'}" stroke="${isAct(focus, 'waterTube') ? '#d97706' : '#0284c7'}" stroke-width="${isAct(focus, 'waterTube') ? 3.5 : 2}" filter="url(#cardShadow)"/>
      <rect width="400" height="38" rx="14" fill="#0284c7"/>
      <rect y="20" width="400" height="18" fill="#0284c7"/>
      <text x="200" y="24" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">CALDERA ACUOTUBULAR (NAVAL TÍPICA)</text>
      
      <g transform="translate(40, 55)">
        <rect width="320" height="110" rx="8" fill="#fff7ed" stroke="#fdba74" stroke-width="1.5"/>
        <text x="160" y="22" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#c2410c">GASES CALIENTES POR FUERA (HOGAR)</text>
        ${[40, 90, 140, 190, 240, 280].map(x => `
          <circle cx="${x}" cy="65" r="16" fill="#e0f2fe" stroke="#0284c7" stroke-width="3"/>
          <circle cx="${x}" cy="65" r="8" fill="#0284c7"/>
        `).join('')}
        <text x="160" y="100" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0284c7">AGUA / VAPOR POR DENTRO DE LOS TUBOS</text>
      </g>
      <text x="30" y="195" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">• Presión: Altas presiones (&gt; 30 - 80 bar)</text>
      <text x="30" y="215" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• Respuesta: Rápida ante cambios de maniobra</text>
      <text x="30" y="235" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• Peso: Menor masa de agua contenida</text>
      <text x="30" y="255" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• Aplicación: Propulsión principal y alta carga</text>
    </g>

    <g id="card-fireTube" ${glow(focus, 'fireTube')} transform="translate(540, 100)">
      <rect width="400" height="280" rx="14" fill="${isAct(focus, 'fireTube') ? 'url(#activeGrad)' : '#ffffff'}" stroke="${isAct(focus, 'fireTube') ? '#d97706' : '#ea580c'}" stroke-width="${isAct(focus, 'fireTube') ? 3.5 : 2}" filter="url(#cardShadow)"/>
      <rect width="400" height="38" rx="14" fill="#ea580c"/>
      <rect y="20" width="400" height="18" fill="#ea580c"/>
      <text x="200" y="24" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff">CALDERA HUMOTUBULAR (ESCOCESA / AUXILIAR)</text>
      
      <g transform="translate(40, 55)">
        <rect width="320" height="110" rx="8" fill="#e0f2fe" stroke="#38bdf8" stroke-width="1.5"/>
        <text x="160" y="22" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0369a1">GRAN MASA DE AGUA ALREDEDOR</text>
        ${[40, 90, 140, 190, 240, 280].map(x => `
          <circle cx="${x}" cy="65" r="16" fill="#ffedd5" stroke="#ea580c" stroke-width="3"/>
          <circle cx="${x}" cy="65" r="8" fill="#ea580c"/>
        `).join('')}
        <text x="160" y="100" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#c2410c">GASES DE COMBUSTIÓN DENTRO DE LOS TUBOS</text>
      </g>
      <text x="30" y="195" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">• Presión: Bajas/medias presiones (&lt; 15 - 20 bar)</text>
      <text x="30" y="215" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• Inercia: Gran reserva térmica (acumulador)</text>
      <text x="30" y="235" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• Agua: Menor exigencia en tratamiento químico</text>
      <text x="30" y="255" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• Aplicación: Calderas auxiliares de puerto</text>
    </g>

    <g transform="translate(60, 405)">
      <g id="card-service" ${glow(focus, 'service')}>
        <rect x="0" y="0" width="420" height="135" rx="12" fill="${isAct(focus, 'service') ? 'url(#activeGrad)' : '#ffffff'}" stroke="${isAct(focus, 'service') ? '#d97706' : '#cbd5e1'}" stroke-width="${isAct(focus, 'service') ? 3 : 1.5}" filter="url(#cardShadow)"/>
        <text x="20" y="28" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#0f2922">CRITERIOS DEL SERVICIO NAVAL</text>
        <text x="20" y="52" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• Relación potencia/peso y espacio en sala de máquinas.</text>
        <text x="20" y="74" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• Capacidad de respuesta ante maniobras bruscas de hélice.</text>
        <text x="20" y="96" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• Mantenimiento a bordo, acceso y limpieza de hollín/sales.</text>
      </g>
      <g id="card-criteria" ${glow(focus, 'criteria')}>
        <rect x="460" y="0" width="420" height="135" rx="12" fill="${isAct(focus, 'criteria') ? 'url(#activeGrad)' : '#ffffff'}" stroke="${isAct(focus, 'criteria') ? '#d97706' : '#cbd5e1'}" stroke-width="${isAct(focus, 'criteria') ? 3 : 1.5}" filter="url(#cardShadow)"/>
        <text x="480" y="28" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#0f2922">CONDICIONES HOMOGÉNEAS DE COMPARACIÓN</text>
        <text x="480" y="52" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• Comparar para igual presión de vapor y producción [kg/h].</text>
        <text x="480" y="74" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• No evaluar sólo dimensiones externas o una letra de modelo.</text>
        <text x="480" y="96" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#475569">• Exigencias de calidad de agua y desaireación rigurosa.</text>
      </g>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 4. WALL HEAT TRANSFER (TRANSFERENCIA) ====================
function drawWall(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#f97316"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Llama / Gases</text>
    <circle cx="160" cy="17" r="5" fill="#475569"/><text x="172" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Hollín</text>
    <circle cx="260" cy="17" r="5" fill="#94a3b8"/><text x="272" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Pared metálica</text>
    <circle cx="390" cy="17" r="5" fill="#d97706"/><text x="402" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Incrustación</text>
    <circle cx="510" cy="17" r="5" fill="#0284c7"/><text x="522" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Agua líquida</text>
    <circle cx="680" cy="17" r="5" fill="#d97706"/><text x="692" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco activo</text>
  `;

  const layers = [
    { key: 'fire', x: 80, w: 160, title: 'GASES / LLAMA', desc: 'Radiación y convección\nT ≈ 1200°C', col: '#fdba74', textCol: '#9a3412' },
    { key: 'soot', x: 240, w: 80, title: 'HOLLÍN', desc: 'Aislante térmico exterior\nCaída brusca de T', col: '#475569', textCol: '#ffffff' },
    { key: 'metal', x: 320, w: 180, title: 'PARED DE ACERO', desc: 'Conducción en metal\nResistencia mecánica', col: '#cbd5e1', textCol: '#1e293b' },
    { key: 'scale', x: 500, w: 90, title: 'INCRUSTACIÓN', desc: 'Sales de Ca y Mg\nRiesgo de ampolla', col: '#fde047', textCol: '#713f12' },
    { key: 'water', x: 590, w: 230, title: 'AGUA / VAPOR', desc: 'Ebullición y refrigeración\nTsat ≈ 260°C', col: '#bae6fd', textCol: '#0369a1' }
  ];

  const content = `
    <g transform="translate(40, 110)">
      ${layers.map(l => `
        <g id="layer-${l.key}" ${glow(focus, l.key)}>
          <rect x="${l.x}" y="0" width="${l.w}" height="280" fill="${l.col}" stroke="${isAct(focus, l.key) ? '#d97706' : '#64748b'}" stroke-width="${isAct(focus, l.key) ? 4 : 1.5}"/>
          <text x="${l.x + l.w/2}" y="30" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="${l.textCol}">${l.title}</text>
          <text x="${l.x + l.w/2}" y="250" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="600" fill="${l.textCol}">${l.desc.split('\n')[0]}</text>
          <text x="${l.x + l.w/2}" y="265" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="${l.textCol}">${l.desc.split('\n')[1]}</text>
        </g>
      `).join('')}

      <path d="M 90 60 Q 230 75 240 85 L 320 160 L 500 175 L 590 230 L 810 235" fill="none" stroke="#e11d48" stroke-width="4.5" stroke-linecap="round"/>
      <circle cx="240" cy="85" r="5" fill="#e11d48"/>
      <circle cx="320" cy="160" r="5" fill="#e11d48"/>
      <circle cx="500" cy="175" r="5" fill="#e11d48"/>
      <circle cx="590" cy="230" r="5" fill="#e11d48"/>
      <text x="100" y="52" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#e11d48">Tgas (1200°C)</text>
      <text x="700" y="225" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#0284c7">Tagua (260°C)</text>

      <line x1="120" y1="130" x2="760" y2="130" stroke="#ea580c" stroke-width="4" stroke-dasharray="8 4" marker-end="url(#arrowOrange)"/>
      <rect x="360" y="116" width="160" height="26" rx="4" fill="#ffffff" stroke="#ea580c" stroke-width="1"/>
      <text x="440" y="133" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#ea580c">FLUJO TÉRMICO Q [kW/m²]</text>
    </g>

    <g transform="translate(100, 430)">
      <rect width="800" height="105" rx="12" fill="#fffbeb" stroke="#f59e0b" stroke-width="2" filter="url(#cardShadow)"/>
      <text x="30" y="32" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#b45309">EFECTO DE LOS DEPÓSITOS EN LA INTEGRIDAD DEL METAL</text>
      <text x="30" y="54" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#78350f">• El hollín exterior reduce la transferencia y aumenta el consumo de combustible.</text>
      <text x="30" y="74" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#78350f">• La incrustación interna (aislante) impide que el agua refrigere el tubo: el metal se sobrecalienta, pierde resistencia mecánica y se produce ampolla o rotura por rotura plástica.</text>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 5. VALVES (VALVULAS) ====================
function drawValves(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Globo / Regulación</text>
    <circle cx="210" cy="17" r="5" fill="#059669"/><text x="222" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Retención / SDNR</text>
    <circle cx="390" cy="17" r="5" fill="#e11d48"/><text x="402" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Seguridad</text>
    <circle cx="510" cy="17" r="5" fill="#64748b"/><text x="522" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Trampa vapor</text>
    <circle cx="680" cy="17" r="5" fill="#d97706"/><text x="692" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Activo</text>
  `;

  const valves = [
    { key: 'globe', x: 60, y: 110, w: 410, h: 200, title: 'VÁLVULA GLOBO (REGULACIÓN / AISLACIÓN)', desc: 'Obturador móvil contra asiento circular\nPaso del fluido en forma de S\nApta para estrangulación y regulación fina de caudal\nCierre positivo bajo presión', col: '#0284c7' },
    { key: 'check', x: 530, y: 110, w: 410, h: 200, title: 'VÁLVULA DE RETENCIÓN / SDNR', desc: 'Permite flujo en un solo sentido\nCierre automático inmediato por flujo inverso\nSDNR (Screw-Down Non-Return): permite además\nbloquear el vástago manualmente para corte seguro', col: '#059669' },
    { key: 'safety', x: 60, y: 340, w: 410, h: 200, title: 'VÁLVULA DE SEGURIDAD (SOBREPRESIÓN)', desc: 'Protección de máxima emergencia por resorte calibrado\nApertura pop rápida ante sobrepresión\nBlowdown: presión de cierre inferior a la de apertura\nDescarga directa a escape atmosférico', col: '#e11d48' },
    { key: 'trap', x: 530, y: 340, w: 410, h: 200, title: 'TRAMPA DE VAPOR (PURGA CONDENSADO)', desc: 'Evacua condensado continuo y gases incondensables\nBloquea el paso de vapor vivo sin pérdidas\nTipos: flotador mecánico, termodinámica o bimetálica\nVital para evitar golpes de ariete en líneas', col: '#475569' }
  ];

  const content = `
    ${valves.map(v => {
      const active = isAct(focus, v.key);
      const lines = v.desc.split('\n');
      return `
      <g id="valve-${v.key}" ${glow(focus, v.key)}>
        <rect x="${v.x}" y="${v.y}" width="${v.w}" height="${v.h}" rx="14" fill="${active ? 'url(#activeGrad)' : '#ffffff'}" stroke="${active ? '#d97706' : v.col}" stroke-width="${active ? 3.5 : 2}" filter="url(#cardShadow)"/>
        <rect x="${v.x}" y="${v.y}" width="${v.w}" height="36" rx="14" fill="${v.col}"/>
        <rect x="${v.x}" y="${v.y+20}" width="${v.w}" height="16" fill="${v.col}"/>
        <text x="${v.x + 20}" y="${v.y + 23}" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff">${v.title}</text>
        ${lines.map((l, i) => `
          <text x="${v.x + 20}" y="${v.y + 65 + i*24}" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="${i===0?'600':'400'}" fill="#1e293b">• ${escapeXML(l)}</text>
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
    legend,
    content
  });
}

// ==================== 6. TURBINE & BLADING (ETAPAS-TURBINA) ====================
function drawTurbine(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Estator / Toberas fijas</text>
    <circle cx="220" cy="17" r="5" fill="#ea580c"/><text x="232" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Rotor / Álabes móviles</text>
    <circle cx="430" cy="17" r="5" fill="#e11d48"/><text x="442" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Vapor de entrada / escape</text>
    <circle cx="680" cy="17" r="5" fill="#d97706"/><text x="692" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco activo</text>
  `;

  const content = `
    <g transform="translate(60, 110)">
      <path d="M 80 80 L 800 20 L 800 360 L 80 300 Z" fill="#f8fafc" stroke="#475569" stroke-width="3"/>
      <rect x="40" y="170" width="820" height="40" rx="6" fill="#94a3b8" stroke="#334155" stroke-width="2"/>
      <text x="450" y="195" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#1e293b">EJE DEL ROTOR DE LA TURBINA</text>

      <g id="turb-stator" ${glow(focus, 'stator')}>
        ${[180, 360, 540, 700].map(x => `
          <rect x="${x}" y="85" width="24" height="85" rx="4" fill="${strokeCol(focus, 'stator', '#0284c7')}" stroke="#0369a1" stroke-width="1.5"/>
          <rect x="${x}" y="210" width="24" height="85" rx="4" fill="${strokeCol(focus, 'stator', '#0284c7')}" stroke="#0369a1" stroke-width="1.5"/>
        `).join('')}
        <text x="190" y="70" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#0284c7">ÁLABES FIJOS (TOBERAS)</text>
      </g>

      <g id="turb-rotor" ${glow(focus, 'rotor')}>
        ${[250, 430, 610, 760].map(x => `
          <rect x="${x}" y="70" width="24" height="100" rx="4" fill="${strokeCol(focus, 'rotor', '#ea580c')}" stroke="#c2410c" stroke-width="1.5"/>
          <rect x="${x}" y="210" width="24" height="100" rx="4" fill="${strokeCol(focus, 'rotor', '#ea580c')}" stroke="#c2410c" stroke-width="1.5"/>
        `).join('')}
        <text x="260" y="55" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#ea580c">ÁLABES MÓVILES</text>
      </g>

      <g id="turb-exhaust" ${glow(focus, 'exhaust')}>
        <path d="M 50 120 L 850 120" stroke="#e11d48" stroke-width="4" stroke-dasharray="8 4" marker-end="url(#arrowRed)"/>
        <text x="70" y="110" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#e11d48">Vapor vivo (AP)</text>
        <text x="770" y="110" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#e11d48">Escape a condensador</text>
      </g>
    </g>

    <g id="turb-pressure" ${glow(focus, 'pressure')} transform="translate(60, 480)">
      <rect width="880" height="75" rx="10" fill="#ffffff" stroke="${isAct(focus, 'pressure') ? '#d97706' : '#cbd5e1'}" stroke-width="${isAct(focus, 'pressure') ? 3 : 1.5}" filter="url(#cardShadow)"/>
      <text x="20" y="24" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e293b">ETAPAS DE ACCIÓN VS REACCIÓN</text>
      <text x="20" y="44" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• Acción (Rateau/Curtis): Caída de presión y aceleración exclusiva en toberas fijas; álabe móvil desvía flujo sin caída de presión.</text>
      <text x="20" y="62" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• Reacción (Parsons): Caída de presión repartida al 50% entre álabes fijos y móviles; expansión acelerada en el rotor genera empuje reactivo.</text>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 7. VELOCITY TRIANGLES (VELOCIDADES) ====================
function drawTriangle(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#e11d48"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">C: Velocidad absoluta (salida tobera)</text>
    <circle cx="310" cy="17" r="5" fill="#ea580c"/><text x="322" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">U: Velocidad tangencial (álabe)</text>
    <circle cx="580" cy="17" r="5" fill="#0284c7"/><text x="592" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">W: Velocidad relativa</text>
    <circle cx="780" cy="17" r="5" fill="#d97706"/><text x="792" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco activo</text>
  `;

  const content = `
    <g transform="translate(100, 100)">
      <path d="M 400 340 C 450 310 470 260 460 210 C 450 160 410 130 380 110" fill="none" stroke="#64748b" stroke-width="8" stroke-linecap="round"/>
      <text x="480" y="230" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#64748b">ÁLABE MÓVIL</text>

      <g id="tri-inlet">
        <text x="120" y="60" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" fill="#0f2922">TRIÁNGULO DE ENTRADA (ESTACIÓN 1)</text>
        
        <g id="tri-abs" ${glow(focus, 'absolute')}>
          <line x1="100" y1="260" x2="380" y2="110" stroke="${strokeCol(focus, 'absolute', '#e11d48')}" stroke-width="${strokeW(focus, 'absolute', 4.5, 6)}" marker-end="url(#arrowRed)"/>
          <text x="210" y="170" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#e11d48">C1 (Absoluta)</text>
        </g>

        <g id="tri-peri" ${glow(focus, 'peripheral')}>
          <line x1="100" y1="260" x2="300" y2="260" stroke="${strokeCol(focus, 'peripheral', '#ea580c')}" stroke-width="${strokeW(focus, 'peripheral', 4.5, 6)}" marker-end="url(#arrowOrange)"/>
          <text x="180" y="290" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#ea580c">U (Vel. del álabe)</text>
        </g>

        <g id="tri-rel" ${glow(focus, 'relative')}>
          <line x1="300" y1="260" x2="380" y2="110" stroke="${strokeCol(focus, 'relative', '#0284c7')}" stroke-width="${strokeW(focus, 'relative', 4.5, 6)}" marker-end="url(#arrowBlue)"/>
          <text x="350" y="200" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#0284c7">W1 (Relativa)</text>
        </g>
      </g>

      <g id="tri-work" ${glow(focus, 'work')} transform="translate(100, 330)">
        <rect width="600" height="90" rx="12" fill="#ffffff" stroke="${isAct(focus, 'work') ? '#d97706' : '#cbd5e1'}" stroke-width="${isAct(focus, 'work') ? 3 : 1.5}" filter="url(#cardShadow)"/>
        <text x="300" y="32" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#0f2922">ECUACIÓN DE EULER PARA TURBOMAQUINARIA</text>
        <text x="300" y="58" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" fill="#b45309">Trabajo específico w = U · (C1u - C2u) [kJ/kg]</text>
        <text x="300" y="78" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#64748b">La variación de la componente tangencial de la velocidad produce el par motor sobre el rotor.</text>
      </g>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 8. SAFETY VALVE & GAUGE (SEGURIDAD) ====================
function drawSafety(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Manómetro y sifón</text>
    <circle cx="190" cy="17" r="5" fill="#ea580c"/><text x="202" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Resorte y vástago</text>
    <circle cx="360" cy="17" r="5" fill="#e11d48"/><text x="372" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Disco y tobera</text>
    <circle cx="500" cy="17" r="5" fill="#64748b"/><text x="512" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Descarga de alivio</text>
    <circle cx="680" cy="17" r="5" fill="#d97706"/><text x="692" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco activo</text>
  `;

  const content = `
    <g transform="translate(60, 100)">
      <g id="gauge-group" ${glow(focus, 'gauge')} transform="translate(40, 40)">
        <rect width="260" height="340" rx="14" fill="${isAct(focus, 'gauge') ? 'url(#activeGrad)' : '#ffffff'}" stroke="${isAct(focus, 'gauge') ? '#d97706' : '#0284c7'}" stroke-width="${isAct(focus, 'gauge') ? 3.5 : 2}" filter="url(#cardShadow)"/>
        <text x="130" y="32" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#0284c7">MEDICIÓN DE PRESIÓN</text>
        <circle cx="130" cy="110" r="55" fill="#f8fafc" stroke="#334155" stroke-width="3"/>
        <circle cx="130" cy="110" r="4" fill="#e11d48"/>
        <line x1="130" y1="110" x2="160" y2="85" stroke="#e11d48" stroke-width="3" stroke-linecap="round"/>
        <text x="130" y="145" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#334155">bar / kg/cm²</text>
        <path d="M 130 165 L 130 200 C 170 200 170 240 130 240 C 90 240 90 200 130 200 L 130 290" fill="none" stroke="#0284c7" stroke-width="4"/>
        <text x="130" y="270" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="600" fill="#0284c7">Sifón con sello condensado</text>
        <text x="130" y="315" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#475569">Protege el Bourdon del vapor vivo</text>
      </g>

      <g id="safety-valve-group" transform="translate(380, 20)">
        <rect width="480" height="380" rx="14" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#cardShadow)"/>
        <text x="240" y="32" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" fill="#0f2922">VÁLVULA DE SEGURIDAD DE RESORTE</text>

        <path d="M 190 320 L 190 250 L 290 250 L 290 320 Z" fill="#e2e8f0" stroke="#475569" stroke-width="2"/>
        <line x1="160" y1="320" x2="320" y2="320" stroke="#334155" stroke-width="5"/>
        <text x="240" y="340" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#e11d48">ENTRADA DESDE EL DOMO</text>

        <g id="spring-part" ${glow(focus, 'spring')}>
          <rect x="200" y="70" width="80" height="150" rx="8" fill="${fillCol(focus, 'spring', '#f8fafc')}" stroke="${strokeCol(focus, 'spring', '#ea580c')}" stroke-width="${strokeW(focus, 'spring', 2.5)}"/>
          ${[90, 115, 140, 165, 190].map(y => `
            <path d="M 210 ${y} L 270 ${y+12}" stroke="${strokeCol(focus, 'spring', '#ea580c')}" stroke-width="4" stroke-linecap="round"/>
          `).join('')}
          <line x1="240" y1="50" x2="240" y2="240" stroke="#334155" stroke-width="6"/>
          <text x="310" y="150" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#ea580c">RESORTE CALIBRADO</text>
        </g>

        <g id="disc-part" ${glow(focus, 'disc')}>
          <rect x="205" y="240" width="70" height="18" rx="4" fill="${fillCol(focus, 'disc', '#fecdd3')}" stroke="${strokeCol(focus, 'disc', '#e11d48')}" stroke-width="${strokeW(focus, 'disc', 2.5)}"/>
          <text x="145" y="245" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#e11d48">Disco / Asiento</text>
          <text x="145" y="258" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#9f1239">Anillo blowdown</text>
        </g>

        <g id="discharge-part" ${glow(focus, 'discharge')}>
          <path d="M 280 230 L 420 230 L 420 120" fill="none" stroke="${strokeCol(focus, 'discharge', '#475569')}" stroke-width="4.5" marker-end="url(#arrowGray)"/>
          <text x="340" y="215" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#475569">Escape al exterior</text>
        </g>
      </g>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 9. DEAERATOR (DESAIREACION) ====================
function drawDeaerator(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Condensado / Agua</text>
    <circle cx="190" cy="17" r="5" fill="#e11d48"/><text x="202" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Vapor de calentamiento</text>
    <circle cx="410" cy="17" r="5" fill="#475569"/><text x="422" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Venteo de gases (O2 / CO2)</text>
    <circle cx="630" cy="17" r="5" fill="#059669"/><text x="642" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Bomba alimentación (NPSH)</text>
  `;

  const content = `
    <g transform="translate(60, 100)">
      <g id="deaerator-dome" ${glow(focus, 'water')}>
        <rect x="360" y="30" width="180" height="130" rx="20" fill="#e0f2fe" stroke="${strokeCol(focus, 'water', '#0284c7')}" stroke-width="${strokeW(focus, 'water', 2.5)}"/>
        <text x="450" y="55" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#0369a1">CÚPULA DESAIREADORA</text>
        ${[75, 95, 115].map(y => `
          <line x1="390" y1="${y}" x2="510" y2="${y}" stroke="#0284c7" stroke-width="2.5" stroke-dasharray="6 4"/>
        `).join('')}
        <text x="450" y="145" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#0284c7">Cascada de bandejas perforadas</text>
      </g>

      <g id="deaerator-vent" ${glow(focus, 'vent')}>
        <path d="M 450 30 L 450 5 L 560 5" fill="none" stroke="${strokeCol(focus, 'vent', '#475569')}" stroke-width="3" marker-end="url(#arrowGray)"/>
        <text x="575" y="10" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#475569">Venteo de gases incondensables (O2 / CO2)</text>
      </g>

      <path d="M 100 80 L 360 80" fill="none" stroke="#0284c7" stroke-width="3.5" marker-end="url(#arrowBlue)"/>
      <text x="120" y="70" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#0284c7">Ingreso condensado (spray)</text>

      <path d="M 780 110 L 540 110" fill="none" stroke="#e11d48" stroke-width="3.5" marker-end="url(#arrowRed)"/>
      <text x="640" y="100" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#e11d48">Vapor de calentamiento</text>

      <g id="deaerator-tank" ${glow(focus, 'tank')}>
        <rect x="220" y="160" width="460" height="130" rx="30" fill="${fillCol(focus, 'tank', 'url(#drumGrad)')}" stroke="${strokeCol(focus, 'tank', '#0284c7')}" stroke-width="${strokeW(focus, 'tank', 2.5)}"/>
        <text x="450" y="195" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" fill="#0c4a6e">TANQUE DE ALMACENAMIENTO DE AGUA DESAIREADA</text>
        <text x="450" y="215" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#0369a1">Reserva térmica presurizada para caldera</text>
      </g>

      <g id="deaerator-pump" ${glow(focus, 'pump')}>
        <path d="M 450 290 L 450 390 L 560 390" fill="none" stroke="${strokeCol(focus, 'pump', '#059669')}" stroke-width="4.5" marker-end="url(#arrowGreen)"/>
        <circle cx="585" cy="390" r="25" fill="#dcfce7" stroke="#059669" stroke-width="3"/>
        <polygon points="575,375 600,390 575,405" fill="#059669"/>
        <text x="625" y="395" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#059669">BOMBA DE ALIMENTACIÓN PRINCIPAL</text>
        <line x1="410" y1="290" x2="410" y2="390" stroke="#d97706" stroke-width="2" stroke-dasharray="4 3"/>
        <text x="320" y="345" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Altura estática H</text>
        <text x="260" y="360" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#b45309">Garantiza NPSHd &gt; NPSHr (evita cavitación)</text>
      </g>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 10. SEQUENCE PIPELINE ====================
function drawSequence(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Fases previas</text>
    <circle cx="160" cy="17" r="5" fill="#d97706"/><text x="172" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Fase activa actual del procedimiento</text>
    <circle cx="480" cy="17" r="5" fill="#64748b"/><text x="492" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Fases posteriores del protocolo</text>
  `;

  const phases = m.steps.map((s, i) => {
    return {
      num: `FASE 0${i+1}`,
      title: s.title,
      text: s.text,
      key: s.focus
    };
  });

  const content = `
    <g transform="translate(50, 105)">
      ${phases.map((p, i) => {
        const x = (i % 2) * 455;
        const y = Math.floor(i / 2) * 220;
        const active = i === stepIndex;
        return `
        <g id="phase-${i+1}" ${glow(focus, p.key)}>
          <rect x="${x}" y="${y}" width="435" height="195" rx="14" fill="${active ? 'url(#activeGrad)' : '#ffffff'}" stroke="${active ? '#d97706' : '#cbd5e1'}" stroke-width="${active ? 3.5 : 1.5}" filter="url(#cardShadow)"/>
          
          <rect x="${x}" y="${y}" width="435" height="34" rx="14" fill="${active ? '#d97706' : '#334155'}"/>
          <rect x="${x}" y="${y+18}" width="435" height="16" fill="${active ? '#d97706' : '#334155'}"/>
          <text x="${x + 20}" y="${y + 22}" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff">${p.num} · ${escapeXML(p.title.toUpperCase())}</text>
          
          <!-- Pure SVG multi-line text (no foreignObject) -->
          <g transform="translate(${x + 20}, ${y + 58})">
            ${renderTextLines(0, 0, p.text, 50, 11, '#1e293b', 18)}
          </g>
        </g>
        `;
      }).join('')}

      <path d="M 440 95 L 500 95" stroke="#94a3b8" stroke-width="3" marker-end="url(#arrowGray)"/>
      <path d="M 890 95 Q 930 95 930 150 T 890 205 L 440 205 Q 400 205 400 260 T 440 315" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="6 4" marker-end="url(#arrowGray)"/>
      <path d="M 440 315 L 500 315" stroke="#94a3b8" stroke-width="3" marker-end="url(#arrowGray)"/>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 11. CONDENSER & VACUUM (VACIO) ====================
function drawCondenser(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#e11d48"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Vapor de escape (BP)</text>
    <circle cx="190" cy="17" r="5" fill="#0284c7"/><text x="202" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Agua de circulación (mar)</text>
    <circle cx="390" cy="17" r="5" fill="#0d9488"/><text x="402" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Extracción no condensables</text>
    <circle cx="610" cy="17" r="5" fill="#2563eb"/><text x="622" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Pozo caliente / Condensado</text>
    <circle cx="820" cy="17" r="5" fill="#d97706"/><text x="832" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco activo</text>
  `;

  const content = `
    <!-- Condenser Shell Outer Body -->
    <rect x="220" y="140" width="560" height="280" rx="16" fill="#f8fafc" stroke="#334155" stroke-width="3" filter="url(#cardShadow)"/>
    
    <!-- Steam Inlet Neck at Top -->
    <g id="cond-steam" ${glow(focus, 'steam')}>
      <path d="M 360 90 L 360 140 L 640 140 L 640 90 Z" fill="#fee2e2" stroke="${strokeCol(focus, 'steam', '#e11d48')}" stroke-width="${strokeW(focus, 'steam', 2.5)}"/>
      <path d="M 430 95 L 430 135 M 500 95 L 500 135 M 570 95 L 570 135" stroke="#e11d48" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrowRed)"/>
      <rect x="400" y="75" width="200" height="24" rx="6" fill="#e11d48"/>
      <text x="500" y="91" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#ffffff">ESCAPE TURBINA BP (~0.05 bar abs)</text>
      
      <!-- Impingement Baffle -->
      <path d="M 400 160 Q 500 175 600 160" stroke="#475569" stroke-width="4" stroke-linecap="round"/>
      <text x="500" y="154" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" font-weight="700" fill="#64748b">DEFLECTOR DE IMPACTO (PROTEGE TUBOS)</text>
    </g>

    <!-- Tube Bank / Cooling Water Circuit -->
    <g id="cond-cooling" ${glow(focus, 'cooling')}>
      <!-- Water boxes -->
      <path d="M 220 160 L 140 180 L 140 260 L 220 280 Z" fill="#e0f2fe" stroke="${strokeCol(focus, 'cooling', '#0284c7')}" stroke-width="${strokeW(focus, 'cooling', 2.5)}"/>
      <path d="M 220 280 L 140 300 L 140 380 L 220 400 Z" fill="#e0f2fe" stroke="${strokeCol(focus, 'cooling', '#0284c7')}" stroke-width="${strokeW(focus, 'cooling', 2.5)}"/>
      <path d="M 780 160 L 850 180 L 850 400 L 780 400 Z" fill="#e0f2fe" stroke="${strokeCol(focus, 'cooling', '#0284c7')}" stroke-width="${strokeW(focus, 'cooling', 2.5)}"/>
      
      <!-- SW inlet / outlet pipes -->
      <path d="M 60 340 L 140 340" stroke="#0284c7" stroke-width="6" marker-end="url(#arrowBlue)"/>
      <text x="70" y="325" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0369a1">ENTRADA AGUA MAR (20°C)</text>
      
      <path d="M 140 220 L 60 220" stroke="#0ea5e9" stroke-width="6" marker-end="url(#arrowBlue)"/>
      <text x="70" y="205" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0284c7">SALIDA AGUA MAR (28°C)</text>

      <!-- Tube bundle grid (representing multitubular condenser) -->
      ${Array.from({length: 7}).map((_, r) => {
        const y = 185 + r * 32;
        return Array.from({length: 12}).map((_, c) => {
          const x = 270 + c * 38;
          return `<circle cx="${x}" cy="${y}" r="6" fill="#bae6fd" stroke="#0284c7" stroke-width="1.5"/>`;
        }).join('');
      }).join('')}
      <text x="500" y="295" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#0369a1" opacity="0.85">HAZ MULTITUBULAR DE SUPERFICIE (CU-NI / TITANIO)</text>
    </g>

    <!---->
    <g id="cond-air" ${glow(focus, 'air')}>
      <!-- Air baffle isolating cooler tubes -->
      <path d="M 660 210 L 660 380 L 740 380" fill="none" stroke="${strokeCol(focus, 'air', '#0d9488')}" stroke-width="3" stroke-dasharray="4 2"/>
      <rect x="670" y="230" width="80" height="130" rx="6" fill="#ccfbf1" opacity="0.4"/>
      
      <!-- Suction line to ejector -->
      <path d="M 720 280 L 880 280 L 880 170" stroke="${strokeCol(focus, 'air', '#0d9488')}" stroke-width="3" stroke-dasharray="5 3" marker-end="url(#arrowGreen)"/>
      <rect x="830" y="105" width="120" height="65" rx="8" fill="#f0fdfa" stroke="${strokeCol(focus, 'air', '#0d9488')}" stroke-width="2"/>
      <text x="890" y="125" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0f766e">EYECTOR DE AIRE</text>
      <text x="890" y="142" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#134e4a">Extracción de aire y</text>
      <text x="890" y="156" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#134e4a">gases no condensables</text>
    </g>

    <!---->
    <g id="cond-condensate" ${glow(focus, 'condensate')}>
      <!-- Hotwell Sump -->
      <path d="M 380 420 L 420 480 L 580 480 L 620 420 Z" fill="#dbeafe" stroke="${strokeCol(focus, 'condensate', '#2563eb')}" stroke-width="${strokeW(focus, 'condensate', 2.5)}"/>
      <text x="500" y="455" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e40af">POZO CALIENTE (HOTWELL)</text>
      <text x="500" y="470" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" fill="#1d4ed8">Agua condensada pura ~32-35°C</text>

      <!-- Suction to Condensate Pump -->
      <path d="M 500 480 L 500 525 L 360 525" stroke="#2563eb" stroke-width="4" marker-end="url(#arrowBlue)"/>
      <!-- Condensate Extraction Pump (CEP) -->
      <circle cx="320" cy="525" r="22" fill="#ffffff" stroke="${strokeCol(focus, 'condensate', '#2563eb')}" stroke-width="3"/>
      <path d="M 308 515 L 332 525 L 308 535 Z" fill="#2563eb"/>
      <text x="320" y="560" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#1e40af">BOMBA EXTRACCIÓN (CEP)</text>
      
      <!-- Discharge to feed heaters / deaerator -->
      <path d="M 298 525 L 140 525" stroke="#2563eb" stroke-width="3" marker-end="url(#arrowBlue)"/>
      <text x="135" y="515" text-anchor="end" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#1e40af">Hacia desaireador</text>
    </g>

    <!-- Explanatory Bottom Card for Active Step -->
    <g transform="translate(60, 480)" ${glow(focus, focus)}>
      <rect x="580" y="15" width="370" height="65" rx="8" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#cardShadow)"/>
      <text x="600" y="38" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#0f172a">PRINCIPIO DEL CONDENSADOR NAVAL</text>
      <text x="600" y="56" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" fill="#475569">Condensación de superficie: el vapor se licúa al ceder calor latente</text>
      <text x="600" y="70" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" fill="#475569">al agua de mar sin contacto directo, manteniendo vacío profundo.</text>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 12. TURBINE MECHANICS (MECANICA-TURBINA) ====================
function drawTurbineMechanics(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Cojinetes radiales</text>
    <circle cx="190" cy="17" r="5" fill="#ea580c"/><text x="202" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Cojinete empuje axial (Michell)</text>
    <circle cx="430" cy="17" r="5" fill="#0d9488"/><text x="442" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Sellos de vapor (laberinto)</text>
    <circle cx="660" cy="17" r="5" fill="#6366f1"/><text x="672" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Reductor / Transmisión</text>
    <circle cx="850" cy="17" r="5" fill="#d97706"/><text x="862" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco activo</text>
  `;

  const content = `
    <!-- Turbine Casing Silhouette Background -->
    <path d="M 290 150 L 590 110 L 590 390 L 290 350 Z" fill="#f8fafc" stroke="#475569" stroke-width="2.5"/>
    <text x="440" y="140" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#64748b">CARCASA DE LA TURBINA</text>

    <!-- Central Turbine Rotor Shaft -->
    <rect x="70" y="235" width="860" height="30" rx="4" fill="url(#steelGrad)" stroke="#334155" stroke-width="2"/>
    
    <!-- Rotor Blading Section -->
    <g transform="translate(320, 160)">
      ${[0, 45, 90, 135, 180, 225].map(x => `
        <rect x="${x}" y="0" width="16" height="75" rx="3" fill="#94a3b8" stroke="#334155" stroke-width="1.5"/>
        <rect x="${x}" y="105" width="16" height="75" rx="3" fill="#94a3b8" stroke="#334155" stroke-width="1.5"/>
      `).join('')}
    </g>

    <!-- 1. Radial Bearings (Cojinetes Radiales) -->
    <g id="mech-radial" ${glow(focus, 'radial')}>
      <!-- Forward Journal Bearing -->
      <rect x="230" y="210" width="45" height="80" rx="6" fill="#e0f2fe" stroke="${strokeCol(focus, 'radial', '#0284c7')}" stroke-width="${strokeW(focus, 'radial', 2.5)}"/>
      <circle cx="252" cy="250" r="18" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="4 2"/>
      <!-- Aft Journal Bearing -->
      <rect x="610" y="210" width="45" height="80" rx="6" fill="#e0f2fe" stroke="${strokeCol(focus, 'radial', '#0284c7')}" stroke-width="${strokeW(focus, 'radial', 2.5)}"/>
      <circle cx="632" cy="250" r="18" fill="none" stroke="#0284c7" stroke-width="3" stroke-dasharray="4 2"/>

      <!-- Lubrication Oil Supply Arrows -->
      <path d="M 252 170 L 252 210" stroke="#0284c7" stroke-width="3" marker-end="url(#arrowBlue)"/>
      <path d="M 632 170 L 632 210" stroke="#0284c7" stroke-width="3" marker-end="url(#arrowBlue)"/>
      <text x="252" y="160" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0284c7">COJINETE RADIAL (PROA)</text>
      <text x="632" y="160" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0284c7">COJINETE RADIAL (POPA)</text>
    </g>

    <!-- 2. Michell Thrust Bearing (Cojinete de Empuje Axial) -->
    <g id="mech-thrust" ${glow(focus, 'thrust')}>
      <rect x="110" y="190" width="85" height="120" rx="8" fill="#ffedd5" stroke="${strokeCol(focus, 'thrust', '#ea580c')}" stroke-width="${strokeW(focus, 'thrust', 2.5)}"/>
      <!-- Thrust Collar on Shaft -->
      <rect x="145" y="200" width="15" height="100" rx="2" fill="#c2410c"/>
      <!-- Tilting Pads (Zapatas basculantes) -->
      <rect x="125" y="210" width="12" height="35" rx="2" fill="#ea580c"/>
      <rect x="125" y="255" width="12" height="35" rx="2" fill="#ea580c"/>
      <rect x="168" y="210" width="12" height="35" rx="2" fill="#ea580c"/>
      <rect x="168" y="255" width="12" height="35" rx="2" fill="#ea580c"/>
      
      <text x="152" y="175" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#c2410c">COJINETE MICHELL</text>
      <text x="152" y="330" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="600" fill="#9a3412">Zapatas oscilantes (empuje axial)</text>
      <!-- Axial force indicator -->
      <path d="M 70 250 L 105 250" stroke="#ea580c" stroke-width="4" marker-end="url(#arrowOrange)"/>
    </g>

    <!-- 3. Labyrinth Glands (Sellos de Laberinto) -->
    <g id="mech-seal" ${glow(focus, 'seal')}>
      <!-- HP gland seal -->
      <rect x="285" y="218" width="30" height="64" rx="4" fill="#ccfbf1" stroke="${strokeCol(focus, 'seal', '#0d9488')}" stroke-width="${strokeW(focus, 'seal', 2)}"/>
      <!-- LP gland seal -->
      <rect x="575" y="218" width="30" height="64" rx="4" fill="#ccfbf1" stroke="${strokeCol(focus, 'seal', '#0d9488')}" stroke-width="${strokeW(focus, 'seal', 2)}"/>
      
      <!-- Sealing Steam Lines -->
      <path d="M 300 340 L 300 282" stroke="#0d9488" stroke-width="2.5" marker-end="url(#arrowGreen)"/>
      <path d="M 590 340 L 590 282" stroke="#0d9488" stroke-width="2.5" marker-end="url(#arrowGreen)"/>
      <rect x="390" y="330" width="140" height="35" rx="6" fill="#f0fdfa" stroke="#0d9488" stroke-width="1.5"/>
      <text x="460" y="347" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0f766e">VAPOR DE SELLADO</text>
      <text x="460" y="359" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#134e4a">0.2 - 0.3 bar g (evita fugas y aire)</text>
      <path d="M 300 347 L 390 347 M 530 347 L 590 347" stroke="#0d9488" stroke-width="2"/>
    </g>

    <!-- 4. Gear Transmission (Reductor de Doble Reducción) -->
    <g id="mech-gear" ${glow(focus, 'gear')}>
      <rect x="710" y="160" width="180" height="180" rx="12" fill="#eef2ff" stroke="${strokeCol(focus, 'gear', '#6366f1')}" stroke-width="${strokeW(focus, 'gear', 2.5)}"/>
      <!-- Flexible coupling -->
      <rect x="675" y="240" width="25" height="20" rx="3" fill="#64748b"/>
      <!-- High speed pinion -->
      <circle cx="755" cy="250" r="28" fill="#c7d2fe" stroke="#4f46e5" stroke-width="2"/>
      <text x="755" y="254" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#3730a3">PIÑÓN</text>
      <!-- Low speed bull gear -->
      <circle cx="835" cy="250" r="48" fill="#e0e7ff" stroke="#4f46e5" stroke-width="2.5"/>
      <text x="835" y="254" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" font-weight="800" fill="#312e81">RUEDA LENTA</text>
      
      <text x="800" y="185" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#4338ca">REDUCTOR NAVAL</text>
      <text x="800" y="325" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" font-weight="600" fill="#3730a3">Hacia eje de hélice (60-120 RPM)</text>
      <path d="M 883 250 L 920 250" stroke="#4f46e5" stroke-width="5" marker-end="url(#arrowBlue)"/>
    </g>

    <!-- Bottom Technical Summary Cards -->
    <g transform="translate(60, 420)">
      <rect width="880" height="85" rx="10" fill="#ffffff" stroke="${isAct(focus, focus) ? '#d97706' : '#cbd5e1'}" stroke-width="1.5" filter="url(#cardShadow)"/>
      <text x="24" y="24" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e293b">VINCULACIÓN MECÁNICA DEL CONJUNTO PROPULSOR</text>
      <text x="24" y="44" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• Cojinetes radiales: Mantienen alineación concéntrica del rotor bajo cuña hidrodinámica continua de aceite.</text>
      <text x="24" y="60" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• Cojinete Michell: Absorbe el empuje generado por la caída de presión en las coronas y fija la posición axial exacta del rotor.</text>
      <text x="24" y="76" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• Sellos de laberinto y Reductor: Aíslan la cámara de vacío y reducen las 5.000+ RPM de la turbina al régimen de hélice.</text>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 13. ASTERN TURBINE & CPP (MARCHA-ATRAS) ====================
function drawAsternTurbine(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Turbina Avante (Ahead)</text>
    <circle cx="200" cy="17" r="5" fill="#ea580c"/><text x="212" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Elemento Ciar (Astern Curtis)</text>
    <circle cx="440" cy="17" r="5" fill="#e11d48"/><text x="452" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Válvulas de maniobra / Caldera</text>
    <circle cx="680" cy="17" r="5" fill="#10b981"/><text x="692" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Hélice de paso controlable (CPP)</text>
    <circle cx="870" cy="17" r="5" fill="#d97706"/><text x="882" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco</text>
  `;

  const content = `
    <!-- Main Steam Manifold and Valves (Top) -->
    <g id="astern-gear" ${glow(focus, 'gear')}>
      <rect x="220" y="90" width="560" height="40" rx="8" fill="#f1f5f9" stroke="#475569" stroke-width="2"/>
      <text x="500" y="115" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e293b">LÍNEA DE VAPOR PRINCIPAL DESDE CALDERA (VAPOR VIVO)</text>
      
      <!-- Ahead Valve -->
      <g transform="translate(320, 120)">
        <path d="M 0 10 L 0 50" stroke="#0284c7" stroke-width="4" marker-end="url(#arrowBlue)"/>
        <rect x="-35" y="15" width="70" height="24" rx="4" fill="#0284c7"/>
        <text x="0" y="31" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" font-weight="700" fill="#ffffff">VÁLV. AVANTE</text>
      </g>

      <!-- Astern Valve -->
      <g transform="translate(680, 120)">
        <path d="M 0 10 L 0 50" stroke="#ea580c" stroke-width="4" marker-end="url(#arrowOrange)"/>
        <rect x="-35" y="15" width="70" height="24" rx="4" fill="#ea580c"/>
        <text x="0" y="31" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" font-weight="700" fill="#ffffff">VÁLV. CIAR</text>
      </g>

      <!-- Interlock note -->
      <path d="M 360 132 L 640 132" stroke="#e11d48" stroke-width="2" stroke-dasharray="4 2"/>
      <rect x="440" y="122" width="120" height="20" rx="4" fill="#fee2e2" stroke="#ef4444" stroke-width="1"/>
      <text x="500" y="136" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="8.5" font-weight="700" fill="#b91c1c">ENCLAVAMIENTO DE SEGURIDAD</text>
    </g>

    <!-- Combined LP Turbine Casing -->
    <rect x="180" y="170" width="640" height="220" rx="16" fill="#f8fafc" stroke="#334155" stroke-width="3"/>
    
    <!-- Shaft running horizontally through -->
    <rect x="120" y="265" width="760" height="30" rx="4" fill="url(#steelGrad)" stroke="#334155" stroke-width="2"/>

    <!-- 1. Ahead Turbine Stages (Left side) -->
    <g id="astern-ahead" ${glow(focus, 'ahead')}>
      <rect x="220" y="185" width="280" height="190" rx="8" fill="#e0f2fe" opacity="0.3" stroke="${strokeCol(focus, 'ahead', '#0284c7')}" stroke-width="${strokeW(focus, 'ahead', 2)}"/>
      <text x="360" y="210" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#0369a1">CORONAS DE MARCHA AVANTE (LP)</text>
      ${[250, 290, 330, 370, 410, 450].map(x => `
        <rect x="${x}" y="225" width="12" height="40" rx="2" fill="#0284c7"/>
        <rect x="${x}" y="295" width="12" height="40" rx="2" fill="#0284c7"/>
      `).join('')}
      <!-- Ahead Steam Flow arrow -->
      <path d="M 230 240 L 480 240" stroke="#0284c7" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrowBlue)"/>
      <text x="240" y="235" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#0369a1">Flujo Avante</text>
    </g>

    <!-- Central Exhaust Space to Condenser -->
    <path d="M 490 265 L 490 390 L 610 390 L 610 265" fill="#f1f5f9" stroke="#94a3b8" stroke-dasharray="4 2"/>
    <path d="M 550 350 L 550 410" stroke="#64748b" stroke-width="4" marker-end="url(#arrowGray)"/>
    <text x="550" y="425" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#475569">Escape común a condensador</text>

    <!-- Deflector Plate preventing back-impingement -->
    <path d="M 515 200 Q 525 280 515 360" stroke="#334155" stroke-width="4" stroke-linecap="round"/>
    <text x="515" y="195" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="8.5" font-weight="700" fill="#475569">DEFLECTOR</text>

    <!-- 2. Astern Curtis Stage (Right side) -->
    <g id="astern-element" ${glow(focus, 'astern')}>
      <rect x="620" y="185" width="170" height="190" rx="8" fill="#ffedd5" opacity="0.3" stroke="${strokeCol(focus, 'astern', '#ea580c')}" stroke-width="${strokeW(focus, 'astern', 2)}"/>
      <text x="705" y="210" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#c2410c">RUEDA CURTIS CIAR</text>
      <!-- Curtis blading (two velocity stages) with reversed profile -->
      ${[655, 685, 730].map(x => `
        <rect x="${x}" y="225" width="14" height="40" rx="2" fill="#ea580c"/>
        <rect x="${x}" y="295" width="14" height="40" rx="2" fill="#ea580c"/>
      `).join('')}
      <!-- Astern Steam Flow arrow (in reverse direction) -->
      <path d="M 760 240 L 630 240" stroke="#ea580c" stroke-width="3" stroke-dasharray="6 3" marker-end="url(#arrowOrange)"/>
      <text x="760" y="235" text-anchor="end" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#c2410c">Vapor de Ciar</text>
    </g>

    <!-- 4. Controllable Pitch Propeller (CPP) Comparison Box -->
    <g id="astern-propeller" ${glow(focus, 'propeller')} transform="translate(60, 450)">
      <rect width="880" height="90" rx="10" fill="#ffffff" stroke="${isAct(focus, 'propeller') ? '#d97706' : '#cbd5e1'}" stroke-width="${isAct(focus, 'propeller') ? 3 : 1.5}" filter="url(#cardShadow)"/>
      <text x="24" y="25" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e293b">SOLUCIÓN PROPULSORA ALTERNATIVA: HÉLICE DE PASO CONTROLABLE (CPP)</text>
      <text x="24" y="46" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• Con hélice de paso fijo (FPP): Es imprescindible la rueda de marcha atrás (Curtis) para invertir el sentido de giro del eje.</text>
      <text x="24" y="64" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• Con hélice CPP: La turbina y el eje giran siempre en sentido constante avante; la maniobra de ciar se efectúa variando hidráulicamente el ángulo de las palas en el cubo de popa.</text>
      <text x="24" y="80" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• Ventajas de CPP en buque de turbina: Evita el choque térmico y sobreconsumo en caldera al invertir bruscamente la maniobra.</text>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 14. EXHAUST GAS HEAT RECOVERY (RECUPERACION) ====================
function drawHeatRecovery(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#64748b"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Escape motor diésel</text>
    <circle cx="190" cy="17" r="5" fill="#0284c7"/><text x="202" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Banco recuperador aleteado</text>
    <circle cx="410" cy="17" r="5" fill="#ea580c"/><text x="422" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Quemador auxiliar (mixta)</text>
    <circle cx="630" cy="17" r="5" fill="#e11d48"/><text x="642" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Domo / Colector de vapor</text>
    <circle cx="850" cy="17" r="5" fill="#d97706"/><text x="862" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco</text>
  `;

  const content = `
    <!-- 1. Engine Exhaust Gas Duct (Left) -->
    <g id="recup-engine" ${glow(focus, 'engine')}>
      <!-- Diesel Engine Block Base -->
      <rect x="70" y="380" width="160" height="90" rx="8" fill="#e2e8f0" stroke="#475569" stroke-width="2.5"/>
      <text x="150" y="420" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#334155">MOTOR PRINCIPAL</text>
      <text x="150" y="438" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" fill="#64748b">Diésel 2T / 4T Propulsor</text>

      <!-- Vertical Exhaust Duct to EGB -->
      <path d="M 150 380 L 150 120" stroke="#64748b" stroke-width="40" stroke-linecap="butt"/>
      <path d="M 150 370 L 150 130" stroke="#f1f5f9" stroke-width="32" stroke-linecap="butt"/>
      
      <!-- Exhaust gas flow arrows -->
      <path d="M 150 360 L 150 140" stroke="#ea580c" stroke-width="3" stroke-dasharray="6 4" marker-end="url(#arrowOrange)"/>
      <text x="150" y="260" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#ea580c" transform="rotate(-90 150 260)">GASES DE ESCAPE (280°C - 330°C)</text>

      <!-- Bypass damper -->
      <line x1="135" y1="330" x2="165" y2="310" stroke="#dc2626" stroke-width="4"/>
      <text x="180" y="325" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#dc2626">Válvula bypass</text>
    </g>

    <!-- 2. Exhaust Gas Boiler / Heat Exchanger Casing -->
    <g id="recup-exchanger" ${glow(focus, 'exchanger')}>
      <rect x="250" y="110" width="220" height="260" rx="12" fill="#f8fafc" stroke="${strokeCol(focus, 'exchanger', '#0284c7')}" stroke-width="${strokeW(focus, 'exchanger', 2.5)}" filter="url(#cardShadow)"/>
      <text x="360" y="135" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#0369a1">CALDERA DE RECUPERACIÓN (EGB)</text>
      
      <!-- Finned Tube Banks (Economizer and Evaporator) -->
      ${[160, 200, 240, 280, 320].map((y, idx) => `
        <path d="M 270 ${y} L 450 ${y}" stroke="#0284c7" stroke-width="4" stroke-linecap="round"/>
        ${Array.from({length: 8}).map((_, i) => `<line x1="${285 + i * 20}" y1="${y-7}" x2="${285 + i * 20}" y2="${y+7}" stroke="#0ea5e9" stroke-width="2"/>`).join('')}
      `).join('')}
      <text x="360" y="225" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0369a1" opacity="0.9">TUBOS DE ALETAS HELICOIDALES</text>
      <text x="360" y="355" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#0284c7">Aporte convectivo sin quemador</text>
    </g>

    <!-- 3. Auxiliary Fired Boiler / Burner Section (Composite) -->
    <g id="recup-burner" ${glow(focus, 'burner')}>
      <rect x="520" y="240" width="180" height="200" rx="12" fill="#fff7ed" stroke="${strokeCol(focus, 'burner', '#ea580c')}" stroke-width="${strokeW(focus, 'burner', 2.5)}" filter="url(#cardShadow)"/>
      <text x="610" y="265" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#c2410c">SECCIÓN AUXILIAR / QUEMADOR</text>
      
      <!---->
      <rect x="495" y="325" width="30" height="30" rx="4" fill="#334155"/>
      <path d="M 525 340 Q 560 320 600 340 Q 560 360 525 340 Z" fill="url(#furnaceGrad)" stroke="#ea580c" stroke-width="1.5"/>
      <text x="610" y="390" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" font-weight="600" fill="#9a3412">Combustión auxiliar en puerto</text>
      <text x="610" y="405" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#9a3412">o ante déficit de vapor en viaje</text>
    </g>

    <!---->
    <g id="recup-steam" ${glow(focus, 'steam')}>
      <!-- Drum -->
      <rect x="560" y="110" width="340" height="95" rx="20" fill="url(#drumGrad)" stroke="${strokeCol(focus, 'steam', '#e11d48')}" stroke-width="${strokeW(focus, 'steam', 2.5)}" filter="url(#cardShadow)"/>
      <text x="730" y="145" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="800" fill="#ffffff">DOMO SEPARADOR DE VAPOR</text>
      <text x="730" y="165" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="600" fill="#fecaca">Vapor de servicios generales (6 - 8 bar sat.)</text>

      <!-- Steam outlet pipe -->
      <path d="M 730 110 L 730 65 L 940 65" stroke="#e11d48" stroke-width="4" marker-end="url(#arrowRed)"/>
      <text x="850" y="55" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#e11d48">Hacia calefacción HFO y servicios</text>

      <!-- Forced circulation pump back to exchanger -->
      <circle cx="490" cy="410" r="18" fill="#ffffff" stroke="#0284c7" stroke-width="2.5"/>
      <path d="M 482 403 L 498 410 L 482 417 Z" fill="#0284c7"/>
      <text x="490" y="440" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#0369a1">BOMBA CIRCULACIÓN</text>
      <path d="M 600 205 L 600 410 L 510 410" stroke="#0284c7" stroke-width="2.5"/>
      <path d="M 472 410 L 360 410 L 360 370" stroke="#0284c7" stroke-width="2.5" marker-end="url(#arrowBlue)"/>
    </g>

    <!-- Bottom Technical Summary Card -->
    <g transform="translate(60, 485)">
      <rect width="880" height="70" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#cardShadow)"/>
      <text x="24" y="25" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e293b">BALANCE OPERATIVO DE RECUPERACIÓN TÉRMICA NAVAL</text>
      <text x="24" y="45" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• A velocidad de crucero (>70% MCR): Los gases del motor cubren el 100% de la demanda de vapor del buque sin quemar fuel.</text>
      <text x="24" y="61" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• En maniobra / puerto: La caldera auxiliar entra en automático para mantener la presión de la línea de servicios.</text>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 15. HEAT RECOVERY SURFACES (SUPERFICIES) ====================
function drawHeatSurfaces(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#e11d48"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Sobrecalentador (450-510°C)</text>
    <circle cx="230" cy="17" r="5" fill="#ea580c"/><text x="242" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Desobrecalentador / Atemperador</text>
    <circle cx="480" cy="17" r="5" fill="#0284c7"/><text x="492" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Economizador (200°C)</text>
    <circle cx="680" cy="17" r="5" fill="#10b981"/><text x="692" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Precalentador de aire (150°C)</text>
    <circle cx="890" cy="17" r="5" fill="#d97706"/><text x="902" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco</text>
  `;

  const content = `
    <!-- Boiler Gas Duct Cross Section -->
    <path d="M 80 440 L 80 120 L 520 120 L 520 440 Z" fill="#f8fafc" stroke="#334155" stroke-width="3"/>
    
    <!-- Gas flow vertical path arrow -->
    <path d="M 120 420 L 120 140" stroke="#f97316" stroke-width="3" stroke-dasharray="6 4" marker-end="url(#arrowOrange)"/>
    <text x="110" y="280" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#f97316" transform="rotate(-90 110 280)">TIRO DE GASES CONVECTIVOS</text>

    <!-- 1. Superheater (Sobrecalentador Primario + Secundario) -->
    <g id="surf-superheater" ${glow(focus, 'superheater')}>
      <rect x="150" y="330" width="340" height="85" rx="8" fill="#fee2e2" stroke="${strokeCol(focus, 'superheater', '#e11d48')}" stroke-width="${strokeW(focus, 'superheater', 2.5)}"/>
      ${[0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300].map(x => `
        <line x1="${170 + x}" y1="340" x2="${170 + x}" y2="405" stroke="#e11d48" stroke-width="3"/>
      `).join('')}
      <text x="320" y="320" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#e11d48">SOBRECALENTADOR (ZONA DE ALTA TEMPERATURA ~800°C GASES)</text>
      <text x="320" y="375" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#991b1b">Vapor saturado -> Vapor sobrecalentado (450°C - 510°C)</text>
    </g>

    <!-- 3. Economizer (Economizador de agua de alimentación) -->
    <g id="surf-economizer" ${glow(focus, 'economizer')}>
      <rect x="150" y="225" width="340" height="75" rx="8" fill="#e0f2fe" stroke="${strokeCol(focus, 'economizer', '#0284c7')}" stroke-width="${strokeW(focus, 'economizer', 2.5)}"/>
      ${[0, 25, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300].map(x => `
        <line x1="${170 + x}" y1="235" x2="${170 + x}" y2="290" stroke="#0284c7" stroke-width="2.5"/>
        <line x1="${166 + x}" y1="262" x2="${174 + x}" y2="262" stroke="#0ea5e9" stroke-width="2"/>
      `).join('')}
      <text x="320" y="215" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#0369a1">ECONOMIZADOR (ZONA MEDIA ~400°C GASES)</text>
      <text x="320" y="265" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#075985">Agua alimentación: 130°C entra -> 210°C sale hacia el domo</text>
    </g>

    <!-- 4. Air Preheater (Precalentador de aire de combustión) -->
    <g id="surf-airheater" ${glow(focus, 'airheater')}>
      <rect x="150" y="130" width="340" height="65" rx="8" fill="#d1fae5" stroke="${strokeCol(focus, 'airheater', '#10b981')}" stroke-width="${strokeW(focus, 'airheater', 2.5)}"/>
      ${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300].map(x => `
        <line x1="${170 + x}" y1="138" x2="${170 + x}" y2="188" stroke="#10b981" stroke-width="2"/>
      `).join('')}
      <text x="320" y="120" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#065f46">PRECALENTADOR DE AIRE (ZONA BAJA ~240°C -> 140°C A CHIMENEA)</text>
      <text x="320" y="165" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#047857">Aire forzado comburente entra a 30°C -> calienta a 160°C (+rendimiento)</text>
    </g>

    <!-- Sootblowers icons on gas duct -->
    <g transform="translate(495, 230)">
      <circle cx="12" cy="12" r="8" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
      <path d="M 4 12 L -20 12" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2 2"/>
      <text x="30" y="16" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#92400e">SOPLADOR DE HOLLÍN</text>
    </g>
    <g transform="translate(495, 340)">
      <circle cx="12" cy="12" r="8" fill="#f59e0b" stroke="#78350f" stroke-width="1.5"/>
      <path d="M 4 12 L -20 12" stroke="#f59e0b" stroke-width="2" stroke-dasharray="2 2"/>
      <text x="30" y="16" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#92400e">SOPLADOR DE HOLLÍN</text>
    </g>

    <!-- 2. Attemperator / Desuperheater Diagram (Right Side) -->
    <g id="surf-reheater" ${glow(focus, 'reheater')} transform="translate(580, 140)">
      <rect width="360" height="280" rx="12" fill="#fff7ed" stroke="${strokeCol(focus, 'reheater', '#ea580c')}" stroke-width="${strokeW(focus, 'reheater', 2.5)}" filter="url(#cardShadow)"/>
      <text x="180" y="30" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#c2410c">DESOBRECALENTADOR / ATEMPERADOR</text>
      
      <!-- Attemperator Body -->
      <rect x="40" y="60" width="280" height="40" rx="6" fill="#fed7aa" stroke="#ea580c" stroke-width="2"/>
      <path d="M 20 80 L 340 80" stroke="#ea580c" stroke-width="3" marker-end="url(#arrowOrange)"/>
      <text x="50" y="75" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#9a3412">Vapor SH 500°C</text>
      <text x="310" y="75" text-anchor="end" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#9a3412">Vapor regulado</text>

      <!-- Spray water injection -->
      <path d="M 180 20 L 180 60" stroke="#0284c7" stroke-width="4" marker-end="url(#arrowBlue)"/>
      <text x="180" y="15" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" font-weight="700" fill="#0369a1">Inyección agua pura desmineralizada</text>
      <circle cx="180" cy="70" r="10" fill="#38bdf8" opacity="0.6"/>

      <!-- Explanation -->
      <g transform="translate(20, 130)">
        <text x="0" y="0" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" font-weight="700" fill="#1e293b">FUNCIÓN TÉCNICA:</text>
        <text x="0" y="20" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#475569">• Control fino de temperatura de vapor sobrecalentado.</text>
        <text x="0" y="38" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#475569">• Evita sobrecalentamiento excesivo de los álabes de turbina HP.</text>
        <text x="0" y="56" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#475569">• Provee vapor a menor temperatura para servicios auxiliares.</text>
      </g>
    </g>

    <!-- Bottom Step Comparison Card -->
    <g transform="translate(60, 460)">
      <rect width="880" height="90" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#cardShadow)"/>
      <text x="24" y="24" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e293b">ORDEN TÉRMICO DE RECUPERACIÓN EN EL TIRO DE GASES</text>
      <text x="24" y="44" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">1. Sobrecalentador: Máxima entalpía disponible tras los tubos de pantalla (800°C -> 450°C).</text>
      <text x="24" y="60" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">2. Economizador: Recupera calor residual precalentando el agua antes de que entre al domo de vapor (400°C -> 240°C).</text>
      <text x="24" y="76" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">3. Precalentador de aire: Extrae los últimos kJ útiles antes de la chimenea (240°C -> 140°C), superando el 88-90% de eficiencia.</text>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

// ==================== 16. COMBUSTION SYSTEM (COMBUSTION) ====================
function drawCombustionSystem(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/><text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Aire de tiro forzado (Windbox)</text>
    <circle cx="230" cy="17" r="5" fill="#7c3aed"/><text x="242" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Lanza / Tobera atomizadora</text>
    <circle cx="450" cy="17" r="5" fill="#ea580c"/><text x="462" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Llama y cono de combustión</text>
    <circle cx="670" cy="17" r="5" fill="#e11d48"/><text x="682" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Supervisión UV y protecciones</text>
    <circle cx="890" cy="17" r="5" fill="#d97706"/><text x="902" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Foco</text>
  `;

  const content = `
    <!---->
    <rect x="80" y="140" width="300" height="280" rx="12" fill="#f8fafc" stroke="#334155" stroke-width="3"/>
    <text x="230" y="165" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#334155">CAJA DE VIENTO (WINDBOX)</text>
    
    <!---->
    <g id="comb-air" ${glow(focus, 'air')}>
      <!-- Air Duct Inlet -->
      <path d="M 230 90 L 230 140" stroke="#0284c7" stroke-width="40" stroke-linecap="butt"/>
      <path d="M 230 90 L 230 140" stroke="#e0f2fe" stroke-width="32" stroke-linecap="butt"/>
      <path d="M 230 95 L 230 135" stroke="#0284c7" stroke-width="3" stroke-dasharray="5 3" marker-end="url(#arrowBlue)"/>
      <text x="230" y="80" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0369a1">AIRE FORZADO (FD FAN)</text>

      <!-- Air Swirler / Register Vanes -->
      <rect x="290" y="220" width="40" height="120" rx="4" fill="#bae6fd" stroke="${strokeCol(focus, 'air', '#0284c7')}" stroke-width="${strokeW(focus, 'air', 2)}"/>
      ${[230, 250, 270, 290, 310, 330].map(y => `
        <line x1="295" y1="${y}" x2="325" y2="${y-10}" stroke="#0369a1" stroke-width="2.5"/>
      `).join('')}
      <text x="310" y="210" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#0369a1">SWIRLER / DIFUSOR</text>
    </g>

    <!-- Refractory Quarl / Burner Throat -->
    <path d="M 380 200 L 440 220 L 440 340 L 380 360 Z" fill="#fed7aa" stroke="#ea580c" stroke-width="2.5"/>
    <text x="410" y="285" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="800" fill="#9a3412" transform="rotate(-90 410 285)">QUARL REFRACTARIO</text>

    <!---->
    <g id="comb-nozzle" ${glow(focus, 'nozzle')}>
      <!-- Central Fuel Lance -->
      <rect x="50" y="270" width="370" height="20" rx="3" fill="#6d28d9" stroke="${strokeCol(focus, 'nozzle', '#7c3aed')}" stroke-width="${strokeW(focus, 'nozzle', 2)}"/>
      <!-- Fuel Oil Supply Pipe -->
      <path d="M 50 350 L 50 280" stroke="#7c3aed" stroke-width="5" marker-end="url(#arrowBlue)"/>
      <text x="50" y="370" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" font-weight="700" fill="#6d28d9">FUEL OIL (20-30 bar)</text>
      
      <!-- Quick closing shutoff trip valve -->
      <polygon points="40,310 60,310 50,325" fill="#dc2626"/>
      <polygon points="40,340 60,340 50,325" fill="#dc2626"/>
      <text x="68" y="330" font-family="'DM Sans', system-ui, sans-serif" font-size="8.5" font-weight="700" fill="#dc2626">VÁLVULA DISPARO</text>

      <!-- Atomizer tip -->
      <polygon points="420,270 435,280 420,290" fill="#5b21b6" stroke="#4c1d95" stroke-width="1.5"/>
      <text x="410" y="260" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#7c3aed">TOBERA ATOMIZADORA</text>
    </g>

    <!---->
    <g id="comb-flame" ${glow(focus, 'flame')}>
      <!-- Furnace Boundary -->
      <rect x="440" y="140" width="480" height="280" rx="12" fill="#fffbeb" stroke="#f59e0b" stroke-width="2.5"/>
      <text x="680" y="165" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#b45309">HOGAR DE LA CALDERA (COMBUSTIÓN)</text>
      
      <!-- Flame Cone -->
      <path d="M 435 280 Q 560 210 750 240 Q 860 280 750 320 Q 560 350 435 280 Z" fill="url(#furnaceGrad)" stroke="${strokeCol(focus, 'flame', '#ea580c')}" stroke-width="${strokeW(focus, 'flame', 3)}" filter="url(#cardShadow)"/>
      <!-- Inner hot core -->
      <path d="M 440 280 Q 530 240 660 260 Q 720 280 660 300 Q 530 320 440 280 Z" fill="#fef08a" opacity="0.85"/>
      <text x="610" y="285" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="800" fill="#9a3412">CONO DE LLAMA ESTABLE</text>
      <text x="610" y="302" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9.5" font-weight="600" fill="#c2410c">Color amarillo dorado · 10-15% exceso aire</text>
    </g>

    <!---->
    <g id="comb-exhaust" ${glow(focus, 'exhaust')}>
      <!-- Flame Detector (UV Scanner) -->
      <rect x="360" y="170" width="35" height="18" rx="3" fill="#1e293b"/>
      <path d="M 395 179 L 550 250" stroke="#e11d48" stroke-width="2" stroke-dasharray="4 2" marker-end="url(#arrowRed)"/>
      <text x="350" y="160" text-anchor="end" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#e11d48">FOTOCÉLULA UV</text>
      <text x="350" y="173" text-anchor="end" font-family="'DM Sans', system-ui, sans-serif" font-size="8.5" fill="#be123c">Supervisión de llama</text>

      <!-- Protection Box (Trip on flame failure) -->
      <rect x="740" y="340" width="165" height="65" rx="8" fill="#fef2f2" stroke="${strokeCol(focus, 'exhaust', '#e11d48')}" stroke-width="1.5"/>
      <text x="822" y="360" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#991b1b">PROTECCIONES DE DISPARO</text>
      <text x="822" y="378" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#7f1d1d">• Fallo de llama: corte &lt; 4 seg.</text>
      <text x="822" y="392" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#7f1d1d">• Caída de tiro o baja P combustible</text>
    </g>

    <!-- Bottom Combustion Diagnostics Card -->
    <g transform="translate(60, 460)">
      <rect width="880" height="90" rx="10" fill="#ffffff" stroke="#cbd5e1" stroke-width="1.5" filter="url(#cardShadow)"/>
      <text x="24" y="24" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#1e293b">DIAGNÓSTICO VISUAL Y OPERATIVO DE COMBUSTIÓN NAVAL</text>
      <text x="24" y="44" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• Llama óptima: Cono luminoso suspendido en el quarl sin chocar contra paredes refractarias ni tubos; humos claros casi invisibles.</text>
      <text x="24" y="60" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• Humo negro: Defecto de aire o mala atomización (gotas grandes por baja presión/temperatura de combustible o tobera sucia).</text>
      <text x="24" y="76" font-family="'DM Sans', system-ui, sans-serif" font-size="10.5" fill="#475569">• Humo blanco: Exceso severo de aire (enfría la llama e incrementa pérdidas térmicas) o presencia de agua en el fuel oil.</text>
    </g>
  `;

  return wrapSVG({
    title: m.title,
    subtitle: `Paso ${stepIndex + 1} de 4 · ${step.title}`,
    activeLabel: step.title,
    activeKey: focus,
    legend,
    content
  });
}

module.exports = {
  drawStates,
  drawTS,
  drawComparison,
  drawWall,
  drawValves,
  drawTurbine,
  drawTriangle,
  drawSequence,
  drawSafety,
  drawDeaerator,
  drawCondenser,
  drawTurbineMechanics,
  drawAsternTurbine,
  drawHeatRecovery,
  drawHeatSurfaces,
  drawCombustionSystem
};
