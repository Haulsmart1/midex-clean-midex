# Midnight overnight release review — 2026-10-12

Starting checkpoint: `c5192fbb195ea4340a02b97ef03bf541cee41ff5` on
`stu-development`. Target is the existing Midnight Vercel project
`midex-clean-midex` (`prj_ssFhW39cgBpDO7aZsP5ifUnj0iJw`), team
`team_4s3slf7RDwc6sdOHUHIp2NoJ`. No main modification, push, deployment,
Vercel environment mutation, domain/DNS mutation, Supabase production operation,
payment or customer email was performed.

## Release decision

**Production deployment is blocked.** A passing local candidate build does not
establish production configuration or parity with the newer deployed source.

1. Configure fresh `NEXTAUTH_SECRET` as a Secret in the existing project's
   Production environment. Authentication is intended and remains enabled;
   its missing-secret 503 guard is preserved. Do not reuse Git-exposed credentials.
2. Supply the required map and mail configuration in
   [PRODUCTION-ENVIRONMENT-AUDIT.md](PRODUCTION-ENVIRONMENT-AUDIT.md):
   `NEXT_PUBLIC_TOMTOM_API_KEY`, `NODEMAILER_SMTP_HOST`, `NODEMAILER_USER`,
   `NODEMAILER_PASS`, `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_HOST`, `EMAIL_PORT`,
   `EMAIL_SECURE`. These names are absent from the read-only Vercel inventory.
   Historical uploaded environments may explain current behavior but are excluded
   from the candidate. No values were fabricated or transferred.
3. Obtain the complete production source corresponding to
   `5feb51fddde6fc8e1142b76075a53af1927bc830` and reconcile the production-only
   routes/invoicing files, or obtain Stuart's explicit acceptance of their removal
   from this release. This task did not authorize discarding that functionality.
   The verified recovery checkpoint's functionality remains intact.

## Local corrections

- `vercel.json` now uses normal lockfile installation `npm ci`, followed by
  `npm run build`; the dependency peer-bypass is removed.
- Added actual `.vercelignore`. The recovered `.vercelignore.txt` is retained,
  but Vercel does not use that filename for upload exclusions. Local environments,
  caches, generated output and all standalone Supabase work are excluded.
  `supabase/functions/deno.json` remains untracked and unchanged.
- Targeted dependency corrections retain Next **15.5.27**, application Nodemailer
  **10.0.9** via `midnight-nodemailer`, NextAuth **4.24.15**, Axios **1.20.0**.
  The normal install retains a valid optional-peer arrangement without installing
  the incompatible conventional Nodemailer peer.
- Controlled Sharp **0.35.5** override repairs the reachable image-optimizer
  dependency; same-major Lodash **4.18.1** override repairs the map SDK's exact
  vulnerable pin. Compatible lock updates cover Preact **10.29.8**, ws **8.22.0**,
  qs **6.16.0**, protocol-buffers-schema **3.6.1**, source-map-js **1.2.2**,
  nanoid **3.3.20**, root PostCSS **8.5.29**, and associated compatible helpers.
  No dependency major upgrades or recovered application source removals occurred.
- Added six meaningful offline dependency compatibility tests to the complete
  local suite. They exercise Next's real optimizer with recovered image bytes,
  Preact rendering, Stripe serialization, owning-library WebSocket resolution,
  the map schema parser and Lodash merge/prototype isolation.

## Strongest completed read-only production comparison

Current live deployment is `dpl_HcxMpNQukFUaEMV8qqbWbmgqEgXT`, READY, production,
build ID `B0yRP9TJ9MqGD4SiNZRXd`, with commit metadata
`5feb51fddde6fc8e1142b76075a53af1927bc830`.

All six approved domains remain attached and verified. The three apex domains
return 307 to their own www domains. All three www roots return 200 with identical
HTML SHA256 and the same build ID. No domain operation was performed.
Initial comparison made 33 anonymous GET requests covering hosts, pages, auth,
redirects, error pages, JavaScript/CSS assets and image/locale assets. The public
route manifest contains 130 page patterns; all 25 non-dashboard, non-auth,
non-API concrete public routes were additionally fetched and returned 200.
The read-only optimizer probe returned a 200 JPEG response.

Chrome headless used a separate unauthenticated profile to render homepage,
login, booking and blog pages without submitting forms. The production homepage
shows ferry/freight routes and latest blog posts; `/blog` renders a public route
index. Production's anonymous `/booking` renders a Bookings page, whereas the
candidate is a booking wizard. These are material behavioral differences.

The visible source inventory permits comparison of 364 non-environment file
records: 140 raw SHA1 matches, 11 LF-normalized matches, 161 different hashes,
52 absent locally. The production UID convention was checked against retrievable
small source files. Some absent records are public assets/helpers; some represent
material routes or invoicing functionality. The production page manifest lists
**23 patterns absent from the candidate**, including public blog/group pages,
`/thank-you`, auth redirect and partner/admin pages. The candidate adds the
recovered freight desk and partner pages; these recovery additions are preserved.

