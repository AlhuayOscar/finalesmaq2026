const { wrapSVG, isAct, strokeCol, fillCol, strokeW, glow } = require('./svg-helpers.cjs');

// ==================== 1. BOILER (CIRCULACION, DOMOS, PURGAS-NIVEL, AVERIAS-CALDERA) ====================
function drawBoiler(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/>
    <text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Agua líquida / Descendentes</text>
    <circle cx="215" cy="17" r="5" fill="#ea580c"/>
    <text x="227" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Mezcla ascendente (Hervidores)</text>
    <circle cx="430" cy="17" r="5" fill="#e11d48"/>
    <text x="442" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Vapor saturado</text>
    <circle cx="560" cy="17" r="5" fill="#d97706"/>
    <text x="572" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Componente activo del paso</text>
  `;

  const content = `
  <!-- Hogar de combustión -->
  <g id="furnace-group" ${glow(focus, 'furnace')}>
    <rect x="50" y="200" width="220" height="180" rx="14" fill="${fillCol(focus, 'furnace', 'url(#furnaceGrad)')}" stroke="${strokeCol(focus, 'furnace', '#fdba74')}" stroke-width="${strokeW(focus, 'furnace', 2)}"/>
    <text x="70" y="232" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" fill="#9a3412">HOGAR (COMBUSTIÓN)</text>
    <text x="70" y="250" font-family="'DM Sans', system-ui, sans-serif" font-size="12" fill="#c2410c">Calor radiante hacia tubos</text>
    <!-- Llama -->
    <path d="M 160 340 C 130 340 115 310 135 280 C 145 265 160 260 160 250 C 165 265 180 280 185 295 C 195 320 185 340 160 340 Z" fill="#f97316"/>
    <path d="M 160 340 C 145 340 135 325 145 305 C 150 295 160 290 160 280 C 165 290 170 300 175 310 C 180 325 175 340 160 340 Z" fill="#facc15"/>
    <!-- Flechas de calor radiante -->
    <g stroke="#ea580c" stroke-width="2.5" fill="none">
      <path d="M 240 260 Q 280 250 330 255" marker-end="url(#arrowOrange)"/>
      <path d="M 250 295 L 330 295" marker-end="url(#arrowOrange)"/>
      <path d="M 240 330 Q 280 340 330 335" marker-end="url(#arrowOrange)"/>
    </g>
    <text x="250" y="285" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#ea580c">Gases calientes</text>
  </g>

  <!-- Tubos descendentes (Downcomers) -->
  <g id="downcomers-group" ${glow(focus, 'down')}>
    <path d="M 390 175 L 350 175 L 350 445 L 430 445" fill="none" stroke="${strokeCol(focus, 'down', '#0284c7')}" stroke-width="${strokeW(focus, 'down', 6, 8)}" stroke-linejoin="round"/>
    <path d="M 350 280 L 350 320" fill="none" stroke="${strokeCol(focus, 'down', '#0284c7')}" stroke-width="${strokeW(focus, 'down', 6, 8)}" marker-end="url(#${isAct(focus, 'down') ? 'arrowActive' : 'arrowBlue'})"/>
    <rect x="275" y="340" width="145" height="34" rx="6" fill="#f0f9ff" stroke="${strokeCol(focus, 'down', '#bae6fd')}" stroke-width="1.5" filter="url(#cardShadow)"/>
    <text x="283" y="354" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0369a1">TUBOS DESCENDENTES</text>
    <text x="283" y="367" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#0284c7">Agua más densa (no calentada)</text>
  </g>

  <!-- Haces generadores / Hervidores (Risers) -->
  <g id="risers-group" ${glow(focus, 'risers')}>
    ${[-40, -15, 10, 35, 60].map((dx, i) => `
      <line x1="${510 + dx}" y1="410" x2="${510 + dx}" y2="175" stroke="${strokeCol(focus, 'risers', '#ea580c')}" stroke-width="${strokeW(focus, 'risers', 3.5, 5)}" stroke-linecap="round"/>
      ${i === 2 ? `<path d="M ${510 + dx} 330 L ${510 + dx} 250" fill="none" stroke="${strokeCol(focus, 'risers', '#ea580c')}" stroke-width="3" marker-end="url(#${isAct(focus, 'risers') ? 'arrowActive' : 'arrowOrange'})"/>` : ''}
    `).join('')}
    <!-- Burbujas de vapor -->
    <circle cx="470" cy="350" r="3.5" fill="#ffffff" stroke="#ea580c" stroke-width="1.5"/>
    <circle cx="470" cy="270" r="4" fill="#ffffff" stroke="#ea580c" stroke-width="1.5"/>
    <circle cx="520" cy="320" r="3.5" fill="#ffffff" stroke="#ea580c" stroke-width="1.5"/>
    <circle cx="545" cy="240" r="4" fill="#ffffff" stroke="#ea580c" stroke-width="1.5"/>
    <circle cx="570" cy="290" r="3.5" fill="#ffffff" stroke="#ea580c" stroke-width="1.5"/>
    <rect x="585" y="270" width="145" height="44" rx="6" fill="#fff7ed" stroke="${strokeCol(focus, 'risers', '#fed7aa')}" stroke-width="1.5" filter="url(#cardShadow)"/>
    <text x="593" y="286" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#9a3412">HACES GENERADORES</text>
    <text x="593" y="299" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#c2410c">Mezcla agua-vapor ascendente</text>
    <text x="593" y="309" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="600" fill="#ea580c">Menor densidad térmica</text>
  </g>

  <!-- Colector inferior (Mud drum) -->
  <g id="lower-drum-group" ${glow(focus, 'lower')}>
    <rect x="430" y="410" width="180" height="70" rx="20" fill="${fillCol(focus, 'lower', 'url(#mudGrad)')}" stroke="${strokeCol(focus, 'lower', '#0284c7')}" stroke-width="${strokeW(focus, 'lower', 2.5)}"/>
    <text x="520" y="442" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" fill="#0c4a6e">COLECTOR INFERIOR</text>
    <text x="520" y="459" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#0369a1">Distribución a tubos / Fango</text>
    <!-- Purga de fondo -->
    <path d="M 520 480 L 520 540 L 610 540" fill="none" stroke="${strokeCol(focus, 'lower', '#0284c7')}" stroke-width="3" marker-end="url(#arrowBlue)"/>
    <polygon points="513,502 527,502 520,510" fill="#0284c7"/>
    <polygon points="513,518 527,518 520,510" fill="#0284c7"/>
    <text x="620" y="544" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#0369a1">Extracción de fondo (purga de lodos)</text>
  </g>

  <!-- Domo superior (Steam drum) -->
  <g id="upper-drum-group" ${glow(focus, 'upper')}>
    <rect x="380" y="95" width="280" height="80" rx="24" fill="${fillCol(focus, 'upper', 'url(#drumGrad)')}" stroke="${strokeCol(focus, 'upper', '#0284c7')}" stroke-width="${strokeW(focus, 'upper', 2.5)}"/>
    <!-- Línea divisoria de agua/vapor -->
    <path d="M 382 138 Q 440 136 500 138 T 618 138 L 658 138" stroke="#0284c7" stroke-width="1.5" stroke-dasharray="4 3" fill="none"/>
    <text x="520" y="118" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" letter-spacing="1" fill="#be123c">ESPACIO DE VAPOR</text>
    <text x="520" y="133" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" fill="#0c4a6e">DOMO SUPERIOR</text>
    <text x="520" y="157" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#0369a1">Nivel de agua / Separación de gotas</text>
    <!-- Separadores internos / secadores -->
    <path d="M 490 102 L 500 108 L 510 102 L 520 108 L 530 102" stroke="#e11d48" stroke-width="2" fill="none"/>
    <!-- Purga de superficie / continua -->
    <path d="M 440 142 L 440 162 L 405 162" fill="none" stroke="#0284c7" stroke-width="2"/>
    <text x="310" y="155" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="600" fill="#0369a1">Purga continua →</text>
  </g>

  <!-- Salida de vapor saturado -->
  <g id="outlet-group" ${glow(focus, 'outlet')}>
    <path d="M 590 95 L 590 75 L 820 75" fill="none" stroke="${strokeCol(focus, 'outlet', '#e11d48')}" stroke-width="${strokeW(focus, 'outlet', 3.5, 5)}" marker-end="url(#${isAct(focus, 'outlet') ? 'arrowActive' : 'arrowRed'})"/>
    <polygon points="685,68 685,82 693,75" fill="#e11d48"/>
    <polygon points="701,68 701,82 693,75" fill="#e11d48"/>
    <rect x="715" y="55" width="165" height="36" rx="6" fill="#fff1f2" stroke="${strokeCol(focus, 'outlet', '#fecdd3')}" stroke-width="1.5" filter="url(#cardShadow)"/>
    <text x="725" y="70" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#9f1239">SALIDA VAPOR SATURADO</text>
    <text x="725" y="83" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#be123c">Hacia sobrecalentador / consumo</text>
  </g>

  <!-- Entrada de agua de alimentación -->
  <g id="feed-group" ${glow(focus, 'feed')}>
    <path d="M 870 160 L 660 160" fill="none" stroke="${strokeCol(focus, 'feed', '#0284c7')}" stroke-width="${strokeW(focus, 'feed', 3.5, 5)}" marker-end="url(#${isAct(focus, 'feed') ? 'arrowActive' : 'arrowBlue'})"/>
    <polygon points="785,153 785,167 775,160" fill="#0284c7"/>
    <line x1="775" y1="153" x2="775" y2="167" stroke="#0284c7" stroke-width="2"/>
    <rect x="735" y="172" width="160" height="34" rx="6" fill="#f0f9ff" stroke="${strokeCol(focus, 'feed', '#bae6fd')}" stroke-width="1.5" filter="url(#cardShadow)"/>
    <text x="745" y="186" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0369a1">AGUA DE ALIMENTACIÓN</text>
    <text x="745" y="198" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#0284c7">Ingreso al seno del agua</text>
  </g>

  <!-- Indicador de nivel (Visor reflex) -->
  <g id="level-group" ${glow(focus, 'level')}>
    <!-- Tomas superior (vapor) e inferior (agua) con ángulo limpio -->
    <path d="M 640 115 L 755 115 L 755 240" fill="none" stroke="${strokeCol(focus, 'level', '#e11d48')}" stroke-width="2"/>
    <path d="M 640 162 L 725 162 L 725 320 L 755 320" fill="none" stroke="${strokeCol(focus, 'level', '#0284c7')}" stroke-width="2"/>
    <circle cx="755" cy="235" r="4" fill="#0f2922"/>
    <circle cx="755" cy="325" r="4" fill="#0f2922"/>

    <!-- Columna de vidrio reflex -->
    <rect x="745" y="240" width="20" height="80" rx="4" fill="#f8fafc" stroke="${strokeCol(focus, 'level', '#64748b')}" stroke-width="2"/>
    <rect x="747" y="275" width="16" height="43" fill="#bae6fd"/>
    <line x1="743" y1="275" x2="767" y2="275" stroke="#0284c7" stroke-width="2"/>
    <text x="771" y="278" font-family="'DM Sans', system-ui, sans-serif" font-size="9" font-weight="700" fill="#0369a1">NWL (Nivel Normal)</text>

    <!-- Tarjeta de etiqueta -->
    <rect x="775" y="295" width="155" height="42" rx="6" fill="#f1f5f9" stroke="${strokeCol(focus, 'level', '#cbd5e1')}" stroke-width="1.5" filter="url(#cardShadow)"/>
    <text x="785" y="312" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#334155">INDICADOR DE NIVEL</text>
    <text x="785" y="325" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#64748b">Columnas de vapor y agua</text>
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

// ==================== 2. TIPO D ====================
function drawBoilerD(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/>
    <text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Descendentes y colectores</text>
    <circle cx="220" cy="17" r="5" fill="#ea580c"/>
    <text x="232" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Haces generadores y paredes</text>
    <circle cx="430" cy="17" r="5" fill="#e11d48"/>
    <text x="442" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Sobrecalentador en U</text>
    <circle cx="610" cy="17" r="5" fill="#d97706"/>
    <text x="622" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Componente activo del paso</text>
  `;

  const content = `
  <!-- Domo superior (top right) -->
  <g id="domo-d" ${glow(focus, 'upper')}>
    <rect x="520" y="100" width="220" height="70" rx="20" fill="${fillCol(focus, 'upper', 'url(#drumGrad)')}" stroke="${strokeCol(focus, 'upper', '#0284c7')}" stroke-width="${strokeW(focus, 'upper', 2.5)}"/>
    <text x="630" y="132" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#0c4a6e">DOMO SUPERIOR (VAPOR)</text>
    <text x="630" y="148" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#0369a1">Separación y acumulación</text>
  </g>

  <!-- Colector inferior (bottom right) -->
  <g id="colector-d" ${glow(focus, 'upper')}>
    <rect x="540" y="440" width="180" height="60" rx="18" fill="${fillCol(focus, 'upper', 'url(#mudGrad)')}" stroke="${strokeCol(focus, 'upper', '#0284c7')}" stroke-width="${strokeW(focus, 'upper', 2.5)}"/>
    <text x="630" y="468" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#0c4a6e">COLECTOR INFERIOR</text>
    <text x="630" y="484" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#0369a1">Fango y distribución</text>
  </g>

  <!-- Cabezal inferior pared de agua (bottom left) -->
  <g id="header-d" ${glow(focus, 'down')}>
    <rect x="130" y="450" width="120" height="45" rx="12" fill="${fillCol(focus, 'down', '#e0f2fe')}" stroke="${strokeCol(focus, 'down', '#0284c7')}" stroke-width="${strokeW(focus, 'down', 2)}"/>
    <text x="190" y="474" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0369a1">CABEZAL DE PARED</text>
    <text x="190" y="486" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#0284c7">Alimentación lateral</text>
  </g>

  <!-- Tubos descendentes (Downcomers) exteriores -->
  <g id="downcomers-d" ${glow(focus, 'down')}>
    <!-- Tubo hacia colector inferior -->
    <path d="M 720 160 L 760 160 L 760 460 L 720 460" fill="none" stroke="${strokeCol(focus, 'down', '#0284c7')}" stroke-width="${strokeW(focus, 'down', 5, 7)}"/>
    <!-- Tubo del piso hacia cabezal de pared -->
    <path d="M 540 470 L 250 470" fill="none" stroke="${strokeCol(focus, 'down', '#0284c7')}" stroke-width="${strokeW(focus, 'down', 4, 6)}" marker-end="url(#arrowBlue)"/>
    <text x="770" y="310" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0369a1">DESCENDENTES (FRÍOS)</text>
  </g>

  <!-- Haces generadores principales (entre domo y colector inferior) -->
  <g id="main-bank-d" ${glow(focus, 'risers')}>
    ${[0, 15, 30, 45, 60].map(dx => `
      <line x1="${590 + dx}" y1="170" x2="${590 + dx}" y2="440" stroke="${strokeCol(focus, 'risers', '#ea580c')}" stroke-width="${strokeW(focus, 'risers', 3, 5)}"/>
    `).join('')}
    <text x="665" y="320" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#9a3412">HAZ GENERADOR</text>
    <text x="665" y="333" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#c2410c">Convección principal</text>
  </g>

  <!-- Pared de agua (Waterwall en forma de D) -->
  <g id="waterwall-d" ${glow(focus, 'risers')}>
    <!-- Sube desde cabezal, hace techo y entra al domo -->
    <path d="M 150 450 L 150 135 L 520 135" fill="none" stroke="${strokeCol(focus, 'risers', '#ea580c')}" stroke-width="${strokeW(focus, 'risers', 4, 6)}" stroke-linejoin="round"/>
    <path d="M 170 450 L 170 150 L 520 150" fill="none" stroke="${strokeCol(focus, 'risers', '#ea580c')}" stroke-width="${strokeW(focus, 'risers', 3, 5)}" stroke-linejoin="round"/>
    <!-- Pantalla de agua frente al haz -->
    <line x1="490" y1="170" x2="490" y2="440" stroke="${strokeCol(focus, 'risers', '#ea580c')}" stroke-width="${strokeW(focus, 'risers', 4, 6)}"/>
    <line x1="510" y1="170" x2="510" y2="440" stroke="${strokeCol(focus, 'risers', '#ea580c')}" stroke-width="${strokeW(focus, 'risers', 3, 5)}"/>
    <rect x="75" y="270" width="135" height="42" rx="6" fill="#fff7ed" stroke="${strokeCol(focus, 'risers', '#fed7aa')}" stroke-width="1.5" filter="url(#cardShadow)"/>
    <text x="83" y="287" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#9a3412">PARED DE AGUA</text>
    <text x="83" y="300" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#c2410c">Protección y radiación</text>
  </g>

  <!-- Hogar y Quemador -->
  <g id="furnace-d" ${glow(focus, 'furnace')}>
    <rect x="210" y="200" width="240" height="200" rx="12" fill="${fillCol(focus, 'furnace', 'url(#furnaceGrad)')}" stroke="${strokeCol(focus, 'furnace', '#fed7aa')}" stroke-width="2"/>
    <text x="230" y="225" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#9a3412">HOGAR (CALDERA D)</text>
    <text x="230" y="240" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#c2410c">Disposición asimétrica</text>
    <!-- Llama -->
    <path d="M 330 350 C 300 350 285 320 305 290 C 315 275 330 270 330 260 C 335 275 350 290 355 305 C 365 330 355 350 330 350 Z" fill="#f97316"/>
    <path d="M 330 350 C 315 350 305 335 315 315 C 320 305 330 300 330 290 C 335 300 340 310 345 320 C 350 335 345 350 330 350 Z" fill="#facc15"/>
  </g>

  <!-- Sobrecalentador en U entre pantalla y haz generador -->
  <g id="superheater-d" ${glow(focus, 'furnace')}>
    <path d="M 535 220 L 565 220 L 565 380 L 535 380" fill="none" stroke="#e11d48" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M 545 240 L 555 240 L 555 360 L 545 360" fill="none" stroke="#e11d48" stroke-width="3" stroke-linejoin="round"/>
    <rect x="475" y="390" width="130" height="34" rx="6" fill="#fff1f2" stroke="#fecdd3" stroke-width="1.5" filter="url(#cardShadow)"/>
    <text x="483" y="404" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#9f1239">SOBRECALENTADOR</text>
    <text x="483" y="416" font-family="'DM Sans', system-ui, sans-serif" font-size="9" fill="#be123c">Tubos en U protegidos</text>
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

// ==================== 3. TIPO A ====================
function drawBoilerA(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/>
    <text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">1 domo sup. + 2 colectores inf.</text>
    <circle cx="250" cy="17" r="5" fill="#ea580c"/>
    <text x="262" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Dos haces simétricos en A</text>
    <circle cx="480" cy="17" r="5" fill="#d97706"/>
    <text x="492" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Componente activo del paso</text>
  `;

  const content = `
  <!-- Domo superior central -->
  <g id="domo-a" ${glow(focus, 'upper')}>
    <rect x="380" y="95" width="240" height="70" rx="20" fill="${fillCol(focus, 'upper', 'url(#drumGrad)')}" stroke="${strokeCol(focus, 'upper', '#0284c7')}" stroke-width="${strokeW(focus, 'upper', 2.5)}"/>
    <text x="500" y="126" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" fill="#0c4a6e">DOMO SUPERIOR (CENTRAL)</text>
    <text x="500" y="142" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#0369a1">Separación de vapor y agua</text>
  </g>

  <!-- Colector inferior izquierdo -->
  <g id="colector-a-izq" ${glow(focus, 'upper')}>
    <rect x="130" y="440" width="180" height="60" rx="18" fill="${fillCol(focus, 'upper', 'url(#mudGrad)')}" stroke="${strokeCol(focus, 'upper', '#0284c7')}" stroke-width="${strokeW(focus, 'upper', 2.5)}"/>
    <text x="220" y="468" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#0c4a6e">COLECTOR LATERAL IZQ.</text>
    <text x="220" y="484" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#0369a1">Alimentación haz izq.</text>
  </g>

  <!-- Colector inferior derecho -->
  <g id="colector-a-der" ${glow(focus, 'upper')}>
    <rect x="690" y="440" width="180" height="60" rx="18" fill="${fillCol(focus, 'upper', 'url(#mudGrad)')}" stroke="${strokeCol(focus, 'upper', '#0284c7')}" stroke-width="${strokeW(focus, 'upper', 2.5)}"/>
    <text x="780" y="468" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#0c4a6e">COLECTOR LATERAL DER.</text>
    <text x="780" y="484" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#0369a1">Alimentación haz der.</text>
  </g>

  <!-- Tubos descendentes (Downcomers) hacia ambos lados -->
  <g id="downcomers-a" ${glow(focus, 'down')}>
    <path d="M 400 160 L 100 160 L 100 460 L 130 460" fill="none" stroke="${strokeCol(focus, 'down', '#0284c7')}" stroke-width="${strokeW(focus, 'down', 5, 7)}" stroke-linejoin="round"/>
    <path d="M 600 160 L 900 160 L 900 460 L 870 460" fill="none" stroke="${strokeCol(focus, 'down', '#0284c7')}" stroke-width="${strokeW(focus, 'down', 5, 7)}" stroke-linejoin="round"/>
    <text x="60" y="310" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0369a1">DESCENDENTE IZQ.</text>
    <text x="830" y="310" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#0369a1">DESCENDENTE DER.</text>
  </g>

  <!-- Haces generadores simétricos formando la A -->
  <g id="risers-a" ${glow(focus, 'risers')}>
    <!-- Haz izquierdo -->
    ${[0, 15, 30, 45].map(d => `
      <line x1="${200 + d}" y1="440" x2="${420 + d*0.7}" y2="165" stroke="${strokeCol(focus, 'risers', '#ea580c')}" stroke-width="${strokeW(focus, 'risers', 3.5, 5)}" stroke-linecap="round"/>
    `).join('')}
    <!-- Haz derecho -->
    ${[0, 15, 30, 45].map(d => `
      <line x1="${750 + d}" y1="440" x2="${530 + d*0.7}" y2="165" stroke="${strokeCol(focus, 'risers', '#ea580c')}" stroke-width="${strokeW(focus, 'risers', 3.5, 5)}" stroke-linecap="round"/>
    `).join('')}
  </g>

  <!-- Hogar central en la V invertida -->
  <g id="furnace-a" ${glow(focus, 'furnace')}>
    <rect x="370" y="240" width="260" height="190" rx="14" fill="${fillCol(focus, 'furnace', 'url(#furnaceGrad)')}" stroke="${strokeCol(focus, 'furnace', '#fed7aa')}" stroke-width="2"/>
    <text x="500" y="268" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" fill="#9a3412">HOGAR CENTRAL</text>
    <text x="500" y="284" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#c2410c">Gases divididos hacia ambos haces</text>
    <!-- Llama central -->
    <path d="M 500 380 C 470 380 455 350 475 320 C 485 305 500 300 500 290 C 505 305 520 320 525 335 C 535 360 525 380 500 380 Z" fill="#f97316"/>
    <path d="M 500 380 C 485 380 475 365 485 345 C 490 335 500 330 500 320 C 505 330 510 340 515 350 C 520 365 515 380 500 380 Z" fill="#facc15"/>
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

// ==================== 4. TIPO M ====================
function drawBoilerM(m, stepIndex) {
  const step = m.steps[stepIndex];
  const focus = step.focus;

  const legend = `
    <circle cx="20" cy="17" r="5" fill="#0284c7"/>
    <text x="32" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">1 domo sup. + 2 colectores inf.</text>
    <circle cx="250" cy="17" r="5" fill="#f97316"/>
    <text x="262" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="600" fill="#1e293b">Doble hogar (sobrecalentado y saturado)</text>
    <circle cx="560" cy="17" r="5" fill="#d97706"/>
    <text x="572" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#b45309">Componente activo del paso</text>
  `;

  const content = `
  <!-- Domo superior (derecha) -->
  <g id="domo-m" ${glow(focus, 'upper')}>
    <rect x="520" y="95" width="240" height="70" rx="20" fill="${fillCol(focus, 'upper', 'url(#drumGrad)')}" stroke="${strokeCol(focus, 'upper', '#0284c7')}" stroke-width="${strokeW(focus, 'upper', 2.5)}"/>
    <text x="640" y="126" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="700" fill="#0c4a6e">DOMO SUPERIOR</text>
    <text x="640" y="142" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="11" fill="#0369a1">Separación de vapor / agua</text>
  </g>

  <!-- Colector inferior central -->
  <g id="colector-m-central" ${glow(focus, 'upper')}>
    <rect x="420" y="440" width="160" height="60" rx="18" fill="${fillCol(focus, 'upper', 'url(#mudGrad)')}" stroke="${strokeCol(focus, 'upper', '#0284c7')}" stroke-width="${strokeW(focus, 'upper', 2.5)}"/>
    <text x="500" y="468" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#0c4a6e">COLECTOR CENTRAL</text>
    <text x="500" y="484" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#0369a1">Base división</text>
  </g>

  <!-- Colector inferior lateral (derecha) -->
  <g id="colector-m-lateral" ${glow(focus, 'upper')}>
    <rect x="720" y="440" width="160" height="60" rx="18" fill="${fillCol(focus, 'upper', 'url(#mudGrad)')}" stroke="${strokeCol(focus, 'upper', '#0284c7')}" stroke-width="${strokeW(focus, 'upper', 2.5)}"/>
    <text x="800" y="468" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="12" font-weight="700" fill="#0c4a6e">COLECTOR LATERAL</text>
    <text x="800" y="484" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#0369a1">Haz derecho</text>
  </g>

  <!-- Hogar de Sobrecalentado (Izquierda) -->
  <g id="furnace-m-left" ${glow(focus, 'furnace')}>
    <rect x="120" y="220" width="240" height="200" rx="14" fill="${fillCol(focus, 'furnace', 'url(#furnaceGrad)')}" stroke="${strokeCol(focus, 'furnace', '#fdba74')}" stroke-width="2"/>
    <text x="240" y="248" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#9a3412">HOGAR DE SOBRECALENTADO</text>
    <text x="240" y="264" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#c2410c">Control de temperatura de vapor</text>
    <!-- Llama izq -->
    <path d="M 240 370 C 215 370 205 345 220 320 C 230 305 240 300 240 290 C 245 305 255 315 260 330 C 265 350 260 370 240 370 Z" fill="#f97316"/>
  </g>

  <!-- Hogar Saturado (Derecha) -->
  <g id="furnace-m-right" ${glow(focus, 'furnace')}>
    <rect x="440" y="220" width="240" height="200" rx="14" fill="${fillCol(focus, 'furnace', 'url(#furnaceGrad)')}" stroke="${strokeCol(focus, 'furnace', '#fdba74')}" stroke-width="2"/>
    <text x="560" y="248" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="13" font-weight="700" fill="#9a3412">HOGAR SATURADO</text>
    <text x="560" y="264" text-anchor="middle" font-family="'DM Sans', system-ui, sans-serif" font-size="10" fill="#c2410c">Generación principal de vapor</text>
    <!-- Llama der -->
    <path d="M 560 370 C 535 370 525 345 540 320 C 550 305 560 300 560 290 C 565 305 575 315 580 330 C 585 350 580 370 560 370 Z" fill="#f97316"/>
  </g>

  <!-- Pared intermedia y Sobrecalentador -->
  <g id="tubes-m" ${glow(focus, 'risers')}>
    <line x1="410" y1="165" x2="410" y2="440" stroke="#ea580c" stroke-width="4"/>
    <line x1="390" y1="230" x2="390" y2="410" stroke="#e11d48" stroke-width="3"/>
    <text x="320" y="430" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-weight="700" fill="#e11d48">SOBRECALENTADOR</text>
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
  drawBoiler,
  drawBoilerD,
  drawBoilerA,
  drawBoilerM
};
