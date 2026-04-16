import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Veritas Consulting Partners | Strategy, Technology & Communications",
  description:
    "Veritas Consulting Partners brings together deep expertise across federal policy, technology, strategic communications, and operations to help organizations solve complex problems and achieve lasting results.",
};

const services = [
  {
    title: "Government Affairs & Policy",
    description:
      "Congressional relations, federal rulemaking, regulatory analysis, and stakeholder engagement. We know how Washington works because we've worked in it.",
  },
  {
    title: "Local AI Pipeline Deployment",
    description:
      "Custom agentic AI systems built on your infrastructure. No cloud dependencies, no vendor lock-in, no data leaving your control. RAG pipelines, autonomous agents, and local inference -- deployed and maintained for your organization.",
  },
  {
    title: "Strategic Communications & Multimedia",
    description:
      "Visual storytelling, executive communications, and multimedia production that translates complex ideas into compelling narratives for any audience.",
  },
];

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section
        className="min-h-screen flex items-center pt-32 pb-20 px-6 relative bg-background"
      >
        <div className="max-w-4xl mx-auto">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-body mb-6">
            Strategy Built. Message Crafted. Technology Deployed.
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-text-primary leading-tight mb-8">
            We&rsquo;ve Done the Work.
            <br />
            Now We Do It For You.
          </h1>
          <div className="space-y-5 text-text-secondary text-lg leading-relaxed max-w-3xl">
            <p>
              Veritas Consulting Partners brings together deep expertise across
              federal policy, technology, strategic communications, and
              operations to help organizations solve complex problems and achieve
              lasting results.
            </p>
            <p>
              We don&rsquo;t just advise -- we&rsquo;ve done the work. Our team
              has operated at the highest levels of the federal government, built
              technology infrastructure from the ground up, and crafted
              communications strategies that move people and institutions.
              Whatever the challenge, we bring the experience to meet it.
            </p>
          </div>
          <div className="mt-10">
            <Link
              href="/contact"
              className="inline-block font-body font-semibold text-sm uppercase tracking-wider px-8 py-4 transition-colors duration-200"
              style={{ backgroundColor: "#c9a84c", color: "#1a1a2e" }}
            >
              Schedule a Consultation
            </Link>
          </div>
        </div>
      </section>

      <hr className="gold-separator" />

      {/* Services */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-surface-elevated border border-border p-8 hover:border-gold transition-colors duration-300"
              >
                <h3 className="font-heading text-xl text-gold mb-4">
                  {service.title}
                </h3>
                <p className="text-text-secondary leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Veritas Teaser */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-text-secondary text-lg leading-relaxed mb-6">
            We don&rsquo;t deal in off-the-shelf solutions. Every engagement is
            built around your specific challenge, your organization, and your
            goals.
          </p>
          <Link
            href="/why-veritas"
            className="text-gold hover:text-gold-light transition-colors text-sm uppercase tracking-wider font-semibold"
          >
            Learn why clients choose Veritas &rarr;
          </Link>
        </div>
      </section>

      <hr className="gold-separator" />

      {/* Team Teaser */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-text-secondary text-lg leading-relaxed mb-6">
            Our team combines decades of experience across military service,
            federal government, policy, technology, and strategic
            communications.
          </p>
          <Link
            href="/our-team"
            className="inline-block font-body font-semibold text-sm uppercase tracking-wider px-8 py-4 transition-colors duration-200"
            style={{ backgroundColor: "#c9a84c", color: "#1a1a2e" }}
          >
            Meet the Team
          </Link>
        </div>
      </section>
    </>
  );
}
