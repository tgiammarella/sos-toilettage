import { Resend } from "resend";
import { BRAND } from "@/lib/brand";

if (!process.env.RESEND_API_KEY) {
  console.warn("[Resend] RESEND_API_KEY is not set — emails will not be sent.");
}

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export const EMAIL_FROM = BRAND.emailFrom;

export const APP_URL = process.env.AUTH_URL ?? "http://localhost:3000";
