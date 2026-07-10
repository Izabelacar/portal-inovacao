import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, getAdminToken, setAdminToken, clearAdminToken, verifyAdminPassword } from '../api/client.js';
import './Admin.css';

// -------------------------------------------------------------
// Configuração de cada recurso: como listar, editar e criar
// -------------------------------------------------------------
const RESOURCES = {
  parquesBrasil: {
    label: 'Parques (Brasil)',
    api: api.admin.parquesBrasil,
    columns: ['regiao', 'estado', 'uf', 'total', 'planejamento', 'implantacao', 'operacao'],
    fields: [
      { name: 'regiao', label: 'Região', required: true },
      { name: 'estado', label: 'Estado', required: true },
      { name: 'uf', label: 'UF', required: true },
      { name: 'total', label: 'Total', type: 'number' },
      { name: 'planejamento', label: 'Planejamento', type: 'number' },
      { name: 'implantacao', label: 'Implantação', type: 'number' },
      { name: 'operacao', label: 'Operação', type: 'number' },
    ],
    empty: { regiao: '', estado: '', uf: '', total: 0, planejamento: 0, implantacao: 0, operacao: 0 },
  },
  parquesMundo: {
    label: 'Parques (Mundo)',
    api: api.admin.parquesMundo,
    columns: ['pais', 'iso3', 'total'],
    fields: [
      { name: 'pais', label: 'País', required: true },
      { name: 'iso3', label: 'Código ISO3', required: true },
      { name: 'total', label: 'Total', type: 'number' },
    ],
    empty: { pais: '', iso3: '', total: 0 },
  },
  cadeias: {
    label: 'Cadeias Produtivas',
    api: api.admin.cadeias,
    columns: ['categoria', 'produto', 'local', 'nivel', 'variavel', 'unidade', 'valor'],
    fields: [
      { name: 'categoria', label: 'Categoria', required: true },
      { name: 'produto', label: 'Produto', required: true },
      { name: 'local', label: 'Local', required: true },
      { name: 'nivel', label: 'Nível (Município/Microrregião/Mesorregião)' },
      { name: 'variavel', label: 'Variável' },
      { name: 'unidade', label: 'Unidade' },
      { name: 'valor', label: 'Valor', type: 'number' },
    ],
    empty: { categoria: '', produto: '', local: '', nivel: 'Município', variavel: '', unidade: '', valor: 0 },
  },
  projetos: {
    label: 'Projetos de Pesquisa',
    api: api.admin.projetos,
    columns: ['ano', 'codigo', 'titulo', 'coordenador', 'situacao', 'grandeArea'],
    fields: [
      { name: 'titulo', label: 'Título', required: true, full: true },
      { name: 'ano', label: 'Ano' },
      { name: 'codigo', label: 'Código' },
      { name: 'centro', label: 'Centro' },
      { name: 'coordenador', label: 'Coordenador' },
      { name: 'situacao', label: 'Situação' },
      { name: 'grandeArea', label: 'Grande área' },
      { name: 'area', label: 'Área' },
      { name: 'grupo', label: 'Grupo' },
      { name: 'linha', label: 'Linha de pesquisa' },
      { name: 'palavras', label: 'Palavras-chave (separadas por vírgula)', full: true },
      { name: 'resumo', label: 'Resumo', type: 'textarea', full: true },
    ],
    empty: { ano: '', codigo: '', centro: '', titulo: '', coordenador: '', situacao: '', palavras: '', grandeArea: '', area: '', grupo: '', linha: '', resumo: '' },
  },
  grupos: {
    label: 'Grupos de Pesquisa',
    api: api.admin.grupos,
    columns: ['nome', 'ano', 'cidade', 'instituicao', 'grandeArea', 'pesquisadores'],
    fields: [
      { name: 'nome', label: 'Nome', required: true, full: true },
      { name: 'ano', label: 'Ano' },
      { name: 'cidade', label: 'Cidade' },
      { name: 'situacao', label: 'Situação' },
      { name: 'grandeArea', label: 'Grande área' },
      { name: 'area', label: 'Área' },
      { name: 'instituicao', label: 'Instituição' },
      { name: 'linhas', label: 'Linhas', type: 'number' },
      { name: 'pesquisadores', label: 'Pesquisadores', type: 'number' },
      { name: 'estudantes', label: 'Estudantes', type: 'number' },
      { name: 'tecnicos', label: 'Técnicos', type: 'number' },
      { name: 'doutores', label: 'Doutores', type: 'number' },
    ],
    empty: { nome: '', ano: '', cidade: '', situacao: '', grandeArea: '', area: '', instituicao: '', linhas: 0, pesquisadores: 0, estudantes: 0, tecnicos: 0, doutores: 0 },
  },
  laboratorios: {
    label: 'Laboratórios',
    api: api.admin.laboratorios,
    columns: ['nome', 'cidade', 'instituicao', 'areaPrincipal', 'nEquip'],
    fields: [
      { name: 'nome', label: 'Nome', required: true, full: true },
      { name: 'cidade', label: 'Cidade' },
      { name: 'responsavel', label: 'Responsável' },
      { name: 'instituicao', label: 'Instituição' },
      { name: 'areaPrincipal', label: 'Área principal' },
      { name: 'nEquip', label: 'Nº de equipamentos', type: 'number' },
      { name: 'areas', label: 'Áreas (separadas por vírgula)', type: 'list', full: true },
      { name: 'tecnicas', label: 'Técnicas (separadas por vírgula)', type: 'list', full: true },
      { name: 'sobre', label: 'Sobre', type: 'textarea', full: true },
    ],
    empty: { nome: '', sobre: '', cidade: '', responsavel: '', instituicao: '', areaPrincipal: '', nEquip: 0, areas: [], tecnicas: [] },
  },
};

