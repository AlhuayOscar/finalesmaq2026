const { escapeXML, wrapText, renderTextLines } = require('./svg-text.cjs');

const content = require('../dist/server-data/thermal-guide-content.cjs');
const modules = content.modules;
const outDir = require('path').join(__dirname, '../dist/assets/guia-termicas');

// ==================== SHARED SVG WRAPPER ====================
function wrapSVG({ title, subtitle, activeLabel, activeKey, legend, content }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 620" width="1000" height="620">
  <defs>
    <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#d97706" flood-opacity="0.6"/>
    </filter>
    <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#0f2922" flood-opacity="0.08"/>
    </filter>
    <linearGradient id="drumGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f0f9ff"/>
      <stop offset="48%" stop-color="#e0f2fe"/>
      <stop offset="52%" stop-color="#bae6fd"/>
      <stop offset="100%" stop-color="#7dd3fc"/>
    </linearGradient>
    <linearGradient id="mudGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e0f2fe"/>
      <stop offset="100%" stop-color="#7dd3fc"/>
    </linearGradient>
    <linearGradient id="furnaceGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff7ed"/>
      <stop offset="100%" stop-color="#ffedd5"/>
    </linearGradient>
    <linearGradient id="steelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="100%" stop-color="#e2e8f0"/>
    </linearGradient>
    <linearGradient id="activeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="100%" stop-color="#fef3c7"/>
    </linearGradient>

    <!-- Arrow markers -->
    <marker id="arrowBlue" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0284c7"/>
    </marker>
    <marker id="arrowOrange" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ea580c"/>
    </marker>
    <marker id="arrowRed" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#e11d48"/>
    </marker>
    <marker id="arrowGreen" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#059669"/>
    </marker>
    <marker id="arrowGray" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569"/>
    </marker>
    <marker id="arrowActive" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#d97706"/>
    </marker>
  </defs>

  <!-- Background canvas -->
  <rect width="1000" height="620" rx="16" fill="#f8faf7" stroke="#e2e8e0" stroke-width="1.5"/>

  <!---->
  <g transform="translate(36, 32)">
    <text font-family="'DM Sans', system-ui, sans-serif" font-size="21" font-weight="700" fill="#133e36">${escapeXML(title)}</text>
    <text y="24" font-family="'DM Sans', system-ui, sans-serif" font-size="14" font-weight="500" fill="#52796f">${escapeXML(subtitle)}</text>
  </g>

  <!-- Active Step Pill Badge -->
  <g transform="translate(670, 24)">
    <rect width="294" height="32" rx="16" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
    <circle cx="16" cy="16" r="5" fill="#d97706"/>
    <text x="30" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="11" font-weight="700" fill="#92400e">FOCO: ${escapeXML(activeLabel.toUpperCase())}</text>
  </g>

  <!-- Content area -->
  ${content}

  <!-- Bottom Legend -->
  <g transform="translate(40, 574)">
    <rect x="0" y="0" width="920" height="34" rx="8" fill="#ffffff" stroke="#e2e8e0" stroke-width="1"/>
    ${legend}
    <text x="760" y="21" font-family="'DM Sans', system-ui, sans-serif" font-size="10" font-style="italic" fill="#64748b">Esquema didáctico naval</text>
  </g>
</svg>`;
}

function isAct(focus, key) {
  return focus === key;
}

function strokeCol(focus, key, defCol, actCol = '#d97706') {
  return isAct(focus, key) ? actCol : defCol;
}

function fillCol(focus, key, defCol, actCol = 'url(#activeGrad)') {
  return isAct(focus, key) ? actCol : defCol;
}

function strokeW(focus, key, defW = 2, actW = 4) {
  return isAct(focus, key) ? actW : defW;
}

function glow(focus, key) {
  return isAct(focus, key) ? 'filter="url(#activeGlow)"' : '';
}

module.exports = {
  content,
  modules,
  outDir,
  wrapSVG,
  escapeXML,
  wrapText,
  renderTextLines,
  isAct,
  strokeCol,
  fillCol,
  strokeW,
  glow
};
