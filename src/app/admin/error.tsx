"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin error:", error);
  }, [error]);

  return (
    <div className="flex items-center justify-center py-24">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Erreur</h2>
        <p className="text-muted-foreground mb-4">
          Une erreur est survenue dans le tableau de bord.
        </p>
        <Button onClick={reset} className="bg-primary hover:bg-primary/90">
          Réessayer
        </Button>
      </div>
    </div>
  );
}
