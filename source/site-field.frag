
precision highp float;

uniform vec2  uRes;
uniform float uTime;
uniform vec2  uLens, uDrift;
uniform float uScroll;
uniform sampler2D uText;
uniform sampler2D uTextJP;

uniform vec3  uC1, uC2, uC3, uC4, uC5;
uniform float uSize, uOffset, uRotation, uSpread;
uniform float uDisplace, uSeed, uZoom, uSpacing;
uniform float uLensR, uLensS, uFringe, uRim, uGrain, uGrainFps;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453123); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i),                 hash(i + vec2(1.0,0.0)), u.x),
             mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
}

float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 3; i++){ v += a * noise(p); p *= 2.03; a *= 0.5; }
  return v;
}

vec3 pick(float i, vec3 a, vec3 b, vec3 c, vec3 d, vec3 e){
  vec3 r = a;
  r = mix(r, b, step(0.5, i));
  r = mix(r, c, step(1.5, i));
  r = mix(r, d, step(2.5, i));
  r = mix(r, e, step(3.5, i));
  return r;
}

/* Five stops cycled, and the fifth is the void.

   This was the thing that made it work. Four colors wrapping
   straight back round to the first read as a rainbow; putting the
   dark value in the cycle means the warm end always sits against
   black, which is what makes it read as a flare rather than as one
   more band. */
/* The uC* arrive in Oklab. Interpolate there and convert back to sRGB
   once, at the end: everything that happens after (the white headline,
   the lens rim, the grain) already operates in screen space. */
vec3 oklab2srgb(vec3 c){
  float l_ = c.x + 0.3963377774*c.y + 0.2158037573*c.z;
  float m_ = c.x - 0.1055613458*c.y - 0.0638541728*c.z;
  float s_ = c.x - 0.0894841775*c.y - 1.2914855480*c.z;
  vec3 lms = vec3(l_*l_*l_, m_*m_*m_, s_*s_*s_);
  vec3 lin = vec3(
     4.0767416621*lms.x - 3.3077115913*lms.y + 0.2309699292*lms.z,
    -1.2684380046*lms.x + 2.6097574011*lms.y - 0.3413193965*lms.z,
    -0.0041960863*lms.x - 0.7034186147*lms.y + 1.7076147010*lms.z);
  return pow(max(lin, 0.0), vec3(1.0/2.2));
}

vec3 palette(float t){
  float x = fract(t) * 5.0;
  float i = floor(x);
  float w = clamp(uSize, 0.001, 1.0);
  float f = smoothstep(0.5 - w*0.5, 0.5 + w*0.5, fract(x));
  f = f*f*(3.0-2.0*f);
  return oklab2srgb(mix(pick(i, uC1,uC2,uC3,uC4,uC5),
                        pick(i, uC2,uC3,uC4,uC5,uC1), f));
}

/* A rotated linear axis plus a low frequency warp.

   Big soft diagonal bands, not turbulence. The warp is deliberately
   slow and wide: at higher frequency this turns into noise and the
   bands stop reading. */
vec3 field(vec2 uv){
  uv = uv / max(uZoom, 0.001);
  float ca = cos(uRotation), sa = sin(uRotation);
  uv = mat2(ca, -sa, sa, ca) * uv;

  float s = uSpacing * 0.12;
  vec2 dr = uDrift * 0.55;

  vec2 q = vec2(
    fbm(uv * s + uSeed * 9.0        + uTime * 0.020 + dr),
    fbm(uv * s + vec2(7.3,2.1) - uSeed * 4.0 - uTime * 0.017 + dr)
  );

  float n   = fbm(uv * s * 1.3 + q * uDisplace * 0.22);
  float lin = dot(uv, vec2(ca, sa)) * uSpread * 0.10;

  return palette(lin + n * 0.9 + uOffset);
}

vec2 toScreen(vec2 p){ return (p * min(uRes.x, uRes.y) + 0.5 * uRes) / uRes; }

float glyph(vec2 p, float jp){
  vec2 px = p * min(uRes.x, uRes.y) + 0.5 * uRes;
  vec2 tc = vec2(px.x / uRes.x, (uRes.y - px.y + uScroll) / uRes.y);
  if (tc.x < 0.0 || tc.x > 1.0 || tc.y < 0.0 || tc.y > 1.0) return 0.0;
  /* a clean swap, not a blend. inside the glass you read the
     notation plate and the headline is simply not there; outside
     it you read the headline. weighting the swap by how much
     notation sat under each pixel left the two showing at once,
     which is not what the glass is meant to do. */
  return mix(texture2D(uText, tc).a, texture2D(uTextJP, tc).a, jp);
}

void main(){
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);

  /* the lens. displacement is near zero at the center and ramps at
     the rim, so type only bends where it crosses the edge */
  vec2  dl = uv - uLens;
  float r  = length(dl);
  float inside = 1.0 - smoothstep(uLensR * 0.98, uLensR, r);
  float k = pow(clamp(r / uLensR, 0.0, 1.0), 4.0) * inside;
  vec2  off = (r > 0.0001 ? dl / r : vec2(0.0)) * k * uLensS;

  float lo = 1.0 - uFringe, hi = 1.0 + uFringe;
  vec3 col = field(uv - off);

  /* through the glass the headline is replaced by the notation */
  float jp = 1.0 - smoothstep(uLensR * 0.80, uLensR * 0.96, r);
  vec3 ta = vec3(glyph(uv - off*lo, jp), glyph(uv - off, jp), glyph(uv - off*hi, jp));
  col = mix(col, vec3(1.0), ta);

  float rim = smoothstep(uLensR * 0.93, uLensR * 0.995, r)
            * (1.0 - smoothstep(uLensR * 0.995, uLensR * 1.02, r));
  col += rim * uRim + inside * 0.014;

  float g  = floor(uTime * uGrainFps);
  float g1 = hash(gl_FragCoord.xy * 0.55 + g);
  float g2 = hash(gl_FragCoord.xy * 0.21 - g * 1.7);
  col += ((g1 * 0.72 + g2 * 0.28) - 0.5) * uGrain;

  gl_FragColor = vec4(col, 1.0);
}
