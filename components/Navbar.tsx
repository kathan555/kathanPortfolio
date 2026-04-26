"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Code2, ChevronDown,
  Briefcase, Code, GraduationCap,
  FolderOpen, Github, PenLine, Calculator, Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { personalInfo } from "@/lib/data";

// ── Nav structure ─────────────────────────────────────────────────────────────
const navLinks = [
  {
    label:    "About",
    href:     "/about",
    children: null,
  },
  {
    label: "Professional Details",
    href:  "#",
    children: [
      { label: "Skills",     href: "/skills",     icon: <Code          className="w-4 h-4" />, desc: "Tech stack & libraries"      },
      { label: "Experience", href: "/experience", icon: <Briefcase     className="w-4 h-4" />, desc: "Career history & roles"       },
      { label: "Education",  href: "/education",  icon: <GraduationCap className="w-4 h-4" />, desc: "Academic background"          },
      { label: "Projects",   href: "/projects",   icon: <FolderOpen    className="w-4 h-4" />, desc: "Production work & outcomes"   },
    ],
  },
  {
    label: "More",
    href:  "#",
    children: [
      { label: "GitHub Showcase", href: "/github",         icon: <Github     className="w-4 h-4" />, desc: "Open-source repositories"   },
      { label: "Blog",            href: "/blog",           icon: <PenLine    className="w-4 h-4" />, desc: "Thoughts & tutorials"        },
      { label: "Cost Estimator",  href: "/estimator",      icon: <Calculator className="w-4 h-4" />, desc: "Project cost calculator"     },
      { label: "AI Integration",  href: "/ai-integration", icon: <Brain      className="w-4 h-4" />, desc: ".NET + AI showcase & demo"   },
    ],
  },
  {
    label:    "Contact",
    href:     "/contact",
    children: null,
  },
];

type NavChild = { label: string; href: string; icon: React.ReactNode; desc: string };

