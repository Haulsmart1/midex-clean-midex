# MIDNIGHT EXPRESS restart recovery and completion report

Date: 2026-10-11. Repository: `C:\Users\StuartDargue\midnight-development`.
Branch: `stu-development`. Recovered HEAD: `539b115`.

## Recovery evidence

The first inspection found eight modified tracked files: `.gitignore`,
`lib/authOptions.js`, `pages/api/auth/[...nextauth].js`,
`pages/api/bookings/index.js`, `pages/api/haulsync.js`,
`pages/api/submit-booking.js`, `pages/api/test-supabase-login.js`, and
`scripts/syncMidnightToHaulsmart.js`. Untracked work comprised
`docs/FORENSIC-AUDIT.md`, `docs/SECRET-SCAN.json`,
`lib/server/supabaseForSession.js`, and `scripts/scan-secrets.cjs`.

The audit was written at 23:05 on October 10, session helper at 23:06 and
scan report at 23:07 (local filesystem timestamps; not proof of execution order).
The initial diff showed 44 additions and 311 deletions in tracked files.
Recent commits were baseline build/deployment fixes, not commits from the
interrupted development run. Reflog showed only clone and checkout from main
to stu-development. `git fsck --no-reflogs --unreachable` also completed
successfully with no unreachable objects reported. No interrupted-run local
commit was found.

Completed and recovered from that run: static feature/security inventory,
redacted secret-candidate scan, ignore rules for environment/cache files,
request-local login client, removal of plaintext-password auth configuration
and fallback secret, owner-scoped booking access, initial booking validation,
and retirement of direct Haulsmart sync and misleading diagnostic/save routes.

Interrupted/incomplete at recovery: those security edits had no passing
validation record; booking inserts lacked a catch boundary; authentication
configuration remained in a page module; there was no token-expiry gate,
mock adapter, procurement model, planning desk or deterministic local suite.
The audit explicitly recorded missing dependencies and failing build/route
checks. No shipment/procurement implementation was present in the recovered
files. Nothing on disk establishes a later completed phase.

No recovered work was reset, discarded or reverted. The recovered audit is
retained. Auth configuration was moved into a server module with its existing
Supabase password login and user/customs-agent/Currys profile branches
preserved. The generated secret scan was refreshed, with values suppressed.

**Loss assessment:** no tracked file loss or lost local commit is evidenced.
Unsaved editor buffers, session reasoning and unflushed changes cannot be
recovered or verified from this tree. The complete original conversation/brief
is not available in the repository. This report reconciles the user's supplied
freight-desk brief and every feature category in the recovered forensic audit;
it does not claim to reconstruct unavailable requirements verbatim.

## Work completed after recovery

- Canonical server auth configuration shared by login and session verification.
  Request-local clients remain; missing secret returns 503 on the auth route.
  Malformed/expired Supabase tokens are rejected with a 30-second margin.
  Expired tokens are cleared from JWT state. Reauthentication is required;
  automatic refresh was deliberately not added without a tested rotation strategy.
- Booking reads and inserts use the session's identity and user-token client.
  Invalid pallets/stops/costs return validation errors. Insert/session/client
  exceptions return a controlled error; database detail is not returned.
  Sign-off rejects unusable database sessions before proceeding.
- Global user listing and deletion now require a current server-issued
  super_admin session before constructing a service-role client. Deletion
  rejects malformed IDs and self-deletion, and reports partial profile-cleanup
  failures explicitly. Partner/tenant administrators cannot use the global
  delete route pending an organisation membership model. No real account was
  listed or deleted during verification; tests substitute in-memory clients.
- Profile lookup returns only the signed-in account's role fields, rejects
  arbitrary email lookup, and no longer uses a service-role enumeration query.
  Legacy plaintext user creation and employee-table password updates return
  410. The broken arbitrary-email admin-reset route also returns 410.
- Quote updates verify booking ownership before route calculation and constrain
  the update to the same owner. Missing rows and update failures are no longer
  reported as successful writes. Route mileage uses the pricing engine's actual
  fields; null ferry routes remain internal routes.
- Routing retains latitude/longitude order consistently, handles malformed
  geometry, and avoids charging an internal road leg as both collection and
  delivery. Road-mile partitions cannot become negative.
- Live Haulsmart API/sync remain disabled. The admin detail page no longer
  creates a cross-product client; both legacy load-injection scripts fail before
  publishing. The partner allocation button no longer writes an allocation or
  falsely reports an external award.
