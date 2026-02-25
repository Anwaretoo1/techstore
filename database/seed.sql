-- ============================================================
--  TechStore Syria — Seed Data
--  Run AFTER schema.sql:
--  psql -U postgres -d ecommerce_syria -f seed.sql
-- ============================================================

-- ─── Admin User ──────────────────────────────────────────────
-- Password: Admin@12345 (change after first login!)
INSERT INTO users (email, password_hash, first_name, last_name, phone, role)
VALUES (
  'admin@techstore-syria.com',
  '$2a$12$LZygcIRFXROB2INhpuVkEOh1dF5KY89.xY6lDRxNxFUWy6hPFcbsq', -- Admin@12345
  'Ahmad',
  'Admin',
  '+963112345678',
  'admin'
) ON CONFLICT (email) DO NOTHING;

-- ─── Categories ──────────────────────────────────────────────
INSERT INTO categories (name, name_ar, slug, sort_order) VALUES
  ('Laptops',       'لابتوبات',     'laptops',     1),
  ('Desktops',      'ديسكتوب',      'desktops',    2),
  ('Monitors',      'شاشات',        'monitors',    3),
  ('Components',    'مكونات',       'components',  4),
  ('Storage',       'التخزين',      'storage',     5),
  ('Networking',    'الشبكات',      'networking',  6),
  ('Peripherals',   'ملحقات',       'accessories', 7),
  ('Gaming',        'جيمينج',       'gaming',      8)
ON CONFLICT (slug) DO NOTHING;

-- ─── Products ─────────────────────────────────────────────────
-- Laptops
INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'ASUS VivoBook 15 - Intel Core i5 12th Gen',
  'لابتوب أسوس فيفو بوك 15 - معالج إنتل كور i5 الجيل الثاني عشر',
  'Powerful everyday laptop with Intel Core i5-1235U processor, 8GB RAM, 512GB SSD, 15.6-inch FHD display.',
  'لابتوب رائع للاستخدام اليومي والعمل، يأتي بمعالج إنتل كور i5 الجيل الثاني عشر، ذاكرة وصول عشوائي 8 جيجابايت، ومساحة تخزين SSD 512 جيجابايت.',
  3500000, 3200000, 'ASUS-VB15-I5-8-512', 15,
  (SELECT id FROM categories WHERE slug='laptops'),
  'ASUS', 4.5, 28, true,
  ARRAY['لابتوب','أسوس','i5','طالب','مكتب']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='ASUS-VB15-I5-8-512');

INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'HP Victus 16 Gaming Laptop - RTX 3060',
  'لابتوب HP فيكتوس للجيمينج - RTX 3060',
  'Gaming powerhouse with AMD Ryzen 7 6800H, 16GB DDR5, 512GB NVMe, NVIDIA RTX 3060, 16.1" 144Hz display.',
  'لابتوب جيمينج احترافي بمعالج AMD Ryzen 7، 16 جيجابايت DDR5، كرت شاشة NVIDIA RTX 3060، وشاشة 144Hz سلسة.',
  8500000, NULL, 'HP-VIC16-R7-16-3060', 8,
  (SELECT id FROM categories WHERE slug='laptops'),
  'HP', 4.7, 45, true,
  ARRAY['لابتوب جيمينج','HP','RTX 3060','Ryzen 7']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='HP-VIC16-R7-16-3060');

INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'Dell Inspiron 15 3520 - Core i3',
  'لابتوب ديل إنسبايرون 15 - كور i3',
  'Budget-friendly Dell laptop with Intel Core i3-1215U, 8GB RAM, 256GB SSD.',
  'لابتوب اقتصادي مناسب للطلاب والاستخدام اليومي البسيط بمعالج إنتل كور i3.',
  2200000, 1950000, 'DELL-INS15-I3-8-256', 20,
  (SELECT id FROM categories WHERE slug='laptops'),
  'Dell', 4.0, 15, false,
  ARRAY['لابتوب','ديل','i3','اقتصادي','طالب']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='DELL-INS15-I3-8-256');

INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'Lenovo IdeaPad 5 - Ryzen 5 5500U',
  'لابتوب لينوفو آيديا باد 5 - Ryzen 5',
  'Sleek and powerful Lenovo laptop with AMD Ryzen 5 5500U, 16GB RAM, 512GB SSD.',
  'لابتوب أنيق وقوي من لينوفو بمعالج Ryzen 5 وذاكرة 16 جيجابايت.',
  4200000, 3900000, 'LENOVO-IP5-R5-16-512', 12,
  (SELECT id FROM categories WHERE slug='laptops'),
  'Lenovo', 4.6, 32, true,
  ARRAY['لابتوب','لينوفو','Ryzen 5','مكتب']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='LENOVO-IP5-R5-16-512');

