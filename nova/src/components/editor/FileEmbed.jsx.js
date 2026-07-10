import React, { useEffect, useRef, useState } from "react";
import { html } from "../../lib/html.js";
import { notesRepo } from "../../lib/db.js";
import { File as FileIcon, Image as ImageIcon, Upload, Download, X } from "lucide-react";

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function FileEmbed({ block, noteId, onAttach, onRemove }) {
  const [attachment, setAttachment] = useState(null);
  const [objectUrl, setObjectUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    let url;
    if (block.attachmentId) {
      notesRepo.getAttachment(block.attachmentId).then((att) => {
        if (cancelled || !att) return;
        setAttachment(att);
        url = URL.createObjectURL(att.blob);
        setObjectUrl(url);
      });
    } else {
      setAttachment(null);
      setObjectUrl(null);
    }
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [block.attachmentId]);

  async function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    const att = await notesRepo.addAttachment({ noteId, file });
    onAttach(att.id);
  }

  if (!block.attachmentId) {
    return html`
      <div
        class="my-1 border-2 border-dashed rounded-nova px-4 py-6 flex flex-col items-center gap-2 text-sm cursor-pointer transition-colors ${dragOver
          ? "border-accent bg-surface2"
          : "border-border text-muted hover:border-accent"}"
        onDragOver=${(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave=${() => setDragOver(false)}
        onDrop=${(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick=${() => inputRef.current?.click()}
      >
        <${Upload} size=${18} />
        <span>Drop a file here, or click to upload</span>
        <input
          ref=${inputRef}
          type="file"
          class="hidden"
          onChange=${(e) => handleFiles(e.target.files)}
        />
      </div>
    `;
  }

  if (!attachment) {
    return html`<div class="my-1 rounded-nova border border-border px-4 py-3 text-sm text-muted">Loading…</div>`;
  }

  const isImage = attachment.mimeType.startsWith("image/");

  return html`
    <div class="my-1 group relative rounded-nova border border-border overflow-hidden bg-surface2">
      <button
        class="absolute top-2 right-2 z-10 p-1 rounded-nova bg-surface border border-border opacity-0 group-hover:opacity-100 text-muted hover:text-text"
        onClick=${onRemove}
        aria-label="Remove attachment"
      >
        <${X} size=${13} />
      <//>
      ${isImage
        ? html`<img src=${objectUrl} alt=${attachment.filename} class="max-h-96 w-auto mx-auto" />`
        : html`
            <div class="flex items-center gap-3 px-4 py-3">
              <${FileIcon} size=${20} class="text-muted shrink-0" />
              <div class="flex-1 min-w-0">
                <p class="text-sm truncate">${attachment.filename}</p>
                <p class="text-xs text-muted">${formatSize(attachment.size)}</p>
              </div>
              <a
                href=${objectUrl}
                download=${attachment.filename}
                class="p-1.5 rounded-nova hover:bg-surface text-muted hover:text-text"
                aria-label="Download"
              >
                <${Download} size=${15} />
              </a>
            </div>
          `}
    </div>
  `;
}
