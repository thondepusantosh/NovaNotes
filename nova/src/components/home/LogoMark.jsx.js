import React from "react";
import { html } from "../../lib/html.js";

// Minimal comet/orbit arc mark. Uses currentColor so it reskins per theme
// with zero JS branching — wrap in an element that sets `color`.
export default function LogoMark({ size = 28, withWordmark = false, className = "" }) {
  const mark = html`
    <svg
      width=${size}
      height=${size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      class=${className}
    >
      <path
        d="M5 24 A15 15 0 0 1 27 8"
        stroke="currentColor"
        stroke-width="2.75"
        stroke-linecap="round"
        opacity="0.9"
      />
      <circle cx="27" cy="8" r="3.2" fill="currentColor" />
    </svg>
  `;

  if (!withWordmark) return mark;

  return html`
    <span class="inline-flex items-center gap-2.5" style=${{ color: "var(--accent)" }}>
      ${mark}
      <span class="font-display font-semibold tracking-tight" style=${{ color: "var(--text)", fontSize: size * 0.75 }}>
        Nova
      </span>
    </span>
  `;
}
