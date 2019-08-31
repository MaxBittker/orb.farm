
// clang-format off


#ifdef GL_ES
precision highp float;
precision highp int;
#endif

uniform vec3 iResolution;
uniform float iGlobalTime, iTime, gameTime;
uniform sampler2D iChannel0;
// Appropriated with love from:///
// The sun, the sky and the clouds. By StillTravelling
// https://www.shadertoy.com/view/tdSXzD
// Very much a messy hack sorry!!

// Many Thank yous go to the below for their amazing work
// Day and night sky cycle. By László Matuska (@BitOfGold)
// Creates a sky texture for a skydome
// https://www.shadertoy.com/view/ltlSWB

// Weather. By David Hoskins, May 2014.
// https://www.shadertoy.com/view/4dsXWn

// Edge of atmosphere
// created by dmytro rubalskyi (ruba)
// https://www.shadertoy.com/view/XlXGzB

// Auroras
// created by nimitz
// https://www.shadertoy.com/view/XtGGRt

// Sorry to those I've missed out!!

#define ORIG_CLOUD 0
#define ENABLE_RAIN 0 // enable rain drops on screen
#define SIMPLE_SUN 1
#define NICE_HACK_SUN 0
#define SOFT_SUN 1
#define cloudy 0.5 // 0.0 clear sky
#define haze 0.01 * (cloudy * 20.)
#define rainmulti 5.0 // makes clouds thicker
#define rainy (10.0 - rainmulti)
#define t iTime
#define fov tan(radians(60.0))
#define S(x, y, z) smoothstep(x, y, z)
#define cameraheight 5e1   // 50.
#define mincloudheight 5e3 // 5e3
#define maxcloudheight 8e3 // 8e3
#define xaxiscloud t * 5e2 // t*5e2 +t left -t right *speed
#define yaxiscloud 0.      // 0.
#define zaxiscloud t * 6e2 // t*6e2 +t away from horizon -t towards horizon *speed
#define cloudnoise 2e-4 // 2e-4

