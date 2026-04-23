import type { Metadata } from "next";
import { Syne, DM_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Toaster } from "react-hot-toast";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", weight: ["400","500","600","700","800"] });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-dm-sans", weight: ["300","400","500","600"], style: ["normal","italic"] });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono", weight: ["400","500"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://kathanpatel.dev"),
  title: { default: "Kathan N. Patel — Technical Lead, Full Stack .NET Developer", template: "%s | Kathan N. Patel" },
  description: "Technical Lead with 8+ years of experience building scalable full-stack applications using .NET Core, Blazor, and WPF.",
  keywords: ["Kathan Patel", ".NET Developer", "Blazor", "ASP.NET Core", "WPF", "Technical Lead", "C#"],
  authors: [{ name: "Kathan N. Patel" }],
  openGraph: {
    type: "website", locale: "en_IN", url: "https://kathanpatel.dev",
    title: "Kathan N. Patel — Technical Lead, Full Stack .NET Developer",
    description: "Technical Lead with 8+ years building scalable .NET applications.",
    siteName: "Kathan N. Patel Portfolio",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Kathan N. Patel Portfolio" }],
  },
  twitter: { card: "summary_large_image", title: "Kathan N. Patel — Technical Lead", images: ["/og-image.png"] },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} bg-background text-foreground antialiased min-h-screen`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <div className="grid-bg min-h-screen">
            <Navbar />
            <main>{children}</main>
            <Footer />
          </div>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: { background: "hsl(222, 47%, 10%)", color: "hsl(210, 40%, 96%)", border: "1px solid hsl(217, 91%, 60%, 0.2)", fontFamily: "var(--font-dm-sans)" },
              success: { iconTheme: { primary: "#14B8A6", secondary: "#0A0F1E" } },
              error:   { iconTheme: { primary: "#EF4444", secondary: "#0A0F1E" } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
