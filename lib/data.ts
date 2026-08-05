export const personalInfo = {
  name: "Kathan N. Patel",
  title: "Technical Lead (ASP.NET)",
  fullTitle: "Technical Lead · Full Stack .NET Developer",
  email: "patel.kathan555@gmail.com",
  phone: "(+91) 7600410895",
  github: "https://github.com/kathan555",
  linkedin: "https://www.linkedin.com/in/kathan-patel-92215213a/",
  portfolio: "https://kathan555.github.io/professional-flyer/",
  location: "Ahmedabad, India",
  yearsExp: "8+",
  // ── Availability status shown in Navbar & Hero ──
  availableForWork: true,
  availableFrom: "Immediately",
  photo: "/SelfImage.jpg",
  /** Cal.com, Calendly, or Google Appointment schedule URL — override via NEXT_PUBLIC_CALENDAR_BOOKING_URL */
  calendarBookingUrl: "https://cal.com/kathanpatel9/30min",
};

export const summary =
  "I'm a freelance .NET Technical Lead with 8+ years of experience building production-grade web and desktop applications. I specialise in Blazor, ASP.NET Core, and WPF — helping startups and businesses turn complex requirements into clean, scalable software. Remote-friendly, deadline-driven, and available for contract work right now.";

export const education = [
  {
    degree: "Bachelor Degree of Computer Science",
    institution: "Silver Oak College of Engineering & Technology",
    location: "Ahmedabad",
    period: "Jun 2013 – May 2017",
  },
];

export const skills = [
  {
    category: "Programming Languages",
    icon: "code",
    items: ["C#", "JavaScript", "jQuery", "TypeScript"],
  },
  {
    category: "Frameworks",
    icon: "layers",
    items: ["ASP.NET Core", "Blazor Server", "WPF", ".NET Core 6/9"],
  },
  {
    category: "Databases",
    icon: "database",
    items: ["MS-SQL", "MySQL"],
  },
  {
    category: "Frontend",
    icon: "monitor",
    items: ["HTML/CSS", "XAML", "React.js", "Razor Pages"],
  },
  {
    category: "Tools & Libraries",
    icon: "wrench",
    items: [
      "GitHub", "SourceTree", "LINQ", "Telerik",
      "SciChart", "Syncfusion", "LEAD Tools",
      "DevExpress", "Hangfire", "ABP.io",
    ],
  },
];

export const experiences = [
  {
    id: 1,
    role: "Technical Lead",
    company: "Digip Technologies",
    period: "Mar 2024 – Present",
    duration: "Present",
    type: "current",
    achievements: [
      "Lead client discussions to gather requirements and align project goals before each sprint.",
      "Plan and prioritize tasks with clients, ensuring high-priority deliverables are met within timelines.",
      "Coordinate cross-functional efforts to achieve targets efficiently and maintain clear communication throughout the process.",
    ],
  },
  {
    id: 2,
    role: "Senior Engineer (SE-1)",
    company: "Parkar Digital",
    period: "Feb 2023 – Mar 2024",
    duration: "1 yr 2 mos",
    type: "past",
    achievements: [
      "Designed and built secure, high-performance applications using .NET technologies to meet client needs.",
      "Worked closely with stakeholders in daily stand-ups to refine requirements and deliver tailored solutions.",
      "Developed user-friendly interfaces and integrated APIs for seamless data access.",
      "Ensured timely delivery of features and bug fixes while upholding coding standards.",
      "Guided junior developers to enhance team problem-solving and technical expertise.",
    ],
  },
  {
    id: 3,
    role: "Senior Software Developer",
    company: "Digip Technologies",
    period: "Mar 2018 – Feb 2023",
    duration: "5 yrs",
    type: "past",
    achievements: [
      "Conducted code reviews to ensure adherence to best practices and coding standards.",
      "Debugged and resolved software defects efficiently to maintain product quality.",
      "Designed reusable LINQ expression libraries for optimized data filtering in grid views.",
      "Developed a script-based trading system enabling users to customize trading scripts.",
      "Built responsive user interfaces using XAML in WPF and implemented business logic in C# for WPF and ASP.NET Core projects.",
      "Collaborated with frontend and backend teams to integrate UI with underlying systems.",
      "Created RESTful APIs using ASP.NET Core to enable efficient data exchange between applications.",
    ],
  },
];

