import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { api } from '../api/client.js';

const PALETTE = ['#2f3a73', '#596AB6', '#2bb6a3', '#f2a93b', '#d4537e', '#7E8CD0', '#1d9e75', '#b07535', '#8c6bb1', '#5f6b8a', '#46c4b3'];
const fmt = new Intl.NumberFormat('pt-BR');
const norm = s => (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

function countBy(arr, key) {
  const m = {};
  arr.forEach(o => { const k = o[key] || '—'; m[k] = (m[k] || 0) + 1; });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}
function sumBy(arr, key, val) {
  const m = {};
  arr.forEach(o => { const k = o[key] || '—'; m[k] = (m[k] || 0) + (+o[val] || 0); });
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

function ProjetoCard({ p }) {
  const cls = /finaliz/i.test(p.situacao) ? 'fin' : (/andamento|exec/i.test(p.situacao) ? 'and' : '');
  const chips = (p.palavras || '').split(/[;,]/).map(s => s.trim()).filter(Boolean).slice(0, 3);
  const resumo = p.resumo ? p.resumo.slice(0, 170) + (p.resumo.length > 170 ? '…' : '') : '';
  return (
    <article className="project-card">
      <div className="card-top"><span className={`tag ${cls}`}>{p.situacao || 'Projeto'}</span><span className="badge">{p.ano}</span></div>
      <h3>{p.titulo}</h3>
      <div className="card-meta"><b>Coord.:</b> {p.coordenador || '—'} · <b>Centro:</b> {p.centro || '—'}</div>
      {resumo && <div className="card-desc">{resumo}</div>}
      {chips.length > 0 && <div className="card-chips">{chips.map((c, i) => <span key={i} className="chip">{c}</span>)}</div>}
      <div className="card-foot"><span>{p.grupo || p.linha || 'UFOPA'}</span><span>{p.codigo}</span></div>
    </article>
  );
}

function LabCard({ l }) {
  const tecs = (l.tecnicas || []).slice(0, 4);
  const sobre = l.sobre ? l.sobre.slice(0, 140) + (l.sobre.length > 140 ? '…' : '') : '';
  return (
    <article className="lab-card">
      <div className="card-top"><span className="tag">{l.instituicao || '—'}</span><span className="badge">{l.nEquip || 0} equip.</span></div>
      <h4>{l.nome}</h4>
      <div className="card-meta"><b>Área:</b> {l.areaPrincipal || '—'} · <b>{l.cidade || 'Santarém'}</b></div>
      {sobre && <div className="card-desc">{sobre}</div>}
      {tecs.length > 0 && <div className="card-chips">{tecs.map((t, i) => <span key={i} className="chip">{t}</span>)}</div>}
      <div className="card-foot"><span>{l.responsavel || ''}</span><span>{(l.areas || []).length} área(s)</span></div>
    </article>
  );
}

function GrupoCard({ g }) {
  return (
    <article className="project-card">
      <div className="card-top"><span className="tag">{g.instituicao || '—'}</span><span className="badge">{g.ano}</span></div>
      <h3>{g.nome}</h3>
      <div className="card-meta"><b>{g.grandeArea || '—'}</b> · {g.area || ''}<br />{g.cidade || ''} · {g.situacao || ''}</div>
      <div className="card-chips">
        <span className="chip">{g.pesquisadores} pesquisadores</span>
        <span className="chip">{g.estudantes} estudantes</span>
        <span className="chip">{g.linhas} linhas</span>
        <span className="chip">{g.doutores} doutores</span>
      </div>
    </article>
  );
}

export default function Projetos() {
  const [dados, setDados] = useState(null);
  const [ativo, setAtivo] = useState('geral');
  const [q, setQ] = useState('');
  const [fAno, setFAno] = useState('');
  const [fInst, setFInst] = useState('');
  const [fArea, setFArea] = useState('');

  const chAreaRef = useRef(null);
  const chInstRef = useRef(null);
  const chAnoRef = useRef(null);
  const chLabAreaRef = useRef(null);
  const chartsRef = useRef([]);

  useEffect(() => {
    api.ecossistema().then(setDados).catch(() => setDados({ projetos: [], grupos: [], laboratorios: [] }));
  }, []);

  const PROJ = dados?.projetos || [];
  const GRUP = dados?.grupos || [];
  const LAB = dados?.laboratorios || [];

  const qNorm = norm(q.trim());

  const projetosFiltrados = useMemo(() => {
    let arr = PROJ.filter(p => !fAno || p.ano === fAno);
    if (qNorm) arr = arr.filter(p => norm(p.titulo + p.coordenador + p.palavras + p.resumo + p.grupo).includes(qNorm));
    return arr;
  }, [PROJ, fAno, qNorm]);

  const labsFiltrados = useMemo(() => {
    let arr = LAB.filter(l => !fInst || l.instituicao === fInst);
    if (qNorm) arr = arr.filter(l => norm(l.nome + l.areaPrincipal + (l.areas || []).join(' ') + (l.tecnicas || []).join(' ') + l.sobre).includes(qNorm));
    return arr;
  }, [LAB, fInst, qNorm]);

  const gruposFiltrados = useMemo(() => {
    let arr = GRUP.filter(g => !fArea || g.grandeArea === fArea);
    if (qNorm) arr = arr.filter(g => norm(g.nome + g.area + g.grandeArea + g.instituicao + g.cidade).includes(qNorm));
    return arr;
  }, [GRUP, fArea, qNorm]);

  const tabelaFiltrada = useMemo(() => {
    const rows = [];
    PROJ.forEach(p => rows.push(['Projeto', p.titulo, p.grandeArea !== 'Não classificada' ? p.grandeArea : (p.centro || '—'), `${p.coordenador || ''} · ${p.ano || ''}`]));
    LAB.forEach(l => rows.push(['Laboratório', l.nome, l.areaPrincipal || '—', `${l.instituicao || ''} · ${l.nEquip || 0} equip.`]));
    GRUP.forEach(g => rows.push(['Grupo', g.nome, g.grandeArea || '—', `${g.instituicao || ''} · ${g.pesquisadores} pesq.`]));
    return qNorm ? rows.filter(r => norm(r.join(' ')).includes(qNorm)) : rows;
  }, [PROJ, LAB, GRUP, qNorm]);

  const kpis = useMemo(() => {
    const totalEquip = LAB.reduce((s, l) => s + (+l.nEquip || 0), 0);
    const pesquisadores = GRUP.reduce((s, g) => s + (+g.pesquisadores || 0), 0);
    const instituicoes = new Set([...GRUP.map(g => g.instituicao), ...LAB.map(l => l.instituicao)].filter(Boolean));
    return [
      [PROJ.length, 'Projetos de pesquisa'], [GRUP.length, 'Grupos de pesquisa'],
      [LAB.length, 'Laboratórios'], [totalEquip, 'Equipamentos'],
      [pesquisadores, 'Pesquisadores'], [instituicoes.size, 'Instituições'],
    ];
  }, [PROJ, GRUP, LAB]);

  const anosDisponiveis = useMemo(() => countBy(PROJ, 'ano').filter(p => p[0] && p[0] !== '—').sort((a, b) => b[0].localeCompare(a[0])), [PROJ]);
  const instituicoesDisponiveis = useMemo(() => countBy(LAB, 'instituicao').filter(p => p[0] !== '—'), [LAB]);
  const areasDisponiveis = useMemo(() => countBy(GRUP, 'grandeArea'), [GRUP]);

  // Gráficos (apenas na seção "geral")
  useEffect(() => {
    if (!dados || ativo !== 'geral') return;

    chartsRef.current.forEach(c => c.destroy());
    chartsRef.current = [];

    function donut(canvasEl, pairs) {
      const labels = pairs.map(p => p[0]), data = pairs.map(p => p[1]);
      const c = new Chart(canvasEl, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]), borderColor: '#fff', borderWidth: 2 }] },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '56%',
          plugins: {
            legend: { position: 'right', labels: { boxWidth: 11, font: { size: 11.5, family: 'Segoe UI' }, color: '#605e5c', padding: 8 } },
            tooltip: { callbacks: { label: c2 => { const t = c2.dataset.data.reduce((a, b) => a + b, 0); const p = t ? (c2.parsed / t * 100).toFixed(1) : 0; return ` ${c2.label}: ${fmt.format(c2.parsed)} (${p}%)`; } } },
          },
        },
      });
      chartsRef.current.push(c);
    }
    function barH(canvasEl, pairs, color, un = '') {
      const c = new Chart(canvasEl, {
        type: 'bar',
        data: { labels: pairs.map(p => p[0]), datasets: [{ data: pairs.map(p => p[1]), backgroundColor: color, borderRadius: 4, maxBarThickness: 26 }] },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c2 => ` ${fmt.format(c2.parsed.x)} ${un}` } } },
          scales: { x: { ticks: { font: { size: 11 }, color: '#8a8886' }, grid: { color: '#edebe9' } }, y: { ticks: { font: { size: 11.5, family: 'Segoe UI' }, color: '#605e5c' }, grid: { display: false } } },
        },
      });
      chartsRef.current.push(c);
    }
    function barV(canvasEl, pairs, color, un = '') {
      const c = new Chart(canvasEl, {
        type: 'bar',
        data: { labels: pairs.map(p => p[0]), datasets: [{ data: pairs.map(p => p[1]), backgroundColor: color, borderRadius: 4, maxBarThickness: 34 }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: c2 => ` ${fmt.format(c2.parsed.y)} ${un}` } } },
          scales: { x: { ticks: { font: { size: 11 }, color: '#605e5c' }, grid: { display: false } }, y: { ticks: { font: { size: 11 }, color: '#8a8886' }, grid: { color: '#edebe9' } } },
        },
      });
      chartsRef.current.push(c);
    }

    donut(chAreaRef.current, countBy(GRUP, 'grandeArea'));
    barH(chInstRef.current, sumBy(GRUP, 'instituicao', 'pesquisadores').slice(0, 6), '#596AB6', 'pesquisadores');
    const anos = countBy(PROJ, 'ano').filter(p => p[0] && p[0] !== '—').sort((a, b) => a[0].localeCompare(b[0]));
    barV(chAnoRef.current, anos, '#2bb6a3', 'projetos');
    donut(chLabAreaRef.current, countBy(LAB, 'areaPrincipal').filter(p => p[0] !== '—').slice(0, 8));

    return () => chartsRef.current.forEach(c => c.destroy());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados, ativo]);

  return (
    <div className="projetos-page">
      <header>
        <h1>Ecossistema de Inovação de Santarém</h1>
        <p>Projetos, grupos de pesquisa, laboratórios e infraestrutura da rede — UFOPA · IFPA · UEPA</p>
      </header>

      <nav className="tabs">
        <button className={ativo === 'geral' ? 'active' : ''} onClick={() => setAtivo('geral')}>Visão geral</button>
        <button className={ativo === 'projetos' ? 'active' : ''} onClick={() => setAtivo('projetos')}>Projetos</button>
        <button className={ativo === 'laboratorios' ? 'active' : ''} onClick={() => setAtivo('laboratorios')}>Laboratórios</button>
        <button className={ativo === 'grupos' ? 'active' : ''} onClick={() => setAtivo('grupos')}>Grupos de pesquisa</button>
        <button className={ativo === 'tabela' ? 'active' : ''} onClick={() => setAtivo('tabela')}>Tabela geral</button>
      </nav>

      <main className="projetos-main">
        {ativo !== 'geral' && (
          <section className="filtros-box">
            <div className="filtros-grid">
              <label>Buscar
                <input type="search" placeholder="Projeto, laboratório, grupo, técnica, coordenador…" value={q} onChange={e => setQ(e.target.value)} />
              </label>
              {ativo === 'projetos' && (
                <label>Ano do projeto
                  <select value={fAno} onChange={e => setFAno(e.target.value)}>
                    <option value="">Todos os anos</option>
                    {anosDisponiveis.map(([v, n]) => <option key={v} value={v}>{v} ({n})</option>)}
                  </select>
                </label>
              )}
              {ativo === 'laboratorios' && (
                <label>Instituição
                  <select value={fInst} onChange={e => setFInst(e.target.value)}>
                    <option value="">Todas as instituições</option>
                    {instituicoesDisponiveis.map(([v, n]) => <option key={v} value={v}>{v} ({n})</option>)}
                  </select>
                </label>
              )}
              {ativo === 'grupos' && (
                <label>Grande área
                  <select value={fArea} onChange={e => setFArea(e.target.value)}>
                    <option value="">Todas as grandes áreas</option>
                    {areasDisponiveis.map(([v, n]) => <option key={v} value={v}>{v} ({n})</option>)}
                  </select>
                </label>
              )}
            </div>
          </section>
        )}

        <section className="kpis">
          {kpis.map(([v, l], i) => (
            <div className="kpi" key={i}><div className="lab">{l}</div><div className="val">{fmt.format(v)}</div></div>
          ))}
        </section>

        <section className={`pagina-secao ${ativo === 'geral' ? 'ativa' : ''}`}>
          <div className="canvas">
            <div className="viz col-6">
              <div className="viz-h"><span className="t">Grupos de pesquisa por grande área</span><span className="s">{GRUP.length} grupos certificados</span></div>
              <div className="viz-b"><div className="chart-wrap"><canvas ref={chAreaRef}></canvas></div></div>
            </div>
            <div className="viz col-6">
              <div className="viz-h"><span className="t">Pesquisadores por instituição</span><span className="s">soma por grupo</span></div>
              <div className="viz-b"><div className="chart-wrap"><canvas ref={chInstRef}></canvas></div></div>
            </div>
            <div className="viz col-8">
              <div className="viz-h"><span className="t">Projetos de pesquisa por ano</span><span className="s">cadastros UFOPA</span></div>
              <div className="viz-b"><div className="chart-wrap"><canvas ref={chAnoRef}></canvas></div></div>
            </div>
            <div className="viz col-4">
              <div className="viz-h"><span className="t">Laboratórios por área</span><span className="s">top áreas</span></div>
              <div className="viz-b"><div className="chart-wrap"><canvas ref={chLabAreaRef}></canvas></div></div>
            </div>
          </div>
        </section>

        <section className={`pagina-secao ${ativo === 'projetos' ? 'ativa' : ''}`}>
          <div className="ranking-box">
            <h2>Projetos de pesquisa</h2>
            <p>Pesquisas cadastradas na UFOPA, com coordenação, centro e palavras-chave.</p>
            <p className="count-note">{projetosFiltrados.length} projeto(s)</p>
            <div className="cards-grid">
              {projetosFiltrados.length === 0
                ? <div className="empty">Nenhum projeto encontrado.</div>
                : projetosFiltrados.slice(0, 300).map((p, i) => <ProjetoCard p={p} key={p.codigo || i} />)}
            </div>
          </div>
        </section>

        <section className={`pagina-secao ${ativo === 'laboratorios' ? 'ativa' : ''}`}>
          <div className="ranking-box">
            <h2>Laboratórios e infraestrutura</h2>
            <p>Laboratórios, áreas de atuação, técnicas e número de equipamentos disponíveis.</p>
            <p className="count-note">{labsFiltrados.length} laboratório(s)</p>
            <div className="cards-grid">
              {labsFiltrados.length === 0
                ? <div className="empty">Nenhum laboratório encontrado.</div>
                : labsFiltrados.map((l, i) => <LabCard l={l} key={l.nome + i} />)}
            </div>
          </div>
        </section>

        <section className={`pagina-secao ${ativo === 'grupos' ? 'ativa' : ''}`}>
          <div className="ranking-box">
            <h2>Grupos de pesquisa</h2>
            <p>Grupos certificados, com grande área, instituição e capacidade (pesquisadores, estudantes, linhas).</p>
            <p className="count-note">{gruposFiltrados.length} grupo(s)</p>
            <div className="cards-grid">
              {gruposFiltrados.length === 0
                ? <div className="empty">Nenhum grupo encontrado.</div>
                : gruposFiltrados.map((g, i) => <GrupoCard g={g} key={g.nome + i} />)}
            </div>
          </div>
        </section>

        <section className={`pagina-secao ${ativo === 'tabela' ? 'ativa' : ''}`}>
          <div className="tabela-box">
            <p className="count-note">{tabelaFiltrada.length} registro(s)</p>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Tipo</th><th>Nome</th><th>Área</th><th>Descrição / vínculo</th></tr></thead>
                <tbody>
                  {tabelaFiltrada.length === 0
                    ? <tr><td colSpan={4} className="empty">Nenhum registro encontrado.</td></tr>
                    : tabelaFiltrada.slice(0, 1200).map((r, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 700, color: '#596ab6', whiteSpace: 'nowrap' }}>{r[0]}</td>
                        <td>{r[1]}</td><td>{r[2]}</td><td>{r[3]}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <footer>Ecossistema de Inovação de Santarém · Baixo Amazonas (PA) · dados: Rede de Inovação de Santarém</footer>
    </div>
  );
}
