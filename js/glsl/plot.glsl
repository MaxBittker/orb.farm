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

  pos.x = fract(pos.x + i / max_readings);
  vec2 textCoord = vec2(pos.x, 0.5);
  //   vec2 textCoord = (uv * vec2(0.5, 0)) + vec2(0.5);

  vec4 data = texture2D(data, textCoord);
  float v = data.x + data.y + data.z + data.w;
  float a = 1.0;

  //   vec2 pos+= (i*4.)/max_readings;
  //   lightness = min(lightness, 1.0);
  vec3 green = vec3(0., 1.0, 0.);
  gl_FragColor = vec4(0.,0.,0., 0.);

  //   if (
  if (
      pos.x < n_readings /max_readings &&
      abs(v / 4. - pos.y) < pixel.y * 1.) {
    gl_FragColor = vec4(0.3, 0.8, 0.3, 0.5);

  } else {
    //     if (abs((i * 4. / max_readings) - pos.x) < pixel.x * 1.) {
    //       gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);

    //     } else {
    //     }
  }
}