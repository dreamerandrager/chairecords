'use client';

import * as React from 'react';

type ChaiLoaderProps = {
  size?: number;         // px
  label?: string;        // a11y
  className?: string;    // e.g. "text-foreground/80"
};

export function ChaiLoader({ size = 56, label = 'Brewing…', className }: ChaiLoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      className={['inline-flex items-center justify-center', className].filter(Boolean).join(' ')}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="brew"
      >
        {/* saucer */}
        <ellipse cx="28" cy="48" rx="16" ry="4" opacity="0.25" />

        {/* cup */}
        <rect x="12" y="24" width="32" height="20" rx="4" className="cup" />
        {/* handle */}
        <path d="M44 28c6 0 8 4 8 6s-2 6-8 6" />

        {/* steam wisps */}
        <path className="steam s1" d="M22 22c0-3 4-3 4-6" />
        <path className="steam s2" d="M28 20c0-3 4-3 4-6" />
        <path className="steam s3" d="M34 22c0-3 4-3 4-6" />
      </svg>

      <style jsx>{`
        /* gentle “brewing” bob */
        .brew { transform-origin: 28px 48px; animation: bob 2.2s ease-in-out infinite; }
        @keyframes bob { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-1.5px) } }

        /* steam rises + fades */
        .steam { opacity: 0; animation: rise 1.6s ease-in-out infinite; }
        .steam.s1 { animation-delay: 0.0s; }
        .steam.s2 { animation-delay: 0.3s; }
        .steam.s3 { animation-delay: 0.6s; }

        @keyframes rise {
          0%   { opacity: 0; transform: translateY(4px); }
          25%  { opacity: 0.6; }
          60%  { opacity: 0.2; }
          100% { opacity: 0; transform: translateY(-10px); }
        }

        /* keep the cup filled shape looking solid if you ever add fill */
        .cup { }

        /* accessibility: stop motion for users who prefer reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .brew, .steam { animation: none; }
          .steam { opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}
