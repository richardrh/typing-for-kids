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

The build runs strict Vue/TypeScript checks and writes `dist/`. Tests cover curriculum key boundaries, Shift/punctuation mapping, animal progression and migration, scoring, active-time speed, corrections, browser storage boundaries, and SEO origin/preview policies.

## Ownership

- `src/app/`: Vue Router, route-level pages, app composition, global visual styles.
- `src/lessons/`: ordered keyboard-skill categories, stable lesson IDs, allowed keys, finger guidance, and theme-specific text overrides. Common drills live in the catalog only; themed overrides are keyed by ID, not array position.
- `src/practice/`: input/cursor handling, scoring, timing, audio, and keyboard/finger guidance. `keyMapping.ts` is the shared source for physical keys, fingers, and opposite-hand Shift selection. `FingerGuide.vue` presents the instruction; `HandDiagram.vue` renders each hand as its own SVG root.
- `src/progress/`: versioned per-animal storage, legacy migration, and pure score/level calculations.
- `src/themes/`: six animal themes, selector, growing mascot, and SVG scenes. `src/themes/evolutions/` owns five forms per animal, unlock metadata, and visual power effects.
- `index.html`: static landing page, independent of the Vue bundle. The hero's animal cards link directly to themed practice; they sit beside the headline on desktop and below it on mobile.
- `src/site/landing.css`: landing-only styles; does not load the typing app's CSS or JavaScript.
- `build/staticSite.ts`: build-time canonical/social metadata, structured data, robots.txt, and sitemap generation.
- `build/deployment.ts`: shared base-path and history/hash routing configuration for Netlify and GitHub Pages.
- `public/`: favicon and social-sharing image. `social-card.svg` is the editable source for the 1200×630 `social-card.png`.
- `app/index.html`: application entrypoint.

Keep lesson IDs stable. When adding a lesson, declare its category and allowed characters; add theme overrides only where the taught keys can express themed words naturally. Changing exercise text invalidates unfinished keystrokes for that exercise.

## Curriculum and animal growth

There are nine ordered categories with four lessons each: home row and basics, bottom row, top row, left hand, right hand, full keyboard, capitals, numbers, and punctuation. Early drills stay inside their allowed key sets. Top-row, full-keyboard, capital, number, and punctuation exercises use animal-specific vocabulary and scenes; capital pairs practice real words such as `tiger Tiger stripe Stripe`, not isolated letter pairs. Number exercises combine already-learned letters with digits to count themed objects. Content is curated, not randomly generated.

The sidebar lists categories and completion counts; four lesson links show the current section without repeating a category heading above the practice panel. The sentence panel is compact so more of the keyboard stays visible. On small screens the category list collapses, and the header's **Keyboard skills** button opens and focuses it. Categories are always available, not locked by score.

Each animal earns progress independently. A completed lesson contributes `100 + best accuracy` points (maximum 200); retries can improve its accuracy contribution but never duplicate the completion reward. Four distinct completed lessons raise the animal one level, from level 1 to level 10 after all 36 lessons. The five forms are baby (level 1), young (level 2), growing (3–4), big (5–7), and shiny (8–10). The first transformation now happens after four exercises, while size and shine still increase after every newly completed exercise. Level, growth, and score remain derived from saved completions.

T-Rex, unicorn, turtle, tiger, orca, and shark each have five distinct illustrations. Orca forms develop increasingly heavy jaws, visible teeth, broader fins, and an armored final silhouette. Shark has reef-themed words and scenery and evolves into a **Megalodon** at level 8, with a massive body, enlarged triangular teeth, and Titan dash. The T-Rex deliberately retains the original friendly dinosaur artwork for its first form; later forms have a large skull, tiny two-finger arms, strong hind legs, and a balancing tail. Its internal `dinosaur` ID stays unchanged so existing links and earned progress survive the display-name change. Older saves receive an empty shark record without resetting other animals.

New artwork unlocks at levels 2, 3, 5, and 8. Visual powers unlock at levels 3, 5, and 8 (roar, stomp, magic, shield, splash, or shark dash), separately from the level-two visual reward. Powers last 1.2 seconds and never change scores, accuracy, or completion. Reduced-motion users get static feedback. The progress card previews the next form and accurately shows the next power level.

