import type { Metadata } from "next";
import dynamic from "next/dynamic";

const ContactForm = dynamic(
  () => import("@/components/ContactForm").then((m) => ({ default: m.ContactForm })),
  {
    loading: () => (
      <div className="flex flex-col gap-5 animate-pulse">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="h-11 bg-muted/60 rounded-xl" />
          <div className="h-11 bg-muted/60 rounded-xl" />
        </div>
        <div className="h-11 bg-muted/60 rounded-xl" />
        <div className="h-40 bg-muted/60 rounded-xl" />
        <div className="h-12 bg-blue-500/30 rounded-xl" />
      </div>
    ),
  }
);
import { personalInfo } from "@/lib/data";
import { Mail, Phone, MapPin, Clock, Github, Linkedin } from "lucide-react";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Kathan N. Patel for .NET development projects, technical leadership roles, or consulting.",
};

const contactDetails = [
  {
    icon: Mail,
    label: "Email",
    value: personalInfo.email,
    href: `mailto:${personalInfo.email}`,
  },
  {
    icon: Phone,
    label: "Phone",
    value: personalInfo.phone,
    href: `tel:${personalInfo.phone}`,
  },
  {
    icon: MapPin,
    label: "Location",
    value: personalInfo.location,
    href: null,
  },
  {
    icon: Clock,
    label: "Availability",
    value: "Mon–Sat, 9AM–7PM IST",
    href: null,
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page header */}
        <div className="mb-16">
          <span className="font-mono text-blue-400 text-sm font-medium tracking-wider uppercase">
            Get in Touch
          </span>
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold mt-3 mb-5">
            Let&apos;s{" "}
            <span className="gradient-text">Connect</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl leading-relaxed">
            Whether you have a project, a role to discuss, or just want to say hello —
            I&apos;d love to hear from you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 items-start">

          {/* ── Left column: contact info ── */}
          <div className="lg:col-span-2 space-y-4">
            {contactDetails.map(({ icon: Icon, label, value, href }) => (
              <div
                key={label}
                className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:border-blue-500/20 transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                  {href ? (
                    <a
                      href={href}
                      className="text-sm font-medium text-foreground hover:text-blue-400 transition-colors break-all leading-snug"
                    >
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Social links */}
            <div className="glass-card rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider font-medium">
                Follow
              </p>
              <div className="flex gap-3">
                <a
                  href={personalInfo.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-blue-500/40 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 text-sm transition-all"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
                <a
                  href={personalInfo.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border hover:border-blue-500/40 hover:bg-blue-500/10 text-muted-foreground hover:text-blue-400 text-sm transition-all"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              </div>
            </div>

            {/* Response time note */}
            <div className="glass-card rounded-2xl p-5 border-teal-500/20">
              <p className="text-sm text-muted-foreground leading-relaxed">
                <span className="text-teal-400 font-semibold">Typical response time:</span>{" "}
                Within 24 hours. For urgent matters, feel free to call directly.
              </p>
            </div>
          </div>

          {/* ── Right column: form ── */}
          <div className="lg:col-span-3">
            <div className="glass-card rounded-2xl p-8 sm:p-10">
              <h2 className="font-display text-2xl font-bold mb-2">Send a Message</h2>
              <p className="text-sm text-muted-foreground mb-8">
                Fill out the form and I'll be in touch shortly.
              </p>
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
