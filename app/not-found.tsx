import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Background orb */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[500px] h-[500px] rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="relative text-center max-w-md">
        {/* 404 number */}
        <div className="font-display text-[10rem] leading-none font-extrabold gradient-text select-none mb-2">
          404
        </div>

        {/* Mono label */}
        <p className="font-mono text-sm text-blue-400 mb-4 tracking-wider uppercase">
          Page Not Found
        </p>

        <h1 className="font-display text-2xl font-bold text-foreground mb-3">
          Oops — nothing here
        </h1>
        <p className="text-muted-foreground text-sm mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist, has been moved, or the
          URL might be mistyped.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 text-sm"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 border border-border hover:border-blue-500/40 hover:bg-blue-500/5 text-muted-foreground hover:text-foreground rounded-xl transition-all duration-200 text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Contact Me
          </Link>
        </div>
      </div>
    </div>
  );
}
