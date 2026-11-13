# Performance

Audited with Lighthouse (Chrome, Navigation, Mobile) on the production build
(`npm run build` + `npm run preview`), never on the dev server. Page audited:
the recipes page, logged in as a test user. The audit ran in a Guest window so
that extensions would not affect the numbers.

Report: `docs/lighthouse-before.html`. The split-run numbers below were read
from the Lighthouse screen during the experiment; that report was not saved.
## Before

| Metric | Result |
|---|---|
| Performance | 91 |
| Accessibility | 100 |
| Best Practices | 100 |
| SEO | 92 |Reports
| First Contentful Paint | 1.9 s |
| Largest Contentful Paint | 3.3 s |
| Total Blocking Time | 50 ms |
| Cumulative Layout Shift | 0 |
| Speed Index | 2.0 s |

Build: one JavaScript file, 269.60 kB (85.10 kB gzip), CSS 5.04 kB.

Lighthouse findings: render-blocking requests (about 600 ms), improve image
delivery (36 KiB), reduce unused JavaScript (42 KiB), LCP request discovery.

## The fix I tried: code splitting (Session 22)

The recipes and pantry pages were loaded with `lazy(() => import(...))`
inside `<Suspense>`, so the login page would not download their code.

## After

| Metric | Run 1 | Run 2 |
|---|---|---|
| Performance | 86 | 85 |
| Accessibility | 100 | 100 |
| Best Practices | 100 | 100 |
| SEO | 92 | 92 |
| First Contentful Paint | 2.1 s | 2.1 s |
| Largest Contentful Paint | 4.0 s | 4.0 s |
| Total Blocking Time | 20 ms | 40 ms |
| Cumulative Layout Shift | 0 | 0 |
| Speed Index | 2.2 s | 2.8 s |

Build after splitting: main file 263.32 kB (83.85 kB gzip), RecipesPage
6.03 kB, PantryPage 2.35 kB, units 0.38 kB.

## What I learned

- Splitting removed only about 6 kB from the main file. Almost all of it is
  React and the router, which every page needs, so there was little to split.
- The audited page is itself one of the split pieces. The browser now has to
  load the main file, then the recipes file, then the recipes data, then the
  photos. That extra step is why LCP went from 3.3 s to 4.0 s.
- Lighthouse varies between runs. Re-running the original single-file build
  gave 88, so the original sits around 88 to 91 and the split around 85 to 86.
  The split looks slightly worse, and the gap is small.
- Splitting would help someone who only visits the login page. It does not
  help the page we audited.

## Decision

I reverted to a single bundle. A fix that measured worse on the main page was
not worth keeping for an app this small. The final code is the "before" code.

## Not fixed, and why

- Render-blocking requests (about 600 ms): most likely the Google Fonts
  stylesheet. Not covered in the course slides, so left alone.
- Improve image delivery (36 KiB): the recipe photos are links to other
  websites, so I cannot resize them. The `<img>` tags already have `width`
  and `height` (CLS is 0), and only cards below the fold use `lazy`.
- SEO 92, "robots.txt is not valid": the preview server answers `/robots.txt`
  with the app's `index.html`, so Lighthouse reads HTML as a robots file. It
  comes from the local preview, not from a problem in the app.

## Other optimizations already in place

- Database index on recipes `{ userId, createdAt }` and on pantry
  `{ userId, name }`, matching the filter and sort order of the queries.
- Accessibility fixes (nav link contrast) that took Accessibility to 100.