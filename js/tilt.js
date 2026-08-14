/*
 * Leve inclinação 3D + brilho que acompanha o cursor nos cards (.card).
 * Desativado se o usuário preferir menos movimento (prefers-reduced-motion) —
 * nesse caso o fade do brilho continua funcionando (é CSS puro em
 * components.css), só a rotação 3D é que não é aplicada.
 */

(function () {
  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) return;

  var MAX_TILT_DEG = 6;

  document.querySelectorAll(".card").forEach(function (card) {
    card.addEventListener("mousemove", function (event) {
      var rect = card.getBoundingClientRect();
      var percentX = (event.clientX - rect.left) / rect.width;
      var percentY = (event.clientY - rect.top) / rect.height;

      var rotateY = (percentX - 0.5) * MAX_TILT_DEG;
      var rotateX = (0.5 - percentY) * MAX_TILT_DEG;

      card.style.setProperty("--mx", percentX * 100 + "%");
      card.style.setProperty("--my", percentY * 100 + "%");
      card.style.transform = "rotateX(" + rotateX + "deg) rotateY(" + rotateY + "deg)";
    });

    card.addEventListener("mouseleave", function () {
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
      card.style.setProperty("--mx", "50%");
      card.style.setProperty("--my", "50%");
    });
  });
})();
