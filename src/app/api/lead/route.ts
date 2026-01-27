import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs"; // Resend SDK requires Node runtime on Vercel

const resend = new Resend(process.env.RESEND_API_KEY);

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const cleanEmail = String(email ?? "").trim().toLowerCase();

    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json({ ok: false, error: "INVALID_EMAIL" }, { status: 400 });
    }

    const notifyTo = process.env.NOTIFY_TO_EMAIL;
    if (!process.env.RESEND_API_KEY || !notifyTo) {
      return NextResponse.json(
        { ok: false, error: "MISSING_ENV" },
        { status: 500 }
      );
    }

    const result = await resend.emails.send({
      // IMPORTANT: this works without domain verification
      // (Later, when you verify wahajgold.com in Resend, you can use no-reply@wahajgold.com)
      from: "Wahaj <onboarding@resend.dev>",
      to: notifyTo, // -> info@wahajgold.com
      subject: "New Wahaj Launch Signup",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>New email signup</h2>
          <p><strong>Email:</strong> ${cleanEmail}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true, id: result.data?.id ?? null });
  } catch (err: any) {
    console.error("LEAD API ERROR:", err);
    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR" },
      { status: 500 }
    );
  }
}
