import React from "react";
import { html } from "../lib/html.js";
import { THEMES } from "../lib/themes.js";
import { useSettings } from "../components/theme/ThemeProvider.jsx.js";
import ThemePreviewCard from "../components/theme/ThemePreviewCard.jsx.js";
import { navigate } from "../lib/router.js";
import { ArrowLeft } from "lucide-react";

const FONT_SIZES = [
  { id: "sm", label: "Small" },
  { id: "md", label: "Medium" },
  { id: "lg", label: "Large" },
];

const SIDEBAR_WIDTHS = [
  { id: "sm", label: "Narrow" },
  { id: "md", label: "Default" },
  { id: "lg", label: "Wide" },
];

function SegmentedControl({ options, value, onChange }) {
  return html`
    <div class="inline-flex rounded-nova border border-border p-0.5 bg-surface">
      ${options.map(
        (opt) => html`
          <button
            key=${opt.id}
            onClick=${() => onChange(opt.id)}
            class="px-3 py-1.5 text-sm rounded-nova ${value === opt.id
              ? "bg-accent text-accent-text"
              : "text-muted hover:text-text"}"
          >
            ${opt.label}
          </button>
        `
      )}
    </div>
  `;
}

export default function Settings() {
  const {
    theme,
    setTheme,
    fontSize,
    setFontSize,
    sidebarWidth,
    setSidebarWidth,
    reduceMotion,
    setReduceMotion,
  } = useSettings();

  return html`
    <div class="min-h-screen">
      <header class="h-12 flex items-center gap-2 px-4 border-b border-border">
        <button
          onClick=${() => navigate("/notes")}
          class="flex items-center gap-1.5 text-sm text-muted hover:text-text"
        >
          <${ArrowLeft} size=${15} /> Back to notes
        </button>
      </header>

      <div class="max-w-2xl mx-auto px-6 py-10 flex flex-col gap-10">
        <div>
          <h1 class="font-display text-2xl font-semibold mb-1">Settings</h1>
          <p class="text-sm text-muted">Make Nova feel like yours.</p>
        </div>

        <section>
          <h2 class="text-sm font-semibold mb-3">Theme</h2>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            ${THEMES.map(
              (t) => html`
                <${ThemePreviewCard}
                  key=${t.id}
                  theme=${t}
                  active=${theme === t.id}
                  onSelect=${() => setTheme(t.id)}
                />
              `
            )}
          </div>
        </section>

        <section class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold">Font size</h2>
            <p class="text-xs text-muted">Adjusts reading size across the app.</p>
          </div>
          <${SegmentedControl} options=${FONT_SIZES} value=${fontSize} onChange=${setFontSize} />
        </section>

        <section class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold">Sidebar width</h2>
            <p class="text-xs text-muted">Change how much room the note tree takes.</p>
          </div>
          <${SegmentedControl} options=${SIDEBAR_WIDTHS} value=${sidebarWidth} onChange=${setSidebarWidth} />
        </section>

        <section class="flex items-center justify-between">
          <div>
            <h2 class="text-sm font-semibold">Reduce motion</h2>
            <p class="text-xs text-muted">Turns off non-essential animation.</p>
          </div>
          <button
            onClick=${() => setReduceMotion(!reduceMotion)}
            class="w-11 h-6 rounded-full transition-colors relative ${reduceMotion ? "bg-accent" : "bg-surface2 border border-border"}"
            aria-pressed=${reduceMotion}
            aria-label="Toggle reduce motion"
          >
            <span
              class="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all"
              style=${{ left: reduceMotion ? "22px" : "2px" }}
            />
          </button>
        </section>
      </div>
    </div>
  `;
}