**Residual limitation:** production file listing is truncated, including 4,517
omitted array entries and depth omissions. Production authOptions/package content
is also truncated by the connector. A read-only origin lookup reports main at
`539b115953fb693c78d8ca8c3062307e37935521`. Fetching the exact production SHA
with no branch update and no FETCH_HEAD write failed: origin rejected it as
`not our ref`. The production Git object therefore remains unavailable.
UID comparisons and browser output cannot establish
complete source equality, authenticated behavior, database/RLS policy correctness,
mail deliverability, payment correctness or Linux native execution. Selected
images match byte-for-byte; the English locale asset differs. See the complete
recorded names, route sets, statuses, headers, hashes and rendered headings in
[OVERNIGHT-PRODUCTION-COMPARISON.json](OVERNIGHT-PRODUCTION-COMPARISON.json).

## Security and credential review

Fresh audit falls from 56 to **48** package findings (33 high, 12 moderate,
2 low, 1 critical). Production-only audit has **47** findings, including CLI
packages declared as production dependencies. The critical tar finding belongs
to the Vercel CLI toolchain, with no application import found. Eight package
findings are removed: Lodash, nanoid, Preact, protocol-buffers-schema, qs, Sharp,
source-map-js and ws. Next's remaining finding propagates from pinned nested
PostCSS **8.4.31**; trusted build input is the evidenced usage, and no public CSS
compiler was found. The patched root PostCSS does not repair that nested copy.
No major Next upgrade or unsupported global audit-fix operation was applied.
All remaining packages have path/classification/reachability/remediation records in
[OVERNIGHT-SECURITY-REVIEW.md](OVERNIGHT-SECURITY-REVIEW.md) and its JSON companion.

The unchanged secret scanner logic was executed with a separate output filename
to preserve earlier reports: 26 commits, 89 candidate locations, comprising the
same five current-tree password-generation/hash expressions and 84 historical
locations. Values are suppressed. Historical credentials have not been rotated
by this work; never reuse those values for the release. The final staged tree is
also compared against known local credential values without printing them.

## Final validation

Validation uses Node **22.23.3**, offline provider stubs and network denial.
Environment keys are explicitly set to empty/offline values so Next cannot refill
them from ignored local environment files. Generated `.next` output is a local
validation artifact and must not be deployed. The production configuration and
source-parity blockers are independent of passing local tests.

| Check | Final result |
| --- | --- |
| Normal clean install | Node 22 `npm ci --no-audit --no-fund`, exit 0, 677 installed packages; no peer-bypass or force flag. Final lock reproduced. |
| Complete local suite | 40/40 passed, including six new dependency compatibility tests; no skips. |
| Separate routing suite | 4/4 passed (also included in complete suite). |
| Retained dependency compatibility suite | 4/4 passed: both SMTP entry points, offline MIME attachment composition, mocked Axios requests, Credentials-only NextAuth with optional mail peer absent. |
| Root TypeScript | `tsc --project jsconfig.json --noEmit --incremental false`, exit 0. |
| App TypeScript | `tsc --project .cache/validation/tsconfig.app.json --noEmit --incremental false`, exit 0; inherited root exclusions retain standalone Deno outside the website. |
| Clean production build | Existing `.next` moved into ignored cache after checking both absolute paths; fresh Next 15.5.27 build compiled in 58s, generated **123/123** static pages, finished tracing, exit 0. |
| Dependency tree | `npm ls --all --json`, exit 0, no problems. Four protected versions checked in manifest/lock/installed packages. |
| Security checks | Fresh full and production npm audit responses classified in accompanying reports; expected audit exit 1 for retained findings. |
| Secret scan | Current tree plus 26 pre-checkpoint reachable commits: 89 locations, five reviewed generation/hash expressions and 84 historical locations; no newly introduced credential literal. Values withheld. |
| Staged credential scan | Exact staged blobs checked against known ignored-local credential values; zero matches required before commit. Local environment files and Deno configuration excluded from index. |
| Whitespace | `git diff --check` and staged equivalent pass. |

The normal npm install reported its existing allow-scripts policy for bufferutil,
core-js and CLI esbuild lifecycle scripts; that policy was not bypassed. Sharp's
native prebuilt binary was exercised successfully by Next's optimizer test.
An intermediate nested PostCSS override did not resolve a valid lock/tree and
was removed. The final tree keeps Next's exact nested PostCSS pin, with its
findings explicitly retained. Two initial new-test assumptions (HTML `>` escaping
inside a quoted attribute and package.json export visibility) were corrected;
the final substantive assertions all pass.

The one local checkpoint includes only package/lock/build-upload configuration,
the dependency tests and new evidence documents. All application source already
present at the verified checkpoint is preserved. Its parent is the supplied
`c5192fbb195ea4340a02b97ef03bf541cee41ff5`; the resulting commit hash is reported
in the final response. No push or deployment follows this checkpoint.

**MIDNIGHT PRODUCTION RELEASE BLOCKED — STUART ACTION REQUIRED**
