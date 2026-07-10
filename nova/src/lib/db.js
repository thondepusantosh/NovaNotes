import Dexie from "dexie";

/**
 * @typedef {Object} Block
 * @property {string} id
 * @property {"paragraph"|"heading1"|"heading2"|"heading3"|"todo"|"bulleted"|"numbered"|"toggle"|"quote"|"code"|"divider"|"file"} type
 * @property {string} [html] - sanitized inline-formatted HTML content, for text blocks
 * @property {boolean} [checked] - todo blocks
 * @property {boolean} [collapsed] - toggle blocks
 * @property {string} [language] - code blocks
 * @property {string} [attachmentId] - file/image blocks
 */

/**
 * @typedef {Object} Note
 * @property {string} id
 * @property {string|null} parentId
 * @property {string} title
 * @property {string[]} tags
 * @property {number} order
 * @property {number} createdAt
 * @property {number} updatedAt
 * @property {Block[]} blocks
 */

/**
 * @typedef {Object} Attachment
 * @property {string} id
 * @property {string} noteId
 * @property {string} filename
 * @property {string} mimeType
 * @property {number} size
 * @property {Blob} blob
 * @property {number} createdAt
 */

export const db = new Dexie("nova");

db.version(1).stores({
  notes: "id, parentId, order, updatedAt, *tags",
  attachments: "id, noteId",
});

function uid() {
  return crypto.randomUUID();
}

export const notesRepo = {
  async listAll() {
    return db.notes.orderBy("order").toArray();
  },

  async get(id) {
    return db.notes.get(id);
  },

  async createNote({ parentId = null, title = "Untitled" } = {}) {
    const now = Date.now();
    const siblings = await db.notes.filter((n) => n.parentId === parentId).toArray();
    const note = {
      id: uid(),
      parentId,
      title,
      tags: [],
      order: siblings.length,
      createdAt: now,
      updatedAt: now,
      blocks: [{ id: uid(), type: "paragraph", html: "" }],
    };
    await db.notes.add(note);
    return note;
  },

  async updateNote(id, patch) {
    await db.notes.update(id, { ...patch, updatedAt: Date.now() });
  },

  async deleteNote(id) {
    // cascade: delete descendants + attachments
    const all = await db.notes.toArray();
    const toDelete = new Set([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const n of all) {
        if (n.parentId && toDelete.has(n.parentId) && !toDelete.has(n.id)) {
          toDelete.add(n.id);
          changed = true;
        }
      }
    }
    await db.transaction("rw", db.notes, db.attachments, async () => {
      for (const noteId of toDelete) {
        await db.attachments.where("noteId").equals(noteId).delete();
        await db.notes.delete(noteId);
      }
    });
    return [...toDelete];
  },

  async reorder(id, order, parentId) {
    await db.notes.update(id, { order, parentId, updatedAt: Date.now() });
  },

  async search(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = await db.notes.toArray();
    return all.filter((n) => {
      if (n.title.toLowerCase().includes(q)) return true;
      if (n.tags.some((t) => t.toLowerCase().includes(q))) return true;
      return n.blocks.some((b) => (b.html || "").toLowerCase().includes(q));
    });
  },

  async addAttachment({ noteId, file }) {
    const attachment = {
      id: uid(),
      noteId,
      filename: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      blob: file,
      createdAt: Date.now(),
    };
    await db.attachments.add(attachment);
    return attachment;
  },

  async getAttachment(id) {
    return db.attachments.get(id);
  },

  async deleteAttachment(id) {
    await db.attachments.delete(id);
  },
};

export function newId() {
  return uid();
}
