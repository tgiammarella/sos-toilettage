export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireRole(locale, "ADMIN");

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      isSuspended: true,
      suspensionEndsAt: true,
      moderationEmailBlocked: true,
      createdAt: true,
    },
  });

  const roleLabel = (r: string) =>
    ({ ADMIN: "Admin", SALON: "Salon", GROOMER: "Toiletteur" }[r] ?? r);

  function userStatus(u: typeof users[number]) {
    if (u.isBanned) return { label: "Banni", variant: "destructive" as const };
    if (u.isSuspended && u.suspensionEndsAt && new Date(u.suspensionEndsAt) > new Date()) {
      return { label: "Suspendu", variant: "warning" as const };
    }
    return { label: "Actif", variant: "default" as const };
  }

  return (
    <AdminShell locale={locale}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#1F2933]">Utilisateurs</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} utilisateurs
          </p>
        </div>

        <div className="space-y-2">
          {users.map((u) => {
            const status = userStatus(u);
            return (
              <Card key={u.id} className="border shadow-none">
                <CardContent className="py-3 px-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name ?? u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant="outline" className="text-xs">{roleLabel(u.role)}</Badge>
                    <Badge
                      variant={status.variant === "warning" ? "secondary" : status.variant}
                      className={`text-xs ${status.variant === "warning" ? "bg-yellow-100 text-yellow-800 border-yellow-300" : ""}`}
                    >
                      {status.label}
                    </Badge>
                    {u.moderationEmailBlocked && (
                      <Badge variant="outline" className="text-xs border-red-300 text-red-600">
                        Email bloqué
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString("fr-CA")}
                    </span>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/${locale}/dashboard/admin/users/${u.id}`}>
                        Gérer
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AdminShell>
  );
}
