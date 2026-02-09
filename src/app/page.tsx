import CubexHero from "@/components/CubexHero";
import ScrollReveal from "@/components/ScrollReveal";

export default function Home() {
  return (
    <main className="w-full bg-black min-h-screen">
      <CubexHero />

      <ScrollReveal
        ctaText="Explore the Engine"
        autoTriggerPlay={true}
        rotationEnd="bottom+=50%"
        wordAnimationEnd="bottom+=150%"
      >
        Forty-three quintillion possibilities, one optimal path.
        CUBEX doesn't just solve; it masters the geometry of logic.
        Through AI-driven scanning and real-time algorithm synthesis,
        the impossible becomes inevitable.
      </ScrollReveal>

      {/* Additional sections can be added here */}
    </main>
  );
}
