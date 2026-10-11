> CURRENT RESULT: the fresh-registry completion section at the end of this document supersedes the historical blocker statements below. Nodemailer 10.0.9, Axios 1.20.0 and NextAuth 4.24.15 are installed and validated; Next remains exactly 15.5.27.

# Targeted runtime dependency security update — 2026-10-11

Repository: C:\Users\StuartDargue\midnight-development. Branch: stu-development.
Recovered HEAD: 539b115. Existing modified/untracked work was preserved.
Read RECOVERY-COMPLETION.md and DEPENDENCY-SECURITY-REVIEW.json before changes.
All npm operations used Node 22.23.3 / npm 10.9.9, offline mode, ignored lifecycle
scripts and disabled audit/funding during installs. Validation uses dummy
credentials, telemetry disabled and a network-blocking preload. No hosted
application service, external freight exchange or message delivery was contacted.

## Per-dependency assessment

| Dependency | Original declaration | Original installed/locked | Final declaration | Final installed/locked | Minimum candidate outside recorded affected ranges |
| --- | --- | --- | --- | --- | --- |
| Next | ^15.4.6 | 15.4.6 | 15.5.27 (exact) | 15.5.27 | 15.5.27 within major 15 |
| Nodemailer | ^6.10.1 | 6.10.1 | Unchanged | 6.10.1 | 10.0.6; incompatible with existing NextAuth peer range |
| Axios | Not declared; hoisted from xero-node (^1.6.5) | 1.11.0 | Still not declared; attempted update failed before writes | 1.11.0 | 1.20.0 within major 1 |

Candidate minima come from cached registry versions and cached advisory ranges,
not a current online security certification. There was no broad refresh, npm
audit fix, manual integrity edit or unrelated dependency upgrade.

### Next

Installed exact 15.5.27 through normal npm install, first lock-only then installed.
All 33 recorded Next advisory ranges no longer match the locked Next version.
Key findings include Windows server RCE (GHSA-p293-qw3h-jr36), AVIF optimizer RCE
(GHSA-2xp9-vwfh-vxw4), and SSG/ISR cache poisoning (GHSA-4jqv-mc3x-m676,
GHSA-mcj8-r9mp-w47p). The original review lists all individual advisory links.

Midnight has active Pages Router SSG freight pages, so SSG/cache findings are
relevant when served through an affected self-hosted server. Windows server
findings are conditional on running an exposed Windows server; AVIF/image
findings depend on optimizer input and deployment configuration. Lack of
next/image imports does not prove the framework optimizer unreachable. No
production environment or exploit was tested. App Router/Flight/Server Actions
paths were not found. beforeInteractive scripts use fixed URLs rather than
request-controlled script input. Middleware/rewrites/custom-server attack paths
were not found in application source.

Compatibility review: same Next major; candidate Node engine accepts Node 22,
React/ReactDOM peer ranges accept existing 18.3.1, and NextAuth's Next peer accepts
major 15. Pages Router is retained. No Next 16 migration or React upgrade.
The candidate broadens optional sharp compatibility, but the existing sharp
version remains locked. No candidate Next changelog was packaged; no upstream
release-note retrieval was performed under the offline boundary. Compatibility
was checked through the real application build and local tests, not assumed.
There were no required application/configuration changes or suppressed errors.

After the Next install: all 33 local tests passed, root and app-scoped TypeScript
both exited 0 without diagnostics, and production build exited 0, compiled in
65 seconds and generated all 123 static pages.

### Nodemailer

Fifteen original cached advisories still match 6.10.1. Relevant reachable code:
`pages/api/email/sendCustomerInvoice.js` accepts request-supplied `to` and calls
sendMail, making address-parser handling reachable. Other server email routes
use Nodemailer, including contact, notification and uploaded-attachment APIs.
Parser denial-of-service findings include GHSA-rcmh-qjqh-p98v,
GHSA-2x7j-588g-ccc2, GHSA-8vvx-rff5-p5rq and GHSA-v53p-9fqp-m79j.
Recipients supplied by callers also make address interpretation worth review.
No raw-message/jsonTransport/OAuth/custom envelope-size/name use was found, so
those specific paths are not claimed reachable. SMTP configuration and parser
reachability were inspected statically; no mail was sent or verified against SMTP.

10.0.6 is the smallest cached version outside all recorded Nodemailer ranges
and requires Node >=20, which Node 22 satisfies. However NextAuth 4.24.11 declares
an optional `nodemailer: ^6.6.5` peer. Updating the root package to 10 would violate
that declared compatibility. The credential-only auth configuration does not
activate its email-provider path, but that does not authorize ignoring npm's peer
contract or silently upgrading authentication. A future step must explicitly
resolve this compatibility boundary and review the major-version changelogs.
The candidate tarball is not locally cached, so its complete packaged breaking
changes cannot be reviewed here.

Non-mutating npm install dry-run for 10.0.6 warned about the NextAuth peer conflict
and exited 1 with ENOTCACHED while resolving Nodemailer. npm pack --offline for
10.0.6 independently exited 1 with ENOTCACHED for the exact tarball. No force or
legacy-peer flag was used. Nodemailer declaration, installed version and lock
entry are unchanged. This is a blocker, not a successful remediation.

### Axios

Thirty-two original cached advisories still match 1.11.0. Axios is used directly
by the currency API and browser export panels, while installed transitively from
xero-node. The currency URL is fixed HTTPS; export URLs are relative application
API URLs. Arbitrary user-supplied outbound Axios URLs, a prior prototype-pollution
source and attacker-controlled proxy options were not found. The library is
runtime-reachable, but that is not proof every listed exploit is reachable.
Vendor Xero request/redirect behavior and production proxy settings remain
unverified. Relevant findings include prototype-config/request-method/header
pollution (GHSA-3g43-6gmg-66jw, GHSA-35jp-ww65-95wh,
GHSA-vh66-26gq-q6x8, GHSA-9fr6-4gfg-395g, GHSA-j8rh-479h-cp32),
URL/SSRF, size-limit and form-deserialization findings detailed in the review.

1.20.0 is the minimum cached major-1 version outside all recorded affected ranges.
Its tarball is cached. Reviewed its packaged changelog for 1.12–1.19 changes,
including stricter protocol/URL validation, prototype-safe config reads,
redirect/proxy handling, enforced content/body limits, interceptor failure and
serialization changes. The packaged changelog stops at 1.19; complete 1.20
release notes were not fetched. Existing direct callers use URL strings rather
than URL objects and do not supply proxy/limit/FormData options. Those inspected
calls need no evident compatibility change, subject to actual installed testing.

Normal npm lock-only install of exact Axios 1.20.0 failed with ENOTCACHED retrieving
follow-redirects registry metadata. The candidate requires follow-redirects
^1.16.0, form-data ^4.0.6, proxy-from-env ^2.1.0 and https-proxy-agent ^5.0.1.
No lock/manifest changes were written by the failed command, and no partially
updated Axios installation is claimed. It remains an undeclared hoisted runtime
dependency until a complete, validated installation is possible.

## Lockfile and remaining findings

Manifest dependency change: only Next from ^15.4.6 to exact 15.5.27. Existing
test/secret-scan scripts are preserved from earlier recovery work. Lockfile
package-record changes: only Next, @next/env and eight matching @next/swc platform
packages, plus the root Next declaration. Installed npm operation changed three
packages on Windows (Next/env/Windows SWC). No unrelated locked version changed.
React, Nodemailer, Axios, NextAuth, sharp and all other application versions remain
unchanged. No integrity values were hand-edited.

