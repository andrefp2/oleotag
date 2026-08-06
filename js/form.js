/*
 * Validação client-side e envio do formulário de captura de lead.
 * Enquanto GOOGLE_SCRIPT_URL não estiver configurada (config.js), o envio
 * é simulado: o payload vai só para o console e a UI mostra sucesso, para
 * dar para testar toda a experiência do formulário sem depender do backend.
 */

(function () {
  var form = document.getElementById("lead-form");
  if (!form) return;

  var submitButton = document.getElementById("lead-form-submit");
  var statusEl = document.getElementById("form-status");

  var requiredFields = ["nome_oficina", "whatsapp_contato", "cidade", "quantidade_interesse"];

  function setFieldError(name, message) {
    var input = form.elements[name];
    var errorEl = document.getElementById("erro-" + name);
    if (!input || !errorEl) return;

    if (message) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", "erro-" + name);
      errorEl.textContent = message;
    } else {
      input.removeAttribute("aria-invalid");
      errorEl.textContent = "";
    }
  }

  function isValidPhone(value) {
    var digits = value.replace(/\D/g, "");
    return digits.length >= 10 && digits.length <= 11;
  }

  function validate() {
    var valid = true;

    requiredFields.forEach(function (name) {
      var input = form.elements[name];
      var value = (input.value || "").trim();

      if (!value) {
        setFieldError(name, "Preencha este campo.");
        valid = false;
      } else if (name === "whatsapp_contato" && !isValidPhone(value)) {
        setFieldError(name, "Informe um telefone válido com DDD.");
        valid = false;
      } else {
        setFieldError(name, "");
      }
    });

    return valid;
  }

  function setStatus(state, message) {
    statusEl.dataset.state = state;
    statusEl.textContent = message;
  }

  function setSubmitting(isSubmitting) {
    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Enviando…" : "Quero receber uma proposta";
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    // Honeypot: se um bot preencheu este campo escondido, finge sucesso e não envia nada.
    if (form.elements.website && form.elements.website.value) {
      setStatus("success", "Recebemos seu contato, obrigado!");
      form.reset();
      return;
    }

    if (!validate()) {
      setStatus("error", "Confira os campos destacados acima.");
      return;
    }

    var payload = {
      nome_oficina: form.elements.nome_oficina.value.trim(),
      whatsapp_contato: form.elements.whatsapp_contato.value.trim(),
      cidade: form.elements.cidade.value.trim(),
      quantidade_interesse: form.elements.quantidade_interesse.value,
      mensagem: form.elements.mensagem.value.trim(),
    };

    setSubmitting(true);
    setStatus("", "");

    var isConfigured = GOOGLE_SCRIPT_URL.indexOf("COLE_AQUI") === -1;

    if (!isConfigured) {
      // eslint-disable-next-line no-console
      console.log("[form] GOOGLE_SCRIPT_URL ainda não configurada. Payload simulado:", payload);
      setSubmitting(false);
      setStatus("success", "Recebemos seu contato, obrigado! Também respondemos rápido pelo WhatsApp.");
      trackEvent("Lead", { origem: "formulario" });
      form.reset();
      return;
    }

    fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams(payload),
    })
      .then(function () {
        // Com mode:no-cors a resposta é opaca — sucesso = o fetch não lançou erro de rede.
        setStatus("success", "Recebemos seu contato, obrigado! Também respondemos rápido pelo WhatsApp.");
        trackEvent("Lead", { origem: "formulario" });
        form.reset();
      })
      .catch(function () {
        setStatus("error", "Não conseguimos enviar agora. Tente novamente ou fale pelo WhatsApp abaixo.");
      })
      .finally(function () {
        setSubmitting(false);
      });
  });
})();
