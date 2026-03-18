import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Briefcase } from "lucide-react";
import { getLang, SPEC_LABEL, getLabel } from "@/lib/labels";
import { computeTrustBadges } from "@/lib/groomer-trust";

export default async function PublicGroomerProfilePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const lang = getLang(locale);

  const groomer = await prisma.groomerProfile.findUnique({
    where: { id },
    select: {
      id: true,
      fullName: true,
      photoUrl: true,
      city: true,
      region: true,
      yearsExperience: true,
      specializations: true,
      bio: true,
      cvFileUrl: true,
      reliabilityScore: true,
      reviewsReceived: {
        select: {
          rating: true,
          text: true,
          createdAt: true,
          reviewerSalon: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!groomer) notFound();

  const specs: string[] = (() => {
    try { return JSON.parse(groomer.specializations || "[]"); } catch { return []; }
  })();

  const reviewCount = groomer.reviewsReceived.length;
  const reviewAverage =
    reviewCount > 0
      ? groomer.reviewsReceived.reduce((s, r) => s + r.rating, 0) / reviewCount
      : 0;

  const badges = computeTrustBadges(
    {
      cvFileUrl: groomer.cvFileUrl,
      photoUrl: groomer.photoUrl,
      bio: groomer.bio,
      city: groomer.city,
      specializations: groomer.specializations,
      yearsExperience: groomer.yearsExperience,
    },
    { count: reviewCount, average: reviewAverage },
  );

  const dateLocale = locale === "fr" ? "fr-CA" : "en-CA";

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">

        {/* Header */}
        <div className="flex items-start gap-5">
          <Avatar className="h-16 w-16 shrink-0">
            <AvatarImage src={groomer.photoUrl ?? ""} alt={groomer.fullName} />
            <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
              {groomer.fullName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[#1F2933]">{groomer.fullName}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {groomer.city}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3.5 w-3.5" />
                {groomer.yearsExperience}{" "}
                {lang === "fr" ? "an(s) d'expérience" : "yr(s) experience"}
              </span>
              {reviewCount > 0 && (
                <span className="flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  {reviewAverage.toFixed(1)}
                  <span className="text-xs">({reviewCount})</span>
                </span>
              )}
              {groomer.reliabilityScore > 0 && (
                <Badge variant="outline" className="text-xs">
                  {groomer.reliabilityScore.toFixed(1)}/5 {lang === "fr" ? "fiabilité" : "reliability"}
                </Badge>
              )}
            </div>

            {/* Trust badges */}
            {badges.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {badges.map((b) => (
                  <Badge key={b.key} variant="secondary" className="text-xs">
                    {lang === "fr" ? b.labelFr : b.labelEn}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        {groomer.bio && (
          <Card className="border shadow-none">
            <CardContent className="py-4 px-5">
              <p className="text-sm leading-relaxed">{groomer.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Specializations */}
        {specs.length > 0 && (
          <section>
            <h2 className="text-base font-semibold mb-2">
              {lang === "fr" ? "Spécialités" : "Specialties"}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {specs.map((s) => (
                <span key={s} className="inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium bg-[#F6EFE6] text-[#055864]">
                  {getLabel(SPEC_LABEL, s, lang)}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        <section>
          <h2 className="text-base font-semibold mb-3">
            {lang === "fr" ? "Évaluations" : "Reviews"}
            {reviewCount > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({reviewCount} — {reviewAverage.toFixed(1)}/5)
              </span>
            )}
          </h2>
          {groomer.reviewsReceived.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {lang === "fr" ? "Aucune évaluation pour le moment." : "No reviews yet."}
            </p>
          ) : (
            <div className="space-y-2">
              {groomer.reviewsReceived.map((r, i) => (
                <Card key={i} className="border shadow-none">
                  <CardContent className="py-3 px-5 space-y-1.5">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <Star
                            key={idx}
                            className={`h-3.5 w-3.5 ${
                              idx < r.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-muted-foreground/30"
                            }`}
                          />
                        ))}
                        {r.reviewerSalon && (
                          <span className="text-xs text-muted-foreground ml-2">
                            — {r.reviewerSalon.name}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {new Date(r.createdAt).toLocaleDateString(dateLocale, {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    {r.text && (
                      <p className="text-sm text-muted-foreground">{r.text}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}
