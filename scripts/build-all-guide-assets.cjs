const fs = require('fs');
const path = require('path');

const content = require('../dist/server-data/thermal-guide-content.cjs');
const modules = content.modules;
const outDir = path.join(__dirname, '../dist/assets/guia-termicas');

const { drawBoiler, drawBoilerD, drawBoilerA, drawBoilerM } = require('./diagram-boiler.cjs');
const { drawProcessLoop } = require('./diagram-loops.cjs');
const {
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
} = require('./diagram-specialized.cjs');

// Complete mapping of all 37 modules to their dedicated diagram generator
const generatorMap = {
  // Boilers & Drums
  'circulacion': drawBoiler,
  'domos': drawBoiler,
  'purgas-nivel': drawBoiler,
  'averias-caldera': drawBoiler,
  'tipo-d': drawBoilerD,
  'tipo-a': drawBoilerA,
  'tipo-m': drawBoilerM,

  // Thermodynamics & Properties
  'rankine': drawProcessLoop,
  'estados': drawStates,
  'diagramas': drawTS,
  'clasificacion': drawComparison,
  'transferencia': drawWall,

  // Auxiliary Systems & Valves
  'valvulas': drawValves,
  'seguridad': drawSafety,
  'combustible': drawProcessLoop,
  'oil': drawProcessLoop,
  'aceite': drawProcessLoop,
  'aceite-contaminado': drawProcessLoop,
  'alimentacion': drawProcessLoop,
  'desaireacion': drawDeaerator,
  'fluido-termico': drawProcessLoop,
  'thermal': drawProcessLoop,

  // Turbines & Blading
  'etapas-turbina': drawTurbine,
  'velocidades': drawTriangle,
  'mecanica-turbina': drawTurbineMechanics,
  'vacio': drawCondenser,
  'marcha-atras': drawAsternTurbine,

  // Heat Recovery & Combustion
  'recuperacion': drawHeatRecovery,
  'superficies': drawHeatSurfaces,
  'combustion': drawCombustionSystem,

  // Operational Sequences & Control Procedures
  'preparar-caldera': drawSequence,
  'encendido': drawSequence,
  'comunicar': drawSequence,
  'parar-caldera': drawSequence,
  'arranque-turbina': drawSequence,
  'operar-fluido': drawSequence,
  'control-agua': drawSequence,
  'proteccion-turbina': drawSequence,
  'construccion': drawComparison
};

let totalGenerated = 0;

for (const m of modules) {
  const gen = generatorMap[m.id] || drawSequence;
  for (let i = 0; i < m.steps.length; i++) {
    const svg = gen(m, i);
    const fileName = `${m.id}-${i + 1}.svg`;
    fs.writeFileSync(path.join(outDir, fileName), svg, 'utf8');
    totalGenerated++;
  }
}

console.log(`Successfully built ${totalGenerated} high-quality SVG diagrams across ${modules.length} modules!`);
