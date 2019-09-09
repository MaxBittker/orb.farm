let fsh = require("./glsl/sky.glsl");

/*forked from https://github.com/bysse/shadertoy-webgl-harness*/
// Mixed with some webgl2 code taken from pilibs.js
// http://iquilezles.org/code/piLibsJS/piLibsJS.htm
class WebGL {
  constructor(canvasId, res) {
    this.canvas = document.getElementById(canvasId);
    var opts = {
      stencil: false,
      premultipliedAlpha: false
    };

    var gl = null;
    if (gl == null) gl = this.canvas.getContext("webgl2", opts);
    if (gl == null) gl = this.canvas.getContext("experimental-webgl2", opts);
    if (gl == null) gl = this.canvas.getContext("webgl", opts);
    if (gl == null) gl = this.canvas.getContext("experimental-webgl", opts);
    this.gl = gl;
    this.textures = {};
    let mIs20 = !(this.gl instanceof WebGLRenderingContext);

    let vertexShader = "";

    if (mIs20) {
      vertexShader +=
        "#version 300 es\n" +
        "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "precision highp int;\n" +
        "precision mediump sampler3D;\n" +
        "#endif\n" +
        "in ";
    } else {
      vertexShader +=
        "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "precision highp int;\n" +
        "#endif\n" +
        "attribute";
    }
    vertexShader +=
      " vec4 aPosition; void main() { gl_Position = aPosition; } ";
    let fragmentShader = "";

    let mDerivatives;
    let mShaderTextureLOD;

    if (mIs20) {
      mDerivatives = true;
      mShaderTextureLOD = true;
    } else {
      mDerivatives = this.gl.getExtension("OES_standard_derivatives");
      mShaderTextureLOD = this.gl.getExtension("EXT_shader_texture_lod");
    }

    if (mIs20) {
      fragmentShader +=
        "#version 300 es\n" +
        "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "precision highp int;\n" +
        "precision mediump sampler3D;\n" +
        "#endif\n" +
        "out vec4 myOutputColor;\n";
      fsh = fsh.replace("gl_FragColor", "myOutputColor");
    } else {
      if (mDerivatives) {
        fragmentShader +=
          "#ifdef GL_OES_standard_derivatives\n#extension GL_OES_standard_derivatives : enable\n#endif\n";
      }
      if (mShaderTextureLOD) {
        fragmentShader += "#extension GL_EXT_shader_texture_lod : enable\n";
      }
      fragmentShader +=
        "#ifdef GL_ES\n" +
        "precision highp float;\n" +
        "precision highp int;\n" +
        "#endif\n" +
        "vec4 texture(     sampler2D   s, vec2 c)                   { return texture2D(s,c); }\n" +
        "vec4 texture(     sampler2D   s, vec2 c, float b)          { return texture2D(s,c,b); }\n" +
        "vec4 texture(     samplerCube s, vec3 c )                  { return textureCube(s,c); }\n" +
        "vec4 texture(     samplerCube s, vec3 c, float b)          { return textureCube(s,c,b); }\n" +
        "float round( float x ) { return floor(x+0.5); }\n" +
        "vec2 round(vec2 x) { return floor(x + 0.5); }\n" +
        "vec3 round(vec3 x) { return floor(x + 0.5); }\n" +
        "vec4 round(vec4 x) { return floor(x + 0.5); }\n" +
        "float trunc( float x, float n ) { return floor(x*n)/n; }\n" +
        "mat3 transpose(mat3 m) { return mat3(m[0].x, m[1].x, m[2].x, m[0].y, m[1].y, m[2].y, m[0].z, m[1].z, m[2].z); }\n" +
        "float determinant( in mat2 m ) { return m[0][0]*m[1][1] - m[0][1]*m[1][0]; }\n" +
        "float determinant( mat4 m ) { float b00 = m[0][0] * m[1][1] - m[0][1] * m[1][0], b01 = m[0][0] * m[1][2] - m[0][2] * m[1][0], b02 = m[0][0] * m[1][3] - m[0][3] * m[1][0], b03 = m[0][1] * m[1][2] - m[0][2] * m[1][1], b04 = m[0][1] * m[1][3] - m[0][3] * m[1][1], b05 = m[0][2] * m[1][3] - m[0][3] * m[1][2], b06 = m[2][0] * m[3][1] - m[2][1] * m[3][0], b07 = m[2][0] * m[3][2] - m[2][2] * m[3][0], b08 = m[2][0] * m[3][3] - m[2][3] * m[3][0], b09 = m[2][1] * m[3][2] - m[2][2] * m[3][1], b10 = m[2][1] * m[3][3] - m[2][3] * m[3][1], b11 = m[2][2] * m[3][3] - m[2][3] * m[3][2];  return b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;}\n" +
        "mat2 inverse(mat2 m) { float det = determinant(m); return mat2(m[1][1], -m[0][1], -m[1][0], m[0][0]) / det; }\n" +
        "mat4 inverse(mat4 m ) { float inv0 = m[1].y*m[2].z*m[3].w - m[1].y*m[2].w*m[3].z - m[2].y*m[1].z*m[3].w + m[2].y*m[1].w*m[3].z + m[3].y*m[1].z*m[2].w - m[3].y*m[1].w*m[2].z; float inv4 = -m[1].x*m[2].z*m[3].w + m[1].x*m[2].w*m[3].z + m[2].x*m[1].z*m[3].w - m[2].x*m[1].w*m[3].z - m[3].x*m[1].z*m[2].w + m[3].x*m[1].w*m[2].z; float inv8 = m[1].x*m[2].y*m[3].w - m[1].x*m[2].w*m[3].y - m[2].x  * m[1].y * m[3].w + m[2].x  * m[1].w * m[3].y + m[3].x * m[1].y * m[2].w - m[3].x * m[1].w * m[2].y; float inv12 = -m[1].x  * m[2].y * m[3].z + m[1].x  * m[2].z * m[3].y +m[2].x  * m[1].y * m[3].z - m[2].x  * m[1].z * m[3].y - m[3].x * m[1].y * m[2].z + m[3].x * m[1].z * m[2].y; float inv1 = -m[0].y*m[2].z * m[3].w + m[0].y*m[2].w * m[3].z + m[2].y  * m[0].z * m[3].w - m[2].y  * m[0].w * m[3].z - m[3].y * m[0].z * m[2].w + m[3].y * m[0].w * m[2].z; float inv5 = m[0].x  * m[2].z * m[3].w - m[0].x  * m[2].w * m[3].z - m[2].x  * m[0].z * m[3].w + m[2].x  * m[0].w * m[3].z + m[3].x * m[0].z * m[2].w - m[3].x * m[0].w * m[2].z; float inv9 = -m[0].x  * m[2].y * m[3].w +  m[0].x  * m[2].w * m[3].y + m[2].x  * m[0].y * m[3].w - m[2].x  * m[0].w * m[3].y - m[3].x * m[0].y * m[2].w + m[3].x * m[0].w * m[2].y; float inv13 = m[0].x  * m[2].y * m[3].z - m[0].x  * m[2].z * m[3].y - m[2].x  * m[0].y * m[3].z + m[2].x  * m[0].z * m[3].y + m[3].x * m[0].y * m[2].z - m[3].x * m[0].z * m[2].y; float inv2 = m[0].y  * m[1].z * m[3].w - m[0].y  * m[1].w * m[3].z - m[1].y  * m[0].z * m[3].w + m[1].y  * m[0].w * m[3].z + m[3].y * m[0].z * m[1].w - m[3].y * m[0].w * m[1].z; float inv6 = -m[0].x  * m[1].z * m[3].w + m[0].x  * m[1].w * m[3].z + m[1].x  * m[0].z * m[3].w - m[1].x  * m[0].w * m[3].z - m[3].x * m[0].z * m[1].w + m[3].x * m[0].w * m[1].z; float inv10 = m[0].x  * m[1].y * m[3].w - m[0].x  * m[1].w * m[3].y - m[1].x  * m[0].y * m[3].w + m[1].x  * m[0].w * m[3].y + m[3].x * m[0].y * m[1].w - m[3].x * m[0].w * m[1].y; float inv14 = -m[0].x  * m[1].y * m[3].z + m[0].x  * m[1].z * m[3].y + m[1].x  * m[0].y * m[3].z - m[1].x  * m[0].z * m[3].y - m[3].x * m[0].y * m[1].z + m[3].x * m[0].z * m[1].y; float inv3 = -m[0].y * m[1].z * m[2].w + m[0].y * m[1].w * m[2].z + m[1].y * m[0].z * m[2].w - m[1].y * m[0].w * m[2].z - m[2].y * m[0].z * m[1].w + m[2].y * m[0].w * m[1].z; float inv7 = m[0].x * m[1].z * m[2].w - m[0].x * m[1].w * m[2].z - m[1].x * m[0].z * m[2].w + m[1].x * m[0].w * m[2].z + m[2].x * m[0].z * m[1].w - m[2].x * m[0].w * m[1].z; float inv11 = -m[0].x * m[1].y * m[2].w + m[0].x * m[1].w * m[2].y + m[1].x * m[0].y * m[2].w - m[1].x * m[0].w * m[2].y - m[2].x * m[0].y * m[1].w + m[2].x * m[0].w * m[1].y; float inv15 = m[0].x * m[1].y * m[2].z - m[0].x * m[1].z * m[2].y - m[1].x * m[0].y * m[2].z + m[1].x * m[0].z * m[2].y + m[2].x * m[0].y * m[1].z - m[2].x * m[0].z * m[1].y; float det = m[0].x * inv0 + m[0].y * inv4 + m[0].z * inv8 + m[0].w * inv12; det = 1.0 / det; return det*mat4( inv0, inv1, inv2, inv3,inv4, inv5, inv6, inv7,inv8, inv9, inv10, inv11,inv12, inv13, inv14, inv15);}\n" +
        "float sinh(float x)  { return (exp(x)-exp(-x))/2.; }\n" +
        "float cosh(float x)  { return (exp(x)+exp(-x))/2.; }\n" +
        "float tanh(float x)  { return sinh(x)/cosh(x); }\n" +
        "float coth(float x)  { return cosh(x)/sinh(x); }\n" +
        "float sech(float x)  { return 1./cosh(x); }\n" +
        "float csch(float x)  { return 1./sinh(x); }\n" +
        "float asinh(float x) { return    log(x+sqrt(x*x+1.)); }\n" +
        "float acosh(float x) { return    log(x+sqrt(x*x-1.)); }\n" +
        "float atanh(float x) { return .5*log((1.+x)/(1.-x)); }\n" +
        "float acoth(float x) { return .5*log((x+1.)/(x-1.)); }\n" +
        "float asech(float x) { return    log((1.+sqrt(1.-x*x))/x); }\n" +
        "float acsch(float x) { return    log((1.+sqrt(1.+x*x))/x); }\n";
      if (mShaderTextureLOD) {
        fragmentShader +=
          "vec4 textureLod(  sampler2D   s, vec2 c, float b)          { return texture2DLodEXT(s,c,b); }\n";
        fragmentShader +=
          "vec4 textureGrad( sampler2D   s, vec2 c, vec2 dx, vec2 dy) { return texture2DGradEXT(s,c,dx,dy); }\n";
      }
    }

    fragmentShader += fsh;
    console.log(fragmentShader);
    this.shader = WebGL.linkShader(this.gl, vertexShader, fragmentShader);
    this.shader.vertexAttribute = this.gl.getAttribLocation(
      this.shader,
      "aPosition"
    );
    this.gl.enableVertexAttribArray(this.shader.vertexAttribute);

    this.height = window.innerHeight / res;
    this.width = window.innerWidth / res;
    this.canvas.setAttribute("width", this.width);
    this.canvas.setAttribute("height", this.height);

    this.vertexBuffer = WebGL.createVBO(this.gl, 3, [
      1.0,
      1.0,
      0.0,
      -1.0,
      1.0,
      0.0,
      1.0,
      -1.0,
      0.0,
      -1.0,
      -1.0,
      0.0
    ]);
    this.running = false;
    this.time0 = 0.0;
  }

