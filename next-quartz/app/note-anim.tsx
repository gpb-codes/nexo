"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

export default function NoteAnim({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const targets = ref.current.querySelectorAll<HTMLElement>("[data-animate]");
    if (!targets.length) return;
    animate(targets, {
      translateY: [14, 0],
      opacity: [0, 1],
      duration: 620,
      delay: (_el, i) => (i ?? 0) * 24,
      ease: "outQuad",
    });
  }, []);

  return <div ref={ref}>{children}</div>;
}
