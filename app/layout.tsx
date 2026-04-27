import type { Metadata } from "next";
import Script from "next/script";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider }      from "@/components/ThemeProvider";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { ScrollRestorer }       from "@/components/ScrollRestorer";
import { NavigationProgress }   from "@/components/NavigationProgress";
import { Navbar }             from "@/components/Navbar";
import { Footer }             from "@/components/Footer";
import { Toaster }            from "react-hot-toast";

const syne          = Syne({ subsets: ["latin"], variable: "--font-syne",          weight: ["400","500","600","700","800"] });
const dmSans        = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans",   weight: ["300","400","500","600"], style: ["normal","italic"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", weight: ["400","500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://kathanpatel.vercel.app"), // ← Replace with your real domain
  title: {
    default:  "Kathan N. Patel — Freelance .NET Developer | Blazor, WPF, ASP.NET Core",
    template: "%s | Kathan N. Patel",
  },
  description:
    "Freelance .NET Technical Lead available for contract work. 8+ years building Blazor web apps, WPF desktop software, and ASP.NET Core APIs. Remote-friendly. Based in India, working globally.",
  keywords: [
    "freelance .NET developer", "hire .NET developer", "contract .NET developer",
    "freelance Blazor developer", "hire Blazor developer",
    "freelance ASP.NET Core developer", "freelance WPF developer",
    "C# developer for hire", ".NET consultant", "Blazor contractor",
    "ASP.NET Core freelancer", "WPF developer contract",
    "Kathan Patel", "Kathan N. Patel",
    "freelance developer India", "remote .NET developer", ".NET developer Ahmedabad",
  ],
  authors: [{ name: "Kathan N. Patel", url: "https://kathanpatel.dev" }],
  creator: "Kathan N. Patel",
  openGraph: {
    type:        "website",
    locale:      "en_US",
    url:         "https://kathanpatel.dev",
    title:       "Kathan N. Patel — Freelance .NET Developer | Blazor · WPF · ASP.NET Core",
    description: "Freelance .NET Technical Lead available for contract work. 8+ years. Blazor, WPF, ASP.NET Core, C#. Remote-friendly.",
    siteName:    "Kathan N. Patel",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kathan N. Patel — Freelance .NET Developer" }],
  },
  twitter: {
    card:        "summary_large_image",
    title:       "Kathan N. Patel — Freelance .NET Developer",
    description: "Available for .NET contract work. Blazor · WPF · ASP.NET Core · C#. Remote-friendly.",
    images:      ["/og-image.png"],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" } },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} bg-background text-foreground antialiased min-h-screen`}>

        {/* ── Schema Markup — Person + ProfessionalService + WebSite ── */}
        <Script
          id="schema-person"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Person",
                  "@id": "https://kathanpatel.dev/#person",
                  "name": "Kathan N. Patel",
                  "alternateName": "Kathan Patel",
                  "jobTitle": "Freelance .NET Technical Lead",
                  "description": "Freelance .NET Technical Lead with 8+ years building Blazor web apps, WPF desktop software, and ASP.NET Core APIs. Remote-friendly. Available for contract and freelance work globally.",
                  "url": "https://kathanpatel.dev",
                  "email": "patel.kathan555@gmail.com",
                  "telephone": "+917600410895",
                  "image": "https://kathanpatel.dev/og-image.png",
                  "address": {
                    "@type": "PostalAddress",
                    "addressLocality": "Ahmedabad",
                    "addressRegion": "Gujarat",
                    "addressCountry": "IN"
                  },
                  "knowsAbout": [
                    "ASP.NET Core", "Blazor Server", "Blazor WebAssembly",
                    "WPF", "C#", ".NET", "MS-SQL", "Entity Framework",
                    "Semantic Kernel", "Azure OpenAI", "REST API Development",
                    "Software Architecture", "Technical Leadership"
                  ],
                  "hasOccupation": {
                    "@type": "Occupation",
                    "name": "Freelance Software Developer",
                    "occupationLocation": {
                      "@type": "Country",
                      "name": "Remote / Worldwide"
                    },
                    "estimatedSalary": {
                      "@type": "MonetaryAmountDistribution",
                      "name": "Hourly Rate",
                      "currency": "USD",
                      "duration": "PT1H",
                      "percentile10": 35,
                      "percentile25": 45,
                      "median": 55,
                      "percentile75": 70,
                      "percentile90": 85
                    }
                  },
                  "sameAs": [
                    "https://github.com/kathan555",
                    "https://www.linkedin.com/in/kathan-patel",
                    "https://kathanpatel.dev"
                  ]
                },
                {
                  "@type": "ProfessionalService",
                  "@id": "https://kathanpatel.dev/#service",
                  "name": "Kathan Patel — Freelance .NET Development",
                  "description": "Custom .NET software development services — Blazor web apps, WPF desktop tools, ASP.NET Core APIs, AI integrations, and legacy .NET migrations. Remote-friendly, available worldwide.",
                  "url": "https://kathanpatel.dev/hire",
                  "provider": { "@id": "https://kathanpatel.dev/#person" },
                  "areaServed": ["US", "GB", "AE", "SA", "IN", "Worldwide"],
                  "availableLanguage": ["English"],
                  "serviceType": [
                    "Blazor Web Application Development",
                    "WPF Desktop Application Development",
                    "ASP.NET Core API Development",
                    "AI Integration with Semantic Kernel",
                    ".NET Legacy Migration",
                    "Technical Lead / Fractional CTO"
                  ],
                  "priceRange": "$35–$85/hr",
                  "currenciesAccepted": "USD, GBP, AED",
                  "paymentAccepted": "Bank Transfer, PayPal, Wise"
                },
                {
                  "@type": "WebSite",
                  "@id": "https://kathanpatel.dev/#website",
                  "name": "Kathan N. Patel — Freelance .NET Developer",
                  "url": "https://kathanpatel.dev",
                  "author": { "@id": "https://kathanpatel.dev/#person" },
                  "description": "Portfolio and hiring page for Kathan N. Patel, freelance .NET Technical Lead.",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://kathanpatel.dev/blog?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                }
              ]
            })
          }}
        />

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>

          {/* ── Instant navigation progress bar — above all layers ── */}
          <NavigationProgress />

          {/* ── Scroll-to-top on every route change / refresh ── */}
          <ScrollRestorer />

          {/* ── 3D animated canvas — sits behind everything ── */}
          <AnimatedBackground />

          {/* ── Grid lines overlay ── */}
          <div className="fixed inset-0 grid-bg pointer-events-none" style={{ zIndex: 2 }} />

          {/* ── Main content — above canvas + grid ── */}
          <div className="relative min-h-screen" style={{ zIndex: 10 }}>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </div>

          <Toaster
            position="bottom-right"
            containerStyle={{ zIndex: 9999 }}
            toastOptions={{
              style: {
                background:  "hsl(222, 47%, 10%)",
                color:       "hsl(210, 40%, 96%)",
                border:      "1px solid hsl(217, 91%, 60%, 0.2)",
                fontFamily:  "var(--font-dm-sans)",
              },
              success: { iconTheme: { primary: "#14B8A6", secondary: "#0A0F1E" } },
              error:   { iconTheme: { primary: "#EF4444", secondary: "#0A0F1E" } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
