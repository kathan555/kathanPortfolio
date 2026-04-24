import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider }      from "@/components/ThemeProvider";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import { Navbar }             from "@/components/Navbar";
import { Footer }             from "@/components/Footer";
import { Toaster }            from "react-hot-toast";

const syne          = Syne({ subsets: ["latin"], variable: "--font-syne",          weight: ["400","500","600","700","800"] });
const dmSans        = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans",   weight: ["300","400","500","600"], style: ["normal","italic"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", weight: ["400","500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://kathanpatel.dev"), // ← Replace with your real domain
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
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>

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
