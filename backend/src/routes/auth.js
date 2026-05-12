/**
 * Auth Routes — POST /api/auth/signup, /api/auth/signin, GET /api/auth/me
 */
const express = require('express');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const db = require('../db/database');
const { generateToken, authMiddleware } = require('../middleware/auth');

const router = express.Router();

// ─── Sign Up ────────────────────────────────────────────────────────────────

router.post('/signup', (req, res) => {
  try {
    const { full_name, email, phone, password, role } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({ error: 'Full name, email and password are required.' });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }

    // Password strength
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Phone validation (Ghana format)
    if (phone) {
      const phoneRegex = /^(\+233|0)(2[0-9]|5[0-9])[0-9]{7}$/;
      if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
        return res.status(400).json({ error: 'Please enter a valid Ghana phone number.' });
      }
    }

    // Check existing user
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const id = uuid();
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userRole = role === 'business_owner' ? 'business_owner' : 'customer';

    db.prepare(
      `INSERT INTO users (id, full_name, email, phone, password, role) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(id, full_name, email.toLowerCase(), phone || null, hashedPassword, userRole);

    const user = db.prepare('SELECT id, full_name, email, phone, role, avatar_url, location, created_at FROM users WHERE id = ?').get(id);
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ─── Sign In ────────────────────────────────────────────────────────────────

router.post('/signin', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const valid = bcrypt.compareSync(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Don't send password back
    const { password: _, ...safeUser } = user;
    const token = generateToken(safeUser);

    res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
});

// ─── Get Current User ───────────────────────────────────────────────────────

router.get('/me', authMiddleware, (req, res) => {
  const user = db.prepare(
    'SELECT id, full_name, email, phone, role, avatar_url, location, created_at, updated_at FROM users WHERE id = ?'
  ).get(req.user.id);

  if (!user) return res.status(404).json({ error: 'User not found.' });
  res.json({ user });
});

// ─── Update Profile ─────────────────────────────────────────────────────────

router.put('/me', authMiddleware, (req, res) => {
  try {
    const { full_name, phone, avatar_url, location } = req.body;

    db.prepare(
      `UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), avatar_url = COALESCE(?, avatar_url), location = COALESCE(?, location), updated_at = datetime('now') WHERE id = ?`
    ).run(full_name || null, phone || null, avatar_url || null, location || null, req.user.id);

    const user = db.prepare(
      'SELECT id, full_name, email, phone, role, avatar_url, location, created_at, updated_at FROM users WHERE id = ?'
    ).get(req.user.id);

    res.json({ user });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

module.exports = router;
