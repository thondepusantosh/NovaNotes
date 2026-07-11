# Nova — Notes App

Nova is a modern note-taking web app that combines the block-based writing style of Notion with the flexibility of Obsidian. It lets you write notes, organize them, attach files, and switch between five distinct themes to match your mood or workflow.

## Live Web: https://astounding-tulumba-ed8b0f.netlify.app/

## Features

- **Block-based editor** — write using headings, to-do lists, numbered lists, bulleted lists, quotes, code blocks, and dividers, similar to Notion.
- **File attachments** — drag and drop images, PDFs, and other files directly into your notes.
- **Note linking and search** — connect related notes and quickly find anything with full-text search.
- **Five themes** — Light, Dark, Comic, Hacker, and Professional. Switch instantly from Settings, no reload needed.
- **Smooth experience** — clean transitions, fast autosave, and a distraction-free writing space.
- **Works offline** — notes are stored locally in your browser, so you can write without an internet connection.

## Themes

| Theme        | Description                                             |
|--------------|----------------------------------------------------------|
| Light        | Clean and minimal, easy on the eyes during the day.       |
| Dark         | Low-glare, soft contrast, ideal for night use.             |
| Comic        | Bold colors and playful panel-style design.                |
| Hacker       | Terminal-style green-on-black look with a monospace font.  |
| Professional | Muted, refined palette suited for work and presentations.  |

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Tiptap (block-based editor)
- IndexedDB (local-first storage via Dexie.js)
- Framer Motion (animations and transitions)

## Getting Started

```bash
# Clone the repository
git clone https://github.com/your-username/nova-notes.git
cd nova-notes

# Install dependencies
npm install

# Run the app locally
npm run dev
```

## Project Status

Nova is under active development. Current focus is on the core editor and the Light/Dark themes, with Comic, Hacker, and Professional themes rolling out next. Planned features include cloud sync and multi-device support.

## Roadmap

- [ ] Core editor with all block types
- [ ] File attachments
- [ ] All five themes
- [ ] Full-text search and command palette
- [ ] Mobile-responsive layout
- [ ] Cloud sync (optional accounts)

## License

This project is open source. Add your preferred license (MIT recommended for personal projects) in a `LICENSE` file.

## Author

Made by **Santosh**.
