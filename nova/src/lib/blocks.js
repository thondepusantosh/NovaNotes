import { newId } from "./db.js";

export const BLOCK_TYPES = {
  paragraph: { label: "Text", description: "Plain paragraph text" },
  heading1: { label: "Heading 1", description: "Big section heading" },
  heading2: { label: "Heading 2", description: "Medium section heading" },
  heading3: { label: "Heading 3", description: "Small section heading" },
  todo: { label: "To-do", description: "Checkbox with strike-through" },
  bulleted: { label: "Bulleted list", description: "Simple bullet point" },
  numbered: { label: "Numbered list", description: "List with numbering" },
  toggle: { label: "Toggle list", description: "Collapsible nested content" },
  quote: { label: "Quote", description: "Callout quote block" },
  code: { label: "Code", description: "Code block with highlighting" },
  divider: { label: "Divider", description: "Horizontal rule" },
  file: { label: "Image / file", description: "Embed an image or file" },
};

export function emptyBlock(type = "paragraph") {
  const base = { id: newId(), type, html: "" };
  if (type === "todo") base.checked = false;
  if (type === "toggle") {
    base.collapsed = false;
    base.children = [];
  }
  if (type === "code") base.language = "plaintext";
  return base;
}

// Detects "# ", "- ", "1. ", "[] ", "> ", "```" style markdown shortcuts
// at the very start of plain text. Returns the new block type, or null.
export function detectMarkdownShortcut(plainText) {
  const rules = [
    { re: /^#\s$/, type: "heading1" },
    { re: /^##\s$/, type: "heading2" },
    { re: /^###\s$/, type: "heading3" },
    { re: /^[-*]\s$/, type: "bulleted" },
    { re: /^1\.\s$/, type: "numbered" },
    { re: /^\[\s?\]\s$/, type: "todo" },
    { re: /^>\s$/, type: "quote" },
    { re: /^```$/, type: "code" },
    { re: /^>>\s$/, type: "toggle" },
  ];
  for (const rule of rules) {
    if (rule.re.test(plainText)) return rule.type;
  }
  return null;
}
