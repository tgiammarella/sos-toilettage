"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Star, ExternalLink, X, Upload, Loader2, ImageIcon } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";

type Partner = {
  id: string;
  name: string;
  taglineFr: string;
  taglineEn: string;
  website: string;
  logoUrl: string | null;
  category: string;
  tier: string;
  launchPricing: boolean;
  lockedMonthlyRate: number | null;
  memberDiscountPercent: number | null;
  featured: boolean;
  isActive: boolean;
  isApproved: boolean;
  promoCode: string | null;
  promoDescFr: string | null;
  promoDescEn: string | null;
};

const EMPTY: Omit<Partner, "id"> = {
  name: "",
  taglineFr: "",
  taglineEn: "",
  website: "",
  logoUrl: null,
  category: "brand",
  tier: "DECOUVERTE",
  launchPricing: false,
  lockedMonthlyRate: null,
  memberDiscountPercent: null,
  featured: false,
  isActive: true,
  isApproved: false,
  promoCode: null,
  promoDescFr: null,
  promoDescEn: null,
};

const CATEGORY_LABELS: Record<string, { fr: string; en: string }> = {
  brand: { fr: "Marque", en: "Brand" },
  school: { fr: "École", en: "School" },
  tech: { fr: "Technologie", en: "Tech" },
  industry: { fr: "Industrie", en: "Industry" },
};

const TIER_CONFIG: Record<string, { label: Record<string, string>; className: string; price: string }> = {
  DECOUVERTE: { label: { fr: "Découverte", en: "Discovery" }, className: "bg-gray-100 text-gray-700", price: "Gratuit / Free" },
  VEDETTE:    { label: { fr: "Vedette",    en: "Spotlight" }, className: "bg-blue-50 text-blue-700",   price: "29$/mo" },
  SIGNATURE:  { label: { fr: "Signature",  en: "Signature" }, className: "bg-purple-50 text-purple-700", price: "59$/mo" },
};

