import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Mapas from './pages/Mapas.jsx';
import Cadeias from './pages/Cadeias.jsx';
import Projetos from './pages/Projetos.jsx';
import Admin from './pages/Admin.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/mapas" element={<Mapas />} />
      <Route path="/cadeias" element={<Cadeias />} />
      <Route path="/projetos" element={<Projetos />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  );
}