New evidence is in TARGETED-DEPENDENCY-SECURITY-REVIEW.json; the original security
review is preserved. Cached advisory matches dropped from 213 to 180 across 37
packages: 5 critical, 79 high, 80 moderate, 16 low. These are advisory/range matches,
not npm's aggregate vulnerability count or demonstrated exploit counts.

- Runtime dependency paths: 139 matches, including unresolved Nodemailer/Axios,
  their other transitive packages and remaining sharp/map/export dependencies.
  PostCSS has shared application/build and development paths; CSS build tooling
  does not automatically imply a public runtime exploit.
- Development-only: two Browserslist advisory matches via Autoprefixer.
- CLI-only: 39 matches through Vercel; it remains in dependencies but has a tooling
  role. No Vercel operation or CLI change was made.
- Dormant/unreachable paths found: jsPDF/Swiper have no application imports or
  built trace references found; NextAuth uses CredentialsProvider rather than
  EmailProvider. Their four critical matches and the CLI tar critical match
  remain recorded, without unnecessary application/dependency changes.
- Unverified: fresh registry advisories, browser interaction, real production
  hosting/proxy settings, mail delivery, Xero integration and hosted RLS.

npm audit --offline --json exited 0 with an empty response. As previously, offline
mode has no fresh bulk advisory data; it is not evidence of zero vulnerabilities.
Registry-only access was requested to clarify the user's hosted-service boundary;
no registry request was made while that clarification remained unanswered.
Supabase config.toml repair and native Deno installation/verification remain
separate Edge Function/infrastructure work and were not touched.
## Final broad verification

Executed after all three dependency assessments using Node 22.23.3 / npm 10.9.9:

| Check | Exact result |
| --- | --- |
| Complete local suite | Exit 0; 33 tests, 33 passed, zero failed/skipped |
| Routing tests | Exit 0; four passed, zero failed; subset of the 33 above |
| Root TypeScript | Exit 0; zero diagnostics |
| App-scoped TypeScript | Exit 0; zero diagnostics |
| Final production build | Exit 0; Next 15.5.27 compiled in 33.2s; 123/123 static pages generated; optimization/traces complete |
| Offline npm audit | Exit 0; empty response, not a verified clean audit |
| Secret-pattern check | Exit 0; 25 commits, 86 candidate locations; no new locations versus original report; values suppressed |
| git diff --check | Exit 0; informational LF/CRLF notices only |
| Manifest/lock comparison | Exit 0; only intended Next-family records changed; installed target versions match lock |

An initial secret-scan attempt through the dummy-environment build runner failed
because its sanitization replaced GIT_CONFIG_KEY values. The scanner was rerun
directly with Node 22: it reads local files/history only and suppresses all matched
values. That execution passed; no scan failure was hidden or counted as a pass.
No native Deno check, browser test, live SMTP test or application-service request
was performed. The build contains validation placeholders and must not be deployed.

Reviewable files changed in this stage: package.json, package-lock.json,
docs/RECOVERY-COMPLETION.md, docs/TARGETED-SECURITY-UPDATE.md (new),
docs/TARGETED-DEPENDENCY-SECURITY-REVIEW.json (new),
docs/TARGETED-SECRET-SCAN.json (new). Ignored .cache/validation files contain local
inspection scripts, cached package metadata/tarball and redacted validation logs.
Application/business logic, existing auth fixes, local freight adapters and all
other recovered source changes were preserved. No commit or staged change.
Final branch stu-development; 30 modified tracked files; 21 untracked files; nothing staged. Final git status --short:

```text
 M .gitignore
 M jsconfig.json
 M lib/authOptions.js
 M package-lock.json
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

TARGETED SECURITY UPDATE BLOCKED — Nodemailer 10.0.6 is uncached and incompatible with the existing NextAuth optional peer range; Axios 1.20.0 cannot resolve uncached follow-redirects metadata offline. Registry-only access remains unconfirmed under the hosted-service restriction.

## Registry-authorised continuation — 2026-10-11

Stuart explicitly authorised npm registry downloads, metadata retrieval and npm
audit for Midnight. This supersedes the earlier unconfirmed-registry boundary;
no further registry permission question is needed. Work was restricted to
C:\Users\StuartDargue\midnight-development on stu-development. No other Stuart
repository was accessed during this continuation.

The authorised network attempts used Node 22.23.3 / npm 10.9.9, the explicit
https://registry.npmjs.org registry, zero retries and 15-second fetch timeouts:

- npm view next-auth@latest version peerDependencies --json: exit 1, EACCES in
  the network client while requesting registry.npmjs.org/next-auth.
- npm install axios@1.20.0 --save-exact --package-lock-only --dry-run,
  with scripts/audit/funding disabled: exit 1, EACCES fetching follow-redirects
  metadata required by Axios. Dry-run made no manifest/lock/installed changes.
- npm audit --json --ignore-scripts: exit 1, audit endpoint returned an error;
  the quick-audit registry request failed. This is a failed fresh audit, not an
  empty offline report and not evidence of zero vulnerabilities.

The failure is an execution-environment network restriction, not missing Stuart
authorisation. No --force, --legacy-peer-deps, blanket overrides, audit fix or
partial dependency update was attempted. npm's suggestion to use Administrator
was not followed; privileged execution is unavailable under the active policy.

Cached peer metadata was inspected without treating it as a current registry
response. Its latest stable NextAuth v4 is 4.24.15 with optional Nodemailer
^7.0.7; no cached stable v4 accepts Nodemailer 10.0.6. Therefore simply upgrading
NextAuth to that patch cannot safely accommodate the required patched mailer.
A safe continuation can separate the application's patched SMTP package from
the optional, unused NextAuth EmailProvider dependency, or use a separately
verified supported auth peer combination. That must be implemented and tested
with the actual patched package; no unsupported dependency graph or provisional
source-import change was left in the working tree. Existing CredentialsProvider,
role/session checks and business logic are preserved.

Final installed/locked/declarations remain: Next 15.5.27 exact; Nodemailer 6.10.1
under ^6.10.1; Axios 1.11.0 hoisted from xero-node and not yet directly declared.
The manifest/lock assertion reran successfully: only the earlier Next declaration
and ten Next-family package records differ from HEAD; no additional dependency
resolution changed during this continuation.

Cached review was rerun successfully against the current lockfile and recorded
under .cache/validation/registry-stage-security-review.json. It still finds 180
advisory/package matches across 37 packages: 5 critical, 79 high, 80 moderate,
16 low. These are cached range matches, not exposed-vulnerability totals.
Application dependency paths account for 139 matches (including unused/build
paths), CLI-only Vercel paths 39, and dev-only Browserslist paths two. Active
Nodemailer/Axios findings remain unresolved. The four critical jsPDF/Swiper/
NextAuth-email matches concern paths not found active; the remaining critical
match is Vercel CLI tar. Existing map/export/image and build-tool transitive
findings remain; the previous detailed package/path report is preserved. Fresh
advisory status and production exploitability remain unverified. No unused or
CLI package was unnecessarily changed.
Final registry-authorised continuation validation (Node 22.23.3 / npm 10.9.9):

- Complete local suite: exit 0; 33 passed, zero failed/skipped.
- Routing suite: exit 0; four passed, zero failed; subset of those 33.
- Root TypeScript: exit 0; zero diagnostics.
- App-scoped TypeScript: exit 0; zero diagnostics.
- Production build: exit 0; compiled in 14.8s; generated 123/123 static pages;
  optimization and build traces completed using validation credentials/network guard.
- Cached advisory reclassification: exit 0; 180 matches, classified above.
- Secret scan: exit 0; 25 commits, same 86 candidate locations, values suppressed.
- Manifest/lock assertion: exit 0; installed versions match lock; no new resolution.
- git diff --check: exit 0; informational line-ending notices only.
- Fresh npm audit: exit 1; registry audit request failed. No clean audit claimed.

No source, package manifest, lockfile or installed dependency changed in this
continuation. Existing Next 15.5.27 and all recovered changes remain intact.
Only recovery/security report sections were appended; the generated targeted
secret report was refreshed with unchanged candidate counts. New ignored cache
helpers/logs preserve registry failure and peer-metadata evidence. The earlier
Next manifest/lock update remains reviewable, not committed. No Silver Lady file,
Supabase configuration, hosted application service, email or freight was touched.
No force, legacy-peer mode, blanket overrides, commit, push or deployment.
Final branch stu-development; 30 modified tracked files; 21 untracked files; no staged changes. Status --short:

```text
 M .gitignore
 M jsconfig.json
 M lib/authOptions.js
 M package-lock.json
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

