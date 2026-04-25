"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Code2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { personalInfo } from "@/lib/data";

const navLinks = [
  { label: "About",      href: "/about" },
  { label: "Skills",     href: "/skills" },
  { label: "Experience", href: "/experience" },
  { label: "Projects",   href: "/projects" },
  {
    label: "More",
    href: "#",
    children: [
      { label: "GitHub Showcase",    href: "/github" },
      { label: "Blog",               href: "/blog" },
      { label: "Cost Estimator",     href: "/estimator" },
      { label: "AI Integration",     href: "/ai-integration" },
      { label: "Education",          href: "/education" },
    ],
  },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const [scrolled,     setScrolled]     = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0,  opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/90 backdrop-blur-xl border-b border-blue-500/10 shadow-lg shadow-blue-500/5"
          : "bg-transparent"
      )}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-4 group">
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
                  className="w-1.5 h-4 bg-blue-500 rounded-full"
                />
              </div>
              
              {personalInfo.availableForWork && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.2em] font-black text-slate-500 dark:text-slate-400">
                    Available
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) =>
              link.children ? (
                <div key={link.label} className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    onBlur={() => setTimeout(() => setDropdownOpen(false), 150)}
                    className={cn(
                      "nav-link flex items-center gap-1 px-4 py-2 text-sm font-medium transition-colors duration-200",
                      link.children.some((c) => pathname.startsWith(c.href))
                        ? "text-blue-400"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {link.label}
                    <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", dropdownOpen && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{   opacity: 0, y: 6 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-48 glass-card rounded-xl overflow-hidden shadow-xl"
                      >
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "block px-4 py-2.5 text-sm transition-colors hover:bg-blue-500/10 hover:text-blue-400",
                              pathname.startsWith(child.href) ? "text-blue-400" : "text-muted-foreground"
                            )}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link
                  key={link.label}
                  href={link.href}
                  className={cn(
                    "nav-link px-4 py-2 text-sm font-medium transition-colors duration-200",
                    pathname === link.href
                      ? "text-blue-400"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                </Link>
              )
            )}

            <div className="flex items-center gap-2 ml-2">
              <ThemeToggle />

              {/* Resume */}
              <a
                href="/Kathan_Patel_Resume.pdf"
                download
                className="px-3 py-2 text-sm font-medium bg-muted/60 border border-border text-muted-foreground rounded-lg hover:border-blue-500/30 hover:text-foreground transition-all flex items-center gap-1.5"
              >
                Resume
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </a>

              {/* ── Point 1: Hire Me CTA ── */}
              <Link
                href="/hire"
                className="px-4 py-2 text-sm font-semibold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-px"
              >
                Hire Me
              </Link>
            </div>
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              className="w-10 h-10 flex items-center justify-center rounded-lg border border-border hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-blue-500/10"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">

              {/* Availability badge on mobile */}
              {personalInfo.availableForWork && (
                <div className="flex items-center gap-2 px-4 py-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
                  <span className="text-xs text-teal-400 font-medium">
                    Available for freelance / contract work
                  </span>
                </div>
              )}

              {/* Hire Me — top of mobile menu */}
              <Link
                href="/hire"
                className="block px-4 py-3 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors text-center mb-1"
              >
                Hire Me →
              </Link>

              {navLinks.map((link, i) =>
                link.children ? (
                  <div key={link.label}>
                    <p className="px-4 py-2 text-xs text-muted-foreground uppercase tracking-wider font-medium mt-1">
                      {link.label}
                    </p>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="block px-6 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-blue-500/5 rounded-lg transition-colors"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <Link
                      href={link.href}
                      className={cn(
                        "block px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                        pathname === link.href
                          ? "text-blue-400 bg-blue-500/5"
                          : "text-muted-foreground hover:text-foreground hover:bg-blue-500/5"
                      )}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                )
              )}

              <a
                href="/Kathan_Patel_Resume.pdf"
                download
                className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:bg-blue-500/5 rounded-lg transition-colors mt-1"
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