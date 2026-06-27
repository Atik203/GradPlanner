"use client";

import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/store/store";
import { setProfile } from "@/lib/store/slices/profileSlice";
import { profileApi } from "@/lib/api";
import { ApiErrorAlert } from "@/components/shared/ApiErrorAlert";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { OnboardingWizard } from "./OnboardingWizard";

export function OnboardingGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const profile = useAppSelector((s) => s.profile.profile);
  const [loading, setLoading] = useState(!profile);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await profileApi.get();
      dispatch(setProfile(data));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load profile";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!profile) {
      loadProfile();
    }
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <ApiErrorAlert
        error={error}
        onRetry={loadProfile}
        className="mx-auto max-w-md mt-16"
      />
    );
  }

  if (profile && !profile.isOnboarded) {
    return <OnboardingWizard />;
  }

  return <>{children}</>;
}
