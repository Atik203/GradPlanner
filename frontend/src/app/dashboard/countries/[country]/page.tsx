import React from "react";
import { notFound } from "next/navigation";
import { CountryClient } from "./CountryClient";

export default async function CountryIntelligencePage({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = await params;
  const rawSlug = resolvedParams.country;
  // Decode percent-encoded spaces and replace spaces/underscores with hyphens
  const slug = decodeURIComponent(rawSlug).toLowerCase().trim().replace(/[\s_]+/g, "-");
  
  // NEXT_BACKEND_URL is a private (server-only) env var pointing to the deployed backend.
  // It is NOT prefixed with NEXT_PUBLIC_ so it is never sent to the browser.
  const API_URL = process.env.NEXT_BACKEND_URL || "http://localhost:5000";

  let countryData;
  
  try {
    const res = await fetch(`${API_URL}/api/v1/countries/${slug}`, {
      next: { revalidate: 60 }, // cache for 1 minute
    });
    
    if (!res.ok) {
      console.error(`Backend returned ${res.status} for country slug: ${slug}`);
      notFound();
    }
    
    countryData = await res.json();
  } catch (error) {
    console.error("Error fetching country data:", error);
    notFound();
  }

  return (
    <CountryClient countryData={countryData} slug={slug} />
  );
}