vec4 texture(     sampler2D   s, vec2 c)                   { return texture2D(s,c); }
vec4 texture(     sampler2D   s, vec2 c, float b)          { return texture2D(s,c,b); }
vec4 texture(     samplerCube s, vec3 c )                  { return textureCube(s,c); }
vec4 texture(     samplerCube s, vec3 c, float b)          { return textureCube(s,c,b); }
float round( float x ) { return floor(x+0.5); }
vec2 round(vec2 x) { return floor(x + 0.5); }
vec3 round(vec3 x) { return floor(x + 0.5); }
vec4 round(vec4 x) { return floor(x + 0.5); }
float trunc( float x, float n ) { return floor(x*n)/n; }
mat3 transpose(mat3 m) { return mat3(m[0].x, m[1].x, m[2].x, m[0].y, m[1].y, m[2].y, m[0].z, m[1].z, m[2].z); }
float determinant( in mat2 m ) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }
float determinant( mat4 m ) { float b00 = m[0][0] * m[1][1] - m[0][1] * m[1][0], b01 = m[0][0] * m[1][2] - m[0][2] * m[1][0], b02 = m[0][0] * m[1][3] - m[0][3] * m[1][0], b03 = m[0][1] * m[1][2] - m[0][2] * m[1][1], b04 = m[0][1] * m[1][3] - m[0][3] * m[1][1], b05 = m[0][2] * m[1][3] - m[0][3] * m[1][2], b06 = m[2][0] * m[3][1] - m[2][1] * m[3][0], b07 = m[2][0] * m[3][2] - m[2][2] * m[3][0], b08 = m[2][0] * m[3][3] - m[2][3] * m[3][0], b09 = m[2][1] * m[3][2] - m[2][2] * m[3][1], b10 = m[2][1] * m[3][3] - m[2][3] * m[3][1], b11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;}
mat2 inverse(mat2 m) { float det = determinant(m); return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det; }
mat4 inverse(mat4 m ) { float inv0 = m[1].y*m[2].z*m[3].w - m[1].y*m[2].w*m[3].z - m[2].y*m[1].z*m[3].w + m[2].y*m[1].w*m[3].z + m[3].y*m[1].z*m[2].w - m[3].y*m[1].w*m[2].z; float inv4 = -m[1].x*m[2].z*m[3].w + m[1].x*m[2].w*m[3].z + m[2].x*m[1].z*m[3].w - m[2].x*m[1].w*m[3].z - m[3].x*m[1].z*m[2].w + m[3].x*m[1].w*m[2].z; float inv8 = m[1].x*m[2].y*m[3].w - m[1].x*m[2].w*m[3].y - m[2].x  * m[1].y * m[3].w + m[2].x  * m[1].w * m[3].y + m[3].x * m[1].y * m[2].w - m[3].x * m[1].w * m[2].y; float inv12 = -m[1].x  * m[2].y * m[3].z + m[1].x  * m[2].z * m[3].y +m[2].x  * m[1].y * m[3].z - m[2].x  * m[1].z * m[3].y - m[3].x * m[1].y * m[2].z + m[3].x * m[1].z * m[2].y; float inv1 = -m[0].y*m[2].z * m[3].w + m[0].y*m[2].w * m[3].z + m[2].y  * m[0].z * m[3].w - m[2].y  * m[0].w * m[3].z - m[3].y * m[0].z * m[2].w + m[3].y * m[0].w * m[2].z; float inv5 = m[0].x  * m[2].z * m[3].w - m[0].x  * m[2].w * m[3].z - m[2].x  * m[0].z * m[3].w + m[2].x  * m[0].w * m[3].z + m[3].x * m[0].z * m[2].w - m[3].x * m[0].w * m[2].z; float inv9 = -m[0].x  * m[2].y * m[3].w +  m[0].x  * m[2].w * m[3].y + m[2].x  * m[0].y * m[3].w - m[2].x  * m[0].w * m[3].y - m[3].x * m[0].y * m[2].w + m[3].x * m[0].w * m[2].y; float inv13 = m[0].x  * m[2].y * m[3].z - m[0].x  * m[2].z * m[3].y - m[2].x  * m[0].y * m[3].z + m[2].x  * m[0].z * m[3].y + m[3].x * m[0].y * m[2].z - m[3].x * m[0].z * m[2].y; float inv2 = m[0].y  * m[1].z * m[3].w - m[0].y  * m[1].w * m[3].z - m[1].y  * m[0].z * m[3].w + m[1].y  * m[0].w * m[3].z + m[3].y * m[0].z * m[1].w - m[3].y * m[0].w * m[1].z; float inv6 = -m[0].x  * m[1].z * m[3].w + m[0].x  * m[1].w * m[3].z + m[1].x  * m[0].z * m[3].w - m[1].x  * m[0].w * m[3].z - m[3].x * m[0].z * m[1].w + m[3].x * m[0].w * m[1].z; float inv10 = m[0].x  * m[1].y * m[3].w - m[0].x  * m[1].w * m[3].y - m[1].x  * m[0].y * m[3].w + m[1].x  * m[0].w * m[3].y + m[3].x * m[0].y * m[1].w - m[3].x * m[0].w * m[1].y; float inv14 = -m[0].x  * m[1].y * m[3].z + m[0].x  * m[1].z * m[3].y + m[1].x  * m[0].y * m[3].z - m[1].x  * m[0].z * m[3].y - m[3].x * m[0].y * m[1].z + m[3].x * m[0].z * m[1].y; float inv3 = -m[0].y * m[1].z * m[2].w + m[0].y * m[1].w * m[2].z + m[1].y * m[0].z * m[2].w - m[1].y * m[0].w * m[2].z - m[2].y * m[0].z * m[1].w + m[2].y * m[0].w * m[1].z; float inv7 = m[0].x * m[1].z * m[2].w - m[0].x * m[1].w * m[2].z - m[1].x * m[0].z * m[2].w + m[1].x * m[0].w * m[2].z + m[2].x * m[0].z * m[1].w - m[2].x * m[0].w * m[1].z; float inv11 = -m[0].x * m[1].y * m[2].w + m[0].x * m[1].w * m[2].y + m[1].x * m[0].y * m[2].w - m[1].x * m[0].w * m[2].y - m[2].x * m[0].y * m[1].w + m[2].x * m[0].w * m[1].y; float inv15 = m[0].x * m[1].y * m[2].z - m[0].x * m[1].z * m[2].y - m[1].x * m[0].y * m[2].z + m[1].x * m[0].z * m[2].y + m[2].x * m[0].y * m[1].z - m[2].x * m[0].z * m[1].y; float det = m[0].x * inv0 + m[0].y * inv4 + m[0].z * inv8 + m[0].w * inv12; det = 1.0 / det; return det*mat4( inv0, inv1, inv2, inv3,inv4, inv5, inv6, inv7,inv8, inv9, inv10, inv11,inv12, inv13, inv14, inv15);}
float sinh(float x)  { return (exp(x)-exp(-x))/2.; }
float cosh(float x)  { return (exp(x)+exp(-x))/2.; }
float tanh(float x)  { return sinh(x)/cosh(x); }
float coth(float x)  { return cosh(x)/sinh(x); }
float sech(float x)  { return 1./cosh(x); }
float csch(float x)  { return 1./sinh(x); }
float asinh(float x) { return    log(x+sqrt(x*x+1.)); }
float acosh(float x) { return    log(x+sqrt(x*x-1.)); }
float atanh(float x) { return .5*log((1.+x)/(1.-x)); }
float acoth(float x) { return .5*log((x+1.)/(x-1.)); }
float asech(float x) { return    log((1.+sqrt(1.-x*x))/x); }
float acsch(float x) { return    log((1.+sqrt(1.+x*x))/x); }
vec4 textureLod(  sampler2D   s, vec2 c, float b)          { return texture2DLodEXT(s,c,b); }
vec4 textureGrad( sampler2D   s, vec2 c, vec2 dx, vec2 dy) { return texture2DGradEXT(s,c,dx,dy); }
// clang-format on

