# Kathan N. Patel — Portfolio Website

Next.js 15 · TypeScript · Tailwind CSS · Supabase · Framer Motion

---

## ✨ What's Included

| Feature | Details |
|---|---|
| 🌗 Light / Dark theme | Toggle in navbar; defaults to dark. Powered by `next-themes` |
| 🛡️ Bot protection | Cloudflare Turnstile CAPTCHA, server-side verified |
| 🔢 Animated counters | Stats count up on scroll with easeOutExpo |
| 📄 Multi-page app | About, Skills, Experience, Projects, Education, GitHub, Blog, Estimator |
| 🐙 GitHub Showcase | Live GitHub API — repos, stars, forks, languages, topics |
| ✍️ Blog | Supabase-backed rich posts: text, images, YouTube/Vimeo/video, links, code, quotes |
| 🧮 Cost Estimator | 7-step wizard → animated INR range result |
| 📬 Contact form | Validated → Turnstile CAPTCHA → Supabase insert |

---

## 🚀 Local Setup

```bash
npm install
cp .env.example .env.local   # fill in keys
npm run dev
```

---

## 🗄️ Supabase: contact_submissions table

```sql
CREATE TABLE contact_submissions (
  id         uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  name       text        NOT NULL,
  email      text        NOT NULL,
  phone      text,
  message    text        NOT NULL,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anon inserts" ON contact_submissions FOR INSERT TO anon WITH CHECK (true);
```

## 🗄️ Supabase: blog_posts table

```sql
CREATE TABLE blog_posts (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  title        text        NOT NULL,
  slug         text        UNIQUE NOT NULL,
  excerpt      text,
  cover_image  text,
  content      jsonb       NOT NULL DEFAULT '[]',
  tags         text[]      DEFAULT '{}',
  published    boolean     DEFAULT false,
  published_at timestamptz,
  created_at   timestamptz DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published" ON blog_posts FOR SELECT TO anon USING (published = true);
```

## ✍️ Blog content format (jsonb)

```json
[
  { "type": "heading",  "level": 2, "content": "My Section" },
  { "type": "text",     "content": "Paragraph with <b>HTML</b> supported." },
  { "type": "image",    "url": "https://cdn.../img.jpg", "caption": "Optional caption" },
  { "type": "video",    "url": "https://youtube.com/watch?v=xxx", "platform": "youtube" },
  { "type": "link",     "url": "https://example.com", "title": "Link title", "description": "Optional desc" },
  { "type": "code",     "language": "csharp", "content": "Console.WriteLine(\"Hello!\");" },
  { "type": "quote",    "content": "Great quote here.", "author": "Someone" },
  { "type": "divider" }
]
```

Set `published = true` and `published_at = now()` to publish a post.

---

## 🛡️ Cloudflare Turnstile

1. [dash.cloudflare.com](https://dash.cloudflare.com) → Turnstile → Add Site
2. `NEXT_PUBLIC_TURNSTILE_SITE_KEY` = Site Key (public)
3. `TURNSTILE_SECRET_KEY` = Secret Key (server-only, never expose)
{
  These are Cloudflare's official dummy keys — they always pass the challenge and work on any localhost or domain. No Cloudflare account needed during development.
  NEXT_PUBLIC_TURNSTILE_SITE_KEY=1x00000000000000000000AA
  TURNSTILE_SECRET_KEY=1x0000000000000000000000000000000AA
}
Form works without these — just skips CAPTCHA. Add before going to production.

---

## 🔑 Environment Variables (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAAAxxx
TURNSTILE_SECRET_KEY=0x4AAAAAAAsecretxxx
```

---

## 📄 Resume

Drop `Kathan_Patel_Resume.pdf` in `/public/`. Download buttons work automatically.

## 🔗 LinkedIn URL

Edit `lib/data.ts` → `linkedin: "https://www.linkedin.com/in/YOUR-URL"`

## ✏️ All Content

Edit `lib/data.ts` — single source of truth for all portfolio text.

---

## ☁️ Vercel Deploy

1. Push to GitHub
2. vercel.com → New Project → import
3. Add all 4 env vars
4. Deploy

Update `metadataBase` in `app/layout.tsx` to your real domain.
