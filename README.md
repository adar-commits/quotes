# Quotes

Next.js app with Supabase (auth and database).

## Setup

```bash
npm install
```

Copy `.env.local.example` to `.env.local` and fill in your Supabase project URL and keys (from [Supabase Dashboard](https://supabase.com/dashboard) → Project Settings → API).

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in at `/login`.

## Quote page

- Optional: add `invoice_header.jpg` to the `public/` folder to show a custom top banner on quotation pages. If missing, a gradient placeholder is shown.

## Supabase

- Enable an Auth provider (e.g. Google) in Authentication → Providers.
- Add redirect URL: `http://localhost:3000/auth/callback` (and your production URL when you deploy).

## Build

```bash
npm run build
npm start
```

## GitHub (one-time)

If you haven’t pushed yet: create a new repository named `quotes` on [github.com/new](https://github.com/new) (private or public), then run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/quotes.git
git push -u origin main
```

(Use your GitHub username; or use the SSH URL if you prefer.)
