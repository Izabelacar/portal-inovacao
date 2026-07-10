import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Header from '../components/Header.jsx';
import Tabs from '../components/Tabs.jsx';
import Footer from '../components/Footer.jsx';
import { api } from '../api/client.js';

function getColorBrasil(total) {
  return total > 15 ? '#596ab6' :
    total > 10 ? '#7685d4' :
    total > 6 ? '#94a0f2' :
    total > 3 ? '#b2bdff' :
    total > 1 ? '#c1ccff' :
    total > 0 ? '#d0dbff' :
    '#fffcf3';
}

function getColorMundo(total) {
  if (total >= 500) return '#3d4b7a';
  if (total >= 100) return '#596ab6';
  if (total >= 50) return '#7685d4';
  if (total >= 20) return '#94a0f2';
  if (total >= 10) return '#b2bdff';
  if (total >= 5) return '#c1ccff';
  if (total >= 1) return '#d0dbff';
  return '#fffcf3';
}

function criarLegenda(map, getColorFn, grades) {
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'legend');
    div.innerHTML = '<b>Total de parques</b><br>';
    for (let i = 0; i < grades.length; i++) {
      const from = grades[i];
      const to = grades[i + 1];
      div.innerHTML += '<i style="background:' + getColorFn(from) + '"></i> ' + from + (to ? '–' + (to - 1) + '<br>' : '+');
    }
    return div;
  };
  legend.addTo(map);
}

