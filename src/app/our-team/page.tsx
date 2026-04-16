import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Our Team",
  description:
    "Senior practitioners. No bench warmers. Meet the Veritas Consulting Partners team.",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-gold text-xs uppercase tracking-[0.2em] font-body font-semibold mb-3 mt-8">
      {children}
    </h4>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 text-text-secondary leading-relaxed text-sm"
        >
          <span className="text-gold mt-1 shrink-0 text-xs">&#9670;</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function ExperienceList({
  items,
}: {
  items: { role: string; org: string; dates: string }[];
}) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li
          key={`${item.role}-${item.org}`}
          className="text-text-secondary text-sm leading-relaxed"
        >
          <span className="text-text-primary font-semibold">{item.role}</span>
          {" -- "}
          {item.org}
          <span className="text-text-secondary/60 ml-2">({item.dates})</span>
        </li>
      ))}
    </ul>
  );
}

export default function OurTeam() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative" style={{ background: "linear-gradient(135deg, #1a1a2e 60%, #2a1f0e 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-text-primary mb-4">
            Our Team
          </h1>
          <p className="text-text-secondary text-lg">
            Senior practitioners. No bench warmers.
          </p>
        </div>
      </section>

      {/* Farrah */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="shrink-0">
              <Image
                src="/images/team/farrah.jpg"
                alt="Farrah M. Saint-Surin"
                width={400}
                height={450}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-3xl text-text-primary mb-1">
                Farrah M. Saint-Surin, JD
              </h2>
              <p className="text-gold text-sm uppercase tracking-wider font-semibold mb-6">
                CEO | Government Affairs &amp; Policy
              </p>
              <p className="text-text-secondary leading-relaxed">
                Strategic government affairs and public policy executive with
                over 20 years of experience shaping legislation, managing
                multi-state regulatory strategy, and leading high-stakes
                stakeholder engagement across Congress, federal agencies, and
                regulated industries.
              </p>

              <SectionLabel>Credentials</SectionLabel>
              <BulletList
                items={[
                  "Juris Doctor (JD) -- Suffolk University Law School",
                  "Certified Anti-Money Laundering Specialist (CAMS)",
                  "Six Sigma Black Belt Professional (SSBBP)",
                  "Active Security Clearance: Secret & Public Trust",
                ]}
              />

              <SectionLabel>Professional Highlights</SectionLabel>
              <BulletList
                items={[
                  "Founded Veritas Consulting Partners LLC, securing $1.2M in advisory contracts within the first year",
                  "Secured $50M in supplemental federal oversight funding through bipartisan congressional negotiations",
                  "Directed passage of bipartisan legislation extending pandemic fraud enforcement statutes",
                  "100+ congressional briefings, 13 formal hearings, 300+ press engagements",
                  "8 national awards for excellence in oversight, legislative advocacy, and communications",
                ]}
              />

              <SectionLabel>Experience</SectionLabel>
              <ExperienceList
                items={[
                  {
                    role: "Director of Congressional & External Affairs",
                    org: "U.S. Small Business Administration OIG",
                    dates: "2020-2025",
                  },
                  {
                    role: "Senior Consultant",
                    org: "Deloitte",
                    dates: "2018-2020",
                  },
                  {
                    role: "Business Advisory Associate Manager",
                    org: "Accenture",
                    dates: "2017-2018",
                  },
                  {
                    role: "Program Manager/Contracting Officer",
                    org: "District of Columbia Government",
                    dates: "2013-2017",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Jack */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="shrink-0">
              <Image
                src="/images/team/jack.jpg"
                alt="John &quot;Jack&quot; Kenner"
                width={400}
                height={450}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-3xl text-text-primary mb-1">
                John &ldquo;Jack&rdquo; Kenner
              </h2>
              <p className="text-gold text-sm uppercase tracking-wider font-semibold mb-6">
                Technical Director | Agentic AI Pipeline Engineer
              </p>
              <div className="space-y-4 text-text-secondary leading-relaxed">
                <p>
                  I build local agentic AI pipelines for organizations that want
                  the power of AI without surrendering their data to the cloud.
                  Autonomous agents, RAG systems that reason over your internal
                  documents, and inference infrastructure that runs on your
                  hardware -- sovereign, private, and built to last.
                </p>
                <p>
                  I bring 20+ years across the Army, federal government, and
                  independent development, with an uncommon blend of hands-on
                  technical depth, policy expertise, and systems-level thinking.
                  From troubleshooting diesel engines and hydraulic systems as a
                  military mechanic to architecting multi-machine AI inference
                  systems, the instinct has always been the same: understand how
                  things work, then make them work better. I don&rsquo;t just
                  deploy tools others have built -- I understand them deeply
                  enough to integrate, tune, and optimize them for specific use
                  cases.
                </p>
                <p>
                  Whether you&rsquo;re a small business, a government
                  contractor, or a policy organization, I can help you deploy AI
                  that works for you -- on your terms, on your infrastructure,
                  with your data never leaving your control. No subscriptions, no
                  vendor lock-in, no black boxes.
                </p>
              </div>

              <div className="mt-4">
                <a
                  href="https://gitlab.com/jkenner111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-light text-sm transition-colors"
                >
                  GitLab &rarr;
                </a>
              </div>

              <SectionLabel>Agentic Pipeline Infrastructure</SectionLabel>
              <BulletList
                items={[
                  "Design and deploy fully local, privately owned agentic AI systems -- autonomous reasoning, tool use, persistent memory, and web search with no cloud dependency",
                  "RAG pipeline development -- agents that intelligently query and reason over your organization's own documents, databases, and internal knowledge; your data stays yours",
                  "Context management and automated session windowing -- reliable, long-running agent operations that run autonomously",
                  "Agent-native voice interfaces -- speech in, intelligence out",
                ]}
              />

              <SectionLabel>Local Inference Deployment</SectionLabel>
              <BulletList
                items={[
                  "Multi-machine inference pipelines deployable on existing or minimal hardware -- capability without cloud spend",
                  "Flexible model deployment across architectures and scales -- from lightweight local models to large reasoning systems, matched to your use case and budget",
                  "Local inference for 100B+ parameter models across distributed hardware",
                ]}
              />

              <SectionLabel>LLM Benchmarking &amp; Evaluation</SectionLabel>
              <BulletList
                items={[
                  "Custom benchmark suites for evaluating AI model performance across reasoning, code generation, and business tasks",
                  "Throughput and concurrency testing for production workloads",
                  "Model selection strategy for cost-effective deployment",
                ]}
              />

              <SectionLabel>
                Pipeline Foundations &amp; Sovereignty
              </SectionLabel>
              <BulletList
                items={[
                  "Fully self-hosted supporting stack: communications, search, secure remote access, tunneling -- sovereign by design",
                  "Production-grade service management and security hardening -- always-on reliability without managed services",
                  "Full stack ownership from hardware to model layer -- no black boxes, no vendor lock-in",
                  "Containerized service orchestration (13+ production services)",
                ]}
              />

              <SectionLabel>Project -- TalkinClaw</SectionLabel>
              <p className="text-text-secondary text-sm leading-relaxed">
                Open-source Android voice assistant that connects to a locally
                hosted AI agent. All speech processing runs on-device -- no
                cloud dependencies, no data collection. Submitted to F-Droid via
                GitLab.{" "}
                <a
                  href="https://gitlab.com/jkenner111/TalkinClaw"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-gold-light transition-colors"
                >
                  View on GitLab &rarr;
                </a>
              </p>

              <SectionLabel>Public Affairs</SectionLabel>
              <BulletList
                items={[
                  "Congressional liaison for the Board of Veterans' Appeals (2013-2018)",
                  "Provided technical assistance to Congress on proposed legislation affecting VA programs",
                  "Primary point of contact for White House Hotline inquiries",
                  "Authored agency proposed and final rulemakings for Federal Register publication",
                  "Prepared briefing papers, white papers, and written materials for Congress, VSOs, and senior VA leadership",
                ]}
              />

              <SectionLabel>Experience</SectionLabel>
              <ExperienceList
                items={[
                  {
                    role: "Policy Analyst",
                    org: "U.S. Department of Veterans Affairs",
                    dates: "May 2020 - Feb 2025",
                  },
                  {
                    role: "AI Writing Evaluator / Expert Contributor",
                    org: "Outlier AI",
                    dates: "Jan 2024 - Aug 2024",
                  },
                  {
                    role: "Owner-Operator",
                    org: "Firsthand Property Management Solutions, LLC",
                    dates: "Jun 2019 - May 2020",
                  },
                  {
                    role: "Deputy Administrative Chief (GS-13)",
                    org: "Board of Veterans' Appeals",
                    dates: "Jun 2018 - Dec 2018",
                  },
                  {
                    role: "Management Analyst (GS-14 Billet)",
                    org: "VA Central Office, Modernization Office",
                    dates: "Feb 2018 - Jun 2018",
                  },
                  {
                    role: "Staff Assistant to the Chairman (GS-13)",
                    org: "Board of Veterans' Appeals",
                    dates: "Aug 2013 - Feb 2018",
                  },
                  {
                    role: "Paralegal Specialist",
                    org: "Board of Veterans' Appeals",
                    dates: "Jan 2012 - Jul 2013",
                  },
                  {
                    role: "Community Support Worker",
                    org: "Hillcrest Children & Family Center",
                    dates: "Sep 2011 - Jan 2012",
                  },
                  {
                    role: "Staff Sergeant / Section Chief",
                    org: "United States Army, 12th Aviation Brigade",
                    dates: "Apr 1999 - Jan 2009",
                  },
                ]}
              />

              <SectionLabel>Credentials</SectionLabel>
              <BulletList
                items={[
                  "B.A. in History -- University of Maryland, College Park (GPA 3.52)",
                  "Graduate Coursework in Business Administration -- The Catholic University of America",
                  "Applied Legal Research Certification -- LexisNexis (2024)",
                ]}
              />

              <SectionLabel>Awards</SectionLabel>
              <BulletList
                items={[
                  "Army Meritorious Service Medal",
                  "Army Commendation Medal (x4)",
                  "Army Achievement Medal (x7)",
                  "Iraqi Campaign Medal with Service Star",
                  "Certificate of Appreciation -- Secretary of Veterans Affairs",
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Ashish */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-10 items-start">
            <div className="shrink-0">
              <Image
                src="/images/team/ashish.jpg"
                alt="Ashish H. Rangrej"
                width={400}
                height={450}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="font-heading text-3xl text-text-primary mb-1">
                Ashish H. Rangrej
              </h2>
              <p className="text-gold text-sm uppercase tracking-wider font-semibold mb-6">
                Director of Multimedia &amp; Visual Design
              </p>
              <p className="text-text-secondary leading-relaxed">
                Dynamic and innovative multimedia designer with over 29 years of
                experience in graphic design, photography, videography, visual
                storytelling, website design, and multimedia production.
                Transforms complex ideas into compelling visuals that captivate
                audiences and elevate messaging across digital and print
                platforms.
              </p>

              <SectionLabel>Credentials</SectionLabel>
              <BulletList
                items={[
                  "B.A. Art Studio with Honors -- University of Maryland, College Park",
                  "Concentration in Graphic Design and Computer Graphics",
                  "KelbyOne certified (Adobe Creative Cloud)",
                ]}
              />

              <SectionLabel>Visual Design &amp; Branding</SectionLabel>
              <BulletList
                items={[
                  "Adobe Creative Cloud mastery",
                  "Brand identity development",
                  "Infographics for 200+ reports",
                  "Section 508 accessibility",
                ]}
              />

              <SectionLabel>Multimedia Production</SectionLabel>
              <BulletList
                items={[
                  "100+ professional videos on CNN/MSNBC/ABC",
                  "170+ headshots",
                  "Podcast production",
                  "Built SBA OIG first multimedia studio",
                ]}
              />

              <SectionLabel>Web &amp; Digital</SectionLabel>
              <BulletList
                items={[
                  "20+ contract websites for NASA/NOAA/USDA/NIH/USAID",
                  "Interactive newsletters increasing readership 75%",
                  "Cybersecurity-compliant web development",
                ]}
              />

              <SectionLabel>Experience</SectionLabel>
              <ExperienceList
                items={[
                  {
                    role: "Multimedia Production Specialist",
                    org: "SBA Office of Inspector General",
                    dates: "2020-Present",
                  },
                  {
                    role: "Senior Graphics Designer",
                    org: "Science Systems and Applications, Inc.",
                    dates: "1996-2023",
                  },
                  {
                    role: "Freelance Designer & Consultant",
                    org: "Independent",
                    dates: "1996-Present",
                  },
                ]}
              />

              <SectionLabel>Awards</SectionLabel>
              <BulletList
                items={[
                  "SBA OIG Innovation Award (2024)",
                  "Individual Award for Excellence (2023)",
                  "Team Award for Excellence (2023)",
                  "Unsung Hero Award (2021)",
                  "10+ Performance Awards at SSAI (2001-2019)",
                ]}
              />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
