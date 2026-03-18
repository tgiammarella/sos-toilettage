"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  title:          z.string().min(1, "Titre requis"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT"]),
  city:           z.string().min(1, "Ville requise"),
  description:    z.string().min(1, "Description requise"),
  payInfo:        z.string().optional(),
  requirements:   z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function JobForm({ locale }: { locale: string }) {
  const lang = locale === "fr" ? "fr" : "en";
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [draftId, setDraftId] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: { employmentType: "FULL_TIME" },
  });

  const err = form.formState.errors;

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, region: values.city }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error((body as { error?: string }).error ?? "Une erreur est survenue.");
        return;
      }

      const { id } = (await res.json()) as { id: string };
      setDraftId(id);
      toast.success(
        lang === "fr" ? "Brouillon sauvegardé" : "Draft saved",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handlePublish() {
    if (!draftId) return;
    setPublishing(true);
    try {
      const res = await fetch(`/api/jobs/${draftId}/publish`, { method: "POST" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        toast.error((body as { error?: string }).error ?? "Erreur lors de la publication.");
        return;
      }

      toast.success(
        lang === "fr"
          ? "Offre publiée pour 30 jours !"
          : "Job posted for 30 days!",
      );
      router.push(`/${locale}/dashboard/salon/jobs`);
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  // After draft is created, show payment/publish confirmation
  if (draftId) {
    return (
      <Card className="shadow-none border-primary/30 bg-primary/5">
        <CardContent className="py-8 px-6 text-center space-y-4">
          <p className="text-lg font-semibold">
            {lang === "fr"
              ? "Publier une offre d'emploi — 49 $ / 30 jours"
              : "Publish a job posting — $49 / 30 days"}
          </p>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            {lang === "fr"
              ? "Votre offre sera visible par tous les toiletteurs de la plateforme pendant 30 jours."
              : "Your job will be visible to all groomers on the platform for 30 days."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                router.push(`/${locale}/dashboard/salon/jobs`);
                router.refresh();
              }}
            >
              {lang === "fr" ? "Garder en brouillon" : "Keep as draft"}
            </Button>
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              {lang === "fr"
                ? "Confirmer et publier — 49 $"
                : "Confirm & publish — $49"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

      {/* Title + type + pay */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">Poste</CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="title">Titre du poste</Label>
            <Input
              id="title"
              placeholder="Ex: Toiletteur(se) expérimenté(e)"
              {...form.register("title")}
            />
            {err.title && <p className="text-xs text-destructive">{err.title.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Type d&apos;emploi</Label>
            <Controller
              control={form.control}
              name="employmentType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="FULL_TIME">Temps plein</SelectItem>
                    <SelectItem value="PART_TIME">Temps partiel</SelectItem>
                    <SelectItem value="CONTRACT">Contrat</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payInfo">Rémunération (optionnel)</Label>
            <Input
              id="payInfo"
              placeholder="Ex: 20–25 $/h"
              {...form.register("payInfo")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">Lieu</CardHeader>
        <CardContent className="px-4 pb-4">
          <div className="space-y-1.5 max-w-sm">
            <Label htmlFor="city">Ville</Label>
            <Input id="city" placeholder="Montréal" {...form.register("city")} />
            {err.city && <p className="text-xs text-destructive">{err.city.message}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Description + requirements */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">
          Description du poste
        </CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              rows={5}
              placeholder="Décrivez le poste, l'ambiance du salon, les responsabilités…"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              {...form.register("description")}
            />
            {err.description && (
              <p className="text-xs text-destructive">{err.description.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="requirements">Exigences (optionnel)</Label>
            <textarea
              id="requirements"
              rows={3}
              placeholder="Ex: 2 ans d'expérience, certification ACMPR, etc."
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
              {...form.register("requirements")}
            />
          </div>
        </CardContent>
      </Card>

      <div className="pt-2 flex items-center gap-3">
        <Button type="submit" disabled={submitting} className="min-w-[200px]">
          {submitting ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : null}
          {lang === "fr"
            ? "Sauvegarder et continuer"
            : "Save and continue"}
        </Button>
        <p className="text-xs text-muted-foreground">
          {lang === "fr"
            ? "Publier une offre d'emploi — 49 $ / 30 jours"
            : "Publish a job posting — $49 / 30 days"}
        </p>
      </div>
    </form>
  );
}