- Legacy temporary ZIP download returns 410 because there is no record-scoped
  ownership/grant model to authorize arbitrary filenames safely. Legacy
  submit-booking returns 501 rather than falsely claiming persistence;
  diagnostic login returns 410. These are intentional capability retirements.
- Provider-neutral local shipment model with stage guards, optimistic version
  checks, ordered audit events, same-currency integer minor-unit quotes,
  expiry checks, one award, tracking progression and POD-gated close.
- Version-1 Haulsmart mock adapter with deterministic synthetic quotes;
  no network, credentials, external booking or live adapter.
- `/dashboard/freight-desk` demonstrates create → plan → source/tender →
  compare → book → track → receive simulated POD → close. Demo state exists
  in browser local storage and can be resumed after reload. A versioned command
  log reconstructs the record by replaying validated actions; stored stage,
  award and quote fields are not trusted. Corrupt snapshots are retained until
  explicitly cleared. Writes detect stale snapshots from another tab. Plans
  accept a vehicle and collection date, and expired quotes can be refreshed
  before award without recreating the shipment. Existing authenticated bookings
  are projected read-only and retain their legacy statuses. A link is added
  from the user booking list. No production shipment data is copied into the demo.
- Dependency-free Node tests exercise the real local domain, API handlers and
  routing/pricing modules, using mocked auth/database/maps dependencies.
  `test-route` now runs offline assertions; the older manual script is preserved.

## Completion against the brief and recovered feature inventory

LOCAL means source plus executed local tests where stated, not production readiness.

| Area | Result at end of resumed run | Still incomplete / unverified |
| --- | --- | --- |
| Shipper/forwarder/manufacturer freight desk | Local model and demo cover the full requested lifecycle | Durable organisation-scoped procurement storage and real operational workflow |
| Create shipment once | Existing booking creation preserved; demo record reused throughout lifecycle | Server-authoritative pricing, durable idempotency and consolidated legacy wizards |
| Plan / allocation | Local vehicle/date plan; read-only existing-booking view | Capacity, multi-leg planning, carrier allocation transactions and tenant rules |
| Source / tender | Deterministic local adapter request and quotes | Approved-carrier membership, deadlines, invitations and durable tender records |
| Compare quotes | Same-currency comparison, integer money, quote expiry guards | FX snapshots, tax/charge normalization, commercial terms and production quote ingestion |
| Book / award | Single simulated award with stage/version guards | Transactional hosted award and booking persistence; no transport actually booked |
| Track | Local departure/delivery events and ordered history | Authorised external event ingestion, exception handling and ETA |
| POD / close | Simulated POD reference required before close | Actual private document upload, scoped download grants, atomic finance/sign-off |
| Dashboard / navigation | Existing dashboards preserved; demo linked from user bookings | Route duplication and complete role/navigation consolidation |
| Company/customer/carrier network | Existing partial partner/user screens retained | Verified organisations, memberships and approved-carrier panel |
| Pricing | Fixed quote mileage contract, coordinate order and internal-leg partition | Client-supplied totals, effective-dated rate rules and authoritative tax/customs computation |
| Finance / reporting | Existing partial invoice/commission/export code retained | Atomic invoice/sign-off, spend/savings/carrier performance reports and reconciliation |
| Templates / recurrence / bulk import | Not implemented | User-facing validated repeat-order and import workflows |
| Addresses / contacts | Existing collection/delivery/contact inputs retained | Tenant address book and reusable contact management |
| Notifications | Existing code retained; no message sent | Authorised delivery testing, preferences, queues and duplicate suppression |
| Authentication / permissions | Selected login, bookings, quotes, profile, global account operations and sign-off boundaries hardened locally | Other APIs/direct browser queries, trusted role provenance and actual hosted RLS remain unaudited at runtime |
| Tenancy / invitations / entitlements | Existing partial mechanisms retained | Authoritative organisation schema, invitation scope, entitlement enforcement |
| Currencies / languages | Existing locale files retained; demo quotes use one currency per shipment | FX snapshot service; undeclared hoisted Axios dependency and misplaced API page components remain |
| ADR / dangerous goods | Existing ADR flags and document validation retained | Structured declarations, carrier acceptance and regulatory review |
| International / customs | Existing route/forms preserved; mileage handling fixed | Regulatory correctness and effective-dated customs/VAT rules are not certified |
| Documents / storage | Unsafe generic temp-download route retired | Private buckets, document ownership and expiring scoped URLs |
| Mobile / PWA | Existing responsive work retained | Dedicated mobile verification, manifest and service worker |
| AI desk assistant | Not implemented | Authorised contextual assistant, tools, audit and privacy controls |
| Integrations | Haulsmart stays mocked/local and adapter-based | No live freight exchange integration implemented or activated |
| Legacy / demo / dead code | False-success routes and direct Haulsmart actions disabled | Remaining duplicates, temporary files, placeholder reports and commercial side-effect APIs |

