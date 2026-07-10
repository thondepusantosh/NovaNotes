import React, { useEffect, useRef, useState } from "react";
import { html } from "../../lib/html.js";
import { emptyBlock, detectMarkdownShortcut } from "../../lib/blocks.js";
import {
  placeCaretAtStart,
  placeCaretAtEnd,
  isCaretAtStart,
  isCaretAtEnd,
  splitAtCaret,
  getSelectionRect,
  plainText,
} from "../../lib/caret.js";
import SlashCommandMenu from "./SlashCommandMenu.jsx.js";
import FileEmbed from "./FileEmbed.jsx.js";
import { GripVertical, ChevronRight, Plus, X } from "lucide-react";

function exec(command, value) {
  document.execCommand(command, false, value);
}

const PLACEHOLDERS = {
  paragraph: "Type '/' for commands, or just start writing…",
  heading1: "Heading 1",
  heading2: "Heading 2",
  heading3: "Heading 3",
  todo: "To-do",
  bulleted: "List item",
  numbered: "List item",
  toggle: "Toggle — click to expand",
  quote: "Quote",
  code: "Write code…",
};

export default function Block({
  block,
  onChange,
  onDelete,
  onSplit,
  onMergePrev,
  onMoveFocus,
  isNested = false,
  isFirst = false,
  listNumber,
  noteId,
  focusRequest,
  onFocusHandled,
  dragProps,
}) {
  const elRef = useRef(null);
  const [slash, setSlash] = useState(null); // { rect, query }
  const isCode = block.type === "code";

  // Initial mount: seed the DOM from block state (uncontrolled thereafter).
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (isCode) el.textContent = block.html || "";
    else el.innerHTML = block.html || "";
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Programmatic focus/content-sync requests from the owner (split/merge).
  useEffect(() => {
    if (!focusRequest || focusRequest.id !== block.id) return;
    const el = elRef.current;
    if (!el) return;
    if (focusRequest.html != null) {
      if (isCode) el.textContent = focusRequest.html;
      else el.innerHTML = focusRequest.html;
    }
    if (focusRequest.pos === "start") placeCaretAtStart(el);
    else placeCaretAtEnd(el);
    onFocusHandled?.();
  }, [focusRequest]);

  function readContent(el) {
    return isCode ? el.textContent || "" : el.innerHTML || "";
  }

  function handleInput(e) {
    const el = e.currentTarget;
    const text = plainText(el);

    if (!isCode) {
      if (/^\/\S*$/.test(text) || text === "/") {
        const rect = el.getBoundingClientRect();
        setSlash({ rect, query: text.slice(1) });
      } else if (slash) {
        setSlash(null);
      }

      const shortcut = detectMarkdownShortcut(text);
      if (shortcut) {
        onChange({ type: shortcut, html: "" });
        requestAnimationFrame(() => {
          const fresh = elRef.current;
          if (fresh) {
            fresh.innerHTML = "";
            placeCaretAtStart(fresh);
          }
        });
        return;
      }
    }

    onChange({ html: readContent(el) });
  }

  function handleSlashSelect(type) {
    setSlash(null);
    onChange({ type, html: "" });
    // The block's tag/markup swaps out (e.g. <p> -> <h1>), so wait a tick
    // for React to re-render and re-attach elRef to the new element.
    requestAnimationFrame(() => {
      const el = elRef.current;
      if (el) {
        el.innerHTML = "";
        placeCaretAtStart(el);
      }
    });
  }

  function handleKeyDown(e) {
    if (slash && ["ArrowDown", "ArrowUp", "Enter", "Escape"].includes(e.key)) {
      // SlashCommandMenu's own window-capture listener handles these.
      return;
    }

    if ((e.metaKey || e.ctrlKey) && !isCode) {
      const k = e.key.toLowerCase();
      if (k === "b") {
        e.preventDefault();
        exec("bold");
        return;
      }
      if (k === "i") {
        e.preventDefault();
        exec("italic");
        return;
      }
      if (k === "e") {
        e.preventDefault();
        const sel = window.getSelection()?.toString() || "";
        exec("insertHTML", `<code>${sel}</code>`);
        return;
      }
      if (k === "x" && e.shiftKey) {
        e.preventDefault();
        exec("strikeThrough");
        return;
      }
    }

    if (e.key === "Enter") {
      if (isCode) {
        if (!e.shiftKey) {
          e.preventDefault();
          exec("insertLineBreak");
        }
        return;
      }
      if (e.shiftKey) {
        e.preventDefault();
        exec("insertLineBreak");
        return;
      }
      if (isNested) {
        e.preventDefault();
        exec("insertLineBreak");
        return;
      }
      e.preventDefault();
      const el = elRef.current;
      const { before, after } = splitAtCaret(el);
      el.innerHTML = before;
      onChange({ html: before });
      onSplit?.(after);
      return;
    }

    if (e.key === "Backspace" && !isNested) {
      const el = elRef.current;
      const atStart = isCaretAtStart(el);
      if (!atStart) return;
      e.preventDefault();
      if (block.type !== "paragraph" && plainText(el).length === 0) {
        onChange({ type: "paragraph" });
        requestAnimationFrame(() => elRef.current && placeCaretAtStart(elRef.current));
        return;
      }
      if (!isFirst) onMergePrev?.();
      return;
    }

    if (!isNested) {
      if (e.key === "ArrowUp" && isCaretAtStart(elRef.current)) {
        e.preventDefault();
        onMoveFocus?.("up");
      } else if (e.key === "ArrowDown" && isCaretAtEnd(elRef.current)) {
        e.preventDefault();
        onMoveFocus?.("down");
      }
    }
  }

  const editableProps = {
    ref: elRef,
    contentEditable: true,
    suppressContentEditableWarning: true,
    onInput: handleInput,
    onKeyDown: handleKeyDown,
    "data-placeholder": PLACEHOLDERS[block.type] || "",
  };

  let body;
  if (block.type === "heading1") {
    body = html`<h1 class="font-display text-3xl font-semibold py-1" ...${editableProps} />`;
  } else if (block.type === "heading2") {
    body = html`<h2 class="font-display text-2xl font-semibold py-1" ...${editableProps} />`;
  } else if (block.type === "heading3") {
    body = html`<h3 class="font-display text-xl font-semibold py-1" ...${editableProps} />`;
  } else if (block.type === "todo") {
    body = html`
      <div class="flex items-start gap-2 py-0.5">
        <button
          class="mt-1 w-4 h-4 shrink-0 rounded border ${block.checked
            ? "bg-accent border-accent"
            : "border-border"}"
          onClick=${() => onChange({ checked: !block.checked })}
          aria-label="Toggle done"
        />
        <div class="flex-1 ${block.checked ? "line-through text-muted" : ""}" ...${editableProps} />
      </div>
    `;
  } else if (block.type === "bulleted") {
    body = html`
      <div class="flex items-start gap-2 py-0.5">
        <span class="mt-2 w-1.5 h-1.5 rounded-full bg-muted shrink-0"></span>
        <div class="flex-1" ...${editableProps} />
      </div>
    `;
  } else if (block.type === "numbered") {
    body = html`
      <div class="flex items-start gap-2 py-0.5">
        <span class="mt-0.5 text-sm text-muted shrink-0 w-4 text-right">${listNumber ?? 1}.</span>
        <div class="flex-1" ...${editableProps} />
      </div>
    `;
  } else if (block.type === "toggle") {
    body = html`
      <div class="py-0.5">
        <div class="flex items-start gap-1">
          <button
            class="mt-1 shrink-0 text-muted hover:text-text transition-transform"
            style=${{ transform: block.collapsed ? "rotate(0deg)" : "rotate(90deg)" }}
            onClick=${() => onChange({ collapsed: !block.collapsed })}
            aria-label="Toggle expand"
          >
            <${ChevronRight} size=${15} />
          <//>
          <div class="flex-1 font-medium" ...${editableProps} />
        </div>
        ${!block.collapsed
          ? html`
              <div class="pl-6 border-l border-border ml-2 mt-1 flex flex-col gap-0.5">
                ${(block.children || []).map(
                  (child, i) => html`
                    <div key=${child.id} class="group flex items-start gap-1">
                      <div class="flex-1">
                        <${Block}
                          block=${child}
                          isNested=${true}
                          noteId=${noteId}
                          onChange=${(patch) => {
                            const next = block.children.map((c) =>
                              c.id === child.id ? { ...c, ...patch } : c
                            );
                            onChange({ children: next });
                          }}
                          onDelete=${() => {
                            onChange({ children: block.children.filter((c) => c.id !== child.id) });
                          }}
                        />
                      </div>
                      <button
                        class="opacity-0 group-hover:opacity-60 hover:!opacity-100 mt-1.5 shrink-0"
                        onClick=${() =>
                          onChange({ children: block.children.filter((c) => c.id !== child.id) })}
                        aria-label="Remove item"
                      >
                        <${X} size=${12} />
                      <//>
                    </div>
                  `
                )}
                <button
                  class="flex items-center gap-1 text-xs text-muted hover:text-text mt-0.5"
                  onClick=${() => onChange({ children: [...(block.children || []), emptyBlock("paragraph")] })}
                >
                  <${Plus} size=${12} /> Add item
                <//>
              </div>
            `
          : null}
      </div>
    `;
  } else if (block.type === "quote") {
    body = html`
      <blockquote
        class="border-l-2 border-accent pl-3 italic text-text/90 py-1"
        ...${editableProps}
      />
    `;
  } else if (block.type === "code") {
    body = html`
      <pre class="bg-surface2 rounded-nova border border-border p-3 overflow-x-auto my-1"
        ><code class="font-mono text-sm whitespace-pre" ...${editableProps} /></pre
      >
    `;
  } else if (block.type === "divider") {
    body = html`<hr class="border-border my-3" />`;
  } else if (block.type === "file") {
    body = html`
      <${FileEmbed}
        block=${block}
        noteId=${noteId}
        onAttach=${(attachmentId) => onChange({ attachmentId })}
        onRemove=${() => onChange({ attachmentId: null })}
      />
    `;
  } else {
    body = html`<p class="py-1" ...${editableProps} />`;
  }

  return html`
    <div class="group relative flex items-start gap-1 ${isNested ? "" : "-ml-6 pl-6"}">
      ${!isNested
        ? html`
            <div class="flex items-center gap-0.5 pt-1 shrink-0 opacity-0 group-hover:opacity-60 hover:!opacity-100">
              <button
                draggable="true"
                onDragStart=${dragProps?.onDragStart}
                onDragOver=${dragProps?.onDragOver}
                onDrop=${dragProps?.onDrop}
                onDragEnd=${dragProps?.onDragEnd}
                class="cursor-grab active:cursor-grabbing text-muted"
                aria-label="Drag to reorder"
              >
                <${GripVertical} size=${14} />
              <//>
            </div>
          `
        : null}
      <div class="flex-1 min-w-0">${body}</div>
      ${!isNested
        ? html`
            <button
              class="opacity-0 group-hover:opacity-60 hover:!opacity-100 mt-1 shrink-0"
              onClick=${onDelete}
              aria-label="Delete block"
            >
              <${X} size=${13} />
            <//>
          `
        : null}
      ${slash
        ? html`
            <${SlashCommandMenu}
              rect=${slash.rect}
              query=${slash.query}
              onSelect=${handleSlashSelect}
              onClose=${() => setSlash(null)}
            />
          `
        : null}
    </div>
  `;
}
