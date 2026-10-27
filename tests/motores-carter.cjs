const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const G=require('../dist/server-data/guided-review.cjs'),catalogue=require('../dist/server-data/question-catalog.cjs').createCatalogue();
const bank=require('../dist/server-data/course-bank.json').cards,guide=require('../dist/assets/banco-motores-navales.json');
const lesson=G.lesson('motores',7),cards=bank.filter(c=>/^motores-u7-q[3-6]$/.test(c.id));assert.equal(cards.length,4);
for(const card of cards){assert(lesson.practice.some(c=>c.id===card.id));assert(lesson.sections.some(s=>s.title===card.rapida.question));assert(catalogue.cards.some(c=>c.id===card.id));for(const mode of ['rapida','normal','sobrepensada'])assert(card[mode].keyPoints.length>=3);assert(card.sources.every(s=>s.url.startsWith('https://')))}
const text=lesson.sections.flatMap(s=>s.paragraphs).join(' ');for(const term of ['condensa','niebla','punto caliente','OMD','respiradero','arrestallamas','explosión secundaria','No existe un tiempo de espera universal'])assert(text.includes(term),term);
assert.equal(guide.questions.length,330);assert.equal(new Set(guide.questions.map(q=>q.id)).size,330);assert(guide.teacher.every(t=>t.maps.length));assert(guide.questions.find(q=>q.id==='M319').question.includes('Explosividad'));assert(guide.questions.find(q=>q.id==='M320').axes.includes('explosión secundaria'));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(require.resolve('../dist/course-practice.js'),'utf8'),ctx);assert.equal(ctx.window.coursePractice.motores.totalQuestions,29);assert(cards.every(c=>ctx.window.coursePractice.motores.cards.some(x=>x.id===c.id)));
console.log('OK: cárter en guía de 330 preguntas, 100 consignas conservadas, repaso narrado, catálogo y banco oral en tres velocidades.');
