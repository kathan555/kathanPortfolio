# Buyer-Intent Blog Posts

Three posts written for the **decision stage**, not the learning stage. The reader
is someone with a budget and a problem, not a developer looking for a tutorial.

Paste each into the Supabase `blog_posts` table. Set `published = true` and
`published_at = now()`.

> **Before publishing — check the numbers.** Every cost range and duration below is
> written as an indicative band consistent with a $35–85/hr rate. Adjust them to
> your actual rate card. Ranges you can't stand behind on a call are worse than no
> ranges at all.

**Why these three:** each title/tag set trips `BUSINESS_INTENT_RE` in
[app/blog/[slug]/page.tsx:76](../app/blog/[slug]/page.tsx), so all three get the
`business` audience — estimator CTA plus the full project-inquiry lead popup rather
than the newsletter ask.

---

## Post 1 — Clio + Lawmatics Integration Cost

**title:** What a Clio and Lawmatics Integration Actually Costs — and How Long It Takes

**slug:** clio-lawmatics-integration-cost-timeline

**excerpt:** Every firm asks two questions after "can this be automated?" — what does it cost, and how long does it take. Here's an honest breakdown of what drives the price of a practice management integration, the three shapes this work usually takes, and the costs nobody puts in the proposal.

**tags:** ["Legal Tech", "Clio", "Lawmatics", "Integration", "Cost", "Automation"]

**cover_image:** _(optional — a screenshot of a Hangfire dashboard works well here)_

**content (paste as JSON into the content column):**

