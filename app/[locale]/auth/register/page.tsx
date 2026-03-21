"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Scissors, Building2, User } from "lucide-react";
import { cn } from "@/lib/utils";

type Step = "role" | "details";
type Role = "SALON" | "GROOMER";

type SalonForm = {
  email: string;
  password: string;
  confirmPassword: string;
  salonName: string;
  address: string;
  city: string;
  postalCode: string;
  phone?: string;
};

type GroomerForm = {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  city: string;
};

export default function RegisterPage() {
  const t = useTranslations("auth");
  const tErr = useTranslations("errors");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const preselected = searchParams.get("role") as Role | null;
  const [step, setStep] = useState<Step>(preselected ? "details" : "role");
  const [role, setRole] = useState<Role | null>(preselected);
  const [loading, setLoading] = useState(false);

  const salonForm = useForm<SalonForm>();
  const groomerForm = useForm<GroomerForm>();

  function selectRole(r: Role) {
    setRole(r);
    setStep("details");
  }

  async function onSalonSubmit(data: SalonForm) {
    if (data.password !== data.confirmPassword) {
      salonForm.setError("confirmPassword", { message: tErr("passwords_dont_match") });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, region: data.city, role: "SALON" }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "email_taken") {
          salonForm.setError("email", { message: tErr("email_taken") });
        } else {
          toast.error(tErr("generic"));
        }
        setLoading(false);
        return;
      }
      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      router.push(`/${locale}/dashboard/salon`);
    } catch {
      toast.error(tErr("generic"));
      setLoading(false);
    }
  }

  async function onGroomerSubmit(data: GroomerForm) {
    if (data.password !== data.confirmPassword) {
      groomerForm.setError("confirmPassword", { message: tErr("passwords_dont_match") });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, region: data.city, role: "GROOMER" }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (json.error === "email_taken") {
          groomerForm.setError("email", { message: tErr("email_taken") });
        } else {
          toast.error(tErr("generic"));
        }
        setLoading(false);
        return;
      }
      await signIn("credentials", { email: data.email, password: data.password, redirect: false });
      router.push(`/${locale}/dashboard/groomer`);
    } catch {
      toast.error(tErr("generic"));
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/50 px-4 py-10">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-primary font-bold text-2xl">
            <Scissors className="h-6 w-6" />
            Tout Toilettage
          </Link>
        </div>

        {/* Step: Role selection */}
        {step === "role" && (
          <Card className="shadow-lg border border-border/80 bg-card/95">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">{t("choose_role")}</CardTitle>
              <CardDescription>{t("choose_role_desc")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <button
                onClick={() => selectRole("SALON")}
                className={cn(
                  "w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-colors",
                  "hover:border-primary hover:bg-accent/50",
                )}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{t("role_salon")}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{t("role_salon_desc")}</p>
                </div>
              </button>

              <button
                onClick={() => selectRole("GROOMER")}
                className={cn(
                  "w-full flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-colors",
                  "hover:border-primary hover:bg-accent/50",
                )}
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{t("role_groomer")}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{t("role_groomer_desc")}</p>
                </div>
              </button>

              <p className="text-center text-sm text-muted-foreground pt-2">
                {t("have_account")}{" "}
                <Link href={`/${locale}/auth/login`} className="text-primary font-medium hover:underline">
                  {t("sign_in")}
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Step: Salon details */}
        {step === "details" && role === "SALON" && (
          <Card className="shadow-lg border border-border/80 bg-card/95">
            <CardHeader className="pb-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2 mb-1 text-muted-foreground"
                onClick={() => setStep("role")}
              >
                ← {t("back")}
              </Button>
              <CardTitle className="text-2xl">{t("role_salon")}</CardTitle>
              <CardDescription>{t("have_account")}{" "}
                <Link href={`/${locale}/auth/login`} className="text-primary font-medium hover:underline">
                  {t("sign_in")}
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={salonForm.handleSubmit(onSalonSubmit)} className="space-y-3">
                <FieldRow label={t("salon_name")}>
                  <Input
                    {...salonForm.register("salonName", { required: tErr("required") })}
                    placeholder="Ex: Salon Canin Montréal"
                  />
                  <ErrMsg msg={salonForm.formState.errors.salonName?.message} />
                </FieldRow>

                <FieldRow label={t("email")}>
                  <Input
                    type="email"
                    autoComplete="email"
                    {...salonForm.register("email", {
                      required: tErr("required"),
                      pattern: { value: /\S+@\S+\.\S+/, message: tErr("invalid_email") },
                    })}
                  />
                  <ErrMsg msg={salonForm.formState.errors.email?.message} />
                </FieldRow>

                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label={t("password")}>
                    <PasswordInput
                      {...salonForm.register("password", {
                        required: tErr("required"),
                        minLength: { value: 8, message: tErr("password_min") },
                      })}
                    />
                    <ErrMsg msg={salonForm.formState.errors.password?.message} />
                  </FieldRow>
                  <FieldRow label={t("confirm_password")}>
                    <PasswordInput
                      {...salonForm.register("confirmPassword", { required: tErr("required") })}
                    />
                    <ErrMsg msg={salonForm.formState.errors.confirmPassword?.message} />
                  </FieldRow>
                </div>

                <FieldRow label={t("address")}>
                  <Input {...salonForm.register("address", { required: tErr("required") })} placeholder="123 rue Principale" />
                  <ErrMsg msg={salonForm.formState.errors.address?.message} />
                </FieldRow>

                <FieldRow label={t("city")}>
                  <Input {...salonForm.register("city", { required: tErr("required") })} placeholder="Montréal" />
                  <ErrMsg msg={salonForm.formState.errors.city?.message} />
                </FieldRow>

                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label={t("postal_code")}>
                    <Input {...salonForm.register("postalCode", { required: tErr("required") })} placeholder="H1A 1A1" />
                    <ErrMsg msg={salonForm.formState.errors.postalCode?.message} />
                  </FieldRow>
                  <FieldRow label={t("phone")}>
                    <Input {...salonForm.register("phone")} type="tel" placeholder="514-555-0000" />
                  </FieldRow>
                </div>

                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading ? t("creating_account") : t("create_account")}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step: Groomer details */}
        {step === "details" && role === "GROOMER" && (
          <Card className="shadow-lg border border-border/80 bg-card/95">
            <CardHeader className="pb-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-fit -ml-2 mb-1 text-muted-foreground"
                onClick={() => setStep("role")}
              >
                ← {t("back")}
              </Button>
              <CardTitle className="text-2xl">{t("role_groomer")}</CardTitle>
              <CardDescription>{t("have_account")}{" "}
                <Link href={`/${locale}/auth/login`} className="text-primary font-medium hover:underline">
                  {t("sign_in")}
                </Link>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={groomerForm.handleSubmit(onGroomerSubmit)} className="space-y-3">
                <FieldRow label={t("full_name")}>
                  <Input
                    {...groomerForm.register("fullName", { required: tErr("required") })}
                    placeholder="Marie Tremblay"
                  />
                  <ErrMsg msg={groomerForm.formState.errors.fullName?.message} />
                </FieldRow>

                <FieldRow label={t("email")}>
                  <Input
                    type="email"
                    autoComplete="email"
                    {...groomerForm.register("email", {
                      required: tErr("required"),
                      pattern: { value: /\S+@\S+\.\S+/, message: tErr("invalid_email") },
                    })}
                  />
                  <ErrMsg msg={groomerForm.formState.errors.email?.message} />
                </FieldRow>

                <div className="grid grid-cols-2 gap-3">
                  <FieldRow label={t("password")}>
                    <PasswordInput
                      {...groomerForm.register("password", {
                        required: tErr("required"),
                        minLength: { value: 8, message: tErr("password_min") },
                      })}
                    />
                    <ErrMsg msg={groomerForm.formState.errors.password?.message} />
                  </FieldRow>
                  <FieldRow label={t("confirm_password")}>
                    <PasswordInput
                      {...groomerForm.register("confirmPassword", { required: tErr("required") })}
                    />
                    <ErrMsg msg={groomerForm.formState.errors.confirmPassword?.message} />
                  </FieldRow>
                </div>

                <FieldRow label={t("city")}>
                  <Input {...groomerForm.register("city", { required: tErr("required") })} placeholder="Montréal" />
                  <ErrMsg msg={groomerForm.formState.errors.city?.message} />
                </FieldRow>

                <Button type="submit" className="w-full mt-2" disabled={loading}>
                  {loading ? t("creating_account") : t("create_account")}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function ErrMsg({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-sm text-destructive">{msg}</p>;
}
