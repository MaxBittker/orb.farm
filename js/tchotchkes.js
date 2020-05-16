import ICO from "icojs/browser";

function importAll(r) {
  return r.keys().map(r);
}
const icos = importAll(require.context("../ico", false, /\.(ico)$/));
function randomIco() {
  let i = Math.random() * icos.length;
  let url = icos[i | 0];
  return icoToImage(url).then(image => image || randomIco());
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
      // console.log(images);
      let images16 = images.filter(({ height }) => height == 16);
      images16 = images16.sort((a, b) => b.bpp - a.bpp);
      // console.log(images16);

      let image = images16[0];
      if (!image) return false;
      // console.dir(image);
      image.url = url;
      return image;
    });

function getTchotchkes() {
  return Promise.all(icos.map(icoToImage)).then(function(values) {
    // console.log(values);
    return values;
  });
}
// getTchotchkes().then(v => {
//   v.filter(i => i);
// });

export { getTchotchkes, icos, icoToImage, randomIco };