```json
[
  {"type":"text","content":"If your firm runs Clio for matters and Lawmatics for intake, you already know the problem. The same client gets typed in twice. A phone number gets updated in one system and goes stale in the other. Someone spends a morning every month exporting CSVs to answer a question that should take four seconds."},
  {"type":"text","content":"So you ask a developer whether it can be automated. It can. Then you ask the two questions that actually matter — what does it cost, and how long does it take — and you get a shrug and a request for a discovery call."},
  {"type":"text","content":"That shrug is not evasion, but it is a bad answer. Here is the real one: what drives the price, what the three common shapes of this work cost, and the line items that tend to be missing from the proposal you get."},

  {"type":"heading","level":2,"content":"Why nobody quotes this over email"},
  {"type":"text","content":"The number of platforms is almost irrelevant to the price. Connecting two systems and connecting four systems differ by less than you would think, because the hard part is not the connection — it is the <em>mapping</em>."},
  {"type":"text","content":"Clio has a concept of a Matter. Lawmatics has a concept of a Contact moving through a Pipeline. These are not the same object, and neither is a subset of the other. Somebody has to decide what happens when a Lawmatics lead converts: does it create a Clio Matter, a Clio Contact, or both? What if the contact already exists in Clio because they were a client three years ago? Which system owns the phone number when both changed since Tuesday?"},
  {"type":"text","content":"Those are business decisions, not engineering decisions. Until they are made, nobody can quote the work — and making them is often the most valuable part of the engagement, because it forces the firm to write down rules that currently live in one person's head."},
  {"type":"quote","content":"The integration is easy. Deciding what the integration should do when your two systems disagree is the project.","author":"Kathan N. Patel"},

  {"type":"heading","level":2,"content":"The four things that actually drive the price"},
  {"type":"heading","level":3,"content":"1. Direction"},
  {"type":"text","content":"One-way sync is dramatically cheaper than two-way. In a one-way sync, one system is the source of truth and the other is a mirror — there is never a conflict to resolve. In a two-way sync, both systems can write, which means every single field needs a rule for what happens when both changed. Two-way is not twice the work. It is closer to three times."},
  {"type":"heading","level":3,"content":"2. How many object types"},
  {"type":"text","content":"Contacts alone is a small project. Contacts plus matters plus activities plus custom fields plus documents plus calendar events is a different animal, because each object type has its own mapping, its own edge cases, and its own way of failing. Price scales with object types far more than with platforms."},
  {"type":"heading","level":3,"content":"3. Custom fields"},
  {"type":"text","content":"Almost every firm has custom fields, and almost every firm underestimates how many. Custom fields are where practice-specific logic hides — a personal injury firm's date-of-loss field, an immigration firm's visa category. Each one needs a mapping decision and each one is a place the sync can break when someone renames it in the UI six months later."},
  {"type":"heading","level":3,"content":"4. Historical backfill"},
  {"type":"text","content":"Syncing new records going forward is a fraction of the cost of reconciling the ten thousand records already sitting in both systems in slightly different states. Backfill is its own project, and it is worth asking whether you actually need it — many firms are perfectly served by a go-forward-only sync plus a one-time cleanup of the last twelve months."},

  {"type":"divider"},

  {"type":"heading","level":2,"content":"Three shapes, with real ranges"},
  {"type":"text","content":"These are indicative bands for scoping conversations, not quotes. A fixed price comes after a call where the actual field mappings are walked through. But they should stop you being quoted something absurd in either direction."},
  {"type":"heading","level":3,"content":"Shape A — one-way sync, one object type"},
  {"type":"text","content":"For example: Lawmatics intake contacts pushed into Clio when a lead converts. One direction, one object, standard fields plus a handful of custom ones."},
  {"type":"text","content":"• Typical duration: 2 to 3 weeks<br/>• Typical range: $4,000 to $9,000<br/>• Best for: proving the integration works on real data before committing to more"},
  {"type":"heading","level":3,"content":"Shape B — two-way sync with conflict rules"},
  {"type":"text","content":"Both systems can write. Contacts and matters stay aligned in both directions, with a documented rule per field for who wins a conflict."},
  {"type":"text","content":"• Typical duration: 4 to 8 weeks<br/>• Typical range: $12,000 to $28,000<br/>• Best for: firms where staff genuinely work in both systems daily"},
  {"type":"heading","level":3,"content":"Shape C — full automation pipeline"},
  {"type":"text","content":"Multiple platforms, documents and call recordings included, plus a reporting layer that joins data across systems. This is the shape of a pipeline I built connecting Clio, Lawmatics, Zoom and Box — scheduled background jobs moving contacts, call recordings, and transcripts between platforms with single-click OAuth setup. It removed more than ten hours a week of manual data entry from the firm's admin workload."},
  {"type":"text","content":"• Typical duration: 8 to 16 weeks<br/>• Typical range: $25,000 to $60,000<br/>• Best for: firms where the admin overhead is measured in FTEs, not hours"},

  {"type":"heading","level":2,"content":"What is usually missing from the proposal"},
  {"type":"text","content":"<strong>API access tiers.</strong> Some platform API features sit behind a specific subscription level. Confirm your plan covers the endpoints the integration needs before signing anything — this is a five-minute check that occasionally kills a project in week three."},
  {"type":"text","content":"<strong>Sandbox availability.</strong> Testing an integration against your live matter data is not acceptable. If a platform has no sandbox, the plan needs a test firm account, and someone has to pay for it."},
  {"type":"text","content":"<strong>Your own decision time.</strong> The mapping decisions above need a person at the firm with authority to make them, available for roughly a half day a week during the build. Projects stall here far more often than they stall on code."},
  {"type":"text","content":"<strong>Ongoing maintenance.</strong> APIs change. Tokens get revoked when someone leaves. Budget something for the year after launch — typically 10 to 15 percent of the build cost — or accept that the first breakage becomes an emergency."},

  {"type":"heading","level":2,"content":"The hidden cost: duplicate records"},
  {"type":"text","content":"The single most common defect in legal integrations is duplicated client records, and it is worth understanding why, because it tells you something about whoever is quoting you."},
  {"type":"text","content":"The naive approach is search-before-create: look for a matching contact, and if none exists, create one. This works perfectly in testing and fails in production, because two overlapping job runs both search, both find nothing, and both create. Now the firm has two of every contact from an eleven-second window last Tuesday, and someone has to merge them by hand."},
  {"type":"text","content":"The fix is not more careful searching. It is keying every write on a stable external identifier, backed by a database constraint that makes a second insert impossible:"},
  {"type":"code","language":"csharp","content":"// The mapping table is what prevents duplicates — not the search.\n// A unique index on (FirmId, ExternalKey) makes a double-insert a\n// database error rather than a silent second client record.\nmodelBuilder.Entity<ContactMapping>()\n    .HasIndex(m => new { m.FirmId, m.ExternalKey })\n    .IsUnique();\n\n// Every write keys off the source system's own id.\nvar externalKey = $\"clio:{clioContact.Id}\";\n\nvar map = await db.ContactMappings.SingleOrDefaultAsync(\n    m => m.FirmId == firmId && m.ExternalKey == externalKey, ct);\n\nif (map is not null)\n{\n    await lawmatics.PatchContactAsync(map.LawmaticsId, clioContact, ct);\n    return;\n}\n\nvar created = await lawmatics.CreateContactAsync(clioContact, ct);\ndb.ContactMappings.Add(new ContactMapping\n{\n    FirmId = firmId, ExternalKey = externalKey, LawmaticsId = created.Id\n});\nawait db.SaveChangesAsync(ct);"},
  {"type":"text","content":"If you are evaluating quotes, ask how duplicates are prevented. An answer involving a mapping table and a unique constraint is a good sign. An answer involving \"we check if it exists first\" means you will be merging records in six months."},

  {"type":"heading","level":2,"content":"Should you just use Zapier instead?"},
  {"type":"text","content":"Sometimes, yes — and a developer who won't tell you that is selling, not advising. No-code connectors handle the straightforward path well and cost a fraction of custom work."},
  {"type":"text","content":"Custom development earns its price when you hit one of three walls. <strong>Volume:</strong> per-task pricing that made sense at 500 records a month stops making sense at 50,000. <strong>Logic:</strong> conditional field mapping, deduplication against existing records, or multi-step operations that need to roll back together. <strong>Compliance:</strong> a requirement that client data cannot transit a third-party processor, which is increasingly common in firms handling regulated matters."},
  {"type":"text","content":"Below those walls, use the cheaper tool. Above them, no-code becomes a liability precisely because it looks like it is working right up until it isn't, and it rarely tells you it stopped."},

  {"type":"heading","level":2,"content":"How to brief a developer in ten minutes"},
  {"type":"text","content":"If you want a useful answer quickly, come with these five things. It is genuinely enough to scope from."},
  {"type":"text","content":"1. Which platforms, and which is the source of truth for client contact details.<br/>2. Which records get typed in twice today, and roughly how often.<br/>3. Whether you need history reconciled or only new records going forward.<br/>4. Roughly how many custom fields matter, and who at the firm owns them.<br/>5. Any constraint on where data can be processed or stored."},
  {"type":"text","content":"That is enough to tell you whether you are looking at a two-week fix or a two-month project, before anyone writes a proposal."},

  {"type":"divider"},
  {"type":"text","content":"If you have a stack you would like a straight answer on, tell me what it looks like on the <a href='/contact'>contact page</a>, or read more about how I approach this work on the <a href='/legal-tech-integration'>legal tech integration page</a>. There is also a <a href='/free-project-cost-estimator'>free cost estimator</a> if you want a ballpark before speaking to anyone."}
]
```

