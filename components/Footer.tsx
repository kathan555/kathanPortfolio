import Link from "next/link";
import { Github, Linkedin, Mail, Phone } from "lucide-react";
import { personalInfo } from "@/lib/data";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-blue-500/10 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="font-display text-xl font-bold mb-3">
              Kathan<span className="text-blue-400">.</span>
            </h3>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Technical Lead specializing in .NET Core, Blazor, and WPF. Building high-performance,
              scalable applications across fintech, healthcare, and e-commerce.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Navigation
            </h4>
            <ul className="space-y-2">
              {["About", "Skills", "Experience", "Projects", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href={item === "Contact" ? "/contact" : `/#${item.toLowerCase()}`}
                    className="text-sm text-muted-foreground hover:text-blue-400 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">
              Get in Touch
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-blue-400 transition-colors"
                >
                  <Mail className="w-4 h-4 shrink-0" />
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
              <li className="flex items-center gap-3 pt-1">
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 text-muted-foreground transition-all"
                  aria-label="GitHub"
                >
                  <Github className="w-4 h-4" />
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 text-muted-foreground transition-all"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href={`mailto:${personalInfo.email}`}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-border hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-blue-400 text-muted-foreground transition-all"
                  aria-label="Email"
                >
                  <Mail className="w-4 h-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-500/10 mt-10 pt-6 flex items-center justify-center">
          <p className="text-xs text-muted-foreground">
            © {currentYear} Kathan N. Patel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
