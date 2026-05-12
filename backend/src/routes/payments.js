/**
 * Payment Routes
 */
const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db/database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
router.use(authMiddleware);

// ─── Initiate Payment ───────────────────────────────────────────────────────

router.post('/', (req, res) => {
  try {
    const { booking_id, method, provider, phone_number } = req.body;

    if (!booking_id || !method) {
      return res.status(400).json({ error: 'Booking ID and payment method are required.' });
    }

    // Verify booking belongs to user
    const booking = db.prepare('SELECT * FROM bookings WHERE id = ? AND user_id = ?').get(booking_id, req.user.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found.' });

    // Check no existing completed payment
    const existingPayment = db.prepare("SELECT * FROM payments WHERE booking_id = ? AND status = 'completed'").get(booking_id);
    if (existingPayment) return res.status(409).json({ error: 'This booking has already been paid.' });

    const id = uuid();
    const reference = `EB-${Date.now()}-${id.substring(0, 8)}`;

    db.prepare(`
      INSERT INTO payments (id, booking_id, user_id, amount, method, provider, phone_number, reference, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'processing')
    `).run(id, booking_id, req.user.id, booking.total_price, method, provider || null, phone_number || null, reference);

    // Simulate payment processing — in production, integrate with Paystack/MTN MoMo
    setTimeout(() => {
      try {
        db.prepare(`UPDATE payments SET status = 'completed', updated_at = datetime('now') WHERE id = ?`).run(id);
        db.prepare(`UPDATE bookings SET status = 'confirmed', updated_at = datetime('now') WHERE id = ?`).run(booking_id);
      } catch (e) {
        console.error('Payment completion error:', e);
      }
    }, 2000);

    const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
    res.status(201).json({ payment, message: 'Payment is being processed.' });
  } catch (err) {
    console.error('Create payment error:', err);
    res.status(500).json({ error: 'Failed to initiate payment.' });
  }
});

// ─── Get Payment by Booking ─────────────────────────────────────────────────

router.get('/booking/:bookingId', (req, res) => {
  try {
    const payment = db.prepare(
      'SELECT * FROM payments WHERE booking_id = ? AND user_id = ? ORDER BY created_at DESC LIMIT 1'
    ).get(req.params.bookingId, req.user.id);

    if (!payment) return res.status(404).json({ error: 'Payment not found.' });
    res.json({ payment });
  } catch (err) {
    console.error('Get payment error:', err);
    res.status(500).json({ error: 'Failed to fetch payment.' });
  }
});

// ─── List User Payments ─────────────────────────────────────────────────────

router.get('/', (req, res) => {
  try {
    const payments = db.prepare(`
      SELECT p.*, b.date as booking_date, biz.name as business_name
      FROM payments p
      JOIN bookings b ON p.booking_id = b.id
      JOIN businesses biz ON b.business_id = biz.id
      WHERE p.user_id = ?
      ORDER BY p.created_at DESC
    `).all(req.user.id);

    res.json({ payments });
  } catch (err) {
    console.error('List payments error:', err);
    res.status(500).json({ error: 'Failed to fetch payments.' });
  }
});

module.exports = router;
