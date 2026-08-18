/* ────────── Site content (client-safe public API) ──────────
 *
 * Importing this file is safe from both client and server components.
 * It only re-exports the client-safe types and default constants.
 *
 * Server-only file-system helpers (getSiteContent / saveSiteContent*)
 * live in `./site-content.server` and must be imported directly from
 * there in API routes / server actions / server components.
 */

export {
  DEFAULT_ABOUT,
  DEFAULT_APPLICATIONS,
  DEFAULT_DESIGN_RESOURCES,
  DEFAULT_PRODUCTS,
  DEFAULT_SITE_CONTENT,
  SITE_CONTENT_SECTIONS,
  type NestedStringMap,
  type SiteContent,
  type SiteContentSection,
  type TripleNestedStringMap,
} from './site-content-shared';
