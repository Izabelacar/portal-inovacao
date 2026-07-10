import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/style.css';

// HashRouter (em vez de BrowserRouter) para funcionar de forma confiável no
// GitHub Pages, que não sabe redirecionar rotas como /mapas ou /admin para o
// index.html. As URLs ficam com # (ex: seusite.github.io/repo/#/mapas).
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
