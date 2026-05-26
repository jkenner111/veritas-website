import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What We Do",
  description:
    "Three core practice areas -- government affairs, RPA and AI integration, and strategic communications -- plus a full slate of advisory services, integrated under one team at Veritas Consulting Partners.",
};

const services = [
  {
    title: "Government Affairs & Policy",
    description: [
      "We bring firsthand knowledge of how Washington works -- because we've worked in it. Our team has served as congressional liaisons, drafted federal rulemakings for the Federal Register, provided technical assistance to Members of Congress, and navigated the full lifecycle of federal policy from proposal to implementation.",
    ],
    bullets: [
      "Congressional relations and stakeholder engagement",
      "Federal rulemaking and regulatory analysis",
      "Legislative monitoring and policy advisories",
      "Technical assistance on proposed legislation",
      "Executive correspondence and briefing preparation",
      "VSO and interagency coordination",
    ],
  },
  {
    title: "RPA & AI Integration",
    description: [
      "Embrace the future of efficiency. We help organizations automate repetitive workflows, integrate scalable AI tools into existing operations, and -- for clients who need it -- deploy fully private agentic AI systems on their own infrastructure. The goal is the same in every engagement: free your team to focus on strategy while technology handles the operational lift.",
      "Whether you need lightweight RPA to streamline a back-office process or a sovereign AI stack with no cloud dependencies, we build to your specifications, maintain what we deliver, and hand you full ownership of the result.",
    ],
    bullets: [
      "Robotic Process Automation -- workflow automation that eliminates repetitive manual operations and reduces error rates",
      "AI tool integration -- scalable, production-ready AI capabilities embedded into your existing systems and processes",
      "Agentic AI system design and deployment -- autonomous reasoning, tool use, persistent memory, and web search with no cloud dependency",
      "RAG pipeline development -- agents that intelligently query and reason over your organization's own documents, databases, and internal knowledge",
      "Local inference deployment on existing or minimal hardware -- capability without cloud spend",
      "Flexible model deployment matched to your use case and budget",
      "Production-grade service management and security hardening",
      "Full stack ownership from hardware to model layer -- no black boxes, no vendor lock-in",
    ],
  },
  {
    title: "Strategic Communications & Multimedia",
    description: [
      "Clear, compelling communication is the difference between a good idea and a successful one. We produce executive communications, visual media, and strategic messaging that connects with the audiences that matter most to your organization.",
    ],
    bullets: [
      "Executive communications and speechwriting",
      "Visual storytelling and multimedia production",
      "Presentation design and briefing materials",
      "Brand narrative development",
      "Internal and external communications strategy",
    ],
  },
];

export default function WhatWeDo() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-text-primary mb-4">
            What We Do
          </h1>
          <p className="text-text-secondary text-lg">
            Three practice areas. One integrated team.
          </p>
        </div>
      </section>

      {/* Service Sections */}
      {services.map((service, index) => (
        <section
          key={service.title}
          className={`py-20 px-6 ${index % 2 === 0 ? "bg-surface" : ""}`}
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-3xl text-gold mb-6">
              {service.title}
            </h2>
            <div className="space-y-4 text-text-secondary leading-relaxed mb-8">
              {service.description.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
            <ul className="space-y-3">
              {service.bullets.map((bullet) => (
                <li
                  key={bullet}
                  className="flex items-start gap-3 text-text-secondary leading-relaxed"
                >
                  <span className="text-gold mt-1.5 shrink-0 text-xs">&#9670;</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      {/* Additional Advisory Services */}
      <section className={`py-20 px-6 ${services.length % 2 === 0 ? "bg-surface" : ""}`}>
        <div className="max-w-4xl mx-auto">
          <p className="text-gold text-xs uppercase tracking-[0.3em] font-body mb-4">
            Additional Advisory Services
          </p>
          <h2 className="font-heading text-3xl text-text-primary mb-6">
            Beyond the Core
          </h2>
          <p className="text-text-secondary leading-relaxed mb-10">
            In addition to our core practice areas, Veritas offers focused
            advisory support for organizations navigating procurement,
            communications, operations, and federal real estate. Engagements
            are scoped to the problem -- from one-time advisory to sustained
            partnership.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Government Contracting Support & Readiness",
                body: "Navigate SAM.gov, VetCert, UEI/CAGE registrations, and procurement strategy. Tailored assistance to compete -- and win -- in federal contracting.",
              },
              {
                title: "Public Relations & External Affairs",
                body: "Visibility is everything. We build brands, manage crises, and develop narratives that break through marketplace noise and shape public perception.",
              },
              {
                title: "Strategic Business Consulting",
                body: "Transform operations with expert guidance on compliance, growth, and organizational design. Actionable insights for resilient, future-ready businesses.",
              },
              {
                title: "Real Estate Advisory & Project Management",
                body: "Navigate federal real estate complexities -- site selection, development, and strategic planning -- to maximize project success in competitive environments.",
              },
            ].map((service) => (
              <div
                key={service.title}
                className="bg-surface-elevated border border-border p-6 hover:border-gold transition-colors duration-300"
              >
                <h3 className="font-heading text-lg text-gold mb-3">
                  {service.title}
                </h3>
                <p className="text-text-secondary leading-relaxed text-sm">
                  {service.body}
                </p>
              </div>
            ))}
          </div>
          <p className="text-text-secondary leading-relaxed mt-10 italic">
            We offer customized solutions built on rigorous analysis, agile
            execution, and a commitment to lasting results.
          </p>
        </div>
      </section>
    </>
  );
}
