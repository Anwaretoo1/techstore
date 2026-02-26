import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import bcrypt from 'bcryptjs';

// Secret key to protect this endpoint — set SETUP_SECRET in Vercel env vars
const SETUP_SECRET = process.env.SETUP_SECRET || 'setup-techstore-2024';

export async function POST(req: NextRequest) {
  try {
    const { secret } = await req.json().catch(() => ({}));
    if (secret !== SETUP_SECRET)
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });

    // ─── Schema ───────────────────────────────────────────────────────────────
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id            SERIAL PRIMARY KEY,
        email         TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        first_name    TEXT NOT NULL,
        last_name     TEXT NOT NULL,
        phone         TEXT,
        role          TEXT NOT NULL DEFAULT 'customer',
        is_active     BOOLEAN NOT NULL DEFAULT TRUE,
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        updated_at    TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id          SERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        name_ar     TEXT NOT NULL,
        slug        TEXT NOT NULL UNIQUE,
        description TEXT,
        image       TEXT,
        parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        sort_order  INTEGER NOT NULL DEFAULT 0,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id             SERIAL PRIMARY KEY,
        name           TEXT NOT NULL,
        name_ar        TEXT NOT NULL,
        description    TEXT,
        description_ar TEXT,
        price          NUMERIC NOT NULL,
        sale_price     NUMERIC,
        sku            TEXT NOT NULL UNIQUE,
        stock          INTEGER NOT NULL DEFAULT 0,
        category_id    INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        brand          TEXT,
        rating         NUMERIC NOT NULL DEFAULT 0,
        review_count   INTEGER NOT NULL DEFAULT 0,
        is_featured    BOOLEAN NOT NULL DEFAULT FALSE,
        is_active      BOOLEAN NOT NULL DEFAULT TRUE,
        tags           TEXT NOT NULL DEFAULT '[]',
        created_at     TIMESTAMPTZ DEFAULT NOW(),
        updated_at     TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id          SERIAL PRIMARY KEY,
        product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        url         TEXT NOT NULL,
        alt         TEXT,
        is_primary  BOOLEAN NOT NULL DEFAULT FALSE,
        sort_order  INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS product_specifications (
        id          SERIAL PRIMARY KEY,
        product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        key         TEXT NOT NULL,
        key_ar      TEXT NOT NULL,
        value       TEXT NOT NULL,
        value_ar    TEXT NOT NULL,
        sort_order  INTEGER NOT NULL DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS orders (
        id                  SERIAL PRIMARY KEY,
        order_number        TEXT NOT NULL UNIQUE,
        user_id             INTEGER NOT NULL REFERENCES users(id),
        status              TEXT NOT NULL DEFAULT 'pending',
        payment_method      TEXT NOT NULL,
        payment_status      TEXT NOT NULL DEFAULT 'pending',
        subtotal            NUMERIC NOT NULL DEFAULT 0,
        shipping_cost       NUMERIC NOT NULL DEFAULT 0,
        discount            NUMERIC NOT NULL DEFAULT 0,
        total               NUMERIC NOT NULL DEFAULT 0,
        notes               TEXT,
        coupon_code         TEXT,
        shipping_full_name  TEXT,
        shipping_phone      TEXT,
        shipping_city       TEXT,
        shipping_area       TEXT,
        shipping_street     TEXT,
        shipping_notes      TEXT,
        created_at          TIMESTAMPTZ DEFAULT NOW(),
        updated_at          TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id              SERIAL PRIMARY KEY,
        order_id        INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id      INTEGER REFERENCES products(id) ON DELETE SET NULL,
        product_name    TEXT NOT NULL,
        product_name_ar TEXT NOT NULL,
        quantity        INTEGER NOT NULL,
        unit_price      NUMERIC NOT NULL,
        total_price     NUMERIC NOT NULL
      );

      CREATE TABLE IF NOT EXISTS coupons (
        id              SERIAL PRIMARY KEY,
        code            TEXT NOT NULL UNIQUE,
        discount_type   TEXT NOT NULL DEFAULT 'fixed',
        discount_value  NUMERIC NOT NULL,
        min_order_value NUMERIC DEFAULT 0,
        usage_limit     INTEGER,
        used_count      INTEGER NOT NULL DEFAULT 0,
        is_active       BOOLEAN NOT NULL DEFAULT TRUE,
        expires_at      TIMESTAMPTZ,
        created_at      TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // ─── Check if already seeded ─────────────────────────────────────────────
    const adminCheck = await query("SELECT id FROM users WHERE email = 'admin@techstore-syria.com'");
    if (adminCheck.rows.length > 0)
      return NextResponse.json({ success: true, message: 'Database already initialized' });

    // ─── Admin user ──────────────────────────────────────────────────────────
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const hash = await bcrypt.hash(adminPassword, 12);
    await query(
      `INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
       VALUES ('admin@techstore-syria.com', $1, 'Ahmad', 'Admin', '+963112345678', 'admin')`,
      [hash]
    );

    // ─── Categories ──────────────────────────────────────────────────────────
    const cats = [
      ['Laptops','لابتوبات','laptops',1],['Desktops','ديسكتوب','desktops',2],
      ['Monitors','شاشات','monitors',3],['Components','مكونات','components',4],
      ['Storage','التخزين','storage',5],['Networking','الشبكات','networking',6],
      ['Peripherals','ملحقات','accessories',7],['Gaming','جيمينج','gaming',8],
    ];
    for (const [n, a, s, o] of cats) {
      await query('INSERT INTO categories (name, name_ar, slug, sort_order) VALUES ($1,$2,$3,$4) ON CONFLICT (slug) DO NOTHING', [n, a, s, o]);
    }

    const catId = async (slug: string) => {
      const r = await query('SELECT id FROM categories WHERE slug = $1', [slug]);
      return r.rows[0]?.id;
    };

    // ─── Products ────────────────────────────────────────────────────────────
    const products = [
      { name:'ASUS VivoBook 15 - Core i5', name_ar:'لابتوب أسوس فيفو بوك 15 - كور i5', desc:'Laptop with Intel Core i5-1235U, 8GB RAM, 512GB SSD.', desc_ar:'لابتوب مثالي للاستخدام اليومي بمعالج إنتل كور i5، ذاكرة 8 جيجابايت.', price:3500000, sale:3200000, sku:'ASUS-VB15-I5', stock:15, cat:'laptops', brand:'ASUS', rating:4.5, reviews:28, featured:true,
        specs:[['Processor','المعالج','Intel Core i5-1235U','إنتل كور i5-1235U'],['RAM','الذاكرة','8GB DDR4','8 جيجابايت'],['Storage','التخزين','512GB SSD','512 جيجابايت']] },
      { name:'HP Victus 16 Gaming - RTX 3060', name_ar:'لابتوب HP فيكتوس جيمينج - RTX 3060', desc:'Gaming laptop with AMD Ryzen 7, 16GB DDR5, RTX 3060.', desc_ar:'لابتوب جيمينج احترافي بمعالج Ryzen 7 وكرت RTX 3060.', price:8500000, sale:null, sku:'HP-VIC16-R7-3060', stock:8, cat:'laptops', brand:'HP', rating:4.7, reviews:45, featured:true,
        specs:[['Processor','المعالج','AMD Ryzen 7 6800H','AMD Ryzen 7'],['GPU','كرت الشاشة','NVIDIA RTX 3060 6GB','RTX 3060']] },
      { name:'Dell Inspiron 15 - Core i3', name_ar:'لابتوب ديل إنسبايرون 15 - كور i3', desc:'Budget Dell laptop with Intel Core i3, 8GB RAM, 256GB SSD.', desc_ar:'لابتوب اقتصادي مناسب للطلاب.', price:2200000, sale:1950000, sku:'DELL-INS15-I3', stock:20, cat:'laptops', brand:'Dell', rating:4.0, reviews:15, featured:false,
        specs:[['Processor','المعالج','Intel Core i3-1215U','إنتل كور i3']] },
      { name:'Lenovo IdeaPad 5 - Ryzen 5', name_ar:'لابتوب لينوفو آيديا باد 5 - Ryzen 5', desc:'Lenovo laptop with AMD Ryzen 5 5500U, 16GB RAM.', desc_ar:'لابتوب أنيق من لينوفو بمعالج Ryzen 5 وذاكرة 16 جيجابايت.', price:4200000, sale:3900000, sku:'LENOVO-IP5-R5', stock:12, cat:'laptops', brand:'Lenovo', rating:4.6, reviews:32, featured:true,
        specs:[['Processor','المعالج','AMD Ryzen 5 5500U','AMD Ryzen 5']] },
      { name:'Samsung 27" FHD IPS Monitor', name_ar:'شاشة سامسونج 27 بوصة FHD IPS', desc:'27-inch FHD IPS 75Hz Monitor.', desc_ar:'شاشة 27 بوصة FHD بتقنية IPS ومعدل تحديث 75Hz.', price:950000, sale:850000, sku:'SAMS-S27A336', stock:18, cat:'monitors', brand:'Samsung', rating:4.4, reviews:22, featured:true,
        specs:[['Size','الحجم','27 inch','27 بوصة'],['Refresh Rate','معدل التحديث','75Hz','75 هرتز']] },
      { name:'LG 24" QHD IPS Monitor', name_ar:'شاشة LG 24 بوصة QHD IPS', desc:'24-inch QHD 2560x1440 IPS with HDR10.', desc_ar:'شاشة احترافية 24 بوصة بدقة QHD مع HDR10.', price:1400000, sale:null, sku:'LG-24QP500', stock:10, cat:'monitors', brand:'LG', rating:4.8, reviews:40, featured:true,
        specs:[['Size','الحجم','24 inch','24 بوصة'],['Resolution','الدقة','2560x1440 QHD','QHD']] },
      { name:'Logitech G502 HERO Gaming Mouse', name_ar:'ماوس جيمينج لوجيتك G502 HERO', desc:'High performance 25K DPI gaming mouse with RGB.', desc_ar:'ماوس جيمينج احترافي بمستشعر 25K DPI وإضاءة RGB.', price:350000, sale:300000, sku:'LOGI-G502-HERO', stock:30, cat:'gaming', brand:'Logitech', rating:4.9, reviews:85, featured:true,
        specs:[['DPI','الدقة','25,600 DPI','25,600 DPI']] },
      { name:'Redragon K552 Mechanical Keyboard', name_ar:'كيبورد ميكانيكي ريدراجون K552', desc:'TKL mechanical keyboard with blue switches and RGB.', desc_ar:'كيبورد ميكانيكي بمفاتيح زرقاء وإضاءة RGB.', price:280000, sale:null, sku:'REDR-K552-RGB', stock:25, cat:'gaming', brand:'Redragon', rating:4.3, reviews:50, featured:false,
        specs:[['Switches','المفاتيح','Blue Mechanical','ميكانيكي أزرق']] },
      { name:'HyperX Cloud II Gaming Headset', name_ar:'سماعة جيمينج هايبر إكس كلاود 2', desc:'7.1 virtual surround gaming headset.', desc_ar:'سماعة جيمينج بصوت محيطي 7.1 ومايكروفون قابل للفصل.', price:450000, sale:400000, sku:'HPXC-CLOUDII', stock:15, cat:'gaming', brand:'HyperX', rating:4.7, reviews:60, featured:true,
        specs:[['Sound','الصوت','7.1 Virtual Surround','7.1 محيطي']] },
      { name:'Samsung 870 EVO 1TB SATA SSD', name_ar:'SSD سامسونج 870 EVO 1 تيرابايت', desc:'1TB SATA III SSD, 560MB/s read speed.', desc_ar:'قرص SSD سريع 1 تيرابايت.', price:650000, sale:null, sku:'SAMS-870EVO-1TB', stock:20, cat:'storage', brand:'Samsung', rating:4.8, reviews:70, featured:false,
        specs:[['Capacity','السعة','1TB','1 تيرابايت'],['Read Speed','سرعة القراءة','560 MB/s','560 ميجابايت/ثانية']] },
      { name:'WD Blue 2TB 7200RPM HDD', name_ar:'هارد ديسك WD Blue 2 تيرابايت', desc:'Reliable 2TB 3.5" SATA desktop hard drive.', desc_ar:'قرص صلب موثوق 2 تيرابايت للديسكتوب.', price:250000, sale:225000, sku:'WD-BLUE-2TB', stock:35, cat:'storage', brand:'Western Digital', rating:4.5, reviews:90, featured:false,
        specs:[['Capacity','السعة','2TB','2 تيرابايت']] },
      { name:'Anker 7-in-1 USB-C Hub', name_ar:'هاب USB-C أنكر 7 في 1', desc:'Versatile hub with 4K HDMI and 85W Power Delivery.', desc_ar:'هاب متعدد بمنفذ HDMI 4K وشحن 85 واط.', price:185000, sale:null, sku:'ANKER-HUB-7IN1', stock:40, cat:'accessories', brand:'Anker', rating:4.6, reviews:35, featured:false,
        specs:[['Ports','المنافذ','7 ports','7 منافذ']] },
    ];

    for (const p of products) {
      const cid = await catId(p.cat);
      const pr = await query(
        `INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (sku) DO NOTHING RETURNING id`,
        [p.name, p.name_ar, p.desc, p.desc_ar, p.price, p.sale ?? null, p.sku, p.stock, cid, p.brand, p.rating, p.reviews, p.featured, '[]']
      );
      const pid = pr.rows[0]?.id;
      if (pid && p.specs) {
        for (let i = 0; i < p.specs.length; i++) {
          const [key, key_ar, value, value_ar] = p.specs[i];
          await query(
            'INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order) VALUES ($1,$2,$3,$4,$5,$6)',
            [pid, key, key_ar, value, value_ar, i]
          );
        }
      }
    }

    // ─── Coupons ─────────────────────────────────────────────────────────────
    await query("INSERT INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit) VALUES ('WELCOME10','percentage',10,500000,100) ON CONFLICT (code) DO NOTHING");
    await query("INSERT INTO coupons (code, discount_type, discount_value, min_order_value) VALUES ('SAVE50K','fixed',50000,300000) ON CONFLICT (code) DO NOTHING");
    await query("INSERT INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit) VALUES ('TECHSTORE','percentage',15,1000000,50) ON CONFLICT (code) DO NOTHING");

    return NextResponse.json({
      success: true,
      message: 'Database initialized successfully',
      admin: { email: 'admin@techstore-syria.com', password: adminPassword },
    });
  } catch (err) {
    console.error('Setup error:', err);
    return NextResponse.json({ success: false, message: String(err) }, { status: 500 });
  }
}
