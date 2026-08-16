/*
 * Reveal com timeline (GSAP + ScrollTrigger) na seção de tamanhos:
 * eyebrow → título → texto → os 3 cards em stagger, disparado quando a
 * seção entra na viewport. Toca uma vez só (once: true).
 *
 * Usa gsap.set() explícito para o estado inicial em vez de confiar no
 * immediateRender implícito do .from() — com stagger dentro de uma
 * timeline pausada (esperando o ScrollTrigger), só o primeiro alvo pega
 * o estado inicial automaticamente; os demais (inclusive os cards em
 * stagger) ficavam visíveis desde o início. gsap.set() elimina essa
 * ambiguidade.
 *
 * Os .card--tamanho já têm um transform de base (rotateX/rotateY, ver
 * components.css) manipulado também pelo hover 3D em tilt.js — animar
 * "y" neles pelo GSAP entra em conflito com esse transform existente e o
 * deslocamento não é aplicado de verdade. Por isso os cards só recebem
 * fade (opacity); o slide-up fica só nos elementos de texto, que não têm
 * esse conflito.
 *
 * gsap.matchMedia() garante que nada disso roda se o usuário preferir
 * menos movimento — nesse caso os elementos só aparecem no estado normal
 * do CSS, sem nenhuma animação nem flash de conteúdo invisível.
 */

(function () {
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);

  gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", function () {
    var section = document.querySelector("#tamanhos");
    if (!section) return;

    var eyebrow = section.querySelector(".eyebrow");
    var heading = section.querySelector("h2");
    var description = section.querySelector(".section-head p:not(.eyebrow)");
    var cards = section.querySelectorAll(".card--tamanho");

    gsap.set([eyebrow, heading, description], { opacity: 0, y: 16 });
    gsap.set(cards, { opacity: 0 });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top 75%",
        once: true,
      },
      defaults: { ease: "power2.out" },
    });

    tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.5 })
      .to(heading, { opacity: 1, y: 0, duration: 0.6 }, "-=0.3")
      .to(description, { opacity: 1, y: 0, duration: 0.5 }, "-=0.35")
      .to(cards, { opacity: 1, duration: 0.6, stagger: 0.15 }, "-=0.2");
  });
})();
