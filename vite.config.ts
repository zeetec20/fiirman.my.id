import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { defineConfig } from "vite";

function getBuildTimestamp(): string {
  const now = new Date();
  const lookup: [number, string][] = [
    [1000, "M"],
    [900, "CM"],
    [500, "D"],
    [400, "CD"],
    [100, "C"],
    [90, "XC"],
    [50, "L"],
    [40, "XL"],
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  const toRoman = (num: number) => {
    let res = "";
    for (const [val, str] of lookup) {
      while (num >= val) {
        res += str;
        num -= val;
      }
    }
    return res;
  };
  const d = toRoman(now.getDate());
  const m = toRoman(now.getMonth() + 1);
  const y = toRoman(now.getFullYear());
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  return `${d} · ${m} · ${y} · ${hh}:${mm}`;
}

export default defineConfig({
  define: {
    __BUILD_TIMESTAMP__: JSON.stringify(getBuildTimestamp()),
  },
  resolve: {
    tsconfigPaths: true,
    dedupe: [
      "react",
      "react-dom",
      "@tanstack/react-router",
      "@tanstack/react-start",
    ],
  },
  build: {
    sourcemap: false,
  },
  plugins: [
    devtools(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
  ],
});
