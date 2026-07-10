-- ==================================================
-- Banco: parques_inovacao
-- Portal de Inovação e Desenvolvimento Regional (Baixo Amazonas / UFOPA)
-- ==================================================

CREATE DATABASE IF NOT EXISTS parques_inovacao
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE parques_inovacao;

-- Parques científicos e tecnológicos por estado (Brasil)
CREATE TABLE IF NOT EXISTS parques_brasil (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  regiao        VARCHAR(50)  NOT NULL,
  estado        VARCHAR(100) NOT NULL,
  uf            VARCHAR(2)   NOT NULL,
  total         INT NOT NULL DEFAULT 0,
  planejamento  INT NOT NULL DEFAULT 0,
  implantacao   INT NOT NULL DEFAULT 0,
  operacao      INT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_uf (uf)
) ENGINE=InnoDB;

-- Parques científicos e tecnológicos por país (Mundo)
CREATE TABLE IF NOT EXISTS parques_mundo (
  id     INT AUTO_INCREMENT PRIMARY KEY,
  pais   VARCHAR(100) NOT NULL,
  iso3   VARCHAR(3)   NOT NULL,
  total  INT NOT NULL DEFAULT 0,
  UNIQUE KEY uk_iso3 (iso3)
) ENGINE=InnoDB;

-- Cadeias produtivas do Baixo Amazonas (IBGE: PAM, PEVS, PPM)
CREATE TABLE IF NOT EXISTS cadeias_produtivas (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  categoria  VARCHAR(150) NOT NULL,
  produto    VARCHAR(150) NOT NULL,
  local      VARCHAR(150) NOT NULL,
  nivel      VARCHAR(50)  NOT NULL,
  variavel   VARCHAR(150) NOT NULL,
  unidade    VARCHAR(50)  NOT NULL,
  valor      DECIMAL(18,3) NOT NULL DEFAULT 0,
  INDEX idx_categoria (categoria),
  INDEX idx_local (local),
  INDEX idx_nivel (nivel)
) ENGINE=InnoDB;

-- Projetos de pesquisa (UFOPA/IFPA/UEPA)
CREATE TABLE IF NOT EXISTS projetos (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  ano           VARCHAR(4),
  codigo        VARCHAR(50) UNIQUE,
  centro        VARCHAR(50),
  titulo        VARCHAR(500) NOT NULL,
  coordenador   VARCHAR(200),
  situacao      VARCHAR(50),
  palavras      TEXT,
  grande_area   VARCHAR(150),
  area          VARCHAR(150),
  grupo         VARCHAR(300),
  linha         VARCHAR(200),
  resumo        TEXT,
  INDEX idx_ano (ano),
  INDEX idx_grande_area (grande_area)
) ENGINE=InnoDB;

-- Grupos de pesquisa certificados
CREATE TABLE IF NOT EXISTS grupos_pesquisa (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nome           VARCHAR(300) NOT NULL,
  ano            VARCHAR(4),
  cidade         VARCHAR(150),
  situacao       VARCHAR(50),
  grande_area    VARCHAR(150),
  area           VARCHAR(150),
  instituicao    VARCHAR(100),
  linhas         INT DEFAULT 0,
  pesquisadores  INT DEFAULT 0,
  estudantes     INT DEFAULT 0,
  tecnicos       INT DEFAULT 0,
  doutores       INT DEFAULT 0,
  INDEX idx_grande_area (grande_area),
  INDEX idx_instituicao (instituicao)
) ENGINE=InnoDB;

-- Laboratórios e infraestrutura
CREATE TABLE IF NOT EXISTS laboratorios (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  nome           VARCHAR(300) NOT NULL,
  sobre          TEXT,
  cidade         VARCHAR(150),
  responsavel    VARCHAR(200),
  instituicao    VARCHAR(100),
  area_principal VARCHAR(150),
  n_equip        INT DEFAULT 0,
  areas          JSON,
  tecnicas       JSON,
  INDEX idx_instituicao (instituicao),
  INDEX idx_area_principal (area_principal)
) ENGINE=InnoDB;