//#define cloud2

// Performance
const int steps = 16;  // 16 is fast, 128 or 256 is extreme high
const int stepss = 16; // 16 is fast, 16 or 32 is high

// Environment
const float R0 = 6360e3; // planet radius //6360e3 actual 6371km
const float Ra = 6380e3; // atmosphere radius //6380e3 troposphere 8 to 14.5km
const float I = 10.;     // sun light power, 10.0 is normal
const float SI = 5.;     // sun intensity for sun
const float g = 0.45;    // light concentration .76 //.45 //.6  .45 is normaL
const float g2 = g * g;
const float PI = 3.14159265358979323846;
const float PI2 = 2. * 3.14159265358979323846;

const float ts = (cameraheight / 2.5e5);

const float s = 0.999; // light concentration for sun
#if SOFT_SUN
const float s2 = s;
#else
const float s2 = s * s;
#endif
const float Hr = 8e3;   // Rayleigh scattering top //8e3
const float Hm = 1.2e3; // Mie scattering top //1.3e3

vec3 bM = vec3(21e-6); // normal mie // vec3(21e-6)
// vec3 bM = vec3(50e-6); //high mie

// Rayleigh scattering (sky color, atmospheric up to 8km)
vec3 bR = vec3(5.8e-6, 13.5e-6, 33.1e-6); // normal earth
// vec3 bR = vec3(5.8e-6, 33.1e-6, 13.5e-6); //purple
// vec3 bR = vec3( 63.5e-6, 13.1e-6, 50.8e-6 ); //green
// vec3 bR = vec3( 13.5e-6, 23.1e-6, 115.8e-6 ); //yellow
// vec3 bR = vec3( 5.5e-6, 15.1e-6, 355.8e-6 ); //yeellow
// vec3 bR = vec3(3.5e-6, 333.1e-6, 235.8e-6 ); //red-purple

vec3 C = vec3(0., -R0, 0.);             // planet center
vec3 Ds = normalize(vec3(0., 0., -1.)); // sun direction?

float cloudyhigh = 0.05; // if cloud2 defined

#if ORIG_CLOUD
float cloudnear =
    1.0; // 9e3 12e3  //do not render too close clouds on the zenith
float cloudfar = 1e3; // 15e3 17e3
#else
float cloudnear = 1.0; // 15e3 17e3
float cloudfar = 70e3; // 160e3  //do not render too close clouds on the horizon
                       // 160km should be max for cumulus
#endif

