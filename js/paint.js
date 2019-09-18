import { height, universe, width, ratio } from "./index.js";
import { icoToImage } from "./tchotchkes";

import { Species } from "../crate/pkg";

const canvas = document.getElementById("sand-canvas");

const eventDistance = (a, b) => {
  return Math.sqrt(
    Math.pow(a.clientX - b.clientX, 2) + Math.pow(a.clientY - b.clientY, 2),
    2
  );
};

const magnitude = a => {
  return Math.sqrt(Math.pow(a.clientX, 2) + Math.pow(a.clientY, 2), 2);
};

const norm = a => {
  let mag = magnitude(a);
  return { clientX: a.clientX / mag, clientY: a.clientY / mag };
};
const scale = (a, s) => {
  return { clientX: a.clientX * s, clientY: a.clientY * s };
};
const add = (a, b) => {
  return { clientX: a.clientX + b.clientX, clientY: a.clientY + b.clientY };
};
const sub = (a, b) => {
  return { clientX: a.clientX - b.clientX, clientY: a.clientY - b.clientY };
};

let painting = false;
let lastPaint = null;
let repeat = null;
function tryPlaceTchotchke(event) {
  let url = window.UI.state.selectedTchotchke;
  if (url) {
    window.UI.setState(({ tchotchkes }) => {
      tchotchkes.delete(url);
      document.documentElement.style.cursor = `default`;
      return { tchotchkes, selectedTchotchke: null };
    });
    const [x, y] = convertEventCoordinates(event);

    icoToImage(url).then(image => {
      universe.place_sprite(x - 8, y - 8, image.data);
      window.UI.upload();
    });
    return true;
  } else return false;
}
canvas.addEventListener("mousedown", event => {
  event.preventDefault();
  if (tryPlaceTchotchke(event)) {
    return;
  }
  universe.push_undo();

  painting = true;
  clearInterval(repeat);
  repeat = window.setInterval(() => paint(event), 100);
  paint(event);
  lastPaint = event;
});

document.body.addEventListener("mouseup", event => {
  clearInterval(repeat);
  if (painting) {
    event.preventDefault();
    lastPaint = null;
    painting = false;
  }
});

canvas.addEventListener("mousemove", event => {
  clearInterval(repeat);
  smoothPaint(event);
});

canvas.addEventListener("mouseleave", event => {
  clearInterval(repeat);
  lastPaint = null;
});

canvas.addEventListener("touchstart", event => {
  if (event.cancelable) {
    event.preventDefault();
  }
  let touches = Array.from(event.touches);
  if (tryPlaceTchotchke(touches[0])) {
    return;
  }
  universe.push_undo();

  painting = true;
  lastPaint = event;
  handleTouches(event);
});

canvas.addEventListener("touchend", event => {
  if (event.cancelable) {
    event.preventDefault();
  }
  lastPaint = null;
  painting = false;
  clearInterval(repeat);
});

canvas.addEventListener("touchmove", event => {
  if (!window.paused) {
    if (event.cancelable) {
      event.preventDefault();
    }
  }
  clearInterval(repeat);
  handleTouches(event);
});

function smoothPaint(event) {
  clearInterval(repeat);
  repeat = window.setInterval(() => paint(event), 100);
  let startEvent = { clientX: event.clientX, clientY: event.clientY };
  if (!painting) {
    return;
  }
  let size = speciesSizes[window.UI.state.selectedElement] || 2;

  let i = 0;
  paint(startEvent);
  if (
    lastPaint &&
    window.UI.state.selectedElement != Species.Fish &&
    window.UI.state.selectedElement != Species.GoldFish
  ) {
    while (eventDistance(startEvent, lastPaint) > size / 3) {
      let d = eventDistance(startEvent, lastPaint);
      startEvent = add(
        startEvent,
        scale(norm(sub(lastPaint, event)), Math.min(size / 3, d))
      );
      i++;
      if (i > 1000) {
        break;
      }
      paint(startEvent);
    }
  }
  lastPaint = event;
}

const handleTouches = event => {
  let touches = Array.from(event.touches);
  if (touches.length == 1) {
    smoothPaint(touches[0]);
  } else {
    touches.forEach(paint);
  }
};

let speciesSizes = {
  [Species.Water]: 13,
  [Species.Sand]: 8,
  [Species.Air]: 7,

  [Species.Algae]: 2,
  [Species.Fish]: 2,
  [Species.GoldFish]: 2,
  [Species.Daphnia]: 2,
  [Species.Zoop]: 2,
  [Species.Seed]: 2,
  [Species.Bacteria]: 2
};
function convertEventCoordinates(event) {
  const boundingRect = canvas.getBoundingClientRect();

  const scaleX =
    canvas.width /
    (ratio * Math.ceil(window.devicePixelRatio)) /
    boundingRect.width;
  const scaleY =
    canvas.height /
    (ratio * Math.ceil(window.devicePixelRatio)) /
    boundingRect.height;

  const canvasLeft = (event.clientX - boundingRect.left) * scaleX;
  const canvasTop = (event.clientY - boundingRect.top) * scaleY;

  const x = Math.min(Math.floor(canvasLeft), width - 1);
  const y = Math.min(Math.floor(canvasTop), height - 1);
  return [x, y];
}
const paint = event => {
  if (!painting) {
    return;
  }
  const [x, y] = convertEventCoordinates(event);
  if (window.UI.state.selectedElement < 0) return;

  let size = speciesSizes[window.UI.state.selectedElement] || 3;
  universe.paint(x, y, size, window.UI.state.selectedElement);
};
