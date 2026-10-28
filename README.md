# RaddiBhaav (रद्दी भाव) — Hyperlocal Scrap Marketplace

> **Kabadi ka sahi bhaav.** A modern, fintech-grade hyperlocal scrap bidding and doorstep pickup marketplace connecting Indian households with verified local kabadiwalas (scrap dealers).

---

## 🌟 Key Highlights

*   **Realtime Hyperlocal Scrap Bidding**: Sellers list scrap (newspapers, cardboard, metals, e-waste); verified nearby dealers submit competing bids within a 2-hour window.
*   **Doorstep Digital Scale Guarantee**: Payout is dynamically calculated from actual weigh-in using agreed per-category rates.
*   **15% Final-Weight Protection**: If actual weight differs from estimate by >15%, sellers can reconfirm or cancel without penalty.
*   **Anti-Lowball & Dispute Resolution**: Automatically flags when a dealer pays below benchmark rates and provides in-app dispute mediation.
*   **Offline-Ready PWA**: Background syncing queues bids, weigh-ins, and listings when data connectivity is patchy.
*   **Multilingual**: Native English, Hindi (हिंदी), and Marathi (मराठी) localization.
*   **PostGIS Geo-Spatial Routing**: Hyperlocal radius queries (default 5–12 km) matching approved dealers based on precise coordinates.
*   **Strict Security & RLS**: 100% Row Level Security across PostgreSQL tables and private KYC storage buckets.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router + Server Actions + Turbopack) |
| **Language** | TypeScript 5 (Strict Mode) |
| **Database** | Supabase PostgreSQL 17 + PostGIS + RLS |
| **Storage** | Supabase Storage (`kyc-documents` [private], `listing-photos` [public]) |
| **Styling** | Tailwind CSS v4 + Vanilla CSS Design Tokens |
| **Typography** | Fraunces (Serif headings), Plus Jakarta Sans (UI body), Noto Sans Devanagari |
| **Internationalization** | `next-intl` (en, hi, mr) with path prefixes |
| **State & Offline** | LocalStorage + Service Worker Offline Queue Sync |
| **Monitoring** | Sentry (Error tracking) + Vercel Analytics |
| **Testing** | Node.js Test Runner (Unit) + Playwright (E2E) |

---

## 🚀 Quick Start (Local Development)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/your-username/raddibhaav.git
cd raddibhaav
npm install
```

### 2. Configure Environment Variables
```bash
cp .env.example .env.local
```
Update `.env.local` with your Supabase credentials (or use the pre-configured credentials from `.env.example`).

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Database Setup & Supabase Migrations

The production database uses PostgreSQL with PostGIS and strict RLS policies located in `supabase/migrations/`:

*   `20261027000000_init_schema.sql`: Core tables, PostGIS spatial indexes, RLS policies, auto-expiry triggers, and Nashik rate cards.
*   `20261027020000_storage_kyc.sql`: Private `kyc-documents` bucket with signed URL access control.
*   `20261028000000_storage_listings.sql`: Public `listing-photos` bucket with authenticated upload rules.

### Applying Migrations via Supabase CLI
```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

### Auth Redirect URLs (Supabase Dashboard)
In your Supabase project -> **Authentication** -> **URL Configuration**:
*   **Site URL**: `https://raddibhaav.vercel.app` (or your custom domain `https://raddibhaav.in`)
*   **Redirect URLs**:
    *   `http://localhost:3000/**`
    *   `https://raddibhaav.vercel.app/**`
    *   `https://raddibhaav.in/**`

---

## 🌱 Seeding Demo Data (Nashik Market)

For demo presentations, a deterministic seed script creates:
*   **1 Admin**: `admin@raddibhaav.in` / `+91 99999 00000`
*   **3 Verified Dealers**: Shree Ganesh Scrap Traders (College Rd), Godavari Eco Recyclers (Panchavati), Nashik Metal & Raddi Mart (CIDCO)
*   **1 Seller**: Sanjay Patil (`+91 98765 43210`)
*   **2 Active Listings & Competing Bids**: Household raddi and home renovation copper/brass scrap in Nashik.

```bash
# Protected by safety guard: only runs when ENABLE_DEMO_SEED=true
npm run seed:demo
```

---

## 🧪 Testing Suite

### Unit & Security Tests
Runs 49 automated unit tests verifying bidding windows, auto-extensions, 15% final weight rules, anti-lowball violations, RLS enforcement, and offline sync:
```bash
npm test
```

### End-to-End Tests (Playwright)
Validates complete lifecycle: Seller creates listing → Dealer bids → Seller accepts → Doorstep weigh-in → Mutual ratings:
```bash
npm run test:e2e
```

### Production Build Verification
```bash
npm run build
```

---

## 🚢 Deploying to Vercel

1. **Connect Repository**: Import the Git repository in [Vercel Dashboard](https://vercel.com/new).
2. **Environment Variables**: In Project Settings -> Environment Variables, add:
   *   `NEXT_PUBLIC_SUPABASE_URL`
   *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   *   `NEXT_PUBLIC_APP_URL`: `https://raddibhaav.vercel.app` (or custom domain)
   *   `NEXT_PUBLIC_DEFAULT_CITY`: `Nashik`
   *   `NEXT_PUBLIC_DEFAULT_LAT`: `19.9975`
   *   `NEXT_PUBLIC_DEFAULT_LNG`: `73.7898`
   *   `NEXT_PUBLIC_SENTRY_DSN`: (Optional)
   *   `ENABLE_DEMO_SEED`: `false`
3. **Build & Output Settings**:
   *   Framework Preset: **Next.js**
   *   Build Command: `npm run build`
   *   Output Directory: `.next`
4. **Deploy**: Click **Deploy**. Vercel will deploy and provision SSL automatically.

---

## 📋 Production Launch Checklist

Before opening the platform to real users:

- [ ] **Custom Domain & DNS**: Map `raddibhaav.in` via CNAME to `cname.vercel-dns.com` and verify HTTPS certificate issuance.
- [ ] **SMS & DLT Registration**: Register entity name, header (`RADDI`), and OTP templates on Indian Telecom DLT (e.g. Jio / Airtel / Vil) and configure `MSG91_AUTH_KEY` / `MSG91_TEMPLATE_ID`.
- [ ] **Legal Review**: Have a legal advisor review `/terms`, `/privacy`, and `/dealer-agreement`.
- [ ] **Live Mandi Rates**: Verify initial benchmark scrap rates for the target city in `/admin` rate card editor.
- [ ] **Dealer Physical Verification**: Conduct physical verification of weighing balances (stamped weights & measures certification) before approving dealer KYC.
- [ ] **Turn Off Demo Flags**: Ensure `ENABLE_DEMO_SEED=false` in production environment settings.
