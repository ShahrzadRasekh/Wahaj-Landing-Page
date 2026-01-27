import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.NOTIFY_TO_EMAIL;

    if (!apiKey) {
      return NextResponse.json(
        { ok: false, error: "MISSING_RESEND_API_KEY" },
        { status: 500 }
      );
    }
    if (!notifyTo) {
      return NextResponse.json(
        { ok: false, error: "MISSING_NOTIFY_TO_EMAIL" },
        { status: 500 }
      );
    }

    const { email } = await req.json();
    const cleanEmail = String(email ?? "").trim().toLowerCase();

    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!ok) {
      return NextResponse.json(
        { ok: false, error: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    const result = await resend.emails.send({
      from: "Wahaj <onboarding@resend.dev>",
      to: notifyTo, // receiver you set in Vercel env
      subject: "New Wahaj Launch Signup",
      html: `<h2>New signup</h2><p><strong>Email:</strong> ${cleanEmail}</p>`,
      replyTo: cleanEmail,
    });

    // @ts-ignore
    if (result?.error) {
      // @ts-ignore
      console.error("RESEND_ERROR:", result.error);
      // @ts-ignore
      return NextResponse.json(
        { ok: false, error: "RESEND_ERROR", details: result.error?.message || "Resend rejected the request" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("SERVER_ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", details: err?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
