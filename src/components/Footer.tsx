import Link from "next/link";
import Image from "next/image";

const links = [
  { href: "/", label: "Home" },
  { href: "/what-we-do", label: "What We Do" },
  { href: "/why-veritas", label: "Why Veritas?" },
  { href: "/our-team", label: "Our Team" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="bg-surface border-t border-border">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/images/logo.jpg"
                alt="Veritas Consulting Partners"
                width={36}
                height={36}
                className="rounded-sm"
                style={{ filter: "brightness(0) invert(1) opacity(0.9)" }}
              />
              <p className="font-heading text-base tracking-[0.15em] text-gold">
                VERITAS CONSULTING PARTNERS
              </p>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed">
              Strategy, technology, and communications -- integrated under one roof.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-text-primary mb-4">
              Navigation
            </h4>
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm text-text-secondary hover:text-gold transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm uppercase tracking-wider text-text-primary mb-4">
              Contact
            </h4>
            <div className="flex flex-col gap-2 text-sm text-text-secondary">
              <p>Annapolis, Maryland</p>
              <a
                href="mailto:info@veritasconsultingpartnersllc.com"
                className="hover:text-gold transition-colors"
              >
                info@veritasconsultingpartnersllc.com
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gold transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border text-center text-xs text-text-secondary">
          &copy; {new Date().getFullYear()} Veritas Consulting Partners LLC. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
