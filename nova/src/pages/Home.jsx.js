import React from "react";
import { html } from "../lib/html.js";
import Hero from "../components/home/Hero.jsx.js";
import EditorPreview from "../components/home/EditorPreview.jsx.js";

export default function Home() {
  return html`
    <div>
      <${Hero} />
      <${EditorPreview} />
    </div>
  `;
}