  loadTexture(channelNumber, source) {
    var texture = this.gl.createTexture();
    var gl = this.gl;
    texture.image = new Image();
    texture.image.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

      try {
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          texture.image
        );
      } catch (err) {
        console.log(`ERROR: Failed to load texture ${source} : ${err}`);

        console.log(`INFO: Generating placeholder texture for ${source}`);
        var w = 64,
          bw = 4,
          data = [];
        for (var y = 0; y < w; y++) {
          for (var x = 0; x < w; x++) {
            var ix = parseInt(x / bw),
              iy = parseInt(y / bw);
            var c = 0xff * ((ix + iy) % 2);
            data = data.concat([c, c, c, 0xff]);
          }
        }
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGBA,
          w,
          w,
          0,
          gl.RGBA,
          gl.UNSIGNED_BYTE,
          new Uint8Array(data)
        );
      }

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.bindTexture(gl.TEXTURE_2D, null);

      this.textures[channelNumber] = texture;
    };
    texture.image.src = source;
  }

  start() {
    if (this.running) {
      return;
    }

    this._start();
  }

  _start() {
    this.running = true;
    this.time0 = WebGL.getTime();
    this.timePreviousFrame = this.time0;

    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.useProgram(this.shader);
  }

  stop() {
    this.running = false;
  }

  frame(gameTime) {
    let gl = this.gl;
    if (!this.running) {
      return;
    }

    let shader = this.shader;
    let time = WebGL.getTime() - this.time0;
    let dt = time - this.timePreviousFrame;
    this.timePreviousFrame = time;

    gl.clear(gl.DEPTH_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
    gl.vertexAttribPointer(
      shader.vertexAttribute,
      this.vertexBuffer.itemSize,
      gl.FLOAT,
      false,
      0,
      0
    );

    // set texture
    for (var channel in this.textures) {
      var texture = this.textures[channel];
      gl.activeTexture(gl.TEXTURE0 + parseInt(channel));
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1i(
        gl.getUniformLocation(shader, "iChannel" + channel),
        channel
      );
    }

    // update uniforms
    gl.uniform3f(
      gl.getUniformLocation(shader, "iResolution"),
      this.width,
      this.height,
      0
    );
    gl.uniform1f(gl.getUniformLocation(shader, "iGlobalTime"), time); // legacy support
    gl.uniform1f(gl.getUniformLocation(shader, "iTime"), time);
    gl.uniform1f(gl.getUniformLocation(shader, "gameTime"), gameTime);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);
  }

  static createVBO(gl, stride, vertexData) {
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array(vertexData),
      gl.STATIC_DRAW
    );
    vertexBuffer.itemSize = stride;
    vertexBuffer.numItems = vertexData.length / stride;
    return vertexBuffer;
  }

  static linkShader(gl, vertexSource, fragmentSource) {
    var program = gl.createProgram();
    gl.attachShader(
      program,
      WebGL.compileShader(gl, gl.VERTEX_SHADER, vertexSource)
    );
    gl.attachShader(
      program,
      WebGL.compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
    );
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      WebGL.showLogProgram(gl, program);
      throw `Failed to link shader!`;
    }

    program.uniformLocation = (gl, name) =>
      gl.getUniformLocation(program, name);

    return program;
  }

  static compileShader(gl, shaderType, source) {
    var shader = gl.createShader(shaderType);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      let type =
        shaderType == gl.VERTEX_SHADER ? "vertex shader" : "fragment shader";
      WebGL.showLog(gl, shader);
      throw `Failed to compile ${type}`;
    }
    return shader;
  }

  static getTime() {
    return 0.001 * new Date().getTime();
  }
  static showLog(gl, shader) {
    console.log(shader);
    var compilationLog = gl.getShaderInfoLog(shader);
    console.log("ERROR: " + compilationLog);
  }
  static showLogProgram(gl, program) {
    console.log(program);
    var compilationLog = gl.getProgramInfoLog(program);
    console.log("ERROR: " + compilationLog);
  }
}

function startSky(res) {
  var webGL = new WebGL("sky-canvas", res);
  webGL.loadTexture(0, "assets/noise.png");

  webGL.start();
  return webGL;
}

export { startSky };
