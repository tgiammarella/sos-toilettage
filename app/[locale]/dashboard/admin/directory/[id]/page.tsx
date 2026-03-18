export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TrainingListingForm } from "@/components/admin/TrainingListingForm";

export default async function AdminEditListingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireRole(locale, "ADMIN");

  const listing = await prisma.trainingListing.findUnique({ where: { id } });
  if (!listing) notFound();

  return (
    <AdminShell locale={locale}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link href={`/${locale}/dashboard/admin/directory`}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Retour
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-[#1F2933]">
            {locale === "fr" ? "Modifier l'entrée" : "Edit listing"}
          </h1>
        </div>
        <TrainingListingForm
          locale={locale}
          initial={{
            id: listing.id,
            name: listing.name,
            type: listing.type,
            city: listing.city,
            province: listing.province,
            description: listing.description ?? "",
            websiteUrl: listing.websiteUrl ?? "",
            logoUrl: listing.logoUrl ?? "",
            phone: listing.phone ?? "",
            email: listing.email ?? "",
            tags: JSON.parse(listing.tags || "[]").join(", "),
            isFeatured: listing.isFeatured,
            isActive: listing.isActive,
          }}
        />
      </div>
    </AdminShell>
  );
}
