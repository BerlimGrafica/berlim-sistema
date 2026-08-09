// Confere se a chamada trouxe a chave secreta certa no header x-api-key.
// Essa chave é só pro n8n/Make usar — não é o login de e-mail/senha do ERP.
// Configure o valor dela na env var WHATSAPP_API_KEY (Vercel > Settings > Environment Variables).

export function checkApiKey(req: Request): boolean {
  const chave = req.headers.get('x-api-key');
  return Boolean(chave) && chave === process.env.WHATSAPP_API_KEY;
}
