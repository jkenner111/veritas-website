import { headers } from "next/headers";
import { findUserByEmail } from "@/lib/users";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const h = await headers();
  const email = h.get("x-admin-email");
  const user = email ? findUserByEmail(email) : null;

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { subject, message } = await req.json();

    if (!subject || !message) {
      return Response.json({ error: "Subject and message are required" }, { status: 400 });
    }

    // Send email to admin (Jack) via Resend
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.CONTACT_FROM_EMAIL || "contact@veritasconsultingpartnersllc.com";
    const toEmails = process.env.CONTACT_TO_EMAILS?.split(",") || ["jkenner@gmail.com"];

    if (resendApiKey) {
      const authHeader = "Bearer " + resendApiKey;
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: fromEmail,
          to: toEmails,
          subject: "[Veritas Admin] " + subject,
          html:
            "<h2>Contact Request from " + user.name + "</h2>" +
            "<p><strong>From:</strong> " + user.email + " (" + user.role + ")</p>" +
            "<p><strong>Subject:</strong> " + subject + "</p>" +
            "<hr />" +
            "<p>" + message.replace(/\n/g, "<br />") + "</p>" +
            "<hr />" +
            "<p style=\"color: #666; font-size: 12px;\">Sent from Veritas Admin Panel</p>",
        }),
      });

      if (!res.ok) {
        const err = await res.text();
        console.error("[Contact Admin] Resend error:", err);
        return Response.json({ error: "Failed to send email" }, { status: 500 });
      }
    } else {
      console.log("[Contact Admin] No RESEND_API_KEY, logging only:", {
        from: user.email,
        fromName: user.name,
        subject,
        message,
      });
    }

    return Response.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("[Contact Admin] Error:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
