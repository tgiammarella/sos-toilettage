"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Star, ExternalLink, X } from "lucide-react";

type Partner = {
  id: string;
  name: string;
  taglineFr: string;
  taglineEn: string;
  website: string;
  logoUrl: string | null;
  category: string;
  featured: boolean;
  isActive: boolean;
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
  featured: false,
  isActive: true,
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

export function PartnersAdmin({ locale }: { locale: string }) {
  const lang = locale === "en" ? "en" : "fr";
  const t = useTranslations("ui");
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partner | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Partner, "id">>(EMPTY);
  const [saving, setSaving] = useState(false);

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
      featured: p.featured,
      isActive: p.isActive,
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
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "URL du logo" : "Logo URL"}</Label>
                <Input
                  value={form.logoUrl ?? ""}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value || null })}
                  placeholder="/partners/logo.png"
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

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.featured}
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
                <Label className="text-sm">{lang === "fr" ? "Vedette" : "Featured"}</Label>
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
              <Button onClick={handleSave} disabled={saving || !form.name}>
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
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm text-[#1F2933]">{p.name}</h3>
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
