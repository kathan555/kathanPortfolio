# Sample Blog Posts for Supabase

Paste each block into the Supabase Table Editor (`blog_posts` table).
Set `published = true` and `published_at = now()` to make them visible.

---

## Post 1 — WPF to Blazor Migration

**title:** How to Migrate a WPF App to Blazor Server in 2025

**slug:** wpf-to-blazor-migration-2025

**excerpt:** WPF apps are powerful — but they're hard to deploy, update remotely, or access from outside the office. Here's my step-by-step approach to migrating a WPF app to Blazor Server without rewriting everything.

**tags:** ["Blazor", ".NET", "WPF", "Migration", "C#"]

**content (paste as JSON into the content column):**

```json
[
  {"type":"heading","level":2,"content":"Why Migrate from WPF to Blazor?"},
  {"type":"text","content":"WPF desktop apps have been the backbone of enterprise .NET software for over 15 years. But as teams go remote and businesses demand browser-accessible tools, WPF's biggest weakness becomes clear — it requires installation, manual updates, and local network access. Blazor Server solves all three."},
  {"type":"heading","level":2,"content":"What You Keep, What You Rewrite"},
  {"type":"text","content":"The good news: your C# business logic, EF Core data layer, LINQ queries, and service classes move over almost untouched. What changes is the UI layer — XAML becomes Razor components, and code-behind becomes component lifecycle methods."},
  {"type":"heading","level":3,"content":"Phase 1: Extract Business Logic"},
  {"type":"text","content":"Start by separating UI from logic. Any code in `.xaml.cs` files that touches a database, calls an API, or runs calculations — extract it into plain C# service classes. These become your Blazor injectable services with zero changes."},
  {"type":"code","language":"csharp","content":"// Before: WPF code-behind\nprivate void LoadData()\n{\n    var items = _db.Products.Where(p => p.Active).ToList();\n    ProductGrid.ItemsSource = items;\n}\n\n// After: Blazor service (identical logic)\npublic class ProductService\n{\n    public List<Product> GetActiveProducts() =>\n        _db.Products.Where(p => p.Active).ToList();\n}"},
  {"type":"heading","level":3,"content":"Phase 2: Map XAML Controls to Razor Components"},
  {"type":"text","content":"Most WPF controls have direct Blazor equivalents — especially if you use Syncfusion or Telerik, which ship both WPF and Blazor component libraries with near-identical APIs. DataGrid becomes SfGrid, Charts become SfChart, and so on."},
  {"type":"heading","level":3,"content":"Phase 3: Real-Time with SignalR"},
  {"type":"text","content":"Blazor Server uses SignalR under the hood. If your WPF app had real-time data (stock tickers, live order status), this actually becomes easier — Blazor Server pushes UI updates automatically when server state changes."},
  {"type":"heading","level":2,"content":"Timeline and Cost Estimate"},
  {"type":"text","content":"A mid-size WPF app (10–15 screens, 3–5 modules) typically takes 6–10 weeks to migrate with an experienced .NET developer who knows both stacks. The payoff: browser access, zero client installation, and modern DevOps deployment."},
  {"type":"quote","content":"The best migrations aren't rewrites — they're careful extractions. Keep what works, modernise what doesn't.","author":"Kathan N. Patel"},
  {"type":"text","content":"If you have a WPF app you're looking to modernise, I'd love to chat. Use the <a href='/contact'>contact form</a> or <a href='/estimator'>estimate your migration cost</a> with my free tool."}
]
```

---

## Post 2 — Freelance .NET Tips

**title:** 5 Things Clients Look for When Hiring a Freelance .NET Developer

**slug:** hiring-freelance-dotnet-developer-what-clients-want

**excerpt:** After 8+ years in .NET development and working directly with clients, I've noticed patterns in what makes a hire feel safe and what raises red flags. Here's an honest breakdown.

**tags:** [".NET", "Freelance", "Career", "Client Tips"]

**content:**

