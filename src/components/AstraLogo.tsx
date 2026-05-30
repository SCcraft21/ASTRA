import React from "react";

interface AstraLogoProps {
  className?: string;
  size?: number | string;
}

export default function AstraLogo({ className = "", size = "100%" }: AstraLogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Soft cream-peach custom gradient for background oval */}
        <linearGradient id="creamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFF2E5" />
          <stop offset="100%" stopColor="#FFE0C4" />
        </linearGradient>
        
        {/* Soft lavender-periwinkle gradient for overlapping dome */}
        <linearGradient id="periwinkleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#C4BCFF" />
          <stop offset="100%" stopColor="#9C92EE" />
        </linearGradient>

        {/* Dynamic bright/dark periwinkle accent gradient at base */}
        <linearGradient id="baseAccentGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8C81E8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#6E62DC" />
        </linearGradient>
      </defs>

      {/* 1. Underlying Cream Egg-shaped Oval */}
      <path
        d="M 100,25 C 150,25 170,75 170,120 C 170,165 140,178 100,178 C 60,178 30,165 30,120 C 30,75 50,25 100,25 Z"
        fill="url(#creamGradient)"
        className="transition-all duration-300"
      />

      {/* 2. Overlapping Lavender/Periwinkle Rounded Dome Layer */}
      <path
        d="M 100,52 C 142,52 161,95 161,131 C 161,162 135,170 100,170 C 65,170 39,162 39,131 C 39,95 58,52 100,52 Z"
        fill="url(#periwinkleGradient)"
        className="transition-all duration-300"
      />

      {/* 3. Bottom Layer shadow-curve accent */}
      <path
        d="M 39,131 C 39,155 60,170 100,170 C 140,170 161,155 161,131 C 161,141 138,153 100,153 C 62,153 39,141 39,131 Z"
        fill="url(#baseAccentGradient)"
      />
    </svg>
  );
}
