"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Ban, ShieldCheck, Clock, RotateCcw, Mail, MailX } from "lucide-react";

interface Props {
  userId: string;
  isBanned: boolean;
  isSuspended: boolean;
  emailBlocked: boolean;
}

type ModalType = "ban" | "suspend" | "unban" | "reactivate" | null;

export function ModerationActions({ userId, isBanned, isSuspended, emailBlocked }: Props) {
  const router = useRouter();
  const [modal, setModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);

  // Ban form state
  const [banReason, setBanReason] = useState("");
  const [banNotes, setBanNotes] = useState("");
  const [blockEmail, setBlockEmail] = useState(false);

  // Suspend form state
  const [suspendReason, setSuspendReason] = useState("");
  const [suspendNotes, setSuspendNotes] = useState("");
  const [suspendEndDate, setSuspendEndDate] = useState("");

  // Unban/reactivate notes
  const [actionNotes, setActionNotes] = useState("");

  function resetForms() {
    setBanReason("");
    setBanNotes("");
    setBlockEmail(false);
    setSuspendReason("");
    setSuspendNotes("");
    setSuspendEndDate("");
    setActionNotes("");
    setModal(null);
  }

  async function handleBan() {
    if (!banReason.trim()) {
      toast.error("La raison est obligatoire");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: banReason, notes: banNotes || undefined, blockEmail }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Utilisateur banni");
      resetForms();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleUnban() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/unban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: actionNotes || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Utilisateur débanni");
      resetForms();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleSuspend() {
    if (!suspendReason.trim()) {
      toast.error("La raison est obligatoire");
      return;
    }
    if (!suspendEndDate) {
      toast.error("La date de fin est obligatoire");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/suspend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: suspendReason,
          notes: suspendNotes || undefined,
          suspensionEndsAt: new Date(suspendEndDate).toISOString(),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Utilisateur suspendu");
      resetForms();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function handleReactivate() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reactivate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: actionNotes || undefined }),
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Utilisateur réactivé");
      resetForms();
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function toggleEmailBlock() {
    setLoading(true);
    try {
      const endpoint = emailBlocked ? "unblock-email" : "block-email";
      const res = await fetch(`/api/admin/users/${userId}/${endpoint}`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success(emailBlocked ? "Email débloqué" : "Email bloqué");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Actions de modération</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {!isBanned && (
            <Button variant="destructive" size="sm" onClick={() => setModal("ban")} disabled={loading}>
              <Ban className="h-4 w-4 mr-1" />
              Bannir
            </Button>
          )}
          {isBanned && (
            <Button variant="outline" size="sm" onClick={() => setModal("unban")} disabled={loading}>
              <ShieldCheck className="h-4 w-4 mr-1" />
              Débannir
            </Button>
          )}
          {!isSuspended && !isBanned && (
            <Button variant="secondary" size="sm" onClick={() => setModal("suspend")} disabled={loading}>
              <Clock className="h-4 w-4 mr-1" />
              Suspendre
            </Button>
          )}
          {isSuspended && (
            <Button variant="outline" size="sm" onClick={() => setModal("reactivate")} disabled={loading}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Réactiver
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleEmailBlock}
            disabled={loading}
          >
            {emailBlocked ? <Mail className="h-4 w-4 mr-1" /> : <MailX className="h-4 w-4 mr-1" />}
            {emailBlocked ? "Débloquer email" : "Bloquer email"}
          </Button>
        </CardContent>
      </Card>

      {/* Ban modal */}
      {modal === "ban" && (
        <Card className="border-red-200 bg-red-50/50">
          <CardHeader>
            <CardTitle className="text-base text-red-800">Bannir l&apos;utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="ban-reason">Raison *</Label>
              <Input
                id="ban-reason"
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Raison du bannissement"
              />
            </div>
            <div>
              <Label htmlFor="ban-notes">Notes internes</Label>
              <Textarea
                id="ban-notes"
                value={banNotes}
                onChange={(e) => setBanNotes(e.target.value)}
                placeholder="Notes internes (optionnel)"
                rows={2}
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={blockEmail}
                onChange={(e) => setBlockEmail(e.target.checked)}
                className="rounded border-gray-300"
              />
              Bloquer la réinscription avec cet email
            </label>
            <div className="flex gap-2 pt-2">
              <Button variant="destructive" size="sm" onClick={handleBan} disabled={loading}>
                {loading ? "..." : "Confirmer le bannissement"}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetForms} disabled={loading}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Unban modal */}
      {modal === "unban" && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-base text-green-800">Débannir l&apos;utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="unban-notes">Notes (optionnel)</Label>
              <Textarea
                id="unban-notes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Raison du débannissement"
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="default" size="sm" onClick={handleUnban} disabled={loading}>
                {loading ? "..." : "Confirmer le débannissement"}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetForms} disabled={loading}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Suspend modal */}
      {modal === "suspend" && (
        <Card className="border-yellow-200 bg-yellow-50/50">
          <CardHeader>
            <CardTitle className="text-base text-yellow-800">Suspendre l&apos;utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="suspend-reason">Raison *</Label>
              <Input
                id="suspend-reason"
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Raison de la suspension"
              />
            </div>
            <div>
              <Label htmlFor="suspend-end">Date de fin *</Label>
              <Input
                id="suspend-end"
                type="date"
                value={suspendEndDate}
                onChange={(e) => setSuspendEndDate(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <Label htmlFor="suspend-notes">Notes internes</Label>
              <Textarea
                id="suspend-notes"
                value={suspendNotes}
                onChange={(e) => setSuspendNotes(e.target.value)}
                placeholder="Notes internes (optionnel)"
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="secondary" size="sm" onClick={handleSuspend} disabled={loading}>
                {loading ? "..." : "Confirmer la suspension"}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetForms} disabled={loading}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reactivate modal */}
      {modal === "reactivate" && (
        <Card className="border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-base text-green-800">Réactiver l&apos;utilisateur</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="reactivate-notes">Notes (optionnel)</Label>
              <Textarea
                id="reactivate-notes"
                value={actionNotes}
                onChange={(e) => setActionNotes(e.target.value)}
                placeholder="Raison de la réactivation"
                rows={2}
              />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="default" size="sm" onClick={handleReactivate} disabled={loading}>
                {loading ? "..." : "Confirmer la réactivation"}
              </Button>
              <Button variant="ghost" size="sm" onClick={resetForms} disabled={loading}>
                Annuler
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
