// Autenticação simples por senha compartilhada (definida em ADMIN_PASSWORD no .env).
// O front-end envia a senha no header "x-admin-token" em toda chamada de escrita
// (POST/PUT/DELETE) e nas verificações de login do painel /admin.
function requireAdminAuth(req, res, next) {
  const token = req.header('x-admin-token');
  const senha = process.env.ADMIN_PASSWORD;

  if (!senha) {
    // Se ninguém configurou uma senha no .env, bloqueia por segurança
    // (evita publicar o painel acidentalmente sem proteção nenhuma).
    return res.status(500).json({ error: 'ADMIN_PASSWORD não configurada no servidor' });
  }

  if (!token || token !== senha) {
    return res.status(401).json({ error: 'Senha inválida ou sessão expirada' });
  }

  next();
}

module.exports = requireAdminAuth;
