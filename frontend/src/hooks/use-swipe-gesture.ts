"use client";

import { useState, useRef, useCallback } from "react";

interface SwipeGestureOptions {
  threshold?: number;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

export function useSwipeGesture({
  threshold = 80,
  onSwipeLeft,
  onSwipeRight,
}: SwipeGestureOptions = {}) {
  const [swiping, setSwiping] = useState(false);
  const [offsetX, setOffsetX] = useState(0);

  const startX = useRef(0);
  const startY = useRef(0);
  const currentX = useRef(0);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    currentX.current = startX.current;
    setSwiping(true);
    setOffsetX(0);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    currentX.current = e.touches[0].clientX;
    const deltaX = currentX.current - startX.current;
    const deltaY = e.touches[0].clientY - startY.current;

    // Only activate swipe if horizontal movement exceeds vertical
    if (Math.abs(deltaX) > Math.abs(deltaY) + 10) {
      setOffsetX(deltaX);
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    setSwiping(false);
    const deltaX = currentX.current - startX.current;

    if (Math.abs(deltaX) >= threshold) {
      if (deltaX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (deltaX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }

    setOffsetX(0);
    startX.current = 0;
    startY.current = 0;
    currentX.current = 0;
  }, [threshold, onSwipeLeft, onSwipeRight]);

  return {
    swiping,
    offsetX,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
  };
}
