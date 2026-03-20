"use client";

import { useState } from "react";
import { useForm, Controller, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, AlertTriangle } from "lucide-react";
import { CreditUsageHint } from "@/components/billing/CreditUsageHint";

const CRITERIA_KEYS = [
  "BIG_DOGS",
  "SMALL_DOGS",
  "CATS",
  "RABBITS",
  "AGGRESSIVE_DOGS",
  "NORDIC_BREEDS",
] as const;

const formSchema = z.object({
  date:                    z.string().min(1),
  startTime:               z.string().regex(/^\d{2}:\d{2}$/),
  address:                 z.string().min(1),
  city:                    z.string().min(1),
  postalCode:              z.string().min(1),
  numberOfAppointments:    z.coerce.number().int().min(1).max(30),
  payType:                 z.enum(["HOURLY", "FLAT"]),
  payRate:                 z.coerce.number().min(0.01),
  requiredExperienceYears: z.coerce.number().int().min(0).max(30),
  criteriaTags:            z.array(z.string()).default([]),
  equipmentProvided:       z.boolean().default(false),
  isUrgent:                z.boolean().default(false),
  notes:                   z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function ShiftForm({
  locale,
  creditsAvailable,
}: {
  locale: string;
  creditsAvailable: number;
}) {
  const router = useRouter();
  const t = useTranslations("shifts.form");
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues: {
      payType: "HOURLY",
      numberOfAppointments: 4,
      requiredExperienceYears: 1,
      criteriaTags: [],
      equipmentProvided: false,
      isUrgent: false,
    },
  });

  const payType = form.watch("payType");
  const isUrgent = form.watch("isUrgent");
  const totalCost = isUrgent ? 2 : 1;

  async function onSubmit(values: FormValues) {
    setSubmitting(true);
    try {
      const res = await fetch("/api/shifts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          region: values.city,
          payRateCents: Math.round(values.payRate * 100),
          criteriaTags: JSON.stringify(values.criteriaTags),
        }),
      });

      if (res.status === 402) {
        toast.error(t("error_insufficient_credits"));
        return;
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error((err as { message?: string }).message ?? t("error_generic"));
        return;
      }

      const json = await res.json();
      toast.success(t("success"));
      router.push(`/${locale}/dashboard/salon/shifts/${json.shift.id}`);
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  }

  const err = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Credit indicator */}
      <CreditUsageHint creditsAvailable={creditsAvailable} costCredits={totalCost} locale={locale} />

      {/* Date & time */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">{t("section_date")}</CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="date">{t("date_label")}</Label>
            <Input id="date" type="date" {...form.register("date")} />
            {err.date && <p className="text-xs text-destructive">{t("validation_date")}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="startTime">{t("start_time_label")}</Label>
            <Input id="startTime" type="time" {...form.register("startTime")} />
            {err.startTime && <p className="text-xs text-destructive">{t("validation_time")}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">{t("section_location")}</CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="address">{t("address_label")}</Label>
            <Input id="address" placeholder={t("address_placeholder")} {...form.register("address")} />
            {err.address && <p className="text-xs text-destructive">{t("validation_address")}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="city">{t("city_label")}</Label>
            <Input id="city" placeholder={t("city_placeholder")} {...form.register("city")} />
            {err.city && <p className="text-xs text-destructive">{t("validation_city")}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="postalCode">{t("postal_code_label")}</Label>
            <Input id="postalCode" placeholder={t("postal_code_placeholder")} {...form.register("postalCode")} />
            {err.postalCode && <p className="text-xs text-destructive">{t("validation_postal")}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Pay & workload */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">{t("section_pay")}</CardHeader>
        <CardContent className="px-4 pb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label>{t("pay_type_label")}</Label>
            <Controller
              control={form.control}
              name="payType"
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HOURLY">{t("pay_type_hourly")}</SelectItem>
                    <SelectItem value="FLAT">{t("pay_type_flat")}</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="payRate">
              {payType === "HOURLY" ? t("pay_rate_hourly") : t("pay_rate_flat")}
            </Label>
            <Input id="payRate" type="number" step="0.5" min="0" placeholder="25.00" {...form.register("payRate")} />
            {err.payRate && <p className="text-xs text-destructive">{t("validation_pay_rate")}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="numberOfAppointments">{t("appointments_label")}</Label>
            <Input id="numberOfAppointments" type="number" min="1" max="30" {...form.register("numberOfAppointments")} />
            {err.numberOfAppointments && <p className="text-xs text-destructive">{t("validation_date")}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Requirements */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">{t("section_requirements")}</CardHeader>
        <CardContent className="px-4 pb-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="requiredExperienceYears">{t("min_experience_label")}</Label>
            <Input id="requiredExperienceYears" type="number" min="0" max="30" className="max-w-[120px]" {...form.register("requiredExperienceYears")} />
          </div>
          <div className="space-y-2">
            <Label>{t("specializations_label")}</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Controller
                control={form.control}
                name="criteriaTags"
                render={({ field }) => (
                  <>
                    {CRITERIA_KEYS.map((key) => (
                      <label key={key} className="flex items-center gap-2 cursor-pointer text-sm select-none">
                        <Checkbox
                          checked={field.value.includes(key)}
                          onCheckedChange={(checked) => {
                            field.onChange(
                              checked
                                ? [...field.value, key]
                                : field.value.filter((v) => v !== key)
                            );
                          }}
                        />
                        {t(`criteria_${key.toLowerCase()}`)}
                      </label>
                    ))}
                  </>
                )}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Controller
              control={form.control}
              name="equipmentProvided"
              render={({ field }) => (
                <Checkbox id="equipmentProvided" checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
            <Label htmlFor="equipmentProvided" className="cursor-pointer">{t("equipment_provided_label")}</Label>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Controller
                control={form.control}
                name="isUrgent"
                render={({ field }) => (
                  <Checkbox id="isUrgent" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
              <Label htmlFor="isUrgent" className="cursor-pointer flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-destructive" />
                {t("urgent_label")}
              </Label>
            </div>
            {!isUrgent && (
              <p className="text-xs text-muted-foreground ml-6">
                {t("urgent_hint")}
              </p>
            )}
            {isUrgent && (
              <div className="ml-6 flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800" dangerouslySetInnerHTML={{ __html: t("urgent_warning") }} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="shadow-none">
        <CardHeader className="pb-2 pt-4 px-4 text-sm font-semibold">{t("section_notes")}</CardHeader>
        <CardContent className="px-4 pb-4">
          <textarea
            className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-y"
            placeholder={t("notes_placeholder")}
            {...form.register("notes")}
          />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 pt-2">
        <Button type="submit" disabled={submitting || creditsAvailable < totalCost} className="min-w-[180px]">
          {submitting ? t("submitting") : t("submit")}
        </Button>
        {creditsAvailable < totalCost && (
          <p className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {creditsAvailable === 0
              ? t("no_credits")
              : t("insufficient_credits", { available: creditsAvailable, required: totalCost })}
          </p>
        )}
      </div>
    </form>
  );
}
