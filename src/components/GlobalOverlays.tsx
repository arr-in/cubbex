"use client";

import CustomCursor from "@/components/CustomCursor/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress/ScrollProgress";

export default function GlobalOverlays() {
  return (
    <>
      <ScrollProgress />
      <CustomCursor />
    </>
  );
}
