/**
 * Notification stubs — replace with Resend email calls in a future slice.
 * All functions log to console in development and are no-ops in production
 * until a real email provider is wired up.
 */

export interface ApplicationReceivedPayload {
  salonEmail: string;
  salonName: string;
  groomerName: string;
  shiftDate: string;
  shiftCity: string;
}

export interface ApplicationAcceptedPayload {
  groomerEmail: string;
  groomerName: string;
  salonName: string;
  salonAddress: string;
  shiftDate: string;
  shiftTime: string;
}

export interface ShiftFilledPayload {
  salonEmail: string;
  salonName: string;
  groomerName: string;
  shiftDate: string;
}

export function notifyApplicationReceived(payload: ApplicationReceivedPayload): void {
  console.log("[EMAIL STUB] Application received", {
    to: payload.salonEmail,
    subject: `Nouvelle candidature — ${payload.groomerName}`,
    body: `${payload.groomerName} a postulé pour votre remplacement du ${payload.shiftDate} à ${payload.shiftCity}.`,
  });
}

export function notifyApplicationAccepted(payload: ApplicationAcceptedPayload): void {
  console.log("[EMAIL STUB] Application accepted", {
    to: payload.groomerEmail,
    subject: `Candidature acceptée — ${payload.salonName}`,
    body: `Félicitations ${payload.groomerName} ! Votre candidature a été acceptée. Rendez-vous le ${payload.shiftDate} à ${payload.shiftTime} au ${payload.salonAddress}.`,
  });
}

export function notifyShiftFilled(payload: ShiftFilledPayload): void {
  console.log("[EMAIL STUB] Shift filled", {
    to: payload.salonEmail,
    subject: `Remplacement confirmé — ${payload.groomerName}`,
    body: `Le remplacement du ${payload.shiftDate} est confirmé avec ${payload.groomerName}.`,
  });
}

// ─── Job notifications ────────────────────────────────────────────────────────

export interface JobApplicationReceivedPayload {
  salonEmail: string;
  salonName: string;
  groomerName: string;
  jobTitle: string;
  jobCity: string;
}

export interface JobApplicationAcceptedPayload {
  groomerEmail: string;
  groomerName: string;
  salonName: string;
  jobTitle: string;
}

export interface JobFilledPayload {
  salonEmail: string;
  salonName: string;
  groomerName: string;
  jobTitle: string;
}

export async function notifyJobApplicationReceived(payload: JobApplicationReceivedPayload): Promise<void> {
  console.log("[EMAIL STUB] Job application received", {
    to: payload.salonEmail,
    subject: `Nouvelle candidature — ${payload.groomerName}`,
    body: `${payload.groomerName} a postulé à votre offre "${payload.jobTitle}" à ${payload.jobCity}.`,
  });
}

export async function notifyJobApplicationAccepted(payload: JobApplicationAcceptedPayload): Promise<void> {
  console.log("[EMAIL STUB] Job application accepted", {
    to: payload.groomerEmail,
    subject: `Candidature acceptée — ${payload.salonName}`,
    body: `Félicitations ${payload.groomerName} ! Votre candidature pour "${payload.jobTitle}" a été retenue par ${payload.salonName}.`,
  });
}

export async function notifyJobFilled(payload: JobFilledPayload): Promise<void> {
  console.log("[EMAIL STUB] Job filled", {
    to: payload.salonEmail,
    subject: `Poste comblé — ${payload.jobTitle}`,
    body: `Le poste "${payload.jobTitle}" a été comblé avec ${payload.groomerName}.`,
  });
}
