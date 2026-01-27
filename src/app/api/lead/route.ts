import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs"; // ensure Node runtime (Resend SDK)

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "MISSING_ENV", message: "RESEND_API_KEY is not set on Vercel (Production)." },
        { status: 500 }
      );
    }

    if (!process.env.NOTIFY_TO_EMAIL) {
      return NextResponse.json(
        { ok: false, error: "MISSING_ENV", message: "NOTIFY_TO_EMAIL is not set on Vercel (Production)." },
        { status: 500 }
      );
    }

    const { email } = await req.json();
    const cleanEmail = String(email ?? "").trim().toLowerCase();

    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "INVALID_EMAIL", message: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const result = await resend.emails.send({
      from: "Wahaj <onboarding@resend.dev>", // safe default for now
      to: process.env.NOTIFY_TO_EMAIL,
      subject: "New Wahaj Launch Signup",
      html: `<h2>New email signup</h2><p><strong>Email:</strong> ${cleanEmail}</p>`,
      replyTo: cleanEmail,
    });

    // Resend may return { error } without throwing
    // (depends on SDK version)
    // @ts-ignore
    if ((result as any)?.error) {
      // @ts-ignore
      const errMsg = (result as any).error?.message || "Resend rejected the request.";
      return NextResponse.json(
        { ok: false, error: "RESEND_ERROR", message: errMsg },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", message: err?.message || "Server error" },
      { status: 500 }
    );
  }
}
