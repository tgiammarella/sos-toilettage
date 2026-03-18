export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Scissors,
  BookOpen,
  FileText,
  Star,
  Users,
  Coins,
  Plus,
  Shield,
} from "lucide-react";
import { AdminSidebar } from "@/components/dashboard/AdminSidebar";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await requireRole(locale, "ADMIN");

  const t = await getTranslations("dashboard.admin");

  const [userCount, shiftCount, jobCount, listingCount, pendingReviews] = await Promise.all([
    prisma.user.count(),
    prisma.shiftPost.count({ where: { status: "PUBLISHED" } }),
    prisma.jobPost.count({ where: { status: "PUBLISHED" } }),
    prisma.trainingListing.count({ where: { isActive: true } }),
    prisma.review.count(),
  ]);

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 8,
    select: { id: true, email: true, role: true, createdAt: true, isBanned: true, name: true },
  });

  const recentListings = await prisma.trainingListing.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="flex min-h-screen bg-muted/30">
      <AdminSidebar locale={locale} />

      {/* Main */}
      <main className="flex-1 p-6 md:p-8 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2 text-[#1F2933]">
                <Shield className="h-6 w-6 text-primary" />
                {t("title")}
              </h1>
              <p className="text-muted-foreground text-sm mt-0.5">
                {session.user.email}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={<Users className="h-5 w-5 text-primary" />} label={t("users")} value={userCount} />
            <StatCard icon={<Scissors className="h-5 w-5 text-primary" />} label="Remplacements publiés" value={shiftCount} />
            <StatCard icon={<FileText className="h-5 w-5 text-primary" />} label="Offres publiées" value={jobCount} />
            <StatCard icon={<BookOpen className="h-5 w-5 text-primary" />} label={t("directory")} value={listingCount} />
          </div>

          <Separator />

          {/* Directory quick section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("directory")}</h2>
              <Button size="sm" asChild>
                <Link href={`/${locale}/dashboard/admin/directory/new`}>
                  <Plus className="h-4 w-4 mr-1" />
                  {t("new_listing")}
                </Link>
              </Button>
            </div>
            {recentListings.length === 0 ? (
              <EmptyCard message="Aucune entrée dans le répertoire." />
            ) : (
              <div className="space-y-3">
                {recentListings.map((listing) => (
                  <Card key={listing.id} className="border shadow-none">
                    <CardContent className="py-4 px-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{listing.name}</p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {listing.city}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={listing.type === "SCHOOL" ? "default" : "secondary"} className="text-xs">
                          {listing.type === "SCHOOL" ? "École" : "Formation"}
                        </Badge>
                        <Badge variant={listing.isActive ? "default" : "outline"} className="text-xs">
                          {listing.isActive ? "Actif" : "Inactif"}
                        </Badge>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/${locale}/dashboard/admin/directory/${listing.id}`}>
                            Modifier
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* Recent users */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{t("users")}</h2>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/${locale}/dashboard/admin/users`}>Tous les utilisateurs</Link>
              </Button>
            </div>
            <div className="space-y-2">
              {recentUsers.map((user) => (
                <Card key={user.id} className="border shadow-none">
                  <CardContent className="py-3 px-5 flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{user.name ?? user.email}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <RoleBadge role={user.role} />
                      {user.isBanned && (
                        <Badge variant="destructive" className="text-xs">Banni</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Reviews count */}
          <Card className="border shadow-none bg-muted/40">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                {t("reviews")}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-3xl font-bold">{pendingReviews}</p>
              <p className="text-sm text-muted-foreground mt-1">évaluations au total</p>
              <Button size="sm" variant="outline" className="mt-3" asChild>
                <Link href={`/${locale}/dashboard/admin/reviews`}>Voir tout</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="border shadow-none">
      <CardHeader className="pb-2 pt-4 px-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {icon}
          <span className="truncate">{label}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-4">
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
    ADMIN:   { label: "Admin",      variant: "default" },
    SALON:   { label: "Salon",      variant: "secondary" },
    GROOMER: { label: "Toiletteur", variant: "outline" },
  };
  const item = map[role] ?? { label: role, variant: "outline" as const };
  return <Badge variant={item.variant} className="text-xs">{item.label}</Badge>;
}

function EmptyCard({ message }: { message: string }) {
  return (
    <Card className="border-dashed shadow-none">
      <CardContent className="py-10 text-center text-muted-foreground text-sm">{message}</CardContent>
    </Card>
  );
}
