import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "What We Do",
  description:
    "Three practice areas -- government affairs, local AI pipeline deployment, and strategic communications -- integrated under one team at Veritas Consulting Partners.",
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
    title: "Local AI Pipeline Deployment",
    description: [
      "We design and deploy fully local, privately owned agentic AI systems for organizations that want the power of AI without surrendering their data to the cloud. That means your agents run on your hardware, your documents stay on your network, and your operations remain sovereign.",
      "This isn't AI as a subscription service. It's AI as infrastructure -- built to your specifications, maintained by us, and owned by you.",
    ],
    bullets: [
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
    </>
  );
}
