const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAdminAuth = require('../middleware/adminAuth');

/* ===================== BRASIL ===================== */

// GET /api/parques/brasil
router.get('/brasil', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, regiao, estado, uf, total, planejamento, implantacao, operacao FROM parques_brasil ORDER BY regiao, estado'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar dados de parques (Brasil)' });
  }
});

// POST /api/parques/brasil
router.post('/brasil', requireAdminAuth, async (req, res) => {
  try {
    const { regiao, estado, uf, total, planejamento, implantacao, operacao } = req.body;
    if (!regiao || !estado || !uf) {
      return res.status(400).json({ error: 'regiao, estado e uf são obrigatórios' });
    }
    const [result] = await pool.query(
      `INSERT INTO parques_brasil (regiao, estado, uf, total, planejamento, implantacao, operacao)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [regiao, estado, uf, total || 0, planejamento || 0, implantacao || 0, operacao || 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar registro de parque (Brasil)' });
  }
});

// PUT /api/parques/brasil/:id
router.put('/brasil/:id', requireAdminAuth, async (req, res) => {
  try {
    const { regiao, estado, uf, total, planejamento, implantacao, operacao } = req.body;
    await pool.query(
      `UPDATE parques_brasil SET regiao=?, estado=?, uf=?, total=?, planejamento=?, implantacao=?, operacao=?
       WHERE id=?`,
      [regiao, estado, uf, total || 0, planejamento || 0, implantacao || 0, operacao || 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar registro de parque (Brasil)' });
  }
});

// DELETE /api/parques/brasil/:id
router.delete('/brasil/:id', requireAdminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM parques_brasil WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir registro de parque (Brasil)' });
  }
});

/* ===================== MUNDO ===================== */

// GET /api/parques/mundo
router.get('/mundo', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, pais, iso3, total FROM parques_mundo ORDER BY pais');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar dados de parques (Mundo)' });
  }
});

// POST /api/parques/mundo
router.post('/mundo', requireAdminAuth, async (req, res) => {
  try {
    const { pais, iso3, total } = req.body;
    if (!pais || !iso3) return res.status(400).json({ error: 'pais e iso3 são obrigatórios' });
    const [result] = await pool.query(
      'INSERT INTO parques_mundo (pais, iso3, total) VALUES (?, ?, ?)',
      [pais, iso3, total || 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar registro de parque (Mundo)' });
  }
});

// PUT /api/parques/mundo/:id
router.put('/mundo/:id', requireAdminAuth, async (req, res) => {
  try {
    const { pais, iso3, total } = req.body;
    await pool.query(
      'UPDATE parques_mundo SET pais=?, iso3=?, total=? WHERE id=?',
      [pais, iso3, total || 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar registro de parque (Mundo)' });
  }
});

// DELETE /api/parques/mundo/:id
router.delete('/mundo/:id', requireAdminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM parques_mundo WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir registro de parque (Mundo)' });
  }
});

module.exports = router;
