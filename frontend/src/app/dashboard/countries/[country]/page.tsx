import React from "react";
import { notFound } from "next/navigation";
import { getCountryIntelligence } from "@/lib/countryData";
import { CountryClient } from "./CountryClient";

export default async function CountryIntelligencePage({ params }: { params: Promise<{ country: string }> }) {
  const resolvedParams = await params;
  const slug = resolvedParams.country;
  
  // Convert slug back to proper name or match against a mapping.
  // getCountryIntelligence maps the slug if provided correctly.
  let countryData;
  try {
    countryData = await getCountryIntelligence(slug);
  } catch (error) {
    console.error(error);
    notFound();
  }

  if (!countryData) {
    notFound();
  }

  return (
    <CountryClient countryData={countryData} slug={slug} />
  );
}
