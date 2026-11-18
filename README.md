# WedPlan — Wedding Planning Platform

WedPlan is a full-stack wedding planning marketplace where couples discover wedding professionals and request bookings, vendors publish and manage their services, and admins moderate the platform and monitor revenue.

Customers can browse services without an account, but must be signed in to open a service's full details or send a booking request. Vendors get a dashboard for their services, booking requests and Premium subscription. Admins get a dashboard for users, service moderation and transactions.

> **Live Website:** _Add the deployed client URL here after deployment (see [Deployment](#deployment))._
>
> **Client Repository:** https://github.com/Sonia-Shurmi/wedplan-client
> **Server Repository:** https://github.com/Sonia-Shurmi/wedplan-server

---

## Table of Contents

- [Important Features](#important-features)
- [Technology Stack](#technology-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [How to Run the Project Locally](#how-to-run-the-project-locally)
- [Environment Variables](#environment-variables)
- [Evaluation Accounts](#evaluation-accounts)
- [Deployment](#deployment)
- [Stripe Test Cards](#stripe-test-cards)
- [Security Notes](#security-notes)
- [Scripts](#scripts)
- [License](#license)

---

## Important Features

### Public

- Wedding-themed landing page with a hero banner, trust stats, featured services, category explorer, "Why choose WedPlan", a Premium vendor pitch, "How it works" and testimonials.
- Smooth [Motion](https://motion.dev/) animations on hero, cards and scroll-revealed sections.
- Browse approved and active services with:
  - Keyword search by service name
  - Category filter across the six wedding categories: Photography & Videography, Wedding Venues, Decoration & Florist, Catering Services, Makeup & Styling, Wedding Fashion
  - Location filter
  - Price sorting (ascending / descending)
  - Pagination with result counts
  - Loading skeleton and empty states
- Responsive service cards showing image, category, Premium "Featured Partner" flag, formatted price, name, location, two-line description, vendor business name ("Premium Vendor" / "Wedding Vendor") and a **View Details** action.
- Dynamic, sign-in-required service details page (`/services/[id]`) with an image gallery, description, vendor information and booking panel.
- Full marketing footer with navigation, contact details, social links and copyright.
- Dedicated `not-found`, `error` and loading states — no blank screens and no crashes on invalid IDs.

### Customer

- Email/password registration and Google sign-in through Better Auth. Google sign-up always creates a Customer account; the Vendor role is chosen on the credentials form.
- Role selection at sign-up (Vendor or Customer) with optional profile image uploaded to ImgBB.
- A single `/dashboard` entry point that resolves to the signed-in user's role dashboard, plus role-specific URLs (`/dashboard/admin`, `/dashboard/vendor`, `/dashboard/customer`).
- Protected service details: unauthenticated visitors are redirected to Sign In with `?callbackUrl=<path>` and returned to the page afterwards.
- Booking request form with event date, event location and message.
- Duplicate-booking protection for the same service and event date.
- Customer dashboard with live statistics: total, pending, accepted and rejected bookings.
- "My Bookings" list with service image, vendor, event details, status and request date.
- Cancel a pending booking request; accepted, rejected and cancelled requests are locked.
- Profile settings for name and profile image.

### Vendor

- Vendor dashboard with statistics: total services, active services, pending requests, accepted bookings and current plan.
- Create, edit and delete services with multi-image upload (ImgBB), price, location and category.
- Free plan cap of **3 active services**; Premium removes the cap.
- Service approval status (`pending`, `approved`, `rejected`) and availability toggle.
- Booking request inbox with customer details and event information.
- Accept or reject **pending** requests only; decisions are final.
- Subscription page with Free vs Premium comparison and Stripe Checkout upgrade.
- Premium badge in the dashboard and on service cards.
- Profile settings including business name, name and profile image.

### Admin

- Platform overview: registered users, vendors, customers, total services, pending services and total transaction value.
- User management with search by name/email, role filter, user details, block and unblock.
- Blocked users are rejected by the API, not just hidden in the UI.
- Service moderation: review pending services, approve, reject, activate/deactivate and delete inappropriate listings.
- Transactions table with vendor, plan, amount, currency, status and date — read-only by design.
- Admin accounts can only be created from the server (seed script / database); the public sign-up endpoint refuses the `admin` role.

### Platform

- Server-side JWT verification and role enforcement on every protected API route.
- Resource ownership checks for services and bookings.
- Stripe Premium activation happens **only** from a verified webhook event, never from the success redirect.
- Idempotent webhook handling — one checkout produces exactly one transaction.
- Toast notifications for success and failure states; no `alert()` anywhere.
- Fully responsive layouts for mobile, tablet and desktop.
- Accessible shadcn/ui components with consistent spacing, typography and a custom sage/olive wedding palette.

---

## Technology Stack

| Layer          | Technology                                                       |
| -------------- | ---------------------------------------------------------------- |
| Framework      | Next.js 16 (App Router, TypeScript, React 19)                    |
| Styling        | Tailwind CSS v4, shadcn/ui (base-nova), Custom wedding theme     |
| Animation      | Motion (formerly Framer Motion)                                  |
| Icons          | Lucide React, React Icons                                        |
| Authentication | Better Auth (email/password + Google OAuth, JWT plugin)          |
| API            | Express.js 5 (TypeScript)                                        |
| Database       | MongoDB (official Node.js driver)                                |
| Payments       | Stripe Checkout + Stripe Webhooks (test mode)                    |
| Image Hosting  | ImgBB API (proxied through the server — the key is never public) |
| Notifications  | Sonner toasts                                                    |
| Deployment     | Vercel (client + serverless API), MongoDB Atlas                   |

---

## Architecture

WedPlan uses two independently deployed repositories and one MongoDB database.

```
Browser (Vercel / Next.js)
   │
   ├── Better Auth route handlers  ──────────────►  MongoDB Atlas
   │      /api/auth/*                                users, sessions, accounts,
   │      (same-origin session cookie)               verifications
   │
   ├── Issues short-lived JWT
   │      (Better Auth JWT plugin)
   │
   └── fetch(Authorization: Bearer <jwt>)
          │
          ▼
   Express API (Vercel serverless)
          │  verifies JWT signature via JWKS
          │  reloads the user → role + isBlocked check
          │  verifies resource ownership
          ▼
      MongoDB Atlas  (services, bookings, transactions)
          ▲
          │
      Stripe webhooks (raw body, signature verified)
```

**Why Better Auth runs inside Next.js:** the session cookie stays first-party, so authentication survives page reloads and works in every browser (third-party cookies are blocked by Safari and Firefox). The Express API is still fully JWT-protected: it verifies tokens against the Better Auth JWKS endpoint and re-reads the user from MongoDB on every request, so a forged or stale token cannot escalate privileges.

The client never sends a role, user id or `isBlocked` value that the API trusts. Roles and ownership are always derived server-side.

---

## Project Structure

### Client

```
wedplan-client/
├── app/
│   ├── api/auth/[...all]/route.ts   # Better Auth handler
│   ├── (public)/                    # Home, services, service details
│   ├── (auth)/                      # Sign in, sign up
│   ├── dashboard/
│   │   ├── customer/
│   │   ├── vendor/
│   │   └── admin/
│   ├── payment/success, payment/cancel
│   ├── profile/
│   ├── error.tsx, not-found.tsx, loading.tsx
│   ├── layout.tsx, page.tsx, globals.css
├── components/
│   ├── ui/                          # shadcn primitives
│   ├── layout/                      # navbar, footer, dashboard shell
│   ├── sections/                    # homepage sections
│   ├── services/, bookings/, dashboard/
├── lib/
│   ├── auth.ts                      # Better Auth server config
│   ├── auth-client.ts               # Better Auth React client
│   ├── api.ts                       # typed fetch wrapper + JWT attach
│   ├── upload.ts                    # validated ImgBB upload with progress
│   └── utils.ts
├── hooks/
├── proxy.ts                         # route protection (Next.js 16 middleware)
└── .env.example
```

### Server

```
wedplan-server/
├── api/index.ts                     # Vercel serverless entry
├── src/
│   ├── server.ts / app.ts
│   ├── config/db.ts, env.ts
│   ├── middleware/                  # jwt, role, block, error, validate
│   ├── modules/
│   │   ├── services/, categories/
│   │   ├── bookings/
│   │   ├── users/
│   │   ├── uploads/
│   │   ├── subscriptions/ (Stripe)
│   │   └── stats/
│   ├── scripts/                     # seeders + admin promotion
│   └── utils/
├── vercel.json
└── .env.example
```

---

## Installation

### Prerequisites

| Requirement    | Version / Note                                                              |
| -------------- | --------------------------------------------------------------------------- |
| Node.js        | **20.9+** (Next.js 16 requirement; 22 LTS recommended)                      |
| npm            | 10+                                                                         |
| MongoDB        | MongoDB Atlas cluster (free tier is enough)                                 |
| Stripe account | Test mode enabled                                                           |
| ImgBB account  | API key from https://api.imgbb.com/                                         |
| Google Cloud   | OAuth 2.0 Client (Web application) — optional, Google login is auto-hidden if unset |

### 1. Clone both repositories side by side

```bash
git clone https://github.com/Sonia-Shurmi/wedplan-client.git
git clone https://github.com/Sonia-Shurmi/wedplan-server.git
```

### 2. Install dependencies

```bash
cd wedplan-client
npm install

cd ../wedplan-server
npm install
```

### 3. Configure environment variables

```bash
cd wedplan-client
cp .env.example .env.local

cd ../wedplan-server
cp .env.example .env
```

Fill in the values described in [Environment Variables](#environment-variables).

### 4. Seed the database

```bash
cd wedplan-server
npm run seed:categories    # six wedding categories
npm run seed:services      # demo approved services
npm run seed:admin -- you@example.com 'YourStrongPass1'
```

The admin script upserts a real Better Auth credential account, so the account can sign in immediately and cannot be created through public registration.

### 5. Start both apps

```bash
# terminal 1
cd wedplan-server
npm run dev            # http://localhost:5000

# terminal 2
cd wedplan-client
npm run dev            # http://localhost:3000
```

Open http://localhost:3000.

---

## Environment Variables

### Client (`wedplan-client/.env.local`)

| Variable                      | Required | Description                                                                 |
| ----------------------------- | :------: | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_APP_URL`         |    ✅    | Public client URL. `http://localhost:3000` locally.                         |
| `NEXT_PUBLIC_API_URL`         |    ✅    | Express API base URL **including** `/api`. `http://localhost:5000/api`.     |
| `API_URL`                     |    ✅    | Same as above, used by server components / route handlers.                  |
| `BETTER_AUTH_SECRET`          |    ✅    | 32+ byte random secret: `openssl rand -base64 32`.                          |
| `BETTER_AUTH_URL`             |    ✅    | Base URL of this Next.js app. Used as JWT issuer/audience.                  |
| `MONGODB_URI`                 |    ✅    | MongoDB Atlas connection string. Server-runtime only.                       |
| `DATABASE_NAME`               |    ✅    | Database name, e.g. `wedplan`.                                              |
| `GOOGLE_CLIENT_ID`            |    —     | Google OAuth client id. Google login is hidden when missing.                |
| `GOOGLE_CLIENT_SECRET`        |    —     | Google OAuth client secret.                                                 |
| `NEXT_PUBLIC_GOOGLE_ENABLED`  |    —     | `true` to show the Google button.                                           |

> `MONGODB_URI`, `BETTER_AUTH_SECRET`, and the Google secret are **not** prefixed with `NEXT_PUBLIC_`, so Next.js never ships them to the browser. They are used only in route handlers and server components.

### Server (`wedplan-server/.env`)

| Variable                | Required | Description                                                                   |
| ----------------------- | :------: | ----------------------------------------------------------------------------- |
| `PORT`                  |    —     | Local port (default `5000`). Ignored on Vercel.                               |
| `NODE_ENV`              |    —     | `development` / `production`.                                                 |
| `CLIENT_URL`            |    ✅    | Allowed CORS origin, e.g. `http://localhost:3000` or the Vercel client URL.   |
| `MONGODB_URI`           |    ✅    | MongoDB Atlas connection string.                                              |
| `DATABASE_NAME`         |    ✅    | Database name (must match the client).                                        |
| `BETTER_AUTH_URL`       |    ✅    | Base URL of the Next.js app that issues the JWTs (issuer + audience).         |
| `BETTER_AUTH_JWKS_URL`  |    —     | Override JWKS URL. Defaults to `${BETTER_AUTH_URL}/api/auth/jwks`.            |
| `STRIPE_SECRET_KEY`     |    ✅    | Stripe test secret key (`sk_test_...`).                                       |
| `STRIPE_WEBHOOK_SECRET` |    ✅    | Signing secret of the webhook endpoint (`whsec_...`).                         |
| `PREMIUM_PRICE_CENTS`   |    —     | Premium monthly price in cents. Default `1900` ($19.00).                      |
| `IMGBB_API_KEY`         |    ✅    | ImgBB API key. Used only server-side for uploads.                             |

**Never commit `.env`, `.env.local`, or any file containing real credentials.** Both repositories ignore them; only `.env.example` is tracked.

---

## Evaluation Accounts

_Replace the placeholders below with the live credentials before submitting._

| Role     | Email                    | Password        | Notes                                           |
| -------- | ------------------------ | --------------- | ----------------------------------------------- |
| Admin    | `admin@wedplan.dev`      | `AdminPass1`    | Created with `npm run seed:admin`, never via UI |
| Vendor   | `vendor@wedplan.dev`     | `VendorPass1`   | Premium vendor with seeded services             |
| Customer | `customer@wedplan.dev`   | `CustomerPass1` | Has pending and accepted bookings               |

Admin accounts cannot be registered from the Sign Up page: the Better Auth `user.create.before` hook forces every public registration to `vendor` or `customer`.

---

## Deployment

### MongoDB Atlas

1. Create a free M0 cluster and a database user.
2. Network Access → allow `0.0.0.0/0` (Vercel serverless has no fixed IPs) or use a Vercel-compatible private endpoint.
3. Copy the SRV connection string into both projects' `MONGODB_URI`.

### Client — Vercel

| Setting          | Value                                          |
| ---------------- | ---------------------------------------------- |
| Framework        | Next.js                                        |
| Root directory   | repository root                                |
| Build command    | `npm run build`                                |
| Environment      | all client variables from the tables above     |

Set `NEXT_PUBLIC_APP_URL` and `BETTER_AUTH_URL` to the final production URL (e.g. `https://wedplan.vercel.app`) **before** the first production sign-in, so cookies and JWT issuers line up.

### Server — Vercel

The Express app is exported as a serverless handler from `api/index.ts` and routed by `vercel.json`.

| Setting        | Value                                        |
| -------------- | -------------------------------------------- |
| Framework      | Other                                        |
| Root directory | repository root                              |
| Build command  | `npm run build`                              |
| Output         | `api/index.ts` (Node runtime)                |

Set `CLIENT_URL` to the client origin exactly (no trailing slash), and `BETTER_AUTH_URL` to the client origin so the API can fetch `${BETTER_AUTH_URL}/api/auth/jwks`.

The server reuses one `MongoClient` across invocations to avoid connection storms on cold starts.

### Google OAuth

Authorized JavaScript origin:

```
https://your-client.vercel.app
```

Authorized redirect URI:

```
https://your-client.vercel.app/api/auth/callback/google
```

### Stripe webhook

1. Stripe Dashboard → Developers → Webhooks → Add endpoint.
2. Endpoint URL: `https://your-server.vercel.app/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`.
4. Copy the signing secret into `STRIPE_WEBHOOK_SECRET` and redeploy.

Premium is granted **only** inside this webhook. The `/payment/success` page merely polls the server for the resulting subscription state.

### Post-deployment checklist

- [ ] Every public route reloads without a 404 (Vercel handles App Router routes automatically).
- [ ] `/dashboard/*` reloads keep the user signed in.
- [ ] Customer cannot open `/dashboard/vendor` or `/dashboard/admin` (redirected, plus API returns 403).
- [ ] Stripe test upgrade flips the vendor to Premium and writes one transaction.
- [ ] `STRIPE_WEBHOOK_SECRET` is set in production (not just locally).
- [ ] Admin credentials from the table above work on the live site.
- [ ] No `.env` file is present in either GitHub repository.

---

## Stripe Test Cards

| Scenario             | Card number           |
| -------------------- | --------------------- |
| Successful payment   | `4242 4242 4242 4242` |
| Declined payment     | `4000 0000 0000 0002` |
| 3D Secure required   | `4000 0025 0000 3155` |

Use any future expiry date, any 3-digit CVC, and any postal code.

---

## Security Notes

- JWT verification uses the Better Auth JWKS public keys; the API never shares the signing secret.
- The API re-reads the user on every request, so blocking a user or changing a role takes effect immediately.
- Unauthorized requests return `401`; authenticated-but-forbidden requests return `403`.
- Ownership checks run before any update or delete (services and bookings).
- Stripe amount, currency and plan come from server-side constants, never from the request body.
- Webhook handlers are idempotent and only mark a transaction paid after signature verification.
- ImgBB uploads are proxied through the server with MIME and size validation; the API key never reaches the browser.
- Public registration can never produce an `admin`, and users cannot change their own role, subscription plan or blocked state.

---

## Scripts

### Client

| Command             | Description                     |
| ------------------- | ------------------------------- |
| `npm run dev`       | Start Next.js in development    |
| `npm run build`     | Production build                |
| `npm run start`     | Serve the production build      |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | TypeScript check without output |

### Server

| Command                  | Description                                  |
| ------------------------ | -------------------------------------------- |
| `npm run dev`            | Start Express with hot reload (`tsx watch`)  |
| `npm run build`          | Compile TypeScript to `dist/`                |
| `npm run start`          | Run the compiled server                      |
| `npm run typecheck`      | TypeScript check without output              |
| `npm run seed:categories`| Insert the six wedding categories            |
| `npm run seed:services`  | Insert demo approved services                |
| `npm run seed:admin`     | Create/promote an admin account securely     |

---

## License

This project was built as a full-stack development assignment. It is not affiliated with The Knot or Zola.
