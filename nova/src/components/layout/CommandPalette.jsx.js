import React, { useEffect, useMemo, useRef, useState } from "react";
import { html } from "../../lib/html.js";
import { motion, AnimatePresence } from "framer-motion";
import { notesRepo } from "../../lib/db.js";
import { useLiveQuery } from "../../lib/useLiveQuery.js";
import { searchNotes } from "../../lib/search.js";
import { navigate } from "../../lib/router.js";
import { Search, FileText, Plus, Settings as SettingsIcon, Home } from "lucide-react";

export default function CommandPalette({ open, onClose, reduceMotion }) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const notes = useLiveQuery(() => notesRepo.listAll(), [], []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const results = useMemo(() => {
    const q = query.trim();
    if (!q) return [];
    return searchNotes(notes || [], q).slice(0, 8);
  }, [notes, query]);

  const actions = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = [
      { id: "new", label: "New note", icon: Plus, run: async () => {
          const note = await notesRepo.createNote({});
          navigate(`/notes/${note.id}`);
        } },
      { id: "home", label: "Go home", icon: Home, run: () => navigate("/") },
      { id: "settings", label: "Open settings", icon: SettingsIcon, run: () => navigate("/settings") },
    ];
    return q ? base.filter((a) => a.label.toLowerCase().includes(q)) : base;
  }, [query]);

  const items = [
    ...results.map((r) => ({ kind: "note", ...r })),
    ...actions.map((a) => ({ kind: "action", ...a })),
  ];

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e) {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, items.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = items[activeIndex];
        if (!item) return;
        if (item.kind === "note") navigate(`/notes/${item.note.id}`);
        else item.run();
        onClose();
      }
    }
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [open, items, activeIndex, onClose]);

  if (!open) return null;

  return html`
    <${AnimatePresence}>
      <${motion.div}
        class="fixed inset-0 bg-black/40 z-[100] flex items-start justify-center pt-[15vh]"
        initial=${reduceMotion ? false : { opacity: 0 }}
        animate=${{ opacity: 1 }}
        exit=${{ opacity: 0 }}
        onClick=${onClose}
      >
        <${motion.div}
          initial=${reduceMotion ? false : { opacity: 0, y: -10, scale: 0.98 }}
          animate=${{ opacity: 1, y: 0, scale: 1 }}
          exit=${{ opacity: 0, y: -10, scale: 0.98 }}
          transition=${{ duration: 0.15 }}
          class="w-full max-w-lg bg-surface border border-border rounded-nova shadow-nova overflow-hidden"
          onClick=${(e) => e.stopPropagation()}
        >
          <div class="flex items-center gap-2 px-4 py-3 border-b border-border">
            <${Search} size=${16} class="text-muted" />
            <input
              ref=${inputRef}
              value=${query}
              onInput=${(e) => {
                setQuery(e.target.value);
                setActiveIndex(0);
              }}
              placeholder="Search notes or run a command…"
              class="flex-1 bg-transparent outline-none text-sm"
            />
          </div>
          <div class="max-h-80 overflow-y-auto py-2">
            ${items.length === 0
              ? html`<p class="px-4 py-6 text-sm text-muted text-center">Type to search, or pick an action.</p>`
              : items.map(
                  (item, i) => html`
                    <button
                      key=${item.kind + (item.kind === "note" ? item.note.id : item.id)}
                      class="w-full flex items-center gap-3 px-4 py-2 text-left text-sm ${i === activeIndex
                        ? "bg-surface2 text-text"
                        : "text-muted hover:bg-surface2 hover:text-text"}"
                      onMouseEnter=${() => setActiveIndex(i)}
                      onClick=${() => {
                        if (item.kind === "note") navigate(`/notes/${item.note.id}`);
                        else item.run();
                        onClose();
                      }}
                    >
                      <${item.kind === "note" ? FileText : item.icon} size=${14} class="shrink-0 opacity-70" />
                      <span class="flex-1 min-w-0">
                        <span class="block truncate">${item.kind === "note" ? item.note.title || "Untitled" : item.label}</span>
                        ${item.kind === "note" && item.snippet
                          ? html`<span class="block text-xs text-muted truncate">${item.snippet}</span>`
                          : null}
                      </span>
                    </button>
                  `
                )}
          </div>
        <//>
      <//>
    <//>
  `;
}
