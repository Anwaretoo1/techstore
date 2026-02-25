require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { query, pool } = require('../config/database');

/**
 * Seed the database with admin user.
 * Run: node src/utils/seed.js
 */
async function seed() {
  console.log('🌱 Seeding database...\n');

  try {
    // Create admin user
    const email    = process.env.ADMIN_EMAIL    || 'admin@techstore-syria.com';
    const password = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const hash     = await bcrypt.hash(password, 12);

    await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role)
       VALUES ($1, $2, 'Ahmad', 'Admin', 'admin')
       ON CONFLICT (email) DO UPDATE SET password_hash = $2`,
      [email, hash]
    );
    console.log(`✅ Admin user: ${email}`);
    console.log(`   Password: ${password}\n`);
    console.log('⚠️  IMPORTANT: Change the admin password after first login!\n');

    console.log('✅ Database seeded successfully!');
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