// AURORA STUFF
mat2 mm2(in float a) {
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

mat2 m2 = mat2(0.95534, 0.29552, -0.29552, 0.95534);

float tri(in float x) { return clamp(abs(fract(x) - .5), 0.01, 0.49); }

vec2 tri2(in vec2 p) { return vec2(tri(p.x) + tri(p.y), tri(p.y + tri(p.x))); }

float triNoise2d(in vec2 p, float spd) {
  float z = 1.8;
  float z2 = 2.5;
  float rz = 0.;
  p *= mm2(p.x * 0.06);
  vec2 bp = p;
  for (float i = 0.; i < 5.; i++) {
    vec2 dg = tri2(bp * 1.85) * .75;
    dg *= mm2(t * spd);
    p -= dg / z2;

    bp *= 1.3;
    z2 *= 1.45;
    z *= .42;
    p *= 1.21 + (rz - 1.0) * .02;

    rz += tri(p.x + tri(p.y)) * z;
    p *= -m2;
  }
  return clamp(1. / pow(rz * 29., 1.3), 0., .55);
}

float hash21(in vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}
vec4 aurora(vec3 ro, vec3 rd) {
  vec4 col = vec4(0);
  vec4 avgCol = vec4(0);
  ro *= 1e-5;
  float mt = 10.;
  for (float i = 0.; i < 5.; i++) {
    float of = 0.006 * hash21(gl_FragCoord.xy) * smoothstep(0., 15., i * mt);
    float pt = ((.8 + pow((i * mt), 1.2) * .001) - rd.y) / (rd.y * 2. + 0.4);
    pt -= of;
    vec3 bpos = (ro) + pt * rd;
    vec2 p = bpos.zx;
    // vec2 p = rd.zx;
    float rzt = triNoise2d(p, 0.1);
    vec4 col2 = vec4(0, 0, 0, rzt);
    col2.rgb =
        (sin(1. - vec3(2.15, -.5, 1.2) + (i * mt) * 0.053) * (0.5 * mt)) * rzt;
    avgCol = mix(avgCol, col2, .5);
    col += avgCol * exp2((-i * mt) * 0.04 - 2.5) * smoothstep(0., 5., i * mt);
  }

  col *= (clamp(rd.y * 15. + .4, 0., 1.2));
  return col * 2.8;
}

// END AURORA STUFF

float noise(in vec2 v) {
  return 0.5;
  //    texture(iChannel0,(v+.5)/256., 0.).r * 0.01;
}

// by iq
float Noise(in vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);

  vec2 uv = (p.xy + vec2(37.0, 17.0) * p.z) + f.xy;
  vec2 rg = textureLod(iChannel0, (uv + 0.5) / 256.0, -100.0).yx;
  return mix(rg.x, rg.y, f.z);
}

float fnoise(vec3 p, in float t) {
  p *= .25;
  float f;

  f = 0.5000 * Noise(p);
  p = p * 3.02;
  p.y -= t * .1; // t*.05 speed cloud changes
  f += 0.2500 * Noise(p);
  p = p * 3.03;
  p.y += t * .06;
  f += 0.1250 * Noise(p);
  p = p * 3.01;
  f += 0.0625 * Noise(p);
  p = p * 3.03;
  f += 0.03125 * Noise(p);
  p = p * 3.02;
  f += 0.015625 * Noise(p);
  return f;
}

float cloud(vec3 p, in float t) {
  float cld = fnoise(p * cloudnoise, t) + cloudy * 0.1;
  cld = smoothstep(.4 + .04, .6 + .04, cld);
  cld *= cld * (5.0 * rainmulti);
  return cld + haze;
}

void densities(in vec3 pos, out float rayleigh, out float mie) {
  float h = length(pos - C) - R0;
  rayleigh = exp(-h / Hr);
  vec3 d = pos;
  d.y = 0.0;
  float dist = length(d);

  float cld = 0.;
  if (mincloudheight < h && h < maxcloudheight) {
    // cld = cloud(pos+vec3(t*1e3,0., t*1e3),t)*cloudy;
    cld = cloud(pos + vec3(xaxiscloud, yaxiscloud, zaxiscloud), t) *
          cloudy; // direction and speed the cloud movers
    cld *= sin(3.1415 * (h - mincloudheight) / mincloudheight) * cloudy;
  }
#ifdef cloud2
  float cld2 = 0.;
  if (12e3 < h && h < 15.5e3) {
    cld2 = fnoise(pos * 3e-4, t) *
           cloud(pos * 32.0 + vec3(27612.3, 0., -t * 15e3), t);
    cld2 *= sin(3.1413 * (h - 12e3) / 12e3) * cloudyhigh;
    cld2 = clamp(cld2, 0.0, 1.0);
  }

#endif

#if ORIG_CLOUD
  if (dist < cloudfar) {
    float factor =
        clamp(1.0 - ((cloudfar - dist) / (cloudfar - cloudnear)), 0.0, 1.0);
    cld *= factor;
  }
#else

  if (dist > cloudfar) {

    float factor =
        clamp(1.0 - ((dist - cloudfar) / (cloudfar - cloudnear)), 0.0, 1.0);
    cld *= factor;
  }
#endif

  mie = exp(-h / Hm) + cld + haze;
#ifdef cloud2
  mie += cld2;
#endif
}

