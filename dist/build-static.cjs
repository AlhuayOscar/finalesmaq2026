const fs=require('node:fs');const path=require('node:path');
fs.mkdirSync('public',{recursive:true});
for(const name of fs.readdirSync('.'))if(/\.(html|css|js)$/.test(name)&&fs.statSync(name).isFile())fs.copyFileSync(name,path.join('public',name));
fs.cpSync('assets','public/assets',{recursive:true});
const {createCatalogue,auditCatalogue}=require('./server-data/question-catalog.cjs');
const catalogue=createCatalogue();
fs.writeFileSync('public/assets/question-catalog.json',JSON.stringify(catalogue));
fs.writeFileSync('public/assets/question-audit.json',JSON.stringify(auditCatalogue(catalogue),null,2));
console.log('Sitio preparado. Los libros y la búsqueda quedan exclusivamente en el servidor.');
