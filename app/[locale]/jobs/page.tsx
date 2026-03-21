export const dynamic = "force-dynamic";

import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/nav/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Briefcase, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const PAGE_SIZE = 20;

export default async function JobsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
  const t = await getTranslations("jobs");

  const currentPage = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const skip = (currentPage - 1) * PAGE_SIZE;

  // Auto-expire jobs where expiresAt has passed
  await prisma.jobPost.updateMany({
    where: {
      status: 'PUBLISHED',
      expiresAt: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });

  const where = {
    status: "PUBLISHED" as const,
    OR: [
      { expiresAt: null },
      { expiresAt: { gte: new Date() } },
    ],
  };

  const [totalCount, jobs] = await Promise.all([
    prisma.jobPost.count({ where }),
    prisma.jobPost.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
      skip,
      take: PAGE_SIZE,
      select: {
        id: true, title: true, city: true, region: true,
        employmentType: true, payInfo: true, publishedAt: true, description: true,
        isFeatured: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <div className="container mx-auto px-4 py-10 max-w-5xl">
          <h1 className="text-3xl font-bold mb-2 text-[#1F2933]">{t("title")}</h1>
          <p className="text-[#4a6260] mb-8 text-sm">
            {totalCount === 1 ? t("count", { count: totalCount }) : t("count_plural", { count: totalCount })}
          </p>

          {jobs.length === 0 ? (
            <Card className="border-dashed bg-card/80">
              <CardContent className="py-16 text-center text-muted-foreground">
                {t("no_jobs")}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {jobs.map((job) => (
                <Link key={job.id} href={`/${locale}/jobs/${job.id}`} className="block group">
                  <Card className="relative border border-border/80 bg-white shadow-sm group-hover:shadow-md transition-shadow cursor-pointer">
                    {job.isFeatured && (
                      <span className="absolute top-3 right-3 inline-flex items-center rounded-full bg-[#055864] px-2.5 py-0.5 text-xs font-semibold text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {t("featured_badge")}
                      </span>
                    )}
                    <CardContent className="py-5 px-6">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                            <span className="font-semibold text-base group-hover:text-primary transition-colors">
                              {job.title}
                            </span>
                          </div>

                          <p className="text-sm font-medium text-[#4a6260]">
                            {t("salon_in_city", { city: job.city })}
                          </p>

                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            {job.city}
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            {(() => {
                              const empType = job.employmentType;
                              const label = t(empType === "FULL_TIME" ? "full_time" : empType === "PART_TIME" ? "part_time" : "contract");
                              const styles = empType === "FULL_TIME"
                                ? "bg-[#d1ede6] text-[#055864]"
                                : empType === "PART_TIME"
                                ? "bg-[#fef3c7] text-[#854d0e]"
                                : "bg-[#f1f5f9] text-[#475569]";
                              return (
                                <span className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium ${styles}`}>
                                  {label}
                                </span>
                              );
                            })()}
                            {job.payInfo && (
                              <Badge variant="outline" className="text-xs">{job.payInfo}</Badge>
                            )}
                          </div>

                          {job.description && (
                            <p className="text-sm text-muted-foreground mt-3 line-clamp-2">{job.description}</p>
                          )}
                        </div>

                        <div className="shrink-0 self-center">
                          <span className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
                            {t("view_job")}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                  {currentPage > 1 ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${locale}/jobs?page=${currentPage - 1}`}>
                        <ChevronLeft className="h-4 w-4 mr-1" />
                        {t("previous")}
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      {t("previous")}
                    </Button>
                  )}

                  <span className="text-sm text-muted-foreground">
                    {t("page_of", { page: currentPage, total: totalPages })}
                  </span>

                  {currentPage < totalPages ? (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/${locale}/jobs?page=${currentPage + 1}`}>
                        {t("next")}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" disabled>
                      {t("next")}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
