// if (window.safari) {
//   history.pushState(null, null, location.href);
//   window.onpopstate = function(event) {
//     history.go(1);
//   };
// }

let background = document.getElementById("background");

let timeout = window.setTimeout(() => {
  document.body.classList.add("faded");
}, 12 * 1000);
let handleActivity = e => {
  window.clearTimeout(timeout);
  document.body.classList.remove("faded");
  timeout = window.setTimeout(() => {
    document.body.classList.add("faded");
  }, 12 * 1000);
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
