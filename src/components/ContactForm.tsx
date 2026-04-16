"use client";

import { useState, FormEvent } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);

    const form = e.currentTarget;
    const data = new FormData(form);

    try {
      const res = await fetch("https://formspree.io/f/placeholder", {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      if (res.ok) {
        setSubmitted(true);
        form.reset();
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-surface border border-border p-12 text-center">
        <h3 className="font-heading text-2xl text-gold mb-4">
          Message Sent
        </h3>
        <p className="text-text-secondary">
          Thank you for reaching out. We&rsquo;ll be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-surface border border-border p-8 sm:p-12">
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm text-text-primary mb-2">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="w-full bg-background border border-border text-text-primary px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="organization" className="block text-sm text-text-primary mb-2">
            Organization
          </label>
          <input
            type="text"
            id="organization"
            name="organization"
            className="w-full bg-background border border-border text-text-primary px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm text-text-primary mb-2">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            className="w-full bg-background border border-border text-text-primary px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm text-text-primary mb-2">
            How can we help?
          </label>
          <textarea
            id="message"
            name="message"
            rows={5}
            required
            className="w-full bg-background border border-border text-text-primary px-4 py-3 text-sm focus:border-gold focus:outline-none transition-colors resize-vertical"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="bg-gold hover:bg-gold-light text-background font-body font-semibold text-sm uppercase tracking-wider px-8 py-4 transition-colors duration-200 disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send Message"}
        </button>
      </div>
    </form>
  );
}
