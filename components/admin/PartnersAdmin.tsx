"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Star, ExternalLink, X, Upload, Loader2, ImageIcon, Search, CheckCircle, Clock, Users } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing";
import { PartnerBadge } from "@/components/ui/PartnerBadge";
import Image from "next/image";

type Partner = {
  id: string;
  name: string;
  taglineFr: string;
  taglineEn: string;
  descriptionFr: string;
  descriptionEn: string;
  website: string;
  logoUrl: string | null;
  phone: string | null;
  city: string;
  region: string;
  category: string;
  tier: string;
  launchPricing: boolean;
  lockedMonthlyRate: number | null;
  memberDiscountPercent: number | null;
  instagramUrl: string | null;
  facebookUrl: string | null;
  tiktokUrl: string | null;
  photos: string;
  tags: string;
  bannerImageUrl: string | null;
  featured: boolean;
  isActive: boolean;
  isApproved: boolean;
  promoCode: string | null;
  promoDescFr: string | null;
  promoDescEn: string | null;
  sponsoredContentNote: string | null;
  mlCollabNote: string | null;
};

const EMPTY: Omit<Partner, "id"> = {
  name: "",
  taglineFr: "",
  taglineEn: "",
  descriptionFr: "",
  descriptionEn: "",
  website: "",
  logoUrl: null,
  phone: null,
  city: "",
  region: "",
  category: "brand",
  tier: "DECOUVERTE",
  launchPricing: false,
  lockedMonthlyRate: null,
  memberDiscountPercent: null,
  instagramUrl: null,
  facebookUrl: null,
  tiktokUrl: null,
  photos: "[]",
  tags: "[]",
  bannerImageUrl: null,
  featured: false,
  isActive: true,
  isApproved: false,
  promoCode: null,
  promoDescFr: null,
  promoDescEn: null,
  sponsoredContentNote: null,
  mlCollabNote: null,
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
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTier, setFilterTier] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterApproval, setFilterApproval] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
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

  const [uploadingPhotos, setUploadingPhotos] = useState(false);
  const photosInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const { startUpload: startPhotoUpload } = useUploadThing("partnerPhotos", {
    onClientUploadComplete: (res) => {
      if (res?.length) {
        const currentPhotos: string[] = (() => {
          try { const p = JSON.parse(form.photos || "[]"); return Array.isArray(p) ? p : []; }
          catch { return []; }
        })();
        const newUrls = res.map(r => r.ufsUrl);
        setForm((prev) => ({ ...prev, photos: JSON.stringify([...currentPhotos, ...newUrls]) }));
        toast.success(lang === "fr" ? `${res.length} photo(s) ajoutée(s)` : `${res.length} photo(s) added`);
      }
      setUploadingPhotos(false);
    },
    onUploadError: (err) => {
      toast.error(err.message || (lang === "fr" ? "Échec du téléversement" : "Upload failed"));
      setUploadingPhotos(false);
    },
  });

  const { startUpload: startBannerUpload } = useUploadThing("partnerPhotos", {
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        setForm((prev) => ({ ...prev, bannerImageUrl: res[0].ufsUrl }));
        toast.success(lang === "fr" ? "Bannière téléversée" : "Banner uploaded");
      }
      setUploadingBanner(false);
    },
    onUploadError: (err) => {
      toast.error(err.message || (lang === "fr" ? "Échec du téléversement" : "Upload failed"));
      setUploadingBanner(false);
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
      descriptionFr: p.descriptionFr,
      descriptionEn: p.descriptionEn,
      website: p.website,
      logoUrl: p.logoUrl,
      phone: p.phone,
      city: p.city,
      region: p.region,
      category: p.category,
      tier: p.tier,
      launchPricing: p.launchPricing,
      lockedMonthlyRate: p.lockedMonthlyRate,
      memberDiscountPercent: p.memberDiscountPercent,
      instagramUrl: p.instagramUrl,
      facebookUrl: p.facebookUrl,
      tiktokUrl: p.tiktokUrl,
      photos: p.photos,
      tags: p.tags,
      bannerImageUrl: p.bannerImageUrl,
      featured: p.featured,
      isActive: p.isActive,
      isApproved: p.isApproved,
      promoCode: p.promoCode,
      promoDescFr: p.promoDescFr,
      promoDescEn: p.promoDescEn,
      sponsoredContentNote: p.sponsoredContentNote,
      mlCollabNote: p.mlCollabNote,
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

  async function toggleFeatured(p: Partner) {
    await fetch(`/api/admin/partners/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ featured: !p.featured }),
    });
    fetchPartners();
  }

  // Stats
  const stats = useMemo(() => {
    const total = partners.length;
    const pending = partners.filter(p => !p.isApproved).length;
    const byTier = {
      DECOUVERTE: partners.filter(p => p.tier === "DECOUVERTE").length,
      VEDETTE: partners.filter(p => p.tier === "VEDETTE").length,
      SIGNATURE: partners.filter(p => p.tier === "SIGNATURE").length,
    };
    const active = partners.filter(p => p.isActive).length;
    return { total, pending, byTier, active };
  }, [partners]);

  // Filtered list
  const filteredPartners = useMemo(() => {
    let result = partners;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.taglineFr.toLowerCase().includes(q) ||
        p.taglineEn.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }
    if (filterTier) result = result.filter(p => p.tier === filterTier);
    if (filterCategory) result = result.filter(p => p.category === filterCategory);
    if (filterApproval === "approved") result = result.filter(p => p.isApproved);
    if (filterApproval === "pending") result = result.filter(p => !p.isApproved);
    return result;
  }, [partners, searchQuery, filterTier, filterCategory, filterApproval]);

  const hasActiveFilters = !!(searchQuery || filterTier || filterCategory || filterApproval);

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

              {/* Contact */}
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Ville" : "City"}</Label>
                <Input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Région" : "Region"}</Label>
                <Input
                  value={form.region}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{lang === "fr" ? "Téléphone" : "Phone"}</Label>
                <Input
                  value={form.phone ?? ""}
                  onChange={(e) => setForm({ ...form, phone: e.target.value || null })}
                  placeholder="514-..."
                />
              </div>

              {/* Descriptions */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{lang === "fr" ? "Description complète (FR)" : "Full description (FR)"}</Label>
                <textarea
                  rows={3}
                  value={form.descriptionFr}
                  onChange={(e) => setForm({ ...form, descriptionFr: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{lang === "fr" ? "Description complète (EN)" : "Full description (EN)"}</Label>
                <textarea
                  rows={3}
                  value={form.descriptionEn}
                  onChange={(e) => setForm({ ...form, descriptionEn: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
                />
              </div>

              {/* Social links */}
              <div className="space-y-1.5">
                <Label>Instagram</Label>
                <Input
                  value={form.instagramUrl ?? ""}
                  onChange={(e) => setForm({ ...form, instagramUrl: e.target.value || null })}
                  placeholder="https://instagram.com/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>Facebook</Label>
                <Input
                  value={form.facebookUrl ?? ""}
                  onChange={(e) => setForm({ ...form, facebookUrl: e.target.value || null })}
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div className="space-y-1.5">
                <Label>TikTok</Label>
                <Input
                  value={form.tiktokUrl ?? ""}
                  onChange={(e) => setForm({ ...form, tiktokUrl: e.target.value || null })}
                  placeholder="https://tiktok.com/@..."
                />
              </div>

              {/* Tags */}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>{lang === "fr" ? "Tags (séparés par virgule)" : "Tags (comma-separated)"}</Label>
                <Input
                  value={(() => { try { const t = JSON.parse(form.tags || "[]"); return Array.isArray(t) ? t.join(", ") : ""; } catch { return form.tags; } })()}
                  onChange={(e) => {
                    const arr = e.target.value.split(",").map(t => t.trim()).filter(Boolean);
                    setForm({ ...form, tags: JSON.stringify(arr) });
                  }}
                  placeholder="Toilettage, Produits, etc."
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

              {/* Photo gallery (Vedette + Signature) */}
              {(form.tier === "VEDETTE" || form.tier === "SIGNATURE") && (
                <div className="space-y-2 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <Label>
                      {lang === "fr" ? "Photos" : "Photos"}
                      <span className="text-xs text-[#4a6260] ml-1.5">
                        ({form.tier === "SIGNATURE" ? "max 10" : "max 5"})
                      </span>
                    </Label>
                    {(() => {
                      const currentPhotos: string[] = (() => {
                        try { const p = JSON.parse(form.photos || "[]"); return Array.isArray(p) ? p : []; }
                        catch { return []; }
                      })();
                      const max = form.tier === "SIGNATURE" ? 10 : 5;
                      return currentPhotos.length < max ? (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={uploadingPhotos}
                          onClick={() => photosInputRef.current?.click()}
                        >
                          {uploadingPhotos ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" /> : <Plus className="h-3.5 w-3.5 mr-1" />}
                          {lang === "fr" ? "Ajouter" : "Add"}
                        </Button>
                      ) : null;
                    })()}
                  </div>
                  {(() => {
                    const currentPhotos: string[] = (() => {
                      try { const p = JSON.parse(form.photos || "[]"); return Array.isArray(p) ? p : []; }
                      catch { return []; }
                    })();
                    return currentPhotos.length > 0 ? (
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {currentPhotos.map((url, i) => (
                          <div key={i} className="relative aspect-square rounded-lg border border-[#CBBBA6] overflow-hidden group">
                            <Image src={url} alt="" fill className="object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                const updated = currentPhotos.filter((_, idx) => idx !== i);
                                setForm({ ...form, photos: JSON.stringify(updated) });
                              }}
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div
                        onClick={() => !uploadingPhotos && photosInputRef.current?.click()}
                        className="h-24 rounded-lg border-2 border-dashed border-[#CBBBA6] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#055864] hover:bg-[#055864]/5 transition-colors"
                      >
                        {uploadingPhotos ? (
                          <Loader2 className="h-5 w-5 text-[#055864] animate-spin" />
                        ) : (
                          <>
                            <ImageIcon className="h-5 w-5 text-[#4a6260]" />
                            <span className="text-xs text-[#4a6260]">
                              {lang === "fr" ? "Ajouter des photos" : "Add photos"}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })()}
                  <input
                    ref={photosInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = e.target.files;
                      if (files?.length) {
                        const currentPhotos: string[] = (() => {
                          try { const p = JSON.parse(form.photos || "[]"); return Array.isArray(p) ? p : []; }
                          catch { return []; }
                        })();
                        const max = form.tier === "SIGNATURE" ? 10 : 5;
                        const remaining = max - currentPhotos.length;
                        const toUpload = Array.from(files).slice(0, remaining);
                        if (toUpload.length > 0) {
                          setUploadingPhotos(true);
                          startPhotoUpload(toUpload);
                        }
                      }
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

              {/* Banner image (Signature only) */}
              {form.tier === "SIGNATURE" && (
                <div className="space-y-2 sm:col-span-2">
                  <Label>{lang === "fr" ? "Image bannière" : "Banner image"}</Label>
                  {form.bannerImageUrl ? (
                    <div className="relative h-32 w-full rounded-lg border border-[#CBBBA6] overflow-hidden">
                      <Image src={form.bannerImageUrl} alt="" fill className="object-cover" />
                      <div className="absolute top-2 right-2 flex gap-1">
                        <button
                          type="button"
                          onClick={() => !uploadingBanner && bannerInputRef.current?.click()}
                          className="h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, bannerImageUrl: null })}
                          className="h-6 w-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => !uploadingBanner && bannerInputRef.current?.click()}
                      className="h-24 rounded-lg border-2 border-dashed border-[#CBBBA6] flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-[#055864] hover:bg-[#055864]/5 transition-colors"
                    >
                      {uploadingBanner ? (
                        <Loader2 className="h-5 w-5 text-[#055864] animate-spin" />
                      ) : (
                        <>
                          <ImageIcon className="h-5 w-5 text-[#4a6260]" />
                          <span className="text-xs text-[#4a6260]">
                            {lang === "fr" ? "Ajouter une bannière" : "Add banner"}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={bannerInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (!file.type.startsWith("image/") || file.size > 4 * 1024 * 1024) {
                          toast.error(lang === "fr" ? "Image uniquement, max 4 Mo" : "Image only, max 4 MB");
                          return;
                        }
                        setUploadingBanner(true);
                        startBannerUpload([file]);
                      }
                      e.target.value = "";
                    }}
                  />
                </div>
              )}

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

            {/* Internal notes (admin only) */}
            <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-4 space-y-3">
              <p className="text-xs font-semibold text-amber-700">
                {lang === "fr" ? "Notes internes (jamais affichées publiquement)" : "Internal notes (never displayed publicly)"}
              </p>
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "fr" ? "Note contenu sponsorisé" : "Sponsored content note"}</Label>
                <textarea
                  rows={2}
                  value={form.sponsoredContentNote ?? ""}
                  onChange={(e) => setForm({ ...form, sponsoredContentNote: e.target.value || null })}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{lang === "fr" ? "Note collaboration ML" : "ML collaboration note"}</Label>
                <textarea
                  rows={2}
                  value={form.mlCollabNote ?? ""}
                  onChange={(e) => setForm({ ...form, mlCollabNote: e.target.value || null })}
                  className="w-full rounded-md border border-input bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-y"
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

      {/* Stats bar */}
      {!loading && partners.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="shadow-none">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-[#055864]/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-[#055864]" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#1F2933]">{stats.total}</p>
                <p className="text-[10px] text-[#4a6260] uppercase tracking-wide">
                  {lang === "fr" ? "Total" : "Total"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-amber-100 flex items-center justify-center">
                <Clock className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#1F2933]">{stats.pending}</p>
                <p className="text-[10px] text-[#4a6260] uppercase tracking-wide">
                  {lang === "fr" ? "En attente" : "Pending"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardContent className="py-3 px-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-[#1F2933]">{stats.active}</p>
                <p className="text-[10px] text-[#4a6260] uppercase tracking-wide">
                  {lang === "fr" ? "Actifs" : "Active"}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-none">
            <CardContent className="py-3 px-4">
              <div className="flex gap-3 text-xs">
                {(["DECOUVERTE", "VEDETTE", "SIGNATURE"] as const).map(tier => (
                  <div key={tier} className="flex items-center gap-1.5">
                    <span className={`inline-block h-2 w-2 rounded-full ${
                      tier === "DECOUVERTE" ? "bg-gray-400" : tier === "VEDETTE" ? "bg-blue-500" : "bg-purple-500"
                    }`} />
                    <span className="text-[#4a6260]">{stats.byTier[tier]}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-[#4a6260] uppercase tracking-wide mt-1">
                {lang === "fr" ? "Par forfait" : "By tier"}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Pending approval banner */}
      {!loading && stats.pending > 0 && !showForm && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-800">
              {lang === "fr"
                ? `${stats.pending} partenaire${stats.pending > 1 ? "s" : ""} en attente d'approbation`
                : `${stats.pending} partner${stats.pending > 1 ? "s" : ""} pending approval`}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="border-amber-300 text-amber-700 hover:bg-amber-100"
            onClick={() => {
              setFilterApproval("pending");
              setFilterTier(null);
              setFilterCategory(null);
              setSearchQuery("");
            }}
          >
            {lang === "fr" ? "Voir" : "View"}
          </Button>
        </div>
      )}

      {/* Filters */}
      {!loading && partners.length > 0 && !showForm && (
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 min-w-0 w-full sm:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4a6260]" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={lang === "fr" ? "Rechercher…" : "Search…"}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            <select
              value={filterTier ?? ""}
              onChange={(e) => setFilterTier(e.target.value || null)}
              className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="">{lang === "fr" ? "Tous forfaits" : "All tiers"}</option>
              {(["DECOUVERTE", "VEDETTE", "SIGNATURE"] as const).map(tier => (
                <option key={tier} value={tier}>{TIER_CONFIG[tier].label[lang]}</option>
              ))}
            </select>
            <select
              value={filterCategory ?? ""}
              onChange={(e) => setFilterCategory(e.target.value || null)}
              className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="">{lang === "fr" ? "Toutes catégories" : "All categories"}</option>
              {Object.entries(CATEGORY_LABELS).map(([v, lbl]) => (
                <option key={v} value={v}>{lbl[lang]}</option>
              ))}
            </select>
            <select
              value={filterApproval ?? ""}
              onChange={(e) => setFilterApproval(e.target.value || null)}
              className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <option value="">{lang === "fr" ? "Tous statuts" : "All statuses"}</option>
              <option value="approved">{lang === "fr" ? "Approuvés" : "Approved"}</option>
              <option value="pending">{lang === "fr" ? "En attente" : "Pending"}</option>
            </select>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-[#4a6260]"
                onClick={() => {
                  setSearchQuery("");
                  setFilterTier(null);
                  setFilterCategory(null);
                  setFilterApproval(null);
                }}
              >
                <X className="h-3 w-3 mr-1" />
                {lang === "fr" ? "Réinitialiser" : "Clear"}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-sm text-[#4a6260]">{lang === "fr" ? "Chargement…" : "Loading…"}</p>
      ) : partners.length === 0 ? (
        <p className="text-sm text-[#4a6260]">
          {lang === "fr" ? "Aucun partenaire. Cliquez sur « Ajouter » pour commencer." : "No partners yet. Click \"Add\" to get started."}
        </p>
      ) : filteredPartners.length === 0 ? (
        <p className="text-sm text-[#4a6260] py-8 text-center">
          {lang === "fr" ? "Aucun résultat pour ces filtres." : "No results for these filters."}
        </p>
      ) : (
        <div className="rounded-lg border border-[#CBBBA6] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#F6EFE6] border-b border-[#CBBBA6]">
                  <th className="text-left px-4 py-2.5 font-medium text-[#1F2933] text-xs">{lang === "fr" ? "Partenaire" : "Partner"}</th>
                  <th className="text-left px-3 py-2.5 font-medium text-[#1F2933] text-xs hidden sm:table-cell">{lang === "fr" ? "Forfait" : "Tier"}</th>
                  <th className="text-left px-3 py-2.5 font-medium text-[#1F2933] text-xs hidden md:table-cell">{lang === "fr" ? "Catégorie" : "Category"}</th>
                  <th className="text-left px-3 py-2.5 font-medium text-[#1F2933] text-xs hidden lg:table-cell">{lang === "fr" ? "Ville" : "City"}</th>
                  <th className="text-center px-3 py-2.5 font-medium text-[#1F2933] text-xs hidden md:table-cell">{lang === "fr" ? "Statut" : "Status"}</th>
                  <th className="text-right px-4 py-2.5 font-medium text-[#1F2933] text-xs">{lang === "fr" ? "Actions" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#CBBBA6]/50">
                {filteredPartners.map((p) => (
                  <tr
                    key={p.id}
                    className={`hover:bg-[#F6EFE6]/50 transition-colors ${!p.isActive ? "opacity-50" : ""}`}
                  >
                    {/* Partner name + logo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.logoUrl ? (
                          <div className="h-8 w-8 rounded border border-[#CBBBA6] bg-white flex items-center justify-center overflow-hidden shrink-0">
                            <Image src={p.logoUrl} alt={p.name} width={28} height={28} className="max-h-[24px] w-auto object-contain" />
                          </div>
                        ) : (
                          <div className="h-8 w-8 rounded bg-[#055864] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium text-[#1F2933] text-sm truncate">{p.name}</p>
                            {p.featured && <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />}
                          </div>
                          <p className="text-xs text-[#4a6260] truncate max-w-[200px]">
                            {lang === "fr" ? p.taglineFr : p.taglineEn}
                          </p>
                          {/* Mobile-only badges */}
                          <div className="flex gap-1 mt-1 sm:hidden">
                            {TIER_CONFIG[p.tier] && (
                              <Badge className={`text-[10px] px-1.5 py-0 ${TIER_CONFIG[p.tier].className}`}>
                                {TIER_CONFIG[p.tier].label[lang]}
                              </Badge>
                            )}
                            {!p.isApproved && (
                              <Badge className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700">
                                <Clock className="h-2.5 w-2.5 mr-0.5" />
                                {lang === "fr" ? "En attente" : "Pending"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Tier */}
                    <td className="px-3 py-3 hidden sm:table-cell">
                      <div className="flex items-center gap-1.5">
                        {TIER_CONFIG[p.tier] && (
                          <Badge className={`text-xs ${TIER_CONFIG[p.tier].className}`}>
                            {TIER_CONFIG[p.tier].label[lang]}
                          </Badge>
                        )}
                        <PartnerBadge tier={p.tier} size="sm" />
                      </div>
                      {p.launchPricing && (
                        <span className="block text-[10px] text-emerald-600 mt-0.5">
                          {lang === "fr" ? "Fondateur" : "Founder"}
                        </span>
                      )}
                    </td>
                    {/* Category */}
                    <td className="px-3 py-3 hidden md:table-cell">
                      <Badge variant="outline" className="text-xs">
                        {CATEGORY_LABELS[p.category]?.[lang] ?? p.category}
                      </Badge>
                    </td>
                    {/* City */}
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <span className="text-xs text-[#4a6260]">{p.city || "—"}</span>
                    </td>
                    {/* Status */}
                    <td className="px-3 py-3 text-center hidden md:table-cell">
                      <div className="flex flex-col items-center gap-1">
                        {p.isApproved ? (
                          <Badge className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            <CheckCircle className="h-2.5 w-2.5 mr-0.5" />
                            {lang === "fr" ? "Approuvé" : "Approved"}
                          </Badge>
                        ) : (
                          <Badge className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                            <Clock className="h-2.5 w-2.5 mr-0.5" />
                            {lang === "fr" ? "En attente" : "Pending"}
                          </Badge>
                        )}
                        {!p.isActive && (
                          <Badge variant="secondary" className="text-[10px]">
                            {lang === "fr" ? "Inactif" : "Inactive"}
                          </Badge>
                        )}
                        {p.promoCode && (
                          <span className="text-[10px] text-[#055864] font-mono">{p.promoCode}</span>
                        )}
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-0.5">
                        {p.website && (
                          <a href={p.website} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Button>
                          </a>
                        )}
                        {!p.isApproved && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 text-emerald-600 hover:text-emerald-700"
                            onClick={async () => {
                              await fetch(`/api/admin/partners/${p.id}`, {
                                method: "PATCH",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ isApproved: true }),
                              });
                              toast.success(lang === "fr" ? "Partenaire approuvé" : "Partner approved");
                              fetchPartners();
                            }}
                            title={lang === "fr" ? "Approuver" : "Approve"}
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => toggleFeatured(p)}>
                          <Star className={`h-3.5 w-3.5 ${p.featured ? "fill-amber-500 text-amber-500" : ""}`} />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(p)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                          onClick={() => setDeleteConfirm(p.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Results count */}
          <div className="bg-[#F6EFE6]/50 px-4 py-2 border-t border-[#CBBBA6]/50">
            <p className="text-xs text-[#4a6260]">
              {hasActiveFilters
                ? (lang === "fr"
                    ? `${filteredPartners.length} résultat${filteredPartners.length > 1 ? "s" : ""} sur ${partners.length}`
                    : `${filteredPartners.length} of ${partners.length} result${filteredPartners.length > 1 ? "s" : ""}`)
                : (lang === "fr"
                    ? `${partners.length} partenaire${partners.length > 1 ? "s" : ""}`
                    : `${partners.length} partner${partners.length > 1 ? "s" : ""}`)}
            </p>
          </div>
        </div>
      )}

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDeleteConfirm(null)}>
          <Card className="max-w-sm w-full shadow-lg" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-[#1F2933] text-sm">
                    {lang === "fr" ? "Supprimer ce partenaire ?" : "Delete this partner?"}
                  </h3>
                  <p className="text-xs text-[#4a6260] mt-1">
                    {lang === "fr"
                      ? "Le partenaire sera désactivé (suppression douce). Il pourra être restauré si nécessaire pour des litiges de facturation."
                      : "The partner will be deactivated (soft delete). It can be restored if needed for billing disputes."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirm(null)}>
                  {lang === "fr" ? "Annuler" : "Cancel"}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    const id = deleteConfirm;
                    setDeleteConfirm(null);
                    const res = await fetch(`/api/admin/partners/${id}`, { method: "DELETE" });
                    if (res.ok) {
                      toast.success(lang === "fr" ? "Partenaire supprimé" : "Partner deleted");
                      fetchPartners();
                    } else {
                      toast.error(t("error_generic"));
                    }
                  }}
                >
                  {lang === "fr" ? "Supprimer" : "Delete"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
