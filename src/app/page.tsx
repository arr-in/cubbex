import CubexHero from "@/components/CubexHero";
import Cubes from "@/components/Cubes/Cubes";
import ScrollReveal from "@/components/ScrollReveal/ScrollReveal";
import HeroAfterSection from "@/components/HeroAfterSection";
import HeroText from "@/components/HeroText/HeroText";

export default function Home() {
  return (
    <main className="w-full bg-black min-h-screen">
      {/* Hero: Unicorn Studio CUBEX embed with large text overlay */}
      <CubexHero />

      {/* 3D Cube grid effect - cleaner design */}
      <Cubes
        gridCols={18}
        gridRows={2}
        maxAngle={120}
        radius={3}
        autoAnimate={false}
        rippleOnClick={true}
        rippleColor="#48D1FF"
        rippleSpeed={3}
        borderStyle="1px solid rgba(72, 209, 255, 0.15)"
        faceColor="rgba(0, 0, 0, 0.3)"
        cellGap={{ col: 8, row: 8 }}
      />

      {/* Text reveal section */}
      <ScrollReveal
        ctaText="Explore the Engine"
        autoTriggerPlay={false}
        rotationEnd="bottom+=50%"
        wordAnimationEnd="bottom+=150%"
      >
        Forty-three quintillion possibilities, one optimal path.
        CUBEX does not just solve; it masters the geometry of logic.
        Through AI-driven scanning and real-time algorithm synthesis,
        the impossible becomes inevitable.
      </ScrollReveal>

      {/* Premium visual section */}
      <HeroAfterSection />
    </main>
  );
}
