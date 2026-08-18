import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Nearly every page in this app depends on live Postgres data
  // (shop, admin-dashboard, admin-audit, etc.). Server-rendering
  // those means the server has to wait on a real network round-trip
  // to your own backend before it can respond — slow and fragile in
  // dev, and the cause of pages hanging until a rebuild forced them
  // to finish. Rendering everything client-side means the browser
  // loads the app shell immediately, then fetches data itself,
  // exactly like a normal single-page app.
  //
  // If you want specific static/public pages (e.g. Home) to keep
  // SSR/prerendering later for SEO, they can be pulled out of this
  // catch-all and given their own RenderMode.Prerender entry above
  // this line — but only once their data-fetching services are
  // confirmed safe to run with no data at all (isPlatformBrowser
  // guards, same pattern as store.ts).
  { path: '**', renderMode: RenderMode.Client }
];