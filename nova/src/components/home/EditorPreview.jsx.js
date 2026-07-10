import React, { useEffect, useState } from "react";
import { html } from "../../lib/html.js";
import { motion, AnimatePresence } from "framer-motion";
import { THEMES } from "../../lib/themes.js";
import { useSettings } from "../theme/ThemeProvider.jsx.js";
import { CheckSquare, Square } from "lucide-react";

export default function EditorPreview() {
  const [index, setIndex] = useState(0);
  const { reduceMotion } = useSettings();

  useEffect(() => {
    if (reduceMotion) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % THEMES.length), 2600);
    return () => clearInterval(id);
  }, [reduceMotion]);

  const theme = THEMES[index];

  return html`
    <${motion.section}
      initial=${reduceMotion ? false : { opacity: 0, y: 40 }}
      whileInView=${{ opacity: 1, y: 0 }}
      viewport=${{ once: true, margin: "-100px" }}
      transition=${{ duration: 0.6, ease: "easeOut" }}
      class="max-w-2xl mx-auto px-6 py-24"
    >
      <p class="text-center text-sm text-muted mb-6">One editor. Five very different moods.</p>
      <div data-theme=${theme.id} class="rounded-nova border border-border overflow-hidden shadow-nova">
        <div style=${{ background: "var(--bg)" }} class="px-6 py-8 min-h-[280px]">
          <${AnimatePresence} mode="wait">
            <${motion.div}
              key=${theme.id}
              initial=${reduceMotion ? false : { opacity: 0 }}
              animate=${{ opacity: 1 }}
              exit=${{ opacity: 0 }}
              transition=${{ duration: 0.4 }}
            >
              <h3
                class="text-2xl font-semibold mb-4"
                style=${{ fontFamily: "var(--font-display)", color: "var(--text)" }}
              >
                Trip planning
              </h3>
              <div class="flex items-center gap-2 mb-2" style=${{ color: "var(--text)", fontFamily: "var(--font-body)" }}>
                <${CheckSquare} size=${16} style=${{ color: "var(--accent)" }} />
                <span style=${{ textDecoration: "line-through", opacity: 0.6 }}>Book flights</span>
              </div>
              <div class="flex items-center gap-2 mb-4" style=${{ color: "var(--text)", fontFamily: "var(--font-body)" }}>
                <${Square} size=${16} style=${{ color: "var(--muted)" }} />
                <span>Reserve a place to stay</span>
              </div>
              <blockquote
                class="pl-3 mb-4"
                style=${{ borderLeft: "2px solid var(--accent)", color: "var(--muted)", fontFamily: "var(--font-body)", fontStyle: "italic" }}
              >
                "Pack light. Bring the good camera."
              </blockquote>
              <span
                class="inline-block text-xs px-2 py-1 rounded-nova"
                style=${{ background: "var(--surface-2)", color: "var(--muted)", border: "1px solid var(--border)" }}
              >
                ${theme.name} mode
              </span>
            <//>
          <//>
        </div>
      </div>
    <//>
  `;
}
