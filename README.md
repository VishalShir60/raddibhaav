<div align="center">

# ♻️ RaddiBhaav (रद्दी भाव)
### *Kabadi ka sahi bhaav. Fair scrap pricing, verified doorstep weigh-in, zero haggling.*

[![Next.js 16](https://img.shields.io/badge/Next.js-16.4.3-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2017-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![PostGIS](https://img.shields.io/badge/PostGIS-Spatial%20Routing-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgis.net/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PWA Ready](https://img.shields.io/badge/PWA-Offline%20Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0F3D2E?style=for-the-badge)](LICENSE)

<br />

<p align="center">
  <a href="#-the-story-why-raddibhaav-exists"><b>The Story</b></a> •
  <a href="#-how-it-works"><b>How It Works</b></a> •
  <a href="#-built-with-heart-for-real-india"><b>Features</b></a> •
  <a href="#-tech-stack--architecture"><b>Architecture</b></a> •
  <a href="#-quick-start"><b>Quick Start</b></a> •
  <a href="#-demo-marketplace--nashik-pilot"><b>Demo Data</b></a> •
  <a href="#-security--rls"><b>Security</b></a>
</p>

</div>

---

## 📖 The Story: Why RaddiBhaav Exists

Every Indian household knows the Sunday morning dilemma:
* Months of old newspapers stacking up in balcony corners.
* Flattened Amazon and Flipkart delivery cartons threatening to take over the storeroom.
* An old ceiling fan, rusted iron window grills, and dead electronics that have been sitting around for months.

When the street *kabadiwala* finally cycles past your building shouting *"Bhaaaangaaaar... Raddddiiii!"*, you call him up. But what happens next is universally frustrating:
1. **The Rusty Spring Scale**: He pulls out a weathered handheld spring scale with a thumb resting suspiciously on the dial. A 30 kg bundle magically weighs in at 18 kg.
2. **The Lowball Price**: *"Bhaiya, paper ka rate gir gaya hai, 8 rupaye kilo chal raha hai."* Meanwhile, the wholesale recycling mandi rate is ₹16.
3. **The Dealer's Plight**: On the flip side, honest, hardworking scrap collectors cycle 15 to 20 kilometers every single day through scorching heat, burning fuel or pedaling blindly without knowing which building actually has scrap ready for pickup.

### 💡 Enter RaddiBhaav

**RaddiBhaav (रद्दी भाव)** transforms India's unorganized recycling economy into a transparent, dignified, and competitive marketplace. 

Instead of settling for arbitrary guesses, sellers snap a photo, post approximate weights, and let verified neighborhood dealers submit competing bids within a 2-hour window. The dealer arrives with a certified digital electronic scale, weighs the items in front of you, and pays instantly via UPI or Cash based on the pre-agreed per-kg rates.

> **Honest kilograms. Transparent mandi rates. Respect for the recycling heroes keeping our cities clean.**

---

## 🔄 How It Works

```
   [Household Seller]                           [Verified Local Dealers]
           |                                                |
   1. Snap Photos & Enter Weights                           |
      (Newspaper, Cardboard, Iron)                          |
           |                                                |
           +-----> 2. 2-Hour Hyperlocal Bid Window ------>  |
                   (Within 5-10 km radius via PostGIS)     |
                                                            |
                                                3. Competing Sealed Bids
                                                   (e.g. ₹480 vs ₹550 vs ₹600)
                                                            |
   4. Accept Best Offer <-----------------------------------+
           |
   5. Doorstep Visit with Certified Digital Scale
      - Transparent Weigh-in
      - Final Payout = (Actual Weight × Agreed Rate)
      - 15% Final-Weight rule protects both parties
           |
   6. Instant Settlement (Cash / GooglePay / PhonePe / Paytm)
```

---

## 🇮🇳 Built with Heart for Real India

### ⚖️ The 15% Final-Weight Protection Rule
Nobody has a commercial weighing scale at home. Sellers make an educated guess (e.g. *"around 25 kg of newspapers"*). 
* When the dealer arrives, the payout is calculated strictly on **actual weight × agreed per-category rate**.
* If the actual weight differs from the estimate by **more than 15%**, the seller can reconfirm or cancel the deal with zero cancellation fee or penalty.

### 🛡️ Anti-Lowball & Dispute Guard
If a dealer attempts to renegotiate or pay less than the agreed rate at the doorstep, the seller can instantly flag it in the app. This freezes the transaction, notifies platform admins, and triggers a formal dispute mediation process.

### 📵 Privacy-First Call & Address Masking
To prevent spam and protect household safety:
* Exact apartment numbers and phone numbers remain strictly masked during the bidding phase.
* Contact details and navigation pins are unlocked **only** after the seller accepts a specific dealer's offer.

### 📶 Offline-Ready for Ground Realities
Indian scrap dealers often work in underground parking basements, elevator shafts, and dense gullies where 4G signals drop.
* RaddiBhaav is an installable **Progressive Web App (PWA)** with background caching.
* Dealers can draft offers and record doorstep weigh-ins offline.
* The built-in **Offline Sync Queue** automatically fires and reconciles transactions the moment connectivity returns.

### 🗣️ Natural Multilingual Voice
No robotic, stiff translations. RaddiBhaav is localized in **English**, **Hindi (हिंदी)**, and **Marathi (मराठी)** using the words people actually use every day on the ground:
* *Newspaper* → **अखबार (रद्दी)** / **वर्तमानपत्र (रद्दी)**
* *Cardboard* → **गत्ता (कार्टन)** / **पुठ्ठा (कार्टन)**
* *Iron & Steel* → **लोहा** / **लोखंड**
* *Brass & Copper* → **पीतल और तांबा** / **पितळ आणि तांबे**

---

## 🎨 Design System: Sustainable Luxury Meets Fintech

Designed to look like a high-end sustainable fintech app, not an ad-cluttered classifieds portal:

*   **Primary Palette**: Deep Forest Green (`#0F3D2E` / `#145A43`) evoking environmental stewardship and financial trust.
*   **Accent Gold**: Warm Brass Gold (`#C9A227`) used intentionally for best-offer ribbons, prices, and conversion highlights.
*   **Canvas**: Warm Ivory (`#FAF8F3`) with clean white elevated surface cards (`#FFFFFF`) and delicate warm borders (`#E8E4DA`).
*   **Dark Mode**: Deep forest-black night palette (`#07140F`, `#0C2119`) designed for low-light battery conservation on mobile OLED screens.
*   **Typography**:
    *   **Headings**: *Fraunces* (variable optical-size serif) bringing warm editorial authority.
    *   **Body & UI**: *Plus Jakarta Sans* for crisp legibility down to 12px.
    *   **Devanagari**: *Noto Sans Devanagari* for authentic native script rendering.
    *   **Rupee Figures**: Tabular numerals with bold weight (`tabular-nums font-bold`) so price comparisons align cleanly.
*   **Accessibility**: Full WCAG AA color contrast, minimum 48px touch targets for thumb-friendly mobile operation, and native screen-reader support.

---

## 🏗️ Tech Stack & Architecture

```
RaddiBhaav
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── (public)/          # Landing, Mandi Rates, Scrap Calculator, Auth
│   │   │   ├── (seller)/          # 4-step Scrap Wizard (/sell), Live Bids (/bids)
│   │   │   ├── (dealer)/          # Verified Dealer Marketplace Hub (/dealer)
│   │   │   └── (admin)/           # KYC Queue, Disputes, Rates Editor, Metrics
│   │   ├── api/                   # Serverless route handlers (Bids, Pickups, Offers)
│   │   └── global-error.tsx       # Next.js global error boundary (Sentry hook)
│   ├── components/
│   │   ├── bids/                  # Live timeline, competing offers, doorstep weighin
│   │   ├── dealer/                # Dealer tabs, KYC badges, ledger, one-tap bids
│   │   ├── home/                  # Framer Motion 3D phone mockup, trust strip, FAQs
│   │   ├── layout/                # Responsive Header, Footer, and Role-Aware BottomNav
│   │   └── sell/                  # Category picker, photo compressor, address pin
│   ├── lib/
│   │   ├── bidding/               # Window manager, PostGIS matching, payout formulas
│   │   ├── monitoring/            # Sentry client exception reporting
│   │   ├── notifications/         # Pluggable notifiers (In-App, Push, WhatsApp, SMS)
│   │   ├── offline/               # Service worker sync queue for patchy 4G
│   │   └── security/              # RLS simulators, abuse detectors, OTP rate limits
│   └── messages/                  # Native translations (en.json, hi.json, mr.json)
├── supabase/
│   ├── migrations/                # PostgreSQL schema, PostGIS, Storage, RLS policies
│   └── functions/                 # Supabase Edge Functions (bid expiry, payout)
└── scripts/
    ├── seed-demo-data.ts          # Deterministic seed script for Nashik market
    └── capture_screenshots.ts     # Playwright visual regression capture
```

---

## ⚡ Quick Start

### Prerequisites
*   Node.js 20+ (LTS recommended)
*   npm 10+
*   A free [Supabase](https://supabase.com) account (or use the included credentials)

### 1. Clone & Install
```bash
git clone https://github.com/VishalShir60/raddibhaav.git
cd raddibhaav
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env.local
```
*(The `.env.example` file is pre-populated with public test endpoints so you can run the app immediately.)*

### 3. Launch Development Server
```bash
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) to see the app in action!

---

## 🍇 Demo Marketplace & Nashik Pilot

To showcase the platform with realistic data, a demo seed script is included for **Nashik, Maharashtra** (India's agricultural and industrial hub):

```bash
# Protected by safety guard: runs only when ENABLE_DEMO_SEED=true
npm run seed:demo
```

### Pre-configured Demo Accounts:
| Role | Name | Phone / Login | Area |
| :--- | :--- | :--- | :--- |
| **Admin** | Nashik Market Officer | `+91 99999 00000` | Collectorate Rd |
| **Seller** | Sanjay Patil | `+91 98765 43210` | Gangapur Road |
| **Dealer 1** | Shree Ganesh Scrap Traders | `+91 98230 11111` | College Road |
| **Dealer 2** | Godavari Eco Recyclers | `+91 98230 22222` | Panchavati |
| **Dealer 3** | Nashik Metal & Raddi Mart | `+91 98230 33333` | CIDCO |

*In demo mode, any 6-digit OTP (e.g. `123456`) logs in instantly.*

---

## 🔒 Security & Row Level Security (RLS)

Security is enforced at the database level using PostgreSQL 17 Row Level Security (RLS) rather than relying solely on application logic:

*   **Profiles**: Users can read only their own profile and counterparties in active accepted pickups.
*   **Listings & Bids**: Competing dealers cannot inspect other dealers' bids on open listings.
*   **PostGIS Isolation**: Dealers can query open listings only within their registered operating radius.
*   **Storage Buckets**: Dealer KYC documents (Aadhaar, shop licenses, scale calibration certificates) are stored in a private bucket (`kyc-documents`) accessible only via time-limited authenticated signed URLs.

---

## 🧪 Testing Suite

### Unit & Security Tests (49 Passing Tests)
Runs automated verification of the 15% final-weight payout formula, bid window auto-extensions, anti-lowball dispute flagging, OTP rate limiters, and offline queueing:
```bash
npm test
```

### End-to-End Tests (Playwright)
Simulates complete real-world journeys: Seller creates listing → 3 dealers submit bids → Seller accepts best offer → Doorstep weigh-in with digital scale → Mutual ratings:
```bash
npm run test:e2e
```

### Production Build Verification
```bash
npm run build
```

---

## 🤝 Contributing

We welcome contributions from developers, designers, and recycling enthusiasts!
1. Fork the Project (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 👨‍💻 Credits

Designed and developed by **[Vishal Shirsath](https://www.linkedin.com/in/vishal-shirsath-6138792ab)**

* **LinkedIn**: [vishal-shirsath-6138792ab](https://www.linkedin.com/in/vishal-shirsath-6138792ab)
* **GitHub**: [@VishalShir60](https://github.com/VishalShir60)
* **Location**: Nashik, Maharashtra, India

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ for a cleaner, greener, and fairer India.</sub><br />
  <b>RaddiBhaav — Kabadi ka sahi bhaav.</b>
</div>
