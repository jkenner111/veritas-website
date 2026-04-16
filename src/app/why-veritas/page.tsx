import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Why Veritas?",
  description:
    "We've been in the room. We know how things actually work. Learn why clients choose Veritas Consulting Partners.",
};

const sections = [
  {
    title: "We've Done the Work",
    body: "Most consultants advise from the outside. Our team has served inside federal agencies, led operational teams, built technology infrastructure from scratch, and navigated the halls of Congress. We don't theorize about complex environments -- we've operated in them.",
  },
  {
    title: "We Integrate What Others Separate",
    body: "Policy without technology is incomplete. Technology without communication fails to land. Communication without strategy goes nowhere. Veritas brings all three together under one roof, with a team that speaks every language.",
  },
  {
    title: "We Build for the Long Run",
    body: "We don't do quick fixes. Every engagement is designed to leave your organization stronger, more capable, and more self-sufficient than when we arrived -- whether that's a policy framework, an AI system you own outright, or a communications strategy your team can execute independently.",
  },
  {
    title: "We Are Small by Design",
    body: "We are a small, senior team. Every client works directly with the principals -- not handed off to junior staff. That means faster decisions, tighter integration, and accountability at every level.",
  },
];

export default function WhyVeritas() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative" style={{ background: "linear-gradient(135deg, #1a1a2e 60%, #2a1f0e 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-text-primary mb-4">
            Why Veritas?
          </h1>
          <p className="text-text-secondary text-lg">
            We&rsquo;ve been in the room. We know how things actually work.
          </p>
        </div>
      </section>

      {/* Alternating Sections */}
      {sections.map((section, index) => (
        <section
          key={section.title}
          className={`py-20 px-6 ${index % 2 === 0 ? "bg-surface" : ""}`}
        >
          <div className="max-w-4xl mx-auto">
            <div className="border-l-2 border-gold pl-8">
              <h2 className="font-heading text-3xl text-text-primary mb-6">
                {section.title}
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed">
                {section.body}
              </p>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