---

## Post 2 — Rewrite or Refactor Decision Framework

**title:** Rewrite or Refactor? A Decision Framework for Legacy .NET Apps

**slug:** rewrite-or-refactor-legacy-dotnet-decision-framework

**excerpt:** Every legacy system eventually prompts the same meeting. Someone says the code is unmaintainable, someone else says a rewrite is career suicide, and nothing gets decided. Here's a framework that produces an actual answer — five diagnostic questions, the middle path most teams should take, and the three situations where a full rewrite genuinely is correct.

**tags:** [".NET", "Legacy Modernization", "Migration", "Cost", "Architecture", "Technical Debt"]

**content:**

```json
[
  {"type":"text","content":"There is a meeting that happens in every company running software older than about eight years. A developer says the codebase is unmaintainable and needs a rewrite. Someone who has lived through a rewrite says absolutely not. A finance person asks what it costs and gets two answers that differ by a factor of five. The meeting ends, nothing is decided, and the same meeting happens again in four months."},
  {"type":"text","content":"The reason it never resolves is that \"should we rewrite it?\" is the wrong question. It has no answer without context, so everyone argues from instinct. Here is a set of questions that does have answers."},

  {"type":"heading","level":2,"content":"First, why rewrites fail so reliably"},
  {"type":"text","content":"Rewrites do not fail because the new technology is bad or the developers are weak. They fail because of a specific and predictable problem: the old system encodes years of requirements that nobody wrote down."},
  {"type":"text","content":"That strange conditional in the invoicing module is not sloppy code. It is a tax rule from 2019 that applies to one client in one state. The retry loop with a hardcoded three-second delay exists because a vendor's API used to fall over. None of this is in a document. It is in the code, and only in the code."},
  {"type":"text","content":"A rewrite starts by throwing that away, then rediscovers it one production incident at a time over the following eighteen months. That is the real cost — not the development, the rediscovery."},
  {"type":"quote","content":"A legacy system is not bad code. It is a requirements document that happens to be executable — and it is the only copy.","author":"Kathan N. Patel"},

  {"type":"heading","level":2,"content":"The five diagnostic questions"},
  {"type":"text","content":"Answer these honestly. They are ordered by how much they should influence the decision."},

  {"type":"heading","level":3,"content":"1. Can you still deploy it?"},
  {"type":"text","content":"Not \"is it pleasant to deploy\" — can you deploy it at all, today, without the one person who knows the ritual? If deployment requires a specific machine, an undocumented sequence, or a colleague who left, you do not have a code problem. You have an operational emergency, and it is fixable in weeks without touching application logic. Fix this first regardless of what you decide about the rest."},

  {"type":"heading","level":3,"content":"2. Is the pain in the whole system or in three modules?"},
  {"type":"text","content":"Ask the team where the bugs actually come from. In most legacy systems the answer clusters hard — sixty to eighty percent of incidents trace to a small number of modules. If that is your shape, a rewrite is spectacular overkill. You are proposing to replace the whole house because two rooms have damp."},
  {"type":"text","content":"If the pain is genuinely uniform across the system, that is a different signal, and it usually means an architectural problem rather than a code-quality problem."},

  {"type":"heading","level":3,"content":"3. Is the platform itself out of support?"},
  {"type":"text","content":"This is the question that converts a preference into a deadline. .NET Framework 4.8 still receives security updates as a Windows component, but the ecosystem has moved — new libraries increasingly ship .NET-only, and hiring for Framework-era work gets harder every year. If you are on something genuinely out of support, the decision has been made for you and the only question left is the route."},

  {"type":"heading","level":3,"content":"4. Do you have tests, or do you have a QA person?"},
  {"type":"text","content":"This one is decisive and people skip it. Refactoring without a test suite is not refactoring — it is editing and hoping. If you have no automated tests, the honest first project is not a rewrite or a refactor. It is characterisation tests around the modules you intend to change: tests that assert what the system currently does, correct or not, so you can tell whether you broke it."},
  {"type":"text","content":"Teams that skip this step are the ones whose refactor turns into an unplanned rewrite six weeks in."},

  {"type":"heading","level":3,"content":"5. Is the business logic still correct?"},
  {"type":"text","content":"The one case where a rewrite is clearly right: the system does the wrong thing. Not badly — wrongly. The business model changed, the regulations changed, the product pivoted, and the software still encodes the old world. Preserving that behaviour is not a virtue. Here, a rewrite is not a technical decision at all; you are building new software that happens to replace something."},

  {"type":"heading","level":2,"content":"Reading your answers"},
  {"type":"text","content":"<strong>Refactor</strong> if the pain clusters in a few modules, the platform is supported, and the business logic is still correct. This is most systems, and it is the answer people resist because it is unglamorous."},
  {"type":"text","content":"<strong>Strangle</strong> — the middle path, covered below — if the platform is aging or the architecture is the problem, but the business logic is still valuable and largely undocumented. This is the right answer far more often than either extreme."},
  {"type":"text","content":"<strong>Rewrite</strong> only if the business logic itself is obsolete, or the system is small enough that a rewrite is measured in weeks, or the platform is genuinely dead with no migration path. Three narrow cases."},

  {"type":"heading","level":2,"content":"The strangler fig: what most teams should actually do"},
  {"type":"text","content":"Named after the fig that grows around a host tree until it can stand on its own, the pattern is straightforward: put a routing layer in front of the old system, then move functionality across one slice at a time. Both systems run simultaneously. Every slice you move is live, in production, earning its keep — and if a slice goes badly you have moved one thing, not everything."},
  {"type":"text","content":"In .NET this is unusually practical, because YARP gives you the routing layer with very little code:"},
  {"type":"code","language":"csharp","content":"// Program.cs — the strangler facade.\n// Everything goes to the legacy app except routes explicitly claimed\n// by the new one. Moving a slice is a config change, not a deploy of\n// two systems in lockstep.\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services\n    .AddReverseProxy()\n    .LoadFromConfig(builder.Configuration.GetSection(\"ReverseProxy\"));\n\nvar app = builder.Build();\n\n// Claimed slices — handled by the new .NET 9 modules.\napp.MapControllers();\n\n// Everything else still falls through to the legacy application.\napp.MapReverseProxy();\n\napp.Run();"},
  {"type":"code","language":"json","content":"// appsettings.json — one entry per slice still living in the old app.\n// Delete an entry when the new implementation takes over that route.\n{\n  \"ReverseProxy\": {\n    \"Routes\": {\n      \"legacy-catch-all\": {\n        \"ClusterId\": \"legacy\",\n        \"Match\": { \"Path\": \"{**catch-all}\" }\n      }\n    },\n    \"Clusters\": {\n      \"legacy\": {\n        \"Destinations\": {\n          \"legacy-app\": { \"Address\": \"http://legacy-internal:8080/\" }\n        }\n      }\n    }\n  }\n}"},
  {"type":"text","content":"The property that matters here is not technical elegance. It is that the project can be stopped at any point and you still have a working system with real value delivered. A big-bang rewrite has exactly one moment where it delivers value, and it is at the end, and it is always later than planned."},

  {"type":"heading","level":2,"content":"What each route costs, roughly"},
  {"type":"text","content":"Indicative bands for a mid-size line-of-business application — call it 15 to 30 screens, one database, a handful of integrations. Your numbers will differ, but the <em>ratios</em> hold reasonably well."},
  {"type":"text","content":"<strong>Stabilise only</strong> — fix the build, automate deployment, add characterisation tests around the worst modules. Two to four weeks. Often the highest return per pound spent, and it is a prerequisite for everything else anyway."},
  {"type":"text","content":"<strong>Targeted refactor</strong> — rework the two or three modules generating most incidents, behind the tests you just wrote. Four to ten weeks. Resolves most of the felt pain in most systems."},
  {"type":"text","content":"<strong>Strangler migration</strong> — incremental replacement onto modern .NET, slice by slice. Four to twelve months elapsed, but spread across releases and stoppable at any point. Costs more in total than a rewrite on paper; costs dramatically less in practice, because the rediscovery problem never happens all at once."},
  {"type":"text","content":"<strong>Full rewrite</strong> — six to eighteen months with no value delivered until late, plus a rediscovery tail that nobody budgets. Reserve for the three cases above. For a detailed cost breakdown of the migration route specifically, I've written that up separately in <a href='/blog/dotnet-framework-to-modern-dotnet-migration-cost-2026'>the real costs of migrating from .NET Framework to modern .NET</a>."},

  {"type":"heading","level":2,"content":"What to do in the next thirty days"},
  {"type":"text","content":"Whichever way you are leaning, these four things are useful in every scenario and none of them commit you to a direction."},
  {"type":"text","content":"1. Get the build and deployment automated and documented, so no single person is a dependency.<br/>2. Pull three months of incident history and find out where bugs actually originate. Opinions about which module is worst are frequently wrong.<br/>3. Write characterisation tests around the two modules that history points at.<br/>4. Write down the undocumented business rules the team knows about. This is the single highest-value hour a legacy team can spend, and it makes every subsequent option cheaper."},
  {"type":"text","content":"After that month you will have data instead of opinions, and the meeting resolves itself."},

  {"type":"divider"},
  {"type":"text","content":"If you're weighing this decision on a real system and want a second opinion from someone with no stake in the answer, <a href='/contact'>tell me about it</a>. You can also get a ballpark on either route with the <a href='/free-project-cost-estimator'>free project cost estimator</a>."}
]
```

