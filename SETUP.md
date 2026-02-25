# TechStore Syria — متجر إلكتروني لمعدات الكمبيوتر

## دليل الإعداد والتشغيل الكامل

---

## هيكل المشروع

```
ecommerce-syria/
├── frontend/          # Next.js 14 + Tailwind CSS (RTL)
├── backend/           # Node.js + Express.js REST API
├── database/          # PostgreSQL schema + seed data
├── docker-compose.yml # Docker setup (كل شيء في أمر واحد)
└── .env.example       # متغيرات البيئة
```

---

## الطريقة 1: Docker (الأسهل — موصى به)

### المتطلبات
- Docker Desktop مثبت

### الخطوات

```bash
# 1. انتقل إلى مجلد المشروع
cd C:\Users\sadbi\ecommerce-syria

# 2. أنشئ ملف .env من المثال
copy .env.example .env
# ثم عدّل القيم في .env حسب الحاجة

# 3. شغّل كل شيء بأمر واحد
docker-compose up --build -d

# 4. افتح المتجر في المتصفح
# Frontend:  http://localhost:3000
# Admin API: http://localhost:5000/api/health
```

**إيقاف التشغيل:**
```bash
docker-compose down
```

---

## الطريقة 2: تشغيل يدوي (للتطوير)

### المتطلبات
- Node.js 18+
- PostgreSQL 14+

### إعداد قاعدة البيانات

```bash
# أنشئ قاعدة البيانات
psql -U postgres -c "CREATE DATABASE ecommerce_syria;"

# شغّل schema
psql -U postgres -d ecommerce_syria -f database/schema.sql

# أضف البيانات التجريبية (منتجات + مسؤول)
psql -U postgres -d ecommerce_syria -f database/seed.sql
```

### تشغيل الـ Backend

```bash
cd backend

# انسخ ملف البيئة
copy .env.example .env
# عدّل DB_PASSWORD و JWT_SECRET

# ثبّت الاعتماديات
npm install

# شغّل بوضع التطوير
npm run dev

# أو شغّل seed منفصلاً (يولّد مسؤول برمجياً)
npm run seed
```

### تشغيل الـ Frontend

```bash
cd frontend

# انسخ ملف البيئة
copy .env.example .env.local
# عدّل NEXT_PUBLIC_WHATSAPP_NUMBER برقم الواتساب الحقيقي

# ثبّت الاعتماديات
npm install

# شغّل بوضع التطوير
npm run dev
```

افتح المتصفح على: `http://localhost:3000`

---

## بيانات الدخول الافتراضية

| البريد الإلكتروني | كلمة المرور |
|---|---|
| admin@techstore-syria.com | Admin@12345 |

**⚠️ غيّر كلمة المرور فوراً بعد أول تسجيل دخول!**

---

## لوحة التحكم (Admin Panel)

| الصفحة | الرابط |
|---|---|
| لوحة التحكم | /admin |
| إدارة المنتجات | /admin/products |
| إضافة منتج جديد | /admin/products/new |
| إدارة الطلبات | /admin/orders |
| إدارة الفئات | /admin/categories |

---

## واجهة برمجة التطبيقات (API Endpoints)

### Auth
| Method | Endpoint | الوصف |
|---|---|---|
| POST | /api/auth/register | تسجيل مستخدم جديد |
| POST | /api/auth/login | تسجيل الدخول |
| GET  | /api/auth/me | بيانات المستخدم الحالي |

### Products
| Method | Endpoint | الوصف |
|---|---|---|
| GET  | /api/products | جميع المنتجات (مع فلاتر) |
| GET  | /api/products/featured | المنتجات المميزة |
| GET  | /api/products/search?q=... | البحث |
| GET  | /api/products/:id | منتج محدد |
| POST | /api/products | إضافة منتج (admin) |
| PUT  | /api/products/:id | تعديل منتج (admin) |
| DELETE | /api/products/:id | حذف منتج (admin) |

### Orders
| Method | Endpoint | الوصف |
|---|---|---|
| POST | /api/orders | إنشاء طلب |
| GET  | /api/orders/my | طلباتي |
| GET  | /api/orders | جميع الطلبات (admin) |
| PATCH | /api/orders/:id/status | تحديث حالة (admin) |

---

## التخصيص السريع

### تغيير الألوان
عدّل `frontend/tailwind.config.js`:
```js
colors: {
  primary: { 600: '#2563eb', ... }, // اللون الأساسي
  accent:  { DEFAULT: '#f97316' },  // لون التمييز
}
```

### تغيير رقم الواتساب
عدّل `frontend/.env.local`:
```
NEXT_PUBLIC_WHATSAPP_NUMBER=+963XXXXXXXXX
```

### تغيير اسم المتجر والوصف
عدّل `frontend/src/app/layout.tsx` → `metadata`

### إضافة منتجات عبر واجهة المتصفح
1. سجّل دخولك كمسؤول على `/auth/login`
2. انتقل إلى `/admin/products`
3. اضغط "منتج جديد"

### إضافة منتجات عبر قاعدة البيانات مباشرة
أضف صفوفاً في `database/seed.sql` ثم أعد تشغيل:
```bash
psql -U postgres -d ecommerce_syria -f database/seed.sql
```

---

## متغيرات البيئة المهمة

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_WHATSAPP_NUMBER=+963XXXXXXXXX
NEXT_PUBLIC_STORE_NAME=TechStore Syria
```

### Backend (.env)
```
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ecommerce_syria
DB_USER=postgres
DB_PASSWORD=YOUR_SECURE_PASSWORD
JWT_SECRET=LONG_RANDOM_SECRET_KEY
FRONTEND_URL=http://localhost:3000
```

---

## رفع الصور للمنتجات

يتم رفع الصور تلقائياً إلى مجلد `backend/uploads/`.
عند استخدام Docker، يتم تخزينها في volume دائم.

لرفع صورة عبر API:
```
POST /api/upload
Content-Type: multipart/form-data
Authorization: Bearer <admin_token>

Field: images (file[])
```

---

## النشر على الإنترنت

### الخيار 1: VPS (Linux)
```bash
# على السيرفر
git clone <your-repo>
cd ecommerce-syria
cp .env.example .env
nano .env  # عدّل القيم
docker-compose up --build -d

# ضبط Nginx كـ reverse proxy
# Frontend → port 3000
# Backend  → port 5000
```

### الخيار 2: Vercel + Railway/Supabase
- Frontend على Vercel (مجاني)
- Backend على Railway أو Render
- Database على Supabase (PostgreSQL مجاني)

---

## كودات الخصم التجريبية

| الكود | الخصم | الحد الأدنى للطلب |
|---|---|---|
| WELCOME10 | 10% | 500,000 ل.س |
| SAVE50K | 50,000 ل.س | 300,000 ل.س |
| TECHSTORE | 15% | 1,000,000 ل.س |

---

## المساعدة والدعم

للأسئلة التقنية أو طلب ميزات إضافية، تواصل مع المطور.
