"use client";

import CustomCursor from "@/components/CustomCursor/CustomCursor";
import ScrollProgress from "@/components/ScrollProgress/ScrollProgress";
import IntroLoader from "@/components/IntroLoader/IntroLoader";

export default function GlobalOverlays() {
  return (
    <>
      <IntroLoader />
      <ScrollProgress />
      <CustomCursor />
    </>
  );
}