export function PartnersAdmin({ locale }: { locale: string }) {
  const lang = locale === "en" ? "en" : "fr";
  const t = useTranslations("ui");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Partner, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);
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

  async function fetchPartners() {
    const res = await fetch("/api/admin/partners");
    if (res.ok) {
      setPartners(await res.json());
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchPartners();
  }, []);

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setCreating(true);
  }

  function openEdit(p: Partner) {
    setCreating(false);
    setEditing(p);
    setForm({
      name: p.name,
      taglineFr: p.taglineFr,
      taglineEn: p.taglineEn,
      website: p.website,
      logoUrl: p.logoUrl,
      category: p.category,
      tier: p.tier,
      launchPricing: p.launchPricing,
      lockedMonthlyRate: p.lockedMonthlyRate,
      memberDiscountPercent: p.memberDiscountPercent,
      featured: p.featured,
      isActive: p.isActive,
      isApproved: p.isApproved,
      promoCode: p.promoCode,
      promoDescFr: p.promoDescFr,
      promoDescEn: p.promoDescEn,
    });
  }

  function closeForm() {
    setCreating(false);
    setEditing(null);
  }

  async function handleSave() {
    setSaving(true);
    try {
      const url = editing
        ? `/api/admin/partners/${editing.id}`
        : "/api/admin/partners";
      const method = editing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        toast.error(t("error_generic"));
        return;
      }

      toast.success(editing ? lang === "fr" ? "Partenaire mis à jour" : "Partner updated" : lang === "fr" ? "Partenaire ajouté" : "Partner added");
      closeForm();
      fetchPartners();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm(lang === "fr" ? "Supprimer ce partenaire ?" : "Delete this partner?")) return;
    const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
    if (res.ok) {
      toast.success(lang === "fr" ? "Partenaire supprimé" : "Partner deleted");
      fetchPartners();
    } else {
      toast.error(t("error_generic"));
    }
  }

  async function toggleFeatured(p: Partner) {
    await fetch(`/api/admin/partners/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !p.featured }),
    });
    fetchPartners();
  }

  async function toggleActive(p: Partner) {
    await fetch(`/api/admin/partners/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !p.isActive }),
    });
    fetchPartners();
  }

  const showForm = creating || editing;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1F2933]">
          {lang === "fr" ? "Partenaires" : "Partners"}
        </h1>
        <Button onClick={openCreate} size="sm">
          <Plus className="h-4 w-4 mr-1.5" />
          {lang === "fr" ? "Ajouter" : "Add"}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="border-[#055864]">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-[#1F2933]">
                {editing
                  ? (lang === "fr" ? "Modifier le partenaire" : "Edit partner")
                  : (lang === "fr" ? "Nouveau partenaire" : "New partner")}
              </h2>
              <Button variant="ghost" size="sm" onClick={closeForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Nom" : "Name"} *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Site web" : "Website"}</Label>
                <Input
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Description (FR)" : "Tagline (FR)"}</Label>
                <Input
                  value={form.taglineFr}
                  onChange={(e) => setForm({ ...form, taglineFr: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Description (EN)" : "Tagline (EN)"}</Label>
                <Input
                  value={form.taglineEn}
                  onChange={(e) => setForm({ ...form, taglineEn: e.target.value })}
                />
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
                        onClick={() => setForm({ ...form, logoUrl: null })}
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
                <Label>{lang === "fr" ? "Catégorie" : "Category"}</Label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
                >
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label[lang]}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Code promo" : "Promo code"}</Label>
                <Input
                  value={form.promoCode ?? ""}
                  onChange={(e) => setForm({ ...form, promoCode: e.target.value || null })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Promo desc (FR)" : "Promo desc (FR)"}</Label>
                <Input
                  value={form.promoDescFr ?? ""}
                  onChange={(e) => setForm({ ...form, promoDescFr: e.target.value || null })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Promo desc (EN)" : "Promo desc (EN)"}</Label>
                <Input
                  value={form.promoDescEn ?? ""}
                  onChange={(e) => setForm({ ...form, promoDescEn: e.target.value || null })}
                />
              </div>
            </div>

            {/* Tier picker */}
            <div className="space-y-3 rounded-lg border border-[#CBBBA6] p-4">
              <Label className="text-sm font-semibold">{lang === "fr" ? "Forfait" : "Tier"}</Label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["DECOUVERTE", "VEDETTE", "SIGNATURE"] as const).map((tierKey) => {
                  const cfg = TIER_CONFIG[tierKey];
                  const selected = form.tier === tierKey;
                  return (
                    <button
                      key={tierKey}
                      type="button"
                      onClick={() => setForm({ ...form, tier: tierKey })}
                      className={`rounded-lg border-2 p-3 text-left transition-colors ${
                        selected
                          ? "border-[#055864] bg-[#055864]/5"
                          : "border-[#CBBBA6] hover:border-[#055864]/50"
                      }`}
                    >
                      <p className="font-medium text-sm text-[#1F2933]">{cfg.label[lang]}</p>
                      <p className="text-xs text-[#4a6260] mt-0.5">{cfg.price}</p>
                    </button>
                  );
                })}
              </div>
              {form.tier === "DECOUVERTE" && (
                <div className="rounded-md bg-[#F6EFE6] px-3 py-2 text-xs text-[#055864]">
                  {lang === "fr"
                    ? "Listé dans le répertoire. Doit offrir un rabais membre de 10–15% (obligatoire)."
                    : "Listed in directory. Must offer a 10–15% member discount (required)."}
                </div>
              )}
              {form.tier === "VEDETTE" && (
                <div className="rounded-md bg-[#F6EFE6] px-3 py-2 text-xs text-[#055864]">
                  {lang === "fr"
                    ? "Profil complet + photos, placement prioritaire, mentions infolettre. Aucun rabais requis."
                    : "Full profile + photos, priority placement, newsletter mentions. No discount required."}
                </div>
              )}
              {form.tier === "SIGNATURE" && (
                <div className="rounded-md bg-[#F6EFE6] px-3 py-2 text-xs text-[#055864]">
                  {lang === "fr"
                    ? "Tout Vedette + placement top de catégorie + accès prioritaire inventaire pub. Places limitées."
                    : "Everything in Spotlight + top-of-category placement + priority ad inventory access. Limited spots."}
                </div>
              )}
              {form.tier === "DECOUVERTE" && (
                <div className="space-y-1.5">
                  <Label className="text-xs">{lang === "fr" ? "Rabais membre (%)" : "Member discount (%)"} *</Label>
                  <Input
                    type="number"
                    min={10}
                    max={15}
                    value={form.memberDiscountPercent ?? ""}
                    onChange={(e) => setForm({ ...form, memberDiscountPercent: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="10-15"
                    className="w-24"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.launchPricing}
                  onCheckedChange={(v) => setForm({ ...form, launchPricing: v })}
                />
                <Label className="text-sm">{lang === "fr" ? "Tarif fondateur" : "Launch pricing"}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isApproved}
                  onCheckedChange={(v) => setForm({ ...form, isApproved: v })}
                />
                <Label className="text-sm">{lang === "fr" ? "Approuvé" : "Approved"}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
                <Label className="text-sm">{lang === "fr" ? "Mise en avant" : "Featured"}</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setForm({ ...form, isActive: v })}
                />
                <Label className="text-sm">{lang === "fr" ? "Actif" : "Active"}</Label>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={handleSave} disabled={saving || uploading || !form.name}>
                {saving ? t("saving") : t("save")}
              </Button>
              <Button variant="ghost" onClick={closeForm}>
                {t("cancel")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <p className="text-sm text-[#4a6260]">{lang === "fr" ? "Chargement…" : "Loading…"}</p>
      ) : partners.length === 0 ? (
        <p className="text-sm text-[#4a6260]">
          {lang === "fr" ? "Aucun partenaire. Cliquez sur « Ajouter » pour commencer." : "No partners yet. Click \"Add\" to get started."}
        </p>
      ) : (
        <div className="space-y-3">
          {partners.map((p) => (
            <Card key={p.id} className={`shadow-none ${!p.isActive ? "opacity-50" : ""}`}>
              <CardContent className="py-4 px-5">
                <div className="flex items-center gap-4">
                  {p.logoUrl && (
                    <div className="h-10 w-16 rounded border border-[#CBBBA6] bg-white flex items-center justify-center overflow-hidden shrink-0">
                      <Image src={p.logoUrl} alt={p.name} width={60} height={36} className="max-h-[32px] w-auto object-contain" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-[#1F2933]">{p.name}</h3>
                      {TIER_CONFIG[p.tier] && (
                        <Badge className={`text-xs ${TIER_CONFIG[p.tier].className}`}>
                          {TIER_CONFIG[p.tier].label[lang]}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_LABELS[p.category]?.[lang] ?? p.category}
                      </Badge>
                      {p.featured && (
                        <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200">
                          <Star className="h-3 w-3 mr-0.5 fill-amber-500" />
                          {lang === "fr" ? "Vedette" : "Featured"}
                        </Badge>
                      )}
                      {!p.isActive && (
                        <Badge variant="secondary" className="text-xs">
                          {lang === "fr" ? "Inactif" : "Inactive"}
                        </Badge>
                      )}
                      {p.promoCode && (
                        <Badge variant="secondary" className="text-xs bg-[#F6EFE6] text-[#055864]">
                          {p.promoCode}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-[#4a6260] mt-0.5 truncate">
                      {lang === "fr" ? p.taglineFr : p.taglineEn}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.website && (
                      <a href={p.website} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </a>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => toggleFeatured(p)}>
                      <Star className={`h-3.5 w-3.5 ${p.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} className="text-destructive hover:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
