"use client";

import React from "react";
import { cn } from "@/lib/utils";

export default function ShinyText({
  children,
  speed = 3,
  className = "",
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center text-app-primary transition-app",
        className
      )}
    >
      {children}
    </span>
  );
}
