import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs"; // IMPORTANT: Resend SDK needs Node runtime

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

    const toNotify = process.env.NOTIFY_TO_EMAIL;
    const fromEmail = process.env.FROM_EMAIL;

    if (!toNotify || !fromEmail || !process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { ok: false, error: "MISSING_ENV" },
        { status: 500 }
      );
    }

    // 1) Email to your team inbox (info@wahajgold.com)
    const notifyResult = await resend.emails.send({
      from: fromEmail,
      to: toNotify,
      subject: "New Wahaj Launch Signup",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <h2>New email signup</h2>
          <p><strong>Email:</strong> ${cleanEmail}</p>
          <p style="color:#666;font-size:12px">Sent from the landing page form.</p>
        </div>
      `,
    });

    // 2) Auto-reply to the user (thank you message)
    // NOTE: Delivery is best after you verify wahajgold.com domain in Resend.
    const autoReplyResult = await resend.emails.send({
      from: fromEmail,
      to: cleanEmail,
      subject: "Thanks for joining the Wahaj list",
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.6">
          <p>Thanks for joining the Wahaj launch list.</p>
          <p>We’ll notify you as soon as we launch.</p>
          <p style="margin-top:16px;color:#666;font-size:12px">
            If you didn’t request this, you can ignore this email.
          </p>
        </div>
      `,
    });

    return NextResponse.json({
      ok: true,
      notifyId: notifyResult.data?.id ?? null,
      autoReplyId: autoReplyResult.data?.id ?? null,
    });
  } catch (err: any) {
    // This will show up in Vercel → Functions logs
    console.error("LEAD API ERROR:", err);

    return NextResponse.json(
      { ok: false, error: "SERVER_ERROR", details: err?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
