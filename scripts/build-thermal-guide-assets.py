"""Generate original SVG teaching diagrams and matching, user-played GIFs."""
import json,subprocess,html,math,textwrap,sys
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist/assets/guia-termicas';OUT.mkdir(parents=True,exist_ok=True)
modules=json.loads(subprocess.check_output(['node','-e',"console.log(JSON.stringify(require('./dist/server-data/thermal-guide-content.cjs').modules))"],cwd=ROOT).decode('utf8'))
INK='#193f3e';BLUE='#287eb1';RED='#bb5271';GAS='#cb6c32';GOLD='#ab7625'
def font(size):
    for path in ['C:/Windows/Fonts/arial.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
        if Path(path).exists():return ImageFont.truetype(path,size)
    return ImageFont.load_default()
class Picture:
    def __init__(self,focus,title,subtitle):
        self.focus=focus;self.svg=[];self.im=Image.new('RGB',(1000,620),'#f6f7ef');self.d=ImageDraw.Draw(self.im)
        self.text(32,25,title,25);self.text(32,65,subtitle,17,'#5a7167')
        self.text(32,572,'Esquema didáctico · sin escala · ocre: parte o relación que explica este paso',15,'#5a7167')
        self.text(32,595,'Las posiciones no sustituyen el plano del equipo. Flechas según leyenda de cada figura.',13,'#5a7167')
    def text(self,x,y,t,size=17,color=INK):
        self.svg.append(f'<text x="{x}" y="{y+size}" font-family="Arial,sans-serif" font-size="{size}" fill="{color}">{html.escape(t)}</text>');self.d.text((x,y),t,font=font(size),fill=color)
    def line(self,pts,color=BLUE,key='',width=5,arrow=False,dash=False):
        col=GOLD if key==self.focus else color;w=width+3 if key==self.focus else width
        self.svg.append(f'<polyline points="'+ ' '.join(f'{x},{y}' for x,y in pts)+f'" fill="none" stroke="{col}" stroke-width="{w}" stroke-linejoin="round"'+(' stroke-dasharray="8 6"' if dash else '')+'/>');self.d.line(pts,fill=col,width=w,joint='curve')
        if arrow:
            a,b=pts[-2:];angle=math.atan2(b[1]-a[1],b[0]-a[0]);tri=[b,(b[0]-14*math.cos(angle-.45),b[1]-14*math.sin(angle-.45)),(b[0]-14*math.cos(angle+.45),b[1]-14*math.sin(angle+.45))];self.poly(tri,col)
    def poly(self,pts,fill):
        self.svg.append('<polygon points="'+' '.join(f'{x},{y}' for x,y in pts)+f'" fill="{fill}"/>');self.d.polygon(pts,fill=fill)
    def box(self,x,y,w,h,label='',key='',fill='#e4ece7'):
        active=key==self.focus;c=GOLD if active else '#729084';f='#ffedbd' if active else fill
        self.svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" fill="{f}" stroke="{c}" stroke-width="{4 if active else 2}"/>');self.d.rounded_rectangle((x,y,x+w,y+h),radius=12,fill=f,outline=c,width=4 if active else 2)
        lines=label.split('|')
        for i,t in enumerate(lines):self.text(x+12,y+h/2-len(lines)*11+i*22,t,17)
    def circle(self,x,y,r,key='',fill='#d9eaf4'):
        c=GOLD if key==self.focus else BLUE;self.svg.append(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" stroke="{c}" stroke-width="4"/>');self.d.ellipse((x-r,y-r,x+r,y+r),fill=fill,outline=c,width=4)
    def save(self,path):
        path.write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 620" role="img"><title>'+html.escape(self.focus)+'</title><rect width="1000" height="620" rx="16" fill="#f6f7ef"/>'+''.join(self.svg)+'</svg>',encoding='utf8')
def diagram(p,kind,step):
    if kind in ['rankine','oil','thermal','fuel','feed']:
        if kind=='rankine':
            nodes=[('pump','Bomba|consume trabajo'),('boiler','Caldera|recibe calor'),('turbine','Turbina|entrega trabajo'),('condenser','Condensador|rechaza calor')]
        elif kind=='oil':nodes=[('tank','Tanque y bombas|reserva / presión'),('condition','Filtro / enfriador|limpieza / temperatura'),('bearings','Cojinetes|película y refrigeración'),('return','Retorno al tanque|gravedad según diseño')]
        elif kind=='thermal':nodes=[('pump','Bomba|circulación'),('heater','Calentador|aporte de calor'),('consumer','Consumidores|entrega de calor'),('expansion','Conexión al tanque|expansión de volumen')]
        elif kind=='fuel':nodes=[('tank','Almacenamiento|tratamiento / servicio'),('heater','Bomba / calentador|caudal / viscosidad'),('filter','Filtro|retiene sólidos'),('nozzle','Pulverizador|formación de gotas')]
        else:nodes=[('condenser','Condensador / hotwell|reúne líquido'),('condensate','Bomba de condensado|calentadores / desaireador'),('feedPump','Bomba alimentación|válvulas / economizador'),('boiler','Caldera|producción de vapor')]
        pos=[(65,170),(560,170),(560,370),(65,370)]
        p.line([(295,220),(560,220)],BLUE,nodes[1][0],arrow=True);p.line([(680,270),(680,370)],RED if kind=='rankine' else BLUE,nodes[2][0],arrow=True)
        p.line([(560,420),(295,420)],BLUE,nodes[3][0],arrow=True)
        if kind not in ['fuel','thermal']:p.line([(180,370),(180,270)],BLUE,nodes[0][0],arrow=True)
        for (key,label),(x,y) in zip(nodes,pos):p.box(x,y,290 if kind=='feed' else 250,100,label,key)
        if kind=='fuel':p.text(70,510,'El combustible se quema: este recorrido no vuelve como combustible al tanque.',17);p.text(580,490,'Rocío + aire → combustión',17,GAS)
        elif kind=='thermal':
            # Expansion tank is a branch at pump suction, not a series consumer.
            p.box(65,370,250,100,'Retorno desde|consumidores','return');p.line([(180,370),(180,270)],BLUE,'pump',arrow=True);p.box(370,300,150,70,'Tanque de|expansión','expansion');p.line([(370,335),(180,335)],BLUE,'expansion',dash=True)
        elif kind=='feed':p.text(70,510,'Retorno desde caldera a condensador a través de turbina y escape (simplificado).',16)
        else:p.text(360,320,'Sentido del recorrido',18)
    elif kind in ['boiler','D','A','M']:
        upper=520 if kind=='D' else 500
        lows=[320,680] if kind=='A' else [500,740] if kind=='M' else [520]
        p.box(upper-100,130,200,68,'Domo: agua / vapor','upper',fill='#cbe4ec')
        for x in lows:p.box(x-65,430,130,54,'Colector','lower',fill='#cbe4ec')
        for x in lows:
            p.line([(upper-85,170),(x-95,170),(x-95,450),(x-65,450)],BLUE,'down',arrow=True)
            for dx in [-24,0,24]:p.line([(x+dx,430),(upper+dx,198)],GAS,'risers',width=4)
            p.line([(x+45,410),(upper+45,220)],GAS,'risers',arrow=True,width=3)
        p.box(100,280,175,95,'Hogar|calor hacia tubos','furnace',fill='#f4d5ba');p.line([(275,325),(390,325)],GAS,'furnace',arrow=True)
        p.line([(upper+100,150),(855,150)],RED,'outlet',arrow=True);p.text(745,117,'Salida vapor',16,RED)
        p.line([(800,235),(upper+70,235),(upper+70,190)],BLUE,'feed',arrow=True);p.text(755,245,'Alimentación',16,BLUE)
        p.box(805,315,125,90,'Indicador|de nivel','level');p.line([(upper+100,155),(930,155),(930,333)],BLUE,'level',width=2);p.line([(upper+100,185),(960,185),(960,390),(930,390)],BLUE,'level',width=2)
        if step[0]['title']=='Retirar desde el fondo':
            p.line([(520,484),(520,505),(925,505)],BLUE,'lower',arrow=True,width=4);p.text(700,475,'Extracción de fondo',15)
            p.line([(upper+90,180),(750,180),(750,435),(925,435)],BLUE,'upper',arrow=True,width=3);p.text(700,445,'Extracción superficial',15)
        p.text(75,520,'Azul: agua / descendentes      Ocre: mezcla ascendente      Rosa: vapor',17)
        if kind=='M':p.text(300,500,'M: inferior central + lateral; hogares diferenciados en el apunte.',15)
    elif kind=='states':
        labels=[('liquid','Líquido|subenfriado'),('wet','Mezcla saturada|0 ≤ x ≤ 1'),('superheat','Vapor|sobrecalentado')]
        for i,(key,label) in enumerate(labels):p.box(65+i*310,230,250,120,label,key);p.line([(65+i*310,400),(300+i*310,400)],RED,key,arrow=True)
        p.text(65,180,'A presión constante: agregar calor →',21);p.text(375,370,'T = Tsat mientras cambia x',16);p.text(690,370,'T > Tsat',18)
        p.box(100,470,800,60,'p absoluta → tabla → Tsat       ΔT sobrecalentamiento = T − Tsat','pressure')
    elif kind=='ts':
        p.line([(130,500),(130,115)],INK,'axes',arrow=True,width=3);p.line([(130,500),(900,500)],INK,'axes',arrow=True,width=3)
        p.text(80,100,'T',24);p.text(900,510,'s',24)
        pts=[(260,450),(300,310),(370,190),(470,145),(560,190),(650,310),(760,450)];p.line(pts,BLUE,'dome',width=5)
        p.text(400,110,'Punto crítico',17);p.text(350,340,'Mezcla',20);p.text(150,280,'Líquido',17);p.text(700,195,'Sobrecalentado',17)
        p.line([(710,175),(710,410)],'#4d8d64','expansion',arrow=True);p.line([(710,175),(805,365)],GAS,'expansion',arrow=True)
        p.text(730,270,'Real',16,GAS);p.text(630,280,'Ideal',16,'#4d8d64');p.circle(710,410,7,'outlet');p.text(270,475,'x=0',17);p.text(730,475,'x=1',17)
        p.text(170,535,'T-s cualitativo: no usar el dibujo para calcular propiedades.',16)
    elif kind=='comparison':
        for x,key,title,inside,outside in [(80,'waterTube','Acuotubular','Agua / mezcla','Gases por fuera'),(560,'fireTube','Humotubular','Gases','Agua alrededor')]:
            p.box(x,150,350,220,'',key);p.text(x+25,165,title,23);p.box(x+35,230,280,65,inside,key,fill='#d3e7ee' if key=='waterTube' else '#f2d3b6');p.text(x+35,325,outside,18);p.line([(x+50,280),(x+290,280)],BLUE if key=='waterTube' else GAS,key,arrow=True,width=3)
        p.box(80,420,350,100,'Servicio naval|peso / espacio / respuesta','service');p.box(560,420,350,100,'Comparar igual servicio|presión / producción / acceso','criteria')
    elif kind=='construction':
        p.box(80,140,500,340,'','insulation',fill='#c1cbbd');p.text(110,160,'Envuelta + aislamiento exterior',20)
        p.box(130,215,400,220,'','fire',fill='#dbb899');p.text(160,230,'Refractario / zona de hogar',18)
        p.poly([(200,380),(270,275),(300,340),(355,285),(420,380)],'#e18d46')
        p.box(660,160,220,100,'Colector|presurizado','metal',fill='#cee3ec')
        for x in [700,760,820]:p.line([(x,260),(x,440)],BLUE,'joint',width=15)
        p.box(630,465,300,65,'Uniones tubo-colector','joint');p.text(85,510,'Hogar: recibe combustión',18)
    elif kind=='wall':
        cols=[(90,170,170,'fire','Llama / gases',GAS),(280,70,170,'soot','Hollín','#706451'),(370,110,170,'metal','Metal','#b8c7ca'),(500,90,170,'scale','Incrustación','#ddc995'),(610,240,170,'water','Agua','#d1e6ee')]
        for x,w,y,key,label,col in cols:p.box(x,y,w,210,'',key,fill=col);p.text(x,400,label,15)
        p.line([(100,280),(830,280)],RED,p.focus,arrow=True,width=5)
        p.box(150,455,700,70,'Depósitos → más resistencia térmica → peor refrigeración del metal','scale')
        p.text(90,125,'Capas del intercambio: gases → depósito → pared → depósito → agua',18)
        p.text(90,540,'Corte conceptual de una pared: gases y agua permanecen separados.',15)
    elif kind=='valves':
        for x,y,key,label in [(65,140,'globe','Globo: obturador / asiento'),(540,140,'check','Retención: cierre por retorno'),(65,360,'safety','Seguridad: resorte / presión'),(540,360,'trap','Trampa: descarga condensado')]:
            p.box(x,y,390,175,'',key);p.text(x+15,y+12,label,18)
            p.line([(x+25,y+125),(x+360,y+125)],BLUE,key,arrow=True,width=5)
            if key=='globe':p.line([(x+190,y+50),(x+190,y+115)],INK,key,width=5);p.line([(x+150,y+115),(x+230,y+115)],INK,key,width=9);p.line([(x+150,y+130),(x+230,y+130)],INK,key,width=3)
            elif key=='check':p.line([(x+190,y+70),(x+220,y+125)],INK,key,width=8);p.circle(x+190,y+70,5,key)
            elif key=='safety':p.line([(x+165,y+60),(x+215,y+70),(x+165,y+80),(x+215,y+90),(x+190,y+110)],INK,key,width=3);p.line([(x+155,y+115),(x+225,y+115)],INK,key,width=8)
            else:p.circle(x+190,y+85,23,key);p.text(x+235,y+65,'Tipo flotador',15)
    elif kind in ['recovery','heat-train','sequence','control']:
        if kind=='recovery':nodes=[('engine','Motor|gases de escape'),('exchanger','Recuperador|agua o vapor'),('burner','Quemador|aporte propio'),('steam','Servicio|demanda de vapor')]
        elif kind=='heat-train':nodes=[('superheater','Sobrecalentador|vapor del domo'),('reheater','Recalentador /|desobrecalentador'),('economizer','Economizador|agua alimentación'),('airheater','Precalentador|aire combustión')]
        elif kind=='valves':nodes=[('globe','Globo / compuerta|regular / aislar'),('check','Retención / SDNR|evitar retorno'),('safety','Seguridad / reductora|funciones distintas'),('trap','Trampa / bypass|condensado / calentado')]
        elif kind=='control':nodes=[('sensor','Medición|velocidad / condición'),('logic','Regulación / protección|objetivos distintos'),('valve','Actuador|admisión / corte rápido'),('rotor','Rotor y auxiliares|energía remanente')]
        else:nodes=[(key,textwrap.shorten(s['title'],width=43,placeholder='…')) for key,s in zip(['one','two','three','four'],step)]
        for i,(key,label) in enumerate(nodes):
            x=65+(i%2)*475;y=150+(i//2)*215
            if '|' not in label:label='|'.join(textwrap.wrap(label,24))
            p.box(x,y,390,135,label,key)
            p.text(x+15,y-28,f'{i+1:02}',20,GOLD)
        if kind in ['sequence','control']:
            p.line([(455,220),(540,220)],INK,'',arrow=True,width=3);p.line([(735,285),(735,325),(260,325),(260,365)],INK,'',arrow=True,width=3);p.line([(455,435),(540,435)],INK,'',arrow=True,width=3)
        p.text(65,535,'Relaciones funcionales; no es un plano de tuberías ni una secuencia de válvulas.',16)
    elif kind=='safety':
        p.line([(150,420),(850,420)],RED,'discharge',arrow=True,width=10);p.box(380,240,200,180,'Cuerpo','disc');p.box(420,140,120,95,'Resorte','spring');p.line([(480,235),(480,355)],INK,'spring',width=6);p.line([(410,355),(550,355)],GOLD,'disc',width=12)
        p.circle(210,280,50,'gauge');p.line([(210,330),(210,420)],BLUE,'gauge',width=4);p.line([(210,280),(235,250)],INK,'gauge',width=3);p.text(130,200,'Manómetro',19)
        p.line([(580,290),(820,290),(820,160)],RED,'discharge',arrow=True);p.text(710,115,'Descarga',21);p.text(125,470,'Entrada: presión actúa sobre el obturador. El resorte se opone a la apertura.',18)
    elif kind=='combustion':
        p.box(60,185,180,100,'Aire / registro','air');p.line([(240,235),(400,300)],BLUE,'air',arrow=True)
        p.box(70,370,200,85,'Combustible|pulverizador','nozzle');p.line([(270,410),(420,320)],GAS,'nozzle',arrow=True)
        p.poly([(420,310),(660,220),(610,310),(720,350),(450,370)],'#e9b25e');p.text(445,295,'Llama',25);p.box(425,435,260,60,'Mezcla / temperatura / tiempo','flame');p.line([(680,300),(890,300)],GAS,'exhaust',arrow=True);p.text(740,340,'Gases / chimenea',17)
    elif kind=='deaerator':
        p.box(280,170,420,230,'','tank',fill='#d2e6ee');p.text(365,190,'Desaireador',25)
        p.line([(85,240),(380,240)],BLUE,'water',arrow=True);p.text(80,205,'Agua',20)
        p.line([(100,350),(400,350)],RED,'water',arrow=True);p.text(80,370,'Vapor de calentamiento',17)
        p.line([(550,170),(550,110),(840,110)],INK,'vent',arrow=True);p.text(690,135,'Gases separados',17)
        for x in range(390,620,50):p.line([(x,250),(x+15,310)],BLUE,'water',width=3)
        p.line([(560,400),(560,480),(800,480)],BLUE,'pump',arrow=True);p.circle(830,480,35,'pump');p.text(650,525,'Altura y pérdidas de aspiración → NPSH',16)
    elif kind=='level-control':
        p.box(95,170,390,290,'','level',fill='#d4e9ed');p.text(140,190,'Domo',24);p.line([(100,300),(480,300)],BLUE,'level',width=5)
        for x,y in [(160,340),(210,320),(270,350),(310,325),(370,345),(430,330)]:p.circle(x,y,10,'bubbles',fill='#fff')
        p.box(635,185,260,95,'Controlador|nivel + caudales','flows');p.line([(480,275),(630,230)],INK,'level',arrow=True,dash=True)
        p.line([(280,170),(280,120),(930,120)],RED,'flows',arrow=True);p.circle(560,120,12,'flows');p.line([(560,135),(755,185)],INK,'flows',arrow=True,dash=True,width=2);p.text(360,90,'Medición caudal vapor',16)
        p.line([(930,390),(550,390),(485,390)],BLUE,'flows',arrow=True);p.circle(600,390,12,'flows');p.line([(600,375),(740,280)],INK,'flows',arrow=True,dash=True,width=2);p.text(780,350,'Caudal agua',17)
        p.text(100,535,'Punteado: señales de medición, no circulación de fluido',15)
        p.box(620,425,290,75,'Muestras / análisis|sales, oxígeno, aceite','samples');p.text(100,495,'Burbujas cambian volumen aparente',17)
    elif kind=='turbine':
        p.box(120,150,760,310,'Carcasa','pressure',fill='#e5e9df');p.line([(100,340),(900,340)],INK,'rotor',width=14)
        for x in [250,450,650]:
            for y in [220,280]:p.poly([(x,y),(x+35,y+20),(x+12,y+55)],GOLD if p.focus=='stator' else '#8baaa5')
            for y in [250,310]:p.poly([(x+80,y),(x+110,y-20),(x+100,y+40)],GOLD if p.focus=='rotor' else '#bc8d65')
        p.line([(100,200),(870,200)],RED,'exhaust',arrow=True,width=5);p.text(135,485,'Fijos: orientan / expanden     Móviles: intercambio de momento y par',18);p.text(180,120,'Entrada de vapor → sucesivas filas → escape',20)
    elif kind=='triangle':
        o=(230,445);u=(610,445);c=(745,180)
        p.line([o,u],GAS,'peripheral',arrow=True,width=6);p.line([u,c],BLUE,'relative',arrow=True,width=6);p.line([o,c],RED,'absolute',arrow=True,width=6)
        p.text(365,465,'U: periférica',22,GAS);p.text(685,325,'W: relativa',20,BLUE);p.text(265,240,'C: absoluta',22,RED)
        p.box(160,100,390,65,'C = U + W (vectores)','work');p.text(160,530,'Triángulo ilustrativo; construir uno a la entrada y otro a la salida.',17)
    elif kind=='shaft':
        p.line([(90,330),(910,330)],INK,'gear',width=15)
        p.box(140,245,130,180,'Cojinete|radial','radial');p.box(355,235,140,190,'Cojinete|de empuje','thrust');p.box(560,255,120,160,'Sellos','seal');p.box(755,210,175,230,'Acople /|reductor','gear')
        p.line([(200,175),(200,235)],BLUE,'radial',arrow=True);p.line([(315,460),(430,460)],RED,'thrust',arrow=True);p.text(90,510,'Radial: transversal al eje       Empuje: axial       Reductor: adapta velocidad / par',17)
    elif kind=='condenser':
        p.box(230,170,530,280,'Condensador de superficie','steam',fill='#e1e9e5')
        for y in [290,330,370]:p.line([(150,y),(830,y)],BLUE,'cooling',arrow=True,width=7)
        p.line([(460,110),(460,165)],RED,'steam',arrow=True);p.text(500,115,'Vapor de escape',20)
        p.line([(760,225),(890,225),(890,145)],INK,'air',arrow=True);p.text(780,100,'Aire / eyector',17)
        p.line([(470,450),(470,510),(760,510)],BLUE,'condensate',arrow=True);p.text(480,530,'Condensado → bomba',17);p.text(70,400,'Agua de circulación',16)
    elif kind=='astern':
        p.box(60,240,170,100,'Vapor principal','ahead');p.box(350,140,230,100,'Sección|marcha adelante','ahead');p.box(350,370,230,100,'Sección de ciar|marcha atrás','astern');p.box(690,250,150,100,'Transmisión|según diseño','gear');p.box(870,250,110,100,'Hélice','propeller')
        p.line([(230,280),(280,280),(280,190),(350,190)],RED,'ahead',arrow=True);p.line([(230,300),(280,300),(280,420),(350,420)],RED,'astern',arrow=True)
        p.line([(580,190),(650,190),(650,275),(690,275)],INK,'gear',arrow=True);p.line([(580,420),(650,420),(650,325),(690,325)],INK,'gear',arrow=True);p.line([(840,300),(870,300)],INK,'propeller',arrow=True)
        p.line([(500,240),(500,275),(615,275),(615,510),(900,510)],RED,'ahead',arrow=True,width=3);p.line([(500,470),(500,510),(615,510)],RED,'astern',width=3)
        p.text(645,525,'Escape → condensador según diseño',15)
        p.text(70,110,'Rosa: vapor     Oscuro: transmisión de par (no tubería)',17)
    else:raise ValueError(kind)
qa=Path(sys.argv[1]) if len(sys.argv)>1 else None
if qa:qa.mkdir(parents=True,exist_ok=True)
previews=[]
for m in modules:
    for i,s in enumerate(m['steps']):
        p=Picture(s['focus'],m['title'],f'Paso {i+1} de 4 · {s["title"]}');diagram(p,m['diagram'],m['steps']);p.save(OUT/f'{m["id"]}-{i+1}.svg')
        if qa:
            previews.append(p.im.resize((500,310)))
            if i==0:p.im.save(qa/f'{m["id"]}.png')
# Three actual GIF files, based on the same original circuit diagrams. They are opt-in in the UI.
for name in ['rankine','combustible','aceite']:
    m=next(m for m in modules if m['id']==name);frames=[]
    for k in range(48):
        i=k//12;s=m['steps'][i];p=Picture(s['focus'],m['title'],f'Recorrido animado · {i+1}/4 · {s["title"]}');diagram(p,m['diagram'],m['steps'])
        routes=[((315,220),(560,220)),((685,270),(685,370)),((560,420),(315,420)),((180,370),(180,270))]
        if name!='combustible' or i<3:
            a,b=routes[i];t=(k%12)/11;p.circle(a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,7,fill='#e5aa39')
        frames.append(p.im.resize((800,496)).convert('P',palette=Image.Palette.ADAPTIVE))
    frames[0].save(OUT/f'{name}.gif',save_all=True,append_images=frames[1:],duration=180,loop=0,optimize=True)
if qa:
    for start in range(0,len(previews),16):
        sheet=Image.new('RGB',(2000,1240),'white')
        for i,im in enumerate(previews[start:start+16]):sheet.paste(im,((i%4)*500,(i//4)*310))
        sheet.save(qa/f'contact-{start//16+1}.png')
print(f'{len(modules)*4} imágenes SVG y 3 GIF generados en {OUT}')