-- Monitors
INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'Samsung 27" FHD IPS Monitor - S27A336',
  'شاشة سامسونج 27 بوصة FHD IPS',
  '27-inch Full HD IPS with 75Hz refresh rate, thin bezels, HDMI & VGA.',
  'شاشة 27 بوصة بدقة Full HD وتقنية IPS بمعدل تحديث 75Hz مثالية للعمل والدراسة.',
  950000, 850000, 'SAMS-S27A336', 18,
  (SELECT id FROM categories WHERE slug='monitors'),
  'Samsung', 4.4, 22, true,
  ARRAY['شاشة','سامسونج','27 بوصة','FHD','IPS']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='SAMS-S27A336');

INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'LG 24" QHD IPS Monitor - 24QP500',
  'شاشة LG 24 بوصة QHD IPS',
  '24-inch QHD 2560x1440 IPS panel with HDR10, AMD FreeSync.',
  'شاشة احترافية 24 بوصة بدقة QHD مع HDR10 ودعم FreeSync، مثالية للتصميم والجيمينج.',
  1400000, NULL, 'LG-24QP500', 10,
  (SELECT id FROM categories WHERE slug='monitors'),
  'LG', 4.8, 40, true,
  ARRAY['شاشة','LG','QHD','IPS','تصميم']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='LG-24QP500');

-- Gaming Peripherals
INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'Logitech G502 HERO Gaming Mouse',
  'ماوس جيمينج لوجيتك G502 HERO',
  'High performance gaming mouse with HERO 25K sensor, 11 programmable buttons, and LIGHTSYNC RGB.',
  'ماوس جيمينج احترافي بمستشعر 25K DPI دقيق، 11 زر قابل للبرمجة، وإضاءة RGB ذكية.',
  350000, 300000, 'LOGI-G502-HERO', 30,
  (SELECT id FROM categories WHERE slug='gaming'),
  'Logitech', 4.9, 85, true,
  ARRAY['ماوس','جيمينج','لوجيتك','G502','RGB']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='LOGI-G502-HERO');

INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'Redragon K552 Mechanical Gaming Keyboard',
  'كيبورد ميكانيكي ريدراجون K552',
  'TKL mechanical gaming keyboard with blue switches, RGB backlight, and durable construction.',
  'كيبورد ميكانيكي للجيمينج بمفاتيح زرقاء، إضاءة RGB متعددة الألوان، وبناء متين يدوم طويلاً.',
  280000, NULL, 'REDR-K552-RGB', 25,
  (SELECT id FROM categories WHERE slug='gaming'),
  'Redragon', 4.3, 50, false,
  ARRAY['كيبورد','ميكانيكي','جيمينج','RGB']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='REDR-K552-RGB');

INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'HyperX Cloud II Gaming Headset',
  'سماعة جيمينج هايبر إكس كلاود 2',
  '7.1 surround sound gaming headset with memory foam ear cushions and detachable microphone.',
  'سماعة جيمينج بصوت محيطي 7.1، مع وسادات أذن مريحة ومايكروفون قابل للفصل للاتصالات الواضحة.',
  450000, 400000, 'HPXC-CLOUDII', 15,
  (SELECT id FROM categories WHERE slug='gaming'),
  'HyperX', 4.7, 60, true,
  ARRAY['سماعة','جيمينج','هايبر إكس','7.1']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='HPXC-CLOUDII');

-- Storage
INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'Samsung 870 EVO 1TB SATA SSD',
  'SSD سامسونج 870 EVO - 1 تيرابايت',
  '1TB SATA III SSD with up to 560MB/s read speeds, 5-year warranty.',
  'قرص SSD سريع 1 تيرابايت بسرعة قراءة تصل إلى 560 ميجابايت/ثانية مع ضمان لمدة 5 سنوات.',
  650000, NULL, 'SAMS-870EVO-1TB', 20,
  (SELECT id FROM categories WHERE slug='storage'),
  'Samsung', 4.8, 70, false,
  ARRAY['SSD','سامسونج','1TB','تخزين','سريع']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='SAMS-870EVO-1TB');

INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'WD Blue 2TB 7200RPM HDD',
  'هارد ديسك WD Blue 2 تيرابايت',
  'Reliable 2TB 3.5 inch SATA hard drive at 7200 RPM for desktops.',
  'قرص صلب موثوق 2 تيرابايت 7200 دورة للديسكتوب بداخل قوي وموثوقية عالية.',
  250000, 225000, 'WD-BLUE-2TB-7200', 35,
  (SELECT id FROM categories WHERE slug='storage'),
  'Western Digital', 4.5, 90, false,
  ARRAY['هارد','WD','2TB','ديسكتوب','تخزين']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='WD-BLUE-2TB-7200');

-- Accessories
INSERT INTO products (name, name_ar, description, description_ar, price, sale_price, sku, stock, category_id, brand, rating, review_count, is_featured, tags)
SELECT
  'Anker PowerExpand 7-in-1 USB-C Hub',
  'هاب USB-C أنكر 7 في 1',
  'Versatile hub with 4K HDMI, 3x USB-A, SD card reader, and 85W Power Delivery.',
  'هاب متعدد الوظائف يمنحك منفذ HDMI 4K وثلاثة منافذ USB وقارئ بطاقة SD وشحن حتى 85 واط.',
  185000, NULL, 'ANKER-HUB-7IN1', 40,
  (SELECT id FROM categories WHERE slug='accessories'),
  'Anker', 4.6, 35, false,
  ARRAY['هاب','USB-C','أنكر','شاشة']
WHERE NOT EXISTS (SELECT 1 FROM products WHERE sku='ANKER-HUB-7IN1');

-- ─── Product Specifications ────────────────────────────────────
-- ASUS VivoBook specs
INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order)
SELECT p.id, 'Processor', 'المعالج', 'Intel Core i5-1235U', 'إنتل كور i5-1235U', 1
FROM products p WHERE p.sku = 'ASUS-VB15-I5-8-512'
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order)
SELECT p.id, 'RAM', 'الذاكرة', '8GB DDR4 3200MHz', '8 جيجابايت DDR4', 2
FROM products p WHERE p.sku = 'ASUS-VB15-I5-8-512'
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order)
SELECT p.id, 'Storage', 'التخزين', '512GB NVMe SSD', '512 جيجابايت SSD NVMe', 3
FROM products p WHERE p.sku = 'ASUS-VB15-I5-8-512'
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order)
SELECT p.id, 'Display', 'الشاشة', '15.6" FHD IPS 60Hz', '15.6 بوصة FHD IPS', 4
FROM products p WHERE p.sku = 'ASUS-VB15-I5-8-512'
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order)
SELECT p.id, 'Battery', 'البطارية', '42Wh, Up to 7 hours', '42 واط ساعة، حتى 7 ساعات', 5
FROM products p WHERE p.sku = 'ASUS-VB15-I5-8-512'
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order)
SELECT p.id, 'OS', 'نظام التشغيل', 'Windows 11 Home', 'ويندوز 11 هوم', 6
FROM products p WHERE p.sku = 'ASUS-VB15-I5-8-512'
ON CONFLICT DO NOTHING;

-- HP Victus specs
INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order)
SELECT p.id, 'Processor', 'المعالج', 'AMD Ryzen 7 6800H', 'AMD Ryzen 7 6800H', 1
FROM products p WHERE p.sku = 'HP-VIC16-R7-16-3060'
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order)
SELECT p.id, 'GPU', 'كرت الشاشة', 'NVIDIA GeForce RTX 3060 6GB', 'RTX 3060 6 جيجابايت', 2
FROM products p WHERE p.sku = 'HP-VIC16-R7-16-3060'
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order)
SELECT p.id, 'RAM', 'الذاكرة', '16GB DDR5', '16 جيجابايت DDR5', 3
FROM products p WHERE p.sku = 'HP-VIC16-R7-16-3060'
ON CONFLICT DO NOTHING;

INSERT INTO product_specifications (product_id, key, key_ar, value, value_ar, sort_order)
SELECT p.id, 'Display', 'الشاشة', '16.1" FHD 144Hz IPS', '16.1 بوصة 144Hz IPS', 4
FROM products p WHERE p.sku = 'HP-VIC16-R7-16-3060'
ON CONFLICT DO NOTHING;

-- ─── Coupons ──────────────────────────────────────────────────
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, usage_limit, is_active)
VALUES
  ('WELCOME10',  'percentage', 10,    500000,  100, true),
  ('SAVE50K',    'fixed',      50000, 300000,  NULL, true),
  ('TECHSTORE',  'percentage', 15,    1000000, 50,  true)
ON CONFLICT (code) DO NOTHING;
