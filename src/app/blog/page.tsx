import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights on policy, technology, and strategy from Veritas Consulting Partners.",
};

export default function Blog() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative" style={{ background: "linear-gradient(135deg, #1a1a2e 60%, #2a1f0e 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-text-primary mb-4">
            Blog
          </h1>
          <p className="text-text-secondary text-lg">
            Insights on policy, technology, and strategy.
          </p>
        </div>
      </section>

      {/* Empty State */}
      <section className="py-20 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-surface border border-border p-12 text-center">
            <p className="text-text-secondary text-lg">
              No posts yet. Check back soon.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
