const reglBuilder = require("regl");
import { memory } from "../crate/pkg/sandtable_bg";
window.memory = memory;
import { Species } from "../crate/pkg/sandtable";
import { Universe } from "../crate/pkg";

let fsh = require("./glsl/sand.glsl");
let vsh = require("./glsl/sandVertex.glsl");

let startWebGL = ({ canvas, universe, isSnapshot = false }) => {
  const regl = reglBuilder({
    canvas,
    attributes: { preserveDrawingBuffer: isSnapshot }
  });
  // const lastFrame = regl.texture();
  const width = universe.width();
  const height = universe.height();
  let cell_pointer = universe.cells();
  let light_pointer = universe.lights();
  let cells = new Uint8Array(memory.buffer, cell_pointer, width * height * 4);
  let lights = new Uint8Array(memory.buffer, light_pointer, width * height * 4);
  const dataTexture = regl.texture({ width, height, data: cells });
  const lightTexture = regl.texture({ width, height, data: lights });

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
      resolution: ({ viewportWidth, viewportHeight }) => [
        viewportWidth,
        viewportHeight
      ],
      dpi: window.devicePixelRatio * 2,
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

  return () => {
    regl.poll();
    drawSand();
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
  let render = startWebGL({ universe, canvas, isSnapshot: true });
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

export { startWebGL, snapshot, pallette };
