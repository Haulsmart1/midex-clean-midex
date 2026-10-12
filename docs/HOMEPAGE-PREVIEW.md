# Midnight Express homepage preview

Base production release: `696047c`. Work is isolated on `stu-homepage-preview`; production is not promoted or overwritten.

## Design and conversion

A navy, warm-white and amber editorial freight design replaces the recovered Midnight homepage. The first viewport leads with EUROPEAN FREIGHT / AIR. SEA. ROAD, a real road-quote link (`/booking`) and the existing operations telephone (`0800 999 1263`). Road, air and sea cards lead into focused pages, followed by urgent dedicated transport, a European geography treatment, customs/import/export discussion, actual freight types and existing working routes. There are no enquiry forms or new external marketing scripts. Email links use the existing `freight@midnight-express.org` identity.

Air and sea are enquiry-led: detailed air, container, FCL/LCL, airport-to-airport and door-to-door capabilities were not established in the recovered material. Confirmation was requested from Stuart; until supplied, none is promised. No airline/shipping-line partnerships, IATA status, ratings, accreditations, guaranteed times, owned-fleet claims or invented offices appear. Generated unbranded images are transport illustrations, not evidence of Midnight-owned vehicles, aircraft or terminals.

## Evidence for commercial copy

- `pages/about.js`: dedicated overnight UK/Ireland/Northern Ireland freight, customs coordination and ADR; absolute time guarantees are deliberately omitted from the new copy.
- `utils/rateConfig.js`: small/long-wheelbase vans, tail-lift vehicles, rigid and articulated transport options; no owned fleet or capacity claim is made.
- `lib/cities.js`, original homepage ferry corridors, `data/recovered-production-freight.json` and European route data: UK, Ireland, France, Belgium, Netherlands, Germany, Spain, Italy and wider European scope.
- `pages/dashboard/forwarder/invoice/[id].js`: company name, existing operations telephone and freight email.
- Current terminology was reviewed against [UK government freight-forwarding guidance](https://www.gov.uk/guidance/freight-forwarding-moving-goods): road, air, sea, imports/exports, cargo and customs. This informed terminology, not claims about Midnight's capabilities.
- Geographic outline derived from Natural Earth country data, [public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/). Connections are illustrative; markers are not office locations or scheduled routes.

## SEO architecture and preservation

Reviewed the existing 2,352 `/blog/[slug]` records and all 23 recovered patterns before adding pages. No existing article, freight or protected-route file is removed or redirected. Five focused pages cover `/road-freight`, `/air-freight`, `/sea-freight`, `/time-critical-freight` and `/european-freight`; air and sea contain useful enquiry preparation rather than invented service promises. No country doorway pages were generated.

The new `/freight-resources` directory preserves every article link in crawlable server-rendered HTML. The homepage and footer link to it, existing blog groups and existing freight routes. The sitemap includes all 2,352 article URLs, all ten groups, the European index, all 32 preserved freight URLs, existing city/region URLs and new service pages. It no longer depends on an external database query or fabricated rolling modification dates; a dead `/routes` entry is omitted. Existing `/api/sitemap` and robots sitemap address remain valid. Robots excludes dashboard/API crawling, with an explicit sitemap exception.

New pages have unique titles/descriptions, one H1, semantic sections, production canonicals, absolute Open Graph imagery, WebSite/Organization/WebPage metadata and service-page BreadcrumbList. No review or rating markup is invented. Images have dimensions/sizes, descriptive alternatives where informative, WebP encoding and lazy loading below the hero. Three freight images total approximately 507 KB; the hero image is approximately 94 KB. The first build reports about 7 KB of homepage page JavaScript; the large recovered article array is not in the new homepage bundle. Mapping SDK scripts, map CSS and remote fonts remain available for existing application/shared-homepage pages and are skipped only for new freight-marketing pages.

Shared Express Pallets/Lithium Battery homepages are preserved through explicit host selection of the recovered homepage. Their original functionality, datasets, consent UI and application resource loading remain. Production mail/map/auth configuration is untouched. Two branch-specific Preview variables were added: a separate cryptographically random `NEXTAUTH_SECRET` and the existing legitimate public map key; no secret values are recorded and production secrets were not rotated. Mail credentials were not copied to Preview.

## Review evidence

Existing suite: 50/50 tests. Root/app TypeScript and production build are checked. Route, shared-host and live-domain evidence, browser/axe results, secret review and screenshots are recorded in `artifacts/homepage-preview` and `.cache/validation`. Automated checks are not formal accessibility certification. Browser testing submits no enquiry and performs no payment, Xero or Supabase write. Vercel deployment is Preview-only in the existing Midnight project; deployment details are recorded separately after creation. DNS and production domains are not changed. The untracked Supabase Deno configuration remains excluded.

Final local validation: **50/50 tests**, both TypeScript checks, **161/161** build pages, all 23 recovered patterns present, all 2,352 articles retained, 33 route/resource checks, four shared-host homepage checks and six live-domain checks passed. Six metadata/structured-data pages and 16 unique homepage internal links passed. Desktop/mobile axe WCAG A/AA checks have zero violations; image-backed contrast incomplete cases were visually reviewed. Keyboard skip focus and mobile menu work. Widths 320, 390, 768 and 1440 have no horizontal overflow. All images load. Known private values have zero source/client matches. Screenshots capture the exact locally verified production build; preview-host checks are recorded separately.

## Targeted European coverage correction

Stuart approved the visual design and confirmed freight involving Portugal, Norway, Sweden, Denmark and Finland. The homepage retains its approved aesthetic and ?Across borders. Closer to business.? treatment. The map keeps its 720?540 aspect ratio, navy country fills, neutral background and amber styling, reframed to 73? north so the Nordic countries are fully visible. Thirteen countries are labelled with five illustrative connection lines, with no schedule, permanent lane, office or automatic-availability claim. The country list says ?European coverage includes? and invites enquiries for other European destinations, with individual operational confirmation retained. Desktop uses a compact three-column list; mobile uses two columns.

The existing European freight page now includes useful Nordic and Portugal enquiry preparation for movements in both directions. No country doorway pages or new routes were created. Updated full-page/viewport screenshots and map-specific desktop/mobile captures are in `artifacts/homepage-preview`. The mobile map panel is approximately 306 pixels high; its aspect ratio is unchanged. Browser checks have zero detected exceptions, broken images, horizontal overflow or automated WCAG A/AA violations. The code correction is confined to the European homepage section, map, coverage-list styles and existing European service content. Deployment remains Preview-only.


## Poland and Baltic coverage correction

The existing European section now includes Poland, Estonia, Latvia and Lithuania, bringing the positive example coverage to 17 countries. The approved design, map dimensions and five illustrative connections are preserved. Map targets reflect the confirmed coverage instruction; no public exclusion notice is added. The existing European service page includes practical Poland/Baltic enquiry preparation without creating country doorway pages. Routes and shipment availability remain individually confirmed. This correction is Preview-only.