export const projects = [
  {
    id: 1,
    title: "North City Law",
    subtitle: "Legal Practice Automation Platform",
    period: "Nov 2025 – Apr 2026",
    domain: "Legal Tech",
    domainColor: "blue",
    description:
      "Automated background jobs using Hangfire on Blazor Server + .NET 9 to securely transfer contacts, call recordings, transcripts, and related data between Clio, Lawmatics, and Zoom platforms.",
    highlights: [
      "Single-click OAuth 2.0 token generation and management for Clio and Zoom",
      "Scheduled periodic workflows for hands-free data synchronization",
      "Real-time consistency across legal practice management tools",
    ],
    result: "Eliminated manual data entry entirely — saving the firm 10+ hours per week of admin work.",
    tags: ["Blazor Server", ".NET 9", "Hangfire", "OAuth 2.0", "Clio API", "Lawmatics", "Zoom API"],
  },
  {
    id: 2,
    title: "Guard Resource One",
    subtitle: "Multi-Tenant Security Management SaaS",
    period: "Jan 2025 – Present",
    domain: "Enterprise SaaS",
    domainColor: "teal",
    description:
      "Developing a tenant-based web application using Blazor Server, ABP.io framework, and Syncfusion libraries for security guard management.",
    highlights: [
      "Multi-tenant organization and company management",
      "Company-specific guard creation with detailed profiles",
      "Subscription-based access control for scalable SaaS model",
    ],
    result: "Enabled the client to onboard multiple companies under one platform with zero data overlap.",
    tags: ["Blazor Server", "ABP.io", "Syncfusion", "Multi-tenancy", "C#", "MS-SQL"],
  },
  {
    id: 3,
    title: "King & Shaxson",
    subtitle: "High-Performance Desktop Trading Platform",
    period: "Feb 2024 – Present",
    domain: "Fintech",
    domainColor: "purple",
    description:
      "Designed a desktop trading application using WPF and DevExpress libraries, optimized for high-performance UI with large datasets.",
    highlights: [
      "Real-time trading on instruments at current market prices",
      "Live match, auction, and matrix trading sessions",
      "Custom kernel integration for reliable trade execution",
    ],
    result: "Delivered a sub-100ms UI response time for live trading operations handling thousands of ticks per second.",
    tags: ["WPF", "DevExpress", "C#", "Real-time Trading", "XAML", ".NET"],
  },
  {
    id: 4,
    title: "Brook Furniture Rental",
    subtitle: "E-Commerce Rental Platform",
    period: "Apr 2023 – Jan 2024",
    domain: "E-Commerce",
    domainColor: "orange",
    description:
      "Built a full-featured e-commerce platform for furniture rental using .NET Framework 4.6, React.js, C#, and MS-SQL.",
    highlights: [
      "Lease creation and management workflows",
      "Secure online payment processing integration",
      "Product browsing, cart, and purchasing capabilities",
    ],
    result: "Launched the platform from zero — replacing a fully manual leasing process with an automated online system.",
    tags: ["React.js", ".NET Framework 4.6", "C#", "MS-SQL", "REST API", "Payment Gateway"],
  },
  {
    id: 5,
    title: "Finsys",
    subtitle: "Stock Market Analytics Platform",
    period: "Mar 2020 – Feb 2023",
    domain: "Fintech",
    domainColor: "blue",
    description:
      "Finance-domain project for stock market trend analysis and predictive insights, with both desktop (WPF) and web (Blazor) interfaces.",
    highlights: [
      "Real-time data visualization using SciChart",
      "Predictive analytics and trend forecasting",
      "Cross-platform desktop and web compatibility",
    ],
    result: "Reduced analyst report generation time from hours to minutes via automated real-time dashboards.",
    tags: ["WPF", "Blazor", ".NET Core 6", "SciChart", "Syncfusion", "MySQL", "LINQ"],
  },
  {
    id: 6,
    title: "Triage",
    subtitle: "Healthcare Records Management",
    period: "Mar 2018 – Feb 2020",
    domain: "Healthcare",
    domainColor: "green",
    description:
      "Healthcare product managing patient health records and medication data using WPF, C#, and specialized medical imaging libraries.",
    highlights: [
      "Secure storage and retrieval of patient records",
      "Medication tracking and management system",
      "Medical imaging with LEAD Tools integration",
    ],
    result: "Improved record retrieval speed by 60% and eliminated paper-based medication tracking across departments.",
    tags: ["WPF", "C#", "MS-SQL", "XAML", "LINQ", "LEAD Tools", "Telerik"],
  },
];

