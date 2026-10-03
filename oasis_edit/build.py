import numpy as np, subprocess, wave, sys
SRC="/root/.claude/uploads/4cd4152f-d446-5824-a2f4-47ddaef89bb1/c4c9c7e7-0929-04.mov"
DUR=25.47; SR=44100
CUTS=[0,4.37,6.87,8.9,10.0,11.37,11.93,12.47,14.43,15.5,16.93,19.0,22.43,DUR]

# ---------- subtitles (text read from user's burned-in version) ----------
# chunk = (end, [(start, word), ...])
CH=[
 (0.98,[(0.2,"СКОЛЬКО"),(0.6,"ВРЕМЕНИ")]),
 (2.5,[(1.0,"ВЫ"),(1.3,"ТЕРЯЕТЕ"),(1.6,"НА"),(1.9,"МОЙКЕ?")]),
 (4.2,[(3.2,"ОБЫЧНО"),(3.5,"ЭТО"),(3.8,"ВЫГЛЯДИТ")]),
 (5.5,[(4.2,"ТАК:"),(4.6,"СИДИШЬ"),(5.1,"ЖДЁШЬ")]),
 (6.8,[(5.6,"ЛИСТАЕШЬ"),(6.2,"СВОЙ"),(6.4,"ТЕЛЕФОН")]),
 (8.0,[(7.2,"В"),(7.4,"OASIS"),(7.65,"МЫ")]),
 (8.95,[(8.0,"СДЕЛАЛИ"),(8.25,"ЭТО"),(8.45,"ПО-ДРУГОМУ")]),
 (9.75,[(9.0,"МЫ"),(9.3,"НАХОДИМСЯ")]),
 (11.05,[(9.8,"В ЦЕНТРЕ"),(10.2,"ГОРОДА"),(10.5,"АСТАНЫ")]),
 (11.55,[(11.15,"МОЖЕТЕ"),(11.4,"ОСТАВИТЬ")]),
 (12.4,[(11.6,"У НАС"),(11.95,"МАШИНУ")]),
 (13.55,[(12.5,"ПРОГУЛЯТЬСЯ"),(12.8,"ПО"),(13.0,"БУЛЬВАРУ")]),
 (14.4,[(13.6,"СХОДИТЬ"),(14.0,"В"),(14.15,"КЕРУЕН")]),
 (15.2,[(14.5,"ЛИБО"),(14.7,"ВЫПИТЬ"),(15.0,"КОФЕ")]),
 (16.0,[(15.2,"А ТАКЖЕ"),(15.65,"РЯДОМ")]),
 (16.9,[(16.0,"НАХОДИТСЯ"),(16.35,"БАЙТЕРЕК")]),
 (17.5,[(17.0,"ВЕРНУЛИСЬ,")]),
 (18.95,[(17.6,"А"),(17.8,"МАШИНА"),(18.2,"УЖЕ"),(18.5,"ЧИСТАЯ")]),
]
def t(s):
    h=int(s//3600); m=int(s%3600//60); return "%d:%02d:%05.2f"%(h,m,s%60)
ORANGE="&H0080FF&"; WHITE="&HFFFFFF&"
ev=[]
for end,ws in CH:
    for i,(st,w) in enumerate(ws):
        e=ws[i+1][0] if i+1<len(ws) else end
        parts=[]
        for j in range(i+1):
            word=ws[j][1]
            cur=(j==i)
            col=ORANGE if (cur or word=="OASIS") else WHITE
            if cur: parts.append("{\\c%s\\fscx130\\fscy130\\t(0,130,\\fscx100\\fscy100)}%s{\\fscx100\\fscy100}"%(col,word))
            else: parts.append("{\\c%s}%s"%(col,word))
        line=" ".join(parts)
        ev.append("Dialogue: 1,%s,%s,Sub,,0,0,0,,{\\fad(0,80)}%s"%(t(st),t(e),line))
# outro CTA
ev.append("Dialogue: 2,%s,%s,Cta,,0,0,0,,{\\an5\\pos(540,1560)\\fscx20\\fscy20\\alpha&HFF&\\t(0,300,\\fscx115\\fscy115\\alpha&H00&)\\t(300,500,\\fscx100\\fscy100)\\t(1200,1500,\\fscx108\\fscy108)\\t(1500,1800,\\fscx100\\fscy100)\\t(2600,2900,\\fscx108\\fscy108)\\t(2900,3200,\\fscx100\\fscy100)}ЗАЕЗЖАЙ!"%(t(20.2),t(25.47)))
ev.append("Dialogue: 2,%s,%s,Small,,0,0,0,,{\\an5\\move(540,1760,540,1700,0,350)\\fad(350,0)}АВТОМОЙКА 24/7 · ЦЕНТР АСТАНЫ"%(t(20.7),t(25.47)))
# progress bar
ev.append("Dialogue: 3,%s,%s,Bar,,0,0,0,,{\\an7\\pos(0,0)\\fscx1\\t(0,%d,\\fscx100)\\p1\\c&H0080FF&\\bord0\\shad0}m 0 0 l 1080 0 1080 12 0 12"%(t(0),t(DUR),int(DUR*1000)))
hdr="""[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding
Style: Sub,Liberation Sans,88,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,-1,0,0,0,100,100,1,0,1,7,4,2,70,70,540,1
Style: Cta,Liberation Sans,150,&H000080FF,&H000080FF,&H00000000,&H90000000,-1,0,0,0,100,100,2,0,1,9,5,5,40,40,0,1
Style: Small,Liberation Sans,48,&H00FFFFFF,&H00FFFFFF,&H00000000,&H90000000,-1,0,0,0,100,100,3,0,1,4,3,5,40,40,0,1
Style: Bar,Liberation Sans,20,&H00FFFFFF,&H00FFFFFF,&H00000000,&H00000000,0,0,0,0,100,100,0,0,1,0,0,7,0,0,0,1

[Events]
Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text
"""
open("subs.ass","w").write(hdr+"\n".join(ev)+"\n")

# ---------- audio ----------
rng=np.random.default_rng(1)
N=int(DUR*SR); music=np.zeros((N,2)); sfx=np.zeros((N,2))
def add(buf,x,at,pan=0.5):
    i=int(at*SR); x=x[:max(0,N-i)]
    buf[i:i+len(x),0]+=x*(1-pan)*2*0.5+x*0; buf[i:i+len(x),1]+=x*pan*2*0.5
def tt(d): return np.arange(int(d*SR))/SR
def lp(x,fc):
    a=np.exp(-2*np.pi*fc/SR); y=np.zeros_like(x); s=0
    for i in range(len(x)): s=(1-a)*x[i]+a*s; y[i]=s
    return y
def kick():
    x=tt(0.35); f=45+110*np.exp(-x*25); return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*9)
