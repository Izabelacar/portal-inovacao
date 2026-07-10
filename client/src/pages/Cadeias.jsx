import { useEffect, useMemo, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import { api } from '../api/client.js';
import './Cadeias.css';

const PALETTE = ['#2f3a73', '#596AB6', '#46c4b3', '#f2a93b', '#d4537e', '#7E8CD0', '#1d9e75', '#b07535', '#8c6bb1', '#5f5e5a'];

const MEASURES = {
  valor: { label: 'Valor da produção (R$ mil)', unit: 'R$ mil', match: r => /valor/i.test(r.variavel) },
  ton: { label: 'Produção (toneladas)', unit: 't', match: r => r.unidade === 'Toneladas' },
  m3: { label: 'Madeira / lenha (m³)', unit: 'm³', match: r => r.unidade === 'Metros cúbicos' },
  cab: { label: 'Rebanho (cabeças)', unit: 'cab.', match: r => r.unidade === 'Cabeças' },
};

const fmt = new Intl.NumberFormat('pt-BR');
const fmtC = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 });
const uniq = a => [...new Set(a.filter(Boolean))].sort((x, y) => x.localeCompare(y, 'pt-BR'));

function rankTop(lista, keyFn, n = 8) {
  const acc = {};
  lista.forEach(d => { acc[keyFn(d)] = (acc[keyFn(d)] || 0) + d.valor; });
  let arr = Object.entries(acc).sort((a, b) => b[1] - a[1]);
  if (arr.length > n + 1) {
    const top = arr.slice(0, n);
    const out = arr.slice(n).reduce((s, [, v]) => s + v, 0);
    top.push(['Outros', out]);
    arr = top;
  }
  return arr;
}

