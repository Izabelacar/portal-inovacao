const express = require('express');
const router = express.Router();
const requireAdminAuth = require('../middleware/adminAuth');

// GET /api/admin/verify -> usado pela tela de login do painel /admin
// para conferir se a senha digitada está correta, antes de liberar a interface.
router.get('/verify', requireAdminAuth, (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
