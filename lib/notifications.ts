import { resend, EMAIL_FROM, APP_URL } from "@/lib/resend";
import { prisma } from "@/lib/prisma";

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function send(to: string, subject: string, html: string): Promise<void> {
  if (!resend) {
    console.log("[EMAIL STUB]", { to, subject });
    return;
  }
  try {
    const result = await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
    console.log("[EMAIL SENT]", { to, subject, result });
  } catch (err) {
    console.error("[EMAIL ERROR]", { to, subject, err });
  }
}

function layout(body: string): string {
  return `
    <div style="font-family:sans-serif;max-width:560px;margin:0 auto;padding:24px">
      <div style="border-bottom:2px solid #2563eb;padding-bottom:12px;margin-bottom:24px">
        <strong style="font-size:18px;color:#2563eb">Tout Toilettage</strong>
      </div>
      ${body}
      <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280">
        Cet email a été envoyé automatiquement par Tout Toilettage.
      </div>
    </div>
  `;
}

function btn(href: string, label: string): string {
  return `<a href="${href}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:600;margin-top:16px">${label}</a>`;
}

// ─── Shift notifications ─────────────────────────────────────────────────────

export interface ApplicationReceivedPayload {
  salonEmail: string;
  salonName: string;
  groomerName: string;
  shiftDate: string;
  shiftCity: string;
  shiftId: string;
}

export async function notifyApplicationReceived(payload: ApplicationReceivedPayload): Promise<void> {
  const link = `${APP_URL}/fr/dashboard/salon/shifts/${payload.shiftId}`;
  await send(
    payload.salonEmail,
    `Nouvelle candidature — ${payload.groomerName}`,
    layout(`
      <p>Bonjour ${payload.salonName},</p>
      <p><strong>${payload.groomerName}</strong> a postulé pour votre remplacement du <strong>${payload.shiftDate}</strong> à <strong>${payload.shiftCity}</strong>.</p>
      ${btn(link, "Voir la candidature")}
    `),
  );
}

export interface ApplicationAcceptedPayload {
  groomerEmail: string;
  groomerName: string;
  salonName: string;
  salonAddress: string;
  shiftDate: string;
  shiftTime: string;
}

export async function notifyApplicationAccepted(payload: ApplicationAcceptedPayload): Promise<void> {
  const link = `${APP_URL}/fr/dashboard/groomer/confirmed`;
  await send(
    payload.groomerEmail,
    `Candidature acceptée — ${payload.salonName}`,
    layout(`
      <p>Félicitations ${payload.groomerName} !</p>
      <p>Votre candidature a été acceptée par <strong>${payload.salonName}</strong>.</p>
      <p>📅 <strong>${payload.shiftDate}</strong> à <strong>${payload.shiftTime}</strong><br/>📍 ${payload.salonAddress}</p>
      ${btn(link, "Voir mes remplacements confirmés")}
    `),
  );
}

export interface ApplicationRejectedPayload {
  groomerEmail: string;
  groomerName: string;
  salonName: string;
  shiftDate: string;
  shiftCity: string;
}

export async function notifyApplicationRejected(payload: ApplicationRejectedPayload): Promise<void> {
  const link = `${APP_URL}/fr/shifts`;
  await send(
    payload.groomerEmail,
    `Candidature non retenue — ${payload.salonName}`,
    layout(`
      <p>Bonjour ${payload.groomerName},</p>
      <p>Malheureusement, votre candidature pour le remplacement du <strong>${payload.shiftDate}</strong> à <strong>${payload.shiftCity}</strong> chez <strong>${payload.salonName}</strong> n'a pas été retenue.</p>
      <p>D'autres remplacements sont disponibles sur la plateforme.</p>
      ${btn(link, "Voir les remplacements disponibles")}
    `),
  );
}

export interface ShiftFilledPayload {
  salonEmail: string;
  salonName: string;
  groomerName: string;
  shiftDate: string;
  shiftId: string;
}

export async function notifyShiftFilled(payload: ShiftFilledPayload): Promise<void> {
  const link = `${APP_URL}/fr/dashboard/salon/shifts/${payload.shiftId}`;
  await send(
    payload.salonEmail,
    `Remplacement confirmé — ${payload.groomerName}`,
    layout(`
      <p>Bonjour ${payload.salonName},</p>
      <p>Le remplacement du <strong>${payload.shiftDate}</strong> est confirmé avec <strong>${payload.groomerName}</strong>.</p>
      ${btn(link, "Voir le détail")}
    `),
  );
}

// ─── Invite notifications ─────────────────────────────────────────────────────