float escape(in vec3 p, in vec3 d, in float R) {
  vec3 v = p - C;
  float b = dot(v, d);
  float c = dot(v, v) - R * R;
  float det2 = b * b - c;
  if (det2 < 0.)
    return -1.;
  float det = sqrt(det2);
  float t1 = -b - det, t2 = -b + det;
  return (t1 >= 0.) ? t1 : t2;
}

// this can be explained:
// http://www.scratchapixel.com/lessons/3d-advanced-lessons/simulating-the-colors-of-the-sky/atmospheric-scattering/
void scatter(vec3 o, vec3 d, out vec3 col, out vec3 scat, in float t) {

  float L = escape(o, d, Ra);
  float mu = dot(d, Ds);
  float opmu2 = 1. + mu * mu;
  float phaseR = .0596831 * opmu2;
  float phaseM = .1193662 * (1. - g2) * opmu2 /
                 ((2. + g2) * pow(1. + g2 - 2. * g * mu, 1.5));
  float phaseS = .1193662 * (1. - s2) * opmu2 /
                 ((2. + s2) * pow(1. + s2 - 2. * s * mu, 1.5));

  float depthR = 0., depthM = 0.;
  vec3 R = vec3(0.), M = vec3(0.);

  float dl = L / float(steps);
  for (int i = 0; i < steps; ++i) {
    float l = float(i) * dl;
    vec3 p = (o + d * l);

    float dR, dM;
    densities(p, dR, dM);
    dR *= dl;
    dM *= dl;
    depthR += dR;
    depthM += dM;

    float Ls = escape(p, Ds, Ra);
    if (Ls > 0.) {
      float dls = Ls / float(stepss);
      float depthRs = 0., depthMs = 0.;
      for (int j = 0; j < stepss; ++j) {
        float ls = float(j) * dls;
        vec3 ps = (p + Ds * ls);
        float dRs, dMs;
        densities(ps, dRs, dMs);
        depthRs += dRs * dls;
        depthMs += dMs * dls;
      }

      vec3 A = exp(-(bR * (depthRs + depthR) + bM * (depthMs + depthM)));
      R += (A * dR);
      M += A * dM;
    } else {
    }
  }

  // col = (I) * (R * bR * phaseR + M * bM * (phaseM ));
  col = (I) * (M * bM * (phaseM)); // Mie scattering
#if NICE_HACK_SUN
  col += (SI) * (M * bM * phaseS); // Sun
#endif
  col += (I) * (R * bR * phaseR); // Rayleigh scattering
  scat = 0.1 * (bM * depthM);
  // scat = 0.0 + clamp(depthM*5e-7,0.,1.);
}

vec3 hash33(vec3 p) {
  p = fract(p * vec3(443.8975, 397.2973, 491.1871));
  p += dot(p.zxy, p.yxz + 19.27);
  return fract(vec3(p.x * p.y, p.z * p.x, p.y * p.z));
}

vec3 stars(in vec3 p) {
  vec3 c = vec3(0.);
  float res = iResolution.x * 2.5;

  for (float i = 0.; i < 4.; i++) {
    vec3 q = fract(p * (.15 * res)) - 0.5;
    vec3 id = floor(p * (.15 * res));
    vec2 rn = hash33(id).xy;
    float c2 = 1. - smoothstep(0., .6, length(q));
    c2 *= step(rn.x, .0005 + i * i * 0.001);
    c +=
        c2 * (mix(vec3(1.0, 0.49, 0.1), vec3(0.75, 0.9, 1.), rn.y) * 0.1 + 0.9);
    p *= 1.3;
  }
  return c * c * .8;
}

// SIMPLE SUN STUFF
const float density = 0.5;
const float zenithOffset = 0.48;
const vec3 skyColor = vec3(0.37, 0.55, 1.0) * (1.0 + 0.0);

