"use client";

import TiltedCard from "@/components/TiltedCard/TiltedCard";
import "./TutorialSection.css";

interface TutorialSectionProps {
  videoUrl?: string;
}

export default function TutorialSection({ videoUrl = "#" }: TutorialSectionProps) {
  return (
    <section className="tutorial-section" aria-labelledby="tutorial-heading">
      <h2 id="tutorial-heading" className="sr-only">
        Learn to Solve the Cube
      </h2>

      {/* Heading + Description */}
      <div className="tutorial-text">
        <h3 className="tutorial-title">
          Learn the <span className="tutorial-title-accent">Algorithm</span>
        </h3>
        <p className="tutorial-description">
          Master the art of solving a Rubik&apos;s Cube step by step.
          Watch the complete tutorial and unlock the secrets behind every twist.
        </p>
      </div>

      {/* TiltedCard */}
      <div className="tutorial-card-wrapper">
        <TiltedCard
          imageSrc="/cube-tutorial.png"
          altText="Watch Cube Solving Tutorial"
          captionText="▶ Watch Tutorial"
          containerHeight="380px"
          containerWidth="380px"
          imageHeight="360px"
          imageWidth="360px"
          rotateAmplitude={16}
          scaleOnHover={1.12}
          showMobileWarning={false}
          showTooltip
          displayOverlayContent
          href={videoUrl}
          overlayContent={
            <div>
              <p className="tilted-card-overlay-text">
                How to Solve a Rubik&apos;s Cube
              </p>
              <p className="tilted-card-overlay-subtitle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Watch Tutorial
              </p>
            </div>
          }
        />
      </div>
    </section>
  );
}