// ── Dropdown panel component ───────────────────────────────────────────────────
function DropdownPanel({
  items,
  align = "left",
}: {
  items: NavChild[];
  align?: "left" | "right";
}) {
  const pathname = usePathname();

  return (
    <motion.div
      initial={{ opacity: 0, y: 8,  scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{    opacity: 0, y: 8,  scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      className={cn(
        "absolute top-full mt-2 w-64 glass-card rounded-2xl overflow-hidden",
        "shadow-2xl shadow-blue-500/10 border border-blue-500/15",
        align === "right" ? "right-0" : "left-0"
      )}
    >
      <div className="p-1.5 flex flex-col gap-0.5">
        {items.map((child) => {
          const active = pathname.startsWith(child.href);
          return (
            <Link
              key={child.href}
              href={child.href}
              prefetch={true}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group",
                active
                  ? "bg-blue-500/12 text-blue-400"
                  : "text-muted-foreground hover:bg-blue-500/8 hover:text-foreground"
              )}
            >
              {/* Icon box */}
              <span className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                active
                  ? "bg-blue-500/20 text-blue-400"
                  : "bg-muted/60 text-muted-foreground group-hover:bg-blue-500/10 group-hover:text-blue-400"
              )}>
                {child.icon}
              </span>

              {/* Text */}
              <div className="min-w-0">
                <p className={cn(
                  "text-sm font-semibold leading-tight",
                  active ? "text-blue-400" : "text-foreground"
                )}>
                  {child.label}
                </p>
                <p className="text-xs text-muted-foreground leading-tight mt-0.5 truncate">
                  {child.desc}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export function Navbar() {
  const [scrolled,       setScrolled]       = useState(false);
  const [mobileOpen,     setMobileOpen]     = useState(false);
  const [openDropdown,   setOpenDropdown]   = useState<string | null>(null);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const pathname = usePathname();
  const navRef   = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Scroll shadow
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reset everything on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setMobileExpanded(null);
  }, [pathname]);

  function toggleDesktopDropdown(label: string) {
    setOpenDropdown((prev) => (prev === label ? null : label));
  }

  function toggleMobileSection(label: string) {
    setMobileExpanded((prev) => (prev === label ? null : label));
  }

  function anyChildActive(children: NavChild[]) {
    return children.some((c) => pathname.startsWith(c.href));
  }

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,   opacity: 1  }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-blue-500/10 shadow-lg shadow-blue-500/5"
          : "bg-transparent"
      )}
    >
      <nav ref={navRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <motion.div 
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95, y: 1 }}
              className="relative cursor-pointer"
            >
              {/* LIGHT MODE: Soft Drop Shadow | DARK MODE: Blue Glow */}
              <div className="absolute inset-0 bg-blue-500/30 blur-2xl rounded-full opacity-0 group-hover:opacity-100 dark:group-hover:bg-blue-400/40 transition-all duration-500" />
              
              {/* The Main 3D Container */}
              <div className="relative w-12 h-12 flex items-center justify-center rounded-2xl 
                /* Light Mode: White clay look */
                bg-white shadow-[0_10px_20px_rgba(0,0,0,0.05),inset_0_-2px_6px_rgba(0,0,0,0.1)] 
                /* Dark Mode: Glass look */
                dark:bg-slate-900 dark:shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]
                dark:backdrop-blur-xl border border-slate-200 dark:border-white/10
                transition-colors duration-300 overflow-hidden"
              >
                {/* Constant Floating Particle Animation (Always moving) */}
                <motion.div 
                  animate={{ 
                    y: [0, -20, 0],
                    opacity: [0, 1, 0] 
                  }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-blue-500/20 to-transparent"
                />

                {/* High-Gloss Shine (Triggers on Hover) */}
                <motion.div 
                  initial={{ x: '-100%', skewX: -20 }}
                  whileHover={{ x: '200%' }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent z-10"
                />
                
                <span className="relative z-20 text-2xl font-display font-black text-slate-900 dark:text-white">
                  K<span className="text-blue-600 dark:text-blue-400">.</span>
                </span>
              </div>
            </motion.div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-display font-black text-xl tracking-tighter text-slate-900 dark:text-white leading-none">
                  KATHAN
                </span>
                <motion.div 
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="w-1.5 h-4 bg-amber-500 rounded-full"
                />
              </div>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-0.5">

            {navLinks.map((link) => {
              // Plain link (About, Contact)
              if (!link.children) {
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    prefetch={true}
                    className={cn(
                      "px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                      pathname === link.href
                        ? "text-blue-400 bg-blue-500/8"
                        : "text-muted-foreground hover:text-foreground hover:bg-blue-500/5"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              }

              // Dropdown
              const isOpen   = openDropdown === link.label;
              const isActive = anyChildActive(link.children);

              return (
                <div key={link.label} className="relative">
                  <button
                    onClick={() => toggleDesktopDropdown(link.label)}
                    className={cn(
                      "flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg transition-colors duration-200",
                      isOpen || isActive
                        ? "text-blue-400 bg-blue-500/8"
                        : "text-muted-foreground hover:text-foreground hover:bg-blue-500/5"
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn(
                      "w-3.5 h-3.5 transition-transform duration-200 opacity-70",
                      isOpen && "rotate-180"
                    )} />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <DropdownPanel
                        items={link.children}
                        align={link.label === "More" ? "right" : "left"}
                      />
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {/* ── Right-side actions ── */}
            <div className="flex items-center gap-2 ml-3 pl-3 border-l border-border/60">
              <ThemeToggle />
              <a
                href="/Kathan_Patel_Resume.pdf"
                download
                className="px-3 py-2 text-sm font-medium border border-border text-muted-foreground rounded-lg hover:border-blue-500/30 hover:text-foreground transition-all flex items-center gap-1.5"
              >
                Resume
                <svg className="w-3 h-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>
              <Link
                href="/hire"
                prefetch={true}
                className="px-4 py-2 text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-px whitespace-nowrap"
              >
                Hire Me
              </Link>
            </div>
          </div>

          {/* ── Mobile: theme + burger ── */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{    opacity: 0, height: 0    }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-background/97 backdrop-blur-xl border-b border-blue-500/10 overflow-hidden"
          >
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">

              {/* Availability */}
              {personalInfo.availableForWork && (
                <div className="flex items-center gap-2 px-3 py-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0" />
                  <span className="text-xs text-teal-400 font-medium">
                    Available for freelance / contract work
                  </span>
                </div>
              )}

              {/* Hire Me */}
              <Link
                href="/hire"
                prefetch={true}
                className="flex items-center justify-center px-4 py-3 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors mb-1"
              >
                Hire Me →
              </Link>

              {/* Nav items */}
              {navLinks.map((link) => {
                // Plain link
                if (!link.children) {
                  return (
                    <Link
                      key={link.label}
                      href={link.href}
                      prefetch={true}
                      className={cn(
                        "block px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                        pathname === link.href
                          ? "text-blue-400 bg-blue-500/8"
                          : "text-muted-foreground hover:text-foreground hover:bg-blue-500/5"
                      )}
                    >
                      {link.label}
                    </Link>
                  );
                }

                // Expandable section
                const isExpanded = mobileExpanded === link.label;
                const isActive   = anyChildActive(link.children);

                return (
                  <div key={link.label}>
                    <button
                      onClick={() => toggleMobileSection(link.label)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-sm font-semibold rounded-xl transition-colors",
                        isActive || isExpanded
                          ? "text-blue-400 bg-blue-500/8"
                          : "text-muted-foreground hover:text-foreground hover:bg-blue-500/5"
                      )}
                    >
                      <span>{link.label}</span>
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-200 opacity-70",
                        isExpanded && "rotate-180"
                      )} />
                    </button>

                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{    height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="pl-3 pr-1 pb-1 pt-0.5 flex flex-col gap-0.5">
                            {link.children.map((child) => {
                              const childActive = pathname.startsWith(child.href);
                              return (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  prefetch={true}
                                  className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors",
                                    childActive
                                      ? "text-blue-400 bg-blue-500/10"
                                      : "text-muted-foreground hover:text-foreground hover:bg-blue-500/5"
                                  )}
                                >
                                  <span className={cn(
                                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                                    childActive
                                      ? "bg-blue-500/20 text-blue-400"
                                      : "bg-muted/60 text-muted-foreground"
                                  )}>
                                    {child.icon}
                                  </span>
                                  <div>
                                    <p className="text-sm font-medium leading-tight">{child.label}</p>
                                    <p className="text-xs text-muted-foreground leading-tight">{child.desc}</p>
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}

              {/* Resume download */}
              <a
                href="/Kathan_Patel_Resume.pdf"
                download
                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-blue-500/5 rounded-xl transition-colors mt-1 border border-border hover:border-blue-500/20"
              >
                Download Resume ↓
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
