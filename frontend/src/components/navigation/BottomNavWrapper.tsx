"use client";

import React, { useState } from "react";
import { BottomNav } from "@/components/navigation/BottomNav";
import { MoreSheet } from "@/components/navigation/MoreSheet";

export function BottomNavWrapper() {
  const [moreOpen, setMoreOpen] = useState(false);
  return (
    <>
      <BottomNav onMoreClick={() => setMoreOpen(true)} />
      <MoreSheet open={moreOpen} onOpenChange={setMoreOpen} />
    </>
  );
}
