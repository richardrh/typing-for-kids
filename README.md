# Typing for Kids

Static Vue 3 + TypeScript typing practice. No backend, database, accounts, or runtime API requests.

## Run

Requires Node 22.19 or newer.

```sh
npm ci
npm run dev
```

Open `/app/` for practice. `/` is the static landing page, with no client-side JavaScript or hydration.

```sh
npm test
npm run build
npm run preview
```

The build runs strict Vue/TypeScript checks and writes `dist/`. Tests cover scoring, active-time speed, corrections, browser storage boundaries, and SEO origin/preview policies.

## Ownership

- `src/app/`: Vue Router, route-level pages, app composition, global visual styles.
- `src/lessons/`: stable lesson IDs, keyboard guidance, curated theme-specific exercise text. The first two lessons are keyboard drills; later lessons use animal words and sentences. Content is not randomly generated.
- `src/practice/`: input/cursor handling, scoring, active session timing, audio, and visual keyboard. No routing knowledge.
- `src/progress/`: versioned browser storage, validation, and migration from the original progress format.
- `src/themes/`: theme definitions, selector, mascot, and separate SVG scene assets. Themes share one practice UI.
- `index.html`: static landing page, independent of the Vue bundle. The hero's animal cards link directly to themed practice; they sit beside the headline on desktop and below it on mobile.
- `src/site/landing.css`: landing-only styles; does not load the typing app's CSS or JavaScript.
- `build/staticSite.ts`: build-time canonical/social metadata, structured data, robots.txt, and sitemap generation.
- `public/`: favicon and social-sharing image. `social-card.svg` is the editable source for the 1200×630 `social-card.png`.
- `app/index.html`: application entrypoint.

Keep lesson IDs stable: saved progress uses them. When adding a lesson, supply content for each theme in `src/lessons/themed.ts`. Changing an exercise's text invalidates an unfinished session for that exercise, rather than applying old keystrokes to new text.

## Routing and state

Vue Router uses browser history under `/app/`. Example:

```text
/app/lessons/easy-animal-words?theme=orca
```

`/app/` resumes the current session's lesson or opens animal words. Unknown app routes show a recoverable not-found screen. Lesson changes create history entries; theme changes replace the query string.

- `localStorage`: completed lessons and best accuracy (`little-keys-progress`, version 1), selected theme (`typing-theme`), and sound preference (`little-keys-sound`). Old unversioned progress is still readable and rewritten in version 1 on completion.
- `sessionStorage`: one unfinished exercise (`little-keys-session`, version 1), including exact target text, typed text, attempts, mistakes, and active elapsed milliseconds. Refresh restores it; closing the tab normally ends it. Browsers may restore session storage when restoring closed tabs.
- No data is sent to a server. Blocked or malformed storage must not prevent typing. Progress is browser/origin-local, not synchronized across devices.

Typing starts with the first character, not focus. Speed is matching current characters / 5 / active minutes, displayed after the first second. Timing pauses when the input loses focus, the page becomes hidden, or the exercise finishes. Accuracy counts all inserted attempts, including mistakes later corrected. Pasting/dropping text does not complete an exercise. Key sounds use short Web Audio tones after a trusted keyboard gesture and can be muted.

## Netlify and the marketing site

`netlify.toml` configures `npm run build` and publishes `dist`. Only `/app/*` receives the SPA fallback to `/app/index.html`; existing static files take precedence. Vite development and preview use the same app-path fallback.

The landing is fully rendered static HTML, not a Nuxt application. Vite generates its final metadata and optimized assets at build time; no server or hydration is required. Nuxt would add a second framework without improving this page's rendering model. Keep marketing pages outside `/app/`, and do not replace the scoped redirect with a catch-all `/*` SPA redirect.

No Netlify account configuration, domain, or remote deployment is included in this repository.

### Production URLs and indexing

Set `SITE_URL` to the site's final HTTPS origin (no path), for example `https://your-domain.com`. On Netlify, the build falls back to Netlify's `URL` environment variable. `SITE_URL` takes precedence for a custom domain. Deploy-preview URLs are never used as canonical origins.

With an origin configured, the build generates a canonical link, Open Graph and Twitter metadata, WebSite/WebApplication JSON-LD, and a sitemap containing the landing page. Without an origin, local builds omit URL-dependent metadata and the sitemap rather than invent a domain.

Netlify deploy previews and branch deploys emit `noindex,nofollow` and a robots file disallowing crawling. Production emits an indexable landing page; app routes use `noindex,follow` to avoid indexing duplicate practice screens. This is search-engine guidance, not access control.

Hashed assets receive immutable caching on Netlify. No analytics or third-party tracking is installed.

### Lighthouse audit

Audit the production build, not the Vite development server:

```sh
SITE_URL=http://127.0.0.1:4173 npm run build
npm run preview -- --host 127.0.0.1 --port 4173
# In a second terminal:
npm run audit:landing
```

Chrome must be installed; set `CHROME_PATH` if it is not discovered automatically. The audit runs Lighthouse's mobile performance, accessibility, best-practices, and SEO categories and writes ignored `lighthouse-report.report.html` and `.json` files. Run `npm run audit:landing:desktop` for a desktop audit. Scores are lab measurements; recheck the deployed HTTPS URL because host latency, compression, and caching can change results. Google Analytics is separate traffic measurement, not a performance or SEO score.
