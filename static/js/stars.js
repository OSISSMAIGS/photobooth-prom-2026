(function () {
  "use strict";

  const canvas = document.getElementById("stars-canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  let stars = [];
  let animationId;
  let width = 0;
  let height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    initStars();
  }

  function initStars() {
    const count = Math.min(200, Math.floor((width * height) / 8000));
    stars = [];
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.3,
        opacity: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinklePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const time = Date.now() * 0.001;

    stars.forEach(function (star) {
      const twinkle =
        0.5 +
        0.5 * Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase);
      const alpha = star.opacity * twinkle;
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
      ctx.fillStyle =
        star.radius > 1
          ? "rgba(246, 198, 103, " + alpha + ")"
          : "rgba(255, 243, 209, " + alpha + ")";
      ctx.fill();
    });

    animationId = requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();

  window.addEventListener("beforeunload", function () {
    if (animationId) cancelAnimationFrame(animationId);
  });
})();
