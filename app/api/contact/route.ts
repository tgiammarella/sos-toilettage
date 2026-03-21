import { NextRequest, NextResponse } from "next/server";
import { resend } from "@/lib/resend";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, "strict");
  if (limited) return limited;

  let body: { name?: string; email?: string; subject?: string; message?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { name, email, subject, message } = body;

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: "Champs requis manquants." },
      { status: 400 },
    );
  }

  if (!resend) {
    console.log("[CONTACT STUB]", { name, email, subject, message });
    return NextResponse.json({ success: true });
  }

  try {
    await resend.emails.send({
      from: "ToutToilettage <info@touttoilettage.com>",
      to: "info@touttoilettage.com",
      replyTo: email,
      subject: `[Contact] ${subject || "Demande générale"} — ${name}`,
      html: `
        <h2>Nouveau message via ToutToilettage</h2>
        <p><strong>Nom:</strong> ${escapeHtml(name)}</p>
        <p><strong>Courriel:</strong> ${escapeHtml(email)}</p>
        <p><strong>Sujet:</strong> ${escapeHtml(subject || "Demande générale")}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${escapeHtml(message).replace(/\n/g, "<br/>")}</p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi." },
      { status: 500 },
    );
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
