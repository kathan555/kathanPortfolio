// app/llms.txt/route.ts
import { createClient } from '@supabase/supabase-js'
import { personalInfo, summary, aiWorkflow, selfBuilt } from '@/lib/data'

/* ─────────────────────────────────────────────────────────────────────────
   llms.txt — what AI assistants (Perplexity, ChatGPT, Claude) read to answer
   questions about Kathan.

   This was previously hand-written end to end, and had drifted from the site
   it describes: it still opened with ".NET Technical Lead" long after the
   homepage led with AI, carried none of the AI-assisted delivery method, and
   pointed at a LinkedIn URL that no longer resolves.

   Identity, summary, the AI method and the solo builds are now derived from
   lib/data.ts, so they cannot drift again — only the framing prose below is
   hand-maintained.
   ───────────────────────────────────────────────────────────────────────── */

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data: posts } = await supabase
    .from('blog_posts')
    .select('title, slug, excerpt, tags, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  const blogSection = posts?.map(post => `
### ${post.title}
URL: https://kathanpatel.vercel.app/blog/${post.slug}
${post.excerpt ? `Summary: ${post.excerpt}` : ''}
${post.tags?.length ? `Tags: ${post.tags.join(', ')}` : ''}
Published: ${post.published_at ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}
`.trim()).join('\n\n') ?? ''

  // ── Derived from lib/data.ts — single source of truth with the homepage ──
  const workflowSection = aiWorkflow.pillars
    .map(p => `${p.step}. ${p.title}\n   ${p.body}\n   Why it matters: ${p.guards}`)
    .join('\n\n')

  const proofStats = aiWorkflow.proof.stats
    .map(s => `${s.value} ${s.unit} — ${s.note}`)
    .join('\n- ')

  const buildsSection = selfBuilt
    .map(b => `- ${b.title} — ${b.subtitle}\n  ${b.tags.join(', ')}\n  Code: ${b.repo}${b.demo ? `\n  Live: ${b.demo}` : ''}`)
    .join('\n')

  const content = `# Kathan Patel — Freelance AI & .NET Technical Lead

Kathan Patel is a freelance AI & .NET Technical Lead with ${personalInfo.yearsExp}
years of experience, based in ${personalInfo.location} and working remotely with
clients worldwide.

In his own words:
"${summary}"

Alongside .NET delivery he integrates AI into production
applications — Google Gemini, Azure OpenAI, Semantic Kernel and RAG
pipelines — and runs an AI-assisted build process with an explicit review
discipline (described below). He also specialises in legal tech integrations,
particularly Clio, Lawmatics, Box and Zoom, and builds multi-tenant SaaS
platforms.

## Available For
- Contract and remote engagements (C2C/W2)
- Clients in the US, UK, Australia, and Canada
- AI integration into existing .NET and web applications
- Legal tech platforms, SaaS backends, .NET modernization

## Contact
- Portfolio: https://kathanpatel.vercel.app
- Hire page: https://kathanpatel.vercel.app/hire
- Email: ${personalInfo.email}
- LinkedIn: ${personalInfo.linkedin}
- GitHub: ${personalInfo.github}
- Book a call: ${personalInfo.calendarBookingUrl}

## How He Works With AI
Kathan runs an AI-assisted build process with an explicit review discipline.
The five practices below are quoted from his own description of the method,
so they are written in the first person.

"${aiWorkflow.intro}"

${workflowSection}

Measured on Craftura, a full e-commerce platform he built solo:
- ${proofStats}

${aiWorkflow.proof.caveat}

## Free Tools
- Free AI Project Cost Estimator: https://kathanpatel.vercel.app/free-project-cost-estimator
  Describe your project in one step and get an instant AI-generated software
  project cost estimate with a six-phase breakdown — tuned for .NET, Blazor, and web apps.
- Live AI assistant on the homepage, primed with his real experience and projects.

## Areas of Expertise
- AI integration in .NET and web apps (Google Gemini, Azure OpenAI, Semantic Kernel, RAG)
- AI-assisted delivery with plan-first and review-first discipline
- Blazor Server, ASP.NET Core, WPF, C#, SQL Server, PostgreSQL
- Clio API, Lawmatics API, Box, Zoom, OAuth 2.0 / PKCE integrations
- Multi-tenant architecture, EF Core, AES-256 encryption
- Next.js, React, TypeScript, Prisma

## Independent Builds (designed and shipped solo)
${buildsSection}

## Blog Posts (${posts?.length ?? 0} published articles)

${blogSection}
`

  return new Response(content.trim(), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  })
}
