import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { Suspense, lazy } from 'react'
import { BackgroundDecoration } from '../components/background-decoration'
import { Masthead } from '../components/masthead'
import { Dateline, toRoman } from '../components/dateline'
import { Fleuron } from '../components/fleuron'
import { RubricLink } from '../components/rubric-link'
import { RuleDouble, RuleHair } from '../components/rules'
import { SocialLinks } from '../components/social-links'
import { ThemeToggle } from '../components/theme-toggle'
import { Toaster } from '../components/ui/sonner'
import { TooltipProvider } from '../components/ui/tooltip'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

/**
 * Dev-only devtools mount. `import.meta.env.DEV` is a Vite compile-time
 * constant — in production it's literal `false`, so this ternary collapses
 * to `null` and Rollup tree-shakes the entire dynamic-import chain. The
 * @tanstack/react-devtools + router-devtools + query-devtools chunks are
 * not emitted in the production bundle.
 */
const DevtoolsMount = import.meta.env.DEV
  ? lazy(async () => {
      const [
        { TanStackDevtools },
        { TanStackRouterDevtoolsPanel },
        qdModule,
      ] = await Promise.all([
        import('@tanstack/react-devtools'),
        import('@tanstack/react-router-devtools'),
        import('../integrations/tanstack-query/devtools'),
      ])
      const TanStackQueryDevtools = qdModule.default
      return {
        default: () => (
          <TanStackDevtools
            config={{ position: 'bottom-right' }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
              TanStackQueryDevtools,
            ]}
          />
        ),
      }
    })
  : null

interface MyRouterContext {
  queryClient: QueryClient
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);root.setAttribute('data-theme',mode);root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Firman Lestari',
      },
      {
        name: 'description',
        content: 'Notes, articles, and other ephemera by Firman Lestari.',
      },
    ],
    links: [
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: '/fonts/eb-garamond-latin-wght-normal.woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: '/fonts/cormorant-garamond-latin-wght-normal.woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        as: 'font',
        type: 'font/woff2',
        href: '/fonts/unifrakturcook-latin-700-normal.woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
        sizes: '32x32',
      },
      {
        rel: 'apple-touch-icon',
        href: '/logo192.png',
        sizes: '192x192',
      },
      {
        rel: 'manifest',
        href: '/manifest.json',
      },
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const today = new Date()
  const dd = String(today.getDate()).padStart(2, '0')
  const mm = String(today.getMonth() + 1).padStart(2, '0')
  const yyyy = today.getFullYear()
  const todayKey = `${dd}-${mm}-${yyyy}`

  return (
    <html lang="en" data-theme="auto" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-serif text-base bg-bg text-fg relative isolate">
        <TooltipProvider delayDuration={300}>
        <BackgroundDecoration />

        <div className="fixed top-4 right-4 z-50">
          <ThemeToggle />
        </div>

        <Masthead />

        <nav className="text-center pb-6 px-4">
          <ul className="inline-flex items-end gap-4 sm:gap-6 small-caps text-xs text-fg-muted">
            <li>
              <RubricLink to="/" className="inline-flex flex-col items-center leading-none">
                <span className="font-serif-display italic text-xs text-fg-muted/60 normal-case tracking-normal translate-y-1">
                  Home
                </span>
                <span className="relative">Frontispiece</span>
              </RubricLink>
            </li>
            <li aria-hidden="true" className="text-rubric/70 pb-1">
              <Fleuron variant="mark" />
            </li>
            <li>
              <RubricLink to="/articles" className="inline-flex flex-col items-center leading-none">
                <span className="font-serif-display italic text-xs text-fg-muted/60 normal-case tracking-normal translate-y-1">
                  Articles
                </span>
                <span className="relative">Folios</span>
              </RubricLink>
            </li>
            <li aria-hidden="true" className="text-rubric/70 pb-1">
              <Fleuron variant="mark" />
            </li>
            <li>
              <RubricLink to="/about" className="inline-flex flex-col items-center leading-none">
                <span className="font-serif-display italic text-xs text-fg-muted/60 normal-case tracking-normal translate-y-1">
                  About
                </span>
                <span className="relative">The Author</span>
              </RubricLink>
            </li>
          </ul>
        </nav>

        <main className="max-w-page mx-auto px-4 pb-16">{children}</main>

        <footer className="max-w-page mx-auto px-4 pb-16 pt-8">
          <RuleDouble />
          <div className="flex items-center justify-between mt-4 small-caps text-xs text-fg-muted">
            <span>Firman Lestari &middot; ZEETEC20</span>
            <Dateline date={todayKey} />
          </div>

          <div className="mt-10 max-w-prose mx-auto text-center">
            <div className="mb-3 text-rubric flex justify-center">
              <Fleuron variant="flourish" />
            </div>
            <p className="small-caps text-xs text-fg-muted tracking-[0.2em] mb-3">
              Colophon
            </p>
            <p className="font-serif text-sm text-fg-muted leading-relaxed">
              Composed by hand in <span className="italic">TanStack Start</span>,
              set in type by <span className="italic">Tailwind</span> and{" "}
              <span className="italic">React</span>, struck on the Cloudflare
              press in the year of our Lord {toRoman(yyyy)}. The compositor's
              manuscripts are kept at{" "}
              <a
                href="https://github.com/zeetec20/fiirman.my.id"
                target="_blank"
                rel="noreferrer"
                className="text-rubric border-b border-current hover:border-transparent transition-[border-color] duration-[120ms]"
              >
                github.com/zeetec20/fiirman.my.id
              </a>
              .
            </p>
          </div>

          <RuleHair className="my-6" />
          <SocialLinks />
          <div className="mt-4 text-center small-caps text-xs text-fg-muted">
            &copy; {yyyy} Firman Lestari &middot; All rights reserved.
          </div>
        </footer>
        </TooltipProvider>

        <Toaster position="bottom-right" />

        {DevtoolsMount ? (
          <Suspense fallback={null}>
            <DevtoolsMount />
          </Suspense>
        ) : null}
        <Scripts />
      </body>
    </html>
  )
}
