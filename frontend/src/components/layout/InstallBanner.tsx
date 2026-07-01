"use client";

import React, { useEffect, useState } from "react";
import { X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setShow(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!show) return null;

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    if (result.outcome === "accepted") {
      setShow(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 md:left-auto md:right-4 md:bottom-4 md:w-80 z-50 rounded-xl border border-primary/20 bg-card/95 backdrop-blur-md p-3 shadow-lg flex items-center gap-3 animate-in slide-in-from-bottom-2 duration-300">
      <Download className="h-5 w-5 text-primary shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-foreground">Install GradPlanner</p>
        <p className="text-[10px] text-muted-foreground">Get a faster, app-like experience.</p>
      </div>
      <div className="flex gap-1 shrink-0">
        <Button
          size="sm"
          onClick={handleInstall}
          className="min-h-8 text-[10px] px-2.5 bg-primary text-primary-foreground font-bold hover:bg-primary/90"
        >
          Install
        </Button>
        <button
          type="button"
          onClick={() => setShow(false)}
          className="min-h-8 min-w-8 flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
