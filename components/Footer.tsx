import Link from "next/link";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { personalInfo } from "@/lib/data";

const professionalLinks = [
  { label: "Skills",     href: "/skills"     },
  { label: "Experience", href: "/experience" },
  { label: "Education",  href: "/education"  },
  { label: "Projects",   href: "/projects"   },
];

const moreLinks = [
  { label: "GitHub Showcase", href: "/github"         },
  { label: "Blog",            href: "/blog"           },
  { label: "Cost Estimator",  href: "/estimator"      },
  { label: "AI Integration",  href: "/ai-integration" },
];

const quickLinks = [
  { label: "Home",    href: "/"        },
  { label: "About",   href: "/about"   },
  { label: "Hire Me", href: "/hire"    },
  { label: "Contact", href: "/contact" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-blue-500/10 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* ── Brand ── */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 mb-4 group">
              <h3 className="font-display text-xl font-bold">
                Kathan<span className="text-blue-400">.</span>
              </h3>
              {personalInfo.availableForWork && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-teal-500/30 bg-teal-500/8 text-teal-400 text-[10px] font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                  Available
                </span>
              )}
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              Freelance .NET Technical Lead building scalable Blazor, WPF, and
              ASP.NET Core applications. Remote-friendly, deadline-driven.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-2.5">
              <a
                href={personalInfo.github}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 text-muted-foreground transition-all"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href={personalInfo.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 text-muted-foreground transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href={`mailto:${personalInfo.email}`}
                aria-label="Email"
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 text-muted-foreground transition-all"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* ── Quick Links ── */}
          <div>
            <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-blue-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Professional Details ── */}
          <div>
            <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">
              Professional Details
            </h4>
            <ul className="space-y-2.5">
              {professionalLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-blue-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── More & Contact ── */}
          <div>
            <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-4">
              More
            </h4>
            <ul className="space-y-2.5 mb-6">
              {moreLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-muted-foreground hover:text-blue-400 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Contact info */}
            <h4 className="font-display font-semibold text-xs uppercase tracking-widest text-muted-foreground mb-3">
              Contact
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-start gap-2 text-sm text-muted-foreground hover:text-blue-400 transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="break-all">{personalInfo.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${personalInfo.phone}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-400 transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                  {personalInfo.phone}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div className="border-t border-blue-500/10 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Kathan N. Patel. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-400 font-medium">Available for new projects</span>
            <span className="mx-1.5">·</span>
            <Link href="/hire" className="hover:text-blue-400 transition-colors">
              Hire Me →
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