function toFormValue(item, field) {
  const v = item[field.name];
  if (field.type === 'list') return Array.isArray(v) ? v.join(', ') : (v || '');
  return v ?? '';
}

function fromFormValues(values, fields) {
  const out = {};
  fields.forEach(f => {
    let v = values[f.name];
    if (f.type === 'number') v = v === '' || v === undefined ? 0 : Number(v);
    else if (f.type === 'list') v = (v || '').split(',').map(s => s.trim()).filter(Boolean);
    out[f.name] = v ?? '';
  });
  return out;
}

function ResourceForm({ resourceKey, config, item, onClose, onSaved }) {
  const isEdit = !!item;
  const [values, setValues] = useState(() => {
    const base = item || config.empty;
    const v = {};
    config.fields.forEach(f => { v[f.name] = toFormValue(base, f); });
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setField(name, val) {
    setValues(prev => ({ ...prev, [name]: val }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = fromFormValues(values, config.fields);
      if (isEdit) await config.api.update(item.id, payload);
      else await config.api.create(payload);
      onSaved();
    } catch (err) {
      setError(err.message || 'Erro ao salvar registro');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={e => e.stopPropagation()}>
        <h2>{isEdit ? `Editar — ${config.label}` : `Novo registro — ${config.label}`}</h2>
        {error && <div className="admin-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="admin-form-grid">
            {config.fields.map(f => (
              <label key={f.name} className={f.full ? 'full' : ''}>
                {f.label}{f.required && ' *'}
                {f.type === 'textarea' ? (
                  <textarea
                    value={values[f.name]}
                    onChange={e => setField(f.name, e.target.value)}
                    required={f.required}
                  />
                ) : (
                  <input
                    type={f.type === 'number' ? 'number' : 'text'}
                    value={values[f.name]}
                    onChange={e => setField(f.name, e.target.value)}
                    required={f.required}
                  />
                )}
              </label>
            ))}
          </div>
          <div className="admin-form-actions">
            <button type="button" className="admin-btn secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="admin-btn" disabled={saving}>{saving ? 'Salvando…' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function LoginGate({ onSuccess }) {
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [verificando, setVerificando] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setVerificando(true);
    setErro('');
    try {
      const ok = await verifyAdminPassword(senha);
      if (!ok) {
        setErro('Senha incorreta.');
        return;
      }
      setAdminToken(senha);
      onSuccess();
    } catch {
      setErro('Não foi possível verificar a senha. A API está rodando?');
    } finally {
      setVerificando(false);
    }
  }

  return (
    <div className="admin-scope">
      <header>
        <h1>Painel Administrativo</h1>
        <p><Link to="/">← voltar ao portal</Link></p>
      </header>
      <div className="admin-login-wrap">
        <form className="admin-login-box" onSubmit={handleSubmit}>
          <h2>Acesso restrito</h2>
          <p>Digite a senha do painel administrativo para continuar.</p>
          {erro && <div className="admin-error">{erro}</div>}
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            autoFocus
          />
          <button className="admin-btn" type="submit" disabled={verificando || !senha}>
            {verificando ? 'Verificando…' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const [autenticado, setAutenticado] = useState(null); // null = verificando, true/false depois
  const [resourceKey, setResourceKey] = useState('parquesBrasil');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [formItem, setFormItem] = useState(null); // null = fechado, {} = novo, obj = editar
  const [deletingId, setDeletingId] = useState(null);

  const config = RESOURCES[resourceKey];

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      setAutenticado(false);
      return;
    }
    verifyAdminPassword(token).then(ok => setAutenticado(ok)).catch(() => setAutenticado(false));
  }, []);

  function handleLogout() {
    clearAdminToken();
    setAutenticado(false);
  }

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await config.api.list();
      setItems(data);
    } catch (err) {
      setError(err.message || 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!autenticado) return;
    load();
    setSearch('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resourceKey, autenticado]);

  const filtrados = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.trim().toLowerCase();
    return items.filter(item => config.columns.some(c => String(item[c] ?? '').toLowerCase().includes(q)));
  }, [items, search, config]);

  async function handleDelete(id) {
    if (!window.confirm('Tem certeza que deseja excluir este registro? Essa ação não pode ser desfeita.')) return;
    setDeletingId(id);
    try {
      await config.api.remove(id);
      await load();
    } catch (err) {
      alert(err.message || 'Erro ao excluir registro');
    } finally {
      setDeletingId(null);
    }
  }

  function handleSaved() {
    setFormItem(null);
    load();
  }

  if (autenticado === null) {
    return (
      <div className="admin-scope">
        <div className="admin-login-wrap"><p>Verificando acesso…</p></div>
      </div>
    );
  }

  if (autenticado === false) {
    return <LoginGate onSuccess={() => setAutenticado(true)} />;
  }

  return (
    <div className="admin-scope">
      <header>
        <h1>Painel Administrativo</h1>
        <p>
          Cadastrar, editar e excluir registros do banco de dados · <Link to="/">← voltar ao portal</Link>
          {' · '}<button className="admin-link-btn" onClick={handleLogout}>Sair</button>
        </p>
      </header>

      <nav className="admin-tabs">
        {Object.entries(RESOURCES).map(([key, r]) => (
          <button key={key} className={resourceKey === key ? 'active' : ''} onClick={() => setResourceKey(key)}>
            {r.label}
          </button>
        ))}
      </nav>

      <main className="admin-main">
        <div className="admin-toolbar">
          <input
            type="search"
            placeholder={`Buscar em ${config.label.toLowerCase()}…`}
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="admin-btn" onClick={() => setFormItem({})}>+ Novo registro</button>
        </div>

        <p className="admin-count">{filtrados.length} registro(s){search && ` (de ${items.length} no total)`}</p>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-table-wrap">
          {loading ? (
            <div className="admin-empty">Carregando…</div>
          ) : filtrados.length === 0 ? (
            <div className="admin-empty">Nenhum registro encontrado.</div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  {config.columns.map(c => <th key={c}>{c}</th>)}
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map(item => (
                  <tr key={item.id}>
                    {config.columns.map(c => <td key={c} title={String(item[c] ?? '')}>{String(item[c] ?? '')}</td>)}
                    <td className="actions">
                      <button className="admin-btn secondary" onClick={() => setFormItem(item)}>Editar</button>
                      <button
                        className="admin-btn danger"
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? 'Excluindo…' : 'Excluir'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {formItem !== null && (
        <ResourceForm
          resourceKey={resourceKey}
          config={config}
          item={Object.keys(formItem).length ? formItem : null}
          onClose={() => setFormItem(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
