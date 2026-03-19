"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2, Trash2 } from "lucide-react";

interface ListingData {
  id?: string;
  name: string;
  type: string;
  city: string;
  province: string;
  description: string;
  websiteUrl: string;
  logoUrl: string;
  phone: string;
  email: string;
  tags: string;
  tier: string;
  isTrainer: boolean;
  isFeatured: boolean;
  isActive: boolean;
}

export function TrainingListingForm({
  locale,
  initial,
  defaultType,
  defaultIsTrainer,
}: {
  locale: string;
  initial?: ListingData;
  defaultType?: string;
  defaultIsTrainer?: boolean;
}) {
  const lang = locale === "fr" ? "fr" : "en";
  const router = useRouter();
  const isEdit = !!initial?.id;

  const [form, setForm] = useState<ListingData>({
    name: initial?.name ?? "",
    type: initial?.type ?? defaultType ?? "SCHOOL",
    city: initial?.city ?? "",
    province: initial?.province ?? "",
    description: initial?.description ?? "",
    websiteUrl: initial?.websiteUrl ?? "",
    logoUrl: initial?.logoUrl ?? "",
    phone: initial?.phone ?? "",
    email: initial?.email ?? "",
    tags: initial?.tags ?? "",
    tier: initial?.tier ?? (defaultIsTrainer ? "FREE" : "GRATUIT"),
    isTrainer: initial?.isTrainer ?? defaultIsTrainer ?? false,
    isFeatured: initial?.isFeatured ?? false,
    isActive: initial?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function set(field: keyof ListingData, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.city) {
      toast.error(lang === "fr" ? "Nom et ville requis" : "Name and city required");
      return;
    }

    setSaving(true);
    try {
      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        name: form.name,
        type: form.type,
        city: form.city,
        province: form.province,
        description: form.description || undefined,
        websiteUrl: form.websiteUrl || "",
        logoUrl: form.logoUrl || "",
        phone: form.phone || undefined,
        email: form.email || "",
        tags,
        tier: form.tier,
        isTrainer: form.isTrainer,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
      };

      const url = isEdit
        ? `/api/admin/directory/${initial!.id}`
        : "/api/admin/directory";
      const method = isEdit ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error((body as { error?: string }).error ?? "Erreur");
        return;
      }

      toast.success(
        isEdit
          ? (lang === "fr" ? "Entrée modifiée" : "Listing updated")
          : (lang === "fr" ? "Entrée créée" : "Listing created"),
      );
      router.push(`/${locale}/dashboard/admin/directory`);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirm(lang === "fr" ? "Supprimer cette entrée ?" : "Delete this listing?")) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/directory/${initial!.id}`, { method: "DELETE" });
      if (!res.ok) {
        toast.error(lang === "fr" ? "Erreur lors de la suppression" : "Error deleting");
        return;
      }
      toast.success(lang === "fr" ? "Entrée supprimée" : "Listing deleted");
      router.push(`/${locale}/dashboard/admin/directory`);
      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  const TYPE_LABELS: Record<string, string> = {
    SCHOOL: lang === "fr" ? "École" : "School",
    COURSE: lang === "fr" ? "Formation" : "Course",
    WORKSHOP: lang === "fr" ? "Atelier" : "Workshop",
    CERTIFICATION: lang === "fr" ? "Certification" : "Certification",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">
          {lang === "fr" ? "Informations" : "Details"}
        </CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{lang === "fr" ? "Nom" : "Name"}</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Académie du toilettage" />
          </div>
          <div className="space-y-1.5">
            <Label>{lang === "fr" ? "Type" : "Type"}</Label>
            <Select value={form.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {Object.entries(TYPE_LABELS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>{lang === "fr" ? "Ville" : "City"}</Label>
            <Input value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="Montréal" />
          </div>
          <div className="space-y-1.5">
            <Label>{lang === "fr" ? "Province" : "Province"}</Label>
            <Input value={form.province} onChange={(e) => set("province", e.target.value)} placeholder="Québec" />
          </div>
          <div className="space-y-1.5">
            <Label>{lang === "fr" ? "Site web" : "Website"}</Label>
            <Input value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label>{lang === "fr" ? "URL du logo" : "Logo URL"}</Label>
            <Input value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-1.5">
            <Label>{lang === "fr" ? "Téléphone" : "Phone"}</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="514-…" />
          </div>
          <div className="space-y-1.5">
            <Label>{lang === "fr" ? "Courriel" : "Email"}</Label>
            <Input value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="info@…" />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">
          {lang === "fr" ? "Description & tags" : "Description & tags"}
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label>{lang === "fr" ? "Description" : "Description"}</Label>
            <textarea
              rows={4}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              placeholder={lang === "fr" ? "Décrivez la formation…" : "Describe the program…"}
            />
          </div>
          <div className="space-y-1.5">
            <Label>{lang === "fr" ? "Tags (séparés par virgule)" : "Tags (comma-separated)"}</Label>
            <Input
              value={form.tags}
              onChange={(e) => set("tags", e.target.value)}
              placeholder="Toilettage canin, Certification, etc."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">
          {lang === "fr" ? "Plan & options" : "Plan & options"}
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label>{lang === "fr" ? "Forfait" : "Tier"}</Label>
            {form.isTrainer ? (
              <p className="text-sm text-muted-foreground">
                {lang === "fr"
                  ? "Les formateurs indépendants sont toujours gratuits"
                  : "Independent trainers are always free"}
              </p>
            ) : (
              <Select value={form.tier} onValueChange={(v) => set("tier", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="GRATUIT">
                    {lang === "fr" ? "Gratuit — Nom + lien" : "Free — Name + link"}
                  </SelectItem>
                  <SelectItem value="PARTENAIRE">
                    {lang === "fr" ? "Partenaire — 49$/mois" : "Partner — $49/month"}
                  </SelectItem>
                  <SelectItem value="ELITE">
                    {lang === "fr" ? "Élite — 99$/mois" : "Elite — $99/month"}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
          {!form.isTrainer && form.tier !== "GRATUIT" && (
            <div className="rounded-md bg-[#F6EFE6] px-3 py-2 text-xs text-[#055864]">
              {form.tier === "PARTENAIRE"
                ? (lang === "fr"
                  ? "Profil complet, jusqu'à 20 profils de diplômés, placement prioritaire. Annuel : 490$/an."
                  : "Full profile, up to 20 graduate profiles, priority placement. Annual: $490/year.")
                : (lang === "fr"
                  ? "Tout Partenaire + diplômés illimités, suggestion auto aux salons, 1 mention infolettre/trimestre, 1 publication sociale/trimestre. Annuel : 990$/an."
                  : "Everything in Partner + unlimited graduates, auto-suggested to salons, 1 newsletter mention/quarter, 1 social post/quarter. Annual: $990/year.")}
            </div>
          )}
          <div className="flex items-center justify-between">
            <Label>{lang === "fr" ? "Formateur indépendant" : "Independent trainer"}</Label>
            <Switch checked={form.isTrainer} onCheckedChange={(v) => {
              setForm((prev) => ({ ...prev, isTrainer: v, tier: v ? "FREE" : "GRATUIT" }));
            }} />
          </div>
          <div className="flex items-center justify-between">
            <Label>{lang === "fr" ? "Mise en avant" : "Featured"}</Label>
            <Switch checked={form.isFeatured} onCheckedChange={(v) => set("isFeatured", v)} />
          </div>
          <div className="flex items-center justify-between">
            <Label>{lang === "fr" ? "Actif" : "Active"}</Label>
            <Switch checked={form.isActive} onCheckedChange={(v) => set("isActive", v)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={saving} className="min-w-[160px]">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          {isEdit
            ? (lang === "fr" ? "Enregistrer" : "Save")
            : (lang === "fr" ? "Créer l'entrée" : "Create listing")}
        </Button>
        {isEdit && (
          <Button type="button" variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 mr-1" />}
            {lang === "fr" ? "Supprimer" : "Delete"}
          </Button>
        )}
      </div>
    </form>
  );
}
