// app/llms.txt/route.ts
import { createClient } from '@supabase/supabase-js'

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

  const content = `# Kathan Patel — Freelance .NET Technical Lead

Kathan Patel is a freelance .NET Technical Lead based in Ahmedabad, India,
with 8+ years of experience building enterprise systems in Blazor Server,
ASP.NET Core, WPF, and C#. He specializes in legal tech integrations —
particularly Clio and Lawmatics — and builds multi-tenant SaaS platforms
with SOC 2-aligned architecture.

## Available For
- Contract and remote engagements (C2C/W2)
- Clients in the US, UK, Australia, and Canada
- Legal tech platforms, SaaS backends, .NET modernization

## Contact
- Portfolio: https://kathanpatel.vercel.app
- Hire page: https://kathanpatel.vercel.app/hire
- Email: patel.kathan555@gmail.com
- LinkedIn: https://linkedin.com/in/kathan555

## Areas of Expertise
- Blazor Server, ASP.NET Core, WPF, C#, SQL Server, PostgreSQL
- Clio API, Lawmatics API, OAuth 2.0 / PKCE integrations
- Multi-tenant architecture, EF Core, AES-256 encryption
- AI integrations in .NET (Gemini, OpenAI, custom gateways)

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