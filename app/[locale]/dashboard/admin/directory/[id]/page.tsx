export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { AdminShell } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { TrainingListingForm } from "@/components/admin/TrainingListingForm";
import { GraduateManager } from "@/components/admin/GraduateManager";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function AdminEditListingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireRole(locale, "ADMIN");
  const lang = locale === "fr" ? "fr" : "en";

  const listing = await prisma.trainingListing.findUnique({
    where: { id },
    include: {
      graduates: {
        orderBy: [{ graduationYear: "desc" }, { lastName: "asc" }],
      },
    },
  });
  if (!listing) notFound();

  // Navigate back to the right admin section
  const backHref =
    listing.type === "SCHOOL" && !listing.isTrainer
      ? `/${locale}/dashboard/admin/schools`
      : `/${locale}/dashboard/admin/trainings`;

  const isSchool = listing.type === "SCHOOL" && !listing.isTrainer;

  return (
    <AdminShell locale={locale}>
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <Button variant="ghost" size="sm" asChild className="mb-4 -ml-2">
            <Link href={backHref}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              {lang === "fr" ? "Retour" : "Back"}
            </Link>
          </Button>
          <h1 className="text-2xl font-bold text-[#1F2933]">
            {lang === "fr" ? "Modifier l'entrée" : "Edit listing"}
          </h1>
        </div>

        {isSchool ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="details">
                {lang === "fr" ? "Informations" : "Details"}
              </TabsTrigger>
              <TabsTrigger value="graduates">
                {lang === "fr" ? "Diplômés" : "Graduates"}
                {listing.graduates.length > 0 && (
                  <span className="ml-1.5 text-xs bg-[#055864]/10 text-[#055864] rounded-full px-1.5 py-0.5">
                    {listing.graduates.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="mt-6">
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
                  tier: listing.tier,
                  isTrainer: listing.isTrainer,
                  isFeatured: listing.isFeatured,
                  isActive: listing.isActive,
                }}
              />
            </TabsContent>
            <TabsContent value="graduates" className="mt-6">
              <GraduateManager
                schoolId={listing.id}
                initialGraduates={listing.graduates}
                locale={locale}
              />
            </TabsContent>
          </Tabs>
        ) : (
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
              tier: listing.tier,
              isTrainer: listing.isTrainer,
              isFeatured: listing.isFeatured,
              isActive: listing.isActive,
            }}
          />
        )}
      </div>
    </AdminShell>
  );
}