export interface ShiftInvitePayload {
  groomerEmail: string;
  groomerName: string;
  salonName: string;
  shiftDate: string;
  shiftCity: string;
  shiftId: string;
}

export async function notifyShiftInvite(payload: ShiftInvitePayload): Promise<void> {
  const link = `${APP_URL}/fr/shifts/${payload.shiftId}`;
  await send(
    payload.groomerEmail,
    `Invitation à un remplacement — ${payload.salonName}`,
    layout(`
      <p>Bonjour ${payload.groomerName},</p>
      <p><strong>${payload.salonName}</strong> vous invite à postuler pour un remplacement le <strong>${payload.shiftDate}</strong> à <strong>${payload.shiftCity}</strong>.</p>
      ${btn(link, "Voir le remplacement")}
    `),
  );
}

// ─── Job notifications ────────────────────────────────────────────────────────

export interface JobApplicationReceivedPayload {
  salonEmail: string;
  salonName: string;
  groomerName: string;
  jobTitle: string;
  jobCity: string;
  jobId: string;
}

export async function notifyJobApplicationReceived(payload: JobApplicationReceivedPayload): Promise<void> {
  const link = `${APP_URL}/fr/dashboard/salon/jobs/${payload.jobId}`;
  await send(
    payload.salonEmail,
    `Nouvelle candidature — ${payload.groomerName}`,
    layout(`
      <p>Bonjour ${payload.salonName},</p>
      <p><strong>${payload.groomerName}</strong> a postulé à votre offre « <strong>${payload.jobTitle}</strong> » à <strong>${payload.jobCity}</strong>.</p>
      ${btn(link, "Voir la candidature")}
    `),
  );
}

export interface JobApplicationAcceptedPayload {
  groomerEmail: string;
  groomerName: string;
  salonName: string;
  jobTitle: string;
}

export async function notifyJobApplicationAccepted(payload: JobApplicationAcceptedPayload): Promise<void> {
  const link = `${APP_URL}/fr/dashboard/groomer`;
  await send(
    payload.groomerEmail,
    `Candidature acceptée — ${payload.salonName}`,
    layout(`
      <p>Félicitations ${payload.groomerName} !</p>
      <p>Votre candidature pour « <strong>${payload.jobTitle}</strong> » a été retenue par <strong>${payload.salonName}</strong>.</p>
      ${btn(link, "Voir mon tableau de bord")}
    `),
  );
}

export interface JobFilledPayload {
  salonEmail: string;
  salonName: string;
  groomerName: string;
  jobTitle: string;
  jobId: string;
}

export async function notifyJobFilled(payload: JobFilledPayload): Promise<void> {
  const link = `${APP_URL}/fr/dashboard/salon/jobs/${payload.jobId}`;
  await send(
    payload.salonEmail,
    `Poste comblé — ${payload.jobTitle}`,
    layout(`
      <p>Bonjour ${payload.salonName},</p>
      <p>Le poste « <strong>${payload.jobTitle}</strong> » a été comblé avec <strong>${payload.groomerName}</strong>.</p>
      ${btn(link, "Voir le détail")}
    `),
  );
}

// ─── Job application rejection ───────────────────────────────────────────────

export interface JobApplicationRejectedPayload {
  groomerEmail: string;
  groomerName: string;
  salonName: string;
  jobTitle: string;
  jobCity: string;
}

export async function notifyJobApplicationRejected(payload: JobApplicationRejectedPayload): Promise<void> {
  const link = `${APP_URL}/fr/jobs`;
  await send(
    payload.groomerEmail,
    `Candidature non retenue — ${payload.salonName}`,
    layout(`
      <p>Bonjour ${payload.groomerName},</p>
      <p>Malheureusement, votre candidature pour le poste « <strong>${payload.jobTitle}</strong> » à <strong>${payload.jobCity}</strong> chez <strong>${payload.salonName}</strong> n'a pas été retenue.</p>
      <p>D'autres offres d'emploi sont disponibles sur la plateforme.</p>
      ${btn(link, "Voir les offres disponibles")}
    `),
  );
}

// ─── Email verification ──────────────────────────────────────────────────────

export interface EmailVerificationPayload {
  email: string;
  name: string;
  token: string;
}

export async function notifyEmailVerification(payload: EmailVerificationPayload): Promise<void> {
  const link = `${APP_URL}/api/auth/verify-email?token=${payload.token}`;
  await send(
    payload.email,
    "Vérifiez votre adresse courriel — Tout Toilettage",
    layout(`
      <p>Bonjour ${payload.name},</p>
      <p>Bienvenue sur Tout Toilettage ! Veuillez confirmer votre adresse courriel en cliquant sur le bouton ci-dessous.</p>
      ${btn(link, "Vérifier mon courriel")}
      <p style="margin-top:24px;font-size:13px;color:#6b7280">Ce lien expire dans <strong>24 heures</strong>. Si vous n'avez pas créé de compte, ignorez cet email.</p>
    `),
  );
}

