"use client";

import { useEffect, useState, useRef } from "react";

export function useScrollDirection() {
  const [direction, setDirection] = useState<"up" | "down">("up");
  const [isAtTop, setIsAtTop] = useState(true);
  const prevScroll = useRef(0);

  useEffect(() => {
    const handler = () => {
      const current = window.scrollY;
      setIsAtTop(current < 10);
      if (current > prevScroll.current && current > 50) {
        setDirection("down");
      } else if (current < prevScroll.current) {
        setDirection("up");
      }
      prevScroll.current = current;
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return { direction, isAtTop };
}