## Final verification after dependency restoration

Verified on 2026-10-11 using Node 22.23.3 and npm 10.9.9. Stuart completed
lock synchronization and npm ci before this validation. The previous dependency
installation blocker is resolved. Earlier failed installation/build attempts
above are historical; the results below supersede the earlier validation state.

| Executed check | Final result |
| --- | --- |
| `npm run test:local` | Exit 0; 33 tests, 33 passed, 0 failed, 0 skipped |
| `npm run test-route` | Exit 0; 4 passed, 0 failed; these four are included in the 33, not additional unique tests |
| `tsc --project jsconfig.json --noEmit --incremental false` | Exit 2; six diagnostics: two filename-casing errors, two unresolved Deno URL imports, two missing Deno globals |
| App-scoped TypeScript check, excluding Supabase Deno functions | Exit 2; one TS1261 filename-casing diagnostic |
| Native Deno check | Not executed: Deno is unavailable and remote imports cannot be fetched within this task |
| `npm run build` with `NODE_ENV=production` | Exit 0; Next 15.4.6 compiled, generated 123/123 static pages, finalized optimization and collected build traces |
| `git diff --check` | Exit 0; line-ending conversion notices only |

The TypeScript casing conflict is between the tracked
`components/partners/fastFreightConfig.js` and lowercase imports at
`pages/dashboard/partner/fastfreight.js:6` and
`pages/dashboard/partner/[partner]/settings.js:11`. The production build also
warns about these differently cased modules. This remains unresolved for Stuart's
review and is a Linux portability issue. Root jsconfig includes the Deno function
`supabase/functions/calculate-quote/index.ts`, which Node TypeScript cannot check
with the existing configuration. The app-scoped check used an ignored temporary
configuration under `.cache/validation/`; no application compiler settings were
changed. JavaScript checkJs is not enabled. There are no configured standalone
lint or typecheck npm scripts; the build's lint/type banner does not establish a
separate lint pass or override the failed explicit compiler checks.

The first installed-dependency build failed prerendering `/confirmation` with
an Html/document error under a nonstandard NODE_ENV. A complete rerun explicitly
setting NODE_ENV=production passed. The final result above is that rerun, not an
inferred pass. `/dashboard/freight-desk` is included in the successful build.

All validation subprocesses used dummy credentials, disabled telemetry and a
network-blocking preload. No hosted service or registry request was made during
this verification. Generated `.next` output contains validation placeholders and
must not be deployed. The automated suite exercises local models and mocked API
handlers. Browser interaction, hosted authentication, real RLS, storage, message
sending and external freight operations remain unverified. Legacy manual scripts
that send email or print environment values were not run.

Earlier node syntax checks and the redacted secret scan remain recorded evidence:
25 reachable commits were scanned. Candidate locations in `SECRET-SCAN.json`
are not proof of secret remediation. Auth/profile deletion remains non-atomic.

## Dependency synchronization, security and deprecations

`package-lock.json` has no working-tree or staged change against HEAD. Comparing
all locked package entries found zero dependency-resolution changes. Manifest
dependency/devDependency declarations match HEAD and the lockfile root. Installed
package versions/integrities match the root lockfile. The user's synchronization
and clean install therefore leave no dependency upgrade or lock change to approve.
Only the previously added package.json test scripts remain modified.

No npm audit fix, dependency upgrade or source fix was performed in this final
validation. Offline npm audit exited 0 with an empty report because no fresh bulk
advisory response was available; this is **not a clean security audit**. Instead,
review used the locally cached advisories and the successful npm ci log. Detailed
package versions, affected ranges, advisory links, dependency paths and cache
timestamps are in [DEPENDENCY-SECURITY-REVIEW.json](DEPENDENCY-SECURITY-REVIEW.json).
No current online advisory verification was performed, as hosted access is forbidden.

