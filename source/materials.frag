precision highp float;

/* Impossible material system — one fragment program, nine materials.
   Field-driven materials share the site’s warped phase; geometric
   families use explicit curves, disks and distance fields with shared
   color roles. Surfaces are matte: no specular highlights. Color is mixed
   in OKLab and converted once at the end; emitted light adds in linear
   light; single-pixel grain is applied to lightness and gated to the body
   of each material. */

uniform vec2  uRes;
uniform float uRateA, uRateB;
uniform float uTime, uSeed, uGrain, uMode, uScale, uOffset, uRotation, uDisplace, uSize;
uniform vec3  uE, uS, uV, uN, uP, uEs, uW;      /* Oklab tokens: ember, sky, violet, navy, pale, ember-soft, white */
uniform vec3  uC1, uC2, uC3, uC4, uC5;          /* Oklab five-stop ramp for field-driven materials */

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }
/* pixel grain uses an integer-quality hash so it never forms a pattern */
float grainHash(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1.,0.)), u.x), mix(hash(i+vec2(0.,1.)), hash(i+vec2(1.,1.)), u.x), u.y);
}
float fbm(vec2 p){ float v=0., a=.5; for(int i=0;i<3;i++){ v+=a*noise(p); p=p*2.03+vec2(1.7,9.2); a*=.5; } return v; }
mat2 rot(float a){ float c=cos(a), s=sin(a); return mat2(c,-s,s,c); }

vec3 ok2linear(vec3 c){
  float l_ = c.x + 0.3963377774*c.y + 0.2158037573*c.z;
  float m_ = c.x - 0.1055613458*c.y - 0.0638541728*c.z;
  float s_ = c.x - 0.0894841775*c.y - 1.2914855480*c.z;
  vec3 lms = vec3(l_*l_*l_, m_*m_*m_, s_*s_*s_);
  vec3 lin = vec3(
     4.0767416621*lms.x - 3.3077115913*lms.y + 0.2309699292*lms.z,
    -1.2684380046*lms.x + 2.6097574011*lms.y - 0.3413193965*lms.z,
    -0.0041960863*lms.x - 0.7034186147*lms.y + 1.7076147010*lms.z);
  return max(lin,0.);
}
vec3 ok2rgb(vec3 c){vec3 lin=ok2linear(c);return mix(12.92*lin,1.055*pow(lin,vec3(1./2.4))-.055,step(vec3(.0031308),lin));}
vec3 linear2ok(vec3 c){
 vec3 lms=pow(max(vec3(dot(c,vec3(.4122214708,.5363325363,.0514459929)),dot(c,vec3(.2119034982,.6806995451,.1073969566)),dot(c,vec3(.0883024619,.2817188376,.6299787005))),0.),vec3(1./3.));
 return vec3(dot(lms,vec3(.2104542553,.793617785,-.0040720468)),dot(lms,vec3(1.9779984951,-2.428592205,.4505937099)),dot(lms,vec3(.0259040371,.7827717662,-.808675766)));
}
vec3 materialMix(vec3 a,vec3 b,float f){
 f=clamp(f,0.,1.);vec3 c=mix(a,b,f);float shoulder=sin(f*3.14159265);
 float cool=smoothstep(.018,.075,-c.z),warm=smoothstep(.028,.115,c.y);
 float depth=smoothstep(.10,.30,abs(a.x-b.x));
 float angle=(-.72*cool-.42*warm)*shoulder*depth;
 float ca=cos(angle),sa=sin(angle);c.yz=vec2(ca*c.y-sa*c.z,sa*c.y+ca*c.z)*(1.+.14*shoulder);
 return c;
}
/* Color is interpolated in light: a plain OKLab mix, no hue shoulder. */
vec3 okmix(vec3 a,vec3 b,float t){return mix(a,b,clamp(t,0.,1.));}

