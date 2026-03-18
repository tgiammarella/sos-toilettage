"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, CheckCircle2 } from "lucide-react";

type FormData = { password: string; confirmPassword: string };

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  const tErr = useTranslations("errors");
  const locale = useLocale();
  const params = useParams<{ token: string }>();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors }, watch } = useForm<FormData>();
  const password = watch("password");

  async function onSubmit(data: FormData) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: params.token, password: data.password }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const code = (body as { error?: string }).error;
        if (code === "INVALID_TOKEN" || code === "EXPIRED_TOKEN") {
          setError(t("reset_token_invalid"));
        } else {
          toast.error(tErr("generic"));
        }
        return;
      }

      setDone(true);
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
            <CardTitle className="text-2xl">{t("reset_password")}</CardTitle>
            <CardDescription>{t("reset_password_desc")}</CardDescription>
          </CardHeader>

          <CardContent>
            {done ? (
              <div className="text-center space-y-4 py-4">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
                <p className="text-sm text-muted-foreground">{t("reset_password_success")}</p>
                <Button asChild>
                  <Link href={`/${locale}/auth/login`}>{t("sign_in")}</Link>
                </Button>
              </div>
            ) : error ? (
              <div className="text-center space-y-4 py-4">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" asChild>
                  <Link href={`/${locale}/auth/forgot-password`}>{t("request_new_link")}</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="password">{t("new_password")}</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    {...register("password", {
                      required: tErr("required"),
                      minLength: { value: 8, message: t("password_min_length") },
                    })}
                  />
                  {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword">{t("confirm_password")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register("confirmPassword", {
                      required: tErr("required"),
                      validate: (v) => v === password || t("passwords_no_match"),
                    })}
                  />
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t("resetting") : t("reset_password_submit")}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