The cached range review matched 213 original advisory/package pairs across 38
packages: 8 critical, 92 high, 95 moderate and 18 low. These are cached advisory
matches, not npm's aggregate vulnerability count and not 213 demonstrated
exploitable runtime paths. Of these, 172 matches across 27 packages have an
application-dependency path; 39 across ten packages occur only through the Vercel
CLI dependency; two high matches are development-only Browserslist via Autoprefixer.
PostCSS has shared application/build and development paths and is CSS build tooling.

Priority remediation before an internet-facing operational run:

- **Next 15.4.6:** cached critical advisories cover Windows hosting and AVIF image
  processing, as well as React Flight. Evaluate the Windows/image-optimizer
  exposure and select a tested supported security release outside the affected
  ranges. The repository uses Pages Router and React 18, with no App Router;
  the Flight/RSC-specific attack path was not found. That does not clear other
  Next advisories. No deployment environment was inspected.
- **Nodemailer 6.10.1:** active server email dependency in seven built API traces,
  with high/moderate address parsing, injection and file/URL-access advisories.
  Apply a targeted tested update and review untrusted email inputs before enabling
  message delivery. No email was sent during verification.
- **Axios 1.11.0:** transitive through xero-node but directly imported by application
  currency/export code. Its SSRF and other high/moderate advisories cannot be
  dismissed as development-only. Review request targets, apply a targeted update
  and explicitly declare this currently hoisted application dependency.

Other critical cached matches need scoped remediation, with reachability qualified:
NextAuth 4.24.11's email-provider normalization issue has no EmailProvider path
in the canonical Credentials-only configuration; jsPDF 3.0.1 and Swiper 12.0.2
have no application source imports or built page/API trace references found.
They remain installed production dependencies and should be removed if unused or
updated deliberately. The critical tar finding is confined to Vercel CLI paths;
Vercel is declared under dependencies, so npm labels it production even though its
role is tooling. No Vercel command was run. No active critical exploit was proven;
conditional Next runtime findings warrant the highest priority, not blanket dismissal.

There are 19 deprecated lockfile entries. Supabase auth-helpers, TomTom SDKs,
Bootstrap's Popper, older core-js/uuid, and ExcelJS/json2csv transitives affect
application dependency paths. ExcelJS's glob/fstream/inflight/rimraf/lodash.isequal
warnings are runtime transitives, not automatically development-only. The old
uuid warning concerns TomTom's nested uuid 3.3.3, not direct uuid 11.1.0. path-match
is CLI-only through Vercel. Deprecation alone does not establish an exploitable
vulnerability. Plan deliberate Supabase SSR/map SDK and export dependency cleanup;
no automatic migration or casual application upgrade was attempted.

## Final working tree and remaining review

Branch remains `stu-development`, HEAD `539b115`. There are 26 modified tracked
files, 17 untracked files and no staged changes. package-lock.json is unchanged.
The following is final git status --short (untracked directories collapsed):

```text
 M .gitignore
 M lib/authOptions.js
 M package.json
 M pages/api/add-user.js
 M pages/api/auth/[...nextauth].js
 M pages/api/bookings/index.js
 M pages/api/bookings/sign-off.js
 M pages/api/delete-user.js
 M pages/api/downloads/[filename].js
 M pages/api/employees/reset-password.js
 M pages/api/get-user-profile.js
 M pages/api/haulsync.js
 M pages/api/quote.js
 M pages/api/reset-user-password.js
 M pages/api/submit-booking.js
 M pages/api/test-supabase-login.js
 M pages/api/users.js
 M pages/dashboard/admin/super/haulsmart/[id].js
 M pages/dashboard/partner/[partner]/bookings.js
 M pages/dashboard/user/bookings/index.js
 M scripts/injectDummyFromMidex.js
 M scripts/injectManchesterDummy.js
 M scripts/syncMidnightToHaulsmart.js
 M utils/getMileageBetweenPostcodes.js
 M utils/getTomTomMileage.js
 M utils/resolveRoute.js
?? docs/
?? lib/freight/
?? lib/server/
?? pages/dashboard/freight-desk.js
?? scripts/freight.test.cjs
?? scripts/routing.test.cjs
?? scripts/scan-secrets.cjs
?? scripts/security.test.cjs
?? scripts/workspace.test.cjs
```

The final validation changed documentation only; helper/log files are ignored
under `.cache/validation/`. Existing application changes were preserved. No
commit, push, deployment, main modification, Vercel/Supabase operation, hosted
mutation, message send, freight publication or secret-value output occurred.

