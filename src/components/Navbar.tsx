"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

const links = [
  { href: "/", label: "Home" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/why-veritas", label: "Why Veritas?" },
  { href: "/our-team", label: "Our Team" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#1a1a2e]/95 backdrop-blur-md border-b border-border"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 no-underline">
          <Image
            src="/images/logo-white.png"
            alt="Veritas Logo"
            width={80}
            height={80}
            style={{ height: "80px", width: "auto" }}
          />
          <span
            className="hidden sm:inline"
            style={{
              fontFamily: "Playfair Display, Georgia, serif",
              fontSize: "18px",
              fontWeight: 700,
              letterSpacing: "3px",
              color: "#ffffff",
              textTransform: "uppercase" as const,
              whiteSpace: "nowrap" as const,
              textDecoration: "none",
            }}
          >
            VERITAS CONSULTING PARTNERS
          </span>
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex items-center gap-0">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="transition-colors"
              style={{
                color: pathname === l.href ? "#c9a84c" : "#ffffff",
                textTransform: "uppercase",
                letterSpacing: "2px",
                fontSize: "13px",
                fontWeight: 600,
                padding: "0 18px",
              }}
              onMouseEnter={(e) => {
                if (pathname !== l.href) e.currentTarget.style.color = "#c9a84c";
              }}
              onMouseLeave={(e) => {
                if (pathname !== l.href) e.currentTarget.style.color = "#ffffff";
              }}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-white p-2"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-[#1a1a2e]/98 backdrop-blur-md border-t border-border">
          <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col gap-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: pathname === l.href ? "#c9a84c" : "#ffffff",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                  fontSize: "14px",
                  fontWeight: 600,
                  padding: "8px 0",
                }}
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
