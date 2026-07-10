# Portal de Inovação e Desenvolvimento Regional

**React + Node/Express + MySQL** — Baixo Amazonas (PA) / UFOPA

Migração do projeto original (HTML/CSS/JS puro) para **React** no front-end e
**Node/Express + MySQL** no back-end, **mantendo 100% do CSS e da estrutura
visual originais**. Nenhuma classe, cor, layout ou comportamento visual foi
alterado — o que mudou foi a organização do código e a origem dos dados
(antes embutidos em arquivos `.js`/`.json`, agora servidos por uma API a
partir do MySQL). Também foi adicionado um **painel administrativo** novo,
protegido por senha, para gerenciar os dados sem precisar mexer no banco na
linha de comando.

---

## Sumário

- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar (passo a passo)](#como-rodar-passo-a-passo)
- [Dados migrados para o MySQL](#dados-migrados-para-o-mysql)
- [Endpoints da API](#endpoints-da-api)
- [Rotas do site](#rotas-do-site)
- [Painel administrativo (`/admin`)](#painel-administrativo-admin)
- [Sobre a preservação do CSS](#sobre-a-preservação-do-css)
- [Publicando no GitHub](#publicando-no-github)
- [Solução de problemas comuns](#solução-de-problemas-comuns)

---

## Estrutura do projeto

```
portal-inovacao/
├── client/                  → Front-end React (Vite)
│   ├── src/
│   │   ├── pages/           → Home, Mapas, Cadeias, Projetos, Admin
│   │   ├── components/      → Header, Tabs, Footer (página de Mapas)
│   │   ├── api/             → cliente fetch para a API (+ autenticação do admin)
│   │   └── styles/          → style.css original, sem alterações
│   ├── vite.config.js
│   └── package.json
│
└── server/                  → API Node/Express + MySQL
    ├── server.js
    ├── db.js                → pool de conexão MySQL
    ├── middleware/
    │   └── adminAuth.js     → protege as rotas de escrita do painel admin
    ├── routes/
    │   ├── parques.js       → /api/parques/brasil, /api/parques/mundo
    │   ├── cadeias.js       → /api/cadeias
    │   ├── ecossistema.js   → /api/ecossistema (projetos, grupos, laboratórios)
    │   └── admin.js         → /api/admin/verify (checagem de senha)
    ├── sql/schema.sql       → criação do banco e das tabelas
    ├── seed/                → popula o banco com os dados originais
    │   ├── seed.js
    │   └── data/*.json
    ├── .env.example
    └── package.json
```

## Pré-requisitos

- **Node.js** 18 ou superior (`node -v` para conferir)
- **MySQL** ou **MariaDB** rodando localmente (`mysqladmin ping` para conferir)
- npm (já vem junto com o Node.js)

## Como rodar (passo a passo)

### 1) Criar o banco de dados

```bash
mysql -u root -p < server/sql/schema.sql
```

Isso cria o banco `parques_inovacao` e as 6 tabelas.

### 2) Configurar e subir o backend (API)

```bash
cd server
cp .env.example .env
```

Abra o `.env` e ajuste:
```
DB_USER=root
DB_PASSWORD=sua_senha_do_mysql
ADMIN_PASSWORD=escolha_uma_senha_para_o_painel_admin
```

Depois:
```bash
npm install
npm run seed     # popula o banco com os dados originais (só precisa rodar 1 vez)
npm run dev       # inicia a API em http://localhost:3001
```

Deixe esse terminal aberto.

### 3) Subir o frontend (em outro terminal)

```bash
cd client
npm install
npm run dev
```

Acesse **http://localhost:5173** no navegador.

> O Vite já vem configurado com proxy: chamadas para `/api/...` feitas pelo
> React são redirecionadas automaticamente para `http://localhost:3001`.

Para gerar a build de produção do front-end:
```bash
npm run build     # gera client/dist
```

## Dados migrados para o MySQL

| Tabela               | Origem no projeto original             | Registros |
|-----------------------|------------------------------------------|-----------|
| `parques_brasil`      | `data/dadosBrasil.js`                    | 27        |
| `parques_mundo`       | `data/dadosMundo.js`                     | 122       |
| `cadeias_produtivas`  | `data/dataCadeias.js` / `.json`          | 2.122     |
| `projetos`            | `data/dataProjeto.js` → `projetos`       | 364       |
| `grupos_pesquisa`     | `data/dataProjeto.js` → `grupos`         | 129       |
| `laboratorios`        | `data/dataProjeto.js` → `laboratorios`   | 68        |

Os arquivos JSON já extraídos e prontos para o seed ficam em `server/seed/data/`.

## Endpoints da API

| Método | Rota                                  | Autenticação | Descrição                             |
|--------|-----------------------------------------|:---:|----------------------------------------|
| GET    | `/api/parques/brasil`                   | —   | Lista parques por estado               |
| GET    | `/api/parques/mundo`                    | —   | Lista parques por país                 |
| GET    | `/api/cadeias`                          | —   | Lista cadeias produtivas               |
| GET    | `/api/ecossistema`                      | —   | `{ projetos, grupos, laboratorios }`   |
| GET    | `/api/ecossistema/projetos` \| `/grupos` \| `/laboratorios` | — | Listas individuais |
| POST/PUT/DELETE | `/api/parques/brasil(/:id)`    | 🔒  | Criar/editar/excluir                   |
| POST/PUT/DELETE | `/api/parques/mundo(/:id)`     | 🔒  | Criar/editar/excluir                   |
| POST/PUT/DELETE | `/api/cadeias(/:id)`           | 🔒  | Criar/editar/excluir                   |
| POST/PUT/DELETE | `/api/ecossistema/projetos(/:id)` | 🔒 | Criar/editar/excluir              |
| POST/PUT/DELETE | `/api/ecossistema/grupos(/:id)`   | 🔒 | Criar/editar/excluir              |
| POST/PUT/DELETE | `/api/ecossistema/laboratorios(/:id)` | 🔒 | Criar/editar/excluir          |
| GET    | `/api/admin/verify`                     | 🔒  | Verifica a senha do painel admin       |

🔒 = exige o header `x-admin-token` com o valor de `ADMIN_PASSWORD`.

## Rotas do site

| Rota          | Página original     |
|---------------|----------------------|
| `/`           | `index.html`         |
| `/mapas`      | `mapas.html`         |
| `/cadeias`    | `cadeias.html`       |
| `/projetos`   | `projetos.html`      |
| `/admin`      | **novo** — painel administrativo |

## Painel administrativo (`/admin`)

Página nova (não existia no projeto original) para cadastrar, editar e
excluir registros de qualquer uma das 6 tabelas do banco, direto pelo
navegador.

- Acesse pelo link **"Painel admin"** no rodapé da página inicial, ou direto por `/admin`.
- **Protegido por senha** (`ADMIN_PASSWORD` no `.env` do servidor). A senha
  digitada fica guardada só durante a sessão do navegador (`sessionStorage`)
  e é enviada em toda operação de escrita.
- As leituras usadas pelo site público (mapas, cadeias, projetos) continuam
  livres, sem senha — só criar/editar/excluir exige autenticação.

Funcionalidades:
- Abas para selecionar a tabela (Parques Brasil/Mundo, Cadeias Produtivas, Projetos, Grupos de Pesquisa, Laboratórios)
- Busca por qualquer campo visível
- **+ Novo registro**, **Editar** e **Excluir** (com confirmação)
- **Sair** para encerrar a sessão

⚠️ **Antes de publicar na internet:** use HTTPS (o header da senha trafega em
texto puro sobre HTTP) e escolha uma senha forte e única — a proteção atual é
simples (comparação direta), adequada para uso pessoal ou de uma equipe pequena.

## Sobre a preservação do CSS

- `style.css` (usado por Mapas, Projetos e Admin) foi copiado **sem nenhuma
  alteração** e importado globalmente.
- O CSS que estava **inline** em `index.html` e `cadeias.html` (páginas que
  não usavam `style.css`) foi extraído para `Home.css` e `Cadeias.css`,
  escopado com `.home-scope` / `.cadeias-scope` para não conflitar com o
  `style.css` global — os valores continuam idênticos, só ganharam um
  seletor "pai" para isolamento seguro entre páginas.
- Todas as classes, ids e a estrutura HTML foram mantidos com os mesmos nomes.

## Publicando no GitHub

O `.gitignore` já está configurado para não subir `node_modules/`, `dist/`
nem o `.env` (que tem suas senhas).

```bash
cd portal-inovacao
git init
git add .
git status              # confira que nenhum .env aparece na lista
git commit -m "Migração para React + Node/Express + MySQL, com painel admin"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/NOME-DO-REPO.git
git push -u origin main
```

> Quem for clonar o repositório depois só precisa copiar `.env.example` para
> `.env` e preencher com as próprias credenciais — nada sensível fica no Git.

## Solução de problemas comuns

**`mysqladmin: connect to server ... failed`**
O MySQL/MariaDB não está rodando. Inicie com `sudo systemctl start mariadb`
(ou `mysql`, dependendo do pacote instalado).

**`ERROR 1045 (28000): Access denied for user 'root'@'localhost'`**
Senha do MySQL incorreta ou não definida. Conecte com `sudo mysql -u root`
(sem senha) e defina uma com `ALTER USER 'root'@'localhost' IDENTIFIED BY 'sua_senha';`.

**`Error: ENOENT: no such file or directory, uv_cwd`**
O terminal ficou "preso" numa pasta que foi apagada ou movida. Rode `cd ~` e
navegue de novo até a pasta do projeto.

**Painel `/admin` sempre pede senha de novo**
Verifique se `ADMIN_PASSWORD` está definida no `.env` do servidor e se o
backend foi reiniciado depois de editar o arquivo.

**Erro 401 ao criar/editar/excluir pelo painel**
A senha digitada no login não bate com `ADMIN_PASSWORD` do `.env`, ou o
`.env` foi alterado depois do login — clique em "Sair" e entre de novo.