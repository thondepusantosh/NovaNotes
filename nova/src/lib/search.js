function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html || "";
  return div.textContent || "";
}

function excerpt(text, query, radius = 40) {
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text.slice(0, radius * 2);
  const start = Math.max(0, idx - radius);
  const end = Math.min(text.length, idx + query.length + radius);
  return (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");
}

// Ranks notes by relevance to `query`: title matches first, then tag, then body.
export function searchNotes(notes, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const results = [];
  for (const note of notes) {
    const title = note.title.toLowerCase();
    const bodyText = note.blocks.map((b) => stripHtml(b.html)).join(" ");
    const bodyLower = bodyText.toLowerCase();
    const tagMatch = note.tags.some((t) => t.toLowerCase().includes(q));

    let score = -1;
    if (title.includes(q)) score = title.startsWith(q) ? 100 : 80;
    else if (tagMatch) score = 60;
    else if (bodyLower.includes(q)) score = 40;

    if (score >= 0) {
      results.push({
        note,
        score,
        snippet: bodyLower.includes(q) ? excerpt(bodyText, q) : "",
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}
