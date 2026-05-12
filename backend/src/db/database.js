/**
 * EasyBook Database Schema & Initialization
 * Uses better-sqlite3 for synchronous, fast SQLite access.
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || './data/easybook.db';
const dbDir = path.dirname(path.resolve(DB_PATH));
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const db = new Database(path.resolve(DB_PATH));

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Create Tables ──────────────────────────────────────────────────────────

db.exec(`
  -- Users (customers)
  CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,
    full_name   TEXT NOT NULL,
    email       TEXT UNIQUE NOT NULL,
    phone       TEXT,
    password    TEXT NOT NULL,
    avatar_url  TEXT,
    location    TEXT DEFAULT 'Takoradi, Ghana',
    role        TEXT DEFAULT 'customer' CHECK(role IN ('customer', 'business_owner', 'admin')),
    created_at  TEXT DEFAULT (datetime('now')),
    updated_at  TEXT DEFAULT (datetime('now'))
  );

  -- Categories
  CREATE TABLE IF NOT EXISTS categories (
    id          TEXT PRIMARY KEY,
    name        TEXT UNIQUE NOT NULL,
    icon        TEXT NOT NULL,
    sort_order  INTEGER DEFAULT 0
  );

  -- Businesses (salons/spas)
  CREATE TABLE IF NOT EXISTS businesses (
    id            TEXT PRIMARY KEY,
    owner_id      TEXT REFERENCES users(id),
    name          TEXT NOT NULL,
    description   TEXT,
    address       TEXT,
    city          TEXT DEFAULT 'Takoradi',
    region        TEXT DEFAULT 'Western Region',
    country       TEXT DEFAULT 'Ghana',
    phone         TEXT,
    website       TEXT,
    image_url     TEXT,
    gallery       TEXT DEFAULT '[]',
    rating        REAL DEFAULT 0,
    review_count  INTEGER DEFAULT 0,
    latitude      REAL,
    longitude     REAL,
    is_open       INTEGER DEFAULT 1,
    working_hours TEXT DEFAULT '[]',
    services_tags TEXT DEFAULT '[]',
    created_at    TEXT DEFAULT (datetime('now')),
    updated_at    TEXT DEFAULT (datetime('now'))
  );

  -- Specialists (work at a business)
  CREATE TABLE IF NOT EXISTS specialists (
    id            TEXT PRIMARY KEY,
    business_id   TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    service       TEXT NOT NULL,
    bio           TEXT,
    rating        REAL DEFAULT 0,
    review_count  INTEGER DEFAULT 0,
    image_url     TEXT,
    is_available  INTEGER DEFAULT 1,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  -- Service Packages
  CREATE TABLE IF NOT EXISTS packages (
    id            TEXT PRIMARY KEY,
    business_id   TEXT NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
    name          TEXT NOT NULL,
    description   TEXT,
    price         REAL NOT NULL,
    currency      TEXT DEFAULT 'GHS',
    duration_mins INTEGER NOT NULL,
    category_id   TEXT REFERENCES categories(id),
    is_active     INTEGER DEFAULT 1,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  -- Bookings
  CREATE TABLE IF NOT EXISTS bookings (
    id              TEXT PRIMARY KEY,
    user_id         TEXT NOT NULL REFERENCES users(id),
    business_id     TEXT NOT NULL REFERENCES businesses(id),
    specialist_id   TEXT REFERENCES specialists(id),
    package_id      TEXT REFERENCES packages(id),
    date            TEXT NOT NULL,
    time            TEXT NOT NULL,
    duration_mins   INTEGER DEFAULT 60,
    status          TEXT DEFAULT 'pending' CHECK(status IN ('pending','confirmed','in_progress','completed','cancelled')),
    notes           TEXT,
    total_price     REAL DEFAULT 0,
    currency        TEXT DEFAULT 'GHS',
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
  );

  -- Payments
  CREATE TABLE IF NOT EXISTS payments (
    id              TEXT PRIMARY KEY,
    booking_id      TEXT NOT NULL REFERENCES bookings(id),
    user_id         TEXT NOT NULL REFERENCES users(id),
    amount          REAL NOT NULL,
    currency        TEXT DEFAULT 'GHS',
    method          TEXT DEFAULT 'mobile_money' CHECK(method IN ('mobile_money','card','cash')),
    provider        TEXT,
    phone_number    TEXT,
    reference       TEXT UNIQUE,
    status          TEXT DEFAULT 'pending' CHECK(status IN ('pending','processing','completed','failed','refunded')),
    created_at      TEXT DEFAULT (datetime('now')),
    updated_at      TEXT DEFAULT (datetime('now'))
  );

  -- Reviews
  CREATE TABLE IF NOT EXISTS reviews (
    id            TEXT PRIMARY KEY,
    user_id       TEXT NOT NULL REFERENCES users(id),
    business_id   TEXT NOT NULL REFERENCES businesses(id),
    booking_id    TEXT REFERENCES bookings(id),
    rating        INTEGER NOT NULL CHECK(rating BETWEEN 1 AND 5),
    comment       TEXT,
    created_at    TEXT DEFAULT (datetime('now'))
  );

  -- Favourites
  CREATE TABLE IF NOT EXISTS favourites (
    user_id       TEXT NOT NULL REFERENCES users(id),
    business_id   TEXT NOT NULL REFERENCES businesses(id),
    created_at    TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, business_id)
  );

  -- Create indexes
  CREATE INDEX IF NOT EXISTS idx_businesses_city ON businesses(city);
  CREATE INDEX IF NOT EXISTS idx_specialists_business ON specialists(business_id);
  CREATE INDEX IF NOT EXISTS idx_packages_business ON packages(business_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
  CREATE INDEX IF NOT EXISTS idx_bookings_business ON bookings(business_id);
  CREATE INDEX IF NOT EXISTS idx_reviews_business ON reviews(business_id);
  CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
`);

module.exports = db;
