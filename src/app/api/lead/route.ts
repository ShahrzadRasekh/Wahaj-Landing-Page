import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY || "");

export async function POST(req: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "MISSING_RESEND_API_KEY" },
        { status: 500 }
      );
    }

    if (!process.env.NOTIFY_TO_EMAIL) {
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

    // Send notification to your inbox
    const { data, error } = await resend.emails.send({
      from: "Wahaj <onboarding@resend.dev>",
      to: "shahrzad.rasekh.marketing@gmail.com",
      subject: "New Wahaj Launch Signup",
      html: `<p>Email: ${cleanEmail}</p>`,
    });

    // ✅ CRITICAL: if Resend rejects (e.g., 403), return an error (do NOT pretend ok)
    if (error) {
      return NextResponse.json(
        {
          ok: false,
          error: "RESEND_ERROR",
          details: error.message || String(error),
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ ok: true, id: data?.id ?? null });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", details: err?.message || String(err) },
      { status: 500 }
    );
  }
}
