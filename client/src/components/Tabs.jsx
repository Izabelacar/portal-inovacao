export default function Tabs({ aba, onChange }) {
  return (
    <div className="tabs">
      <button id="btnBrasil" className={aba === 'brasil' ? 'active' : ''} onClick={() => onChange('brasil')}>
        Brasil
      </button>
      <button id="btnMundo" className={aba === 'mundo' ? 'active' : ''} onClick={() => onChange('mundo')}>
        Mundo
      </button>
    </div>
  );
}
