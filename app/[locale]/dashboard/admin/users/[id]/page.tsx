export const dynamic = "force-dynamic";

import { requireRole } from "@/lib/auth-guards";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { notFound } from "next/navigation";
import { ModerationActions } from "@/components/admin/ModerationActions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  await requireRole(locale, "ADMIN");

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isBanned: true,
      bannedAt: true,
      bannedReason: true,
      bannedNotes: true,
      isSuspended: true,
      suspendedAt: true,
      suspensionEndsAt: true,
      suspendedReason: true,
      suspendedNotes: true,
      moderationEmailBlocked: true,
      createdAt: true,
    },
  });

  if (!user) notFound();

  const history = await prisma.adminModerationAction.findMany({
    where: { userId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const isSuspendedNow = user.isSuspended && user.suspensionEndsAt && new Date(user.suspensionEndsAt) > new Date();

  const statusLabel = user.isBanned
    ? "Banni"
    : isSuspendedNow
      ? "Suspendu"
      : "Actif";

  const statusColor = user.isBanned
    ? "destructive"
    : isSuspendedNow
      ? "secondary"
      : "default";

  const roleLabel = ({ ADMIN: "Admin", SALON: "Salon", GROOMER: "Toiletteur" }[user.role] ?? user.role);

  const actionLabels: Record<string, string> = {
    BAN: "Bannissement",
    UNBAN: "Débannissement",
    SUSPEND: "Suspension",
    REACTIVATE: "Réactivation",
    BLOCK_EMAIL: "Email bloqué",
    UNBLOCK_EMAIL: "Email débloqué",
  };

  return (
    <AdminShell locale={locale}>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          href={`/${locale}/dashboard/admin/users`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux utilisateurs
        </Link>

        {/* User info */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">{user.name ?? user.email}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{roleLabel}</Badge>
                <Badge
                  variant={statusColor === "secondary" ? "secondary" : statusColor}
                  className={statusColor === "secondary" ? "bg-yellow-100 text-yellow-800 border-yellow-300" : ""}
                >
                  {statusLabel}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Email</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Inscrit le</span>
                <p className="font-medium">{new Date(user.createdAt).toLocaleDateString("fr-CA")}</p>
              </div>
            </div>

            {user.isBanned && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm space-y-1">
                <p className="font-medium text-red-800">Banni {user.bannedAt ? `le ${new Date(user.bannedAt).toLocaleDateString("fr-CA")}` : ""}</p>
                {user.bannedReason && <p className="text-red-700">Raison : {user.bannedReason}</p>}
                {user.bannedNotes && <p className="text-red-600">Notes : {user.bannedNotes}</p>}
              </div>
            )}

            {isSuspendedNow && (
              <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 text-sm space-y-1">
                <p className="font-medium text-yellow-800">
                  Suspendu jusqu&apos;au {user.suspensionEndsAt ? new Date(user.suspensionEndsAt).toLocaleDateString("fr-CA") : "—"}
                </p>
                {user.suspendedReason && <p className="text-yellow-700">Raison : {user.suspendedReason}</p>}
                {user.suspendedNotes && <p className="text-yellow-600">Notes : {user.suspendedNotes}</p>}
              </div>
            )}

            {user.moderationEmailBlocked && (
              <div className="rounded-lg bg-orange-50 border border-orange-200 p-3 text-sm">
                <p className="font-medium text-orange-800">Réinscription par email bloquée</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action buttons */}
        {user.role !== "ADMIN" && (
          <ModerationActions
            userId={user.id}
            isBanned={user.isBanned}
            isSuspended={!!isSuspendedNow}
            emailBlocked={user.moderationEmailBlocked}
          />
        )}

        <Separator />

        {/* Moderation history */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Historique de modération</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune action de modération.</p>
            ) : (
              <div className="space-y-3">
                {history.map((action) => (
                  <div key={action.id} className="flex items-start gap-3 text-sm border-b last:border-0 pb-3 last:pb-0">
                    <Badge variant="outline" className="text-xs shrink-0 mt-0.5">
                      {actionLabels[action.actionType] ?? action.actionType}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      {action.reason && <p>{action.reason}</p>}
                      {action.notes && <p className="text-muted-foreground">{action.notes}</p>}
                      {action.effectiveUntil && (
                        <p className="text-muted-foreground">
                          Jusqu&apos;au {new Date(action.effectiveUntil).toLocaleDateString("fr-CA")}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {new Date(action.createdAt).toLocaleDateString("fr-CA")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminShell>
  );
}
