const express = require('express');
const router = express.Router();
const pool = require('../db');
const requireAdminAuth = require('../middleware/adminAuth');

// GET /api/cadeias
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, categoria, produto, local, nivel, variavel, unidade, valor FROM cadeias_produtivas'
    );
    const data = rows.map(r => ({ ...r, valor: Number(r.valor) }));
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar dados de cadeias produtivas' });
  }
});

// POST /api/cadeias
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const { categoria, produto, local, nivel, variavel, unidade, valor } = req.body;
    if (!categoria || !produto || !local) {
      return res.status(400).json({ error: 'categoria, produto e local são obrigatórios' });
    }
    const [result] = await pool.query(
      `INSERT INTO cadeias_produtivas (categoria, produto, local, nivel, variavel, unidade, valor)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [categoria, produto, local, nivel || '', variavel || '', unidade || '', valor || 0]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar registro de cadeia produtiva' });
  }
});

// PUT /api/cadeias/:id
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { categoria, produto, local, nivel, variavel, unidade, valor } = req.body;
    await pool.query(
      `UPDATE cadeias_produtivas SET categoria=?, produto=?, local=?, nivel=?, variavel=?, unidade=?, valor=?
       WHERE id=?`,
      [categoria, produto, local, nivel || '', variavel || '', unidade || '', valor || 0, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar registro de cadeia produtiva' });
  }
});

// DELETE /api/cadeias/:id
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM cadeias_produtivas WHERE id=?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao excluir registro de cadeia produtiva' });
  }
});

module.exports = router;
