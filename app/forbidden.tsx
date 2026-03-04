import Link from "next/link";
import { ShieldX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-4">
      <div className="text-center space-y-4 max-w-sm">
        <ShieldX className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-2xl font-bold">Accès refusé</h1>
        <p className="text-muted-foreground text-sm">
          Vous n&apos;avez pas les permissions nécessaires pour accéder à cette page.
        </p>
        <div className="flex gap-3 justify-center pt-2">
          <Button variant="outline" asChild>
            <Link href="/fr">Accueil</Link>
          </Button>
          <Button asChild>
            <Link href="/fr/auth/login">Se connecter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
