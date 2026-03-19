"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, UserPlus, CheckCircle, Zap, Star } from "lucide-react";
import { getLang, getLabel, SPEC_LABEL } from "@/lib/labels";

type SuggestedGroomer = {
  id: string;
  fullName: string;
  city: string;
  specializations: string;
  availableToday: boolean;
  profileScore: number;
  reliabilityScore: number;
  score: number;
  invited: boolean;
};

export function SuggestedGroomers({
  shiftId,
  locale,
}: {
  shiftId: string;
  locale: string;
}) {
  const lang = getLang(locale);
  const t = useTranslations("ui");
  const [groomers, setGroomers] = useState<SuggestedGroomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviting, setInviting] = useState<Record<string, boolean>>({});
  const [invitedIds, setInvitedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/shifts/${shiftId}/suggestions`)
      .then((r) => r.json())
      .then((json: { data: SuggestedGroomer[]; meta?: unknown } | SuggestedGroomer[]) => {
        const list = Array.isArray(json) ? json : json.data;
        setGroomers(list);
        const preInvited = new Set(
          list.filter((g) => g.invited).map((g) => g.id),
        );
        setInvitedIds(preInvited);
      })
      .catch(() => {/* silently fail — non-critical feature */})
      .finally(() => setLoading(false));
  }, [shiftId]);

  async function handleInvite(groomerId: string) {
    setInviting((prev) => ({ ...prev, [groomerId]: true }));
    try {
      const res = await fetch(`/api/shifts/${shiftId}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groomerId }),
      });
      if (res.ok) {
        setInvitedIds((prev) => new Set([...prev, groomerId]));
        toast.success(t("invitation_sent"));
      } else {
        toast.error(t("error_sending_invite"));
      }
    } finally {
      setInviting((prev) => ({ ...prev, [groomerId]: false }));
    }
  }

  if (loading || groomers.length === 0) return null;

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-accent shrink-0" />
        <h2 className="text-lg font-semibold">
          {t("suggested_groomers")}
        </h2>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {t("suggested_groomers_hint")}
        </span>
      </div>

      <div className="space-y-2">
        {groomers.map((g) => {
          const specs: string[] = (() => {
            try {
              const parsed = JSON.parse(g.specializations || "[]");
              return Array.isArray(parsed) ? parsed : [];
            } catch {
              return [];
            }
          })();
          const isInvited = invitedIds.has(g.id);

          return (
            <Card key={g.id} className="border shadow-none">
              <CardContent className="py-3.5 px-5">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                      {g.fullName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{g.fullName}</p>
                      <span className="text-xs text-muted-foreground">
                        {g.city}
                      </span>
                      {g.availableToday && (
                        <Badge
                          variant="secondary"
                          className="text-xs flex items-center gap-0.5 border-success-border text-success-foreground bg-success"
                        >
                          <Zap className="h-3 w-3" />
                          {t("available")}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-xs">
                        {t("profile")}{" "}
                        {g.profileScore}%
                      </Badge>
                      {g.reliabilityScore > 0 && (
                        <Badge variant="outline" className="text-xs flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          {g.reliabilityScore.toFixed(1)}
                        </Badge>
                      )}
                    </div>

                    {specs.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {specs.slice(0, 3).map((s) => (
                          <Badge key={s} variant="secondary" className="text-xs">
                            {getLabel(SPEC_LABEL, s, lang)}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    size="sm"
                    variant={isInvited ? "secondary" : "outline"}
                    disabled={isInvited || inviting[g.id]}
                    onClick={() => handleInvite(g.id)}
                    className="shrink-0"
                  >
                    {isInvited ? (
                      <>
                        <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                        {t("invited")}
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                        {t("invite")}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
