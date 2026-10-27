from pathlib import Path
from html import escape
from collections import Counter
import json,re,hashlib
from reportlab.pdfgen import canvas
from reportlab.platypus import SimpleDocTemplate,Paragraph,Spacer,PageBreak,CondPageBreak,KeepTogether,Table,TableStyle
from reportlab.lib.styles import getSampleStyleSheet,ParagraphStyle
from reportlab.lib.enums import TA_LEFT
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import pymupdf

p=Path(__file__).parent
out=Path('outputs/guia-motores-navales');out.mkdir(parents=True,exist_ok=True)
m=json.loads((p/'metadata.json').read_text(encoding='utf-8'))
m['sources'][9]['url']='https://drive.google.com/file/d/1hdQKSiFox7dO0AsHL8FrAs8Zh-3wPUQF/view'
teacher=json.loads((p/'teacher.json').read_text(encoding='utf-8'))
by_teacher={q['id']:q for q in teacher}
units=[];qs=[]
for line in (p/'questions.txt').read_text(encoding='utf-8').splitlines():
 line=line.replace('\u00ad','').strip()
 if not line:continue
 if line.startswith('# '):
  _,uid,title=line.split(' ',2)
  u={'id':int(uid),'title':title,'sources':m['unitSources'][uid],'coverage':m['coverage'][int(uid)-1],'questions':[]};units.append(u)
 else:
  text,axes,refs=[x.strip() for x in line.split('|')]
  q={'id':f'M{len(qs)+1:03}','number':len(qs)+1,'unit':u['id'],'question':text,'axes':axes,'teacher':[] if refs=='-' else refs.split()}
  qs.append(q);u['questions'].append(q['id'])

expansion=json.loads((p/'review-expansion.json').read_text(encoding='utf-8'))
exam_review=json.loads((p/'exam-coverage.json').read_text(encoding='utf-8'))
for row in expansion:
 if len(row['guideIds'])==1 and int(row['guideIds'][0][1:])>330:
  q={'id':row['guideIds'][0],'number':int(row['guideIds'][0][1:]),'unit':row['guideUnit'],'question':row['question'],'axes':row['answer'],'teacher':[]}
  qs.append(q)
  next(u for u in units if u['id']==q['unit'])['questions'].append(q['id'])
for q in qs:
 q['exams']=[item['id'] for exam in exam_review['exams'] for item in exam['questions'] if q['id'] in item['guideIds']]