// ── Independent / self-built projects ─────────────────────────────────────────
// Products designed and shipped SOLO — no client, no team. This is the counterpart
// to `projects` (client work): it shows initiative, range, and an AI-accelerated
// build workflow. Each entry links to its public GitHub repo and, where one exists,
// a live demo. Keep this list curated and honest — only real, shipped repos.
export const selfBuilt = [
  {
    id: 1,
    title: "NOCpilot",
    subtitle: "Multi-Tenant Fire-Safety Compliance SaaS",
    domain: "SaaS Backend",
    domainColor: "blue",
    description:
      "An India-first compliance platform that stores fire-safety documents, derives each premise's legal obligations from state rules, and reminds owners before every renewal deadline — architected end-to-end as a multi-tenant .NET backend.",
    highlights: [
      "JWT identity with rotating refresh tokens, automatic per-tenant row isolation, and per-tenant envelope encryption",
      "A “rules as data” obligation engine plus an encrypted document vault with inspection-ready exports",
      "Reminder scheduler with WhatsApp → SMS → email fallback, Razorpay billing, and a partner + super-admin console",
    ],
    tags: [".NET", "C#", "Multi-tenancy", "JWT", "Razorpay", "REST API"],
    repo: "https://github.com/kathan555/nocpilot",
    demo: null,
  },
  {
    id: 2,
    title: "This Portfolio + AI Assistant",
    subtitle: "Next.js Site with a Live AI Demo",
    domain: "AI-Powered Web",
    domainColor: "teal",
    description:
      "The site you're on: a Next.js 15 app with a live, Claude-powered AI assistant and an AI project-cost estimator — a working example of AI features running in production, not a mockup.",
    highlights: [
      "Streaming AI chat and an AI cost estimator wired to real API routes with rate limiting",
      "Server-rendered and SEO-tuned, with dark/light theming and a fully responsive layout",
      "Live GitHub showcase and a Supabase-backed blog, all in one codebase",
    ],
    tags: ["Next.js 15", "TypeScript", "Claude AI", "Tailwind", "Supabase"],
    repo: "https://github.com/kathan555/kathanPortfolio",
    demo: "https://kathanpatel.vercel.app",
  },
  {
    id: 3,
    title: "Craftura",
    subtitle: "Furniture Storefront + Admin & CMS",
    domain: "Full-Stack E-Commerce",
    domainColor: "orange",
    description:
      "A full-stack furniture manufacturing website with B2B/B2C ordering, an inquiry-based cart, an admin panel with analytics, order tracking, and a built-in CMS.",
    highlights: [
      "B2B/B2C ordering flows with an inquiry cart — no forced checkout",
      "Admin dashboard for orders, products, and content, with order tracking",
      "Dark/light mode and SEO baked in from the start",
    ],
    tags: ["Next.js 14", "Prisma", "SQLite", "TypeScript", "Tailwind"],
    repo: "https://github.com/kathan555/craftura",
    demo: null,
  },
  {
    id: 4,
    title: "Cohort Analysis Chart",
    subtitle: "Interactive Trading-Style Matrix Grid",
    domain: "WPF / Desktop",
    domainColor: "purple",
    description:
      "A high-interactivity cohort/retention matrix built in WPF (.NET 8) — a customizable grid with full keyboard navigation and a detailed popup view, styled for trading and analytics dashboards.",
    highlights: [
      "13×14 interactive matrix with arrow-key navigation and row/column highlighting",
      "Double-click / Enter popup with a buy-sell order simulation view",
      "Clean MVVM architecture with live-updating cells",
    ],
    tags: ["WPF", ".NET 8", "C#", "MVVM", "XAML"],
    repo: "https://github.com/kathan555/CohortAnalysisChart",
    demo: null,
  },
  {
    id: 5,
    title: "Live Internet Meter",
    subtitle: "Real-Time Speed & Ping Monitor",
    domain: "Browser Tool",
    domainColor: "green",
    description:
      "A single self-contained HTML file that measures ping, download, and upload speed live in the browser — with gauges, sparklines, a rolling history chart, and automatic nearest-server selection. No installs, no backend.",
    highlights: [
      "Live gauges and a rolling history chart, fully client-side",
      "Automatic nearest-server selection",
      "One file, zero build step",
    ],
    tags: ["HTML", "CSS", "JavaScript"],
    repo: "https://github.com/kathan555/live-internet-meter",
    demo: null,
  },
  {
    id: 6,
    title: "Excel Dynamic Viewer",
    subtitle: "Schema-Agnostic Excel & CSV Viewer",
    domain: "WPF / Desktop",
    domainColor: "blue",
    description:
      "A WPF (.NET 9) desktop app that dynamically reads and displays .xls, .xlsx, and .csv files of any column structure — using free, open-source libraries with no licensing fees.",
    highlights: [
      "Auto-detects columns and data types from any spreadsheet",
      "Reads .xls, .xlsx, and .csv via ExcelDataReader",
      "Modern MVVM UI with a clean data grid",
    ],
    tags: ["WPF", ".NET 9", "C#", "MVVM"],
    repo: "https://github.com/kathan555/ExcelDynamicViewer",
    demo: null,
  },
];

