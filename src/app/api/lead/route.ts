import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const cleanEmail = String(email ?? "").trim().toLowerCase();

    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!ok) {
      return NextResponse.json({ ok: false, error: "INVALID_EMAIL" }, { status: 400 });
    }

    const to = process.env.NOTIFY_TO_EMAIL;
    if (!to) {
      return NextResponse.json({ ok: false, error: "MISSING_NOTIFY_TO_EMAIL" }, { status: 500 });
    }

    const result = await resend.emails.send({
      from: "Wahaj <onboarding@resend.dev>",
      to,
      subject: "New Wahaj Launch Signup",
      html: `<h2>New email signup</h2><p><strong>Email:</strong> ${cleanEmail}</p>`,
    });

    // Return the result so you can see if Resend created the email id
    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    console.error("RESEND ERROR:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", details: error?.message ?? String(error) },
      { status: 500 }
    );
  }
}
