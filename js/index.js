import { Universe, Species } from "../crate/pkg";

import { startWebGL } from "./render";
import { startPlotter } from "./plot";
import { fps } from "./fps";
import {} from "./paint";
import {} from "./app";
import {} from "./setup";
import { startSky } from "./shaderToy";
import { getTchotchkes } from "./tchotchkes";

let n = 200;
let h = n / 2;
let d = n - 6;

const universe = Universe.new(n, n);

function drawBowl() {
  universe.paint(h, h, d + 2, Species.Glass);
  universe.paint(h - 30, d - 3, 20, Species.Wood);
  universe.paint(h + 30, d - 3, 20, Species.Wood);
  universe.paint(h, h, d - 2, Species.Air);
}

drawBowl();
// for (var x = 30; x < d - 30; x += 10) {
// universe.paint(x, h * 1.2, h, Species.Water);
// }

// for (var x = 0; x < d; x += 10) {
// universe.paint(x, n - 50, 40, Species.Sand);
// }
// universe.paint(h, h, h * 0.9, Species.Water);

// universe.paint(h, h, 2, Species.Zoop);
// universe.paint(h + 20, h, 2, Species.Fish);
// universe.paint(h, h * 1.2, 2, Species.Bacteria);
// universe.paint(h * 1.5, h * 1.2, 2, Species.Seed);

// universe.paint(h, h, 10, Species.Algae);

// universe.paint(150, 50, 25, Species.Seed);
let ratio = 2;
let width = n;
let height = n;
const canvas = document.getElementById("sand-canvas");

canvas.height = n * ratio * Math.ceil(window.devicePixelRatio);
canvas.width = n * ratio * Math.ceil(window.devicePixelRatio);

const HUD = document.getElementById("HUD");
let canvasSize;
let resize = () => {
  let screen_width = window.innerWidth;
  let HUDheight = 50;
  let screen_height = window.innerHeight - HUDheight;

  let canvasStyle = "";
  let HUDStyle = "";
  if (screen_width > screen_height) {
    if (screen_width - window.innerHeight < 400) {
      // landscape compressed
      canvasStyle = `height: ${window.innerHeight}px; margin:3px`;
      canvasSize = window.innerHeight;
      HUDStyle = `width: ${screen_width -
        window.innerHeight -
        12}px; margin: 2px;`;
    } else {
      // landscape wide
      canvasStyle = `height: ${window.innerHeight}px`;
      canvasSize = window.innerHeight;

      HUDStyle = `width: ${(screen_width - window.innerHeight) / 2 -
        7}px; margin: 2px;`;
    }
  } else {
    //portrait (mobile)
    canvasSize = screen_width;

    canvasStyle = `width: ${screen_width}px; `;
    HUDStyle = "";
  }
  HUD.style = HUDStyle;
  canvas.style = canvasStyle;
};

resize();
window.addEventListener("deviceorientation", resize, true);
window.addEventListener("resize", resize);

let drawSand = startWebGL({ canvas, universe });
let sky_ratio = canvasSize / n;

let sky;
try {
  sky = startSky(sky_ratio * 2);
} catch (e) {
  console.error("skys haunted");
  sky = {
    frame: () => {}
  };
}
let plotcanvas = document.getElementById("plot-canvas");
let { drawPlot, recordDataPoint } = startPlotter({
  canvas: plotcanvas,
  universe
});

let t = 0;

const renderLoop = () => {
  const now = performance.now();

  let max_tick_per_frame = window.ff ? 11 : 1;
  for (var i = 0; i < max_tick_per_frame; i++) {
    var dayTime = (t / 50) % 255;

    if (!window.paused) {
      fps.render(); // new

      universe.tick();
      t += 1;

      if (dayTime > 70 && dayTime < 170) {
        t += 10;
      }
    }
    universe.set_time(dayTime);

    recordDataPoint();
    let elapsed_time = performance.now() - now;
    if (elapsed_time > 13) {
      break;
    }
  }

  drawSand();
  sky.frame(dayTime / 255);
  drawPlot();

  window.animWebationId = requestAnimationFrame(renderLoop);
};
function reset() {
  console.log("reseting");
  localStorage.setItem("cell_data", null);
  universe.reset();
  localStorage.setItem("o2", universe.total_gas() / 2);

  drawBowl();
}
window.u = universe;
window.universe = universe;
renderLoop();

window.UI.load();
// getTchotchkes().then(images => {
//   images.forEach((image, i) => {
//     // console.log(image);
//     universe.place_sprite(
//       10 + Math.random() * 150,
//       10 + Math.random() * 150,
//       image.data
//     );
//   });
// });
// debugger;
export { canvas, width, height, ratio, universe, reset };