// ── Testimonials (point 7) ────────────────────────────────────────────────────
// Replace placeholder quotes with real ones from colleagues/managers/clients
export const testimonials = [
  {
    id: 1,
    quote:
      "Kathan delivered a complete Blazor migration ahead of schedule without a single regression. His attention to architecture and clean code made the handover effortless.",
    name: "Client / Manager Name",
    role: "CTO, Digip Technologies",
    initials: "DT",
  },
  {
    id: 2,
    quote:
      "Working with Kathan on the trading platform was exceptional. He understood the performance constraints from day one and consistently produced a UI that felt instant.",
    name: "Client / Colleague Name",
    role: "Project Manager, King & Shaxson",
    initials: "KS",
  },
  {
    id: 3,
    quote:
      "Kathan's ability to translate our legal workflow into an automated system saved us weeks of manual effort every month. Highly recommended for complex integrations.",
    name: "Client / Stakeholder Name",
    role: "Operations Lead, North City Law",
    initials: "NC",
  },
];

// ── Hire Me page data (point 2) ───────────────────────────────────────────────
export const services = [
  {
    icon: "🌐",
    title: "Blazor Web Applications",
    desc: "Full-stack Blazor Server or WASM applications — from SaaS platforms to internal business tools. Clean architecture, real-time UI, and solid API design.",
    tags: ["Blazor Server", "Blazor WASM", "ASP.NET Core", "MS-SQL"],
  },
  {
    icon: "🖥️",
    title: "WPF Desktop Software",
    desc: "High-performance Windows desktop applications with rich XAML UIs, real-time data grids, charting, and business logic — built for demanding industries like fintech and healthcare.",
    tags: ["WPF", "XAML", "C#", "DevExpress", "SciChart"],
  },
  {
    icon: "🔌",
    title: "API Development & Integration",
    desc: "RESTful APIs, background job pipelines with Hangfire, OAuth 2.0 integrations, and third-party platform connections (Zoom, Clio, Lawmatics, payment gateways).",
    tags: ["ASP.NET Core", "REST API", "Hangfire", "OAuth 2.0"],
  },
  {
    icon: "☁️",
    title: "Legacy .NET Migration",
    desc: "Modernise your old WinForms, .NET Framework 4.x, or WebForms app to .NET 8/9 with Blazor or ASP.NET Core — without breaking what already works.",
    tags: [".NET Migration", "Blazor", "ASP.NET Core", ".NET 9"],
  },
  {
    icon: "🏗️",
    title: "Architecture & Technical Lead",
    desc: "Need a senior hand to define your system architecture, review code, set up CI/CD, or guide your dev team? I can step in as a fractional technical lead.",
    tags: ["System Design", "Code Review", "CI/CD", "Team Mentoring"],
  },
  {
    icon: "🚀",
    title: "End-to-End MVP Build",
    desc: "Got an idea? I'll help you scope, plan sprints, and ship a working MVP fast — handling everything from database design to deployment on Azure or Vercel.",
    tags: ["MVP", "Full-Stack", "Azure", "Sprint Planning"],
  },
];

export const process = [
  {
    step: "01",
    title: "Discovery Call",
    desc: "Free 30-minute call to understand your project, goals, constraints, and timeline.",
  },
  {
    step: "02",
    title: "Proposal & Quote",
    desc: "Detailed scope document with deliverables, milestones, timeline, and fixed or hourly pricing.",
  },
  {
    step: "03",
    title: "Sprint Delivery",
    desc: "Weekly sprints with demos. You see working software every week — no black-box development.",
  },
  {
    step: "04",
    title: "Handover & Support",
    desc: "Clean code handover with docs, deployment, and 30-day post-launch support included.",
  },
];
