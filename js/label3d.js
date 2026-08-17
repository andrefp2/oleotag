/*
 * Movimento do selo 3D (.label3d) — 100% via requestAnimationFrame, sem
 * @keyframes CSS. Três estados, sem conflito entre eles:
 *
 *   1. Padrão: paira no ar — leve flutuação vertical + balanço de
 *      rotação, nada de giro completo automático.
 *   2. Parado, quando o mouse passa por cima (hover, desktop) — a
 *      flutuação pausa, fica só com o ângulo de base.
 *   3. Arrastar com o dedo (touch): gira livre nos eixos X e Y seguindo
 *      o movimento. Ao soltar, o ângulo onde parou vira a nova base, e a
 *      flutuação retoma a partir dali (não volta pro ângulo inicial).
 *
 * Reflexo dinâmico: um reflexo real de adesivo não fica parado — ele
 * desliza e muda de intensidade conforme o ângulo de visão muda. A cada
 * frame, calculamos o ângulo "de frente" de cada face (a da frente e a
 * de trás têm ângulos opostos) e escrevemos isso como custom properties
 * (--gloss-x/--gloss-y/--gloss-shift/--gloss-intensity) que o CSS usa
 * pra posicionar e atenuar o brilho — o reflexo varre a superfície e
 * quase desaparece quando a face está de perfil, exatamente como luz
 * refletindo de verdade.
 *
 * Com prefers-reduced-motion, não paira sozinha (fica só no ângulo de
 * base), mas arrastar com o dedo continua funcionando — é uma ação
 * iniciada pelo usuário, não um loop automático.
 */

(function () {
  var wrap = document.querySelector(".label3d");
  var spin = document.querySelector(".label3d__spin");
  var frontFace = document.querySelector(".label3d__face--front");
  var backFace = document.querySelector(".label3d__face--back");
  if (!wrap || !spin) return;

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var DRAG_SENSITIVITY = 0.5;
  var MAX_TILT_DEG = 70;

  var FLOAT_Y_PX = 9;
  var FLOAT_Y_PERIOD_MS = 4200;
  var FLOAT_ROT_DEG = 2.5;
  var FLOAT_ROT_PERIOD_MS = 5300;

  var TAP_MAX_DISTANCE_PX = 10;
  var TAP_MAX_DURATION_MS = 300;
  var FLIP_TRANSITION_MS = 600;

  var baseRotateX = 6;
  var baseRotateY = -20;
  var dragging = false;
  var hovering = false;
  var lastPointer = null;
  var touchStartPointer = null;
  var touchStartTime = null;
  var touchTraveled = 0;
  var startTime = null;

  function normalizeAngle(deg) {
    // reduz pra faixa -180..180
    var a = deg % 360;
    if (a > 180) a -= 360;
    if (a < -180) a += 360;
    return a;
  }

  function updateGloss(currentRotateX, currentRotateY) {
    [
      { el: frontFace, offset: 0 },
      { el: backFace, offset: 180 },
    ].forEach(function (face) {
      if (!face.el) return;

      var facingAngle = normalizeAngle(currentRotateY + face.offset);
      var clamped = Math.max(-90, Math.min(90, facingAngle));

      var glossX = 50 + (clamped / 90) * 42;
      var glossY = 22 + (currentRotateX / MAX_TILT_DEG) * 16;
      var glossShift = (clamped / 90) * 55;
      var intensity = Math.max(0, 1 - Math.abs(clamped) / 90);

      face.el.style.setProperty("--gloss-x", glossX.toFixed(1) + "%");
      face.el.style.setProperty("--gloss-y", glossY.toFixed(1) + "%");
      face.el.style.setProperty("--gloss-shift", glossShift.toFixed(1) + "%");
      face.el.style.setProperty("--gloss-intensity", intensity.toFixed(2));
    });
  }

  function applyTransform(floatY, floatRot) {
    var currentRotateX = baseRotateX;
    var currentRotateY = baseRotateY + floatRot;

    spin.style.transform =
      "translateY(" + floatY.toFixed(2) + "px) " +
      "rotateX(" + currentRotateX.toFixed(2) + "deg) " +
      "rotateY(" + currentRotateY.toFixed(2) + "deg)";

    updateGloss(currentRotateX, currentRotateY);
  }
  applyTransform(0, 0);

  function frame(time) {
    if (startTime === null) startTime = time;
    var elapsed = time - startTime;

    if (dragging || reduceMotion) {
      applyTransform(0, 0);
    } else if (hovering) {
      applyTransform(0, 0);
    } else {
      var floatY = Math.sin((elapsed / FLOAT_Y_PERIOD_MS) * Math.PI * 2) * FLOAT_Y_PX;
      var floatRot = Math.sin((elapsed / FLOAT_ROT_PERIOD_MS) * Math.PI * 2) * FLOAT_ROT_DEG;
      applyTransform(floatY, floatRot);
    }

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  wrap.addEventListener("mouseenter", function () {
    hovering = true;
  });

  wrap.addEventListener("mouseleave", function () {
    hovering = false;
  });

  wrap.addEventListener(
    "touchstart",
    function (event) {
      dragging = true;
      spin.style.transition = "";
      var t = event.touches[0];
      lastPointer = { x: t.clientX, y: t.clientY };
      touchStartPointer = { x: t.clientX, y: t.clientY };
      touchStartTime = performance.now();
      touchTraveled = 0;
    },
    { passive: true }
  );

  wrap.addEventListener(
    "touchmove",
    function (event) {
      if (!dragging || !lastPointer) return;
      var t = event.touches[0];
      var dx = t.clientX - lastPointer.x;
      var dy = t.clientY - lastPointer.y;
      lastPointer = { x: t.clientX, y: t.clientY };
      touchTraveled += Math.abs(dx) + Math.abs(dy);

      baseRotateY += dx * DRAG_SENSITIVITY;
      baseRotateX -= dy * DRAG_SENSITIVITY;
      baseRotateX = Math.max(-MAX_TILT_DEG, Math.min(MAX_TILT_DEG, baseRotateX));

      applyTransform(0, 0);
    },
    { passive: true }
  );

  // Toque rápido sem arrastar = vira pra outra face. Arrasto de verdade
  // (moveu além de TAP_MAX_DISTANCE_PX, ou demorou demais) continua só
  // girando livre, sem virar sozinho.
  function flipToOtherFace() {
    baseRotateY += 180;
    spin.style.transition = "transform " + FLIP_TRANSITION_MS + "ms cubic-bezier(0.22, 1, 0.36, 1)";
    applyTransform(0, 0);
    setTimeout(function () {
      spin.style.transition = "";
    }, FLIP_TRANSITION_MS);
  }

  function endDrag(event) {
    if (!dragging) return;
    dragging = false;

    var duration = touchStartTime !== null ? performance.now() - touchStartTime : Infinity;
    var wasTap = touchTraveled <= TAP_MAX_DISTANCE_PX && duration <= TAP_MAX_DURATION_MS;

    lastPointer = null;
    touchStartPointer = null;
    touchStartTime = null;

    if (wasTap && event && event.type === "touchend") {
      flipToOtherFace();
    }
    // se foi arrasto de verdade, o ângulo onde soltou já é a nova base —
    // a flutuação retoma a partir dali no próximo frame.
  }

  wrap.addEventListener("touchend", endDrag);
  wrap.addEventListener("touchcancel", endDrag);
})();
