"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, CheckCircle2 } from "lucide-react";

type FormData = { email: string };

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const tErr = useTranslations("errors");
  const locale = useLocale();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email }),
      });

      if (!res.ok) {
        toast.error(tErr("generic"));
        return;
      }

      setSent(true);
    } catch {
      toast.error(tErr("generic"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-primary font-bold text-2xl">
            <Scissors className="h-6 w-6" />
            Tout Toilettage
          </Link>
        </div>

        <Card className="shadow-lg border border-border/80 bg-card/95">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">{t("forgot_password")}</CardTitle>
            <CardDescription>{t("forgot_password_desc")}</CardDescription>
          </CardHeader>

          <CardContent>
            {sent ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-sm text-muted-foreground">{t("forgot_password_sent")}</p>
                <Button variant="outline" asChild>
                  <Link href={`/${locale}/auth/login`}>{t("back_to_login")}</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">{t("email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    {...register("email", {
                      required: tErr("required"),
                      pattern: { value: /\S+@\S+\.\S+/, message: tErr("invalid_email") },
                    })}
                  />
                  {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("sending") : t("send_reset_link")}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  <Link href={`/${locale}/auth/login`} className="text-primary hover:underline">
                    {t("back_to_login")}
                  </Link>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
