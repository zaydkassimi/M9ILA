# M9ila — Restaurant Website & Admin Dashboard

Bilingual (French/Arabic) restaurant website and admin dashboard for **M9ila** (مقيلة), a fast food restaurant in Maarif, Casablanca, Morocco.

## Features

### Public Website
- Responsive landing page with hero, menu, about, delivery, gallery, testimonials, and contact sections
- Bilingual support (French/Arabic) with RTL layout
- AI-powered chatbot (OpenRouter) for customer questions
- Online ordering with cart and checkout
- SEO optimized (robots.txt, sitemap.xml, Open Graph, Twitter Cards)

### Admin Dashboard (`/admin`)
- **Dashboard** — Overview stats (products, categories, orders, contacts)
- **Products** — Full CRUD with image upload, emoji picker, availability toggle
- **Categories** — Full CRUD with slug auto-generation
- **Orders** — Order listing with status filter, detail view, status updates
- **Contacts** — Contact form submissions management
- **Settings** — General, Appearance, Features, SMTP, AI, Gallery configuration
- **Admins** — User management (superadmin-only)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS + shadcn/ui
- **Animations:** Framer Motion
- **Database:** PostgreSQL via Prisma ORM
- **Auth:** NextAuth.js (JWT sessions, bcrypt)
- **Validation:** Zod
- **Email:** Nodemailer

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and fill in:
   - `DATABASE_URL` — Your PostgreSQL connection string
   - `NEXTAUTH_SECRET` — Generate with: `openssl rand -base64 32`
   - `NEXTAUTH_URL` — Your site URL (e.g., `http://localhost:3000` for dev, `https://yourdomain.com` for prod)
   - `OPENROUTER_API_KEY` — (Optional) For AI chatbot
   - `SEED_ADMIN_PASSWORD` — (Optional) Set a custom admin password, otherwise a random one is generated

3. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```
   > ⚠️ **IMPORTANT:** After seeding, note the generated admin password displayed in the console. Change it immediately after first login!

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

5. **Access the admin panel**
   - URL: [http://localhost:3000/login](http://localhost:3000/login)
   - Email: `admin@m9ila.com`
   - Password: (shown in console after `npm run db:seed`)

## Deployment Checklist

Before deploying to production:

- [ ] Set `NEXTAUTH_URL` to your production domain (e.g., `https://m9ila.com`)
- [ ] Generate a new `NEXTAUTH_SECRET` (do NOT reuse the development one)
- [ ] Use a production PostgreSQL database (Neon, Supabase, Railway, etc.)
- [ ] Configure SMTP settings for email notifications
- [ ] Set `SEED_ADMIN_PASSWORD` to a strong password
- [ ] Run `npm run db:push` and `npm run db:seed` on production
- [ ] Change the default admin password after first login
- [ ] Upload real restaurant photos (gallery + product images)
- [ ] Set `ONLINE_ORDERING_ENABLED=true` if you want online orders
- [ ] Add Google Analytics or Plausible for tracking (optional)

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:push` | Push Prisma schema to database |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:studio` | Open Prisma Studio (database GUI) |

## Security

This application implements:
- Rate limiting on all public endpoints (login, contact, orders, chat, upload)
- Brute-force protection (5 failed attempts → 15 min lockout)
- HTML entity encoding to prevent XSS
- CSRF protection via Origin/Referer verification + SameSite cookies
- Content Security Policy (CSP) and HSTS headers
- Secure session cookies (`__Host-` prefix, HttpOnly, Secure, SameSite)
- File upload validation (magic numbers, size limits, safe extensions)
- AI prompt injection detection
- Strong password policy (uppercase + lowercase + numbers)
- Sensitive settings masked in API responses
- Allowed-keys whitelist for settings updates

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Public landing page
│   ├── order/page.tsx        # Online ordering page
│   ├── login/page.tsx        # Admin login
│   ├── admin/                # Admin dashboard pages
│   ├── api/                  # API routes
│   ├── layout.tsx            # Root layout + metadata
│   ├── loading.tsx           # Global loading UI
│   ├── error.tsx             # Global error boundary
│   ├── not-found.tsx         # 404 page
│   ├── robots.ts             # Dynamic robots.txt
│   └── sitemap.ts            # Dynamic sitemap
├── components/
│   ├── Menu.tsx              # Dynamic menu (from DB)
│   ├── Gallery.tsx           # Gallery (from settings)
│   ├── Delivery.tsx          # Delivery section
│   ├── Footer.tsx            # Footer (settings-driven)
│   └── ...                   # Other UI components
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── auth.ts               # NextAuth configuration
│   ├── validations.ts        # Zod schemas + HTML encoding
│   ├── rate-limit.ts         # Rate limiting
│   └── utils.ts              # Utility functions
└── middleware.ts             # Security headers + auth protection
prisma/
├── schema.prisma             # Database schema
└── seed.ts                   # Database seeder
```

## License

Private — All rights reserved.
