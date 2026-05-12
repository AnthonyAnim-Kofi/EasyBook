/**
 * EasyBook Seed Data
 * Populates the database with realistic Ghana-based salon/spa data.
 */
require('dotenv').config();
const db = require('./database');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');

const hash = (pw) => bcrypt.hashSync(pw, 10);

// ─── Clear existing data ────────────────────────────────────────────────────

db.exec(`
  DELETE FROM favourites;
  DELETE FROM reviews;
  DELETE FROM payments;
  DELETE FROM bookings;
  DELETE FROM packages;
  DELETE FROM specialists;
  DELETE FROM businesses;
  DELETE FROM categories;
  DELETE FROM users;
`);

// ─── Users ──────────────────────────────────────────────────────────────────

const users = [
  { id: uuid(), full_name: 'Ellay Mensah', email: 'ellay@example.com', phone: '+233244111222', password: hash('password123'), role: 'customer', location: 'Takoradi, Ghana' },
  { id: uuid(), full_name: 'Kwame Asante', email: 'kwame@example.com', phone: '+233244333444', password: hash('password123'), role: 'customer', location: 'Accra, Ghana' },
  { id: uuid(), full_name: 'Abena Mensah', email: 'abena@example.com', phone: '+233244555666', password: hash('password123'), role: 'customer', location: 'Takoradi, Ghana' },
  { id: uuid(), full_name: 'Ama Owusu', email: 'ama@example.com', phone: '+233244777888', password: hash('password123'), role: 'customer', location: 'Kumasi, Ghana' },
  { id: uuid(), full_name: 'Yank Boateng', email: 'yank@yanksspa.com', phone: '+233244123456', password: hash('password123'), role: 'business_owner', location: 'Takoradi, Ghana' },
  { id: uuid(), full_name: 'Magnus Addo', email: 'magnus@magnusspa.com', phone: '+233244654321', password: hash('password123'), role: 'business_owner', location: 'Accra, Ghana' },
  { id: uuid(), full_name: 'Sister Yaa', email: 'yaa@yaaspa.com', phone: '+233244789012', password: hash('password123'), role: 'business_owner', location: 'Kumasi, Ghana' },
  { id: uuid(), full_name: 'Kofi Ansah', email: 'kofi@kofispa.com', phone: '+233244345678', password: hash('password123'), role: 'business_owner', location: 'Accra, Ghana' },
];

const insertUser = db.prepare(`INSERT INTO users (id, full_name, email, phone, password, role, location) VALUES (?, ?, ?, ?, ?, ?, ?)`);
users.forEach(u => insertUser.run(u.id, u.full_name, u.email, u.phone, u.password, u.role, u.location));

// ─── Categories ─────────────────────────────────────────────────────────────

const categories = [
  { id: uuid(), name: 'Haircut', icon: 'Scissors', sort_order: 1 },
  { id: uuid(), name: 'Make up', icon: 'Sparkles', sort_order: 2 },
  { id: uuid(), name: 'Manicure', icon: 'Hand', sort_order: 3 },
  { id: uuid(), name: 'Spa', icon: 'Leaf', sort_order: 4 },
  { id: uuid(), name: 'Facial', icon: 'Sparkles', sort_order: 5 },
  { id: uuid(), name: 'Massage', icon: 'Heart', sort_order: 6 },
  { id: uuid(), name: 'Barber', icon: 'Scissors', sort_order: 7 },
  { id: uuid(), name: 'Pedicure', icon: 'Footprints', sort_order: 8 },
];

const insertCat = db.prepare(`INSERT INTO categories (id, name, icon, sort_order) VALUES (?, ?, ?, ?)`);
categories.forEach(c => insertCat.run(c.id, c.name, c.icon, c.sort_order));

// ─── Businesses ─────────────────────────────────────────────────────────────

const businesses = [
  {
    id: uuid(), owner_id: users[4].id,
    name: 'Yanks Spa and Salon',
    description: 'Yanks Spa and Salon is a premier beauty destination in Takoradi, Ghana. We offer a wide range of services including hair styling, manicures, pedicures, facials, and full body spa treatments. Our team of experienced specialists are dedicated to making you look and feel your best.',
    address: '14 Liberation Road, Takoradi, Ghana', city: 'Takoradi', region: 'Western Region',
    phone: '+233244123456', website: 'www.yanksspa.com',
    image_url: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
    ]),
    rating: 3.0, review_count: 1000,
    latitude: 4.8956, longitude: -1.7557,
    working_hours: JSON.stringify([
      { day: 'Monday – Friday', hours: '8:00 AM – 7:00 PM' },
      { day: 'Saturday', hours: '9:00 AM – 6:00 PM' },
      { day: 'Sunday', hours: '10:00 AM – 4:00 PM' },
    ]),
    services_tags: JSON.stringify(['Haircut', 'Facial', 'Manicure', 'Massage', 'Spa']),
  },
  {
    id: uuid(), owner_id: users[5].id,
    name: 'Magnus Spa',
    description: 'A luxury spa experience in the heart of Accra. We specialise in premium body treatments, aromatherapy, and modern hair styling.',
    address: '22 Oxford Street, Osu, Accra', city: 'Accra', region: 'Greater Accra',
    phone: '+233244654321', website: 'www.magnusspa.com',
    image_url: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=600',
    gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400',
    ]),
    rating: 4.8, review_count: 820,
    latitude: 5.5578, longitude: -0.1870,
    working_hours: JSON.stringify([
      { day: 'Monday – Friday', hours: '9:00 AM – 8:00 PM' },
      { day: 'Saturday', hours: '9:00 AM – 7:00 PM' },
      { day: 'Sunday', hours: 'Closed' },
    ]),
    services_tags: JSON.stringify(['Spa', 'Massage', 'Facial', 'Haircut']),
  },
  {
    id: uuid(), owner_id: users[6].id,
    name: "Sister Yaa's Spa",
    description: 'Traditional and modern beauty treatments in Kumasi. Specialising in natural hair care and organic facials.',
    address: '5 Prempeh II Street, Kumasi', city: 'Kumasi', region: 'Ashanti',
    phone: '+233244789012', website: 'www.sisteryaaspa.com',
    image_url: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600',
    gallery: JSON.stringify([]),
    rating: 4.5, review_count: 340,
    latitude: 6.6885, longitude: -1.6244,
    working_hours: JSON.stringify([
      { day: 'Monday – Saturday', hours: '8:00 AM – 6:00 PM' },
      { day: 'Sunday', hours: 'Closed' },
    ]),
    services_tags: JSON.stringify(['Haircut', 'Facial', 'Manicure', 'Pedicure']),
  },
  {
    id: uuid(), owner_id: users[7].id,
    name: "Kofi's Spa Kwabenya",
    description: 'Modern barbershop and spa for men and women, conveniently located in Kwabenya.',
    address: '12 Kwabenya Road, Accra', city: 'Accra', region: 'Greater Accra',
    phone: '+233244345678', website: 'www.kofispa.com',
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600',
    gallery: JSON.stringify([]),
    rating: 4.2, review_count: 215,
    latitude: 5.6650, longitude: -0.2186,
    working_hours: JSON.stringify([
      { day: 'Monday – Friday', hours: '7:00 AM – 8:00 PM' },
      { day: 'Saturday – Sunday', hours: '8:00 AM – 6:00 PM' },
    ]),
    services_tags: JSON.stringify(['Barber', 'Haircut', 'Facial', 'Spa']),
  },
  {
    id: uuid(), owner_id: users[4].id,
    name: 'Elite Cuts Barber',
    description: 'Premium barber shop with modern fades, traditional cuts, and grooming services.',
    address: '8 Market Circle, Takoradi', city: 'Takoradi', region: 'Western Region',
    phone: '+233244111999', website: '',
    image_url: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600',
    gallery: JSON.stringify([]),
    rating: 4.6, review_count: 430,
    latitude: 4.8901, longitude: -1.7523,
    working_hours: JSON.stringify([
      { day: 'Monday – Saturday', hours: '7:00 AM – 9:00 PM' },
      { day: 'Sunday', hours: '9:00 AM – 5:00 PM' },
    ]),
    services_tags: JSON.stringify(['Barber', 'Haircut']),
  },
];

