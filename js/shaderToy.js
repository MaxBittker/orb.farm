let fsh = require("./glsl/sky.glsl");

/*forked from https://github.com/bysse/shadertoy-webgl-harness*/
class WebGL {
  constructor(canvasId, res) {
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext("webgl");
    this.textures = {};

    let vertexShader =
      "attribute vec4 aPosition; void main() { gl_Position = aPosition; } ";
    let fragmentShader = "";

    let mIs20 = !(this.gl instanceof WebGLRenderingContext);
    let mDerivatives;
    let mShaderTextureLOD;
    if (mIs20) {
      mDerivatives = true;
      mShaderTextureLOD = true;
    } else {
      mDerivatives = this.gl.getExtension("OES_standard_derivatives");
      mShaderTextureLOD = this.gl.getExtension("EXT_shader_texture_lod");
    }
    if (mShaderTextureLOD) {
      fragmentShader += "#extension GL_EXT_shader_texture_lod : enable\n";
    }
    if (mDerivatives) {
      fragmentShader +=
        "#ifdef GL_OES_standard_derivatives\n#extension GL_OES_standard_derivatives : enable\n#endif\n";
    }
    fragmentShader += fsh;

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
      WebGL.showLog(gl, program);
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
    var compilationLog = gl.getShaderInfoLog(shader);
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
