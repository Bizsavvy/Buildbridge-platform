# 🌉 BuildBridge


**Micro-crowdfunding for Nigerian tradespeople — built with trust, backed by community**

BuildBridge is a Nigeria-native, web-based micro-crowdfunding platform exclusively for informal tradespeople and micro-entrepreneurs. We enable artisans to create targeted, small-scale funding requests for specific business needs while building trust through community vouching and verification.

---

## 📖 Table of Contents

- [Mission](#mission)
- [The Problem](#the-problem)
- [Our Solution](#our-solution)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [MVP Goals](#mvp-goals)
- [Team](#team)
- [License](#license)

---

## 🎯 Mission

BuildBridge exists to make it easy for people in Nigeria to back the skilled workers building their communities — one specific need, one honest story, and one community vouch at a time. We use the language of investment, not charity. We measure success by tools repaired, businesses restored, and livelihoods secured.

---

## 🔍 The Problem

Tradespeople in Nigeria's informal economy face a documented funding gap:

- **No access to crowdfunding**: GoFundMe, Kickstarter, and Indiegogo block Nigerian payment infrastructure
- **Predatory lending**: Loan apps charge 30–40% interest rates, creating debt spirals
- **Limited networks**: Family and ajo systems cannot reach diaspora or institutional funders
- **No trust mechanisms**: Existing local platforms lack verification and post-funding accountability

**Our research shows**: 6 survey respondents across Lagos, Ibadan, Anambra, and Nnewi are currently borrowing from family, using exploitative loan apps, or going without funding entirely. None use any crowdfunding platform.

---

## 💡 Our Solution

BuildBridge provides:

1. **Trade-specific profiles** with progressive verification badges (Level 0-4)
2. **Micro-need listings** for exact items with AI-generated impact statements
3. **Community vouching** that replaces institutional barriers with local trust
4. **Keep-what-you-raise model** — no all-or-nothing pressure
5. **Proof-of-use updates** with photos/videos sent to all backers
6. **Public Impact Wall** showcasing funded stories to build trust
7. **Payment infrastructure** that actually works in Nigeria (Paystack + Stripe for diaspora)

---

## ✨ Key Features

### For Tradespeople
- 📱 **Phone-first onboarding** with OTP (email optional)
- 🎨 **Visual-first UX** designed for low digital literacy
- 🤖 **AI-powered impact statements** (DeepSeek integration)
- 📸 **WhatsApp share cards** auto-generated for every need
- ✅ **Progressive verification** — NIN/BVN + community vouching
- 💰 **Direct disbursement** to bank account within 48 hours

### For Backers
- 🔍 **Browse by trade, location, and verification level**
- 💎 **Fee transparency** — breakdown shown before pledge
- 📬 **Post-funding updates** — see proof-of-use photos/videos
- 🌍 **International support** — Stripe for diaspora payments
- 📊 **Impact Feed** — chronological updates from backed needs

### Platform Features
- 🛡️ **5-layer verification** (Phone + Geotag + Vouching + NIN/BVN + Human review)
- 🏛️ **Impact Wall** — public gallery of funded stories (photos + videos)
- 🔒 **NDPR compliant** — Nigerian data protection standards
- ⚡ **PWA-ready** — installable, offline-capable
- 📈 **Analytics dashboard** for community leaders

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **State Management**: React Context API + Zustand
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Custom components + shadcn/ui

### Backend
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Authentication**: Supabase Auth (Phone OTP via Twilio)
- **Storage**: Supabase Storage (images, videos)
- **Edge Functions**: Supabase Edge Functions
- **AI**: [DeepSeek API](https://www.deepseek.com/) (impact statement generation)

### Integrations
- **Payments**: Paystack (local) + Stripe (international)
- **SMS/WhatsApp**: Termii (SMS) + Twilio (WhatsApp Business API)
- **Verification**: Dojah or Prembly (NIN/BVN lookup)
- **Email**: SendGrid (optional notifications)

### DevOps
- **Hosting**: [Vercel](https://vercel.com/)
- **CI/CD**: GitHub Actions
- **Monitoring**: Vercel Analytics
- **Version Control**: Git + GitHub

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Git**
- **Supabase account** (free tier)
- **Vercel account** (optional, for deployment)

### Installation

1. **Clone the repository**
```bash
   git clone https://github.com/your-org/buildbridge-platform.git
   cd buildbridge-platform
```

2. **Install dependencies**
```bash
   npm install
```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # DeepSeek AI
   DEEPSEEK_API_KEY=your_deepseek_api_key

   # Paystack
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
   PAYSTACK_SECRET_KEY=your_paystack_secret_key

   # Stripe (for diaspora)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
   STRIPE_SECRET_KEY=your_stripe_secret_key

   # Twilio (SMS/WhatsApp)
   TWILIO_ACCOUNT_SID=your_twilio_sid
   TWILIO_AUTH_TOKEN=your_twilio_token
   TWILIO_PHONE_NUMBER=your_twilio_number

   # Termii (SMS fallback)
   TERMII_API_KEY=your_termii_key

   # Verification
   DOJAH_API_KEY=your_dojah_key
   # or
   PREMBLY_API_KEY=your_prembly_key

   # App Config
   NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Set up Supabase database**
   
   Run migrations:
```bash
   npx supabase db push
```

   Or manually run the SQL from `supabase/migrations/`

5. **Start the development server**
```bash
   npm run dev
```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure
