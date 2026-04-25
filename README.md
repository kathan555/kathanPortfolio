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

---

### ⚠️ You must do before going live

1. **LinkedIn URL** — update `lib/data.ts` → `personalInfo.linkedin`
2. **Resume PDF** — drop `Kathan_Patel_Resume.pdf` in `/public/`
3. **Real domain** — update `metadataBase` in `app/layout.tsx` and add domain in Vercel
4. **Real testimonials** — replace placeholder quotes in `lib/data.ts` → `testimonials`
   - Ask 2–3 past colleagues/managers for a short quote via LinkedIn or email
   - Update `name`, `role`, `initials`, and `quote` fields
   - Delete the yellow warning box inside `TestimonialsSection.tsx` once done
5. **Cloudflare Turnstile** — set up free account and add real keys to Vercel env vars
6. **Availability status** — set `availableForWork: true/false` and `availableFrom` in `lib/data.ts`

### Hiding GitHub repos
Edit `app/github/page.tsx` → add repo names to the `HIDDEN_REPOS` array.

---

### ✅ SEO Blog Posts
Three ready-to-publish blog posts are in `/docs/sample-blog-posts.md`:
1. **"How to Migrate a WPF App to Blazor Server in 2025"** — targets developers/decision-makers researching migration
2. **"5 Things Clients Look for When Hiring a Freelance .NET Developer"** — targets people searching for ".NET freelancer"
3. **"How Much Does Custom .NET Software Development Cost in 2025?"** — targets people searching for ".NET development cost" (also directly supports your /estimator page)

Copy the JSON content blocks into Supabase → `blog_posts` table. Set `published = true`.

### ✅ Google Search Console
1. Go to [search.google.com/search-console](https://search.google.com/search-console)
2. Add your domain (e.g. `kathanpatel.dev`)
3. Verify via DNS TXT record (Vercel makes this easy — Domains → DNS)
4. After site is live, click **URL Inspection → Request Indexing** for your homepage
5. Submit sitemap: **Sitemaps → Add sitemap** → enter `https://kathanpatel.dev/sitemap.xml`
   Your sitemap is auto-generated at `/sitemap.xml` via `app/sitemap.ts` — no extra package needed.

### ✅ Sitemap + robots.txt
- `app/sitemap.ts` — generates `/sitemap.xml` automatically (includes all pages + blog posts)
- `app/robots.ts` — generates `/robots.txt` automatically
- No extra packages needed — this is built into Next.js 15 App Router

### ✅ Put Your URL Everywhere
After deploying, add `https://kathanpatel.dev` (your real URL) to:
- [ ] **GitHub profile bio** — github.com → Edit profile → Website
- [ ] **LinkedIn headline** — "Freelance .NET Developer | kathanpatel.dev"
- [ ] **LinkedIn About section** — add the URL in the first 2 lines
- [ ] **Email signature** — "Kathan N. Patel | kathanpatel.dev | patel.kathan555@gmail.com"
- [ ] **WhatsApp bio / status** — just the URL is enough
- [ ] **Freelance platforms** — Toptal, Gun.io, Arc.dev, Contra (profile website field)

---

## AI Integration Page (/ai-integration)

### What's on this page
- Hero explaining .NET + AI opportunity
- **Live AI demo widget** — real chat powered by Claude API (not a mockup)
- Architecture SVG diagram (Blazor → ChatService → Semantic Kernel → Azure OpenAI)
- 4 real C# code blocks: Semantic Kernel setup, ChatService, Blazor component, RAG pattern
- 6 use case cards: AI chat, data extraction, report generation, code review, automation, semantic search
- Tech stack breakdown: Semantic Kernel, Azure OpenAI, Qdrant, Blazor, Hangfire
- CTA linking to /contact and /estimator

### Setting up the live demo (ANTHROPIC_API_KEY)

1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key
2. Add to `.env.local`:
   ```
   ANTHROPIC_API_KEY=sk-ant-your-key-here
   ```
3. Add the same key in Vercel → Project → Settings → Environment Variables

The demo uses `claude-haiku-4-5` (cheapest model) and is rate-limited to 10 requests/min per IP.
Without the key, the demo widget still renders but the send button returns a 502 error.

### Content positioning strategy
The page is written as a **knowledge resource + service showcase** — not a fake case study.
It demonstrates architectural knowledge and pattern understanding, which is honest and credible.
The live demo is the key differentiator — visitors can interact with working AI, not read about it.