The visual keyboard uses a US QWERTY layout. The hand guide highlights the finger for the next key and names it in text. Space offers either thumb. Capitals and shifted punctuation show the typing finger plus the opposite hand's pinky on Shift, with a distinct gold Shift highlight. Guidance follows the editing cursor and clears on completion; it is associated with the typing field for assistive technology without announcing every keystroke.

## Routing and state

Vue Router uses browser history under `/app/` by default (Netlify). GitHub Pages builds use hash routes under the configured repository path. Default example:

```text
/app/lessons/easy-animal-words?theme=orca
```

`/app/` resumes an unfinished lesson, otherwise opens the selected animal's first incomplete lesson (home row for a new learner). Landing animal cards still open the themed animal-words lesson directly. Unknown app routes show a recoverable not-found screen. Lesson changes create history entries; theme changes replace the query string.

- `localStorage`: per-animal completions and best accuracy (`little-keys-progress`, version 2), selected theme (`typing-theme`), and sound preference (`little-keys-sound`). Version-1/unversioned progress migrates into the saved animal only, or dinosaur when no valid theme is saved; old earned progress is not duplicated across animals.
- `sessionStorage`: one unfinished exercise (`little-keys-session`, version 1), including exact target text, typed text, attempts, mistakes, and active elapsed milliseconds. Refresh restores it; closing the tab normally ends it. Browsers may restore session storage when restoring closed tabs.
- No data is sent to a server. Blocked or malformed storage must not prevent typing. Progress is browser/origin-local, not synchronized across devices.

Typing starts with the first character, not focus. Speed is matching current characters / 5 / active minutes, displayed after the first second. Timing pauses when the input loses focus, the page becomes hidden, or the exercise finishes. Accuracy counts all inserted attempts, including mistakes later corrected. Pasting/dropping text does not complete an exercise. Key sounds use short Web Audio tones after a trusted keyboard gesture and can be muted.

Enter advances a correctly completed sentence and retries the same sentence when the current text contains an uncorrected mistake. Retrying clears the typed text, attempt counters, elapsed time, and saved draft, then returns focus to the first key without awarding progress. An unfinished correct prefix stays in place. Both behaviors work in the typing field and after clicking the background. Clicking outside also resumes typing on the next printable key or Backspace, preserving the caret/selection and applying that first key exactly once. Handlers ignore held/composing Enter events, browser shortcuts, other editable fields, and native Enter/Space actions on buttons, links, or disclosure controls. Handlers are removed when leaving practice.

## Static hosting

`netlify.toml` configures `npm run build` and publishes `dist`. Only `/app/*` receives the SPA fallback to `/app/index.html`; existing static files take precedence. Vite development and preview use the same app-path fallback.

### GitHub Pages release

1. Push this repository, including the workflow, to GitHub on `main` or `master`.
2. In the repository's **Settings → Pages**, select **GitHub Actions** as the source.
3. Run **Deploy GitHub Pages** from the Actions tab, or push another commit to either configured branch.

`.github/workflows/deploy-pages.yml` installs locked dependencies, runs the regression suite, type-checks/builds, uploads `dist`, and deploys through GitHub's Pages environment. It reads the origin and repository base path from `actions/configure-pages`; user sites and custom-domain root sites are handled without hard-coded repository names. No token beyond the workflow's scoped `GITHUB_TOKEN` is required.

The Pages build uses URLs such as `/typing-for-kids/app/#/lessons/easy-animal-words?theme=tiger`. The browser requests the real `/typing-for-kids/app/index.html`; lesson navigation stays in the hash, so deep-link refresh works without an unsupported server fallback or a redirecting 404 page. The landing remains an ordinary indexable HTML document. Netlify continues using clean history URLs.

To reproduce a project-site build locally:

```sh
BASE_PATH=/typing-for-kids/ VITE_ROUTER_MODE=hash SITE_URL=https://your-name.github.io npm run build
BASE_PATH=/typing-for-kids/ VITE_ROUTER_MODE=hash npm run preview
```

Open `/typing-for-kids/` on the preview server. `BASE_PATH` is normalized with leading/trailing slashes; `SITE_URL` is the origin only. Leave both routing settings unset for the existing root/Netlify deployment. `.nojekyll` is generated with the build. GitHub Pages owns caching/headers, so Netlify's header rules do not apply there. On a project site, the sitemap is under the repository path; submit that URL to Search Console because an origin-wide robots.txt is controlled by the user-site root, not the project.

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
