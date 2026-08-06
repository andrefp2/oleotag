/*
 * Monta os links wa.me de todo botão marcado com [data-whatsapp] e
 * registra o evento de conversão diferenciando a origem do clique
 * (hero, cabeçalho, FAB flutuante, CTA final) para saber qual converte mais.
 */

(function () {
  var digits = WHATSAPP_NUMBER.replace(/\D/g, "");
  var text = encodeURIComponent(WHATSAPP_MESSAGE_DEFAULT);
  var href = "https://wa.me/" + digits + "?text=" + text;

  var buttons = document.querySelectorAll("[data-whatsapp]");
  buttons.forEach(function (button) {
    button.setAttribute("href", href);
    button.setAttribute("target", "_blank");
    button.setAttribute("rel", "noopener");

    button.addEventListener("click", function () {
      var origin = button.getAttribute("data-whatsapp-origin") || "desconhecida";
      trackEvent("Contact", { origem: "whatsapp_" + origin });
    });
  });
})();