/* ---- shared cause ------------------------------------------------ */
float phase(vec2 uv){
  vec2 p = rot(uRotation) * uv / 0.72;
  float s = 4.27 * 0.12;
  vec2 q = vec2(fbm(p*s + uSeed*9.0 + uTime*uRateA), fbm(p*s + vec2(7.3,2.1) - uSeed*4.0 + uTime*uRateB));
  float n = fbm(p*s*1.3 + q*uDisplace*0.22);
  return p.x*0.24 + n*0.9 + uOffset;
}
vec3 pick(float i, vec3 a, vec3 b, vec3 c, vec3 d, vec3 e){
  vec3 r=a; r=mix(r,b,step(.5,i)); r=mix(r,c,step(1.5,i)); r=mix(r,d,step(2.5,i)); r=mix(r,e,step(3.5,i)); return r;
}
vec3 ramp5(float t){
 /* the hero ramp: five stops, five equal segments, opening and closing on black */
 float x=fract(t)*5.0; float i=floor(x);
 float f=smoothstep(.125,.875,fract(x)); f=f*f*(3.-2.*f);
 return mix(pick(i,uC1,uC2,uC3,uC4,uC5),pick(i,uC2,uC3,uC4,uC5,uC1),f);
}

/* ---- materials ---------------------------------------------------- */
float foldPhase(vec2 uv){return phase(uv*.9)*uScale;}
/* Pressed-sheet profile: a slow rise across most of the period and a steep,
   rounded return. Both segments are smoothstep pieces, so the height is C1
   across the crest and across the wrap; there is no seam to alias. */
float foldProfile(float t){const float a=.72;return t<a?smoothstep(0.,a,t):1.-smoothstep(a,1.,t);}
float foldH(vec2 uv){return foldProfile(fract(foldPhase(uv)));}
vec3 fold(vec2 uv,out float body){
 float px=1./uRes.y;
 float h=foldH(uv);
 float hx=(foldH(uv+vec2(px,0.))-foldH(uv-vec2(px,0.)))/(2.*px);
 float hy=(foldH(uv+vec2(0.,px))-foldH(uv-vec2(0.,px)))/(2.*px);
 vec3 n=normalize(vec3(-hx*.03,-hy*.03,1.));
 vec3 key=normalize(vec3(-.55,.45,.55));   /* one raking light, upper left */
 vec3 back=normalize(vec3(.50,-.30,.34));  /* cool return light, lower right */
 float diff=max(dot(n,key),0.), rim=max(dot(n,back),0.);
 float tone=fbm(uv*1.6+uSeed*4.);          /* slow tonal drift across the sheet */
 /* warm faces: deep red in shadow, full Ember in the light */
 float shade=clamp(.10+.95*diff-.55*(tone-.5),0.,1.);
 vec3 deep=okmix(vec3(0.),uE,.34);
 vec3 warm=okmix(deep,uE,smoothstep(.05,.95,shade));
 /* return faces: Navy lifting to Violet, Sky where the back light grazes */
 /* along the return face: Sky at the crest, Violet, Navy, then the trough */
 vec3 cool=okmix(uN,uV,smoothstep(.10,.95,rim)*smoothstep(.05,.75,h)*.9);
 cool=okmix(cool,uS,pow(rim,3.)*smoothstep(.66,1.,h)*.26);
 float away=smoothstep(.50,.12,diff);
 vec3 col=okmix(warm,cool,away);
 /* trough occlusion: through Navy into Black, never gray */
 col=okmix(col,uN,smoothstep(.50,.06,h)*.72);
 col=okmix(col,vec3(0.),smoothstep(.09,0.,h)*.75);
 body=.28+.72*smoothstep(.1,.6,h)*(.4+.6*diff);
 return col;
}

