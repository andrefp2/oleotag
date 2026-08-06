/*
 * Wrapper único para disparar eventos de conversão.
 * Não faz nada até você colar o Meta Pixel e/ou o Google Tag no <head>
 * do index.html — os `if` abaixo simplesmente ignoram o evento se o
 * respectivo script de rastreamento não estiver presente.
 */

function trackEvent(name, params) {
  params = params || {};

  if (typeof window.fbq === "function") {
    window.fbq("track", name, params);
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", name, params);
  }

  // eslint-disable-next-line no-console
  console.log("[track]", name, params);
}
