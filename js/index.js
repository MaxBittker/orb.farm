import { Universe, Species } from "../crate/pkg";

import { startWebGL } from "./render";
import { fps } from "./fps";
import {} from "./paint";
import {} from "./app";
import {} from "./setup";

let n = 200;
let h = n / 2;
const universe = Universe.new(n, n);
universe.paint(h, h, n + 2, Species.Glass);
universe.paint(h, h, n - 2, Species.Air);
// for (var x = -50; x <= 49; x += 1) {
//   universe.paint(h + x, h + 49, 204, Species.Glass);
//   universe.paint(h + x, h + 49, 200, Species.Air);

//   universe.paint(h + x, h - 50, 204, Species.Glass);
//   universe.paint(h + x, h - 50, 200, Species.Air);

//   universe.paint(h - 50, h + x, 204, Species.Glass);
//   universe.paint(h - 50, h + x, 200, Species.Air);

//   universe.paint(h + 49, h + x, 204, Species.Glass);
//   universe.paint(h + 49, h + x, 200, Species.Air);
// }
// universe.paint(h, h, 299, Species.Air);

for (var x = 30; x < n - 30; x += 10) {
  universe.paint(x, 150, 200, Species.Water);
}

for (var x = 0; x < n; x += 10) {
  universe.paint(x, 250, 20, Species.Sand);
}

universe.paint(150, 50, 25, Species.Seed);
let ratio = 2;
let width = n;
let height = n;
const canvas = document.getElementById("sand-canvas");

canvas.height = n * ratio * Math.ceil(window.devicePixelRatio);
canvas.width = n * ratio * Math.ceil(window.devicePixelRatio);

document.getElementById("background").addEventListener("touchmove", e => {
  if (!window.paused) {
    if (e.cancelable) {
      e.preventDefault();
    }
  }
});

const ui = document.getElementById("ui");

let resize = () => {
  let screen_width = window.innerWidth;
  let uiheight = 50;
  let screen_height = window.innerHeight - uiheight;

  let canvasStyle = "";
  let uiStyle = "";
  if (screen_width > screen_height) {
    if (screen_width - window.innerHeight < 400) {
      // landscape compressed
      canvasStyle = `height: ${window.innerHeight}px; margin:3px`;
      uiStyle = `width: ${screen_width -
        window.innerHeight -
        12}px; margin: 2px;`;
    } else {
      // landscape wide
      canvasStyle = `height: ${window.innerHeight}px`;
      uiStyle = `width: ${(screen_width - window.innerHeight) / 2 -
        7}px; margin: 2px;`;
    }
  } else {
    //portrait (mobile)
    canvasStyle = `width: ${screen_width}px; `;
    uiStyle = "";
  }
  ui.style = uiStyle;
  canvas.style = canvasStyle;
};

resize();
window.addEventListener("deviceorientation", resize, true);
window.addEventListener("resize", resize);

let drawSand = startWebGL({ canvas, universe });
// let light = startLight({ universe });
const renderLoop = () => {
  if (!window.paused) {
    fps.render(); // new
    universe.tick();
    // light.update();
  }
  drawSand();

  window.animationId = requestAnimationFrame(renderLoop);
};

function reset() {
  universe.reset();
}
window.u = universe;
window.universe = universe;
renderLoop();

export { canvas, width, height, ratio, universe, reset };
