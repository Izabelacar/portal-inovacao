<<<<<<< HEAD
// Em desenvolvimento, usa o proxy do Vite (/api -> http://localhost:3001).
// Em produção (GitHub Pages), aponta para a API publicada (ex: Railway),
// definida em VITE_API_URL no arquivo client/.env.production.
const BASE_URL = `${import.meta.env.VITE_API_URL || '/api'}`;
=======
const BASE_URL = '/api';
>>>>>>> f62d7863e58360d65edb3f16471c986938deda61
const TOKEN_KEY = 'admin_token';

export function getAdminToken() {
  return sessionStorage.getItem(TOKEN_KEY) || '';
}
export function setAdminToken(token) {
  sessionStorage.setItem(TOKEN_KEY, token);
}
export function clearAdminToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function request(path, options = {}, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) headers['x-admin-token'] = getAdminToken();

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `Erro ${res.status} ao acessar ${path}`);
    err.status = res.status;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

// CRUD autenticado: toda escrita (create/update/remove) manda o token do admin.
// A leitura (list) das telas administrativas também usa o mesmo token, já que
// reaproveita os mesmos endpoints públicos de leitura.
const crud = (basePath) => ({
  list: () => request(basePath),
  create: (data) => request(basePath, { method: 'POST', body: JSON.stringify(data) }, true),
  update: (id, data) => request(`${basePath}/${id}`, { method: 'PUT', body: JSON.stringify(data) }, true),
  remove: (id) => request(`${basePath}/${id}`, { method: 'DELETE' }, true),
});

export const api = {
  parquesBrasil: () => request('/parques/brasil'),
  parquesMundo: () => request('/parques/mundo'),
  cadeias: () => request('/cadeias'),
  ecossistema: () => request('/ecossistema'),

  admin: {
    parquesBrasil: crud('/parques/brasil'),
    parquesMundo: crud('/parques/mundo'),
    cadeias: crud('/cadeias'),
    projetos: crud('/ecossistema/projetos'),
    grupos: crud('/ecossistema/grupos'),
    laboratorios: crud('/ecossistema/laboratorios'),
  },
};

// Verifica a senha chamando /api/admin/verify com o token informado
// (sem depender do valor já salvo em sessionStorage).
export async function verifyAdminPassword(senha) {
  const res = await fetch(`${BASE_URL}/admin/verify`, {
    headers: { 'x-admin-token': senha },
  });
  return res.ok;
}
