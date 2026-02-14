import CubexHero from "@/components/CubexHero";
import Cubes from "@/components/Cubes/Cubes";
import ScrollVelocity from "@/components/ScrollVelocity/ScrollVelocity";
import ScrollReveal from "@/components/ScrollReveal/ScrollReveal";
import HeroAfterSection from "@/components/HeroAfterSection";

export default function Home() {
  return (
    <main className="w-full bg-black min-h-screen">
      {/* Hero: Unicorn Studio CUBEX embed */}
      <CubexHero />

      {/* 3D Cube grid effect - Top separator with ripple */}
      <Cubes
        gridCols={20}
        gridRows={3}
        maxAngle={65}
        radius={2}
        autoAnimate={false}
        rippleOnClick={true}
        rippleColor="#48D1FF"
        rippleSpeed={2.5}
        borderStyle="1px dashed rgba(72, 209, 255, 0.4)"
        faceColor="#000000"
      />

      {/* Clean separator - scrolling text */}
      <ScrollVelocity />

      {/* 3D Cube grid effect - Bottom separator with ripple */}
      <Cubes
        gridCols={20}
        gridRows={3}
        maxAngle={65}
        radius={2}
        autoAnimate={false}
        rippleOnClick={true}
        rippleColor="#7DD3C8"
        rippleSpeed={2.5}
        borderStyle="1px dashed rgba(125, 211, 200, 0.4)"
        faceColor="#000000"
        
      />

      {/* Text reveal section */}
      <ScrollReveal
        ctaText="Explore the Engine"
        autoTriggerPlay={false}
        rotationEnd="bottom+=50%"
        wordAnimationEnd="bottom+=150%"
      >
        Forty-three quintillion possibilities, one optimal path.
        CUBEX doesn't just solve; it masters the geometry of logic.
        Through AI-driven scanning and real-time algorithm synthesis,
        the impossible becomes inevitable.
      </ScrollReveal>

      {/* Premium visual section */}
      <HeroAfterSection />
    </main>
  );
}
