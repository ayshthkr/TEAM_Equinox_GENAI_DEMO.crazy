"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Menu, X, Search } from "lucide-react";

const tabs = [
  { href: "/", label: "Home" },
  { href: "/for-you", label: "For You" },
  { href: "/top-news", label: "Top News" },
  { href: "/blindspot", label: "Blindspot" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setSearchQuery("");
    setMobileOpen(false);
    setShowMobileSearch(false);
  };

  return (
    <header
      className="sticky top-0 z-50 border-b border-zinc-800/70 backdrop-blur-md"
      style={{ backgroundColor: "#0A1628" }}
    >
      <div className="w-full bg-yellow-300 font-light text-black text-center p-2">
        The API and scrapers have been closed on 13/09/25 due to GPU
        requirements and server costs, hence the news articles are old.
        Inconvenience is regretted.
      </div>
<div className="max-w-[90rem] mx-4 sm:mx-5 md:mx-7 px-2 sm:px-4 md:px-4 flex h-14 items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-white"
        >
          DEMO<span className=" text-blue-500 ">.crazy</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex gap-6">
          {tabs.map((t) => {
            const isActive = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`relative text-sm transition-colors duration-200 ${
                  isActive
                    ? "text-white font-medium"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Search bar (desktop) */}
          <form
            onSubmit={handleSearch}
            className="relative hidden md:flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-40 lg:w-56 px-3 py-1.5 rounded-md
                         bg-gradient-to-br from-[#1E2A38] to-[#0D1B2A]
                         border border-zinc-700/60
                         text-sm text-zinc-200 placeholder-zinc-500
                         focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </form>

          {/* Mobile search toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setShowMobileSearch((prev) => !prev)}
          >
            <Search size={22} />
          </button>

          {/* Mobile search input */}
          {showMobileSearch && (
            <form
              onSubmit={handleSearch}
              className="absolute top-14 left-0 right-0 px-4 py-2 bg-[#0A1628] border-b border-zinc-700 md:hidden"
            >
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full px-3 py-2 rounded-md
                           bg-gradient-to-br from-[#1E2A38] to-[#0D1B2A]
                           border border-zinc-700/60
                           text-sm text-zinc-200 placeholder-zinc-500
                           focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </form>
          )}

          <SignedOut>
            <Link
              href="/login"
              className="px-4 py-1.5 rounded-md bg-blue-600 hover:bg-blue-700
                         text-sm font-medium text-white hidden md:inline-block"
            >
              Login
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen((prev) => !prev)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile nav menu */}
      {mobileOpen && (
        <nav className="absolute top-14 left-0 right-0 bg-[#0A1628] border-b border-zinc-700 md:hidden px-6 py-4 flex flex-col gap-4 z-50">
          {tabs.map((t) => {
            const isActive = pathname === t.href;
            return (
              <Link
                key={t.href}
                href={t.href}
                onClick={() => setMobileOpen(false)} // close menu on click
                className={`text-sm ${
                  isActive
                    ? "text-white font-medium"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {t.label}
              </Link>
            );
          })}

          <SignedOut>
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700
                         text-sm font-medium text-white text-center"
            >
              Login
            </Link>
          </SignedOut>

          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      )}
    </header>
  );
}