MIDNIGHT SECURITY UPDATE BLOCKED — the execution environment denies authorised npm registry fetches with EACCES and the fresh audit request fails; patched Nodemailer/Axios installation and peer compatibility verification cannot complete.


## Fresh-registry completion — 2026-10-11 (current result)

Registry access works. The old EACCES/offline blockers above no longer apply.
This stage used npm registry metadata, package downloads and audit requests only.
No Vercel command, hosted database, application API, email provider, customer,
freight or payment system was contacted. No mail was sent; test data was dummy.
No Supabase/Deno file was changed. Nothing was staged, committed, pushed or deployed.

### Installed versions and scope

| Package | Session-start installed / declaration | Final installed / declaration |
| --- | --- | --- |
| Next | 15.5.27 / exact 15.5.27 | 15.5.27 / exact 15.5.27, unchanged |
| Nodemailer | 6.10.1 / ^6.10.1 under nodemailer | 10.0.9 / npm:nodemailer@10.0.9 under midnight-nodemailer |
| NextAuth | 4.24.11 / ^4.24.11 | 4.24.15 / exact 4.24.15 |
| Axios | 1.11.0 / undeclared, hoisted through xero-node | 1.20.0 / exact direct dependency; xero-node deduplicates to it |
| follow-redirects | 1.15.11 | 1.16.1, satisfying Axios ^1.16.0 |
| form-data | 4.0.4 | 4.0.6, satisfying Axios ^4.0.6 |
| proxy-from-env | 1.1.0 | 2.1.0, satisfying Axios ^2.1.0 |
| hasown | 2.0.2 | 2.0.4, required by form-data ^2.0.4 |
| uuid (root) | 11.1.0 | 11.1.1, required by NextAuth ^11.1.1 |
| jsPDF | 3.0.1 / ^3.0.1 | Removed, unused |
| jsPDF AutoTable | 5.0.2 / ^5.0.2 | Removed, unused companion |
| Swiper | 12.0.2 / ^12.0.2 | Removed, unused |

No other previously locked package version changed. Next's complete lock record
was compared with the session-start snapshot and is identical. Existing manifest
scripts and devDependencies are unchanged. npm added 42 package records and
removed 24; the machine report lists every record. Additions include the
mailer alias, Axios's nested https-proxy-agent 5.0.1 / agent-base 6.0.2 and npm's
normalization of previously missing optional platform records for existing sharp
and Argon2 versions. Those platform records and their WASM support metadata are
lockfile changes, not a sharp/Argon2 upgrade. npm downloaded integrity-bearing
metadata; no integrity was manually edited. Installed Windows changes were
three additions, 24 removals and seven updates, then one mailer candidate update.

### Nodemailer / NextAuth compatibility conclusion

Registry metadata confirms stable NextAuth 4.24.15 has an optional nodemailer
peer of ^7.0.7. Installed 4.24.11 used ^6.6.5. Neither accepts Nodemailer 10.
The published Nodemailer 6 series ends at 6.10.1; the 7 series cannot fix all
current advisories. No compatible fully patched named peer combination exists
within stable NextAuth v4. An initial dry-run retaining the old named dependency
correctly failed ERESOLVE; it was not forced through.

The canonical lib/server/authConfig.js configures only CredentialsProvider,
JWT sessions and local credentials callbacks. Repository-wide searches found
no EmailProvider import or email provider configuration. NextAuth's installed
EmailProvider is the module that requires the named nodemailer package; it is
not imported by this app. The clean separation uses npm's supported package
alias midnight-nodemailer for application SMTP, and removes the named root
nodemailer dependency entirely. This leaves the optional peer absent, which
npm accepts normally. It does not claim that NextAuth supports mailer 10, and
does not change or patch NextAuth's peer declaration. No force, legacy-peer,
overrides, omit-peer flag, nested vulnerable mailer or suppressed check is used.
Normal npm installation and npm ls --all both succeeded; the lock and installed
tree contain only midnight-nodemailer, with no named nodemailer package.
Enabling NextAuth EmailProvider later would require a fresh supported dependency
design; this completion supports the current credentials-only configuration.

All eleven application/script mailer imports now use the alias; mail options and
business logic are unchanged. NextAuth was patched to 4.24.15 to address its own
four audit advisories, including malformed Bearer parsing, and not to fabricate
mailer compatibility. Its required uuid floor explains the 11.1.1 patch.

The first candidate, 10.0.6, fixed all 15 advisories matching 6.10.1. A fresh
candidate audit then identified GHSA-g57g-f23g-4646, introduced in >=9.1.0 and
fixed at 10.0.9. Therefore 10.0.9 is the minimum release outside the combined
current affected ranges. It also includes the 10.0.7/8 MIME boundary fixes.
The final fresh audit reports no Nodemailer finding under its underlying name,
so the alias is not concealing audit metadata.

Packaged changelogs were reviewed across 7–10: SES API changes, NoAuth becoming
ENOAUTH, stricter TLS validation for fetched HTTPS content, and Node >=20 with
ESM/CJS builds. No SES transport, NoAuth-specific handler or OAuth mail transport
was found. Existing SMTP configuration remains intact; stricter external-content
TLS checks are intentional. Node 22 satisfies the engine. Both ESM and CJS imports,
SMTP transport construction, HTML/text composition and a buffered PDF attachment
passed local compatibility checks without invoking delivery or an SMTP connection.
Real mail delivery and production certificate/configuration behavior remain untested.

### Axios conclusion

