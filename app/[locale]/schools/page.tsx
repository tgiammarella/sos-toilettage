export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/nav/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, ExternalLink, GraduationCap } from "lucide-react";

export default async function SchoolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("schools");

  const listings = await prisma.trainingListing.findMany({
    where: { isActive: true },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  const typeLabel = (type: string) =>
    type === "SCHOOL"
      ? locale === "fr" ? "École" : "School"
      : locale === "fr" ? "Formation" : "Training";

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <div className="flex items-center gap-3 mb-2">
            <GraduationCap className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">{t("title")}</h1>
          </div>
          <p className="text-muted-foreground mb-8 text-sm">{t("subtitle")}</p>

          {listings.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-16 text-center text-muted-foreground">
                {t("no_listings")}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {listings.map((listing) => (
                <Card key={listing.id} className="border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="py-5 px-6 h-full flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-base leading-snug">{listing.name}</h3>
                      <Badge
                        variant={listing.type === "SCHOOL" ? "default" : "secondary"}
                        className="text-xs shrink-0"
                      >
                        {typeLabel(listing.type)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {listing.city}, {listing.region}
                    </div>

                    {listing.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-4">
                        {listing.description}
                      </p>
                    )}

                    {(() => {
                      const tags: string[] = JSON.parse(listing.tags || "[]");
                      return tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>
                          ))}
                        </div>
                      ) : null;
                    })()}

                    {listing.websiteUrl && (
                      <Button variant="outline" size="sm" className="mt-auto w-full" asChild>
                        <a href={listing.websiteUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                          {t("visit_website")}
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
