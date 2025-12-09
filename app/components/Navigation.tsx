"use client";

import { auth } from "@/lib/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

type Session = typeof auth.$Infer.Session;

export default function Navigation({ session }: { session: Session | null }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  return (
   <header className="bg-white/50 dark:bg-neutral-950/50 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <span className="text-xl font-semibold">Civintel</span>
          </Link>

          {/* Mobile menu toggle */}
           <button
             onClick={() => setOpen(!open)}
             className="md:hidden p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer"
             aria-label="Toggle menu"
           >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-2">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm ${
                isActive("/") ? "bg-neutral-100 dark:bg-neutral-800" : "opacity-80 hover:opacity-100"
              }`}
            >
              Home
            </Link>
            <Link
              href="/spots/nearby"
              className={`px-3 py-2 rounded-md text-sm ${
                isActive("/spots/nearby") ? "bg-neutral-100 dark:bg-neutral-800" : "opacity-80 hover:opacity-100"
              }`}
            >
              Nearby
            </Link>
            <Link
              href="/spots/new"
              className={`px-3 py-2 rounded-md text-sm ${
                isActive("/spots/new") ? "bg-neutral-100 dark:bg-neutral-800" : "opacity-80 hover:opacity-100"
              }`}
            >
              Add Report
            </Link>

            {session ? (
              <Link href="/dashboard" className="ml-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm">
                Dashboard
              </Link>
            ) : (
              <Link href="/auth" className="ml-2 px-4 py-2 rounded-lg border text-sm">
                Sign in
              </Link>
            )}

            {/* Theme toggle button */}
            {/* <ThemeToggleButton className="ml-2" /> */}
          </nav>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden pb-4 flex flex-col gap-1">
            <Link
              href="/"
              className={`px-3 py-2 rounded-md text-sm ${
                isActive("/") ? "bg-neutral-100 dark:bg-neutral-800" : "opacity-80 hover:opacity-100"
              }`}
            >
              Home
            </Link>
            <Link
              href="/spots/nearby"
              className={`px-3 py-2 rounded-md text-sm ${
                isActive("/spots/nearby") ? "bg-neutral-100 dark:bg-neutral-800" : "opacity-80 hover:opacity-100"
              }`}
            >
              Nearby
            </Link>
            <Link
              href="/spots/new"
              className={`px-3 py-2 rounded-md text-sm ${
                isActive("/spots/new") ? "bg-neutral-100 dark:bg-neutral-800" : "opacity-80 hover:opacity-100"
              }`}
            >
              Add Report
            </Link>

            {session ? (
              <Link href="/dashboard" className="px-3 py-2 rounded-md text-sm opacity-80 hover:opacity-100">
                Dashboard
              </Link>
            ) : (
              <Link href="/auth" className="px-3 py-2 rounded-md text-sm opacity-80 hover:opacity-100">
                Sign in
              </Link>
            )}

            {/* Theme toggle for mobile */}
            {/* <div className="px-3 py-2">
              <ThemeToggleButton />
            </div> */}
          </div>
        )}
      </div>
    </header>
  );
}
