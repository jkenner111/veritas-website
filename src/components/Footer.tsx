import Link from "next/link";

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
    <footer style={{ backgroundColor: "#1a1a2e", borderTop: "1px solid rgba(255,255,255,0.15)" }}>
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/logo.svg" alt="Veritas Logo" width={40} height={40} />
              <p className="font-heading uppercase" style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "2px", color: "#ffffff" }}>
                VERITAS CONSULTING PARTNERS
              </p>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: "#cccccc" }}>
              Strategy, technology, and communications -- integrated under one roof.
            </p>
          </div>

          {/* Nav */}
          <div>
            <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: "#ffffff" }}>
              Navigation
            </h4>
            <div className="flex flex-col gap-2">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="text-sm hover:text-gold transition-colors"
                  style={{ color: "#cccccc" }}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm uppercase tracking-wider mb-4" style={{ color: "#ffffff" }}>
              Contact
            </h4>
            <div className="flex flex-col gap-2 text-sm" style={{ color: "#cccccc" }}>
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

        <div className="mt-12 pt-8 text-center text-xs" style={{ borderTop: "1px solid rgba(255,255,255,0.15)", color: "#aaaaaa" }}>
          &copy; {new Date().getFullYear()} Veritas Consulting Partners LLC. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}
