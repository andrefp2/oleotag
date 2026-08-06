/* Bootstrap: pequenos ajustes finais que não pertencem a nenhum módulo específico. */

(function () {
  var anoEl = document.getElementById("ano-atual");
  if (anoEl) {
    anoEl.textContent = String(new Date().getFullYear());
  }
})();