// ─── Password reset ───────────────────────────────────────────────────────────

export interface PasswordResetPayload {
  email: string;
  token: string;
}

export async function notifyPasswordReset(payload: PasswordResetPayload): Promise<void> {
  const link = `${APP_URL}/fr/auth/reset-password/${payload.token}`;
  await send(
    payload.email,
    "Réinitialisation de votre mot de passe",
    layout(`
      <p>Bonjour,</p>
      <p>Vous avez demandé la réinitialisation de votre mot de passe sur Tout Toilettage.</p>
      <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expire dans <strong>1 heure</strong>.</p>
      ${btn(link, "Réinitialiser mon mot de passe")}
      <p style="margin-top:24px;font-size:13px;color:#6b7280">Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe restera inchangé.</p>
    `),
  );
}

// ─── Urgent shift alerts ──────────────────────────────────────────────────────

export interface UrgentShiftAlertPayload {
  shiftId: string;
  salonName: string;
  city: string;
  date: string;
  startTime: string;
  payRateCents: number;
  payType: "HOURLY" | "FLAT";
}

export async function notifyUrgentShiftToGroomers(payload: UrgentShiftAlertPayload): Promise<void> {
  // V1: match groomers in the same city, fall back to all active groomers if none found
  const cityGroomers = await prisma.groomerProfile.findMany({
    where: {
      city: payload.city,
      user: { isBanned: false, isSuspended: false },
    },
    select: { fullName: true, user: { select: { email: true } } },
  });

  const recipients = cityGroomers.length > 0
    ? cityGroomers
    : await prisma.groomerProfile.findMany({
        where: { user: { isBanned: false, isSuspended: false } },
        select: { fullName: true, user: { select: { email: true } } },
      });

  if (recipients.length === 0) return;

  const link = `${APP_URL}/fr/shifts/${payload.shiftId}`;
  const payLabel = payload.payType === "HOURLY"
    ? `${(payload.payRateCents / 100).toFixed(2)} $ / h`
    : `${(payload.payRateCents / 100).toFixed(2)} $ forfait`;

  const subject = "Nouveau remplacement urgent disponible";

  for (const groomer of recipients) {
    const html = layout(`
      <p>Bonjour ${groomer.fullName},</p>
      <p style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:12px;font-weight:600;color:#dc2626;text-align:center">
        URGENT — Remplacement à combler rapidement
      </p>
      <table style="width:100%;margin-top:16px;font-size:14px" cellpadding="4">
        <tr><td style="color:#6b7280">Salon</td><td><strong>${payload.salonName}</strong></td></tr>
        <tr><td style="color:#6b7280">Ville</td><td><strong>${payload.city}</strong></td></tr>
        <tr><td style="color:#6b7280">Date</td><td><strong>${payload.date}</strong></td></tr>
        <tr><td style="color:#6b7280">Heure</td><td><strong>${payload.startTime}</strong></td></tr>
        <tr><td style="color:#6b7280">Rémunération</td><td><strong>${payLabel}</strong></td></tr>
      </table>
      ${btn(link, "Voir le remplacement")}
    `);

    send(groomer.user.email, subject, html).catch((err) =>
      console.error("[URGENT ALERT] Failed for", groomer.user.email, err),
    );
  }
}

// ─── Review request ───────────────────────────────────────────────────────────

export interface ReviewRequestPayload {
  salonEmail: string;
  salonName: string;
  groomerName: string;
  shiftDate: string;
  shiftCity: string;
  shiftId: string;
}

export async function notifyReviewRequest(payload: ReviewRequestPayload): Promise<void> {
  const link = `${APP_URL}/fr/dashboard/salon/shifts/${payload.shiftId}/review`;
  await send(
    payload.salonEmail,
    "Laissez un avis sur votre remplacement",
    layout(`
      <p>Bonjour ${payload.salonName},</p>
      <p>Le remplacement du <strong>${payload.shiftDate}</strong> à <strong>${payload.shiftCity}</strong> avec <strong>${payload.groomerName}</strong> est maintenant complété.</p>
      <p>Prenez un instant pour évaluer votre expérience. Vos avis aident les autres salons à trouver des toiletteurs fiables.</p>
      ${btn(link, "Laisser un avis")}
    `),
  );
}
