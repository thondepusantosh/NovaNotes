export function placeCaretAtEnd(el) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

export function placeCaretAtStart(el) {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

export function isCaretAtStart(el) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return false;
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return false;
  const testRange = document.createRange();
  testRange.selectNodeContents(el);
  testRange.setEnd(range.startContainer, range.startOffset);
  return testRange.toString().length === 0;
}

export function isCaretAtEnd(el) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return false;
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return false;
  const testRange = document.createRange();
  testRange.selectNodeContents(el);
  testRange.setStart(range.endContainer, range.endOffset);
  return testRange.toString().length === 0;
}

// Splits the contents of `el` at the current caret position into
// {before, after} HTML strings, without mutating the DOM.
export function splitAtCaret(el) {
  const sel = window.getSelection();
  if (!sel.rangeCount) return { before: el.innerHTML, after: "" };

  const range = sel.getRangeAt(0);
  const beforeRange = document.createRange();
  beforeRange.selectNodeContents(el);
  beforeRange.setEnd(range.startContainer, range.startOffset);

  const afterRange = document.createRange();
  afterRange.selectNodeContents(el);
  afterRange.setStart(range.endContainer, range.endOffset);

  const beforeFrag = beforeRange.cloneContents();
  const afterFrag = afterRange.cloneContents();

  const beforeDiv = document.createElement("div");
  beforeDiv.appendChild(beforeFrag);
  const afterDiv = document.createElement("div");
  afterDiv.appendChild(afterFrag);

  return { before: beforeDiv.innerHTML, after: afterDiv.innerHTML };
}

export function getSelectionRect() {
  const sel = window.getSelection();
  if (!sel.rangeCount) return null;
  const range = sel.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return null;
  return rect;
}

export function plainText(el) {
  return el.textContent || "";
}