for t in teacher:t['maps']=[q['id'] for q in qs if t['id'] in q['teacher']]
assert len(qs)==400
assert len({q['question'] for q in qs})==400
assert all(t['maps'] for t in teacher)
assert set(sum([q['teacher'] for q in qs],[]))==set(by_teacher)
data={'meta':m,'units':units,'questions':qs,'teacher':teacher,'exams':exam_review['exams'],'reviewScope':exam_review['scope']}
(out/'banco-motores-navales.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
counts={u['id']:len(u['questions']) for u in units}
priority=sum(bool(q['teacher']) for q in qs)
audit={'questions':len(qs),'teacher_originals':len(teacher),'teacher_covered':sum(bool(t['maps']) for t in teacher),'priority_questions':priority,'additional_questions':len(qs)-priority,'unit_counts':counts,'duplicates':0,'source_date':m['date']}
(p/'audit.json').write_text(json.dumps(audit,indent=2),encoding='utf-8')
print(json.dumps(audit,ensure_ascii=False))

# Standalone web copy with embedded data for offline use.
template=(p/'guide-template.html').read_text(encoding='utf-8')
embedded=json.dumps(data,ensure_ascii=False).replace('</','<\\/')
(out/'guia-motores-navales.html').write_text(template.replace('__DATA__',embedded).replace('__PRIORITY__',str(priority)).replace('__COUNT__',str(len(qs))),encoding='utf-8')

# Print edition; no unreviewed model-specific operational numbers.
fonts=Path('C:/Windows/Fonts')
pdfmetrics.registerFont(TTFont('Guide',str(fonts/'arial.ttf')))
pdfmetrics.registerFont(TTFont('GuideB',str(fonts/'arialbd.ttf')))
pdfmetrics.registerFontFamily('Guide',normal='Guide',bold='GuideB',italic='Guide',boldItalic='GuideB')
styles={
 'title':ParagraphStyle('title',fontName='GuideB',fontSize=25,leading=30,spaceAfter=14,textColor=colors.black),
 'h1':ParagraphStyle('h1',fontName='GuideB',fontSize=18,leading=23,spaceAfter=12,keepWithNext=True,textColor=colors.black),
 'h2':ParagraphStyle('h2',fontName='GuideB',fontSize=12,leading=16,spaceBefore=10,spaceAfter=6,keepWithNext=True,textColor=colors.black),
 'body':ParagraphStyle('body',fontName='Guide',fontSize=10.2,leading=14.3,spaceAfter=8),
 'q':ParagraphStyle('q',fontName='GuideB',fontSize=10.3,leading=14.1,spaceAfter=4),
 'axes':ParagraphStyle('axes',fontName='Guide',fontSize=9.3,leading=12.8,spaceAfter=4,textColor=colors.HexColor('#3f4650')),
 'meta':ParagraphStyle('meta',fontName='Guide',fontSize=8.2,leading=11,spaceAfter=4,textColor=colors.HexColor('#505963')),
 'small':ParagraphStyle('small',fontName='Guide',fontSize=9,leading=12.2,spaceAfter=6),
 'sourceHead':ParagraphStyle('sourceHead',fontName='GuideB',fontSize=11,leading=14,spaceBefore=6,spaceAfter=3,keepWithNext=True),
 'sourceBody':ParagraphStyle('sourceBody',fontName='Guide',fontSize=9,leading=12,spaceAfter=4),
}
def par(t,style='body'):return Paragraph(t,styles[style])
def esc(t):return escape(str(t),quote=True)
def source_links(ids):
 items=[]
 for sid in ids:
  s=next(s for s in m['sources'] if s['id']==sid)
  label=f'{sid} {esc(s["title"])}'
  items.append(f'<link href="{esc(s["url"])}" color="#244d6b">{label}</link>' if s['url'] else label)
 return ' · '.join(items)
pdfpath=out/'guia-motores-navales.pdf'
W,H=A4
class GuideDoc(SimpleDocTemplate):
 def afterFlowable(self,f):
  if isinstance(f,Paragraph) and f.style.name=='h1':
   title=f.getPlainText();key='b'+str(self.seq.nextf('bookmark'))
   self.canv.bookmarkPage(key);self.canv.addOutlineEntry(title,key,level=0,closed=False)
def furniture(c,doc):
 c.saveState();c.setFont('Guide',8);c.setFillColor(colors.HexColor('#59616a'))
 if doc.page>1:c.drawString(43,H-27,'MOTORES NAVALES  |  GUÍA DE PREGUNTAS 2026')
 c.drawString(43,25,'ESNF · 15 unidades · Profesor y ampliación de estudio')
 c.drawRightString(W-43,25,str(doc.page));c.restoreState()
doc=GuideDoc(str(pdfpath),pagesize=A4,rightMargin=43,leftMargin=43,topMargin=47,bottomMargin=43,title=m['title'],author='Guía de estudio elaborada con ChatGPT a partir del programa y materiales docentes')
story=[par('Motores Navales','title'),par('Guía integral de preguntas','h1'),par('400 preguntas · 15 unidades · 15 exámenes revisados','h2'),par(esc(m['date']),'meta'),Spacer(1,8),par(esc(m['intro'])),par(esc(m['method'])),par('Cómo estudiar','h2'),par(esc(m['use'])),par('Cómo leer las referencias','h2'),par(f'<b>Prioridad docente:</b> {priority} preguntas integran las 100 consignas originales, incluidas sus repeticiones. G01 a G57 corresponden a Generalidades y C01 a C43 a Cigüeñal y cojinetes. El anexo permite localizar cada texto original.'),par(f'<b>Ampliación ChatGPT:</b> {len(qs)-priority} preguntas completan las unidades y la aplicación profesional. Debajo de cada pregunta se indican los ejes de respuesta, no una respuesta desarrollada.'),par(esc(m['limits'])),par('Ruta sugerida','h2'),par('Primero Generalidades, Elementos, Nomenclatura y Ciclos. Después estudiar los sistemas siguiendo sus recorridos. Terminar con controles, vibraciones, conducción y casos de fallas. En cada etapa repasar las consignas docentes vinculadas.'),PageBreak(),par('Mapa de cobertura','h1')]
rows=[[par('UT','small'),par('Tema y alcance','small'),par('Preguntas','small')]]
for u in units:
 rows.append([par(str(u['id']),'small'),par(f'<b>{esc(u["title"])}</b><br/>{esc(u["coverage"])}','small'),par(f'{u["questions"][0]}<br/>{u["questions"][-1]}<br/>{len(u["questions"])} en total','small')])
t=Table(rows,colWidths=[37,390,82],repeatRows=1,hAlign='LEFT')
t.setStyle(TableStyle([('BACKGROUND',(0,0),(-1,0),colors.HexColor('#e7eef3')),('GRID',(0,0),(-1,-1),.35,colors.HexColor('#d9d9d9')),('VALIGN',(0,0),(-1,-1),'MIDDLE'),('LEFTPADDING',(0,0),(-1,-1),8),('RIGHTPADDING',(0,0),(-1,-1),8),('TOPPADDING',(0,0),(-1,-1),3),('BOTTOMPADDING',(0,0),(-1,-1),3)]));story.append(t)
by_id={q['id']:q for q in qs}
for u in units:
 story +=[PageBreak() if u['id']==1 else CondPageBreak(220),Spacer(1,16),par(f'Unidad {u["id"]} {esc(u["title"])}','h1'),par(esc(u['coverage'])),par('Fuentes de esta unidad: '+source_links(u['sources']),'meta'),Spacer(1,8)]
 for qid in u['questions']:
  q=by_id[qid];label=('EXAMEN · '+', '.join(q['exams'])+' · ' if q['exams'] else '')+('Prioridad docente · '+', '.join(q['teacher']) if q['teacher'] else 'Ampliación de estudio')
  story.append(KeepTogether([par(f'<a name="{qid}"/>{qid}  {esc(q["question"])}','q'),par(esc(label),'meta'),par('<b>Ejes de respuesta:</b> '+esc(q['axes']),'axes'),Spacer(1,9)]))
story +=[PageBreak(),par('Fórmulas básicas para interpretar','h1'),par('Usalas para explicar el significado físico y resolver cuentas sencillas. No hace falta desarrollar la matemática avanzada del diseño de motores.')]
for title,formula,explain in m['formulas']:story.append(KeepTogether([par(esc(title),'h2'),par(esc(formula),'q'),par(esc(explain))]))
story +=[PageBreak(),par('Aclaraciones técnicas para estudiar','h1'),par('Se conservan las preguntas del profesor y se explicitan las premisas que deben verificarse o matizarse al preparar una respuesta.')]
for c in m['clarifications']:story.extend([par(esc(c['title']),'h2'),par(esc(c['refs']),'meta'),*[par(esc(text)) for text in c.get('paragraphs',[c['text']])],par('Consultar: '+source_links(c['sources']),'meta')])
story +=[PageBreak(),par('Correspondencia con las guías del profesor','h1'),par('Las 100 consignas aparecen en el orden de cada DOCX. Su texto se conserva; se omiten las respuestas incluidas en la guía de cigüeñal. Los códigos G y C se asignan aquí por orden de aparición. Las flechas vinculan cada consigna con la pregunta revisada correspondiente. Las repeticiones no aumentan el total de 400.')]
for t in teacher:
 links=', '.join(f'<link href="#{qid}" color="#244d6b">{qid}</link>' for qid in t['maps'])
 story.append(KeepTogether([par(f'<b>{t["id"]}</b> {esc(t["text"])}','small'),par('Estudiar en '+links,'meta'),Spacer(1,5)]))
story +=[PageBreak(),par('Exámenes revisados: correspondencia por consigna','h1'),par(esc(exam_review['scope']))]
for exam in exam_review['exams']:
 story +=[par(esc(exam['title']),'h2'),par('<link href="'+esc(exam['url'])+'" color="#244d6b">Consultar original en Drive</link>','meta')]
 for item in exam['questions']:
  links=', '.join('<link href="#'+qid+'" color="#244d6b">'+qid+'</link>' for qid in item['guideIds'])
  story.append(KeepTogether([par(esc(item['id']+' '+item['text']),'small'),par('Preparar con: '+links,'meta')]))
story +=[PageBreak(),par('Fuentes y alcance de la revisión','h1'),par('Las fuentes siguientes fundamentan la selección de temas y las aclaraciones. Se leyeron los dos cuestionarios completos y el programa de siete páginas. Los materiales complementarios se revisaron en las secciones o páginas indicadas; no se afirma haber revisado todos los archivos de Drive ni todos los capítulos de los manuales.')]
for s in m['sources']:
 title=esc(s['id']+' '+s['title'])
 if s['url']:title=f'<link href="{esc(s["url"])}" color="#244d6b">{title}</link>'
 story.append(KeepTogether([par(title,'sourceHead'),par(esc(s['locator']),'sourceBody'),par(esc(s['note']),'sourceBody')]))
doc.build(story,onFirstPage=furniture,onLaterPages=furniture)
pdf=pymupdf.open(pdfpath)
text='\n'.join(page.get_text() for page in pdf)
missing=[q['id'] for q in qs if q['id'] not in text]
assert not missing,missing
assert all(t['id'] in text for t in teacher)
assert '\ufffd' not in text
(p/'pdf-extracted.txt').write_text(text,encoding='utf-8')
qa=p/'qa';qa.mkdir(exist_ok=True)
for i,page in enumerate(pdf):page.get_pixmap(matrix=pymupdf.Matrix(1.2,1.2)).save(qa/f'page-{i+1:02}.png')
print('PDF pages',len(pdf),'bytes',pdfpath.stat().st_size)
