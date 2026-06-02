import React from "react";
import { notFound } from "next/navigation";
import { CountryClient } from "./CountryClient";

export default async function CountryIntelligencePage({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.country;
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  let countryData;
  
  try {
    const res = await fetch(`${API_URL}/api/v1/countries/${slug}`, {
      next: { revalidate: 60 }, // cache for 1 minute
    });
    
    if (!res.ok) {
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