export default function Cadeias() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(false);
  const [medida, setMedida] = useState('valor');
  const [cadeia, setCadeia] = useState('');
  const [produto, setProduto] = useState('');
  const [nivel, setNivel] = useState('Município');
  const [busca, setBusca] = useState('');

  const pieLocaisRef = useRef(null);
  const pieCadeiasRef = useRef(null);
  const barProdutosRef = useRef(null);
  const chartInstances = useRef({});

  useEffect(() => {
    api.cadeias().then(setDados).catch(() => setErro(true));
  }, []);

  const baseMedida = useMemo(() => {
    if (!dados) return [];
    return dados.filter(MEASURES[medida].match);
  }, [dados, medida]);

  const produtosDisponiveis = useMemo(() => {
    const base = baseMedida.filter(d => !cadeia || d.categoria === cadeia);
    return uniq(base.map(d => d.produto));
  }, [baseMedida, cadeia]);

  const cadeiasDisponiveis = useMemo(() => uniq((dados || []).map(d => d.categoria)), [dados]);

  const filtrado = useMemo(() => {
    const buscaNorm = busca.trim().toLowerCase();
    return baseMedida.filter(d =>
      d.nivel === nivel &&
      (!cadeia || d.categoria === cadeia) &&
      (!produto || d.produto === produto) &&
      (!buscaNorm || d.local.toLowerCase().includes(buscaNorm))
    );
  }, [baseMedida, nivel, cadeia, produto, busca]);

  const unidade = MEASURES[medida].unit;
  const total = filtrado.reduce((s, d) => s + d.valor, 0);
  const totalTxt = total >= 1e6 ? fmtC.format(total) : fmt.format(Math.round(total));
  const kCadeias = uniq(filtrado.map(d => d.categoria)).length;
  const kProdutos = uniq(filtrado.map(d => d.produto)).length;
  const kLocais = uniq(filtrado.map(d => d.local)).length;
  const kLocaisU = nivel === 'Município' ? 'municípios' : (nivel === 'Microrregião' ? 'microrregiões' : 'mesorregião');
  const t1 = `Ranking de ${nivel === 'Município' ? 'municípios' : (nivel === 'Microrregião' ? 'microrregiões' : 'localidades')}`;

  function donutCfg(labels, values, un) {
    return {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: labels.map((_, i) => PALETTE[i % PALETTE.length]), borderColor: '#fff', borderWidth: 2 }] },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '55%',
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 11, font: { size: 11, family: 'Segoe UI' }, color: '#605e5c', padding: 8 } },
          tooltip: {
            callbacks: {
              label: c => {
                const t = c.dataset.data.reduce((a, b) => a + b, 0);
                const p = t ? (c.parsed / t * 100).toFixed(1) : 0;
                return ` ${c.label}: ${fmt.format(Math.round(c.parsed))} ${un} (${p}%)`;
              },
            },
          },
        },
      },
    };
  }

  useEffect(() => {
    if (!dados) return;
    Object.values(chartInstances.current).forEach(c => c && c.destroy());
    chartInstances.current = {};

    const rl = rankTop(filtrado, d => d.local);
    chartInstances.current.pieL = new Chart(pieLocaisRef.current, donutCfg(rl.map(x => x[0]), rl.map(x => x[1]), unidade));

    const rc = rankTop(filtrado, d => d.categoria, 9);
    chartInstances.current.pieC = new Chart(pieCadeiasRef.current, donutCfg(rc.map(x => x[0]), rc.map(x => x[1]), unidade));

    const rp = rankTop(filtrado, d => d.produto, 10).filter(x => x[0] !== 'Outros');
    chartInstances.current.barP = new Chart(barProdutosRef.current, {
      type: 'bar',
      data: { labels: rp.map(x => x[0]), datasets: [{ data: rp.map(x => x[1]), backgroundColor: '#596AB6', borderRadius: 3, maxBarThickness: 22 }] },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${fmt.format(Math.round(c.parsed.x))} ${unidade}` } } },
        scales: {
          x: { ticks: { callback: v => fmtC.format(v), font: { size: 10 }, color: '#8a8886' }, grid: { color: '#edebe9' } },
          y: { ticks: { font: { size: 11, family: 'Segoe UI' }, color: '#605e5c' }, grid: { display: false } },
        },
      },
    });

    return () => {
      Object.values(chartInstances.current).forEach(c => c && c.destroy());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dados, filtrado, unidade]);

  const matriz = useMemo(() => {
    const acc = {}, cadByLoc = {};
    filtrado.forEach(d => {
      acc[d.local] = (acc[d.local] || 0) + d.valor;
      (cadByLoc[d.local] = cadByLoc[d.local] || new Set()).add(d.categoria);
    });
    const rows = Object.entries(acc).sort((a, b) => b[1] - a[1]);
    return { rows, cadByLoc };
  }, [filtrado]);

  function limparFiltros() {
    setMedida('valor'); setCadeia(''); setProduto(''); setBusca(''); setNivel('Município');
  }

  const clsNivel = nivel === 'Mesorregião' ? 'meso' : (nivel === 'Microrregião' ? 'micro' : '');

  return (
    <div className="cadeias-scope">
      <header>
        <h1>Cadeias Produtivas — Baixo Amazonas</h1>
        <p>Mesorregião do Baixo Amazonas (PA) · IBGE 2024 · PAM, PEVS e PPM</p>
      </header>

      {erro && (
        <div className="loaderr" style={{ margin: '40px auto' }}>
          <b>Não encontrei os dados.</b><br />
          Verifique se a API está rodando e se o endpoint /api/cadeias está acessível.
        </div>
      )}

      {!erro && !dados && (
        <div className="loaderr" style={{ margin: '40px auto' }}>Carregando dados…</div>
      )}

      {dados && (
        <div className="shell">
          <aside className="slicers">
            <div className="panel">
              <div className="panel-h">Filtros</div>
              <div className="panel-b">
                <label className="field-label" htmlFor="fMedida">Medida</label>
                <select id="fMedida" value={medida} onChange={e => { setMedida(e.target.value); setProduto(''); }}>
                  {Object.entries(MEASURES).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
                </select>

                <label className="field-label" htmlFor="fCadeia">Cadeia produtiva</label>
                <select id="fCadeia" value={cadeia} onChange={e => { setCadeia(e.target.value); setProduto(''); }}>
                  <option value="">Todas</option>
                  {cadeiasDisponiveis.map(c => <option key={c}>{c}</option>)}
                </select>

                <label className="field-label" htmlFor="fProduto">Produto</label>
                <select id="fProduto" value={produto} onChange={e => setProduto(e.target.value)}>
                  <option value="">Todos</option>
                  {produtosDisponiveis.map(p => <option key={p}>{p}</option>)}
                </select>

                <span className="field-label">Nível territorial</span>
                <div className="seg small" id="segNivel">
                  {['Município', 'Microrregião', 'Mesorregião'].map(n => (
                    <button key={n} className={nivel === n ? 'on' : ''} onClick={() => setNivel(n)}>
                      {n === 'Microrregião' ? 'Micro' : n === 'Mesorregião' ? 'Meso' : n}
                    </button>
                  ))}
                </div>

                <label className="field-label" htmlFor="fBusca">Buscar localidade</label>
                <input type="text" id="fBusca" placeholder="Santarém, Óbidos, Juruti…" value={busca} onChange={e => setBusca(e.target.value)} />

                <button className="reset" onClick={limparFiltros}>↺ Limpar filtros</button>
              </div>
            </div>

            <div className="panel">
              <div className="panel-h">Sobre</div>
              <div className="panel-b">
                <div className="sobre-box">
                  Cada medida usa uma unidade própria e comparável: <strong>Valor</strong> em R$ mil,
                  <strong> Produção</strong> em toneladas, <strong>Madeira/lenha</strong> em m³ e <strong>Rebanho</strong> em cabeças.
                  Troque a medida acima.
                </div>
              </div>
            </div>
          </aside>

          <main className="canvas">
            <section className="kpis">
              <div className="kpi"><div className="lab">Total da medida</div><div className="val">{totalTxt}</div><div className="unit">{unidade}</div></div>
              <div className="kpi"><div className="lab">Cadeias</div><div className="val">{kCadeias}</div><div className="unit">cadeias produtivas</div></div>
              <div className="kpi"><div className="lab">Produtos</div><div className="val">{kProdutos}</div><div className="unit">produtos mapeados</div></div>
              <div className="kpi"><div className="lab">Localidades</div><div className="val">{kLocais}</div><div className="unit">{kLocaisU}</div></div>
            </section>

            <section className="viz col-5">
              <div className="viz-h"><span className="t">{t1}</span><span className="s">{unidade}</span></div>
              <div className="viz-b"><div className="chart-wrap tall"><canvas ref={pieLocaisRef}></canvas></div></div>
            </section>
            <section className="viz col-4">
              <div className="viz-h"><span className="t">Participação por cadeia</span><span className="s">{unidade}</span></div>
              <div className="viz-b"><div className="chart-wrap tall"><canvas ref={pieCadeiasRef}></canvas></div></div>
            </section>
            <section className="viz col-12">
              <div className="viz-h"><span className="t">Top produtos</span><span className="s">{unidade}</span></div>
              <div className="viz-b"><div className="chart-wrap"><canvas ref={barProdutosRef}></canvas></div></div>
            </section>
            <section className="viz col-12">
              <div className="viz-h"><span className="t">Detalhe por localidade</span><span className="s">{matriz.rows.length} localidades · {unidade}</span></div>
              <div className="viz-b" style={{ padding: 0 }}>
                <div className="mwrap">
                  <table>
                    <thead>
                      <tr><th>Localidade</th><th className="num">Total ({unidade})</th><th>Cadeias presentes</th></tr>
                    </thead>
                    <tbody>
                      {matriz.rows.length === 0 && (
                        <tr><td colSpan={3} className="empty">Sem dados para esta medida e filtros. Tente outra medida (ex.: Rebanho para Pecuária).</td></tr>
                      )}
                      {matriz.rows.map(([loc, t]) => (
                        <tr key={loc}>
                          <td className={clsNivel}>{loc}</td>
                          <td className="num">{fmt.format(Math.round(t))}</td>
                          <td style={{ color: 'var(--ink2)' }}>{[...(matriz.cadByLoc[loc] || [])].join(' · ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <div className="foot">
              Fonte: IBGE — PAM, PEVS e PPM, ano-base 2024. Compilação: mesorregião do Baixo Amazonas (PA).
              Produção em toneladas cobre lavouras e extrativismo alimentício/oleaginoso; madeira e lenha em m³; pecuária em cabeças.
            </div>
          </main>
        </div>
      )}
    </div>
  );
}
