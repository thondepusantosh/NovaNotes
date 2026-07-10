import React from "react";
import { html } from "../../lib/html.js";
import { Check } from "lucide-react";

export default function ThemePreviewCard({ theme, active, onSelect }) {
  return html`
    <button
      onClick=${onSelect}
      class="text-left rounded-nova border-2 overflow-hidden transition-shadow ${active
        ? "border-accent shadow-nova"
        : "border-border hover:border-muted"}"
    >
      <div
        data-theme=${theme.id}
        class="p-4 h-32 flex flex-col justify-between"
        style=${{ background: "var(--bg)", color: "var(--text)" }}
      >
        <div class="flex items-center justify-between">
          <span class="font-display text-sm font-semibold" style=${{ fontFamily: "var(--font-display)" }}>
            ${theme.name}
          </span>
          ${active ? html`<${Check} size=${14} style=${{ color: "var(--accent)" }} />` : null}
        </div>
        <div
          class="rounded-nova p-2 text-xs space-y-1"
          style=${{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)" }}
        >
          <div class="h-1.5 w-3/4 rounded" style=${{ background: "var(--accent)" }} />
          <div class="h-1.5 w-full rounded" style=${{ background: "var(--muted)", opacity: 0.4 }} />
          <div class="h-1.5 w-1/2 rounded" style=${{ background: "var(--muted)", opacity: 0.4 }} />
        </div>
      </div>
      <div class="px-3 py-2 bg-surface border-t border-border">
        <p class="text-xs text-muted">${theme.description}</p>
      </div>
    </button>
  `;
}
