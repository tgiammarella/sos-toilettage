"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn, getSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors } from "lucide-react";

type FormData = { email: string; password: string };

export default function LoginPage() {
  const t = useTranslations("auth");
  const tErr = useTranslations("errors");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const verified = searchParams.get("verified");
  const error = searchParams.get("error");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();

  async function onSubmit(data: FormData) {
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(tErr("login_failed"));
        setLoading(false);
        return;
      }

      const session = await getSession();
      const role = session?.user?.role;
      const roleDest =
        role === "SALON"   ? `/${locale}/dashboard/salon`
        : role === "GROOMER" ? `/${locale}/dashboard/groomer`
        : role === "ADMIN"   ? `/${locale}/dashboard/admin`
        : `/${locale}/dashboard`;

      // Only use callbackUrl if it is a safe relative path
      const dest = callbackUrl?.startsWith("/") ? callbackUrl : roleDest;
      router.push(dest);
    } catch {
      toast.error(tErr("generic"));
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

        {verified === "true" && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800 text-center">
            {locale === "fr"
              ? "Votre courriel a été vérifié avec succès. Vous pouvez maintenant vous connecter."
              : "Your email has been verified successfully. You can now sign in."}
          </div>
        )}
        {error === "token_expired" && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive text-center">
            {locale === "fr"
              ? "Le lien de vérification a expiré. Veuillez vous réinscrire."
              : "The verification link has expired. Please register again."}
          </div>
        )}
        {error === "invalid_token" && (
          <div className="mb-4 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive text-center">
            {locale === "fr"
              ? "Lien de vérification invalide."
              : "Invalid verification link."}
          </div>
        )}

        <Card className="shadow-lg border border-border/80 bg-card/95">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl">{t("login")}</CardTitle>
            <CardDescription>
              {t("no_account")}{" "}
              <Link href={`/${locale}/auth/register`} className="text-primary font-medium hover:underline">
                {t("register")}
              </Link>
            </CardDescription>
          </CardHeader>

          <CardContent>
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

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("password")}</Label>
                  <Link href={`/${locale}/auth/forgot-password`} className="text-xs text-primary hover:underline">
                    {t("forgot_password_link")}
                  </Link>
                </div>
                <PasswordInput
                  id="password"
                  autoComplete="current-password"
                  {...register("password", { required: tErr("required") })}
                />
                {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? t("signing_in") : t("sign_in")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
