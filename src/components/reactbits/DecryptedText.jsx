"use client";

import React, { useState, useEffect, useRef } from "react";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789!@#$&";

export default function DecryptedText({
  text = "",
  speed = 40,
  maxIterations = 8,
  className = "",
  triggerOnHover = true,
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isAnimating, setIsAnimating] = useState(false);
  const intervalRef = useRef(null);

  const triggerAnimation = () => {
    if (isAnimating) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setIsAnimating(true);
    let iteration = 0;

    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setDisplayText((prev) =>
        text
          .split("")
          .map((char, index) => {
            if (char === " " || char === "—" || char === "-") return char;
            if (index < iteration) {
              return text[index];
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("")
      );

      iteration += 1;

      if (iteration > text.length + maxIterations) {
        clearInterval(intervalRef.current);
        setDisplayText(text);
        setIsAnimating(false);
      }
    }, speed);
  };

  useEffect(() => {
    setDisplayText(text);
    return () => clearInterval(intervalRef.current);
  }, [text]);

  return (
    <span
      className={className}
      onMouseEnter={triggerOnHover ? triggerAnimation : undefined}
    >
      {displayText}
    </span>
  );
}
