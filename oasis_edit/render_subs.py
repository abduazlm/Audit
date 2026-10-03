import sys, math, numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
from data import CH, DUR
W,H=1080,700; FPS=30; Y0=1100
FONT="fonts/Montserrat[wght].ttf"
_fc={}
def font(sz,w=800):
    k=(sz,w)
    if k not in _fc:
        f=ImageFont.truetype(FONT,sz); f.set_variation_by_axes([w]); _fc[k]=f
    return _fc[k]
def tw(txt,f): 
    b=f.getbbox(txt); return b[2]-b[0], b
def ease_out_back(x,s=2.2):
    x=min(max(x,0),1)-1; return 1+(s+1)*x**3+s*x**2
def ease_out(x): x=min(max(x,0),1); return 1-(1-x)**3
def lerp(a,b,t): return a+(b-a)*t
EMPH={"OASIS","БАЙТЕРЕК","КЕРУЕН","ЧИСТАЯ","АСТАНЫ","МОЙКЕ?"}
PAD_X=30; PAD_Y=14; GAP=24
CY=290  # subtitle block center in band (frame y=1390)

def layout(ws):
    words=[w for _,w in ws]
    for size in range(124,50,-4):
        f=font(size)
        wid=[tw(w,f)[0]+2*PAD_X for w in words]
        for nl in (1,2):
            # split words into nl lines, balanced
            if nl==1: lines=[list(range(len(words)))]
            else:
                best=None
                for k in range(1,len(words)):
                    L=[list(range(k)),list(range(k,len(words)))]
                    m=max(sum(wid[i] for i in l)+GAP*(len(l)-1) for l in L)
                    if best is None or m<best[0]: best=(m,L)
                lines=best[1] if best else None
                if not lines: continue
            m=max(sum(wid[i] for i in l)+GAP*(len(l)-1) for l in lines)
            if m<=930: break
        else: continue
        break
    f=font(size); lh=int(size*1.55)
    pos={}  # idx -> (cx, cy, w, h)
    for li,l in enumerate(lines):
        tot=sum(wid[i] for i in l)+GAP*(len(l)-1)
        x=(W-tot)/2; cy=CY+(li-(len(lines)-1)/2)*lh
        for i in l:
            pos[i]=(x+wid[i]/2,cy,wid[i],size*1.3); x+=wid[i]+GAP
    return size,pos

def pill(w,h,glow=True):
    S=3; pw,ph=int(w*S),int(h*S)
    m=Image.new("L",(pw,ph),0); ImageDraw.Draw(m).rounded_rectangle((0,0,pw-1,ph-1),radius=ph*0.32,fill=255)
    m=m.resize((int(w),int(h)),Image.LANCZOS)
    g=np.zeros((int(h),int(w),4),np.uint8)
    ys=np.linspace(0,1,int(h))[:,None]
    g[...,0]=255; g[...,1]=(168-70*ys).astype(np.uint8).repeat(int(w),1); g[...,2]=(20*(1-ys)).astype(np.uint8).repeat(int(w),1)
    g[...,3]=np.asarray(m)
    return Image.fromarray(g,"RGBA")

def text_sprite(word,size,color=(255,255,255,255)):
    f=font(size); w,b=tw(word,f); m=40
    sh_h=int(size*1.6)+2*m
    r=f.getbbox("H"); y=(sh_h-(r[3]-r[1]))/2-r[1]
    im=Image.new("RGBA",(w+2*m,sh_h),(0,0,0,0)); d=ImageDraw.Draw(im)
    sh=Image.new("RGBA",im.size,(0,0,0,0)); ImageDraw.Draw(sh).text((m-b[0],y+6),word,font=f,fill=(0,0,0,150))
    sh=sh.filter(ImageFilter.GaussianBlur(9))
    d.text((m-b[0],y),word,font=f,fill=color)
    return Image.alpha_composite(sh,im), m

def paste(canvas,sprite,cx,cy,scale=1.0,alpha=1.0,blur=0,dy=0):
    if scale!=1.0:
        sprite=sprite.resize((max(1,int(sprite.width*scale)),max(1,int(sprite.height*scale))),Image.BICUBIC)
    if blur>0.3: sprite=sprite.filter(ImageFilter.GaussianBlur(blur))
    if alpha<1:
        a=sprite.getchannel("A").point(lambda v:int(v*alpha)); sprite=sprite.copy(); sprite.putalpha(a)
    x=int(cx-sprite.width/2); y=int(cy+dy-sprite.height/2)
    canvas.alpha_composite(sprite,(max(0,x),max(0,y)) ) if x>=0 and y>=0 and x+sprite.width<=W and y+sprite.height<=H else canvas.paste(sprite,(x,y),sprite)

