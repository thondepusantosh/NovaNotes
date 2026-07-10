import React, { useEffect, useState } from "react";
import { html } from "../lib/html.js";
import { notesRepo } from "../lib/db.js";
import { useLiveQuery } from "../lib/useLiveQuery.js";
import { getAncestors } from "../lib/tree.js";
import { navigate } from "../lib/router.js";
import Sidebar from "../components/layout/Sidebar.jsx.js";
import TopBar from "../components/layout/TopBar.jsx.js";
import Editor from "../components/editor/Editor.jsx.js";
import { motion, AnimatePresence } from "framer-motion";
import { useSettings } from "../components/theme/ThemeProvider.jsx.js";
import { FileText, Plus } from "lucide-react";

export default function Notes({ noteId }) {
  const notes = useLiveQuery(() => notesRepo.listAll(), [], []);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [saveState, setSaveState] = useState(null);
  const { reduceMotion } = useSettings();

  useEffect(() => {
    setSaveState(null);
  }, [noteId]);

  const activeNote = (notes || []).find((n) => n.id === noteId) || null;
  const ancestors = noteId && notes ? getAncestors(notes, noteId) : [];

  async function handleCreate() {
    const note = await notesRepo.createNote({});
    navigate(`/notes/${note.id}`);
  }

  return html`
    <div class="h-screen flex overflow-hidden">
      <${AnimatePresence}>
        ${sidebarOpen
          ? html`
              <${motion.div}
                initial=${reduceMotion ? false : { x: -20, opacity: 0 }}
                animate=${{ x: 0, opacity: 1 }}
                exit=${{ x: -20, opacity: 0 }}
                transition=${{ duration: 0.18 }}
                class="fixed lg:static inset-y-0 left-0 z-40 lg:z-auto"
              >
                <${Sidebar} activeId=${noteId} onCloseMobile=${() => setSidebarOpen(false)} />
              <//>
            `
          : null}
      <//>

      ${sidebarOpen
        ? html`<div
            class="fixed inset-0 bg-black/30 z-30 lg:hidden"
            onClick=${() => setSidebarOpen(false)}
          />`
        : null}

      <div class="flex-1 min-w-0 flex flex-col">
        <${TopBar}
          ancestors=${ancestors}
          saveState=${saveState}
          showSidebarToggle=${!sidebarOpen}
          onOpenSidebar=${() => setSidebarOpen(true)}
          onOpenPalette=${() => window.dispatchEvent(new CustomEvent("nova:toggle-palette"))}
        />
        <div class="flex-1 overflow-y-auto">
          ${activeNote
            ? html`<${Editor} key=${activeNote.id} note=${activeNote} onSaveStateChange=${setSaveState} />`
            : html`
                <div class="h-full flex flex-col items-center justify-center gap-4 text-muted">
                  <${FileText} size=${32} class="opacity-40" />
                  <p class="text-sm">${notes && notes.length > 0 ? "Select a note, or create a new one." : "You don't have any notes yet."}</p>
                  <button
                    onClick=${handleCreate}
                    class="flex items-center gap-1.5 px-3 py-1.5 rounded-nova bg-accent text-accent-text text-sm hover:opacity-90"
                  >
                    <${Plus} size=${14} /> New note
                  <//>
                </div>
              `}
        </div>
      </div>
    </div>
  `;
}
