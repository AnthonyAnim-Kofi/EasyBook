/**
 * Business Routes — GET /api/businesses, GET /api/businesses/:id
 */
const express = require('express');
const db = require('../db/database');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router();

// ─── List / Search Businesses ───────────────────────────────────────────────

router.get('/', optionalAuth, (req, res) => {
  try {
    const { q, city, category, sort, limit = 20, offset = 0 } = req.query;

    let sql = `SELECT b.*, 
      (SELECT COUNT(*) FROM reviews WHERE business_id = b.id) as total_reviews
      FROM businesses b WHERE 1=1`;
    const params = [];

    if (q) {
      sql += ` AND (b.name LIKE ? OR b.address LIKE ? OR b.description LIKE ?)`;
      const term = `%${q}%`;
      params.push(term, term, term);
    }

    if (city) {
      sql += ` AND b.city = ?`;
      params.push(city);
    }

    if (category) {
      sql += ` AND b.services_tags LIKE ?`;
      params.push(`%${category}%`);
    }

    // Sort
    if (sort === 'rating') {
      sql += ` ORDER BY b.rating DESC`;
    } else if (sort === 'reviews') {
      sql += ` ORDER BY b.review_count DESC`;
    } else {
      sql += ` ORDER BY b.created_at DESC`;
    }

    sql += ` LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const businesses = db.prepare(sql).all(...params);

    // Parse JSON fields
    const result = businesses.map(b => ({
      ...b,
      gallery: JSON.parse(b.gallery || '[]'),
      working_hours: JSON.parse(b.working_hours || '[]'),
      services_tags: JSON.parse(b.services_tags || '[]'),
    }));

    res.json({ businesses: result, total: result.length });
  } catch (err) {
    console.error('List businesses error:', err);
    res.status(500).json({ error: 'Failed to fetch businesses.' });
  }
});

// ─── Get Business Detail ────────────────────────────────────────────────────

router.get('/:id', optionalAuth, (req, res) => {
  try {
    const business = db.prepare('SELECT * FROM businesses WHERE id = ?').get(req.params.id);
    if (!business) return res.status(404).json({ error: 'Business not found.' });

    // Get specialists
    const specialists = db.prepare('SELECT * FROM specialists WHERE business_id = ? AND is_available = 1').all(req.params.id);

    // Get packages
    const packages = db.prepare('SELECT * FROM packages WHERE business_id = ? AND is_active = 1').all(req.params.id);

    // Get reviews with user info
    const reviews = db.prepare(`
      SELECT r.*, u.full_name, u.avatar_url 
      FROM reviews r JOIN users u ON r.user_id = u.id 
      WHERE r.business_id = ? 
      ORDER BY r.created_at DESC LIMIT 20
    `).all(req.params.id);

    // Check if user has favourited this business
    let is_favourited = false;
    if (req.user) {
      const fav = db.prepare('SELECT 1 FROM favourites WHERE user_id = ? AND business_id = ?').get(req.user.id, req.params.id);
      is_favourited = !!fav;
    }

    res.json({
      business: {
        ...business,
        gallery: JSON.parse(business.gallery || '[]'),
        working_hours: JSON.parse(business.working_hours || '[]'),
        services_tags: JSON.parse(business.services_tags || '[]'),
      },
      specialists,
      packages,
      reviews,
      is_favourited,
    });
  } catch (err) {
    console.error('Get business error:', err);
    res.status(500).json({ error: 'Failed to fetch business.' });
  }
});

module.exports = router;
