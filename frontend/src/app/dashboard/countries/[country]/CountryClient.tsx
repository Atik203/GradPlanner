"use client";

import React, { use } from "react";
import { notFound, useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/store";

// UI Components
import { HeroSection } from "@/components/dashboard/country/HeroSection";
import { EconomicOutlook } from "@/components/dashboard/country/EconomicOutlook";
import { CareerOutlook } from "@/components/dashboard/country/CareerOutlook";
import { VisaImmigration } from "@/components/dashboard/country/VisaImmigration";
import { CostAnalysis } from "@/components/dashboard/country/CostAnalysis";
import { ScholarshipsCard } from "@/components/dashboard/country/ScholarshipsCard";
import { TimelineRoadmap } from "@/components/dashboard/country/TimelineRoadmap";

// Shared Badges / Components
import { TierBadge } from "@/components/badges/TierBadge";
import { FundingStatusBadge } from "@/components/badges/FundingStatusBadge";
import { StatusBadge } from "@/components/badges/StatusBadge";
import { EmptyState } from "@/components/shared/EmptyState";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { School, GraduationCap, FileText, ArrowRight } from "lucide-react";
import Link from "next/link";
import { CountryIntelligence } from "@/lib/countryData";

export function CountryClient({ countryData, slug }: { countryData: CountryIntelligence, slug: string }) {
  const router = useRouter();

  // Dynamic Data from Redux
  const universities = useAppSelector((state) => state.universities.items) || [];
  const professors = useAppSelector((state) => state.professors.items) || [];
  const documents = useAppSelector((state) => state.documents.items) || [];

  if (!countryData) {
    notFound();
  }

  // Filter dynamic data for this specific country
  const countryName = countryData.summary?.country || slug;
  const countryUnis = universities.filter((u) => u.country.toLowerCase() === countryName.toLowerCase());
  const countryUniIds = new Set(countryUnis.map((u) => u.id));
  const countryProfs = professors.filter((p) => p.universityId && countryUniIds.has(p.universityId));
  const countryDocs = documents.filter((d) => !d.country || d.country.toLowerCase() === countryName.toLowerCase());

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hero Section */}
      <HeroSection data={countryData} />

      {/* Grid: Economics & Career */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EconomicOutlook data={countryData} />
        <CareerOutlook data={countryData} />
      </div>

      {/* Grid: Visa, Cost, Scholarships */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <VisaImmigration data={countryData} />
        <CostAnalysis data={countryData} />
        <ScholarshipsCard data={countryData} />
      </div>

      {/* Timeline Section */}
      {countryData.timeline.phases && (
        <TimelineRoadmap data={countryData} />
      )}

      {/* Section 6: Required Documents */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Required Documents</h2>
          <Link href="/dashboard/documents" className="text-sm text-primary hover:underline flex items-center gap-1">
            Manage Documents <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {countryDocs.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No Documents Found"
            description="You haven't tracked any documents yet."
            actionLabel="Add Document"
            onAction={() => router.push(`/dashboard/documents/new?country=${slug}`)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {countryDocs.slice(0, 6).map((doc) => (
              <Card key={doc.id} className="border-border/60 bg-card/20 backdrop-blur-md">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.type}</p>
                  </div>
                  <StatusBadge status={doc.status} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section 8: University Explorer */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">University Ecosystem</h2>
          <Link href="/dashboard/universities" className="text-sm text-primary hover:underline flex items-center gap-1">
            Browse All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {countryUnis.length === 0 ? (
          <EmptyState
            icon={School}
            title={`No Universities Tracked in ${countryName}`}
            description="Start adding universities to evaluate your chances."
            actionLabel="Add University"
            onAction={() => router.push(`/dashboard/universities/new?country=${slug}`)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {countryUnis.map((uni) => (
              <Card key={uni.id} className="border-border/60 bg-card/20 backdrop-blur-md">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-foreground">{uni.name}</h3>
                      <p className="text-xs text-muted-foreground">{uni.program || "General Track"}</p>
                    </div>
                    <TierBadge tier={uni.tier} />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                    <div className="text-muted-foreground">Tuition: <span className="text-foreground font-medium">{uni.tuitionPerYr || "Unknown"}</span></div>
                    <div className="text-muted-foreground">Min CGPA: <span className="text-foreground font-medium">{uni.minCgpa || "N/A"}</span></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Section 9: Professor Opportunities */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-foreground">Professor Opportunities</h2>
          <Link href="/dashboard/professors" className="text-sm text-primary hover:underline flex items-center gap-1">
            View Outreach <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {countryProfs.length === 0 ? (
          <EmptyState
            icon={GraduationCap}
            title="No Professors Contacted"
            description="Find professors at your target universities to secure funding."
            actionLabel="Add Professor"
            onAction={() => router.push(`/dashboard/professors/new?country=${slug}`)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {countryProfs.map((prof) => (
              <Card key={prof.id} className="border-border/60 bg-card/20 backdrop-blur-md">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-foreground">{prof.name}</h3>
                      <p className="text-xs text-muted-foreground">{prof.researchInterests || "Various"}</p>
                    </div>
                    <FundingStatusBadge status={prof.fundingStatus} />
                  </div>
                  <div className="mt-4 flex items-center justify-between">
                    <StatusBadge status={prof.status} />
                    {prof.researchFitScore && (
                      <span className="text-xs font-semibold text-primary">Fit: {prof.researchFitScore}/10</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
