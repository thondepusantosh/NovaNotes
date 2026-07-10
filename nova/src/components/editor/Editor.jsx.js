import React, { useEffect, useRef, useState, useCallback } from "react";
import { html } from "../../lib/html.js";
import { notesRepo } from "../../lib/db.js";
import { emptyBlock } from "../../lib/blocks.js";
import { getSelectionRect } from "../../lib/caret.js";
import Block from "./Block.jsx.js";
import InlineToolbar from "./InlineToolbar.jsx.js";
import { AnimatePresence, motion } from "framer-motion";
import { useSettings } from "../theme/ThemeProvider.jsx.js";

export default function Editor({ note, onSaveStateChange, onTitleChange }) {
  const [title, setTitle] = useState(note.title);
  const [blocks, setBlocks] = useState(note.blocks);
  const [focusRequest, setFocusRequest] = useState(null);
  const [toolbarRect, setToolbarRect] = useState(null);
  const dragIndexRef = useRef(null);
  const dirtyRef = useRef(false);
  const saveTimerRef = useRef(null);
  const rootRef = useRef(null);
  const { reduceMotion } = useSettings();

  // Reset local state whenever the underlying note identity changes.
  useEffect(() => {
    setTitle(note.title);
    setBlocks(note.blocks);
    dirtyRef.current = false;
  }, [note.id]);

  const scheduleSave = useCallback(
    (nextTitle, nextBlocks) => {
      dirtyRef.current = true;
      onSaveStateChange?.("saving");
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(async () => {
        await notesRepo.updateNote(note.id, {
          title: nextTitle,
          blocks: nextBlocks,
        });
        dirtyRef.current = false;
        onSaveStateChange?.("saved");
      }, 500);
    },
    [note.id, onSaveStateChange]
  );

  function handleTitleChange(e) {
    const value = e.target.value;
    setTitle(value);
    onTitleChange?.(value);
    scheduleSave(value, blocks);
  }

  function updateBlocks(next) {
    setBlocks(next);
    scheduleSave(title, next);
  }

  function updateBlockAt(index, patch) {
    const next = blocks.map((b, i) => (i === index ? { ...b, ...patch } : b));
    updateBlocks(next);
  }

  function deleteBlockAt(index) {
    if (blocks.length === 1) return;
    const next = blocks.filter((_, i) => i !== index);
    updateBlocks(next);
    const focusIndex = Math.max(0, index - 1);
    setFocusRequest({ id: next[focusIndex]?.id, pos: "end" });
  }

  function splitBlockAt(index, remainderHtml) {
    const newBlock = emptyBlock("paragraph");
    newBlock.html = remainderHtml;
    const next = [...blocks];
    next.splice(index + 1, 0, newBlock);
    updateBlocks(next);
    setFocusRequest({ id: newBlock.id, pos: "start" });
  }

  function mergeWithPrev(index) {
    if (index === 0) return;
    const prev = blocks[index - 1];
    const current = blocks[index];
    const combinedHtml = (prev.html || "") + (current.html || "");
    const next = blocks
      .map((b, i) => (i === index - 1 ? { ...b, html: combinedHtml } : b))
      .filter((_, i) => i !== index);
    updateBlocks(next);
    setFocusRequest({ id: prev.id, pos: "end", html: combinedHtml });
  }

  function moveFocus(index, direction) {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const target = blocks[targetIndex];
    if (!target) return;
    setFocusRequest({ id: target.id, pos: direction === "up" ? "end" : "start" });
  }

  function appendBlockAtEnd() {
    const newBlock = emptyBlock("paragraph");
    updateBlocks([...blocks, newBlock]);
    setFocusRequest({ id: newBlock.id, pos: "start" });
  }

  // Drag-and-drop reorder (top-level blocks only).
  function handleDragStart(index) {
    return (e) => {
      dragIndexRef.current = index;
      e.dataTransfer.effectAllowed = "move";
      try {
        const row = e.currentTarget.closest(".group");
        if (row) e.dataTransfer.setDragImage(row, 10, 10);
      } catch {
        /* noop */
      }
    };
  }
  function handleDragOver(index) {
    return (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
    };
  }
  function handleDrop(index) {
    return (e) => {
      e.preventDefault();
      const from = dragIndexRef.current;
      if (from === null || from === index) return;
      const next = [...blocks];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      dragIndexRef.current = null;
      updateBlocks(next);
    };
  }
  function handleDragEnd() {
    dragIndexRef.current = null;
  }

  // Global selection-based inline formatting toolbar.
  useEffect(() => {
    function onSelectionChange() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !rootRef.current) {
        setToolbarRect(null);
        return;
      }
      const anchor = sel.anchorNode;
      if (!anchor || !rootRef.current.contains(anchor)) {
        setToolbarRect(null);
        return;
      }
      const rect = getSelectionRect();
      setToolbarRect(rect);
    }
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, []);

  let numberedCounter = 0;

  return html`
    <div ref=${rootRef} class="max-w-3xl mx-auto px-6 md:px-10 py-10">
      <textarea
        value=${title}
        onInput=${handleTitleChange}
        placeholder="Untitled"
        rows=${1}
        class="w-full resize-none overflow-hidden bg-transparent font-display text-4xl font-semibold outline-none placeholder:text-muted mb-6"
        onKeyDown=${(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.currentTarget.blur();
            setFocusRequest({ id: blocks[0]?.id, pos: "start" });
          }
        }}
      />

      <div class="flex flex-col gap-0.5">
        ${blocks.map((block, index) => {
          if (block.type === "numbered") numberedCounter += 1;
          else numberedCounter = 0;

          return html`
            <${Block}
              key=${block.id}
              block=${block}
              noteId=${note.id}
              isFirst=${index === 0}
              listNumber=${numberedCounter}
              focusRequest=${focusRequest}
              onFocusHandled=${() => setFocusRequest(null)}
              onChange=${(patch) => updateBlockAt(index, patch)}
              onDelete=${() => deleteBlockAt(index)}
              onSplit=${(remainder) => splitBlockAt(index, remainder)}
              onMergePrev=${() => mergeWithPrev(index)}
              onMoveFocus=${(dir) => moveFocus(index, dir)}
              dragProps=${{
                onDragStart: handleDragStart(index),
                onDragOver: handleDragOver(index),
                onDrop: handleDrop(index),
                onDragEnd: handleDragEnd,
              }}
            />
          `;
        })}
      </div>

      <button
        class="w-full text-left text-sm text-muted/70 hover:text-muted py-3"
        onClick=${appendBlockAtEnd}
      >
        + Click to add a block, or type "/" inside any block
      </button>

      <${AnimatePresence}>
        ${toolbarRect
          ? html`<${InlineToolbar} rect=${toolbarRect} reduceMotion=${reduceMotion} onLink=${() => {
              const url = prompt("Link URL");
              if (url) document.execCommand("createLink", false, url);
            }} />`
          : null}
      <//>
    </div>
  `;
}
