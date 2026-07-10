import React, { useEffect, useState } from "react";
import { html } from "./lib/html.js";
import { useRoute, matchRoute } from "./lib/router.js";
import { ThemeProvider, useSettings } from "./components/theme/ThemeProvider.jsx.js";
import CommandPalette from "./components/layout/CommandPalette.jsx.js";
import Home from "./pages/Home.jsx.js";
import Notes from "./pages/Notes.jsx.js";
import Settings from "./pages/Settings.jsx.js";

function Router() {
  const path = useRoute();

  if (path === "/") return html`<${Home} />`;
  if (matchRoute("/notes", path)) return html`<${Notes} noteId=${null} />`;
  if (matchRoute("/notes/:id", path)) {
    const { id } = matchRoute("/notes/:id", path);
    return html`<${Notes} noteId=${id} />`;
  }
  if (path === "/settings") return html`<${Settings} />`;

  return html`<${Home} />`;
}

function AppShell() {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const { reduceMotion } = useSettings();

  useEffect(() => {
    function onKeyDown(e) {
      const isK = e.key.toLowerCase() === "k";
      if ((e.metaKey || e.ctrlKey) && isK) {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    }
    function onToggleEvent() {
      setPaletteOpen((v) => !v);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("nova:toggle-palette", onToggleEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("nova:toggle-palette", onToggleEvent);
    };
  }, []);

  return html`
    <${Router} />
    <${CommandPalette}
      open=${paletteOpen}
      onClose=${() => setPaletteOpen(false)}
      reduceMotion=${reduceMotion}
    />
  `;
}

export default function App() {
  return html`
    <${ThemeProvider}>
      <${AppShell} />
    <//>
  `;
}
