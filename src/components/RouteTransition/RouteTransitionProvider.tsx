"use client";

import { AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CubeRouteTransition from "./CubeRouteTransition";

type NavigateDetail = { to: string };

function safeToString(val: unknown): string | null {
  if (typeof val === "string") return val;
  return null;
}

export default function RouteTransitionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [active, setActive] = useState(false);
  const [target, setTarget] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "covering" | "covered" | "revealing">(
    "idle"
  );

  const lastScrollYRef = useRef(0);
  const lockedRef = useRef(false);

  const lockScroll = useCallback(() => {
    if (lockedRef.current) return;
    lockedRef.current = true;
    lastScrollYRef.current = window.scrollY;
    document.documentElement.style.scrollBehavior = "auto";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lastScrollYRef.current}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  }, []);

  const unlockScroll = useCallback(() => {
    if (!lockedRef.current) return;
    lockedRef.current = false;
    const y = lastScrollYRef.current;
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.documentElement.style.scrollBehavior = "";
    window.scrollTo(0, y);
  }, []);

  const begin = useCallback(
    (to: string) => {
      if (active) return;
      setTarget(to);
      setActive(true);
      setPhase("covering");
      lockScroll();
    },
    [active, lockScroll]
  );

  useEffect(() => {
    const onMicro = () => begin("/solve");
    const onNavigate = (e: Event) => {
      const ce = e as CustomEvent<NavigateDetail>;
      const to = safeToString(ce.detail?.to) ?? "/solve";
      begin(to);
    };

    window.addEventListener("cubex:playMicro", onMicro);
    window.addEventListener("cubex:navigate", onNavigate);
    return () => {
      window.removeEventListener("cubex:playMicro", onMicro);
      window.removeEventListener("cubex:navigate", onNavigate);
    };
  }, [begin]);

  const onCovered = useCallback(() => {
    if (!target) return;
    setPhase("covered");
    router.push(target);
  }, [router, target]);

  const onFinished = useCallback(() => {
    setPhase("idle");
    setActive(false);
    setTarget(null);
    unlockScroll();
  }, [unlockScroll]);

  const mode = useMemo(() => {
    if (!active) return "idle" as const;
    if (phase === "covered" && target && pathname === target) return "revealing" as const;
    return phase;
  }, [active, pathname, phase, target]);

  return (
    <>
      {children}
      <AnimatePresence>
        {active && (
          <CubeRouteTransition
            key="cubex-transition"
            mode={mode}
            onCovered={onCovered}
            onFinished={onFinished}
          />
        )}
      </AnimatePresence>
    </>
  );
}

