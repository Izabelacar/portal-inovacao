/**
 * Popula o banco MySQL "parques_inovacao" com os dados originais do projeto
 * (antes espalhados nos arquivos data/*.js e data/*.json).
 *
 * Uso:
 *   1) Rode o schema primeiro:  mysql -u root -p < ../sql/schema.sql
 *   2) node seed.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const fs = require('fs');
const path = require('path');
const pool = require('../db');

function loadJSON(file) {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'data', file), 'utf-8'));
}

async function chunkInsert(conn, sql, rows, chunkSize = 200) {
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    await conn.query(sql, [chunk]);
  }
}

async function seedParquesBrasil(conn) {
  const data = loadJSON('parques_brasil.json');
  const rows = data.map(d => [d.regiao, d.estado, d.uf, d.total, d.planejamento, d.implantacao, d.operacao]);
  await conn.query('DELETE FROM parques_brasil');
  await chunkInsert(conn,
    'INSERT INTO parques_brasil (regiao, estado, uf, total, planejamento, implantacao, operacao) VALUES ?',
    rows);
  console.log(`✔ parques_brasil: ${rows.length} registros`);
}

async function seedParquesMundo(conn) {
  const data = loadJSON('parques_mundo.json');
  const rows = data.map(d => [d.pais, d.iso3, d.total]);
  await conn.query('DELETE FROM parques_mundo');
  await chunkInsert(conn, 'INSERT INTO parques_mundo (pais, iso3, total) VALUES ?', rows);
  console.log(`✔ parques_mundo: ${rows.length} registros`);
}

async function seedCadeias(conn) {
  const data = loadJSON('cadeias_produtivas.json');
  const rows = data.map(d => [d.categoria, d.produto, d.local, d.nivel, d.variavel, d.unidade, d.valor]);
  await conn.query('DELETE FROM cadeias_produtivas');
  await chunkInsert(conn,
    'INSERT INTO cadeias_produtivas (categoria, produto, local, nivel, variavel, unidade, valor) VALUES ?',
    rows);
  console.log(`✔ cadeias_produtivas: ${rows.length} registros`);
}

async function seedProjetos(conn) {
  const data = loadJSON('projetos.json');
  const rows = data.map(d => [
    d.ano || null, d.codigo || null, d.centro || null, d.titulo || '',
    d.coordenador || null, d.situacao || null, d.palavras || null,
    d.grandeArea || null, d.area || null, d.grupo || null, d.linha || null, d.resumo || null,
  ]);
  await conn.query('DELETE FROM projetos');
  await chunkInsert(conn,
    `INSERT INTO projetos
     (ano, codigo, centro, titulo, coordenador, situacao, palavras, grande_area, area, grupo, linha, resumo)
     VALUES ?`,
    rows);
  console.log(`✔ projetos: ${rows.length} registros`);
}

async function seedGrupos(conn) {
  const data = loadJSON('grupos.json');
  const rows = data.map(d => [
    d.nome, d.ano || null, d.cidade || null, d.situacao || null, d.grandeArea || null,
    d.area || null, d.instituicao || null, d.linhas || 0, d.pesquisadores || 0,
    d.estudantes || 0, d.tecnicos || 0, d.doutores || 0,
  ]);
  await conn.query('DELETE FROM grupos_pesquisa');
  await chunkInsert(conn,
    `INSERT INTO grupos_pesquisa
     (nome, ano, cidade, situacao, grande_area, area, instituicao, linhas, pesquisadores, estudantes, tecnicos, doutores)
     VALUES ?`,
    rows);
  console.log(`✔ grupos_pesquisa: ${rows.length} registros`);
}

async function seedLaboratorios(conn) {
  const data = loadJSON('laboratorios.json');
  const rows = data.map(d => [
    d.nome, d.sobre || null, d.cidade || null, d.responsavel || null, d.instituicao || null,
    d.areaPrincipal || null, d.nEquip || 0,
    JSON.stringify(d.areas || []), JSON.stringify(d.tecnicas || []),
  ]);
  await conn.query('DELETE FROM laboratorios');
  await chunkInsert(conn,
    `INSERT INTO laboratorios
     (nome, sobre, cidade, responsavel, instituicao, area_principal, n_equip, areas, tecnicas)
     VALUES ?`,
    rows);
  console.log(`✔ laboratorios: ${rows.length} registros`);
}

async function main() {
  const conn = await pool.getConnection();
  try {
    console.log('Iniciando seed do banco parques_inovacao...\n');
    await seedParquesBrasil(conn);
    await seedParquesMundo(conn);
    await seedCadeias(conn);
    await seedProjetos(conn);
    await seedGrupos(conn);
    await seedLaboratorios(conn);
    console.log('\n✅ Seed concluído com sucesso.');
  } catch (err) {
    console.error('❌ Erro durante o seed:', err);
    process.exitCode = 1;
  } finally {
    conn.release();
    await pool.end();
  }
}

main();