vec3 ribbonLayer(vec2 p, float seed, float tw, out float inside, out float density, out float t){
  float x = p.x;
  float c = .15*sin(x*2.1+seed*6.) + .08*sin(x*4.7+1.3+seed) + .10*(fbm(vec2(x*1.6+seed, uTime*.03))-.5) + uOffset;
  float w = .12 + .09*sin(x*1.6+uTime*.06+2.+seed) + .035*sin(x*3.9+.5);
  float a = (p.y-c)/w;
  inside = 1.-smoothstep(.96,1.04,abs(a));
  density = sqrt(max(0., 1.-a*a));
  t = a*.34+.5 + tw*sin(x*2.6+uTime*.05+seed) + .12*fbm(vec2(x*4., a*2.));
  return vec3(0.);
}
vec3 ribbon(vec2 uv, out float body){
  vec2 p = rot(uRotation)*uv;
  vec3 bg = vec3(0.);
  float in1, d1, t1; ribbonLayer(p + vec2(0.,.19), uSeed+2.3, .22, in1, d1, t1);
  vec3 back = ramp5(t1+.4); back = okmix(uV, back, smoothstep(0.,.6,d1)); back.x *= .35+.48*d1;
  vec3 col = okmix(bg, back, in1);
  float in2, d2, t2; ribbonLayer(p, uSeed, .28, in2, d2, t2);
  vec3 front = ramp5(t2); front = okmix(uV, front, smoothstep(0.,.55,d2)); front.x *= .48+.52*d2;
  col = okmix(col, front, in2);
  body = max(in2*d2, in1*d1*.6);
  return col;
}

vec3 eclipse(vec2 uv,out float body){
 float R=.26;vec2 q=uv-vec2(0.,.015);float r=length(q),d=r-R;
 vec2 dir=q/max(r,.0001),sun=normalize(vec2(.12,.99));
 float warm=.5+.5*dot(dir,sun),ang=atan(q.y,q.x);
 float ray=.82+.18*fbm(vec2(ang*9.+uSeed*3.,d*13.-uTime*uRateA));
 float halo=exp(-max(d,0.)*(9.+8.*(1.-warm)))*ray*(.4+.6*warm);
 float rim=exp(-abs(d)*310.)*(.22+.58*pow(warm,3.));
 vec3 color=okmix(uS,uE,smoothstep(.30,.78,warm));
 vec3 col=okmix(vec3(0.),color,clamp(halo+rim,0.,1.));
 col*=smoothstep(-1./uRes.y,1./uRes.y,d);
 vec2 star=q-R*sun;vec2 st=rot(.36)*star;
 float flare=exp(-length(st)*380.)+exp(-abs(st.x)*1000.-abs(st.y)*44.)*.85+exp(-abs(st.y)*1000.-abs(st.x)*95.)*.65;
 col=okmix(col,uW,flare);
 body=clamp(halo+rim,0.,1.)*step(0.,d);
 return col;
}

/* Orbs: flat disks, each a shaped gradient of one color. No sphere shading —
   the light is a direction across the disk, falling from the full token
   through its own dark (Navy-tinted) side. Painted back to front. */
