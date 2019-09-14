import ICO from "icojs/browser";

function importAll(r) {
  return r.keys().map(r);
}
const icos = importAll(require.context("../tchotchkes", false, /\.(ico)$/));
function randomIco() {
  let i = Math.random() * icos.length;
  return icos[i | 0];
}
// console.log(icos);
// let images = [];
const icoToImage = url =>
  fetch(url)
    .then(res => {
      if (!res.ok) {
        throw Error(res.statusText);
      }
      return res.arrayBuffer();
    }) // Gets the response and returns it as a blob
    // Gets the response and returns it as a blob
    .then(function(buffer) {
      return ICO.parse(buffer).catch(err => {
        console.log(err + url);
      });
    })
    .then(function(images) {
      let image = images[0];
      // console.dir(image);
      images.push(image);

      return image;
    });

function getTchotchkes() {
  return Promise.all(icos.map(icoToImage)).then(function(values) {
    // console.log(values);
    return values;
  });
}

export { getTchotchkes, icos, icoToImage, randomIco };
