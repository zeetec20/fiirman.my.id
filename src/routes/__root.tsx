import {
  createRootRoute,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { NotFoundPage } from "@/components/NotFoundPage";
import { PaperDesignShaderBackground } from "@/components/ui/paper-design-shader-background";
import appCss from "@/styles.css?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Firman Lestari" },
      {
        name: "description",
        content:
          "Personal space for Firman Lestari's thoughts, notes, projects",
      },
    ],
    links: [
      {
        rel: "preload",
        href: "/fonts/newsreader-latin-wght-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      {
        rel: "preload",
        href: "/fonts/unifrakturmaguntia-latin-400-normal.woff2",
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico" },
    ],
  }),
  component: RootComponent,
  errorComponent: RootErrorComponent,
  notFoundComponent: NotFoundPage,
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
          className="px-3 py-1 text-xs font-mono font-semibold bg-[var(--accent)] text-[var(--accent-foreground)] rounded-xs hover:opacity-90 transition-opacity cursor-pointer"
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
