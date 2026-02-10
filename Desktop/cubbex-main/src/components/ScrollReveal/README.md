# ScrollReveal Component

A production-quality GSAP-powered scroll reveal component for CUBEX.

## Installation

```bash
npm install gsap
```

## Features
- **Per-word animation**: Opacity, blur, and rotation reveal.
- **Scroll Scrubbing**: Mapped directly to scroll progress.
- **Accessibility**: Supports `prefers-reduced-motion` (instant reveal) and ARIA attributes.
- **Performance**: GSAP dynamic imports, `will-change` hints, and target/scroller scoping.
- **Mobile Fallback**: Automatically disables expensive blur filters on mobile.

## Usage

```tsx
import ScrollReveal from '@/components/ScrollReveal';

export default function Page() {
  return (
    <main>
      {/* 1. Hero / Unicorn Intro */}
      <Hero />
      
      {/* 2. ScrollReveal Philosophy Section */}
      <ScrollReveal 
        ctaText="Solve the Unsolvable"
        autoTriggerPlay={true}
      >
        "When does a man die? When he is hit by a bullet? No! ... 
        A man dies when he is forgotten!"
      </ScrollReveal>
      
      {/* 3. Cube Video Animation (Main App) */}
      <CubeAnimation />
    </main>
  );
}
```

## Props

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `children` | `string` | - | The text to reveal. |
| `enableBlur` | `boolean` | `true` | Enables/disables the blur reveal effect. |
| `baseOpacity` | `number` | `0.12` | Starting opacity for words. |
| `baseRotation` | `number` | `10` | Starting rotation (degrees) for the text block. |
| `blurStrength` | `number` | `7` | Intensity of the starting blur. |
| `autoTriggerPlay` | `boolean` | `false` | If true, dispatches `cubex:playMicro` after reveal completes. |
| `ctaText` | `string` | - | Optional CTA button text. |

## Custom Events
- `cubex:revealComplete`: Dispatched when the text has fully scrolled into view.
- `cubex:playMicro`: Dispatched when the CTA is clicked or `autoTriggerPlay` fires.
