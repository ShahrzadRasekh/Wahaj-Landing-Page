import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const cleanEmail = String(email ?? "").trim().toLowerCase();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);

    if (!ok) {
      return NextResponse.json({ ok: false, error: "INVALID_EMAIL" }, { status: 400 });
    }

    if (!process.env.NOTIFY_TO_EMAIL) {
      return NextResponse.json(
        { ok: false, error: "MISSING_NOTIFY_TO_EMAIL" },
        { status: 500 }
      );
    }

    const result = await resend.emails.send({
      from: "Wahaj <onboarding@resend.dev>",
      to: process.env.NOTIFY_TO_EMAIL,
      subject: "New Wahaj Launch Signup",
      html: `
        <h2>New email signup</h2>
        <p><strong>Email:</strong> ${cleanEmail}</p>
      `,
    });

    // If Resend returns an error field, handle it cleanly
    if ((result as any)?.error) {
      return NextResponse.json(
        { ok: false, error: "RESEND_ERROR", details: (result as any).error },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("API /api/lead error:", error);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", details: String(error?.message || error) },
      { status: 500 }
    );
  }
}
