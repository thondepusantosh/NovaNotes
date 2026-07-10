import React from "react";
import { html } from "../../lib/html.js";
import { motion } from "framer-motion";
import { Bold, Italic, Strikethrough, Code, Link } from "lucide-react";

function exec(command, value) {
  document.execCommand(command, false, value);
}

export default function InlineToolbar({ rect, onLink, reduceMotion }) {
  if (!rect) return null;

  const style = {
    position: "fixed",
    left: rect.left + rect.width / 2,
    top: rect.top - 44,
    transform: "translateX(-50%)",
    zIndex: 50,
  };

  const Btn = ({ onClick, label, children }) => html`
    <button
      class="p-1.5 hover:bg-surface2 rounded-nova text-text"
      onMouseDown=${(e) => e.preventDefault()}
      onClick=${onClick}
      aria-label=${label}
      title=${label}
    >
      ${children}
    </button>
  `;

  return html`
    <${motion.div}
      initial=${reduceMotion ? false : { opacity: 0, y: 4, scale: 0.96 }}
      animate=${{ opacity: 1, y: 0, scale: 1 }}
      exit=${{ opacity: 0, y: 4, scale: 0.96 }}
      transition=${{ duration: 0.12 }}
      style=${style}
      class="flex items-center gap-0.5 bg-surface border border-border rounded-nova shadow-nova px-1 py-1"
    >
      <${Btn} label="Bold (Cmd+B)" onClick=${() => exec("bold")}><${Bold} size=${14} /><//>
      <${Btn} label="Italic (Cmd+I)" onClick=${() => exec("italic")}><${Italic} size=${14} /><//>
      <${Btn} label="Strikethrough" onClick=${() => exec("strikeThrough")}><${Strikethrough} size=${14} /><//>
      <${Btn} label="Inline code" onClick=${() => exec("insertHTML", "<code>" + (window.getSelection()?.toString() || "") + "</code>")}
        ><${Code} size=${14} /><//
      >
      <${Btn} label="Link" onClick=${onLink}><${Link} size=${14} /><//>
    <//>
  `;
}
