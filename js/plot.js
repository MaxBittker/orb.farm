import { universe_O2 } from "../crate/pkg/sandtable_bg";

const reglBuilder = require("regl");
// import { memory } from "../crate/pkg/sandtable_bg";
// window.memory = memory;
// import { Species } from "././crate/pkg/sandtable";
// import { Universe } from "../crate/pkg";

let fsh = require("./glsl/plot.glsl");
let vsh = require("./glsl/sandVertex.glsl");

let readingsIndex = 0;
let n_readings = 0;
let max_readings = 60 * 60;
let readings = new Uint8Array(max_readings);

let startPlotter = ({ canvas, universe }) => {
  const regl = reglBuilder({
    canvas
  });
  const width = max_readings / 4;
  const height = 1;

  const dataTexture = regl.texture({
    width,
    height,
    data: readings
  });

  let drawPlot = regl({
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
      i: () => readingsIndex,
      n_readings: () => n_readings,
      max_readings,
      data: () => {
        readings[readingsIndex] = (255 * universe.O2()) / universe.total_gas();
        readingsIndex = (readingsIndex + 1) % max_readings;
        n_readings = Math.max(readingsIndex, n_readings);

        // console.log(readings);
        return dataTexture({
          width,
          height,
          data: readings
        });
      },

      resolution: ({ viewportWidth, viewportHeight }) => [
        viewportWidth,
        viewportHeight
      ],
      dpi: window.devicePixelRatio * 2
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
    drawPlot();
  };
};

export { startPlotter };
