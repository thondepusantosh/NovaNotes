import React, { useEffect, useMemo, useState } from "react";
import { html } from "../../lib/html.js";
import { motion } from "framer-motion";
import { BLOCK_TYPES } from "../../lib/blocks.js";
import {
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  List,
  ListOrdered,
  ChevronRight,
  Quote,
  Code2,
  Minus,
  ImagePlus,
  Type,
} from "lucide-react";

const ICONS = {
  paragraph: Type,
  heading1: Heading1,
  heading2: Heading2,
  heading3: Heading3,
  todo: CheckSquare,
  bulleted: List,
  numbered: ListOrdered,
  toggle: ChevronRight,
  quote: Quote,
  code: Code2,
  divider: Minus,
  file: ImagePlus,
};

export default function SlashCommandMenu({ rect, query, onSelect, onClose, reduceMotion }) {
  const items = useMemo(() => {
    const q = query.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
    return Object.entries(BLOCK_TYPES)
      .filter(([type, meta]) => {
        if (!q) return true;
        const label = meta.label.toLowerCase().replace(/[^a-z0-9]/g, "");
        return label.includes(q) || type.includes(q);
      })
      .map(([type, meta]) => ({ type, ...meta }));
  }, [query]);

  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (items[activeIndex]) onSelect(items[activeIndex].type);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [items, activeIndex, onSelect, onClose]);

  if (!rect) return null;

  const style = {
    position: "fixed",
    left: rect.left,
    top: rect.bottom + 6,
    zIndex: 50,
  };

  return html`
    <${motion.div}
      initial=${reduceMotion ? false : { opacity: 0, y: -4 }}
      animate=${{ opacity: 1, y: 0 }}
      exit=${{ opacity: 0, y: -4 }}
      transition=${{ duration: 0.12 }}
      style=${style}
      class="w-64 max-h-72 overflow-y-auto bg-surface border border-border rounded-nova shadow-nova py-1"
    >
      ${items.length === 0
        ? html`<p class="px-3 py-2 text-xs text-muted">No matching blocks</p>`
        : items.map(
            (item, i) => html`
              <button
                key=${item.type}
                class="w-full flex items-center gap-2.5 px-3 py-1.5 text-left text-sm ${i === activeIndex
                  ? "bg-surface2 text-text"
                  : "text-muted hover:bg-surface2 hover:text-text"}"
                onMouseEnter=${() => setActiveIndex(i)}
                onMouseDown=${(e) => e.preventDefault()}
                onClick=${() => onSelect(item.type)}
              >
                <span class="w-6 h-6 rounded-nova border border-border flex items-center justify-center shrink-0">
                  <${ICONS[item.type]} size=${13} />
                </span>
                <span class="flex flex-col">
                  <span class="leading-tight">${item.label}</span>
                  <span class="text-[11px] text-muted leading-tight">${item.description}</span>
                </span>
              </button>
            `
          )}
    <//>
  `;
}