GHSA-4hjh-wcwx-xvwj (unbounded data-URL size) first patches at 1.12.0, but that is
insufficient for the other 31 current advisories matching 1.11.0. The latest
required floor is 1.20.0, established by GHSA-vh66-26gq-q6x8,
GHSA-9fr6-4gfg-395g and GHSA-j8rh-479h-cp32, all affected below 1.20.0.
Thus 1.20.0 is selected from advisory ranges, not merely because it is latest.
The final registry audit has no Axios or follow-redirects finding.
GHSA-r4q5-vmmm-2653 affects follow-redirects <=1.15.11; 1.16.0 is the first
published patch and Axios requires ^1.16.0. npm selected compatible 1.16.1.
form-data 4.0.6 also clears GHSA-hmw2-7cc7-3qxx.

Direct usage remains pages/api/currency.js (fixed HTTPS URL),
components/SuperAdmin/ExportControlPanel.js and the super-admin exports page
(relative same-origin URLs). No caller-supplied remote URL, proxy options,
FormData conversion or custom stream-limit options were found in those callers.
xero-node 11.2.0 accepts Axios ^1.6.5 and resolves to the same 1.20.0 installation.
The packaged Axios changelog ends at 1.19.0; 1.20 release notes were not retrieved
from GitHub under the registry-only boundary. Reviewed packaged changes include
prototype-safe config merging, stricter URL/protocol handling, redirect/proxy
credential stripping, size limits and serialization changes. The inspected GET
calls require no source changes. Mocked adapter checks passed for both URL forms
and JSON responses. Vendor Xero/live proxy behavior was not tested.

### Cleanup evidence

Searches of source, scripts and configuration found no jsPDF, AutoTable or Swiper
imports or usage; their only nonhistorical declarations were dependency manifests.
The previous build trace review also found no usage. They were removed through
normal dependency resolution, along with orphaned PDF helpers. PDF features using
pdf-lib, PDFKit and ExcelJS remain. Final successful build traces have no jsPDF,
Swiper or named nodemailer references. No NextAuth EmailProvider source in the
vendor package was deleted or rewritten: its application path is unconfigured,
and its optional mailer dependency is now absent.

### Exact resolved audit advisories

The fresh baseline was 65 affected-package entries (4 critical, 42 high,
17 moderate, 2 low). The final full audit is 56 (1 critical, 39 high,
14 moderate, 2 low). Production-only audit is 55 (1 critical, 38 high,
14 moderate, 2 low). npm audit exits 1 because findings remain, with a valid
registry response; this is not a failed network request or a clean audit.
These totals include propagated dependency findings and are not exploit counts.

The following advisory IDs disappeared from the full audit. Removed-package
entries reflect dependency removal, rather than a claim that old versions were
patched. The JSON report preserves exact titles, ranges, URLs and source IDs:

