import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    await resend.emails.send({
      from: "Wahaj <onboarding@resend.dev>",
      to: process.env.NOTIFY_TO_EMAIL!,
      subject: "New Wahaj Launch Signup",
      html: `
        <h2>New email signup</h2>
        <p><strong>Email:</strong> ${cleanEmail}</p>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("RESEND ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
