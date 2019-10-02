precision highp float;
uniform float t;
uniform float i;
uniform float max_readings;
uniform float n_readings;
uniform float dpi;
uniform vec2 resolution;
uniform sampler2D data;

varying vec2 uv;

// clang-format off
#pragma glslify: hsv2rgb = require('glsl-hsv2rgb')
#pragma glslify: snoise3 = require(glsl-noise/simplex/3d)
#pragma glslify: snoise2 = require(glsl-noise/simplex/2d)
#pragma glslify: random = require(glsl-random)

// clang-format on

void main() {
  vec3 color;
  vec2 grid = floor(uv * resolution / dpi);
  vec2 pixel = 1. / resolution;
  vec2 pos = (uv + vec2(1.0)) * 0.5;

  // pos.x = fract(pos.x + i / max_readings);
  vec2 textCoord = vec2(pos.x, 0.5);
  //   vec2 textCoord = (uv * vec2(0.5, 0)) + vec2(0.5);

  vec4 data = texture2D(data, textCoord);
  float v = data.x;
  float buckets = resolution.y / 4.;
  // discretized
  float dV = floor(v * buckets) / buckets;
  // float dVLeading = floor(data.a * buckets) / buckets;

  float a = 1.0;

  //   vec2 pos+= (i*4.)/max_readings;
  //   lightness = min(lightness, 1.0);
  gl_FragColor = vec4(1., 1., 1.0, 0.5);

  //   if (

  if (pos.x < n_readings / max_readings && abs(dV - pos.y) < pixel.y * 2.0) {
    gl_FragColor = vec4(hsv2rgb(vec3(-0.1 + v * 0.8, 0.5, 0.5)), 1.0);

  } else if (abs((i / max_readings) - pos.x) < pixel.x * 4.

             && abs(dV - pos.y) < pixel.y * 2.0 && dV > 0.) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);

  } else if (abs((pos.y - 0.5) * resolution.y) < 2.0 &&
             mod(pos.x * resolution.x, 8.0) > 4.0) {
    gl_FragColor = vec4(0., 0., 0., 1.0);
  }

  //  else {
  // }
}