- **axios** (32): [GHSA-4hjh-wcwx-xvwj](https://github.com/advisories/GHSA-4hjh-wcwx-xvwj), [GHSA-3p68-rc4w-qgx5](https://github.com/advisories/GHSA-3p68-rc4w-qgx5), [GHSA-w9j2-pvgh-6h63](https://github.com/advisories/GHSA-w9j2-pvgh-6h63), [GHSA-pmwg-cvhr-8vh7](https://github.com/advisories/GHSA-pmwg-cvhr-8vh7), [GHSA-3w6x-2g7m-8v23](https://github.com/advisories/GHSA-3w6x-2g7m-8v23), [GHSA-xhjh-pmcv-23jw](https://github.com/advisories/GHSA-xhjh-pmcv-23jw), [GHSA-445q-vr5w-6q77](https://github.com/advisories/GHSA-445q-vr5w-6q77), [GHSA-m7pr-hjqh-92cm](https://github.com/advisories/GHSA-m7pr-hjqh-92cm), [GHSA-5c9x-8gcm-mpgx](https://github.com/advisories/GHSA-5c9x-8gcm-mpgx), [GHSA-vf2m-468p-8v99](https://github.com/advisories/GHSA-vf2m-468p-8v99), [GHSA-pf86-5x62-jrwf](https://github.com/advisories/GHSA-pf86-5x62-jrwf), [GHSA-6chq-wfr3-2hj9](https://github.com/advisories/GHSA-6chq-wfr3-2hj9), [GHSA-xx6v-rp6x-q39c](https://github.com/advisories/GHSA-xx6v-rp6x-q39c), [GHSA-43fc-jf86-j433](https://github.com/advisories/GHSA-43fc-jf86-j433), [GHSA-q8qp-cvcw-x6jj](https://github.com/advisories/GHSA-q8qp-cvcw-x6jj), [GHSA-fvcv-3m26-pcqx](https://github.com/advisories/GHSA-fvcv-3m26-pcqx), [GHSA-62hf-57xw-28j9](https://github.com/advisories/GHSA-62hf-57xw-28j9), [GHSA-hfxv-24rg-xrqf](https://github.com/advisories/GHSA-hfxv-24rg-xrqf), [GHSA-777c-7fjr-54vf](https://github.com/advisories/GHSA-777c-7fjr-54vf), [GHSA-p92q-9vqr-4j8v](https://github.com/advisories/GHSA-p92q-9vqr-4j8v), [GHSA-j5f8-grm9-p9fc](https://github.com/advisories/GHSA-j5f8-grm9-p9fc), [GHSA-3g43-6gmg-66jw](https://github.com/advisories/GHSA-3g43-6gmg-66jw), [GHSA-35jp-ww65-95wh](https://github.com/advisories/GHSA-35jp-ww65-95wh), [GHSA-898c-q2cr-xwhg](https://github.com/advisories/GHSA-898c-q2cr-xwhg), [GHSA-mmx7-hfxf-jppx](https://github.com/advisories/GHSA-mmx7-hfxf-jppx), [GHSA-pmv8-rq9r-6j72](https://github.com/advisories/GHSA-pmv8-rq9r-6j72), [GHSA-7q8q-rj6j-mhjq](https://github.com/advisories/GHSA-7q8q-rj6j-mhjq), [GHSA-jqh4-m9w3-8hp9](https://github.com/advisories/GHSA-jqh4-m9w3-8hp9), [GHSA-42h9-826w-cgv3](https://github.com/advisories/GHSA-42h9-826w-cgv3), [GHSA-vh66-26gq-q6x8](https://github.com/advisories/GHSA-vh66-26gq-q6x8), [GHSA-9fr6-4gfg-395g](https://github.com/advisories/GHSA-9fr6-4gfg-395g), [GHSA-j8rh-479h-cp32](https://github.com/advisories/GHSA-j8rh-479h-cp32).
- **dompurify** (20): [GHSA-v8jm-5vwx-cfxm](https://github.com/advisories/GHSA-v8jm-5vwx-cfxm), [GHSA-v2wj-7wpq-c8vv](https://github.com/advisories/GHSA-v2wj-7wpq-c8vv), [GHSA-h7mw-gpvr-xq4m](https://github.com/advisories/GHSA-h7mw-gpvr-xq4m), [GHSA-crv5-9vww-q3g8](https://github.com/advisories/GHSA-crv5-9vww-q3g8), [GHSA-v9jr-rg53-9pgp](https://github.com/advisories/GHSA-v9jr-rg53-9pgp), [GHSA-hpcv-96wg-7vj8](https://github.com/advisories/GHSA-hpcv-96wg-7vj8), [GHSA-r47g-fvhr-h676](https://github.com/advisories/GHSA-r47g-fvhr-h676), [GHSA-rp9w-3fw7-7cwq](https://github.com/advisories/GHSA-rp9w-3fw7-7cwq), [GHSA-cmwh-pvxp-8882](https://github.com/advisories/GHSA-cmwh-pvxp-8882), [GHSA-vxr8-fq34-vvx9](https://github.com/advisories/GHSA-vxr8-fq34-vvx9), [GHSA-gvmj-g25r-r7wr](https://github.com/advisories/GHSA-gvmj-g25r-r7wr), [GHSA-x4vx-rjvf-j5p4](https://github.com/advisories/GHSA-x4vx-rjvf-j5p4), [GHSA-76mc-f452-cxcm](https://github.com/advisories/GHSA-76mc-f452-cxcm), [GHSA-39q2-94rc-95cp](https://github.com/advisories/GHSA-39q2-94rc-95cp), [GHSA-cjmm-f4jc-qw8r](https://github.com/advisories/GHSA-cjmm-f4jc-qw8r), [GHSA-cj63-jhhr-wcxv](https://github.com/advisories/GHSA-cj63-jhhr-wcxv), [GHSA-h8r8-wccr-v5f2](https://github.com/advisories/GHSA-h8r8-wccr-v5f2), [GHSA-55q2-fjhq-7xh7](https://github.com/advisories/GHSA-55q2-fjhq-7xh7), [GHSA-c2j3-45gr-mqc4](https://github.com/advisories/GHSA-c2j3-45gr-mqc4), [GHSA-6688-9rhm-gjv2](https://github.com/advisories/GHSA-6688-9rhm-gjv2).
- **fflate** (1): [GHSA-px8p-9vwx-vf98](https://github.com/advisories/GHSA-px8p-9vwx-vf98).
- **follow-redirects** (1): [GHSA-r4q5-vmmm-2653](https://github.com/advisories/GHSA-r4q5-vmmm-2653).
- **form-data** (1): [GHSA-hmw2-7cc7-3qxx](https://github.com/advisories/GHSA-hmw2-7cc7-3qxx).
- **jspdf** (11): [GHSA-8mvj-3j78-4qmw](https://github.com/advisories/GHSA-8mvj-3j78-4qmw), [GHSA-f8cm-6447-x5h2](https://github.com/advisories/GHSA-f8cm-6447-x5h2), [GHSA-pqxr-3g65-p328](https://github.com/advisories/GHSA-pqxr-3g65-p328), [GHSA-95fx-jjr5-f39c](https://github.com/advisories/GHSA-95fx-jjr5-f39c), [GHSA-vm32-vv63-w422](https://github.com/advisories/GHSA-vm32-vv63-w422), [GHSA-cjw8-79x6-5cj4](https://github.com/advisories/GHSA-cjw8-79x6-5cj4), [GHSA-9vjf-qc39-jprp](https://github.com/advisories/GHSA-9vjf-qc39-jprp), [GHSA-67pg-wm7f-q7fj](https://github.com/advisories/GHSA-67pg-wm7f-q7fj), [GHSA-p5xg-68wr-hm3m](https://github.com/advisories/GHSA-p5xg-68wr-hm3m), [GHSA-7x6v-j9x4-qf24](https://github.com/advisories/GHSA-7x6v-j9x4-qf24), [GHSA-wfv2-pwc8-crg5](https://github.com/advisories/GHSA-wfv2-pwc8-crg5).
- **next-auth** (4): [GHSA-5jpx-9hw9-2fx4](https://github.com/advisories/GHSA-5jpx-9hw9-2fx4), [GHSA-7rqj-j65f-68wh](https://github.com/advisories/GHSA-7rqj-j65f-68wh), [GHSA-xmf8-cvqr-rfgj](https://github.com/advisories/GHSA-xmf8-cvqr-rfgj), [GHSA-x445-f3h2-j279](https://github.com/advisories/GHSA-x445-f3h2-j279).
- **nodemailer** (15): [GHSA-mm7p-fcc7-pg87](https://github.com/advisories/GHSA-mm7p-fcc7-pg87), [GHSA-c7w3-x93f-qmm8](https://github.com/advisories/GHSA-c7w3-x93f-qmm8), [GHSA-vvjj-xcjg-gr5g](https://github.com/advisories/GHSA-vvjj-xcjg-gr5g), [GHSA-268h-hp4c-crq3](https://github.com/advisories/GHSA-268h-hp4c-crq3), [GHSA-wqvq-jvpq-h66f](https://github.com/advisories/GHSA-wqvq-jvpq-h66f), [GHSA-rcmh-qjqh-p98v](https://github.com/advisories/GHSA-rcmh-qjqh-p98v), [GHSA-p6gq-j5cr-w38f](https://github.com/advisories/GHSA-p6gq-j5cr-w38f), [GHSA-8m3c-c648-2xjj](https://github.com/advisories/GHSA-8m3c-c648-2xjj), [GHSA-wmmp-3585-3rmp](https://github.com/advisories/GHSA-wmmp-3585-3rmp), [GHSA-2x7j-588g-ccc2](https://github.com/advisories/GHSA-2x7j-588g-ccc2), [GHSA-cc9r-2j5m-2m83](https://github.com/advisories/GHSA-cc9r-2j5m-2m83), [GHSA-6vj9-mwq6-2f5v](https://github.com/advisories/GHSA-6vj9-mwq6-2f5v), [GHSA-8vvx-rff5-p5rq](https://github.com/advisories/GHSA-8vvx-rff5-p5rq), [GHSA-v53p-9fqp-m79j](https://github.com/advisories/GHSA-v53p-9fqp-m79j), [GHSA-r7g4-qg5f-qqm2](https://github.com/advisories/GHSA-r7g4-qg5f-qqm2).
- **swiper** (1): [GHSA-hmx5-qpq5-p643](https://github.com/advisories/GHSA-hmx5-qpq5-p643).

Additionally avoided while evaluating the mailer upgrade:
[GHSA-g57g-f23g-4646](https://github.com/advisories/GHSA-g57g-f23g-4646).
Other copies of legacy uuid remain in TomTom/ExcelJS and are still reported.

### Remaining findings and relevance

Detailed evidence is in [FRESH-DEPENDENCY-SECURITY-REVIEW.json](FRESH-DEPENDENCY-SECURITY-REVIEW.json):
every remaining package, installed node/version, direct/transitive relationship,
root dependency origins, actual source references, advisory title/range/URL,
inherited findings and npm remediation recommendation.
There are 27 CLI-only entries (Vercel remains declared in dependencies), 21 other
production entries, three shared application/CLI entries, four CSS/build entries
and one development-only entry. The production-only audit still counts CLI and
build packages declared in dependencies; declaration does not prove runtime exposure.
The sole critical entry is tar on Vercel CLI paths. No CLI operation was run.

Next's moderate finding is inherited from bundled PostCSS 8.4.31; no direct Next
advisory remains in this response. Root PostCSS is 8.5.6. Patched PostCSS 8.5.23
exists, but upgrading the root does not fix Next's nested copy. npm recommends
Next 16.4.0, which is a breaking migration and is not required for this task.
Next remains exactly 15.5.27; no override of its bundled dependency was applied.
Compatible candidates preact 10.27.3 and ws 8.21.0 were verified in registry
metadata for later focused changes. sharp 0.35.5 is the advisory floor but changes
a native 0.x minor. These were classified, not installed outside the agreed scope.
TomTom/ExcelJS fixes proposed by npm include downgrades; Vercel and cookie-consent
proposals include major upgrades. Packages with no npm-reported remediation need
replacement/removal review. Broad audit fix was not used.

| Package | Severity / relationship | Dependency paths | Advisory IDs | Relevance and remediation |
| --- | --- | --- | --- | --- |
| @fastify/busboy | high; transitive | CLI only (declared production); roots: vercel | GHSA-x8mw-p69m-v3mx, GHSA-gxm5-99cw-xjw9 | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @tomtom-international/web-sdk-maps | moderate; direct | production dependency; roots: @tomtom-international/web-sdk-maps, @tomtom-international/web-sdk-plugin-searchbox | Inherited from lodash, uuid | Application imports found through @tomtom-international/web-sdk-maps; exploit prerequisites and deployed configuration remain unverified. @tomtom-international/web-sdk-maps@5.43.3; breaking change or downgrade proposed by npm; do not apply automatically. |
| @tomtom-international/web-sdk-plugin-searchbox | moderate; direct | production dependency; roots: @tomtom-international/web-sdk-plugin-searchbox | Inherited from @tomtom-international/web-sdk-maps, @tomtom-international/web-sdk-services | No direct application import found for root packages; retained pending a separate functionality review. Public exploit reachability unproven. @tomtom-international/web-sdk-plugin-searchbox@2.24.3; breaking change or downgrade proposed by npm; do not apply automatically. |
| @tomtom-international/web-sdk-services | moderate; direct | production dependency; roots: @tomtom-international/web-sdk-plugin-searchbox, @tomtom-international/web-sdk-services | Inherited from uuid | No direct application import found for root packages; retained pending a separate functionality review. Public exploit reachability unproven. @tomtom-international/web-sdk-services@6.7.0; breaking change or downgrade proposed by npm; do not apply automatically. |
| @tootallnate/once | low; transitive | CLI only (declared production); roots: vercel | GHSA-vpq2-c234-7xj6 | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @ts-morph/common | high; transitive | CLI only (declared production); roots: vercel | Inherited from fast-glob | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/blob | moderate; transitive | CLI only (declared production); roots: vercel | Inherited from undici | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/express | high; transitive | CLI only (declared production); roots: vercel | Inherited from @vercel/node, @vercel/static-config, ts-morph | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/fun | high; transitive | CLI only (declared production); roots: vercel | Inherited from @tootallnate/once, tar | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/gatsby-plugin-vercel-builder | moderate; transitive | CLI only (declared production); roots: vercel | Inherited from esbuild | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/h3 | moderate; transitive | CLI only (declared production); roots: vercel | Inherited from @vercel/node, @vercel/static-config | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/hono | high; transitive | CLI only (declared production); roots: vercel | Inherited from @vercel/node, @vercel/static-config, ts-morph | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/hydrogen | high; transitive | CLI only (declared production); roots: vercel | Inherited from @vercel/static-config, ts-morph | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/node | high; transitive | CLI only (declared production); roots: vercel | Inherited from @vercel/static-config, esbuild, path-to-regexp, ts-morph, undici | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/redwood | high; transitive | CLI only (declared production); roots: vercel | Inherited from @vercel/static-config, ts-morph | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/remix-builder | high; transitive | CLI only (declared production); roots: vercel | Inherited from @vercel/static-config, path-to-regexp, ts-morph | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/static-build | high; transitive | CLI only (declared production); roots: vercel | Inherited from @vercel/gatsby-plugin-vercel-builder, @vercel/static-config, ts-morph | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| @vercel/static-config | high; transitive | CLI only (declared production); roots: vercel | Inherited from ajv, ts-morph | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| ajv | moderate; transitive | CLI only (declared production); roots: vercel | GHSA-2g4f-4pwh-qvx6 | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| brace-expansion | high; transitive | application/build and CLI paths; roots: archiver, exceljs, vercel | GHSA-f886-m6hf-6m8v, GHSA-f886-m6hf-6m8v, GHSA-3jxr-9vmj-r5cp, GHSA-3jxr-9vmj-r5cp, GHSA-mh99-v99m-4gvg, GHSA-mh99-v99m-4gvg, GHSA-rgw5-rvv9-x895, GHSA-rgw5-rvv9-x895, GHSA-q2hr-2g5m-vwhr, GHSA-q2hr-2g5m-vwhr, GHSA-qhr7-859c-m2p7, GHSA-qhr7-859c-m2p7, GHSA-6j4f-fj2g-mc7p, GHSA-6j4f-fj2g-mc7p | Export/archive dependencies plus CLI paths. Application ZIP helper appends buffers and does not call glob/directory; adversarial pattern reachability not established. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| braces | high; transitive | CLI only (declared production); roots: vercel | GHSA-vfj7-8cjw-p6xm | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| browserslist | high; transitive | development only; roots: autoprefixer | GHSA-c83g-rgw3-j3cx, GHSA-73wf-gq98-2v4g | CSS/build tooling; no public request path established. Next includes a separate bundled PostCSS version. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| diff | low; transitive | CLI only (declared production); roots: vercel | GHSA-73rr-hh4g-fpgx | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| esbuild | moderate; transitive | CLI only (declared production); roots: vercel | GHSA-67mh-4wv8-2f99 | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| exceljs | moderate; direct | production dependency; roots: exceljs | Inherited from uuid | Application imports found through exceljs; exploit prerequisites and deployed configuration remain unverified. exceljs@3.4.0; breaking change or downgrade proposed by npm; do not apply automatically. |
| fast-glob | high; transitive | CLI only (declared production); roots: vercel | Inherited from micromatch | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| fbjs | high; transitive | production dependency; roots: react-stepper-horizontal | Inherited from isomorphic-fetch | No direct application import found for root packages; retained pending a separate functionality review. Public exploit reachability unproven. No npm-reported fix; replace or remove the owning dependency after functionality review. |
| glob | high; transitive | application/build and CLI paths; roots: archiver, vercel | GHSA-5j98-mcp5-4vw2 | Export/archive dependencies plus CLI paths. Application ZIP helper appends buffers and does not call glob/directory; adversarial pattern reachability not established. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| i18next-http-backend | moderate; direct | production dependency; roots: i18next-http-backend | GHSA-q89c-q3h5-w34g, GHSA-xvq9-wjp8-hwqf | No direct application import found for root packages; retained pending a separate functionality review. Public exploit reachability unproven. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| isomorphic-fetch | high; transitive | production dependency; roots: react-stepper-horizontal | Inherited from node-fetch | No direct application import found for root packages; retained pending a separate functionality review. Public exploit reachability unproven. No npm-reported fix; replace or remove the owning dependency after functionality review. |
| js-cookie | high; transitive | production dependency; roots: react-cookie-consent | GHSA-qjx8-664m-686j | No direct application import found for root packages; retained pending a separate functionality review. Public exploit reachability unproven. react-cookie-consent@10.0.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| lodash | high; transitive | production dependency; roots: @tomtom-international/web-sdk-maps, @tomtom-international/web-sdk-plugin-searchbox, archiver | GHSA-r5fr-rjxr-66jc, GHSA-f23m-r3pf-42rh, GHSA-xxjr-mmjv-4gpg | Application imports found through @tomtom-international/web-sdk-maps, archiver; exploit prerequisites and deployed configuration remain unverified. @tomtom-international/web-sdk-maps@5.43.3; breaking change or downgrade proposed by npm; do not apply automatically. |
| micromatch | high; transitive | CLI only (declared production); roots: vercel | Inherited from braces | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| minimatch | high; transitive | application/build and CLI paths; roots: archiver, exceljs, vercel | GHSA-3ppc-4f35-3m26, GHSA-3ppc-4f35-3m26, GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-7r86-cg39-jmmj, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74, GHSA-23c5-xmqv-rm74, GHSA-23c5-xmqv-rm74 | Export/archive dependencies plus CLI paths. Application ZIP helper appends buffers and does not call glob/directory; adversarial pattern reachability not established. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| nanoid | high; transitive | build tooling / shared production declaration; roots: autoprefixer, next, next-auth, postcss | GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8, GHSA-xwg4-73v4-xw9w | CSS compilation and source-map processing; untrusted CSS/map input is the relevant prerequisite. Next finding is inherited from bundled PostCSS, not a direct Next advisory. No public CSS compilation path found. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| next | moderate; direct | build tooling / shared production declaration; roots: next, next-auth | Inherited from postcss | CSS compilation and source-map processing; untrusted CSS/map input is the relevant prerequisite. Next finding is inherited from bundled PostCSS, not a direct Next advisory. No public CSS compilation path found. next@16.4.0; breaking change or downgrade proposed by npm; do not apply automatically. |
| node-fetch | high; transitive | production dependency; roots: react-stepper-horizontal | GHSA-r683-j2x4-v87g | No direct application import found for root packages; retained pending a separate functionality review. Public exploit reachability unproven. No npm-reported fix; replace or remove the owning dependency after functionality review. |
| path-to-regexp | high; transitive | CLI only (declared production); roots: vercel | GHSA-9wv6-86v2-598j | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| picomatch | high; transitive | CLI only (declared production); roots: vercel | GHSA-3v7f-55p6-f55p, GHSA-3v7f-55p6-f55p, GHSA-c2c7-rcm5-vvqj, GHSA-c2c7-rcm5-vvqj | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| postcss | high; direct | build tooling / shared production declaration; roots: autoprefixer, next, next-auth, postcss | GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849 | CSS compilation and source-map processing; untrusted CSS/map input is the relevant prerequisite. Next finding is inherited from bundled PostCSS, not a direct Next advisory. No public CSS compilation path found. next@16.4.0; breaking change or downgrade proposed by npm; do not apply automatically. |
| preact | high; transitive | production dependency; roots: next-auth | GHSA-36hm-qxxp-pg3m | NextAuth rendering dependency; attacker-supplied JSON VNodes are not configured. Compatible advisory floor: 10.27.3; retained for separate targeted review. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| protocol-buffers-schema | moderate; transitive | production dependency; roots: @tomtom-international/web-sdk-maps, @tomtom-international/web-sdk-plugin-searchbox | GHSA-j452-xhg8-qg39 | Application imports found through @tomtom-international/web-sdk-maps; exploit prerequisites and deployed configuration remain unverified. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| qs | moderate; transitive | production dependency; roots: stripe | GHSA-w7fw-mjwx-w883, GHSA-6rw7-vpxm-498p, GHSA-q8mj-m7cp-5q26, GHSA-4mjr-xmp4-gh2g | Stripe SDK dependency; no application qs import or inbound request parsing with qs found. Malicious structured serialization input remains unverified. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| react | high; transitive | production dependency; roots: react-stepper-horizontal | Inherited from fbjs | No direct application import found for root packages; retained pending a separate functionality review. Public exploit reachability unproven. No npm-reported fix; replace or remove the owning dependency after functionality review. |
| react-cookie-consent | high; direct | production dependency; roots: react-cookie-consent | Inherited from js-cookie | No direct application import found for root packages; retained pending a separate functionality review. Public exploit reachability unproven. react-cookie-consent@10.0.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| react-dom | high; transitive | production dependency; roots: react-stepper-horizontal | Inherited from fbjs, react | No direct application import found for root packages; retained pending a separate functionality review. Public exploit reachability unproven. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| react-stepper-horizontal | high; direct | production dependency; roots: react-stepper-horizontal | Inherited from react | No direct application import found for root packages; retained pending a separate functionality review. Public exploit reachability unproven. No npm-reported fix; replace or remove the owning dependency after functionality review. |
| sharp | high; transitive | production dependency; roots: next, next-auth | GHSA-f88m-g3jw-g9cj, GHSA-rgj7-g3m4-5g8c, GHSA-wq5f-xc86-pv6w | Next image optimizer dependency; no next/image imports found, but endpoint reachability is not disproven. Advisory floor is 0.35.5; minor upgrade of a 0.x native dependency needs separate compatibility review. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| source-map-js | high; transitive | build tooling / shared production declaration; roots: autoprefixer, next, next-auth, postcss | GHSA-68fv-2mgg-jv7q | CSS compilation and source-map processing; untrusted CSS/map input is the relevant prerequisite. Next finding is inherited from bundled PostCSS, not a direct Next advisory. No public CSS compilation path found. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| tar | critical; transitive | CLI only (declared production); roots: vercel | GHSA-34x7-hfp2-rc4v, GHSA-8qq5-rm4j-mr97, GHSA-83g3-92jg-28cx, GHSA-qffp-2rhf-9h96, GHSA-9ppj-qmqm-q256, GHSA-r6q2-hw4h-h46w, GHSA-vmf3-w455-68vh, GHSA-w8wr-v893-vjvp, GHSA-23hp-3jrh-7fpw, GHSA-8x88-c5mf-7j5w, GHSA-gvwx-54wh-qm9j, GHSA-r292-9mhp-454m | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| tmp | high; transitive | production dependency; roots: exceljs | GHSA-52f5-9888-hmc6, GHSA-ph9p-34f9-6g65 | Application imports found through exceljs; exploit prerequisites and deployed configuration remain unverified. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |
| ts-morph | high; transitive | CLI only (declared production); roots: vercel | Inherited from @ts-morph/common | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| undici | high; transitive | CLI only (declared production); roots: vercel | GHSA-c76h-2ccp-4975, GHSA-g9mf-h72j-4rw9, GHSA-cxrh-j4jr-qwg3, GHSA-2mjp-6q6p-2qxm, GHSA-vrm6-8vpv-qv8q, GHSA-v9p9-hfj2-hcw8, GHSA-4992-7rv2-5pvq, GHSA-p88m-4jfj-68fv, GHSA-vxpw-j846-p89q, GHSA-g8m3-5g58-fq7m, GHSA-8xcm-r25x-g524, GHSA-m8rv-5g2x-5cg5, GHSA-v3r7-h72x-cjcm, GHSA-35p6-xmwp-9g52, GHSA-r53p-7pc4-xj5r | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| uuid | moderate; transitive | production dependency; roots: @tomtom-international/web-sdk-maps, @tomtom-international/web-sdk-plugin-searchbox, @tomtom-international/web-sdk-services, exceljs | GHSA-w5hq-g745-h8pq | Application imports found through @tomtom-international/web-sdk-maps, exceljs; exploit prerequisites and deployed configuration remain unverified. exceljs@3.4.0; breaking change or downgrade proposed by npm; do not apply automatically. |
| vercel | high; direct | CLI only (declared production); roots: vercel | Inherited from @vercel/blob, @vercel/express, @vercel/fun, @vercel/h3, @vercel/hono, @vercel/hydrogen, @vercel/node, @vercel/redwood, @vercel/remix-builder, @vercel/static-build | CLI dependency; no application import of Vercel found. Local build-tool input rather than customer-facing request path. vercel@63.1.2; breaking change or downgrade proposed by npm; do not apply automatically. |
| ws | high; transitive | production dependency; roots: @supabase/auth-helpers-nextjs, @supabase/auth-helpers-react, @supabase/ssr, @supabase/supabase-js, @vercel/postgres | GHSA-58qx-3vcg-4xpx, GHSA-96hv-2xvq-fx4p | Realtime/database WebSocket clients in production dependencies; requires malicious socket traffic. Compatible advisory floor: 8.21.0; no hosted socket was contacted. npm reports a compatible update; verify exact patched candidate and owning package compatibility in a separate targeted change. |


### Final validation after Nodemailer 10.0.9

All application validation ran with Node 22.23.3, dummy credentials, telemetry
disabled and the existing network-blocking preload. npm 11.17.0 performed normal
dependency resolution with lifecycle scripts, install-time audit and funding
disabled. The first lock-only pass used the shell's Node 24 and reported the
application's 22.x engine warning; subsequent installation and all application
validation used the workspace-local Node 22 binary downloaded from npm.
No global Node installation or system setting was changed.

| Check | Final result |
| --- | --- |
| Complete existing test suite | Exit 0; 33/33 passed, zero failed/skipped |
| Separate routing suite | Exit 0; 4/4 passed, included in the 33 |
| Dependency compatibility checks | Exit 0; 4/4 passed; SMTP construction, local MIME composition, mocked Axios GETs, credentials auth with peer absent |
| Root TypeScript | Exit 0; no diagnostics; jsconfig.json, noEmit, incremental false |
| App TypeScript | Exit 0; no diagnostics; existing app-scoped config, noEmit, incremental false |
| Production build | Exit 0; Next 15.5.27 compiled in 9.1 seconds; 123/123 static pages; optimization and traces completed |
| Secret scan | Exit 0; 25 commits, same 86 candidate locations; values suppressed |
| Full dependency tree | npm ls --all exit 0; no problems or incompatible peer |
| Manifest/lock/installed verification | Exit 0; exact target versions, unchanged Next record/scripts/devDependencies |
| Recovery preservation | Session-start hashes checked; all existing files outside the explicit change list identical; mailer-source changes reverse exactly to original bytes |
| Fresh npm audit | Valid full and production registry responses; findings classified above; Axios/Nodemailer/NextAuth/follow-redirects absent |
| git diff --check | Exit 0; informational line-ending notices only |
| Branch / staging | stu-development; empty index |

The first auxiliary compatibility check failed because its assertion tried to
import NextAuth's unexported package.json subpath. The assertion was corrected
to read local metadata; all four checks then passed, including after the final
mailer update. No production failure or failed assertion was suppressed.
Validation logs, snapshots, temporary checks, npm caches and the Node binary stay
under ignored .cache inside this workspace. The build uses dummy values and must
not be deployed as a production artifact. Browser interactions, real email,
Xero and hosted systems remain untested under the authorized boundary.

### Files changed in this fresh session

- package.json and package-lock.json: targeted dependencies and unused removals.
- Eleven files: mailer module-specifier replacement only:
  `exportAndEmailBookings.js`, `lib/emailTransporter.js`, `lib/nodemailer.js`, `pages/api/contact.js`, `pages/api/email/sendCustomerInvoice.js`, `pages/api/notify-fast-booking.js`, `pages/api/send-new-admin-email.js`, `pages/api/sendBookingAlerts.js`, `scripts/testEmail.js`, `utils/export/sendToFiona.js`, `utils/sendCustomerInvoiceEmail.js`.
- docs/TARGETED-SECURITY-UPDATE.md: current completion and historical clarification.
- docs/FRESH-DEPENDENCY-SECURITY-REVIEW.json: new fresh audit and lock-change evidence.
- docs/TARGETED-SECRET-SCAN.json: refreshed; identical candidate locations.

All previous recovery work is preserved; Supabase/Deno hashes are unchanged.
No staged files, commit, push or deployment.

MIDNIGHT SECURITY UPDATE READY FOR STUART COMMIT APPROVAL

## Authorized local checkpoint review — 2026-10-11

Stuart authorized staging and one local recovery/security commit. The full exact
file manifest and exclusions are recorded in [LOCAL-CHECKPOINT.md](LOCAL-CHECKPOINT.md).
All 41 modified tracked files and 22 original untracked files were reviewed;
the Supabase/Deno configuration remains uncommitted and unchanged. The added
checkpoint record brings the included-content count to 63 files, with three
additional index-only environment-file removals.

The expanded precommit scan compared file contents with local credential values
without displaying them. It found an existing embedded SMTP password in
pages/api/send-new-admin-email.js that the earlier uppercase-name secret pattern
did not detect. The credential was not newly introduced by the dependency update.
Both SMTP auth fields now read EMAIL_USER / EMAIL_PASS from the environment.
One regression test mocks the mailer and verifies the environment-derived options;
it does not invoke a real mailer or deliver a message. This fixes the discovered
checkpoint-content problem without changing the transport's other options.

After that source change, Node 22.23.3 local validation passed again:

- Complete test suite: exit 0; **34/34** tests, zero failed/skipped.
- Separate routing suite: exit 0; **4/4**, included in the 34.
- Root and app TypeScript: both exit 0, no diagnostics.
- Production build: exit 0; Next **15.5.27**, compilation 7.8 seconds,
  **123/123** static pages, optimization and traces completed.
- Exact manifest, lock and installed versions: Next 15.5.27,
  midnight-nodemailer (Nodemailer) 10.0.9, NextAuth 4.24.15, Axios 1.20.0.
- Dependency graph and audit data are unchanged from the fresh-registry result
  above: 56 classified findings; no targeted-package finding. No network refresh
  was necessary for the source-only credential correction.
- Proposed snapshot: zero known local credential matches after environment
  exclusions; zero private-key/token/credential-pattern candidates in included files.
- git diff --check: exit 0, informational line-ending notices only.

.env, .env.local and .env.js were still tracked despite existing ignore rules.
They are removed from the index only for this checkpoint; their local bytes are
preserved. Existing historical credential exposure is not removed by this local
commit and no credentials were rotated. Generated build/dependency/cache output
and local environments are excluded. Redacted scanner reports contain location
metadata only. The precommit historical scan reflects the 25 commits reachable
before this new checkpoint, not a postcommit history rewrite.

No live service, Vercel/Supabase operation, email, deployment or push was performed.
The checkpoint is local and awaits Stuart's separate release approval.

Final checkpoint-content refinements: hash-generator.js no longer contains a
password literal or logs plaintext passwords; it requires HASH_GENERATOR_PASSWORD
and was syntax-checked without execution. The scanner now detects literal SMTP
pass fields. The five remaining current-tree pattern candidates are dynamic
generated/hashed-password expressions in baseline account forms. A trailing blank
line in the new authConfig module was trimmed to pass the staged diff check.
The exact final file manifest is LOCAL-CHECKPOINT.md: 64 included-content files
and three environment removals, totaling 67 changed paths. Application code
validated above is unchanged by these standalone-tool/document refinements.
