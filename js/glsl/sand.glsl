precision highp float;
uniform float t;
uniform float dpi;
uniform vec2 resolution;
uniform bool isSnapshot;
uniform sampler2D backBuffer;
uniform sampler2D data;
uniform sampler2D light;

varying vec2 uv;

// clang-format off
#pragma glslify: hsv2rgb = require('glsl-hsv2rgb')
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: random = require(glsl-random)

// clang-format on

void main() {
  vec3 color;
  //   float r = abs(sin(t / 25.));
  //   if (length(uv) < r && length(uv) > r - 0.1) {
  // color = hsv2rgb(vec3(sin(t * 0.01), 0.5, 0.5));
  float noise = snoise3(vec3(floor(uv * resolution / dpi), t * 0.05));

  vec2 textCoord = (uv * vec2(0.5, -0.5)) + vec2(0.5);
  vec2 sampleCoord =
      (uv * vec2(0.5, -0.5)) + vec2(0.5) + vec2(noise, 0.0) / resolution;
  // vec3 bb = texture2D(backBuffer, (uv * 0.5) + vec2(0.5)).rgb;

  vec4 data = texture2D(data, textCoord);
  float lightValue = texture2D(light, textCoord).r;
  float sampleLightValue = texture2D(light, sampleCoord).r;
  lightValue = 0.5 * lightValue + 0.5 * sampleLightValue;
  int type = int((data.r * 255.) + 0.1);
  float hue = 0.0;
  float saturation = 0.6;
  float lightness = 0.3 + data.g * 0.5;
  float a = 1.0;
  float brightness = 0.0;

  if (type == 0) { //Air

    hue = 0.0;
    saturation = 0.1;
    lightness = 0.1;
    a = 0.0;
    if (isSnapshot) {
      saturation = 0.05;
      lightness = 1.01;
      a = 1.0;
    }

  } else if (type == 1) { //Glass
    hue = 0.1;
    saturation = 0.1;
    lightness = 0.5;
  } else if (type == 2) { // Sand
    hue = 0.1;
    saturation = 0.5;
    lightness += 0.3;
  } else if (type == 3) { // Water
    hue = 0.58;
    saturation = 0.6;
    lightness = 0.5 + data.g * 0.25 + noise * 0.1;
    a = 0.4;
    if (isSnapshot) {
      a = 1.0;
    }
  } else if (type == 4) { // Algae
    hue = 0.4;
    lightness += 0.1;
    saturation = 0.5 + (data.b * 1.5);
  } else if (type == 5) { // Plant
    hue = 0.4;
    lightness -= 0.1;
    saturation = 0.4;
  } else if (type == 6) { // Zoop
    hue = (data.g * 0.1);
    saturation = 0.7;

    lightness = 0.7 + (data.g * 0.3) + ((noise + 0.8) * 0.5);
  } else if (type == 7) { // Shrimp
    hue = 0.0;
    lightness += 0.4;
  } else if (type == 8) { // Bacteria
   hue = 0.8;
    saturation = 0.9;
    lightness = 0.8;
  } else if (type == 9) { // ???
    hue = 0.6;
    saturation = 0.4;
    lightness = 0.7 + data.g * 0.5;
  } else if (type == 10) { // Waste
    hue = 0.9;
    saturation = 0.4;
  } else if (type == 11) { // Seed
    hue = 0.4;
    saturation = 0.4;
  } else if (type == 12) { // Stone
   hue = -0.4 + (data.g * 0.5);
    saturation = 0.1;
  } else if (type == 13) { // stone
    hue = -0.4 + (data.g * 0.5);
    saturation = 0.1;
    // lightness = 0.2 + data.g * 0.5;
  } else if (type == 14) { // dust
    hue = (data.g * 2.0) + t * .0008;
    saturation = 0.4;
    lightness = 0.8;
  } else if (type == 15) { // mite
   
  } else if (type == 16) { // oil
    hue = (data.g * 5.0) + t * .008;

    saturation = 0.2;
    lightness = 0.3;
  } else if (type == 17) { // Rocket
    hue = 0.0;
    saturation = 0.4 + data.b;
    lightness = 0.9;
  } else if (type == 18) { // fungus
    hue = (data.g * 0.15) - 0.1;
    saturation = (data.g * 0.8) - 0.05;

    // (data.g * 0.00);
    lightness = 1.5 - (data.g * 0.2);
  } else if (type == 19) { // seed/flower

    hue = fract(fract(data.b * 2.) * 0.5) - 0.3;
    saturation = 0.7 * (data.g + 0.4) + data.b * 0.2;
    lightness = 0.9 * (data.g + 0.9);
  }
  if (isSnapshot == false) {
    lightness *= (0.975 + snoise2(floor(uv * resolution / dpi)) * 0.025);
  }
  lightness += lightValue / 2.;
  saturation = min(saturation, 1.0);
  lightness = min(lightness, 1.0);
  color = hsv2rgb(vec3(hue, saturation, lightness));
  gl_FragColor = vec4(color, a);
}