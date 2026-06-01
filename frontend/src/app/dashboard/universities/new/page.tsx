"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { UniversityForm } from "@/components/dashboard/university/UniversityForm";
import { Loader2 } from "lucide-react";

function NewUniversityFormWrapper() {
  const searchParams = useSearchParams();
  const country = searchParams.get("country") || "";
  return <UniversityForm initialCountry={country} />;
}

export default function NewUniversityPage() {
  return (
    <div className="space-y-6 py-6">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }>
        <NewUniversityFormWrapper />
      </Suspense>
    </div>
  );
}
