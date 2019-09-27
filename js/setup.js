// if (window.safari) {
//   history.pushState(null, null, location.href);
//   window.onpopstate = function(event) {
//     history.go(1);
//   };
// }

let background = document.getElementById("background");
let fadeTimout = 10 * 30;
let timeout = window.setTimeout(() => {
  if (window.UI.state.tutorialProgress > 4) {
    document.body.classList.add("faded");
  }
}, fadeTimout);

let handleActivity = e => {
  window.clearTimeout(timeout);
  document.body.classList.remove("faded");
  timeout = window.setTimeout(() => {
    if (window.UI.state.tutorialProgress > 4) {
      document.body.classList.add("faded");
    }
  }, fadeTimout);
};
document.body.addEventListener("mousemove", handleActivity);
document.body.addEventListener("touchstart", handleActivity);

background.addEventListener("touchmove", e => {
  if (!window.paused) {
    if (e.cancelable) {
      e.preventDefault();
    }
  }
});

// if ("serviceWorker" in navigator) {
//   window.addEventListener("load", () => {
//     navigator.serviceWorker
//       .register("/service-worker.js")
//       .then(registration => {
//         console.log("SW registered: ", registration);
//       })
//       .catch(registrationError => {
//         console.log("SW registration failed: ", registrationError);
//       });
//   });
// }