#define zenithDensity(x) density / pow(max(x - zenithOffset, 0.0035), 0.75)

float getSunPoint(vec2 p, vec2 lp) {
  return smoothstep(0.04 * (fov / 2.0), 0.026 * (fov / 2.0), distance(p, lp)) *
         50.0;
}

float getMie(vec2 p, vec2 lp) {
  float mytest = lp.y < 0.5 ? (lp.y + 0.5) * pow(0.05, 20.0) : 0.05;
  float disk = clamp(1.0 - pow(distance(p, lp), mytest), 0.0, 1.0);
  return disk * disk * (3.0 - 2.0 * disk) * 0.25 * PI;
}

vec3 getSkyAbsorption(vec3 x, float y) {
  vec3 absorption = x * y;
  absorption = pow(absorption, 1.0 - (y + absorption) * 0.5) / x / y;
  return absorption;
}

vec3 jodieReinhardTonemap(vec3 c) {
  float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  vec3 tc = c / (c + 1.0);
  return mix(c / (l + 1.0), tc, tc);
}

vec3 getAtmosphericScattering(vec2 p, vec2 lp) {
  float zenithnew = zenithDensity(p.y);
  float sunPointDistMult =
      clamp(length(max(lp.y + 0.1 - zenithOffset, 0.0)), 0.0, 1.0);
  vec3 absorption = getSkyAbsorption(skyColor, zenithnew);
  vec3 sunAbsorption = getSkyAbsorption(skyColor, zenithDensity(lp.y + 0.1));
  vec3 sun3 = getSunPoint(p, lp) * absorption;
  vec3 mie2 = getMie(p, lp) * sunAbsorption;
  vec3 totalSky = sun3; //+ mie2;
  totalSky *= sunAbsorption * 0.5 + 0.5 * length(sunAbsorption);
  vec3 newSky = jodieReinhardTonemap(totalSky);
  return newSky;
}
// END SIMPLE SUN STUFF

// RAIN STUFF
vec3 N31(float p) {
  //  3 out, 1 in... DAVE HOSKINS
  vec3 p3 = fract(vec3(p) * vec3(.1031, .11369, .13787));
  p3 += dot(p3, p3.yzx + 19.19);
  return fract(
      vec3((p3.x + p3.y) * p3.z, (p3.x + p3.z) * p3.y, (p3.y + p3.z) * p3.x));
}

float SawTooth(float t) {
  return cos(t + cos(t)) + sin(2. * t) * .2 + sin(4. * t) * .02;
}

float DeltaSawTooth(float t) {
  return 0.4 * cos(2. * t) + 0.08 * cos(4. * t) -
         (1. - sin(t)) * sin(t + cos(t));
}

vec2 GetDrops(vec2 uv, float seed, float m) {

  float t2 = t + m;
  vec2 o = vec2(0.);

#ifndef DROP_DEBUG
  uv.y += t2 * .05;
#endif

  uv *= vec2(10., 2.5) * 2.;
  vec2 id = floor(uv);
  vec3 n = N31(id.x + (id.y + seed) * 546.3524);
  vec2 bd = fract(uv);

  vec2 uv2 = bd;

  bd -= 0.5;

  bd.y *= 4.;

  bd.x += (n.x - .5) * rainy;

  t2 += n.z * 6.28;
  float slide = SawTooth(t2);

  float ts = 1.5;
  vec2 trailPos = vec2(bd.x * ts, (fract(bd.y * ts * 2. - t2 * 2.) - .5) * .5);

  bd.y += slide * 2.; // make drops slide down

#ifdef HIGH_QUALITY
  float dropShape = bd.x * bd.x;
  dropShape *= DeltaSawTooth(t);
  bd.y += dropShape; // change shape of drop when it is falling
#endif

  float d = length(bd); // distance to main drop

  float trailMask = S(-.2, .2, bd.y); // mask out drops that are below the main
  trailMask *= bd.y;                  // fade dropsize
  float td = length(trailPos * max(.5, trailMask)); // distance to trail drops

  float mainDrop = S(.2, .1, d);
  float dropTrail = S(.1, .02, td);

  dropTrail *= trailMask;
  o = mix(bd * mainDrop, trailPos, dropTrail); // mix main drop and drop trail

#ifdef DROP_DEBUG
  if (uv2.x < .02 || uv2.y < .01)
    o = vec2(1.);
#endif

  return o;
}
// END RAIN STUFF

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

  float AR = iResolution.x / iResolution.y;
  float smallSide = min(iResolution.x, iResolution.y);
  float bigSide = max(iResolution.x, iResolution.y);
  float M = 1.0; // canvas.innerWidth/M //canvas.innerHeight/M --res
  // vec2 circle = vec2(cos(gameTime* PI2), sin(gameTime*PI2));
  vec2 circle = vec2(1.0) + vec2(sin(-gameTime * PI2), cos(gameTime * PI2));
  circle *= 0.5;
  // circle.x = iResolution.x/2.;
  // circle.y = circle.;