vec3 orbDisk(vec2 uv, vec2 c, float rr, float ang, vec3 dom, vec3 dark, vec3 sec, float seed, inout vec3 col, inout float body){
  float px=1./min(uRes.x,uRes.y);
  float r=length(uv-c);
  float cov=1.-smoothstep(rr-px,rr+px,r);
  if(cov<=0.) return col;
  vec2 q=(uv-c)/rr;
  vec2 L=vec2(cos(ang),sin(ang));
  float u=dot(q,L);                                  /* -1 dark edge … +1 lit edge */
  float mottle=(fbm(uv*7.+seed*13.)-.5)*.16;          /* gel unevenness */
  float lit=clamp(pow(.5+.5*u,1.35)+mottle,0.,1.);
  vec3 c1=okmix(dark,dom,smoothstep(.02,.92,lit));
  c1.x*=.74+.26*lit;                                  /* lightness falls with the light, hue stays */
  /* a soft bloom of the lighter relative near the lit edge, inside the silhouette */
  float edge=1.-smoothstep(.55,1.,r/rr);
  c1=okmix(c1,sec,pow(max(0.,u),4.)*(1.-edge)*.45);
  col=okmix(col,c1,cov);
  body=max(body,cov*(.25+.75*lit));
  return col;
}
vec3 orbs(vec2 uv, out float body){
  vec3 col=vec3(0.); body=0.;
  float sd=uSeed*10.;
  vec2 j0=(vec2(hash(vec2(1.,sd)),hash(vec2(2.,sd)))-.5)*.08;
  vec2 j1=(vec2(hash(vec2(3.,sd)),hash(vec2(4.,sd)))-.5)*.08;
  vec2 j2=(vec2(hash(vec2(5.,sd)),hash(vec2(6.,sd)))-.5)*.08;
  float a0=hash(vec2(7.,sd))*6.2831;
  /* back to front: small satellites, then the mass */
  vec3 deepE=okmix(vec3(0.),uE,.42), deepV=okmix(uN,uV,.35), deepS=uV;
  col=orbDisk(uv,vec2(-.37,.34)+j2,.085,a0+2.2,uV,deepV,uS,3.,col,body);
  col=orbDisk(uv,vec2(.40,.05)+j1,.06,a0+.6,uS,deepS,uP,5.,col,body);
  col=orbDisk(uv,vec2(-.02,.42)+j0,.075,a0+3.4,uE,deepE,uEs,7.,col,body);
  col=orbDisk(uv,vec2(.27,-.30)+j2,.15,a0+1.1,uV,deepV,uS,11.,col,body);
  col=orbDisk(uv,vec2(.25,.24)+j1,.175,a0-.5,uE,deepE,uEs,13.,col,body);
  col=orbDisk(uv,vec2(-.15,-.06)+j0,.31,a0+.9,uS,deepS,uP,17.,col,body);
  return col;
}

/* Prism: a long-exposure spectral streak. Parallel bands lie along one
   diagonal, each a soft gaussian of one token; they add in linear light
   on black, so where bands overlap the light brightens toward white. */
float gband(float x,float w){return exp(-x*x/(2.*w*w));}
vec3 chrome(vec2 uv, out float body){
  vec2 p = rot(uRotation)*uv;
  float bow = .10*sin(p.x*1.3+uSeed*5.);
  float d = p.y - bow - uOffset*.5;
  float along = p.x;
  float env = smoothstep(-1.05,-.35,along)*(1.-smoothstep(.30,1.0,along));
  float expo = .55+.45*fbm(vec2(along*2.2+uSeed*3., uTime*.03));      /* exposure varies along the streak */
  float stair = 1.-.20*smoothstep(.35,.65,fract(along*5.+uSeed));       /* the faint stepping of a long exposure */
  vec3 V=ok2linear(uV),S=ok2linear(uS),P=ok2linear(uP),E=ok2linear(uE),Es=ok2linear(uEs),N=ok2linear(uN),W=vec3(1.);
  float k=.085;
  vec3 lin = N *gband(d+3.1*k,.060)*.50
           + V *gband(d+2.05*k,.036)*1.00
           + S *gband(d+1.0*k,.034)*1.10
           + mix(P,W,.6)*gband(d,.040)*1.35
           + E *gband(d-1.0*k,.040)*1.15
           + Es*gband(d-2.05*k,.046)*.60
           + N *gband(d-3.2*k,.070)*.30;
  lin += (S*.5+E*.5)*exp(-abs(d)*4.)*.16;                                /* the glow into the black */
  lin *= env*expo*stair;
  lin = 1.-exp(-lin*1.35);
  body = clamp(dot(lin,vec3(.33)),0.,1.)*1.2;
  return linear2ok(lin);
}

/* Thermal body: a warm mass on paper, read through its edge. The edge runs
   Ember → Navy hairline → Violet → Sky → Pale → paper, and the halo is where
   the grain lives, like a thermal print. */
