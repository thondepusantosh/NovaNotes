// Builds a parentId -> children[] map, sorted by `order`.
export function buildTree(notes) {
  const byParent = new Map();
  for (const note of notes) {
    const key = note.parentId ?? null;
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(note);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => a.order - b.order);
  }
  return byParent;
}

export function getAncestors(notes, noteId) {
  const byId = new Map(notes.map((n) => [n.id, n]));
  const chain = [];
  let current = byId.get(noteId);
  while (current) {
    chain.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : null;
  }
  return chain;
}
