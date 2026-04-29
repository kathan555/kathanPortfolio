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

          {/* WhatsApp soft CTA */}
          <a
            href="https://wa.me/917600410895?text=Hi%20Kathan%2C%20I%20found%20your%20portfolio%20and%20I%27m%20interested%20in%20discussing%20a%20project."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 mt-4 px-5 py-2.5 rounded-xl border border-green-500/30 bg-green-500/8 text-green-400 hover:bg-green-500/15 hover:border-green-500/50 transition-all text-sm font-medium"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Prefer WhatsApp? Message me directly
          </a>
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
