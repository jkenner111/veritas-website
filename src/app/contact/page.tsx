import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Veritas Consulting Partners. We'd love to hear from you.",
};

export default function Contact() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 px-6 relative" style={{ background: "linear-gradient(135deg, #1a1a2e 60%, #2a1f0e 100%)" }}>
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-text-primary mb-4">
            Get in Touch
          </h1>
          <p className="text-text-secondary text-lg">
            Ready to talk? We&rsquo;d love to hear from you.
          </p>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-12 px-6">
        <div className="max-w-2xl mx-auto">
          <ContactForm />
        </div>
      </section>

      {/* Contact Info */}
      <section className="py-20 px-6 bg-surface">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div>
              <h3 className="font-heading text-lg text-gold mb-3">Email</h3>
              <a
                href="mailto:info@veritasconsultingpartnersllc.com"
                className="text-text-secondary hover:text-gold-light transition-colors text-sm"
              >
                info@veritasconsultingpartnersllc.com
              </a>
            </div>

            <div>
              <h3 className="font-heading text-lg text-gold mb-3">LinkedIn</h3>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-secondary hover:text-gold-light transition-colors text-sm"
              >
                Connect with us
              </a>
            </div>

            <div>
              <h3 className="font-heading text-lg text-gold mb-3">Location</h3>
              <p className="text-text-secondary text-sm">
                Annapolis, Maryland
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
