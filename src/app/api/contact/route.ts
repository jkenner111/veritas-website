import { Resend } from "resend";
import { NextResponse } from "next/server";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

export async function POST(req: Request) {
  try {
    const { name, organization, email, message } = await req.json();

    const resend = getResend();
    await resend.emails.send({
      from: "Veritas Website <onboarding@resend.dev>",
      to: ["fms187@gmail.com", "jkenner@gmail.com"],
      replyTo: email,
      subject: `Contact Form: ${name}${organization ? ` (${organization})` : ""}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <table cellpadding="8" style="border-collapse:collapse;width:100%">
          <tr><td><strong>Name</strong></td><td>${name}</td></tr>
          <tr><td><strong>Organization</strong></td><td>${organization || "--"}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email}</td></tr>
          <tr><td><strong>Message</strong></td><td>${message}</td></tr>
        </table>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
