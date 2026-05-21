(function () {
  "use strict";

  const swirl = document.getElementById("hero-swirl");
  if (!swirl) return;

  let ticking = false;

  function updateParallax() {
    const scrollY = window.scrollY;
    const offset = scrollY * 0.15;
    swirl.style.transform = "translateY(" + offset + "px)";
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    function () {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    },
    { passive: true }
  );
})();
