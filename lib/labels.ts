/**
 * Central label maps for all enum values displayed in the UI.
 * Usage: LABEL_MAP[enumKey]?.[lang] ?? enumKey
 */

export type Lang = "fr" | "en";

export function getLang(locale: string): Lang {
  return locale === "en" ? "en" : "fr";
}

// ─── Post status (shared between ShiftPost and JobPost) ───────────────────────

export const POST_STATUS_LABEL: Record<string, Record<Lang, string>> = {
  PUBLISHED: { fr: "Publié",    en: "Published" },
  FILLED:    { fr: "Comblé",    en: "Filled" },
  DRAFT:     { fr: "Brouillon", en: "Draft" },
  COMPLETED: { fr: "Complété",  en: "Completed" },
  EXPIRED:   { fr: "Expiré",    en: "Expired" },
  ARCHIVED:  { fr: "Archivé",   en: "Archived" },
};

export const POST_STATUS_BADGE_CLASS: Record<string, string> = {
  PUBLISHED: "bg-green-100 text-green-700 border-green-300",
  FILLED:    "bg-blue-100 text-blue-700 border-blue-300",
  DRAFT:     "bg-gray-100 text-gray-600 border-gray-300",
  COMPLETED: "bg-emerald-100 text-emerald-700 border-emerald-300",
  EXPIRED:   "bg-orange-100 text-orange-600 border-orange-300",
  ARCHIVED:  "bg-gray-100 text-gray-500 border-gray-200",
};

export const POST_STATUS_BADGE_VARIANT: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  PUBLISHED: "default",
  FILLED:    "secondary",
  DRAFT:     "outline",
  COMPLETED: "default",
  EXPIRED:   "secondary",
  ARCHIVED:  "outline",
};

// ─── Employment type ──────────────────────────────────────────────────────────

export const EMPLOYMENT_TYPE_LABEL: Record<string, Record<Lang, string>> = {
  FULL_TIME: { fr: "Temps plein",   en: "Full time" },
  PART_TIME: { fr: "Temps partiel", en: "Part time" },
  CONTRACT:  { fr: "Contrat",       en: "Contract" },
};

// ─── Application status ───────────────────────────────────────────────────────

export const APP_STATUS_LABEL: Record<string, Record<Lang, string>> = {
  APPLIED:   { fr: "En attente",  en: "Pending" },
  ACCEPTED:  { fr: "Accepté",     en: "Accepted" },
  REJECTED:  { fr: "Non retenu",  en: "Rejected" },
  WITHDRAWN: { fr: "Retiré",      en: "Withdrawn" },
};

export const APP_STATUS_VARIANT: Record<
  string,
  "default" | "secondary" | "destructive" | "outline"
> = {
  APPLIED:   "outline",
  ACCEPTED:  "default",
  REJECTED:  "secondary",
  WITHDRAWN: "outline",
};

// ─── Groomer specializations ──────────────────────────────────────────────────

export const SPEC_LABEL: Record<string, Record<Lang, string>> = {
  AGGRESSIVE_DOGS: { fr: "Chiens agressifs",   en: "Aggressive dogs" },
  COLOR:           { fr: "Coloration",          en: "Color" },
  BIG_DOGS:        { fr: "Grands chiens",       en: "Big dogs" },
  SMALL_DOGS:      { fr: "Petits chiens",       en: "Small dogs" },
  RABBITS:         { fr: "Lapins",              en: "Rabbits" },
  CATS:            { fr: "Chats",               en: "Cats" },
  SPECIALTY_CUTS:  { fr: "Coupes spécialisées", en: "Specialty cuts" },
  NORDIC_BREEDS:   { fr: "Races nordiques",     en: "Nordic breeds" },
};

// ─── Shift criteria tags ──────────────────────────────────────────────────────
// (overlap with SPEC_LABEL — same map works for display)
export const CRITERIA_LABEL: Record<string, Record<Lang, string>> = {
  BIG_DOGS:        { fr: "Grands chiens",    en: "Big dogs" },
  SMALL_DOGS:      { fr: "Petits chiens",    en: "Small dogs" },
  CATS:            { fr: "Chats",            en: "Cats" },
  RABBITS:         { fr: "Lapins",           en: "Rabbits" },
  AGGRESSIVE_DOGS: { fr: "Chiens difficiles", en: "Difficult dogs" },
  NORDIC_BREEDS:   { fr: "Races nordiques",  en: "Nordic breeds" },
};

// ─── Open slot service types ─────────────────────────────────────────────────

export const OPEN_SLOT_SERVICE_LABEL: Record<string, Record<Lang, string>> = {
  BAIN_COUPE:         { fr: "Bain + coupe",         en: "Bath + haircut" },
  BAIN_SEULEMENT:     { fr: "Bain seulement",       en: "Bath only" },
  COUPE_SEULEMENT:    { fr: "Coupe seulement",      en: "Haircut only" },
  TOILETTAGE_COMPLET: { fr: "Toilettage complet",   en: "Full grooming" },
  AUTRE:              { fr: "Autre",                 en: "Other" },
};

export const DOG_SIZE_LABEL: Record<string, Record<Lang, string>> = {
  TRES_PETIT: { fr: "Très petit (< 5 lb)",   en: "Very small (< 5 lb)" },
  PETIT:      { fr: "Petit (5-15 lb)",        en: "Small (5-15 lb)" },
  MOYEN:      { fr: "Moyen (15-40 lb)",       en: "Medium (15-40 lb)" },
  GRAND:      { fr: "Grand (40-80 lb)",       en: "Large (40-80 lb)" },
  TRES_GRAND: { fr: "Très grand (80+ lb)",    en: "Very large (80+ lb)" },
};

export const OPEN_SLOT_STATUS_LABEL: Record<string, Record<Lang, string>> = {
  ACTIVE:    { fr: "Actif",    en: "Active" },
  FILLED:    { fr: "Comblé",   en: "Filled" },
  CANCELLED: { fr: "Annulé",   en: "Cancelled" },
  EXPIRED:   { fr: "Expiré",   en: "Expired" },
};

export const OPEN_SLOT_STATUS_BADGE_CLASS: Record<string, string> = {
  ACTIVE:    "bg-green-100 text-green-700 border-green-300",
  FILLED:    "bg-blue-100 text-blue-700 border-blue-300",
  CANCELLED: "bg-gray-100 text-gray-500 border-gray-300",
  EXPIRED:   "bg-orange-100 text-orange-600 border-orange-300",
};

// ─── Convenience helper ───────────────────────────────────────────────────────

/** Returns the localised label or falls back to the raw enum key. */
export function getLabel(
  map: Record<string, Record<Lang, string>>,
  key: string,
  l: Lang
): string {
  return map[key]?.[l] ?? key;
}
