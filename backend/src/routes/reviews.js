/**
 * Review Routes
 */
const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db/database');
const { authMiddleware, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/business/:businessId', optionalAuth, (req, res) => {
  try {
    const reviews = db.prepare(`
      SELECT r.*, u.full_name, u.avatar_url
      FROM reviews r JOIN users u ON r.user_id = u.id
      WHERE r.business_id = ?
      ORDER BY r.created_at DESC LIMIT 50
    `).all(req.params.businessId);

    const stats = db.prepare(`
      SELECT COUNT(*) as total, AVG(rating) as average
      FROM reviews WHERE business_id = ?
    `).get(req.params.businessId);

    res.json({ reviews, stats: { total: stats.total, average: Math.round((stats.average || 0) * 10) / 10 } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

router.post('/', authMiddleware, (req, res) => {
  try {
    const { business_id, booking_id, rating, comment } = req.body;
    if (!business_id || !rating) return res.status(400).json({ error: 'Business ID and rating are required.' });
    if (rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be between 1 and 5.' });

    const id = uuid();
    db.prepare(`INSERT INTO reviews (id, user_id, business_id, booking_id, rating, comment) VALUES (?, ?, ?, ?, ?, ?)`).run(id, req.user.id, business_id, booking_id || null, rating, comment || null);

    const stats = db.prepare('SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE business_id = ?').get(business_id);
    db.prepare('UPDATE businesses SET rating = ?, review_count = ? WHERE id = ?').run(Math.round(stats.avg * 10) / 10, stats.cnt, business_id);

    const review = db.prepare('SELECT r.*, u.full_name, u.avatar_url FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.id = ?').get(id);
    res.status(201).json({ review });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review.' });
  }
});

module.exports = router;
