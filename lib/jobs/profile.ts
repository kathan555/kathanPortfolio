import { personalInfo, summary, skills, services, projects } from "@/lib/data";

/* ─────────────────────────────────────────────────────────────────────────
   The profile the model matches postings against.

   Derived from lib/data.ts rather than hand-written, for the same reason
   app/llms.txt/route.ts is: a second hand-maintained copy of the CV drifts.
   When the stack or the services list changes on the site, the matcher's idea
   of a good fit changes with it.

   Only the availability framing below is hand-written, and it is kept in step
   with the "Available For" block in app/llms.txt/route.ts.
   ───────────────────────────────────────────────────────────────────────── */

const AVAILABILITY = `- Contract, freelance and remote engagements (C2C/W2 both acceptable)
- Based in ${personalInfo.location} (IST); works async-first and maintains at least
  4 hours of overlap with US, UK, Europe, Gulf and Australia time zones
- Open to short sprints (2-4 weeks), fixed-price projects (1-3 months), and
  monthly retainers. No minimum engagement size
- Cannot take roles requiring US/UK work authorisation, security clearance,
  relocation, or on-site/hybrid attendance`;

/** Compact profile block, cached at module load — it never changes per run. */
export const MATCH_PROFILE = `NAME: ${personalInfo.name}
TITLE: ${personalInfo.title}
EXPERIENCE: ${personalInfo.yearsExp} years

SUMMARY:
${summary}

TECHNICAL SKILLS:
${skills.map((s) => `- ${s.category}: ${s.items.join(", ")}`).join("\n")}

SERVICES OFFERED:
${services.map((s) => `- ${s.title}: ${s.tags.join(", ")}`).join("\n")}

DOMAIN EXPERIENCE:
${[...new Set(projects.map((p) => p.domain))].join(", ")}

NOTABLE INTEGRATION WORK:
${[...new Set(projects.flatMap((p) => p.tags))].join(", ")}

ALSO WORKS IN:
AI integration into .NET and web apps (Google Gemini, Azure OpenAI, Semantic
Kernel, RAG pipelines), Next.js, React, TypeScript, Prisma.

AVAILABILITY AND CONSTRAINTS:
${AVAILABILITY}`;
