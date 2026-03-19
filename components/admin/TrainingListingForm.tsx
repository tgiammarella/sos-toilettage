"use client";

import { useRef, useState } from "react";
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
import { Loader2, Trash2, Upload, ImageIcon, X } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";

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
  const [uploading, setUploading] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const { startUpload } = useUploadThing("partnerLogo", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setForm((prev) => ({ ...prev, logoUrl: res[0].ufsUrl }));
        toast.success(lang === "fr" ? "Logo téléversé" : "Logo uploaded");
      }
      setUploading(false);
    },
    onUploadError: (err) => {
      toast.error(err.message || (lang === "fr" ? "Échec du téléversement" : "Upload failed"));
      setUploading(false);
    },
  });

  function handleLogoFile(file: File) {
    if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) {
      toast.error(lang === "fr" ? "Image uniquement, max 4 Mo" : "Image only, max 4 MB");
      return;
    }
    setUploading(true);
    startUpload([file]);
  }

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

      const backPath = form.type === "SCHOOL" && !form.isTrainer
        ? `/${locale}/dashboard/admin/schools`
        : `/${locale}/dashboard/admin/trainings`;

      toast.success(
        isEdit
          ? (lang === "fr" ? "Entrée modifiée" : "Listing updated")
          : (lang === "fr" ? "Entrée créée" : "Listing created"),
      );
      router.push(backPath);
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
      const backPath = form.type === "SCHOOL" && !form.isTrainer
        ? `/${locale}/dashboard/admin/schools`
        : `/${locale}/dashboard/admin/trainings`;
      router.push(backPath);
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
          <div className="space-y-1.5 sm:col-span-2">
            <Label>{lang === "fr" ? "Logo" : "Logo"}</Label>
            <div className="flex items-center gap-4">
              {form.logoUrl ? (
                <div className="relative h-16 w-28 rounded border border-[#CBBBA6] bg-white flex items-center justify-center overflow-hidden">
                  <Image
                    src={form.logoUrl}
                    alt="Logo"
                    width={112}
                    height={64}
                    className="max-h-[56px] w-auto object-contain"
                  />
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                    className="absolute top-0.5 right-0.5 rounded-full bg-white/80 p-0.5 hover:bg-white"
                  >
                    <X className="h-3 w-3 text-[#1F2933]" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => !uploading && logoInputRef.current?.click()}
                  className="h-16 w-28 rounded border-2 border-dashed border-[#CBBBA6] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#055864] hover:bg-[#055864]/5 transition-colors"
                >
                  {uploading ? (
                    <Loader2 className="h-5 w-5 text-[#055864] animate-spin" />
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5 text-[#4a6260]" />
                      <span className="text-[10px] text-[#4a6260]">
                        {lang === "fr" ? "Téléverser" : "Upload"}
                      </span>
                    </>
                  )}
                </div>
              )}
              {form.logoUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => logoInputRef.current?.click()}
                >
                  {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5 mr-1" />}
                  {lang === "fr" ? "Changer" : "Change"}
                </Button>
              )}
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleLogoFile(file);
                e.target.value = "";
              }}
            />
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
          {form.type === "SCHOOL" && !form.isTrainer ? (
            /* School tier picker */
            <>
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Forfait" : "Tier"}</Label>
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
              </div>
              {form.tier !== "GRATUIT" && (
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
            </>
          ) : (
            /* Trainings / independent trainers — free with future commission */
            <div className="space-y-1.5">
              <Label>{lang === "fr" ? "Tarification" : "Pricing"}</Label>
              <div className="rounded-md bg-[#F6EFE6] px-3 py-2.5 text-sm text-[#055864]">
                <p className="font-medium">
                  {lang === "fr" ? "Gratuit" : "Free"}
                </p>
                <p className="text-xs mt-1 text-[#4a6260]">
                  {lang === "fr"
                    ? "Gratuit le premier mois. Par la suite, commission de 10% sur le prix total des formations vendues via la plateforme."
                    : "Free for the first month. After that, 10% commission on total course price sold through the platform."}
                </p>
              </div>
            </div>
          )}
          {form.type === "SCHOOL" && (
            <div className="flex items-center justify-between">
              <Label>{lang === "fr" ? "Formateur indépendant" : "Independent trainer"}</Label>
              <Switch checked={form.isTrainer} onCheckedChange={(v) => {
                setForm((prev) => ({ ...prev, isTrainer: v, tier: v ? "FREE" : "GRATUIT" }));
              }} />
            </div>
          )}
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
        <Button type="submit" disabled={saving || uploading} className="min-w-[160px]">
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
