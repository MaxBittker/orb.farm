const reglBuilder = require("regl");
const GIF = require("gif.js");
// const GIF = require("gl-gif");
import { memory } from "../crate/pkg/sandtable_bg";
window.memory = memory;
import { Species } from "../crate/pkg/sandtable";
import { Universe } from "../crate/pkg";
import { finished } from "stream";

let fsh = require("./glsl/sand.glsl");
let vsh = require("./glsl/sandVertex.glsl");

let startWebGL = ({ canvas, universe, isSnapshot = false, gl }) => {
  let regl;
  if (gl) {
    regl = reglBuilder({
      gl,
      attributes: { preserveDrawingBuffer: isSnapshot }
    });
  } else {
    regl = reglBuilder({
      canvas,
      attributes: { preserveDrawingBuffer: isSnapshot }
    });
  }
  // const lastFrame = regl.texture();
  const width = universe.width();
  const height = universe.height();
  let cell_pointer = universe.cells();
  let light_pointer = universe.lights();
  let sprite_pointer = universe.sprite();
  let cells = new Uint8Array(memory.buffer, cell_pointer, width * height * 4);
  let lights = new Uint8Array(memory.buffer, light_pointer, width * height * 4);
  let sprite = new Uint8Array(
    memory.buffer,
    sprite_pointer,
    width * height * 4
  );
  const dataTexture = regl.texture({ width, height, data: cells });
  const lightTexture = regl.texture({ width, height, data: lights });
  const spriteTexture = regl.texture({ width, height, data: sprite });

  let drawSand = regl({
    blend: {
      enable: true,
      func: {
        srcRGB: "src alpha",
        srcAlpha: 1,
        dstRGB: "one minus src alpha",
        dstAlpha: 1
      },
      equation: {
        rgb: "add",
        alpha: "add"
      },
      color: [0, 0, 0, 0]
    },
    frag: fsh,
    uniforms: {
      t: ({ tick }) => tick,
      dataTexture: () => {
        cell_pointer = universe.cells();
        cells = new Uint8Array(memory.buffer, cell_pointer, width * height * 4);
        return dataTexture({ width, height, data: cells });
      },
      lightTexture: () => {
        light_pointer = universe.lights();

        lights = new Uint8Array(
          memory.buffer,
          light_pointer,
          width * height * 4
        );

        return lightTexture({ width, height, data: lights });
      },
      spriteTexture: () => {
        sprite_pointer = universe.sprite();

        sprite = new Uint8Array(
          memory.buffer,
          sprite_pointer,
          width * height * 4
        );

        return spriteTexture({ width, height, data: sprite });
      },
      resolution: ({ viewportWidth, viewportHeight }) => [
        viewportWidth,
        viewportHeight
      ],
      dpi: 4,
      isSnapshot
      // backBuffer: lastFrame
    },

    vert: vsh,
    attributes: {
      // Full screen triangle
      position: [[-1, 4], [-1, -1], [4, -1]]
    },
    // Our triangle has 3 vertices
    count: 3
  });

  return {
    regl,
    draw: () => {
      regl.poll();
      drawSand();
    }
  };
};

let snapshot = universe => {
  let canvas = document.createElement("canvas");
  canvas.width = universe.width() / 2;
  canvas.height = universe.height() / 2;
  let render = startWebGL({ universe, canvas, isSnapshot: true });
  render();

  return canvas.toDataURL("image/png");
};

let exportGif = (universe, cb) => {
  window.paused = true;

  let canvas = document.createElement("canvas");
  canvas.width = universe.width() * 2;
  canvas.height = universe.height() * 2;
  let w = canvas.width;
  let h = canvas.height;
  // let gl = canvas.getContext("webgl");

  var gif = new GIF({
    workers: 2,
    quality: 10,
    width: canvas.width,
    height: canvas.height,
    transparent: "rgba(0,0,0,0)"
  });
  let frames = [];

  const tmpc = document.createElement("canvas");
  tmpc.width = w;
  tmpc.height = h;
  const tctx = tmpc.getContext("2d");

  frames = [];
  let frameSize = { width: canvas.width, height: canvas.height };

  const numFrames = 20;
  let t = window.t;
  for (var i = 0; i < numFrames; i++) {
    universe.set_time((t / 50) % 255);
    t += 5;
    universe.tick();
    canvas = document.createElement("canvas");
    canvas.width = universe.width() * 2;
    canvas.height = universe.height() * 2;
    let w = canvas.width;
    let h = canvas.height;
    let { regl, draw } = startWebGL({ universe, canvas, isSnapshot: false });

    draw();
    console.log("adding frame " + i);
    // gif.addFrame(gl, { copy: false });

    // this is faster but the y-axis gets flipped
    // let data = new ImageData(w, h);
    // let pixels = new Uint8Array(data.data.buffer);
    // regl.read(pixels);

    // gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels)

    // var bytes = new Uint8Array(100)
    // regl.read(bytes)

    tctx.clearRect(0, 0, w, h);

    tctx.drawImage(canvas, 0, 0);
    const data = tctx.getImageData(0, 0, w, h);
    frames.push(data);

    // // don't lock up the ui
    // if (i % 4 == 0) {
    //     await nextTick()
    // }
  }
  // console.log(frames);
  //boomerang
  frames = [...frames, ...frames.slice(0).reverse()];
  for (const frame of frames) {
    gif.addFrame(frame, { delay: 16 });
  }

  gif.on("finished", function(blob) {
    // window.open(URL.createObjectURL(blob));
    cb(URL.createObjectURL(blob));
  });
  gif.render();
  // const renderFrame = (n = 0) => {
  //   console.log(n);

  //   if (n == 20) {
  //     console.log("finished!");
  //     gif.on("finished", function(blob) {
  //       window.open(URL.createObjectURL(blob));
  //     });
  //     gif.render();
  //   } else {

  //     renderFrame(n + 1);
  //   }
  // };
  // renderFrame();
  window.paused = false;
};

let pallette = () => {
  let canvas = document.createElement("canvas");

  let species = Object.values(Species);
  let range = Math.max(...species) + 1;
  let universe = Universe.new(range, 1);
  canvas.width = range;
  canvas.height = 3;
  universe.reset();

  species.forEach(id => universe.paint(id, 0, 2, id));
  universe.paint(species.Air, 0, 2, species.Air);
  let render = startWebGL({ universe, canvas, isSnapshot: true }).draw;
  render();
  let ctx = canvas.getContext("webgl");
  let data = new Uint8Array(range * 4);
  ctx.readPixels(0, 0, range, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, data);
  let colors = {};
  species.forEach(id => {
    let index = id * 4;
    let color = `rgba(${data[index]},${data[index + 1]}, ${
      data[index + 2]
    }, 1.0)`;
    colors[id] = color;
  });
  return colors;
};

export { startWebGL, snapshot, pallette, exportGif };
