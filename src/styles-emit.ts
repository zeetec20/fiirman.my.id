/**
 * Build-only module. Imported via a never-taken dynamic import in
 * __root.tsx so the client build processes and emits styles.css (captured
 * by emit-inline-css in vite.config.ts) WITHOUT TanStack Start
 * auto-injecting a render-blocking <link rel="stylesheet"> for it — the
 * inlined <style> in __root is the only copy that ships.
 */
import "./styles.css";
