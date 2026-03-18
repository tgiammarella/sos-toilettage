"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ReviewForm } from "./ReviewForm";

interface Props {
  engagementId: string;
  groomerName: string;
  shiftId: string;
  locale: string;
}

export function ShiftReviewForm({ engagementId, groomerName, shiftId, locale }: Props) {
  const router = useRouter();
  const lang = locale === "fr" ? "fr" : "en";

  function handleSuccess() {
    toast.success(lang === "fr" ? "Avis envoyé !" : "Review submitted!");
    router.push(`/${locale}/dashboard/salon/shifts/${shiftId}`);
    router.refresh();
  }

  return (
    <Card className="border shadow-none">
      <CardContent className="py-6 px-6 space-y-5">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
              {groomerName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{groomerName}</p>
            <p className="text-xs text-muted-foreground">
              {lang === "fr" ? "Toiletteur(se)" : "Groomer"}
            </p>
          </div>
        </div>

        <ReviewForm
          engagementId={engagementId}
          locale={locale}
          onSuccess={handleSuccess}
        />
      </CardContent>
    </Card>
  );
}
