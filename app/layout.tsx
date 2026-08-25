import type { Metadata } from "next";
import { Playfair_Display, Lato, JetBrains_Mono } from "next/font/google";
import { GoogleAnalytics } from '@next/third-parties/google'
import "./globals.css";
import { ThemeProvider }      from "@/components/ThemeProvider";
import { ScrollRestorer }       from "@/components/ScrollRestorer";
import { NavigationProgress }   from "@/components/NavigationProgress";
import { WhatsAppButton }        from "@/components/WhatsAppButton";
import { Navbar }             from "@/components/Navbar";
import { Footer }             from "@/components/Footer";
import { Toaster }            from "react-hot-toast";

const playfair      = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", weight: ["400","500","600","700","800","900"], style: ["normal","italic"] });
const lato          = Lato({ subsets: ["latin"], variable: "--font-lato", weight: ["300","400","700","900"], style: ["normal","italic"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", weight: ["400","500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://kathanpatel.vercel.app"),
  alternates: {
    canonical: "/",
  },
  title: {
    default:  "Kathan N. Patel — Freelance AI & .NET Developer | Blazor, WPF, ASP.NET Core",
    template: "%s | Kathan N. Patel",
  },
  description:
    "Freelance AI & .NET developer with 8+ years of experience. I add AI to production .NET apps — Gemini, Azure OpenAI, RAG — and build Blazor, WPF and ASP.NET Core software. Remote, available now.",
  verification: {
    google: "vJ2WYAxQQtEna5rl9S17hYQDcx9oIRFc7S9hrMqKHLQ",
  },  
  keywords: [
    "freelance .NET developer", "hire .NET developer", "contract .NET developer",
    "freelance Blazor developer", "hire Blazor developer",
    "freelance ASP.NET Core developer", "freelance WPF developer",
    "C# developer for hire", ".NET consultant", "Blazor contractor",
    "ASP.NET Core freelancer", "WPF developer contract",
    "Kathan Patel", "Kathan N. Patel",
    "freelance developer India", "remote .NET developer", ".NET developer Ahmedabad",
    ".NET developer USA", ".NET developer UK", ".NET developer Europe", ".NET developer UAE",
    "C# contractor USA", "Blazor developer UK", "ASP.NET Core developer Europe", "hire .NET developer Dubai",
    /* AI positioning. The whole "How I Build" section, the live assistant and
       the cost estimator were invisible here — every term below was missing. */
    "freelance AI developer", "hire AI developer", "AI integration developer",
    "AI developer for hire", "add AI to .NET application", "AI integration consultant",
    "AI .NET developer", "LLM integration developer", "RAG developer",
    "Gemini API developer", "Azure OpenAI developer", "Semantic Kernel developer",
    "AI-assisted development", "AI chatbot integration .NET",
  ],
  authors: [{ name: "Kathan N. Patel", url: "https://kathanpatel.vercel.app" }],
  creator: "Kathan N. Patel",
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://kathanpatel.vercel.app",
    title:       "Kathan N. Patel — Freelance AI & .NET Developer | Blazor · WPF · ASP.NET Core",
    description: "Freelance AI & .NET developer, 8+ years. AI integration for production .NET apps, plus Blazor, WPF and ASP.NET Core. Remote-friendly.",
    siteName:    "Kathan N. Patel",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kathan N. Patel — Freelance .NET Developer" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Kathan N. Patel — Freelance AI & .NET Developer",
    description: "Available for AI integration and .NET contract work. Gemini · Blazor · WPF · ASP.NET Core · C#. Remote-friendly.",
    images:      ["/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192x192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${playfair.variable} ${lato.variable} ${jetbrainsMono.variable} bg-background text-foreground min-h-screen font-body`}>

        {/* ── Schema Markup — Person + ProfessionalService + WebSite ── */}
        <script
          id="schema-person"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": "https://kathanpatel.vercel.app/#person",
                  "name": "Kathan N. Patel",
                  "alternateName": "Kathan Patel",
                  "jobTitle": "Freelance AI & .NET Technical Lead",
                  "description": "Freelance AI & .NET Technical Lead with 8+ years of experience. Integrates AI into production .NET applications (Google Gemini, Azure OpenAI, Semantic Kernel, RAG pipelines) and builds Blazor web apps, WPF desktop software, and ASP.NET Core APIs. Remote-friendly. Available for contract and freelance work globally.",
                  "url": "https://kathanpatel.vercel.app",
                  "email": "patel.kathan555@gmail.com",
                  "telephone": "+917600410895",
                  "image": "https://kathanpatel.vercel.app/og-image.png",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Ahmedabad",
                    "addressRegion": "Gujarat",
                    "addressCountry": "IN"
                  },
                  "knowsAbout": [
                    "ASP.NET Core", "Blazor Server", "Blazor WebAssembly",
                    "WPF", "C#", ".NET", "MS-SQL", "Entity Framework",
                    "Semantic Kernel", "Azure OpenAI", "Google Gemini API",
                    "AI Integration", "Large Language Models", "RAG Pipelines",
                    "AI-Assisted Development", "REST API Development",
                    "Software Architecture", "Technical Leadership"
                  ],
                  "hasOccupation": {
                    "@type": "Occupation",
                    "name": "Freelance AI & .NET Software Developer",
                    "occupationLocation": {
                      "@type": "Country",
                      "name": "Remote / Worldwide"
                    },
                    "experienceRequirements": {
                      "@type": "OccupationalExperienceRequirements",
                      "monthsOfExperience": 96
                    },
                    "skills": "AI integration, .NET, Blazor, WPF, ASP.NET Core, C#, software architecture"
                  },
                  "sameAs": [
                    "https://github.com/kathan555",
                    "https://www.linkedin.com/in/kathan-patel-92215213a/"
                  ]
                },
                {
                  "@type": "ProfessionalService",
                  "@id": "https://kathanpatel.vercel.app/#service",
                  "name": "Kathan Patel — Freelance AI & .NET Development",
                  "description": "Custom .NET software development services — Blazor web apps, WPF desktop tools, ASP.NET Core APIs, AI integrations, and legacy .NET migrations. Remote-friendly, available worldwide.",
                  "url": "https://kathanpatel.vercel.app/hire",
                  "provider": { "@id": "https://kathanpatel.vercel.app/#person" },
                  "areaServed": [
                    "US",
                    "GB",
                    "AU",
                    "DE",
                    "FR",
                    "NL",
                    "SE",
                    "NO",
                    "DK",
                    "CH",
                    "IE",
                    "ES",
                    "IT",
                    "PL",
                    "AE",
                    "SA",
                    "IN",
                    "Worldwide"
                  ],
                  "availableLanguage": ["English"],
                  "serviceType": [
                    "Blazor Web Application Development",
                    "WPF Desktop Application Development",
                    "ASP.NET Core API Development",
                    "AI Integration (Gemini, Azure OpenAI, Semantic Kernel, RAG)",
                    ".NET Legacy Migration",
                    "Technical Lead / Fractional CTO"
                  ],
                  "currenciesAccepted": "USD, GBP, AED",
                  "paymentAccepted": "Bank Transfer, PayPal, Wise"
                },
                {
                  "@type": "WebSite",
                  "@id": "https://kathanpatel.vercel.app/#website",
                  "name": "Kathan N. Patel — Freelance AI & .NET Developer",
                  "url": "https://kathanpatel.vercel.app",
                  "author": { "@id": "https://kathanpatel.vercel.app/#person" },
                  "description": "Portfolio and hiring page for Kathan N. Patel, freelance AI & .NET Technical Lead with 8+ years of experience.",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://kathanpatel.vercel.app/blog?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />

        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange={false}>

          {/* ── Instant navigation progress bar — above all layers ── */}
          <NavigationProgress />

          {/* ── Scroll-to-top on every route change / refresh ── */}
          <ScrollRestorer />

          {/* ── WhatsApp floating button ── */}
          <WhatsAppButton />

          <div className="relative min-h-screen">
            <Navbar />
            <main>{children}</main>
            <Footer />
          </div>

          <Toaster
            position="bottom-right"
            containerStyle={{ zIndex: 9999 }}
            toastOptions={{
              style: {
                background:  "hsl(0, 0%, 100%)",
                color:       "hsl(0, 0%, 0%)",
                border:      "1px solid hsl(0, 0%, 88%)",
                fontFamily:  "var(--font-lato)",
              },
              success: { iconTheme: { primary: "#16A34A", secondary: "#FFFFFF" } },
              error:   { iconTheme: { primary: "#DC2626", secondary: "#FFFFFF" } },
            }}
          />
        </ThemeProvider>
      </body>

      <GoogleAnalytics gaId="G-0QF4XVTJEM" />
    </html>
  );
}
