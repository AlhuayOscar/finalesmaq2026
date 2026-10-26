// General guidance is shown once by the start response, never appended per question.
function hdpQuestion(question,card){const text=String(question||'el tema de examen').trim();if(text.startsWith('Hablame sobre: '))return text;return 'Hablame sobre: '+text.replace(/^[¿¡\s]+|[?.\s]+$/g,'')+'.'}
module.exports={hdpQuestion};
