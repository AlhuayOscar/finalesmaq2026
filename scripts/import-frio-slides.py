"""Import the supplied revised guide, preserving original slide numbers.
Usage: python scripts/import-frio-slides.py guide.pdf lijo.pdf
Images are source material, never student evidence. No OCR guesses fill missing slides.
"""
import json, re, sys
from pathlib import Path
import pymupdf as fitz

root = Path(__file__).resolve().parents[1] / 'dist'
guide, manual = fitz.open(sys.argv[1]), fitz.open(sys.argv[2])
images = root / 'server-data' / 'frio-slide-images'
images.mkdir(exist_ok=True)
records = []
unavailable = {32, 33, 34, 54, 57, 78}
for index, page in enumerate(guide):
    text = page.get_text()
    match = re.match(r'DIAPOSITIVA (\d+)\n([^\n]+)\n', text)
    if not match:
        continue
    number, title = int(match[1]), match[2]
    question_text = text[len(match[0]):].split('Origen del texto.')[0].strip()
    prompts = [' '.join(s.split()) for s in re.split(r'(?:^|\n)\d+\.\s*', question_text) if s.strip()]
    notes = text.split('Origen del texto.', 1)[-1].split('Sistemas de Frío |')[0].strip()
    refs = sorted(set(int(n) for n in re.findall(r'Manual de Refrigeración de Lijó Completo\.pdf\s*\|\s*PDF pág\. (\d+)', text)))
    context_pages = sorted(set(p for n in refs for p in [n-1, n, n+1] if 1 <= p <= len(manual)))
    context = '\n\n'.join(f'Lijó, página PDF {p}:\n{manual[p-1].get_text()}' for p in context_pages)
    record = dict(number=number, title=title, page=index+1, prompts=prompts,
                  notes=notes, sourceText=text, bookContext=context[:18000], bookPages=context_pages,
                  available=number not in unavailable,
                  unavailableReason='La figura o el dispositivo exacto no están identificados con suficiente certeza en la guía.' if number in unavailable else '')
    # A full page preserves captions, provenance and uncertainty next to each figure.
    image = page.get_pixmap(matrix=fitz.Matrix(1.8, 1.8), alpha=False)
    image.save(images / f'{number}.jpg', jpg_quality=88)
    records.append(record)
(root / 'server-data' / 'frio-slides.json').write_text(json.dumps(records, ensure_ascii=False, indent=2), encoding='utf8')
manifest = [{k:r[k] for k in ['number','title','page','available','unavailableReason']} for r in records]
(root / 'frio-slide-catalog.js').write_text('window.frioSlideCatalog='+json.dumps(manifest,ensure_ascii=False)+';\n',encoding='utf8')
print(f'{len(records)} fichas, {sum(r["available"] for r in records)} evaluables; numeración original conservada.')
