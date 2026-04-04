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
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <h2 className="text-3xl font-bold text-dark mb-2">Une erreur est survenue</h2>
        <p className="text-muted-foreground mb-6">
          Quelque chose s&apos;est mal passé. Veuillez réessayer.
        </p>
        <Button onClick={reset} className="bg-primary hover:bg-primary/90">
          Réessayer
        </Button>
      </div>
    </div>
  );
}
