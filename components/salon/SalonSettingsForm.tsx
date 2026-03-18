"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LABELS = {
  fr: {
    name:      "Nom du salon",
    email:     "Courriel de contact",
    emailHint: "L'adresse courriel ne peut pas être modifiée ici.",
    phone:     "Téléphone",
    city:      "Ville",
    save:      "Enregistrer",
    saving:    "Enregistrement…",
    success:   "Paramètres enregistrés !",
    required:  "Nom et ville requis.",
    error:     "Une erreur est survenue.",
  },
  en: {
    name:      "Salon name",
    email:     "Contact email",
    emailHint: "Email address cannot be changed here.",
    phone:     "Phone",
    city:      "City",
    save:      "Save",
    saving:    "Saving…",
    success:   "Settings saved!",
    required:  "Name and city are required.",
    error:     "An error occurred.",
  },
} as const;

export function SalonSettingsForm({
  lang,
  initial,
}: {
  lang: "fr" | "en";
  initial: {
    name:  string;
    email: string;
    phone: string;
    city:  string;
  };
}) {
  const router = useRouter();
  const t = LABELS[lang];

  const [name,  setName]  = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [city,  setCity]  = useState(initial.city);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !city.trim()) {
      toast.error(t.required);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/salon/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:  name.trim(),
          phone: phone.trim() || undefined,
          city:  city.trim(),
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
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="name">{t.name}</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="email">{t.email}</Label>
          <Input
            id="email"
            type="email"
            value={initial.email}
            readOnly
            className="opacity-60 cursor-default"
          />
          <p className="text-xs text-muted-foreground">{t.emailHint}</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">{t.phone}</Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
      </div>

      <Button size="sm" onClick={handleSave} disabled={saving}>
        {saving ? t.saving : t.save}
      </Button>
    </div>
  );
}
