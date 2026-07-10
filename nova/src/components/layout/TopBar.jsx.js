import React from "react";
import { html } from "../../lib/html.js";
import { motion, AnimatePresence } from "framer-motion";
import { navigate } from "../../lib/router.js";
import { PanelLeft, Command, ChevronRight } from "lucide-react";

export default function TopBar({ ancestors, saveState, onOpenSidebar, onOpenPalette, showSidebarToggle }) {
  return html`
    <header class="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-border bg-bg">
      ${showSidebarToggle
        ? html`
            <button
              class="p-1.5 rounded-nova hover:bg-surface2 text-muted hover:text-text"
              onClick=${onOpenSidebar}
              aria-label="Open sidebar"
            >
              <${PanelLeft} size=${16} />
            <//>
          `
        : null}

      <nav class="flex items-center gap-1 text-sm text-muted min-w-0 flex-1">
        ${(ancestors || []).map(
          (note, i) => html`
            <span key=${note.id} class="flex items-center gap-1 min-w-0">
              ${i > 0 ? html`<${ChevronRight} size=${12} class="shrink-0 opacity-50" />` : null}
              <button
                class="truncate hover:text-text ${i === ancestors.length - 1 ? "text-text" : ""}"
                onClick=${() => navigate(`/notes/${note.id}`)}
              >
                ${note.title || "Untitled"}
              </button>
            </span>
          `
        )}
      </nav>

      <div class="w-16 text-right shrink-0">
        <${AnimatePresence}>
          ${saveState === "saving"
            ? html`<${motion.span}
                key="saving"
                initial=${{ opacity: 0 }}
                animate=${{ opacity: 1 }}
                exit=${{ opacity: 0 }}
                class="text-xs text-muted"
              >Saving…<//>`
            : saveState === "saved"
            ? html`<${motion.span}
                key="saved"
                initial=${{ opacity: 0 }}
                animate=${{ opacity: 1 }}
                exit=${{ opacity: 0 }}
                class="text-xs text-muted"
              >Saved<//>`
            : null}
        <//>
      </div>

      <button
        class="flex items-center gap-1.5 px-2 py-1 rounded-nova border border-border text-xs text-muted hover:text-text hover:bg-surface2"
        onClick=${onOpenPalette}
      >
        <${Command} size=${12} /> K
      </button>
    </header>
  `;
}
