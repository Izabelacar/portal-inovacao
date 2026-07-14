import React from 'react';
import ReactDOM from 'react-dom/client';
<<<<<<< HEAD
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
=======
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles/style.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
>>>>>>> f62d7863e58360d65edb3f16471c986938deda61
  </React.StrictMode>
);