const insertBiz = db.prepare(`INSERT INTO businesses (id, owner_id, name, description, address, city, region, phone, website, image_url, gallery, rating, review_count, latitude, longitude, working_hours, services_tags) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
businesses.forEach(b => insertBiz.run(b.id, b.owner_id, b.name, b.description, b.address, b.city, b.region, b.phone, b.website, b.image_url, b.gallery, b.rating, b.review_count, b.latitude, b.longitude, b.working_hours, b.services_tags));

// ─── Specialists ────────────────────────────────────────────────────────────

const specialists = [
  // Yanks Spa
  { id: uuid(), business_id: businesses[0].id, name: 'Lily', service: 'Hair Stylist', rating: 4.9, image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300' },
  { id: uuid(), business_id: businesses[0].id, name: 'Jayden', service: 'Barber', rating: 4.8, image_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300' },
  { id: uuid(), business_id: businesses[0].id, name: 'Alex', service: 'Nail Artist', rating: 4.7, image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300' },
  { id: uuid(), business_id: businesses[0].id, name: 'Ava', service: 'Spa Expert', rating: 4.8, image_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300' },
  // Magnus Spa
  { id: uuid(), business_id: businesses[1].id, name: 'Serena', service: 'Massage Therapist', rating: 4.9, image_url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=300' },
  { id: uuid(), business_id: businesses[1].id, name: 'David', service: 'Hair Stylist', rating: 4.6, image_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300' },
  // Sister Yaa's
  { id: uuid(), business_id: businesses[2].id, name: 'Grace', service: 'Natural Hair Specialist', rating: 4.8, image_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300' },
  // Kofi's Spa
  { id: uuid(), business_id: businesses[3].id, name: 'Kofi Jr', service: 'Barber', rating: 4.5, image_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300' },
  // Elite Cuts
  { id: uuid(), business_id: businesses[4].id, name: 'Prince', service: 'Master Barber', rating: 4.7, image_url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=300' },
];

const insertSpec = db.prepare(`INSERT INTO specialists (id, business_id, name, service, rating, image_url) VALUES (?, ?, ?, ?, ?, ?)`);
specialists.forEach(s => insertSpec.run(s.id, s.business_id, s.name, s.service, s.rating, s.image_url));

// ─── Packages ───────────────────────────────────────────────────────────────

const pkgs = [
  // Yanks Spa
  { id: uuid(), business_id: businesses[0].id, name: 'Basic Facial', description: 'Deep cleanse, exfoliation & moisturising.', price: 80, duration_mins: 45, category_id: categories[4].id },
  { id: uuid(), business_id: businesses[0].id, name: 'Full Hair Package', description: 'Wash, cut, blow dry & style.', price: 150, duration_mins: 90, category_id: categories[0].id },
  { id: uuid(), business_id: businesses[0].id, name: 'Luxury Spa Day', description: 'Full body massage, facial & manicure.', price: 320, duration_mins: 180, category_id: categories[3].id },
  { id: uuid(), business_id: businesses[0].id, name: 'Manicure & Pedicure', description: 'Full nail care with polish.', price: 120, duration_mins: 60, category_id: categories[2].id },
  // Magnus Spa
  { id: uuid(), business_id: businesses[1].id, name: 'Hot Stone Massage', description: 'Relaxing full body hot stone therapy.', price: 200, duration_mins: 60, category_id: categories[5].id },
  { id: uuid(), business_id: businesses[1].id, name: 'Premium Haircut', description: 'Consultation, wash, cut and style.', price: 100, duration_mins: 45, category_id: categories[0].id },
  // Elite Cuts
  { id: uuid(), business_id: businesses[4].id, name: 'Fresh Fade', description: 'Modern fade with lineup.', price: 50, duration_mins: 30, category_id: categories[6].id },
  { id: uuid(), business_id: businesses[4].id, name: 'Beard Grooming', description: 'Shape, trim and hot towel.', price: 35, duration_mins: 20, category_id: categories[6].id },
];

const insertPkg = db.prepare(`INSERT INTO packages (id, business_id, name, description, price, duration_mins, category_id) VALUES (?, ?, ?, ?, ?, ?, ?)`);
pkgs.forEach(p => insertPkg.run(p.id, p.business_id, p.name, p.description, p.price, p.duration_mins, p.category_id));

// ─── Reviews ────────────────────────────────────────────────────────────────

const revs = [
  { id: uuid(), user_id: users[2].id, business_id: businesses[0].id, rating: 5, comment: 'Amazing experience! My hair looks absolutely stunning. Will definitely be back.' },
  { id: uuid(), user_id: users[1].id, business_id: businesses[0].id, rating: 4, comment: 'Really professional staff and clean environment. The facial was so relaxing!' },
  { id: uuid(), user_id: users[3].id, business_id: businesses[0].id, rating: 5, comment: 'Best spa experience in Takoradi. Lily is a gem — so talented and friendly.' },
  { id: uuid(), user_id: users[0].id, business_id: businesses[1].id, rating: 5, comment: 'Magnus Spa never disappoints. The hot stone massage was heavenly.' },
  { id: uuid(), user_id: users[2].id, business_id: businesses[1].id, rating: 4, comment: 'Great ambiance and skilled therapists. Slightly pricey but worth it.' },
];

const insertRev = db.prepare(`INSERT INTO reviews (id, user_id, business_id, rating, comment) VALUES (?, ?, ?, ?, ?)`);
revs.forEach(r => insertRev.run(r.id, r.user_id, r.business_id, r.rating, r.comment));

console.log('✅ Database seeded successfully!');
console.log(`   ${users.length} users`);
console.log(`   ${categories.length} categories`);
console.log(`   ${businesses.length} businesses`);
console.log(`   ${specialists.length} specialists`);
console.log(`   ${pkgs.length} packages`);
console.log(`   ${revs.length} reviews`);

process.exit(0);
