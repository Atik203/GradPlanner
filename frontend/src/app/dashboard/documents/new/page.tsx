"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DocumentForm } from "@/components/dashboard/documents/DocumentForm";
import { Loader2 } from "lucide-react";

function DocumentFormWrapper() {
  const searchParams = useSearchParams();
  const country = searchParams.get("country") || "";
  return <DocumentForm initialCountry={country} />;
}

export default function NewDocumentPage() {
  return (
    <div className="space-y-6 py-6">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <DocumentFormWrapper />
      </Suspense>
    </div>
  );
}
