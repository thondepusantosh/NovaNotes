import { useEffect, useState } from "react";

function currentPath() {
  const hash = window.location.hash.replace(/^#/, "");
  return hash === "" ? "/" : hash;
}

export function navigate(path) {
  window.location.hash = path;
}

export function useRoute() {
  const [path, setPath] = useState(currentPath());

  useEffect(() => {
    const onHashChange = () => setPath(currentPath());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return path;
}

// Matches "/notes/:id" style patterns against a concrete path.
// Returns a params object on match, or null.
export function matchRoute(pattern, path) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);
  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    const p = patternParts[i];
    if (p.startsWith(":")) {
      params[p.slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (p !== pathParts[i]) {
      return null;
    }
  }
  return params;
}
