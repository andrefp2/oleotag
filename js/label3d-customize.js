/*
 * Painel de personalização do selo 3D: upload de logo, telefone e cor de
 * fundo — tudo aplicado em tempo real na face da frente (logo), sem
 * precisar recarregar a página.
 */

(function () {
  var panel = document.querySelector(".label3d-controls");
  var faces = document.querySelectorAll(".label3d__face");
  var labelWrap = document.querySelector(".label3d");
  if (!panel || !faces.length || !labelWrap) return;

  var FICTITIOUS_PHONE = "(11) 91234-5678";

  // ---------- Upload de logo ----------
  var fileInput = document.getElementById("label3d-logo-input");
  var uploadImg = document.querySelector(".label3d__logo-upload");
  var logoIcon = document.querySelector(".label3d__logo-icon");

  if (fileInput && uploadImg) {
    fileInput.addEventListener("change", function () {
      var file = fileInput.files && fileInput.files[0];
      if (!file || !file.type.startsWith("image/")) return;

      var reader = new FileReader();
      reader.onload = function (event) {
        uploadImg.src = event.target.result;
        uploadImg.hidden = false;
        if (logoIcon) logoIcon.style.display = "none";
      };
      reader.readAsDataURL(file);
    });
  }

  // ---------- Telefone ----------
  var phoneInput = document.getElementById("label3d-phone-input");
  var phoneDisplay = document.querySelector(".label3d__logo-phone");

  if (phoneInput && phoneDisplay) {
    phoneInput.addEventListener("input", function () {
      var value = phoneInput.value.trim();
      phoneDisplay.textContent = value || FICTITIOUS_PHONE;
    });
  }

  // ---------- Cor de fundo ----------
  var swatches = panel.querySelectorAll(".label3d-controls__swatch");
  swatches.forEach(function (swatch) {
    swatch.addEventListener("click", function () {
      var bg = swatch.getAttribute("data-bg");
      var mode = swatch.getAttribute("data-mode");

      faces.forEach(function (face) {
        face.style.setProperty("--label3d-bg", bg);
      });
      labelWrap.setAttribute("data-mode", mode);

      swatches.forEach(function (s) {
        s.classList.toggle("is-active", s === swatch);
      });
    });
  });
})();