Dependency restoration and production compilation are complete. TypeScript casing,
Deno-specific verification, browser workflow verification, targeted security
remediation, remaining API/browser authorization, tenant/RLS/storage design and
historical credential remediation remain incomplete. The completion matrix above
continues to distinguish the local freight lifecycle from production operations.
No new restart-related loss was discovered. Stop here for Stuart's review.

Technical references checked read-only during this run:
[Supabase client configuration](https://supabase.com/docs/reference/javascript/initializing),
[Supabase session refresh](https://supabase.com/docs/reference/javascript/auth-refreshsession),
[TomTom coordinate contract](https://docs.tomtom.com/routing-api/documentation/tomtom-maps/v1/calculate-route).
The Supabase markdown changelog request failed in the browsing tool; no
changelog verification is claimed. No live Supabase or TomTom operation was run.

## TypeScript/configuration follow-up (2026-10-11)

This section supersedes the earlier failed TypeScript results and casing warning.
Canonical filename remains the existing tracked `components/partners/fastFreightConfig.js`.
The static import in `pages/dashboard/partner/fastfreight.js` and lazy import in
`pages/dashboard/partner/[partner]/settings.js` now match its exact case. Windows
had resolved lowercase imports to the same physical file; TypeScript detected
conflicting module names and webpack warned about duplicate casing. No file was
renamed or duplicated. The local variable named fastfreightConfig is an identifier,
not a file reference, and requires no change.

Root `jsconfig.json` now enforces consistent filename casing and excludes
node_modules, generated .next/.cache artifacts and the specific separate-runtime
`supabase/functions` directory. Application directories remain checked as before;
no checkJs/strict settings, any types or diagnostic suppression were added.

The two TS2307 diagnostics were Deno's HTTPS imports for serve and Supabase JS.
The two TS2304 diagnostics were Deno.env references. These are valid Deno runtime
constructs, not Node/Next globals or module imports. No Node/Next application imports
of the Edge Function were found. Their inclusion came from jsconfig's default
file discovery, not an application dependency. The file is therefore outside the
Node compilation boundary. `supabase/functions/deno.json` separately specifies
Deno's window library and a check task (`deno task check` from that directory).
The existing Edge Function source was preserved, including its earlier explicit
any annotation; none was added to silence errors. Native Deno verification remains
unexecuted because Deno is not installed. No Deno installation, remote module
fetch, hosted operation or function deployment was attempted. The existing
`supabase/config.toml` contains misplaced JSON compiler settings; it is not an
active TypeScript configuration and was preserved rather than repurposed as part
of this narrowly scoped Node/Next fix. Repairing Supabase CLI configuration is a
separate task before any future local Edge Function/CLI work.

Executed again with Node 22.23.3 / npm 10.9.9, dummy credentials, network disabled:

- Complete local suite: exit 0, 33 passed, 0 failed, 0 skipped.
- Routing suite: exit 0, 4 passed, 0 failed; included in the 33 above.
- App-scoped TypeScript: exit 0, zero diagnostics.
- Root TypeScript (`tsc --project jsconfig.json --noEmit --incremental false`):
  exit 0, zero diagnostics.

Task changes: jsconfig.json; the two FastFreight import sites;
supabase/functions/deno.json (new); this report. No dependency declarations or
lockfile changes. The task diff was reviewed: only module spelling and runtime
configuration changed; recovered application behavior and other uncommitted work
were preserved. No commit, push, deployment, hosted access, message or freight
publication occurred. Native Deno and browser interaction checks remain separate
verification limits; neither blocks a targeted Node/Next dependency security update.

Production build: exit 0, compiled successfully in 12.0s, generated 123/123 static pages, finalized optimization and build traces. The FastFreight casing warnings are absent. NODE_ENV=production; generated output still uses validation credentials and must not be deployed.

Final git diff --check: exit 0 (line-ending notices only). Final branch: stu-development; 29 modified tracked files, 18 untracked files, no staged changes. package-lock.json unchanged. Final status --short:

```text
 M .gitignore
 M jsconfig.json
 M lib/authOptions.js
 M package.json
 M pages/api/add-user.js
 M pages/api/auth/[...nextauth].js
 M pages/api/bookings/index.js
 M pages/api/bookings/sign-off.js
 M pages/api/delete-user.js
 M pages/api/downloads/[filename].js
 M pages/api/employees/reset-password.js
 M pages/api/get-user-profile.js
 M pages/api/haulsync.js
 M pages/api/quote.js
 M pages/api/reset-user-password.js
 M pages/api/submit-booking.js
 M pages/api/test-supabase-login.js
 M pages/api/users.js
 M pages/dashboard/admin/super/haulsmart/[id].js
 M pages/dashboard/partner/[partner]/bookings.js
 M pages/dashboard/partner/[partner]/settings.js
 M pages/dashboard/partner/fastfreight.js
 M pages/dashboard/user/bookings/index.js
 M scripts/injectDummyFromMidex.js
 M scripts/injectManchesterDummy.js
 M scripts/syncMidnightToHaulsmart.js
 M utils/getMileageBetweenPostcodes.js
 M utils/getTomTomMileage.js
 M utils/resolveRoute.js
?? docs/
?? lib/freight/
?? lib/server/
?? pages/dashboard/freight-desk.js
?? scripts/freight.test.cjs
?? scripts/routing.test.cjs
?? scripts/scan-secrets.cjs
?? scripts/security.test.cjs
?? scripts/workspace.test.cjs
?? supabase/functions/deno.json
```

## Targeted runtime security update (2026-10-11)

Next was updated locally through npm from installed/locked 15.4.6 to exact
15.5.27. Only Next, @next/env and matching platform SWC lock entries changed;
existing recovery scripts and application source were preserved. Initial
post-update validation passed 33 tests, both TypeScript checks and the complete
123-page production build. A final broad validation is recorded in the linked
stage report when its build completes.

Nodemailer and Axios were assessed independently but remain unchanged at
6.10.1 and 1.11.0 respectively. Candidate Nodemailer 10.0.6 is uncached and
conflicts with NextAuth 4.24.11's optional ^6.6.5 peer. Candidate Axios 1.20.0's
normal npm lock-only update failed on uncached follow-redirects metadata. No
partial Axios/Nodemailer install, forced peer override, broad refresh, audit fix
or business-logic workaround was performed. Registry-only access was requested
to clarify the no-hosted-services restriction; no registry request was made
while that clarification remained unanswered.

The original dependency review and secret scan are retained. See
[TARGETED-SECURITY-UPDATE.md](TARGETED-SECURITY-UPDATE.md),
[TARGETED-DEPENDENCY-SECURITY-REVIEW.json](TARGETED-DEPENDENCY-SECURITY-REVIEW.json)
and [TARGETED-SECRET-SCAN.json](TARGETED-SECRET-SCAN.json) for this stage's evidence.
Cached advisory matching reports no Next match, but 180 advisory/package matches
remain elsewhere; an empty offline audit is not a clean audit. Secret scanning
completed across 25 commits with the same 86 candidate locations and no values
printed. Supabase config.toml and Deno remain separate untouched infrastructure
work. No commit, push, deployment, external message, freight publication or
production operation occurred. This stage is partially remediated, not complete.
Final broad validation completed: 33/33 local tests, 4/4 routing tests (subset), root/app TypeScript both exit 0, production build exit 0 with 123/123 static pages (33.2s compile), diff check exit 0. Final branch stu-development; 30 modified tracked files, 21 untracked files, nothing staged. This stage remains BLOCKED for Nodemailer/Axios as detailed in TARGETED-SECURITY-UPDATE.md; the validated Next update is preserved.

## Registry-authorised Midnight continuation — final state

Stuart authorised npm registry downloads, metadata and audit. The remaining
blocker is execution capability, not approval: NextAuth metadata and Axios
follow-redirects fetches failed with EACCES, and fresh npm audit failed its registry
request. Cached NextAuth v4 peer evidence does not support Nodemailer 10 directly;
latest cached v4 supports ^7.0.7. No peer bypass or partial upgrade was made.
Next 15.5.27, Nodemailer 6.10.1 and Axios 1.11.0 remain installed/locked.

Reran full local verification: 33/33 local tests, 4/4 routing tests (subset), root
and app TypeScript both exit 0 with zero diagnostics, production build exit 0
with 123/123 static pages (14.8s compile), secret scan exit 0 across 25 commits
with the same 86 candidate locations, and diff check exit 0. Cached advisory
review remains 180 matches (139 application dependency paths, 39 CLI-only, two
dev-only), not demonstrated exploit counts. The fresh audit failed; no zero-
vulnerability claim is made. Detailed peer/network evidence and full status are
appended to TARGETED-SECURITY-UPDATE.md. User registry authorisation persists;
do not request it again. Need an execution environment permitting npm registry
traffic to finish the validated dependency update. No other repository or live
application service was accessed during this continuation; no commit/push/deploy.