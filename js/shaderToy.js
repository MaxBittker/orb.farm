let fsh = require("./glsl/sky.glsl");

/* Compatibility */
/*forked from https://github.com/bysse/shadertoy-webgl-harness*/
(function() {
  var vendors = ["ms", "moz", "webkit", "o"];
  for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
    window.requestAnimationFrame = window[vendors[x] + "RequestAnimationFrame"];
    window.cancelAnimationFrame =
      window[vendors[x] + "CancelAnimationFrame"] ||
      window[vendors[x] + "CancelRequestAnimationFrame"];
  }
})();

class WebGL {
  constructor(canvasId, _, fullscreen, maxLength = 0.0) {
    this.canvas = document.getElementById(canvasId);
    this.gl = this.canvas.getContext("experimental-webgl");
    this.gl.getExtension("EXT_shader_texture_lod");

    this.audio = null;
    this.maxLength = maxLength;
    this.textures = {};
    let shaderToyPrefix = `
        #extension GL_EXT_shader_texture_lod : enable
        precision mediump float; uniform vec3 iResolution;
         uniform float iGlobalTime, iTime;
         uniform vec4      iMouse;
         uniform sampler2D iChannel0;
         uniform sampler2D iChannel1;
         uniform sampler2D iChannel2;
         uniform sampler2D iChannel3;
         \n `;
    let shaderToySuffix =
      "\nvoid main() { vec4 color = vec4(0.0); mainImage(color, gl_FragCoord.xy); gl_FragColor = color; }";

    let vertexShader =
      "attribute vec4 aPosition; void main() { gl_Position = aPosition; } ";
    let fragmentShader = shaderToyPrefix + fsh + shaderToySuffix;

    this.shader = WebGL.linkShader(this.gl, vertexShader, fragmentShader);
    this.shader.vertexAttribute = this.gl.getAttribLocation(
      this.shader,
      "aPosition"
    );
    this.gl.enableVertexAttribArray(this.shader.vertexAttribute);

    let res = 8;
    if (fullscreen) {
      this.height = window.innerHeight / 8;
      this.width = window.innerWidth / 8;
    } else {
      this.width = parseInt(this.canvas.getAttribute("width"));
      this.height = parseInt(this.canvas.getAttribute("height"));
    }
    this.canvas.setAttribute("width", this.width);
    this.canvas.setAttribute("height", this.height);
    this.canvas.style = `
  width: 100%;
  height: 100%;
  image-rendering: pixelated;`;
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
    this.refresh_audio = false;

    window.addEventListener("keydown", event => {
      if (event.keyCode == 32) {
        event.preventDefault();
        if (this.running) {
          this.stop();
        } else {
          this.start();
        }
      }
      var now = WebGL.getTime();
      if (event.keyCode == 37) {
        this.time0 = Math.min(this.time0, now);
        this.refresh_audio = true;
      }
      if (event.keyCode == 39) {
        this.time0 -= 1.0;
        this.refresh_audio = true;
      }
    });
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

  loadMusic(elementId, runWhenLoaded) {
    this.audio = document.getElementById(elementId);
    if (runWhenLoaded) {
      if (this.audio.autoplay != true) {
        console.log(
          `ERROR: autoplay property is not set on ${elementId}, automatic playback might not work properly`
        );
      }
      this.audio.oncanplay = e => this.start();
      this.audio.onplay = e => this._start();
      this.audio.onpause = e => this.stop();
    }
    this.audio.load();
  }

  start() {
    if (this.running) {
      return;
    }

    if (this.audio == null) {
      this._start();
    } else {
      var promise = this.audio.play();
      if (promise === undefined) {
        console.log("ERROR: Failed to start audio");
      } else {
        promise
          .then(_ => {
            this._start();
          })
          .catch(error => {
            this.audio.controls = true;
          });
      }
    }
  }

  _start() {
    this.running = true;
    this.time0 = WebGL.getTime();
    this.timePreviousFrame = this.time0;

    this.gl.disable(this.gl.DEPTH_TEST);
    this.gl.viewport(0, 0, this.width, this.height);
    this.gl.useProgram(this.shader);

    this._frame(this.gl);
  }

  stop() {
    this.running = false;

    if (this.audio != null) {
      this.audio.pause();
    }
  }

  _frame(gl) {
    if (!this.running) {
      return;
    }

    let shader = this.shader;
    let time = WebGL.getTime() - this.time0;
    let dt = time - this.timePreviousFrame;
    this.timePreviousFrame = time;

    if (this.refresh_audio && this.audio) {
      this.audio.currentTime = time;
      this.refresh_audio = false;
    }

    if (this.maxLength > 0.0 && time > this.maxLength) {
      this.stop();
      return;
    }

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
    let r = Math.min(this.width, this.height) * 0.5;
    gl.uniform4f(
      gl.getUniformLocation(shader, "iMouse"),
      Math.sin(time) * r,
      Math.cos(time) * r,
      0,
      0
    );
    // console.log(time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.vertexBuffer.numItems);

    requestAnimationFrame(() => this._frame(gl));
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

  static showLog(gl, shader) {
    var compilationLog = gl.getShaderInfoLog(shader);
    console.log("ERROR: " + compilationLog);
  }

  //   static showSource(fragmentSourceId) {
  //     var shader = WebGL.loadShader(fragmentSourceId);
  //     var body = document.getElementsByTagName("body")[0];
  //     console.log(body);

  //     var code = document.createElement("pre");
  //     code.innerText = shader;
  //     body.appendChild(code);
  //   }

  static getTime() {
    return 0.001 * new Date().getTime();
  }
}

function main() {
  var fullscreen = true;
  var stopTime = 0; // 0 for looping

  webGL = new WebGL("sky-canvas", "fragment-shader", fullscreen, stopTime);
  webGL.loadTexture(0, "assets/noise.png");
  webGL.start();
}

main();
