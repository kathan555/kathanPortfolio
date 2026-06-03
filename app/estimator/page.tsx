import { Metadata } from 'next';
import EstimatorClient from '@/components/EstimatorClient';

export const metadata: Metadata = {
  title: "Free AI Project Cost Estimator — .NET & Blazor Development.",
  description:
    "Get a free AI-powered cost estimate for your .NET, Blazor, or web development project in seconds. Answer 7 questions, receive a detailed budget breakdown. No sign-up required.",
  keywords: [
    // Tool-seeking intent
    "free software project cost estimator",
    "AI project cost calculator",
    "free project estimation tool",
    "software development cost calculator",
    "software development budget calculator",
    "project cost calculator free",
    "AI cost calculator software development",
    "free software cost estimator online",
    // .NET / Blazor specific
    ".NET development cost estimator",
    "Blazor development cost",
    "how much does .NET development cost",
    "ASP.NET Core development cost",
    "how much does Blazor development cost",
    ".NET project budget estimator",
    "WPF development cost estimate",
    "C# development cost calculator",
    // General development cost research
    "how much does software development cost",
    "web app development cost estimator",
    "custom software development pricing",
    "software development pricing calculator",
    "hire .NET developer cost",
    "freelance .NET developer rates",
    // Geographic
    "software development cost USA",
    "software development cost UK",
    "software development cost Australia",
    "software development cost Russia",
    ".NET development cost USA",
    ".NET development cost UK",
    "Blazor developer cost Australia",
    // Branding
    "Kathan Patel cost estimator",
    "Kathan N. Patel",
  ],
  authors: [{ name: "Kathan N. Patel" }],
  creator: "Kathan N. Patel",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://kathanpatel.vercel.app/estimator",
    languages: {
      "en-US": "https://kathanpatel.vercel.app/estimator",
      "en-GB": "https://kathanpatel.vercel.app/estimator",
      "ru-RU": "https://kathanpatel.vercel.app/estimator",
      "x-default": "https://kathanpatel.vercel.app/estimator",
    },
  },
  openGraph: {
    title: "Free AI Project Cost Estimator — .NET & Blazor Development | Kathan N. Patel",
    description:
      "Instant AI-powered budget estimate for your .NET, Blazor, or web project. Answer 7 questions, get a full cost breakdown in seconds. Completely free, no sign-up.",
    url: "https://kathanpatel.vercel.app/estimator",
    siteName: "Kathan N. Patel",
    type: "website",
    locale: "en_US",
    alternateLocale: ["en_GB", "ru_RU"],
    images: [
      {
        url: "https://kathanpatel.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "Free AI Project Cost Estimator — Kathan N. Patel",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free AI Project Cost Estimator — .NET & Blazor | Kathan N. Patel",
    description:
      "Instant AI-powered budget estimate for your .NET or Blazor project. 7 questions, full cost breakdown in seconds. Free, no sign-up.",
    images: ["https://kathanpatel.vercel.app/og-image.png"],
  },
};

export default function EstimatorPage() {
  return (
    <div className="min-h-screen pt-28 ">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ✅ Static — server-rendered, fully visible to Google */}
        <div className="mb-6 text-center">
          <span className="inline-flex items-center gap-1.5 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full mb-4 font-mono tracking-wide">
            ✦ FREE AI-POWERED
          </span>
          <h1 className="font-display text-4xl sm:text-5xl font-bold mt-3 mb-4">
            Free Project Cost Estimator
          </h1>
          <h2 className="text-muted-foreground text-lg leading-relaxed mb-4">
            Not sure what your .NET or Blazor project will cost? Answer few short questions and get an AI-powered budget breakdown instantly - covering
            development hours, architecture complexity, and engagement type - completely free in your inbox.
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed mb-4">
            This free .NET project cost estimator uses AI to generate a realistic
            budget range based on your project scope, preferred engagement model,
            and technology stack — including Blazor Server, ASP.NET Core, WPF,
            and Azure OpenAI integrations. Estimates are tailored for clients.
          </p>
        </div>

        {/* ✅ Interactive tool — still fully client-side */}
        <EstimatorClient />

      </div>
    </div>
  );
}