```json
[
  {"type":"text","content":"If you've tried hiring a freelance .NET developer recently, you know the challenge: hundreds of profiles, wildly varying rates, and no clear way to tell who will actually deliver. Here's what I've seen clients prioritise — from both sides of the table."},
  {"type":"heading","level":2,"content":"1. Evidence of Shipped Work, Not Just Skills"},
  {"type":"text","content":"A skills list means nothing without context. Clients want to see <em>what</em> you built, <em>who</em> it was for, and <em>what outcome</em> it produced. 'Built a Blazor dashboard' is weak. 'Built a real-time Blazor dashboard that replaced a 3-hour manual Excel process for a healthcare client' — that lands."},
  {"type":"heading","level":2,"content":"2. Communication Before Code"},
  {"type":"text","content":"Technical skill is table stakes. What separates good freelancers from great ones is how they handle ambiguity. Do you ask clarifying questions before you build? Do you flag risks early? Clients who've been burned by developers who disappeared for 3 weeks before delivering something wrong value communication above everything."},
  {"type":"heading","level":2,"content":"3. Domain Knowledge Alongside Tech Stack"},
  {"type":"text","content":"A .NET developer who has built fintech apps understands regulatory constraints, data precision requirements, and audit trails — without needing to be taught. A developer who has worked in healthcare understands HL7, HIPAA, and medical record integrity. Domain experience dramatically reduces onboarding time and costly mistakes."},
  {"type":"heading","level":2,"content":"4. Transparent Pricing (Even if It's High)"},
  {"type":"text","content":"Clients would rather get a clear $12,000 quote upfront than a $6,000 quote that balloons to $18,000 mid-project. Fixed-price projects with clear scope, or hourly with a defined cap, both work — vague 'we'll see how it goes' doesn't."},
  {"type":"heading","level":2,"content":"5. A Clean Handover Plan"},
  {"type":"text","content":"The first question every smart client asks: 'What happens when we're done?' Do you document the codebase? Do you set up CI/CD? Do you provide a transition period? Freelancers who think about this upfront signal professional maturity."},
  {"type":"divider"},
  {"type":"text","content":"If you're looking for a freelance .NET developer who ticks these boxes, <a href='/hire'>see how I work</a> or <a href='/contact'>drop me a message</a>."}
]
```

---

## Post 3 — Project Cost Estimation

**title:** How Much Does Custom .NET Software Development Cost in 2025?

**slug:** dotnet-software-development-cost-2025

**excerpt:** One of the most common questions I get: 'How much will it cost to build X?' The honest answer is: it depends — but not in the hand-wavy way. Here's a real breakdown.

**tags:** [".NET", "Pricing", "Freelance", "Software Development", "Blazor"]

**content:**

```json
[
  {"type":"text","content":"Custom software pricing is famously opaque. You ask three developers for a quote and get three wildly different numbers. This post breaks down the real factors that drive .NET development costs — so you can budget accurately and spot unrealistic quotes."},
  {"type":"heading","level":2,"content":"The Core Variables"},
  {"type":"text","content":"Cost is driven by four things: <strong>complexity</strong> (how many modules, edge cases, and integrations), <strong>team size</strong> (solo dev vs. team), <strong>timeline</strong> (faster delivery costs more), and <strong>tech stack</strong> (some stacks have higher developer rates)."},
  {"type":"heading","level":2,"content":"Typical Ranges for .NET Projects"},
  {"type":"text","content":"Based on real projects I've worked on: A simple Blazor CRUD web app (3–5 modules, single user type) typically runs $3,000–$8,000. A medium-complexity SaaS platform with auth, roles, notifications, and 3rd-party integrations: $12,000–$35,000. A full enterprise system with multi-tenancy, BI dashboards, complex workflows, and compliance: $50,000+."},
  {"type":"heading","level":3,"content":"What Drives Costs Up"},
  {"type":"text","content":"Real-time features (SignalR, WebSockets), third-party API integrations (payment gateways, CRMs, legal platforms), strict compliance requirements (HIPAA, PCI-DSS), and rushed timelines all add significant cost. Each integration is a negotiation — with another company's API, documentation quality, and rate limits."},
  {"type":"heading","level":3,"content":"What Drives Costs Down"},
  {"type":"text","content":"Clear requirements upfront, phased delivery (start with MVP), reuse of existing .NET libraries (Hangfire, Syncfusion, ABP.io), and flexible timelines all reduce total cost significantly."},
  {"type":"heading","level":2,"content":"Fixed Price vs. Hourly — Which Is Better?"},
  {"type":"text","content":"Fixed price works when scope is clear and well-documented. Hourly works for ongoing work, consulting, or projects where requirements evolve. I typically offer fixed price for defined projects and a monthly retainer for ongoing development support."},
  {"type":"heading","level":2,"content":"Get an Instant Estimate"},
  {"type":"text","content":"Rather than wait for a quote, use the <a href='/estimator'>free Project Cost Estimator</a> on this site. Answer 7 questions about your project and get an instant USD range with no email required. Then <a href='/contact'>reach out</a> for a detailed scoping call."}
]
```