chunks=[]
for end,ws in CH:
    size,pos=layout(ws); chunks.append((ws[0][0],end,ws,size,pos))
spr_cache={}

def frame(t):
    cv=Image.new("RGBA",(W,H),(0,0,0,0))
    for st,end,ws,size,pos in chunks:
        if not (st<=t<end+0.14): continue
        out=max(0,(t-end)/0.14); g_alpha=1-out; g_dy=-14*ease_out(out); g_s=1-0.04*out
        # pill (current word) with glide
        idx=max(i for i,(s,_) in enumerate(ws) if s<=t)
        cur=pos[idx]
        if idx>0 and t-ws[idx][0]<0.09:
            p=ease_out((t-ws[idx][0])/0.09); prev=pos[idx-1]
            cur=tuple(lerp(prev[k],cur[k],p) for k in range(4))
        age=t-ws[idx][0]
        emph=ws[idx][1] in EMPH
        pw=cur[2]*(1.08 if emph else 1.0); ph=cur[3]
        pscale=ease_out_back(age/0.2,2.0) if age<0.2 else 1.0
        pl=pill(pw,ph)
        # glow
        gl=Image.new("RGBA",(int(pw)+120,int(ph)+120),(0,0,0,0))
        gl.paste((255,110,0,120),(60,60,60+int(pw),60+int(ph)),pl.getchannel("A"))
        gl=gl.filter(ImageFilter.GaussianBlur(22))
        paste(cv,gl,cur[0],cur[1],pscale*g_s,g_alpha,dy=g_dy)
        paste(cv,pl,cur[0],cur[1],pscale*g_s,g_alpha,dy=g_dy)
        for i,(s,w) in enumerate(ws):
            if s>t: continue
            a=t-s; key=(w,size)
            if key not in spr_cache: spr_cache[key]=text_sprite(w,size)
            sp,_=spr_cache[key]; cx,cy,_,_=pos[i]
            sc=lerp(0.65,1.0,ease_out_back(a/0.2)) if a<0.2 else 1.0
            if w in EMPH and a<0.4: sc*=1+0.10*math.sin(min(a/0.4,1)*math.pi)
            al=min(1,a/0.08); bl=max(0,(0.14-a)/0.14)*9; dy=lerp(26,0,ease_out(a/0.2))
            paste(cv,sp,cx,cy,sc*g_s,al*g_alpha,bl,dy+g_dy)
    # CTA
    if t>=20.2:
        a=t-20.2; f=font(150); txt="ЗАЕЗЖАЙ!"; w=tw(txt,f)[0]+110; h=230
        pulse=1+0.05*math.sin(max(0,a-0.6)*4.5) if a>0.6 else 1
        sc=ease_out_back(a/0.45,2.4)*pulse
        pl=pill(w,h); sp,_=text_sprite(txt,150)
        gl=Image.new("RGBA",(w+160,h+160),(0,0,0,0)); gl.paste((255,110,0,130),(80,80,80+w,80+h),pl.getchannel("A")); gl=gl.filter(ImageFilter.GaussianBlur(30))
        cy=470
        paste(cv,gl,W/2,cy,sc,min(1,a/0.2)); paste(cv,pl,W/2,cy,sc,min(1,a/0.2)); paste(cv,sp,W/2,cy,sc,min(1,a/0.2))
        if a>0.5:
            b=a-0.5; f2=font(42,700); s2="АВТОМОЙКА 24/7  ·  ЦЕНТР АСТАНЫ"
            sp2,_=text_sprite(s2,42); 
            im=sp2  # semi-bold small caps
            paste(cv,im,W/2,655,1.0,min(1,b/0.3),max(0,(0.3-b)/0.3)*8,lerp(30,0,ease_out(b/0.4)))
    return cv

if __name__=="__main__":
    if len(sys.argv)>1:   # preview stills
        for t in map(float,sys.argv[1:]): frame(t).save(f"prev_{t}.png")
    else:
        out=sys.stdout.buffer
        for n in range(int(round(DUR*FPS))):
            out.write(frame(n/FPS).tobytes())
