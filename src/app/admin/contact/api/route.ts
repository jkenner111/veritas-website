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

    // Send email to admin (Jack)
    const adminEmail = process.env.CONTACT_TO_EMAILS?.split(",")[0] || "jkenner@gmail.com";
    
    // For now, just log it. In production, integrate with your email service (Resend, SendGrid, etc.)
    console.log("[Contact Admin]", {
      from: user.email,
      fromName: user.name,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // TODO: Integrate with Resend API (already configured in .env)
    // const resend = new Resend(process.env.RESEND_API_KEY);
    // await resend.emails.send({
    //   from: process.env.CONTACT_FROM_EMAIL,
    //   to: adminEmail,
    //   subject: `[Veritas Admin] ${subject}`,
    //   html: `
    //     <h2>Contact Request from ${user.name}</h2>
    //     <p><strong>From:</strong> ${user.email} (${user.role})</p>
    //     <p><strong>Subject:</strong> ${subject}</p>
    //     <p><strong>Message:</strong></p>
    //     <p>${message.replace(/\n/g, "<br>")}</p>
    //   `,
    // });

    return Response.json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("[Contact Admin] Error:", error);
    return Response.json({ error: "Failed to send message" }, { status: 500 });
  }
}
