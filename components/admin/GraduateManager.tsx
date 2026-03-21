"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  X,
  GraduationCap,
  Check,
} from "lucide-react";

// ── Constants ────────────────────────────────────────────────────────────────

const REGIONS = [
  "Abitibi-Témiscamingue",
  "Bas-Saint-Laurent",
  "Capitale-Nationale",
  "Centre-du-Québec",
  "Chaudière-Appalaches",
  "Côte-Nord",
  "Estrie",
  "Gaspésie–Îles-de-la-Madeleine",
  "Lanaudière",
  "Laurentides",
  "Laval",
  "Mauricie",
  "Montérégie",
  "Montréal",
  "Nord-du-Québec",
  "Outaouais",
  "Saguenay–Lac-Saint-Jean",
];

const SPECIALTIES = [
  "Bain/Séchage",
  "Coupe au ciseau",
  "Tondeuse",
  "Félin",
  "Nordique",
  "Créatif",
];

// ── Types ────────────────────────────────────────────────────────────────────

interface Graduate {
  id: string;
  firstName: string;
  lastName: string;
  graduationYear: number;
  regionQc: string;
  specialties: string[];
  bio: string | null;
  isAvailable: boolean;
  isVisible: boolean;
}

interface GraduateFormData {
  firstName: string;
  lastName: string;
  graduationYear: number;
  regionQc: string;
  specialties: string[];
  bio: string;
  isAvailable: boolean;
  isVisible: boolean;
}

const emptyForm: GraduateFormData = {
  firstName: "",
  lastName: "",
  graduationYear: new Date().getFullYear(),
  regionQc: "",
  specialties: [],
  bio: "",
  isAvailable: true,
  isVisible: true,
};

// ── Component ────────────────────────────────────────────────────────────────

