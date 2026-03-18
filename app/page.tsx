import { redirect } from "next/navigation";

// Root route — redirect to default locale.
// All real content lives under /[locale].
export default function RootPage() {
  redirect("/fr");
}
