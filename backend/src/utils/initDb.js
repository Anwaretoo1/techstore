/**
 * initDb.js — Create SQLite schema and seed data using sql.js.
 * Runs automatically on first startup if DB is empty.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const bcrypt = require('bcryptjs');
const { getDb, saveDb } = require('../config/database');

function initSchema(db) {
  db.exec(`
    -- ─── Users ──────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      email         TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      phone         TEXT,
      role          TEXT NOT NULL DEFAULT 'customer',
      is_active     INTEGER NOT NULL DEFAULT 1,
      created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ─── Categories ─────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS categories (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      name        TEXT NOT NULL,
      name_ar     TEXT NOT NULL,
      slug        TEXT NOT NULL UNIQUE,
      description TEXT,
      image       TEXT,
      parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0,
      created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ─── Products ───────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS products (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      name           TEXT NOT NULL,
      name_ar        TEXT NOT NULL,
      description    TEXT,
      description_ar TEXT,
      price          REAL NOT NULL,
      sale_price     REAL,
      sku            TEXT NOT NULL UNIQUE,
      stock          INTEGER NOT NULL DEFAULT 0,
      category_id    INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      brand          TEXT,
      rating         REAL NOT NULL DEFAULT 0,
      review_count   INTEGER NOT NULL DEFAULT 0,
      is_featured    INTEGER NOT NULL DEFAULT 0,
      is_active      INTEGER NOT NULL DEFAULT 1,
      tags           TEXT NOT NULL DEFAULT '[]',
      created_at     DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at     DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ─── Product Images ─────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS product_images (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url         TEXT NOT NULL,
      alt         TEXT,
      is_primary  INTEGER NOT NULL DEFAULT 0,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );

    -- ─── Product Specifications ─────────────────────────────────
    CREATE TABLE IF NOT EXISTS product_specifications (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      key         TEXT NOT NULL,
      key_ar      TEXT NOT NULL,
      value       TEXT NOT NULL,
      value_ar    TEXT NOT NULL,
      sort_order  INTEGER NOT NULL DEFAULT 0
    );

    -- ─── Orders ─────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS orders (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number        TEXT NOT NULL UNIQUE,
      user_id             INTEGER NOT NULL REFERENCES users(id),
      status              TEXT NOT NULL DEFAULT 'pending',
      payment_method      TEXT NOT NULL,
      payment_status      TEXT NOT NULL DEFAULT 'pending',
      subtotal            REAL NOT NULL DEFAULT 0,
      shipping_cost       REAL NOT NULL DEFAULT 0,
      discount            REAL NOT NULL DEFAULT 0,
      total               REAL NOT NULL DEFAULT 0,
      notes               TEXT,
      coupon_code         TEXT,
      shipping_full_name  TEXT,
      shipping_phone      TEXT,
      shipping_city       TEXT,
      shipping_area       TEXT,
      shipping_street     TEXT,
      shipping_notes      TEXT,
      created_at          DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at          DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- ─── Order Items ────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS order_items (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id      INTEGER REFERENCES products(id) ON DELETE SET NULL,
      product_name    TEXT NOT NULL,
      product_name_ar TEXT NOT NULL,
      quantity        INTEGER NOT NULL,
      unit_price      REAL NOT NULL,
      total_price     REAL NOT NULL
    );

    -- ─── Coupons ────────────────────────────────────────────────
    CREATE TABLE IF NOT EXISTS coupons (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      code            TEXT NOT NULL UNIQUE,
      discount_type   TEXT NOT NULL DEFAULT 'fixed',
      discount_value  REAL NOT NULL,
      min_order_value REAL DEFAULT 0,
      usage_limit     INTEGER,
      used_count      INTEGER NOT NULL DEFAULT 0,
      is_active       INTEGER NOT NULL DEFAULT 1,
      expires_at      DATETIME,
      created_at      DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function dbGetOne(db, sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const row = stmt.step() ? stmt.getAsObject() : null;
  stmt.free();
  return row;
}

function dbRun(db, sql, params = []) {
  db.run(sql, params);
  const result = db.exec('SELECT last_insert_rowid()');
  return result[0]?.values[0][0] ?? null;
}

function seedData(db, adminHash) {
  // ─── Admin user ──────────────────────────────────────────────
  dbRun(db,
    `INSERT OR IGNORE INTO users (email, password_hash, first_name, last_name, phone, role)
     VALUES (?, ?, 'Ahmad', 'Admin', '+963112345678', 'admin')`,
    ['admin@techstore-syria.com', adminHash]
  );

  // ─── Categories ─────────────────────────────────────────────
  const cats = [
    ['Laptops',     'لابتوبات',  'laptops',     1],
    ['Desktops',    'ديسكتوب',   'desktops',    2],
    ['Monitors',    'شاشات',     'monitors',    3],
    ['Components',  'مكونات',    'components',  4],
    ['Storage',     'التخزين',   'storage',     5],
    ['Networking',  'الشبكات',   'networking',  6],
    ['Peripherals', 'ملحقات',    'accessories', 7],
    ['Gaming',      'جيمينج',    'gaming',      8],
  ];
  for (const [n, a, s, o] of cats) {
    dbRun(db, 'INSERT OR IGNORE INTO categories (name, name_ar, slug, sort_order) VALUES (?, ?, ?, ?)', [n, a, s, o]);
  }

  // ─── Helper: category id by slug ────────────────────────────
  const catId = (slug) => dbGetOne(db, 'SELECT id FROM categories WHERE slug = ?', [slug])?.id;

  // ─── Products ────────────────────────────────────────────────
  const products = [
    // Laptops
    {
      name: 'ASUS VivoBook 15 - Intel Core i5 12th Gen',
      name_ar: 'لابتوب أسوس فيفو بوك 15 - إنتل كور i5',
      desc: 'Powerful everyday laptop with Intel Core i5-1235U, 8GB RAM, 512GB SSD.',
      desc_ar: 'لابتوب مثالي للاستخدام اليومي بمعالج إنتل كور i5 الجيل الثاني عشر، ذاكرة 8 جيجابايت وتخزين 512 جيجابايت.',
      price: 3500000, sale: 3200000, sku: 'ASUS-VB15-I5-8-512', stock: 15,
      cat: 'laptops', brand: 'ASUS', rating: 4.5, reviews: 28, featured: 1,
      tags: ['لابتوب','أسوس','i5','طالب','مكتب'],
      specs: [
        ['Processor','المعالج','Intel Core i5-1235U','إنتل كور i5-1235U'],
        ['RAM','الذاكرة','8GB DDR4','8 جيجابايت DDR4'],
        ['Storage','التخزين','512GB NVMe SSD','512 جيجابايت SSD'],
        ['Display','الشاشة','15.6" FHD IPS 60Hz','15.6 بوصة FHD IPS'],
        ['Battery','البطارية','42Wh, ~7 hours','42 واط ساعة'],
        ['OS','نظام التشغيل','Windows 11 Home','ويندوز 11 هوم'],
      ],
    },
    {
      name: 'HP Victus 16 Gaming - RTX 3060',
      name_ar: 'لابتوب HP فيكتوس جيمينج - RTX 3060',
      desc: 'Gaming laptop with AMD Ryzen 7 6800H, 16GB DDR5, NVIDIA RTX 3060, 144Hz display.',
      desc_ar: 'لابتوب جيمينج احترافي بمعالج Ryzen 7، كرت شاشة RTX 3060 وشاشة 144Hz.',
      price: 8500000, sale: null, sku: 'HP-VIC16-R7-16-3060', stock: 8,
      cat: 'laptops', brand: 'HP', rating: 4.7, reviews: 45, featured: 1,
      tags: ['لابتوب جيمينج','HP','RTX 3060','Ryzen 7'],
      specs: [
        ['Processor','المعالج','AMD Ryzen 7 6800H','AMD Ryzen 7 6800H'],
        ['GPU','كرت الشاشة','NVIDIA RTX 3060 6GB','RTX 3060 6 جيجابايت'],
        ['RAM','الذاكرة','16GB DDR5','16 جيجابايت DDR5'],
        ['Display','الشاشة','16.1" FHD 144Hz IPS','16.1 بوصة 144Hz IPS'],
      ],
    },
    {
      name: 'Dell Inspiron 15 3520 - Core i3',
      name_ar: 'لابتوب ديل إنسبايرون 15 - كور i3',
      desc: 'Budget Dell laptop with Intel Core i3-1215U, 8GB RAM, 256GB SSD.',
      desc_ar: 'لابتوب اقتصادي مناسب للطلاب بمعالج إنتل كور i3.',
      price: 2200000, sale: 1950000, sku: 'DELL-INS15-I3-8-256', stock: 20,
      cat: 'laptops', brand: 'Dell', rating: 4.0, reviews: 15, featured: 0,
      tags: ['لابتوب','ديل','i3','اقتصادي'],
      specs: [
        ['Processor','المعالج','Intel Core i3-1215U','إنتل كور i3-1215U'],
        ['RAM','الذاكرة','8GB DDR4','8 جيجابايت DDR4'],
        ['Storage','التخزين','256GB SSD','256 جيجابايت SSD'],
      ],
    },
    {
      name: 'Lenovo IdeaPad 5 - Ryzen 5 5500U',
      name_ar: 'لابتوب لينوفو آيديا باد 5 - Ryzen 5',
      desc: 'Sleek Lenovo laptop with AMD Ryzen 5 5500U, 16GB RAM, 512GB SSD.',
      desc_ar: 'لابتوب أنيق من لينوفو بمعالج Ryzen 5 وذاكرة 16 جيجابايت.',
      price: 4200000, sale: 3900000, sku: 'LENOVO-IP5-R5-16-512', stock: 12,
      cat: 'laptops', brand: 'Lenovo', rating: 4.6, reviews: 32, featured: 1,
      tags: ['لابتوب','لينوفو','Ryzen 5'],
      specs: [
        ['Processor','المعالج','AMD Ryzen 5 5500U','AMD Ryzen 5 5500U'],
        ['RAM','الذاكرة','16GB DDR4','16 جيجابايت DDR4'],
        ['Storage','التخزين','512GB NVMe SSD','512 جيجابايت SSD'],
      ],
    },
    // Monitors
    {
      name: 'Samsung 27" FHD IPS Monitor - S27A336',
      name_ar: 'شاشة سامسونج 27 بوصة FHD IPS',
      desc: '27-inch Full HD IPS, 75Hz, HDMI & VGA.',
      desc_ar: 'شاشة 27 بوصة FHD بتقنية IPS ومعدل تحديث 75Hz.',
      price: 950000, sale: 850000, sku: 'SAMS-S27A336', stock: 18,
      cat: 'monitors', brand: 'Samsung', rating: 4.4, reviews: 22, featured: 1,
      tags: ['شاشة','سامسونج','27 بوصة','FHD'],
      specs: [
        ['Size','الحجم','27 inch','27 بوصة'],
        ['Resolution','الدقة','1920x1080 FHD','FHD 1920x1080'],
        ['Panel','اللوحة','IPS','IPS'],
        ['Refresh Rate','معدل التحديث','75Hz','75 هرتز'],
      ],
    },
    {
      name: 'LG 24" QHD IPS Monitor - 24QP500',
      name_ar: 'شاشة LG 24 بوصة QHD IPS',
      desc: '24-inch QHD 2560x1440 IPS panel with HDR10, AMD FreeSync.',
      desc_ar: 'شاشة احترافية 24 بوصة بدقة QHD مع HDR10 ودعم FreeSync.',
      price: 1400000, sale: null, sku: 'LG-24QP500', stock: 10,
      cat: 'monitors', brand: 'LG', rating: 4.8, reviews: 40, featured: 1,
      tags: ['شاشة','LG','QHD','IPS','تصميم'],
      specs: [
        ['Size','الحجم','24 inch','24 بوصة'],
        ['Resolution','الدقة','2560x1440 QHD','QHD 2560x1440'],
        ['Panel','اللوحة','IPS','IPS'],
        ['HDR','HDR','HDR10','HDR10'],
      ],
    },
    // Gaming
    {
      name: 'Logitech G502 HERO Gaming Mouse',
      name_ar: 'ماوس جيمينج لوجيتك G502 HERO',
      desc: 'High performance 25K DPI gaming mouse with 11 programmable buttons and RGB.',
      desc_ar: 'ماوس جيمينج احترافي بمستشعر 25K DPI وإضاءة RGB ذكية.',
      price: 350000, sale: 300000, sku: 'LOGI-G502-HERO', stock: 30,
      cat: 'gaming', brand: 'Logitech', rating: 4.9, reviews: 85, featured: 1,
      tags: ['ماوس','جيمينج','لوجيتك','RGB'],
      specs: [
        ['DPI','الدقة','25,600 DPI','25,600 DPI'],
        ['Buttons','الأزرار','11 programmable','11 قابل للبرمجة'],
        ['Connection','التوصيل','Wired USB','سلكي USB'],
      ],
    },
    {
      name: 'Redragon K552 Mechanical Gaming Keyboard',
      name_ar: 'كيبورد ميكانيكي ريدراجون K552',
      desc: 'TKL mechanical keyboard with blue switches and RGB backlight.',
      desc_ar: 'كيبورد ميكانيكي للجيمينج بمفاتيح زرقاء وإضاءة RGB.',
      price: 280000, sale: null, sku: 'REDR-K552-RGB', stock: 25,
      cat: 'gaming', brand: 'Redragon', rating: 4.3, reviews: 50, featured: 0,
      tags: ['كيبورد','ميكانيكي','جيمينج','RGB'],
      specs: [
        ['Switches','المفاتيح','Blue Mechanical','ميكانيكي أزرق'],
        ['Backlight','الإضاءة','RGB','RGB متعدد الألوان'],
        ['Layout','التخطيط','TKL 87-key','TKL 87 مفتاح'],
      ],
    },
    {
      name: 'HyperX Cloud II Gaming Headset',
      name_ar: 'سماعة جيمينج هايبر إكس كلاود 2',
      desc: '7.1 virtual surround gaming headset with detachable microphone.',
      desc_ar: 'سماعة جيمينج بصوت محيطي 7.1 ومايكروفون قابل للفصل.',
      price: 450000, sale: 400000, sku: 'HPXC-CLOUDII', stock: 15,
      cat: 'gaming', brand: 'HyperX', rating: 4.7, reviews: 60, featured: 1,
      tags: ['سماعة','جيمينج','هايبر إكس'],
      specs: [
        ['Sound','الصوت','7.1 Virtual Surround','7.1 محيطي'],
        ['Connection','التوصيل','3.5mm / USB','3.5 ملم / USB'],
        ['Microphone','المايكروفون','Detachable','قابل للإزالة'],
      ],
    },
    // Storage
    {
      name: 'Samsung 870 EVO 1TB SATA SSD',
      name_ar: 'SSD سامسونج 870 EVO - 1 تيرابايت',
      desc: '1TB SATA III SSD, 560MB/s read speed, 5-year warranty.',
      desc_ar: 'قرص SSD سريع 1 تيرابايت بسرعة قراءة 560 ميجابايت/ثانية.',
      price: 650000, sale: null, sku: 'SAMS-870EVO-1TB', stock: 20,
      cat: 'storage', brand: 'Samsung', rating: 4.8, reviews: 70, featured: 0,
      tags: ['SSD','سامسونج','1TB','تخزين'],
      specs: [
        ['Capacity','السعة','1TB','1 تيرابايت'],
        ['Interface','الواجهة','SATA III','SATA III'],
        ['Read Speed','سرعة القراءة','560 MB/s','560 ميجابايت/ثانية'],
        ['Warranty','الضمان','5 Years','5 سنوات'],
      ],
    },
    {
      name: 'WD Blue 2TB 7200RPM HDD',
      name_ar: 'هارد ديسك WD Blue 2 تيرابايت',
      desc: 'Reliable 2TB 3.5" SATA desktop hard drive at 7200 RPM.',
      desc_ar: 'قرص صلب موثوق 2 تيرابايت للديسكتوب.',
      price: 250000, sale: 225000, sku: 'WD-BLUE-2TB-7200', stock: 35,
      cat: 'storage', brand: 'Western Digital', rating: 4.5, reviews: 90, featured: 0,
      tags: ['هارد','WD','2TB','ديسكتوب'],
      specs: [
        ['Capacity','السعة','2TB','2 تيرابايت'],
        ['Speed','السرعة','7200 RPM','7200 دورة'],
        ['Interface','الواجهة','SATA III','SATA III'],
      ],
    },
    // Accessories
    {
      name: 'Anker PowerExpand 7-in-1 USB-C Hub',
      name_ar: 'هاب USB-C أنكر 7 في 1',
      desc: 'Versatile hub with 4K HDMI, 3x USB-A, SD card reader, 85W Power Delivery.',
      desc_ar: 'هاب متعدد بمنفذ HDMI 4K وثلاثة USB وقارئ بطاقات وشحن 85 واط.',
      price: 185000, sale: null, sku: 'ANKER-HUB-7IN1', stock: 40,
      cat: 'accessories', brand: 'Anker', rating: 4.6, reviews: 35, featured: 0,
      tags: ['هاب','USB-C','أنكر'],
      specs: [
        ['Ports','المنافذ','7 ports','7 منافذ'],
        ['HDMI','HDMI','4K@30Hz','4K@30Hz'],
        ['Power Delivery','الشحن','85W','85 واط'],
      ],
    },
  ];

  for (const p of products) {
    const productId = dbRun(db,
      `INSERT OR IGNORE INTO products
        (name, name_ar, description, description_ar, price, sale_price,
         sku, stock, category_id, brand, rating, review_count, is_featured, tags)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [p.name, p.name_ar, p.desc, p.desc_ar,
       p.price, p.sale ?? null, p.sku, p.stock,
       catId(p.cat), p.brand, p.rating, p.reviews, p.featured,
       JSON.stringify(p.tags)]
    );
    if (productId && p.specs) {
      p.specs.forEach(([key, key_ar, value, value_ar], i) => {
        dbRun(db,
          `INSERT OR IGNORE INTO product_specifications
            (product_id, key, key_ar, value, value_ar, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [productId, key, key_ar, value, value_ar, i + 1]
        );
      });
    }
  }

  // ─── Coupons ──────────────────────────────────────────────────
  dbRun(db, `INSERT OR IGNORE INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit) VALUES (?, ?, ?, ?, ?)`, ['WELCOME10', 'percentage', 10, 500000, 100]);
  dbRun(db, `INSERT OR IGNORE INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit) VALUES (?, ?, ?, ?, ?)`, ['SAVE50K', 'fixed', 50000, 300000, null]);
  dbRun(db, `INSERT OR IGNORE INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit) VALUES (?, ?, ?, ?, ?)`, ['TECHSTORE', 'percentage', 15, 1000000, 50]);
}

async function initDb() {
  const db = await getDb();

  // Check if already initialized
  const tableCheck = dbGetOne(db, "SELECT name FROM sqlite_master WHERE type='table' AND name='users'", []);

  if (!tableCheck) {
    console.log('Creating database schema...');
    initSchema(db);

    console.log('Seeding initial data...');
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const hash = await bcrypt.hash(adminPassword, 12);
    seedData(db, hash);
    saveDb();

    console.log('Database ready!');
    console.log(`   Admin: admin@techstore-syria.com / ${adminPassword}`);
  } else {
    console.log('Database already initialized');
  }
}

module.exports = { initDb };

if (require.main === module) {
  initDb().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
}