//   circle += vec2((bigSide - smallSide) / 4., 0.);
  // circle = vec2(sin(gameTime*PI2));
  vec2 uvMouse = circle;
  // / iResolution.xy);
  // uvMouse.x *= AR;

  vec2 uv0 = (fragCoord.xy / iResolution.xy);
  uv0 *= M;
  // uv0.x *= AR;

  vec2 uv = uv0 * (2.0 * M) - (1.0 * M);
  uv.x *= AR;

  // uvMouse.y=(0.7-(0.05*fov)); //initial view
  // uvMouse.x=(1.0-(0.05*fov)); //initial view
  // circle+=0.5;
  // uvMouse.xy = circle - vec2((0.05*fov));
  // uvMouse.xy = vec2(1.0, 0.5);
  // uvMouse*= 100.;
  // uvMouse += iResolution.xy *0.5;
  Ds = normalize(vec3(uvMouse.x - ((0.5 * AR)), uvMouse.y - 0.5, (fov / -2.0)));

  vec3 O = vec3(0., cameraheight, 0.);
  vec3 D = normalize(vec3(uv, -(fov * M)));

  vec3 color = vec3(0.);
  vec3 scat = vec3(0.);

  // float scat = 0.;
  float att = 1.;
  float staratt = 1.;
  float scatatt = 1.;
  vec3 star = vec3(0.);
  vec4 aur = vec4(0.);

  float fade = smoothstep(0., 0.01, abs(D.y)) * 0.5 + 0.9;

  staratt = 1. - min(1.0, (uvMouse.y * 2.0));
  scatatt = 1. - min(1.0, (uvMouse.y * 2.2));

  if (D.y < -ts) {
    float L = -O.y / D.y;
    O = O + D * L;
    D.y = -D.y;
    D = normalize(
        D +
        vec3(0, .003 * sin(t + 6.2831 * noise(O.xz + vec2(0., -t * 1e3))), 0.));
    att = .6;
    star = stars(D);
    uvMouse.y < 0.5 ? aur = smoothstep(0.0, 2.5, aurora(O, D)) : aur = aur;
  } else {
    float L1 = O.y / D.y;
    vec3 O1 = O + D * L1;

    vec3 D1 = vec3(1.);
    D1 = normalize(
        D + vec3(1.,
                 0.0009 * sin(t + 6.2831 * noise(O1.xz + vec2(0., t * 0.8))),
                 0.));
    star = stars(D1);
    uvMouse.y < 0.5 ? aur = smoothstep(0., 1.5, aurora(O, D)) *fade : aur = aur;
  }

  star *= att;
  star *= staratt;

  scatter(O, D, color, scat, t);
  color *= att;
  scat *= att;
  scat *= scatatt;

// draw the badly implemented sun
#if SIMPLE_SUN

  vec2 uv1 = (fragCoord.xy / iResolution.xy);
  uv1 *= M;
  uv1.x *= AR;

  vec3 sun2 = getAtmosphericScattering(uv1, vec2(uvMouse.x, uvMouse.y));
  color += sun2;
#endif

  color += scat;
  color += star;
  //   color=color*(1.-(aur.a)*scatatt) + (aur.rgb*scatatt);
  color += aur.rgb * scatatt;

#if ENABLE_RAIN
  vec2 drops = vec2(0.);
  if (rainmulti > 1.0) {
    drops = GetDrops(uv / 2.0, 1., 1.);

    color += drops.x + drops.y;
  }
#endif

  // float env = pow( smoothstep(.5, iResolution.x / iResolution.y,
  // length(uv*0.8)), 0.0);
  fragColor = vec4(pow(color, vec3(1.0 / 2.2)), 1.); // gamma correct
}
void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