---

## Post 3 — Blazor vs React for Internal Business Apps

**title:** Blazor vs React for Internal Business Apps: Choosing Without Regretting It in Year Two

**slug:** blazor-vs-react-internal-business-apps

**excerpt:** Most Blazor vs React comparisons benchmark bundle sizes, which is almost irrelevant for an internal line-of-business app. The decision is really about hiring, maintenance, and where your team's existing knowledge lives. Here's the framework I use with clients, including where each choice hurts eighteen months later.

**tags:** ["Blazor", "React", ".NET", "Architecture", "Budget", "Technical Decision"]

**content:**

```json
[
  {"type":"text","content":"If you search for this comparison you will find benchmarks. Bundle size, time to interactive, rendering throughput. For a public e-commerce site those numbers matter enormously, because a slow page is lost revenue."},
  {"type":"text","content":"For an internal business application used by forty staff who have it open all day, they matter almost not at all. A 1.5 MB initial download is a one-time cost on a corporate network at nine in the morning. What matters instead is whether you can still staff, change, and afford this application in year three."},
  {"type":"text","content":"So here is the comparison framed around that instead."},

  {"type":"heading","level":2,"content":"What each one is genuinely good at"},
  {"type":"text","content":"<strong>Blazor's real advantage is one language and one type system across the whole stack.</strong> Your validation rules, your domain models, and your business logic exist once, in C#, shared between server and UI. There is no DTO layer that drifts, no TypeScript interface that quietly stops matching the API response, no second implementation of the same rule that disagrees with the first. For a data-entry-heavy internal app, this eliminates an entire category of bug."},
  {"type":"text","content":"<strong>React's real advantage is the ecosystem and the hiring market.</strong> Whatever component you need — a virtualised grid, a scheduler, a rich text editor, a chart — several mature options exist and someone has already hit your edge case on Stack Overflow. And when your developer leaves, you can replace them from a far larger pool, at more predictable cost."},
  {"type":"text","content":"Both of those are real. Neither is a tiebreaker on its own."},

  {"type":"heading","level":2,"content":"The five questions that actually decide it"},

  {"type":"heading","level":3,"content":"1. What does your team already know?"},
  {"type":"text","content":"This dominates everything else, and teams routinely discount it because it feels like an admission rather than a strategy. A team of four C# developers building their first React application will produce a worse React app than they would have produced a Blazor app, for eighteen months, while they learn. That is not a knock on React. It is how learning works."},
  {"type":"text","content":"If your team is .NET and your app is internal, Blazor starts well ahead. If you already have React developers, the reverse holds just as firmly."},

  {"type":"heading","level":3,"content":"2. Who is going to maintain it in three years?"},
  {"type":"text","content":"Ask this before you write a line of code. If the answer is \"our in-house .NET team\", Blazor keeps the application inside their existing skill set. If the answer is \"we will hire a contractor when something breaks\", the hiring market matters more than the developer experience, and React is easier and cheaper to hire for in most cities."},
  {"type":"text","content":"An application nobody can be found to maintain is an expensive application regardless of how elegantly it was built."},

  {"type":"heading","level":3,"content":"3. How network-tolerant does it need to be?"},
  {"type":"text","content":"This is the question that eliminates Blazor Server outright in some environments, and it is worth being blunt about. Blazor Server keeps a persistent SignalR connection and round-trips UI events to the server. On a stable LAN or a good office connection, it is genuinely excellent — instant startup, no API layer to build, full server capabilities available directly."},
  {"type":"text","content":"On flaky mobile connections, high-latency links, or for field staff on patchy 4G, users will see the reconnection banner and they will hate it. If a meaningful share of your users are remote on poor connections, Blazor Server is off the table — and you are choosing between Blazor WebAssembly and React, which is a much closer contest."},

  {"type":"heading","level":3,"content":"4. How unusual is the UI?"},
  {"type":"text","content":"If your application is forms, tables, filters, and dashboards — which describes the overwhelming majority of internal business software — both frameworks handle it comfortably, and commercial component vendors like Syncfusion and Telerik ship near-equivalent suites for both."},
  {"type":"text","content":"If you need something genuinely unusual — a custom canvas interaction, a specialised visualisation, a drag-and-drop designer — React's ecosystem depth becomes a real advantage. You will find a library. In Blazor you may end up wrapping a JavaScript one anyway, at which point you have both stacks and neither advantage."},

  {"type":"heading","level":3,"content":"5. Does anything else need this API?"},
  {"type":"text","content":"If a mobile app, a partner integration, or a second front end will eventually consume the same backend, you need a real API regardless. That erases one of Blazor Server's main savings — not needing an API layer — and pushes the decision toward whichever front end your team prefers, since you are paying for the API either way."},

  {"type":"heading","level":2,"content":"The fork inside the fork: Server or WebAssembly"},
  {"type":"text","content":"\"Blazor\" is two different products with different trade-offs, and conflating them is the most common mistake in these discussions."},
  {"type":"text","content":"<strong>Blazor Server</strong> runs your components on the server and pipes UI diffs over SignalR. Instant startup, no separate API needed, direct database access from component code, and your code never leaves the server. Costs: a persistent connection per user, server memory that scales with concurrent users, and total dependence on connection quality."},
  {"type":"text","content":"<strong>Blazor WebAssembly</strong> ships the .NET runtime to the browser and runs entirely client-side. Works offline, scales like static hosting, no per-user server state. Costs: a larger initial download, a real API layer you have to build and secure, and no direct database access."},
  {"type":"text","content":".NET 8 and later let you mix render modes per component, which is genuinely useful — but treat that as an optimisation, not a strategy. Pick a primary mode based on the connection question above."},

  {"type":"heading","level":2,"content":"Where each one hurts in year two"},
  {"type":"text","content":"Every technology choice has a delayed cost. These are the ones I see actually arrive."},
  {"type":"text","content":"<strong>Blazor, eighteen months in:</strong> you need a component nobody has built, and you end up writing JavaScript interop anyway — so you have a C# codebase with JavaScript pockets and developers who need both. Debugging across the interop boundary is genuinely unpleasant. And for Blazor Server specifically, concurrency growth turns into server cost in a way that surprises people who budgeted like it was a static site."},
  {"type":"text","content":"<strong>React, eighteen months in:</strong> dependency drift. The scheduling library is unmaintained, the build tooling has moved on, and a routine upgrade takes a week. Plus the quiet duplication tax — validation rules written in C# on the server and again in TypeScript on the client, which is fine until the day they disagree and nobody notices for a month."},
  {"type":"text","content":"Neither list should decide anything on its own. But you should choose knowing which of these two futures you would rather manage."},

  {"type":"heading","level":2,"content":"The shared-logic argument, concretely"},
  {"type":"text","content":"The strongest technical case for Blazor on a business app is worth seeing rather than describing. A validation rule defined once, enforced identically on both sides:"},
  {"type":"code","language":"csharp","content":"// Shared class library — referenced by BOTH the server and the Blazor UI.\n// One definition. No TypeScript mirror to drift out of sync.\npublic class MatterRequest\n{\n    [Required, StringLength(120)]\n    public string ClientName { get; set; } = \"\";\n\n    [Required, RegularExpression(@\"^[A-Z]{2}-\\d{6}$\",\n        ErrorMessage = \"Reference must look like AB-123456\")]\n    public string Reference { get; set; } = \"\";\n\n    [Range(0, 500_000)]\n    public decimal EstimatedValue { get; set; }\n}"},
  {"type":"text","content":"The Blazor form and the API endpoint both validate against that one class. In a React setup the same rules typically exist twice — once in C# for the API, once in Zod or Yup for the form — and staying in sync is a discipline rather than a guarantee. Tools like NSwag narrow that gap by generating TypeScript clients from your API, and if you go the React route you should use one. But generated types cover shapes, not business rules."},

  {"type":"heading","level":2,"content":"So what would I actually recommend?"},
  {"type":"text","content":"For an internal line-of-business application, built by a .NET team, used by staff on a reliable connection, that is mostly forms and tables and reports: <strong>Blazor</strong>, and Blazor Server unless the connection question rules it out. The shared-logic benefit is real, the ecosystem gap does not bite on this kind of UI, and the app stays inside your team's existing skills."},
  {"type":"text","content":"If any of those conditions break — remote users on poor connections, no in-house .NET team, an unusual interface, or an API that other clients will consume — the case narrows quickly and <strong>React</strong> becomes the safer long-term choice."},
  {"type":"text","content":"And there is a third answer people forget: use both, in different places. A Blazor admin panel for internal staff and a React customer portal is a perfectly sensible architecture when the two audiences have genuinely different needs. The cost of running two front ends is real, but it is smaller than the cost of forcing one stack to do a job it is bad at."},

  {"type":"heading","level":2,"content":"The cost difference, honestly"},
  {"type":"text","content":"For a comparable internal application, initial build cost between the two is closer than vendors on either side will tell you — typically within fifteen percent, and dominated by scope rather than framework."},
  {"type":"text","content":"Where the numbers genuinely diverge is maintenance. A Blazor app maintained by an existing .NET team costs very little incremental effort, because it is the same people and the same skills. A React app maintained by contractors you hire per incident costs more per change but carries less key-person risk. Which of those is cheaper depends entirely on your organisation, not on the frameworks."},

  {"type":"divider"},
  {"type":"text","content":"If you're making this call on a real project and want it pressure-tested by someone who has shipped both, <a href='/contact'>send me the outline</a> — team, users, connection, UI complexity — and I'll give you a straight recommendation. You can also get a build ballpark from the <a href='/free-project-cost-estimator'>free cost estimator</a>."}
]
```

---

## After publishing

1. **Internal links from your high-traffic posts.** The free-API posts have the authority; these new posts need it. Add a contextual link from the Gemini and Claude free-tier posts into whichever of these is relevant — that's how link equity moves from traffic you have to pages you want ranked.
2. **Search Console.** Submit all three URLs plus `/legal-tech-integration` for indexing rather than waiting on the crawl.
3. **Watch the right metric.** For these posts it's inquiries and estimator starts, not pageviews. They will get a fraction of the Gemini post's traffic. That's the point.
