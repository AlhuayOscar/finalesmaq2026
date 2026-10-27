const assert=require('node:assert/strict');
const P=require('../dist/server-data/question-plan.cjs');
const pdf=require('../dist/server-data/thermal-pdf-bank.cjs');
const {createCatalogue,auditCatalogue}=require('../dist/server-data/question-catalog.cjs');
const {hdpQuestion}=require('../dist/server-data/question-wording.cjs');
const catalogue=createCatalogue(),audit=auditCatalogue(catalogue);
assert.equal(catalogue.cards.length,466);
assert.equal(catalogue.cards.filter(c=>c.subject==='termicas').length,208);
assert.equal(catalogue.cards.filter(c=>c.bank==='frio-slides').length,76);
assert.equal(new Set(catalogue.cards.map(c=>c.id)).size,466);
assert.deepEqual(audit.exactDuplicates,[]);
assert.equal(audit.pdfRedundantPairs.length,45);
for(const c of catalogue.cards){
 assert(c.unitName&&c.subjectName);
 assert(!Object.hasOwn(c,'answer'));
 for(const level of c.modes)for(const speed of ['rapida','normal','sobrepensada']){
  const actual=P.current({ids:[c.id],index:0,level,speed});
  const question=actual.bookPrompt||actual.question;
  assert.equal(c.questions[level][speed],level==='hdp'?hdpQuestion(question,actual):question);
 }
}
for(const c of pdf.cards.filter(c=>c.variant===0)){
 const other=pdf.cards.find(o=>o.topicKey===c.topicKey&&o.variant===1);
 assert.deepEqual([...pdf.adapt(c,'hdp').keyPoints].sort(),[...pdf.adapt(other,'hdp').keyPoints].sort());
 const first=pdf.adapt(c,'examen').keyPoints,second=pdf.adapt(other,'examen').keyPoints;
 assert.equal(first.filter(p=>second.includes(p)).length,2);
}
for(let run=0;run<12;run++){
 const plan=P.createPlan({unit:-1,scope:'completo',speed:'normal',subject:'termicas',level:'hdp'});
 assert.equal(plan.ids.length,157); // 112 base + one card for each of 45 PDF topics.
 const selected=plan.ids.filter(id=>id.startsWith('mtpdf-'));
 assert.equal(new Set(selected.map(id=>id.replace(/-[01]$/,''))).size,45);
}
// A previously signed plan with both variants remains readable.
const old={...P.createPlan({unit:-1,scope:'completo',speed:'normal',level:'hdp'}),ids:pdf.cards.map(c=>c.id)};
assert.equal(P.readPlan(P.signPlan(old,'test'),'test').ids.length,90);
console.log('OK: catálogo completo sin respuestas, redacción real en todas las modalidades, auditoría, selección por tema y planes anteriores compatibles.');
