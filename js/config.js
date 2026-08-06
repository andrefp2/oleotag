/*
 * ÚNICO arquivo que você precisa editar para colocar a página no ar de verdade.
 * Os outros arquivos .js só leem estas constantes.
 */

// Número de WhatsApp em formato internacional, só dígitos: 55 + DDD + número.
// Exemplo real: "5511987654321". Enquanto ficar com o valor abaixo, os
// botões de WhatsApp funcionam mas apontam para um número de exemplo.
const WHATSAPP_NUMBER = "5599999999999";

// Mensagem que já vem digitada quando o visitante abre o WhatsApp.
const WHATSAPP_MESSAGE_DEFAULT =
  "Olá! Vim pela página de etiquetas de troca de óleo e quero saber mais.";

// URL do Google Apps Script Web App (Implantar > Nova implantação > App da Web),
// terminando em "/exec". Enquanto contiver "COLE_AQUI", o formulário não
// envia de verdade — só simula sucesso e mostra o payload no console,
// para você testar a página antes de configurar a planilha.
const GOOGLE_SCRIPT_URL = "COLE_AQUI_A_URL_DO_GOOGLE_APPS_SCRIPT/exec";
