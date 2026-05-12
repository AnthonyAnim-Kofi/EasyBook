/**
 * Booking Routes
 */
const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// All booking routes require auth
router.use(authMiddleware);

// ─── Create Booking ─────────────────────────────────────────────────────────

router.post('/', (req, res) => {
  try {
    const { business_id, specialist_id, package_id, date, time, notes } = req.body;

    if (!business_id || !date || !time) {
      return res.status(400).json({ error: 'Business, date and time are required.' });
    }

    // Verify business exists
    const business = db.prepare('SELECT id, name FROM businesses WHERE id = ?').get(business_id);
    if (!business) return res.status(404).json({ error: 'Business not found.' });

    // Calculate total price from package
    let total_price = 0;
    let duration_mins = 60;
    if (package_id) {
      const pkg = db.prepare('SELECT price, duration_mins FROM packages WHERE id = ?').get(package_id);
      if (pkg) {
        total_price = pkg.price;
        duration_mins = pkg.duration_mins;
      }
    }

    const id = uuid();
    db.prepare(`
      INSERT INTO bookings (id, user_id, business_id, specialist_id, package_id, date, time, duration_mins, total_price, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, req.user.id, business_id, specialist_id || null, package_id || null, date, time, duration_mins, total_price, notes || null);

    const booking = db.prepare(`
      SELECT b.*, biz.name as business_name, s.name as specialist_name, p.name as package_name
      FROM bookings b
      LEFT JOIN businesses biz ON b.business_id = biz.id
      LEFT JOIN specialists s ON b.specialist_id = s.id
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.id = ?
    `).get(id);

    res.status(201).json({ booking });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Failed to create booking.' });
  }
});

// ─── List User Bookings ─────────────────────────────────────────────────────

router.get('/', (req, res) => {
  try {
    const { status, limit = 20, offset = 0 } = req.query;

    let sql = `
      SELECT b.*, biz.name as business_name, biz.image_url as business_image,
        s.name as specialist_name, p.name as package_name
      FROM bookings b
      LEFT JOIN businesses biz ON b.business_id = biz.id
      LEFT JOIN specialists s ON b.specialist_id = s.id
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.user_id = ?`;
    const params = [req.user.id];

    if (status) {
      sql += ` AND b.status = ?`;
      params.push(status);
    }

    sql += ` ORDER BY b.date DESC, b.time DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));

    const bookings = db.prepare(sql).all(...params);
    res.json({ bookings });
  } catch (err) {
    console.error('List bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

// ─── Get Booking Detail ─────────────────────────────────────────────────────

router.get('/:id', (req, res) => {
  try {
    const booking = db.prepare(`
      SELECT b.*, biz.name as business_name, biz.image_url as business_image, biz.address as business_address,
        s.name as specialist_name, s.image_url as specialist_image,
        p.name as package_name, p.description as package_description
      FROM bookings b
      LEFT JOIN businesses biz ON b.business_id = biz.id
      LEFT JOIN specialists s ON b.specialist_id = s.id
      LEFT JOIN packages p ON b.package_id = p.id
      WHERE b.id = ? AND b.user_id = ?
    `).get(req.params.id, req.user.id);

    if (!booking) return res.status(404).json({ error: 'Booking not found.' });
    res.json({ booking });
  } catch (err) {
    console.error('Get booking error:', err);
    res.status(500).json({ error: 'Failed to fetch booking.' });
  }
});

// ─── Update Booking Status ──────────────────────────────────────────────────

router.patch('/:id', (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });
    }

    const existing = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(req.params.id, req.user.id);
    if (!existing) return res.status(404).json({ error: 'Booking not found.' });

    db.prepare(`UPDATE bookings SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);

    const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
    res.json({ booking: updated });
  } catch (err) {
    console.error('Update booking error:', err);
    res.status(500).json({ error: 'Failed to update booking.' });
  }
});

module.exports = router;