export default function Mapas() {
  const [aba, setAba] = useState('brasil');
  const [dadosBrasil, setDadosBrasil] = useState(null);
  const [dadosMundo, setDadosMundo] = useState(null);

  const mapBrasilDiv = useRef(null);
  const mapMundoDiv = useRef(null);
  const mapaBrasil = useRef(null);
  const mapaMundo = useRef(null);
  const camadaBrasil = useRef(null);
  const camadaMundo = useRef(null);
  const carregados = useRef({ brasil: false, mundo: false });

  useEffect(() => {
    api.parquesBrasil().then(setDadosBrasil).catch(() => setDadosBrasil([]));
    api.parquesMundo().then(setDadosMundo).catch(() => setDadosMundo([]));
  }, []);

  // Totais e lookups (recalculados quando os dados chegam)
  const totaisBrasil = dadosBrasil ? {
    total: dadosBrasil.reduce((s, d) => s + d.total, 0),
    planejamento: dadosBrasil.reduce((s, d) => s + d.planejamento, 0),
    implantacao: dadosBrasil.reduce((s, d) => s + d.implantacao, 0),
    operacao: dadosBrasil.reduce((s, d) => s + d.operacao, 0),
  } : null;

  const paisesComDados = dadosMundo ? new Set(dadosMundo.filter(d => d.total > 0).map(d => d.pais)) : new Set();

  function criarMapaBrasilFn() {
    if (mapaBrasil.current || !dadosBrasil) return;
    const porUF = {}, porNomeEstado = {};
    dadosBrasil.forEach(d => {
      porUF[d.uf] = d;
      porNomeEstado[d.estado.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()] = d;
    });

    const mapa = L.map(mapBrasilDiv.current).setView([-14.235, -51.9253], 4);
    mapaBrasil.current = mapa;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 8,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapa);

    const info = L.control();
    info.onAdd = function () {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    info.update = function (d) {
      this._div.innerHTML = d ? `
        <h3>${d.estado} (${d.uf})</h3>
        <b>Total:</b> ${d.total}<br>
        <b>Planejamento:</b> ${d.planejamento}<br>
        <b>Implantação:</b> ${d.implantacao}<br>
        <b>Operação:</b> ${d.operacao}<br>
        <b>Região:</b> ${d.regiao}
      ` : `
        <h3>Brasil</h3>
        Passe o mouse sobre um estado.<br><br>
        <b>Total nacional:</b> ${totaisBrasil.total}<br>
        <b>Planejamento:</b> ${totaisBrasil.planejamento}<br>
        <b>Implantação:</b> ${totaisBrasil.implantacao}<br>
        <b>Operação:</b> ${totaisBrasil.operacao}
      `;
    };
    info.addTo(mapa);

    criarLegenda(mapa, getColorBrasil, [0, 1, 2, 4, 7, 11, 16]);
    L.control.zoom({ position: 'topleft' }).addTo(mapa);

    fetch('https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson')
      .then(r => r.json())
      .then(geoData => {
        camadaBrasil.current = L.geoJson(geoData, {
          style: feature => {
            const uf = (feature.properties.sigla || feature.properties.UF || feature.properties.postal || feature.properties.iso_3166_2 || '').replace('BR-', '');
            const nome = (feature.properties.name || feature.properties.nome || feature.properties.NOME || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const d = porUF[uf] || porNomeEstado[nome] || { total: 0 };
            return { fillColor: getColorBrasil(d.total), weight: 1, opacity: 1, color: '#666', fillOpacity: 0.9 };
          },
          onEachFeature: (feature, layer) => {
            const uf = (feature.properties.sigla || feature.properties.UF || feature.properties.postal || feature.properties.iso_3166_2 || '').replace('BR-', '');
            const nome = (feature.properties.name || feature.properties.nome || feature.properties.NOME || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
            const d = porUF[uf] || porNomeEstado[nome];
            layer.bindTooltip(d ? `${d.estado} (${d.uf}): ${d.total} parques` : `${feature.properties.name || 'Estado'}: sem dados`, { sticky: true });
            layer.on({
              mouseover() {
                layer.setStyle({ weight: 3, color: '#111', fillOpacity: 1 });
                info.update(d || { estado: feature.properties.name, uf: '', total: 0, planejamento: 0, implantacao: 0, operacao: 0, regiao: 'Desconhecida' });
              },
              mouseout() {
                camadaBrasil.current.resetStyle(layer);
                info.update();
              },
              click() { mapa.fitBounds(layer.getBounds()); },
            });
          },
        }).addTo(mapa);
      })
      .catch(err => console.error('Erro ao carregar mapa do Brasil:', err));
  }

  function criarMapaMundoFn() {
    if (mapaMundo.current || !dadosMundo) return;
    const porISO3 = {};
    dadosMundo.forEach(d => { porISO3[d.iso3] = d; });

    const mapa = L.map(mapMundoDiv.current).setView([20, 0], 2);
    mapaMundo.current = mapa;
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 6,
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(mapa);

    const info = L.control();
    info.onAdd = function () {
      this._div = L.DomUtil.create('div', 'info');
      this.update();
      return this._div;
    };
    info.update = function (d) {
      this._div.innerHTML = d ? `
        <h3>${d.pais}</h3>
        <b>Total:</b> ${d.total > 0 ? d.total : 'sem dados oficiais'}
      ` : `
        <h3>Mundo</h3>
        Passe o mouse sobre um país.<br>
        <b>Países com dados:</b> ${paisesComDados.size} de ${dadosMundo.length}
      `;
    };
    info.addTo(mapa);

    const grades = [0, 1, 5, 10, 20, 50, 100, 500];
    criarLegenda(mapa, getColorMundo, grades);

    fetch('https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json')
      .then(r => r.json())
      .then(geoData => {
        camadaMundo.current = L.geoJson(geoData, {
          style: feature => {
            const d = porISO3[feature.id] || { total: 0 };
            return { fillColor: getColorMundo(d.total), weight: 1, opacity: 1, color: '#666', fillOpacity: 0.85 };
          },
          onEachFeature: (feature, layer) => {
            const d = porISO3[feature.id];
            layer.bindTooltip(d ? `${d.pais}: ${d.total} parques` : `${feature.properties.name}: sem dados`, { sticky: true });
            layer.on({
              mouseover() {
                layer.setStyle({ weight: 2, color: '#111', fillOpacity: 1 });
                info.update(d || { pais: feature.properties.name, total: 0 });
              },
              mouseout() {
                camadaMundo.current.resetStyle(layer);
                info.update();
              },
              click() { mapa.fitBounds(layer.getBounds()); },
            });
          },
        }).addTo(mapa);
      })
      .catch(err => console.error('Erro ao carregar mapa mundial:', err));
  }

  useEffect(() => {
    if (!dadosBrasil || !dadosMundo) return;

    function aguardarMapaVisivel(el, callback) {
      if (!el) return callback();
      const check = () => {
        if (el.offsetWidth > 0 && el.offsetHeight > 0) callback();
        else setTimeout(check, 50);
      };
      check();
    }

    if (aba === 'brasil') {
      if (!carregados.current.brasil) {
        criarMapaBrasilFn();
        carregados.current.brasil = true;
      }
      aguardarMapaVisivel(mapBrasilDiv.current, () => mapaBrasil.current && mapaBrasil.current.invalidateSize());
    } else {
      if (!carregados.current.mundo) {
        criarMapaMundoFn();
        carregados.current.mundo = true;
      }
      aguardarMapaVisivel(mapMundoDiv.current, () => mapaMundo.current && mapaMundo.current.invalidateSize());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba, dadosBrasil, dadosMundo]);

  const subtitle = !totaisBrasil || !dadosMundo
    ? ''
    : aba === 'brasil'
      ? `Brasil — Total nacional: ${totaisBrasil.total} parques | Planejamento: ${totaisBrasil.planejamento} | Implantação: ${totaisBrasil.implantacao} | Operação: ${totaisBrasil.operacao}`
      : `Mundo — ${paisesComDados.size} países com parques registrados (de ${dadosMundo.length} listados)`;

  return (
    <>
      <Header subtitle={subtitle} />
      <Tabs aba={aba} onChange={setAba} />
      <div id="mapBrasil" ref={mapBrasilDiv} className={`map-container ${aba === 'brasil' ? 'active' : ''}`}></div>
      <div id="mapMundo" ref={mapMundoDiv} className={`map-container ${aba === 'mundo' ? 'active' : ''}`}></div>
      <Footer />
    </>
  );
}
