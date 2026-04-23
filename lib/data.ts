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
};

export const summary =
  "Results-driven Technical Lead with 8+ years of experience in designing and developing scalable full-stack applications using .NET Core, Blazor, and WPF. Proven ability to translate complex business requirements into robust technical solutions. Adept in project leadership, stakeholder communication, and mentoring junior developers. Strong expertise in building interactive, high-performance web and desktop applications across fintech, healthcare, and e-commerce domains.";

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
      "GitHub",
      "SourceTree",
      "LINQ",
      "Telerik",
      "SciChart",
      "Syncfusion",
      "LEAD Tools",
      "DevExpress",
      "Hangfire",
      "ABP.io",
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
    tags: ["Blazor Server", ".NET 9", "Hangfire", "OAuth 2.0", "Clio API", "Lawmatics", "Zoom API"],
    focus: "Reliable, hands-off data synchronization across legal tools, improving operational efficiency for law firms.",
  },
  {
    id: 2,
    title: "Guard Resource One",
    subtitle: "Multi-Tenant Security Management",
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
    tags: ["Blazor Server", "ABP.io", "Syncfusion", "Multi-tenancy", "C#", "MS-SQL"],
    focus: "Intuitive, multi-tenant system with robust data grids and controls for seamless user interaction.",
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
    tags: ["WPF", "DevExpress", "C#", "Real-time Trading", "XAML", ".NET"],
    focus: "Fast, responsive interface for traders handling complex financial operations.",
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
    tags: ["React.js", ".NET Framework 4.6", "C#", "MS-SQL", "REST API", "Payment Gateway"],
    focus: "Streamlined, feature-rich rental solution enhancing user experience.",
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
    tags: ["WPF", "Blazor", ".NET Core 6", "SciChart", "Syncfusion", "MySQL", "LINQ"],
    focus: "Actionable financial insights through advanced visualization tools.",
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
    tags: ["WPF", "C#", "MS-SQL", "XAML", "LINQ", "LEAD Tools", "Telerik"],
    focus: "Data accuracy and usability in a critical healthcare environment.",
  },
];
