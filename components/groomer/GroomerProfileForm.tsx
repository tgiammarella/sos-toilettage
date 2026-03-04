"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SPECIALIZATIONS = [
  "AGGRESSIVE_DOGS",
  "COLOR",
  "BIG_DOGS",
  "RABBITS",
  "CATS",
  "SPECIALTY_CUTS",
] as const;

type Specialization = (typeof SPECIALIZATIONS)[number];

const SPEC_LABELS: Record<Specialization, { fr: string; en: string }> = {
  AGGRESSIVE_DOGS: { fr: "Chiens agressifs", en: "Aggressive dogs" },
  COLOR: { fr: "Coloration", en: "Color" },
  BIG_DOGS: { fr: "Grands chiens", en: "Big dogs" },
  RABBITS: { fr: "Lapins", en: "Rabbits" },
  CATS: { fr: "Chats", en: "Cats" },
  SPECIALTY_CUTS: { fr: "Coupes spécialisées", en: "Specialty cuts" },
};

const labels = {
  fr: {
    fullName: "Nom complet",
    city: "Ville",
    experience: "Années d'expérience",
    bio: "Bio",
    specs: "Spécialisations",
    specsHint: "Vous pouvez sélectionner plusieurs options.",
    save: "Enregistrer",
    saving: "Enregistrement…",
    success: "Profil mis à jour !",
    error: "Une erreur est survenue.",
  },
  en: {
    fullName: "Full name",
    city: "City",
    experience: "Years of experience",
    bio: "Bio",
    specs: "Specializations",
    specsHint: "You can select multiple options.",
    save: "Save",
    saving: "Saving…",
    success: "Profile updated!",
    error: "An error occurred.",
  },
};

export function GroomerProfileForm({
  lang,
  initial,
}: {
  lang: "fr" | "en";
  initial: {
    fullName: string;
    city: string;
    yearsExperience: number;
    bio: string;
    specializations: string[];
  };
}) {
  const router = useRouter();
  const t = labels[lang];

  const [fullName, setFullName] = useState(initial.fullName);
  const [city, setCity] = useState(initial.city);
  const [yearsExperience, setYearsExperience] = useState(
    String(initial.yearsExperience)
  );
  const [bio, setBio] = useState(initial.bio);
  const [selectedSpecs, setSelectedSpecs] = useState<Specialization[]>(
    (initial.specializations as Specialization[]).filter((s) =>
      (SPECIALIZATIONS as readonly string[]).includes(s)
    )
  );
  const [saving, setSaving] = useState(false);

  function toggleSpec(code: Specialization) {
    setSelectedSpecs((prev) =>
      prev.includes(code) ? prev.filter((s) => s !== code) : [...prev, code]
    );
  }

  async function handleSave() {
    const exp = parseInt(yearsExperience, 10);
    if (isNaN(exp) || exp < 0 || exp > 60) {
      toast.error(lang === "fr" ? "Expérience invalide (0–60)." : "Invalid experience (0–60).");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/groomer/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          city,
          yearsExperience: exp,
          bio: bio || undefined,
          specializations: selectedSpecs,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error((body as { error?: string }).error ?? t.error);
        return;
      }

      toast.success(t.success);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="fullName">{t.fullName}</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="city">{t.city}</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="experience">{t.experience}</Label>
          <Input
            id="experience"
            type="number"
            min={0}
            max={60}
            value={yearsExperience}
            onChange={(e) => setYearsExperience(e.target.value)}
          />
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <Label htmlFor="bio">{t.bio}</Label>
        <textarea
          id="bio"
          rows={4}
          maxLength={800}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 resize-none"
        />
      </div>

      {/* Specializations */}
      <div className="space-y-2">
        <Label>{t.specs}</Label>
        <p className="text-xs text-muted-foreground">{t.specsHint}</p>
        <div className="flex flex-wrap gap-2">
          {SPECIALIZATIONS.map((code) => {
            const selected = selectedSpecs.includes(code);
            return (
              <button
                key={code}
                type="button"
                onClick={() => toggleSpec(code)}
                className={[
                  "px-3 py-1 rounded-full text-sm font-medium border transition-colors",
                  selected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-background text-muted-foreground border-input hover:border-primary/60 hover:text-foreground",
                ].join(" ")}
              >
                {SPEC_LABELS[code][lang]}
              </button>
            );
          })}
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} size="sm">
        {saving ? t.saving : t.save}
      </Button>
    </div>
  );
}
