const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAdminAuth = require('../middleware/adminAuth');

// GET /api/ecossistema -> { projetos, grupos, laboratorios }
// Mantém o mesmo formato do antigo window.DADOS usado pelo front original.
router.get('/', async (req, res) => {
  try {
    const [projetosRows] = await pool.query(
      `SELECT id, ano, codigo, centro, titulo, coordenador, situacao, palavras,
              grande_area AS grandeArea, area, grupo, linha, resumo
       FROM projetos`
    );
    const [gruposRows] = await pool.query(
      `SELECT id, nome, ano, cidade, situacao, grande_area AS grandeArea, area, instituicao,
              linhas, pesquisadores, estudantes, tecnicos, doutores
       FROM grupos_pesquisa`
    );
    const [labRows] = await pool.query(
      `SELECT id, nome, sobre, cidade, responsavel, instituicao,
              area_principal AS areaPrincipal, n_equip AS nEquip, areas, tecnicas
       FROM laboratorios`
    );

    const laboratorios = labRows.map(l => ({
      ...l,
      areas: typeof l.areas === 'string' ? JSON.parse(l.areas) : l.areas,
      tecnicas: typeof l.tecnicas === 'string' ? JSON.parse(l.tecnicas) : l.tecnicas,
    }));

    res.json({ projetos: projetosRows, grupos: gruposRows, laboratorios });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar dados do ecossistema de inovação' });
  }
});

/* ===================== PROJETOS ===================== */

router.get('/projetos', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, ano, codigo, centro, titulo, coordenador, situacao, palavras,
            grande_area AS grandeArea, area, grupo, linha, resumo FROM projetos`
  );
  res.json(rows);
});

router.post('/projetos', requireAdminAuth, async (req, res) => {
  try {
    const { ano, codigo, centro, titulo, coordenador, situacao, palavras, grandeArea, area, grupo, linha, resumo } = req.body;
    if (!titulo) return res.status(400).json({ error: 'titulo é obrigatório' });
    const [result] = await pool.query(
      `INSERT INTO projetos (ano, codigo, centro, titulo, coordenador, situacao, palavras, grande_area, area, grupo, linha, resumo)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ano || null, codigo || null, centro || null, titulo, coordenador || null, situacao || null,
       palavras || null, grandeArea || null, area || null, grupo || null, linha || null, resumo || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar projeto (verifique se o código já existe)' });
  }
});

router.put('/projetos/:id', requireAdminAuth, async (req, res) => {
  try {
    const { ano, codigo, centro, titulo, coordenador, situacao, palavras, grandeArea, area, grupo, linha, resumo } = req.body;
    await pool.query(
      `UPDATE projetos SET ano=?, codigo=?, centro=?, titulo=?, coordenador=?, situacao=?, palavras=?,
              grande_area=?, area=?, grupo=?, linha=?, resumo=? WHERE id=?`,
      [ano || null, codigo || null, centro || null, titulo, coordenador || null, situacao || null,
       palavras || null, grandeArea || null, area || null, grupo || null, linha || null, resumo || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar projeto' });
  }
});

router.delete('/projetos/:id', requireAdminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM projetos WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir projeto' });
  }
});

/* ===================== GRUPOS DE PESQUISA ===================== */

router.get('/grupos', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, nome, ano, cidade, situacao, grande_area AS grandeArea, area, instituicao,
            linhas, pesquisadores, estudantes, tecnicos, doutores FROM grupos_pesquisa`
  );
  res.json(rows);
});

router.post('/grupos', requireAdminAuth, async (req, res) => {
  try {
    const { nome, ano, cidade, situacao, grandeArea, area, instituicao, linhas, pesquisadores, estudantes, tecnicos, doutores } = req.body;
    if (!nome) return res.status(400).json({ error: 'nome é obrigatório' });
    const [result] = await pool.query(
      `INSERT INTO grupos_pesquisa (nome, ano, cidade, situacao, grande_area, area, instituicao, linhas, pesquisadores, estudantes, tecnicos, doutores)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, ano || null, cidade || null, situacao || null, grandeArea || null, area || null,
       instituicao || null, linhas || 0, pesquisadores || 0, estudantes || 0, tecnicos || 0, doutores || 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar grupo de pesquisa' });
  }
});

router.put('/grupos/:id', requireAdminAuth, async (req, res) => {
  try {
    const { nome, ano, cidade, situacao, grandeArea, area, instituicao, linhas, pesquisadores, estudantes, tecnicos, doutores } = req.body;
    await pool.query(
      `UPDATE grupos_pesquisa SET nome=?, ano=?, cidade=?, situacao=?, grande_area=?, area=?, instituicao=?,
              linhas=?, pesquisadores=?, estudantes=?, tecnicos=?, doutores=? WHERE id=?`,
      [nome, ano || null, cidade || null, situacao || null, grandeArea || null, area || null,
       instituicao || null, linhas || 0, pesquisadores || 0, estudantes || 0, tecnicos || 0, doutores || 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar grupo de pesquisa' });
  }
});

router.delete('/grupos/:id', requireAdminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM grupos_pesquisa WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir grupo de pesquisa' });
  }
});

/* ===================== LABORATÓRIOS ===================== */

router.get('/laboratorios', async (req, res) => {
  const [rows] = await pool.query(
    `SELECT id, nome, sobre, cidade, responsavel, instituicao,
            area_principal AS areaPrincipal, n_equip AS nEquip, areas, tecnicas FROM laboratorios`
  );
  const data = rows.map(l => ({
    ...l,
    areas: typeof l.areas === 'string' ? JSON.parse(l.areas) : l.areas,
    tecnicas: typeof l.tecnicas === 'string' ? JSON.parse(l.tecnicas) : l.tecnicas,
  }));
  res.json(data);
});

router.post('/laboratorios', requireAdminAuth, async (req, res) => {
  try {
    const { nome, sobre, cidade, responsavel, instituicao, areaPrincipal, nEquip, areas, tecnicas } = req.body;
    if (!nome) return res.status(400).json({ error: 'nome é obrigatório' });
    const [result] = await pool.query(
      `INSERT INTO laboratorios (nome, sobre, cidade, responsavel, instituicao, area_principal, n_equip, areas, tecnicas)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nome, sobre || null, cidade || null, responsavel || null, instituicao || null,
       areaPrincipal || null, nEquip || 0, JSON.stringify(areas || []), JSON.stringify(tecnicas || [])]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar laboratório' });
  }
});

router.put('/laboratorios/:id', requireAdminAuth, async (req, res) => {
  try {
    const { nome, sobre, cidade, responsavel, instituicao, areaPrincipal, nEquip, areas, tecnicas } = req.body;
    await pool.query(
      `UPDATE laboratorios SET nome=?, sobre=?, cidade=?, responsavel=?, instituicao=?, area_principal=?,
              n_equip=?, areas=?, tecnicas=? WHERE id=?`,
      [nome, sobre || null, cidade || null, responsavel || null, instituicao || null,
       areaPrincipal || null, nEquip || 0, JSON.stringify(areas || []), JSON.stringify(tecnicas || []), req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar laboratório' });
  }
});

router.delete('/laboratorios/:id', requireAdminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM laboratorios WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir laboratório' });
  }
});

module.exports = router;