def hat():
    x=tt(0.06); n=rng.standard_normal(len(x)); n=n-np.concatenate([[0],n[:-1]]); return n*np.exp(-x*70)*0.35
def clap():
    x=tt(0.2); n=rng.standard_normal(len(x)); return lp(n,6000)*np.exp(-x*22)*0.8
def note(f,d,saw=True):
    x=tt(d); y=sum(np.sin(2*np.pi*f*k*x)/k for k in range(1,6 if saw else 2)); return y*np.minimum(1,x*60)*np.exp(-x*3)
def whoosh(d=0.5,up=True):
    x=tt(d); n=rng.standard_normal(len(x)); out=np.zeros_like(n)
    # swept filter via blocks
    blk=512
    for i in range(0,len(x),blk):
        p=i/len(x); fc=300+5000*(p if up else 1-p); out[i:i+blk]=lp(n[i:i+blk],fc)
    env=np.sin(np.pi*np.linspace(0,1,len(x)))**1.5
    return out*env*0.9
BPM=124; beat=60/BPM
roots=[55,43.65,65.41,49.0]  # A F C G
DROP=6.87; OUT=19.0
b=0
while b*beat<DUR:
    tm=b*beat; bar=int(b//4)%4; r=roots[bar]
    full = tm>=DROP-1e-6
    # pad / bass always
    if b%4==0:
        pad=sum(note(r*2*m,beat*4,False)*np.exp(0) for m in (1,1.5,2))*0.0
    if full:
        add(music,kick()*0.9,tm,0.5)
        if b%2==1: add(music,clap()*0.5,tm,0.5)
        add(music,hat()*0.6,tm+beat/2,0.6)
        add(music,hat()*0.3,tm,0.4)
    else:
        if b%2==0: add(music,kick()*0.45,tm,0.5)
        add(music,hat()*0.3,tm+beat/2,0.5)
    # bass 8ths
    for h in range(2):
        add(music,lp(note(r*(2 if h else 1),beat/2),500)*(0.55 if full else 0.3),tm+h*beat/2,0.5)
    # arp pluck
    arp=[1,1.5,2,3][b%4]*r*4
    add(music,note(arp,beat,True)*(0.16 if full else 0.1),tm,0.35+0.3*(b%2))
    b+=1
# riser before drop
x=tt(DROP-5.5)[:]; n=rng.standard_normal(len(x))
ris=np.zeros_like(n)
for i in range(0,len(x),1024):
    p=i/len(x); ris[i:i+1024]=lp(n[i:i+1024],400+6000*p)
ris*=np.linspace(0,1,len(x))**2*0.25
add(sfx,ris,5.5-0.0+0.0 if False else 0.0+ (DROP-len(x)/SR))
# end: fade music out last 1.2s
fade=np.ones(N); k=int(1.2*SR); fade[-k:]=np.linspace(1,0,k); music*=fade[:,None]
music*=0.8/np.max(np.abs(music))
# sfx at cuts
for c in CUTS[1:-1]:
    add(sfx,whoosh(0.45,up=True)*0.5,max(0,c-0.35),0.5)
# impact at drop and logo
def boom():
    x=tt(1.2); f=60*np.exp(-x*2)+30; return np.sin(2*np.pi*np.cumsum(f)/SR)*np.exp(-x*3.5)*1.2
add(sfx,boom(),DROP-0.02); add(sfx,boom()*0.9,OUT-0.02)
def ding(): 
    x=tt(1.6); return (np.sin(2*np.pi*1318*x)+0.5*np.sin(2*np.pi*1975*x))*np.exp(-x*3)*0.25
add(sfx,ding(),OUT+0.05); add(sfx,ding()*0.8,20.2)
# word ticks
for end,ws in CH:
    for st,_ in ws:
        x=tt(0.05); add(sfx,np.sin(2*np.pi*1800*x)*np.exp(-x*90)*0.12,st)
def wr(name,a):
    a=np.clip(a,-1,1); d=(a*32767).astype('<i2')
    with wave.open(name,'wb') as w: w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes())
