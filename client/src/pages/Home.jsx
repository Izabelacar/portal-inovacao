import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
  return (
    <div className="home-scope">
      <section className="hero-home">
        <div className="hero-content">
          <span className="eyebrow">Inovação &amp; Desenvolvimento</span>

          <h1>Portal de Inovação e Desenvolvimento Regional</h1>

          <p className="lead">
            Apoio à pesquisa e à visualização de dados sobre inovação, bioeconomia,
            parques tecnológicos e desenvolvimento regional no Baixo Amazonas.
          </p>

          <div className="cards-home">
            <Link to="/mapas" className="card-home">
              <div className="card-top">
                <span className="card-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 21s-6-5.686-6-10a6 6 0 1 1 12 0c0 4.314-6 10-6 10z" />
                    <circle cx="12" cy="11" r="2.5" />
                  </svg>
                </span>
                <h3>Parques no Mapa</h3>
              </div>
              <p>Mapas interativos com a distribuição de parques tecnológicos no Brasil e no mundo.</p>
              <span className="card-link">Ver mapas</span>
            </Link>

            <Link to="/cadeias" className="card-home">
              <div className="card-top">
                <span className="card-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 20c0-5 2-9 9-11-1 6-4 9-9 11z" />
                    <path d="M5 21c1.5-5 4-8 8-10" />
                  </svg>
                </span>
                <h3>Cadeias Produtivas</h3>
              </div>
              <p>Produção das cadeias florestais e extrativistas dos municípios do Baixo Amazonas (IBGE).</p>
              <span className="card-link">Abrir painel</span>
            </Link>

            <Link to="/projetos" className="card-home">
              <div className="card-top">
                <span className="card-ico" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 3h6" />
                    <path d="M10 3v6.5L5.5 18a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 9.5V3" />
                    <path d="M8 14h8" />
                  </svg>
                </span>
                <h3>Grupos e Laboratórios</h3>
              </div>
              <p>Projetos de pesquisa, grupos certificados e laboratórios da rede de inovação de Santarém.</p>
              <span className="card-link">Explorar rede</span>
            </Link>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        <strong>Portal de Inovação e Desenvolvimento Regional</strong>
        <span className="sep">·</span> Baixo Amazonas (PA)
        <span className="sep">·</span> Universidade Federal do Oeste do Pará (UFOPA)
        <span className="sep">·</span> Santarém
        <span className="sep">·</span> <Link to="/admin" style={{ color: 'inherit' }}>Painel admin</Link>
      </footer>
    </div>
  );
}
