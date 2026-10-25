const configs=require('./course-config.json');
const thermalTopics=['Vapor','Clasificación de calderas','Accesorios de calderas','Combustión','Alimentación','Operación de calderas','Turbinas de vapor','Auxiliares de turbinas','Operación de turbinas','Fluido térmico','Propiedades del combustible','Circuito de combustible','Alimentación · circuito completo','Mantenimiento y fallas'];
function get(id='termicas'){if(id==='termicas')return {name:'Máquinas Térmicas de Uso Naval',topics:thermalTopics,basis:'programa'};return configs[id]||null}
module.exports={get,valid:id=>!!get(id),ids:['termicas',...Object.keys(configs)]};