wr("music.wav",music); wr("sfx.wav",sfx)

# ---------- video filter ----------
segs=[(CUTS[i],CUTS[i+1]) for i in range(len(CUTS)-1)]
fc=[]; labs=[]
for i,(a,bb) in enumerate(segs):
    d=bb-a; z0,z1=(1.0,1.09) if i%2==0 else (1.09,1.0)
    fc.append(f"[0:v]trim={a}:{bb},setpts=PTS-STARTPTS,scale=w='trunc(1080*({z0}+({z1}-{z0})*t/{d:.3f})/2)*2':h='trunc(1920*({z0}+({z1}-{z0})*t/{d:.3f})/2)*2':eval=frame,crop=1080:1920,setsar=1,fps=30[v{i}]")
    labs.append(f"[v{i}]")
fc.append("".join(labs)+f"concat=n={len(segs)}:v=1:a=0,eq=contrast=1.06:saturation=1.15,vignette=PI/6,ass=subs.ass:fontsdir=/usr/share/fonts/truetype/liberation[vout]")
# audio: voice + ducked music + sfx
fc.append("[0:a]highpass=f=80,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,volume=1.3[voice0]")
fc.append("[voice0]asplit=2[voice][vsc]")
fc.append("[1:a]volume=0.55[m0]")
fc.append("[m0][vsc]sidechaincompress=threshold=0.02:ratio=8:attack=20:release=400[mduck]")
fc.append("[2:a]volume=0.6[s]")
fc.append("[voice][mduck][s]amix=inputs=3:normalize=0,alimiter=limit=0.95[aout]")
open("filter.txt","w").write(";\n".join(fc))
