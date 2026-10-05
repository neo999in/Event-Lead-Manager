"use client";

import React, { useEffect, useState, useRef } from "react";

export default function CountUp({
  to = 0,
  duration = 600,
  suffix = "",
  className = "",
}) {
  const [count, setCount] = useState(to);
  const prevToRef = useRef(to);
  const startTimeRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(to);
      return;
    }

    const startValue = prevToRef.current;
    const endValue = to;
    prevToRef.current = to;

    if (startValue === endValue) {
      setCount(to);
      return;
    }
    startTimeRef.current = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic: 1 - (1 - x)^3
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(startValue + (endValue - startValue) * easeProgress);

      setCount(currentVal);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [to, duration]);

  return (
    <span className={className}>
      {count}
      {suffix}
    </span>
  );
}