export function GraduateManager({
  schoolId,
  initialGraduates,
  locale,
}: {
  schoolId: string;
  initialGraduates: Graduate[];
  locale: string;
}) {
  const lang = locale === "fr" ? "fr" : "en";
  const router = useRouter();
  const [graduates, setGraduates] = useState<Graduate[]>(initialGraduates);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<GraduateFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(g: Graduate) {
    setEditingId(g.id);
    setForm({
      firstName: g.firstName,
      lastName: g.lastName,
      graduationYear: g.graduationYear,
      regionQc: g.regionQc,
      specialties: g.specialties,
      bio: g.bio ?? "",
      isAvailable: g.isAvailable,
      isVisible: g.isVisible,
    });
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function toggleSpecialty(spec: string) {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(spec)
        ? prev.specialties.filter((s) => s !== spec)
        : [...prev.specialties, spec],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.regionQc) {
      toast.error(
        lang === "fr"
          ? "Prénom, nom et région requis"
          : "First name, last name and region required",
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        bio: form.bio || undefined,
        ...(editingId ? {} : { schoolId }),
      };

      const url = editingId
        ? `/api/admin/graduates/${editingId}`
        : "/api/admin/graduates";
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error(
          (body as { error?: string }).error ?? "Erreur",
        );
        return;
      }

      const { graduate } = (await res.json()) as { graduate: Graduate };

      if (editingId) {
        setGraduates((prev) =>
          prev.map((g) => (g.id === editingId ? graduate : g)),
        );
      } else {
        setGraduates((prev) => [graduate, ...prev]);
      }

      toast.success(
        editingId
          ? lang === "fr"
            ? "Diplômé modifié"
            : "Graduate updated"
          : lang === "fr"
            ? "Diplômé ajouté"
            : "Graduate added",
      );
      closeForm();
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm(
        lang === "fr"
          ? "Supprimer ce diplômé ?"
          : "Delete this graduate?",
      )
    )
      return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/graduates/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        toast.error(
          lang === "fr"
            ? "Erreur lors de la suppression"
            : "Error deleting",
        );
        return;
      }
      setGraduates((prev) => prev.filter((g) => g.id !== id));
      toast.success(
        lang === "fr" ? "Diplômé supprimé" : "Graduate deleted",
      );
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  async function handleToggle(
    id: string,
    field: "isAvailable" | "isVisible",
    value: boolean,
  ) {
    setTogglingId(id);
    try {
      const res = await fetch(`/api/admin/graduates/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
      if (!res.ok) {
        toast.error("Erreur");
        return;
      }
      setGraduates((prev) =>
        prev.map((g) => (g.id === id ? { ...g, [field]: value } : g)),
      );
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-[#055864]" />
          <h2 className="text-lg font-semibold text-[#1F2933]">
            {lang === "fr" ? "Diplômés" : "Graduates"}
          </h2>
          <Badge variant="outline" className="text-xs">
            {graduates.length}
          </Badge>
        </div>
        {!showForm && (
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            {lang === "fr" ? "Ajouter un diplômé" : "Add graduate"}
          </Button>
        )}
      </div>

      {/* ── Form ── */}
      {showForm && (
        <Card className="shadow-none border-primary/20">
          <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
            <span className="text-sm font-semibold">
              {editingId
                ? lang === "fr"
                  ? "Modifier le diplômé"
                  : "Edit graduate"
                : lang === "fr"
                  ? "Nouveau diplômé"
                  : "New graduate"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={closeForm}
              className="h-7 w-7 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{lang === "fr" ? "Prénom" : "First name"}</Label>
                  <Input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        firstName: e.target.value,
                      }))
                    }
                    placeholder="Marie-Lou"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{lang === "fr" ? "Nom" : "Last name"}</Label>
                  <Input
                    value={form.lastName}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        lastName: e.target.value,
                      }))
                    }
                    placeholder="Dubois"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>
                    {lang === "fr" ? "Année de diplomation" : "Graduation year"}
                  </Label>
                  <Input
                    type="number"
                    min={1990}
                    max={2099}
                    value={form.graduationYear}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        graduationYear: parseInt(e.target.value) || new Date().getFullYear(),
                      }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>{lang === "fr" ? "Région" : "Region"}</Label>
                  <Select
                    value={form.regionQc}
                    onValueChange={(v) =>
                      setForm((prev) => ({ ...prev, regionQc: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          lang === "fr"
                            ? "Sélectionner une région"
                            : "Select a region"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>
                  {lang === "fr" ? "Spécialités" : "Specialties"}
                </Label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((spec) => {
                    const selected = form.specialties.includes(spec);
                    return (
                      <button
                        key={spec}
                        type="button"
                        onClick={() => toggleSpecialty(spec)}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                          selected
                            ? "bg-[#055864] text-white border-[#055864]"
                            : "bg-white text-[#4a6260] border-[#CBBBA6] hover:border-[#055864]"
                        }`}
                      >
                        {selected && <Check className="h-3 w-3" />}
                        {spec}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>
                  {lang === "fr" ? "Bio (optionnel)" : "Bio (optional)"}
                </Label>
                <textarea
                  rows={3}
                  value={form.bio}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
                  placeholder={
                    lang === "fr"
                      ? "Courte description du diplômé…"
                      : "Short description of the graduate…"
                  }
                />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isAvailable}
                    onCheckedChange={(v) =>
                      setForm((prev) => ({ ...prev, isAvailable: v }))
                    }
                  />
                  <Label className="text-sm">
                    {lang === "fr" ? "Disponible" : "Available"}
                  </Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={form.isVisible}
                    onCheckedChange={(v) =>
                      setForm((prev) => ({ ...prev, isVisible: v }))
                    }
                  />
                  <Label className="text-sm">
                    {lang === "fr" ? "Visible publiquement" : "Publicly visible"}
                  </Label>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <Button
                  type="submit"
                  disabled={saving}
                  className="min-w-[140px]"
                >
                  {saving && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {editingId
                    ? lang === "fr"
                      ? "Enregistrer"
                      : "Save"
                    : lang === "fr"
                      ? "Ajouter"
                      : "Add"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={closeForm}
                >
                  {lang === "fr" ? "Annuler" : "Cancel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* ── List ── */}
      {graduates.length === 0 ? (
        <Card className="border-dashed shadow-none">
          <CardContent className="py-10 text-center text-muted-foreground text-sm">
            {lang === "fr"
              ? "Aucun diplômé pour cette école."
              : "No graduates for this school."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {graduates.map((g) => (
            <Card
              key={g.id}
              className="shadow-none hover:shadow-sm transition-shadow"
            >
              <CardContent className="py-3 px-4 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-sm text-[#1F2933]">
                      {g.firstName} {g.lastName}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {g.graduationYear}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {g.regionQc}
                    </span>
                  </div>
                  {g.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {g.specialties.map((s) => (
                        <Badge
                          key={s}
                          variant="outline"
                          className="text-[10px] py-0"
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col gap-1 items-end">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {lang === "fr" ? "Dispo" : "Avail"}
                      </span>
                      <Switch
                        checked={g.isAvailable}
                        disabled={togglingId === g.id}
                        onCheckedChange={(v) =>
                          handleToggle(g.id, "isAvailable", v)
                        }
                        className="scale-75"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] text-muted-foreground">
                        {lang === "fr" ? "Visible" : "Visible"}
                      </span>
                      <Switch
                        checked={g.isVisible}
                        disabled={togglingId === g.id}
                        onCheckedChange={(v) =>
                          handleToggle(g.id, "isVisible", v)
                        }
                        className="scale-75"
                      />
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => openEdit(g)}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(g.id)}
                    disabled={deletingId === g.id}
                  >
                    {deletingId === g.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