vec3 thermal(vec2 uv, out float body){
  float m = 0.;
  vec2 c0 = vec2(-.06,.03) + vec2(sin(uTime*.05+uSeed*3.),cos(uTime*.04+uSeed))*.03;
  vec2 c1 = vec2(.24,-.27) + vec2(sin(uTime*.07+2.1+uSeed*3.),cos(uTime*.06+1.3+uSeed))*.05;
  vec2 c2 = vec2(.14,.33) + vec2(sin(uTime*.09+4.2),cos(uTime*.08+2.6))*.04;
  m += .27*.27/max(dot(uv-c0,uv-c0),1e-4);
  m += .15*.15/max(dot(uv-c1,uv-c1),1e-4);
  m += .065*.065/max(dot(uv-c2,uv-c2),1e-4);
  float s = m - 1.0 + .10*(fbm(uv*6.+uSeed*2.)-.5);
  vec3 col = uW;
  col = okmix(col, uP, smoothstep(-.60,-.20,s));
  col = okmix(col, uS, smoothstep(-.30,-.10,s));
  col = okmix(col, uV, smoothstep(-.13,-.045,s));
  col = okmix(col, uN, smoothstep(-.055,-.012,s)*.92);
  col = okmix(col, uE, smoothstep(-.016,.03,s));
  col = okmix(col, uEs, smoothstep(.2,3.6,s)*.5);       /* the center runs hotter, lighter */
  float halo = smoothstep(-.7,-.25,s)*(1.-smoothstep(-.12,.02,s));
  body = halo*1.1 + smoothstep(-.02,.2,s)*.3;
  return col;
}

float halftone(vec2 uv, float ang, float freq, float density){
  vec2 g = rot(ang)*uv*freq; vec2 f = fract(g)-.5; float d = length(f);
  float rad = sqrt(clamp(density,0.,1.))*.52;
  float aa = 1.4*freq/uRes.y;
  return 1.-smoothstep(rad-aa, rad+aa, d);
}
/* Burst: rays of light converging on a black axis. Angular noise makes the
   rays; a soft cross through the center stays void; color turns with the
   angle from Ember through White to Sky, adding in linear light. */
vec3 riso(vec2 uv, out float body){
  vec2 q = uv - vec2(.04+.05*sin(uSeed*7.), .0);
  float r = length(q), ang = atan(q.y,q.x);
  float rays = fbm(vec2(ang*3.2+uSeed*3., r*1.2));
  float fine = fbm(vec2(ang*13.-uSeed*2., 2.3+r*.5));
  float ray = pow(rays,2.4)*1.3 + pow(fine,1.8)*.7;
  float warm = smoothstep(-.30,.30,q.y+.04*sin(ang*3.+uSeed));            /* warm above, cool below, white between */
  vec3 S=ok2linear(uS),E=ok2linear(uE),Es=ok2linear(uEs),P=ok2linear(uP),N=ok2linear(uN),W=vec3(1.);
  vec3 cool = mix(mix(N,S,.7),P,.35), hot = mix(E,Es,.25);
  vec3 hue = mix(cool, hot, warm);
  hue = mix(hue, W, (1.-abs(warm*2.-1.))*.45);                             /* the middle burns white */
  float fall = .15+.85*exp(-r*.9);
  float I = fall*(.06+1.1*ray);
  vec3 lin = hue*I + W*pow(ray,3.)*fall*.8;
  float cx = smoothstep(.02,.10,abs(q.x)), cy = smoothstep(.012,.062,abs(q.y));
  lin *= cx*cy;                                                           /* the black axis */
  lin *= 1.-smoothstep(.75,1.15,r);
  lin = 1.-exp(-lin*1.3);
  body = clamp(dot(lin,vec3(.33)),0.,1.)*1.1;
  return linear2ok(lin);
}

/* Line screen: one ink, one fine pitch. A body appears only as line weight —
   near solid at its center, hairline at its edge, gone in the reserve. */
