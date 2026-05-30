import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
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

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import type { QueryClient } from '@tanstack/react-query'

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
          <ul className="inline-flex items-center gap-4 small-caps text-xs text-fg-muted">
            <li>
              <RubricLink to="/">Frontispiece</RubricLink>
            </li>
            <li aria-hidden="true" className="text-rubric/70">
              <Fleuron variant="mark" />
            </li>
            <li>
              <RubricLink to="/articles">Folios</RubricLink>
            </li>
            <li aria-hidden="true" className="text-rubric/70">
              <Fleuron variant="mark" />
            </li>
            <li>
              <RubricLink to="/about">The Author</RubricLink>
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
              Set in <span className="italic">EB Garamond</span> and{" "}
              <span className="italic">Cormorant Garamond</span>, with the
              nameplate in <span className="italic">UnifrakturCook</span> and
              code in <span className="italic">JetBrains Mono</span>. Composed
              by hand in <span className="italic">TanStack Start</span>, set in
              type by <span className="italic">Tailwind</span> and{" "}
              <span className="italic">React</span>, struck on the
              Cloudflare press in the year of our Lord {toRoman(yyyy)}. The
              compositor's manuscripts are kept at{" "}
              <a
                href="https://github.com/zeetec20"
                target="_blank"
                rel="noreferrer"
                className="text-rubric border-b border-current hover:border-transparent transition-[border-color] duration-[120ms]"
              >
                github.com/zeetec20
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
        <Scripts />
      </body>
    </html>
  )
}
