import React, { useMemo, useState } from "react";
import { html } from "../../lib/html.js";
import { notesRepo } from "../../lib/db.js";
import { useLiveQuery } from "../../lib/useLiveQuery.js";
import { buildTree } from "../../lib/tree.js";
import { searchNotes } from "../../lib/search.js";
import { navigate } from "../../lib/router.js";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Search,
  Trash2,
  FileText,
  Settings as SettingsIcon,
  Tag,
  PanelLeftClose,
} from "lucide-react";

function TreeNode({ note, byParent, depth, activeId, expanded, toggleExpanded, onDelete }) {
  const children = byParent.get(note.id) || [];
  const hasChildren = children.length > 0;
  const isExpanded = expanded.has(note.id);
  const isActive = note.id === activeId;

  return html`
    <div>
      <div
        class="group flex items-center gap-1 rounded-nova px-2 py-1.5 cursor-pointer text-sm ${isActive
          ? "bg-surface2 text-text"
          : "text-muted hover:bg-surface2 hover:text-text"}"
        style=${{ paddingLeft: `${8 + depth * 16}px` }}
        onClick=${() => navigate(`/notes/${note.id}`)}
      >
        <button
          class="shrink-0 opacity-60 hover:opacity-100 ${hasChildren ? "" : "invisible"}"
          onClick=${(e) => {
            e.stopPropagation();
            toggleExpanded(note.id);
          }}
          aria-label=${isExpanded ? "Collapse" : "Expand"}
        >
          ${isExpanded
            ? html`<${ChevronDown} size=${14} />`
            : html`<${ChevronRight} size=${14} />`}
        </button>
        <${FileText} size=${14} class="shrink-0 opacity-60" />
        <span class="truncate flex-1">${note.title || "Untitled"}</span>
        <button
          class="shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100"
          onClick=${(e) => {
            e.stopPropagation();
            onDelete(note);
          }}
          aria-label="Delete note"
          title="Delete note"
        >
          <${Trash2} size=${13} />
        <//>
      </div>
      ${isExpanded && hasChildren
        ? html`<div>
            ${children.map(
              (child) => html`
                <${TreeNode}
                  key=${child.id}
                  note=${child}
                  byParent=${byParent}
                  depth=${depth + 1}
                  activeId=${activeId}
                  expanded=${expanded}
                  toggleExpanded=${toggleExpanded}
                  onDelete=${onDelete}
                />
              `
            )}
          </div>`
        : null}
    </div>
  `;
}

export default function Sidebar({ activeId, onCloseMobile }) {
  const notes = useLiveQuery(() => notesRepo.listAll(), [], []);
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(new Set());
  const [activeTag, setActiveTag] = useState(null);

  const byParent = useMemo(() => buildTree(notes || []), [notes]);
  const roots = byParent.get(null) || [];

  const allTags = useMemo(() => {
    const set = new Set();
    (notes || []).forEach((n) => n.tags.forEach((t) => set.add(t)));
    return [...set].sort();
  }, [notes]);

  const searchResults = query.trim() ? searchNotes(notes || [], query) : null;
  const tagFiltered =
    !searchResults && activeTag
      ? (notes || []).filter((n) => n.tags.includes(activeTag))
      : null;

  function toggleExpanded(id) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleCreateRoot() {
    const note = await notesRepo.createNote({ parentId: null });
    navigate(`/notes/${note.id}`);
  }

  async function handleDelete(note) {
    if (!confirm(`Delete "${note.title || "Untitled"}" and its sub-notes?`)) return;
    const deletedIds = await notesRepo.deleteNote(note.id);
    if (deletedIds.includes(activeId)) navigate("/notes");
  }

  return html`
    <aside class="h-full flex flex-col bg-surface border-r border-border" style=${{ width: "var(--user-sidebar-width, 272px)" }}>
      <div class="flex items-center gap-2 px-3 py-3 border-b border-border">
        <div class="flex-1 flex items-center gap-2 bg-surface2 rounded-nova px-2 py-1.5">
          <${Search} size=${14} class="text-muted shrink-0" />
          <input
            type="text"
            value=${query}
            onInput=${(e) => setQuery(e.target.value)}
            placeholder="Search notes…"
            class="bg-transparent outline-none text-sm w-full placeholder:text-muted"
          />
        </div>
        <button
          class="shrink-0 p-1.5 rounded-nova hover:bg-surface2 text-muted hover:text-text lg:hidden"
          onClick=${onCloseMobile}
          aria-label="Close sidebar"
        >
          <${PanelLeftClose} size=${16} />
        <//>
      </div>

      ${allTags.length > 0
        ? html`
            <div class="flex flex-wrap gap-1.5 px-3 py-2 border-b border-border">
              ${allTags.map(
                (tag) => html`
                  <button
                    key=${tag}
                    onClick=${() => setActiveTag(activeTag === tag ? null : tag)}
                    class="text-xs px-2 py-0.5 rounded-full border flex items-center gap-1 ${activeTag === tag
                      ? "bg-accent text-accent-text border-accent"
                      : "border-border text-muted hover:text-text"}"
                  >
                    <${Tag} size=${10} />
                    ${tag}
                  </button>
                `
              )}
            </div>
          `
        : null}

      <div class="flex-1 overflow-y-auto py-2 px-2">
        ${searchResults
          ? searchResults.length === 0
            ? html`<p class="text-xs text-muted px-2 py-4">No notes found.</p>`
            : searchResults.map(
                ({ note }) => html`
                  <div
                    key=${note.id}
                    class="rounded-nova px-2 py-1.5 cursor-pointer text-sm flex items-center gap-2 ${note.id === activeId
                      ? "bg-surface2 text-text"
                      : "text-muted hover:bg-surface2 hover:text-text"}"
                    onClick=${() => navigate(`/notes/${note.id}`)}
                  >
                    <${FileText} size=${14} class="shrink-0 opacity-60" />
                    <span class="truncate">${note.title || "Untitled"}</span>
                  </div>
                `
              )
          : tagFiltered
          ? tagFiltered.map(
              (note) => html`
                <div
                  key=${note.id}
                  class="rounded-nova px-2 py-1.5 cursor-pointer text-sm flex items-center gap-2 ${note.id === activeId
                    ? "bg-surface2 text-text"
                    : "text-muted hover:bg-surface2 hover:text-text"}"
                  onClick=${() => navigate(`/notes/${note.id}`)}
                >
                  <${FileText} size=${14} class="shrink-0 opacity-60" />
                  <span class="truncate">${note.title || "Untitled"}</span>
                </div>
              `
            )
          : roots.length === 0
          ? html`<p class="text-xs text-muted px-2 py-4">No notes yet. Create your first one below.</p>`
          : roots.map(
              (note) => html`
                <${TreeNode}
                  key=${note.id}
                  note=${note}
                  byParent=${byParent}
                  depth=${0}
                  activeId=${activeId}
                  expanded=${expanded}
                  toggleExpanded=${toggleExpanded}
                  onDelete=${handleDelete}
                />
              `
            )}
      </div>

      <div class="border-t border-border p-2 flex flex-col gap-1">
        <button
          onClick=${handleCreateRoot}
          class="flex items-center gap-2 px-2 py-1.5 rounded-nova text-sm text-muted hover:bg-surface2 hover:text-text"
        >
          <${Plus} size=${14} /> New note
        </button>
        <button
          onClick=${() => navigate("/settings")}
          class="flex items-center gap-2 px-2 py-1.5 rounded-nova text-sm text-muted hover:bg-surface2 hover:text-text"
        >
          <${SettingsIcon} size=${14} /> Settings
        </button>
      </div>
    </aside>
  `;
}
