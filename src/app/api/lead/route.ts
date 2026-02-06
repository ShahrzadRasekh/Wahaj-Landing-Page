import { NextResponse } from "next/server";
import { Resend } from "resend";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function json(status: number, body: any) {
  return NextResponse.json(body, { status });
}

export async function POST(req: Request) {
  try {
    // 1) Read body safely
    let payload: any = {};
    try {
      payload = await req.json();
    } catch {
      return json(400, { ok: false, error: "BAD_JSON" });
    }

    const cleanEmail = String(payload?.email ?? "").trim().toLowerCase();
    const okEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
    if (!okEmail) return json(400, { ok: false, error: "INVALID_EMAIL" });

    // 2) Env check (THIS is the #1 cause of random 500s)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const NOTIFY_TO_EMAIL = process.env.NOTIFY_TO_EMAIL;
    const FROM_EMAIL = process.env.FROM_EMAIL || "Wahaj Gold <info@wahajgold.com>";

    if (!RESEND_API_KEY || !NOTIFY_TO_EMAIL) {
      console.error("MISSING_ENV", {
        hasKey: !!RESEND_API_KEY,
        notifyTo: NOTIFY_TO_EMAIL,
        from: FROM_EMAIL,
      });
      return json(500, { ok: false, error: "MISSING_ENV" });
    }

    // 3) Send emails
    const resend = new Resend(RESEND_API_KEY);

    // A) Notify your team (admin email)
    const adminResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: NOTIFY_TO_EMAIL,
      replyTo: cleanEmail,
      subject: "New Wahaj Launch Signup",
      html: `
        <h2>New email signup</h2>
        <p><strong>Email:</strong> ${cleanEmail}</p>
      `,
    });
    

    if ((adminResult as any)?.error) {
      console.error("RESEND_ADMIN_ERROR", (adminResult as any).error);
      return json(502, {
        ok: false,
        error: "RESEND_ADMIN_ERROR",
        details: (adminResult as any).error?.message || "Resend send failed",
      });
    }

    // B) Auto-reply to the user (optional, but you asked for it)
    const replyResult = await resend.emails.send({
      from: FROM_EMAIL,
      to: cleanEmail,
      subject: "Thanks for joining the Wahaj launch list",
      html: `
        <p>Thanks for joining the list.</p>
        <p>We’ll notify you as soon as Wahaj launches.</p>
        <p>— Wahaj</p>
      `,
    });

    if ((replyResult as any)?.error) {
      // Don’t fail the whole request if auto-reply fails
      console.error("RESEND_REPLY_ERROR", (replyResult as any).error);
    }

    return json(200, { ok: true });
  } catch (err: any) {
    console.error("API_FATAL", err?.message || err, err?.stack);
    return json(500, {
      ok: false,
      error: "SERVER_ERROR",
      details: err?.message || "Unknown error",
    });
  }
}