vec3 lines(vec2 uv, out float body){
  float ph = phase(uv);
  float freq = 88.*uScale/3.;
  vec2 g = rot(uRotation*.25)*uv;
  vec2 fc = (uv-vec2(-.03,-.12))*vec2(1.,1.18);
  float form = 1.-smoothstep(.02,.50,length(fc)+.05*(fbm(uv*3.+uSeed)-.5));
  float v = form*(.78+.22*sin(ph*6.2831));
  g.y += .022*form*sin(uv.x*7.+uSeed*4.);                /* the pitch bows over the body */
  float y = abs(fract(g.y*freq)-.5)*2.;
  float reserve = 1.-smoothstep(.10,.50,uv.y);
  float thick = mix(.09*reserve, .93, pow(v,1.1));
  float aa = 1.4*freq/uRes.y;
  float line = 1.-smoothstep(thick-aa, thick+aa, y);
  line *= step(.002,thick);
  vec3 paper = uW;
  vec3 ink = uE;
  body = line*.5;
  return okmix(paper, ink, line);
}

/* Edge light: one luminous line across a dark reserve. The core is a pixel
   of White; the light splits thinly at its edges — Ember below, Sky above,
   with a hair of Violet where the two cross — and the glow carries the grain. */
vec3 edge(vec2 uv, out float body){
  vec2 p = rot(uRotation)*uv;
  float px = 1./min(uRes.x,uRes.y);
  float c = .06*sin(p.x*2.4+uSeed) + .03*fbm(vec2(p.x*3.,uTime*.02)) - .02;
  float d = p.y - c;
  float along = .40+.60*fbm(vec2(p.x*3.6+uSeed*2., uTime*.05));
  float core = exp(-abs(d)/(1.1*px));
  float below = 1.-smoothstep(-.002,.002,d);
  float gE = exp(-max(0.,-d)*34.)*below;
  float gS = exp(-max(0.,d)*62.)*(1.-below);
  float far = exp(-abs(d)*6.)*.34;
  /* emission adds in linear light, so the glow keeps the token hues */
  vec3 E=ok2linear(uE), S=ok2linear(uS), V=ok2linear(uV), N=ok2linear(uN), Es=ok2linear(uEs);
  float hairV = exp(-abs(d-2.4*px)/(1.3*px));
  float hairS = exp(-abs(d-5.5*px)/(1.6*px));
  float hairE = exp(-abs(d+2.2*px)/(1.3*px));
  float hairE2 = exp(-abs(d+5.5*px)/(1.6*px));
  vec3 lin = N*far*along*1.4
           + E*gE*(.45+.45*along) + S*gS*(.40+.45*along)
           + V*hairV*.45*along + S*hairS*.28*along + Es*hairE*.30*along + E*hairE2*.25*along
           + vec3(1.)*core*(.55+.45*along);
  lin = 1.-exp(-lin*1.25);
  vec3 col = linear2ok(lin);
  body = (gE+gS)*1.2 + far*.8;
  return col;
}

void main(){
  vec2 uv = (gl_FragCoord.xy - .5*uRes) / min(uRes.x, uRes.y);
  vec3 col; float body = 1.;
  if(uMode < 1.5)      col = fold(uv, body);
  else if(uMode < 2.5) col = eclipse(uv, body);
  else if(uMode < 3.5) col = orbs(uv, body);
  else if(uMode < 4.5) col = edge(uv, body);
  else if(uMode < 5.5) col = ribbon(uv, body);
  else if(uMode < 6.5) col = riso(uv, body);
  else if(uMode < 7.5) col = chrome(uv, body);
  else if(uMode < 8.5) col = thermal(uv, body);
  else                 col = lines(uv, body);
  /* grain lives in lightness and follows the body */
  float g = grainHash(gl_FragCoord.xy + uSeed*93.) - .5;
  col.x += g * uGrain * clamp(body,0.,1.);
  gl_FragColor = vec4(ok2rgb(col), 1.);
}
