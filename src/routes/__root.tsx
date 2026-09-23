import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { PaperDesignShaderBackground } from "@/components/ui/paper-design-shader-background";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Firman Lestari — De Litteris et Codicibus" },
      {
        name: "description",
        content:
          "Personal portfolio, distributed systems research, and technical manuscripts of Firman Lestari.",
      },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,200..800;1,6..72,200..800&family=Space+Mono:ital,wght@0,400;0,700;1,400;1,700&family=UnifrakturMaguntia&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
  errorComponent: RootErrorComponent,
});

function RootErrorComponent({
  error,
  reset,
}: {
  error: unknown;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 font-serif">
      <div className="max-w-md w-full p-6 rounded-xs border border-red-500/30 bg-red-500/5 backdrop-blur-md space-y-4">
        <div className="font-mono text-xs text-red-500 uppercase tracking-widest font-semibold">
          System Exception Encountered
        </div>
        <p className="text-sm text-[var(--ink-secondary)]">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="px-3 py-1 text-xs font-mono font-semibold bg-[var(--accent)] text-stone-950 rounded-xs hover:opacity-90 transition-opacity cursor-pointer"
        >
          Retry Operation
        </button>
      </div>
    </div>
  );
}

function RootComponent() {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var isDark = theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <PaperDesignShaderBackground />
        <Outlet />
        <Scripts />
      </body>
    </html>
  );
}
