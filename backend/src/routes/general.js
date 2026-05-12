/**
 * Category & Specialist Routes
 */
const express = require('express');
const db = require('../db/database');

const router = express.Router();

router.get('/categories', (_req, res) => {
  try {
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
    res.json({ categories });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

router.get('/specialists', (req, res) => {
  try {
    const { business_id, limit = 20 } = req.query;
    let sql = 'SELECT s.*, b.name as business_name FROM specialists s JOIN businesses b ON s.business_id = b.id WHERE s.is_available = 1';
    const params = [];

    if (business_id) {
      sql += ' AND s.business_id = ?';
      params.push(business_id);
    }
    sql += ' ORDER BY s.rating DESC LIMIT ?';
    params.push(Number(limit));

    const specialists = db.prepare(sql).all(...params);
    res.json({ specialists });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch specialists.' });
  }
});

router.get('/favourites', require('../middleware/auth').authMiddleware, (req, res) => {
  try {
    const favourites = db.prepare(`
      SELECT b.* FROM favourites f JOIN businesses b ON f.business_id = b.id
      WHERE f.user_id = ? ORDER BY f.created_at DESC
    `).all(req.user.id);

    const result = favourites.map(b => ({
      ...b,
      gallery: JSON.parse(b.gallery || '[]'),
      working_hours: JSON.parse(b.working_hours || '[]'),
      services_tags: JSON.parse(b.services_tags || '[]'),
    }));

    res.json({ favourites: result });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch favourites.' });
  }
});

router.post('/favourites/:businessId', require('../middleware/auth').authMiddleware, (req, res) => {
  try {
    const existing = db.prepare('SELECT 1 FROM favourites WHERE user_id = ? AND business_id = ?').get(req.user.id, req.params.businessId);
    if (existing) {
      db.prepare('DELETE FROM favourites WHERE user_id = ? AND business_id = ?').run(req.user.id, req.params.businessId);
      return res.json({ favourited: false });
    }
    db.prepare('INSERT INTO favourites (user_id, business_id) VALUES (?, ?)').run(req.user.id, req.params.businessId);
    res.json({ favourited: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to toggle favourite.' });
  }
});

module.exports = router;
