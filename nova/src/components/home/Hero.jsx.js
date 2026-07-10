import React from "react";
import { html } from "../../lib/html.js";
import { motion } from "framer-motion";
import { navigate } from "../../lib/router.js";
import { useSettings } from "../theme/ThemeProvider.jsx.js";
import LogoMark from "./LogoMark.jsx.js";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  const { reduceMotion } = useSettings();

  return html`
    <section
      class="min-h-screen flex flex-col items-center justify-center px-6 text-center relative overflow-hidden"
      style=${{
        backgroundImage: "url(/src/assets/hero-bg.avif)",
        backgroundSize: "cover",
        backgroundPosition: "center 65%",
      }}
    >
      <div
        class="absolute inset-0"
        style=${{
          background:
            "linear-gradient(180deg, rgba(4,8,20,0.35) 0%, rgba(4,8,20,0.15) 35%, rgba(4,8,20,0.55) 78%, var(--bg) 100%)",
        }}
      />

      <div class="relative">
        <${motion.div}
          initial=${reduceMotion ? false : { opacity: 0, y: 16 }}
          animate=${{ opacity: 1, y: 0 }}
          transition=${{ duration: 0.7, ease: "easeOut" }}
          style=${{ color: "#e8ecff" }}
        >
          <${LogoMark} size=${44} />
        <//>

        <${motion.h1}
          initial=${reduceMotion ? false : { opacity: 0, y: 16 }}
          animate=${{ opacity: 1, y: 0 }}
          transition=${{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
          class="font-display text-6xl sm:text-7xl font-semibold tracking-tight mt-6"
          style=${{ color: "#f7f8fc" }}
        >
          Nova
        <//>

        <${motion.p}
          initial=${reduceMotion ? false : { opacity: 0, y: 16 }}
          animate=${{ opacity: 1, y: 0 }}
          transition=${{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
          class="mt-4 text-lg sm:text-xl max-w-md mx-auto"
          style=${{ color: "rgba(232,236,255,0.75)" }}
        >
          Write it down. Find it again.
        <//>

        <${motion.button}
          initial=${reduceMotion ? false : { opacity: 0, y: 16 }}
          animate=${{ opacity: 1, y: 0 }}
          transition=${{ duration: 0.7, delay: 0.32, ease: "easeOut" }}
          onClick=${() => navigate("/notes")}
          class="mt-10 inline-flex items-center gap-2 px-6 py-3 rounded-nova font-medium"
          style=${{ background: "var(--accent)", color: "var(--accent-text)" }}
        >
          Start writing <${ArrowRight} size=${16} />
        <//>
      </div>

      <${motion.div}
        initial=${reduceMotion ? false : { opacity: 0 }}
        animate=${{ opacity: 1 }}
        transition=${{ duration: 1, delay: 0.8 }}
        class="absolute bottom-10 text-xs"
        style=${{ color: "rgba(232,236,255,0.6)" }}
      >
        Built by Santosh
      <//>
    </section>
  `;
}
