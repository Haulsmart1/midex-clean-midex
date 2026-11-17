# Midnight Express commercial enquiry release

The confirmed professional design is retained. This release accepts freight
requirements for human review; it does not activate marketplace job acceptance,
automatic quotes/bookings, payments, subscriptions or automatic email.

## Data and staff access

Enquiries commit to a separate private PostgreSQL schema with a stable random
reference, immutable original details, bounded private attachments and audit.
A transaction advisory lock and unique keyed request fingerprint recover the
same receipt after a lost response. A different payload under that key conflicts.
Database-backed IP/email limits apply to new requests; receipt recovery does not
consume a new enquiry allowance. No customer details enter application logs.

The runtime is pinned to this product's database name, role, verified TLS and
explicit host. Its role cannot delete, create roles/databases or bypass row
security. Migration-owner credentials are not deployed. Preview and Production
must use different branches, runtime passwords and HMAC secrets. Never rotate
the HMAC secret while receipt-recovery records are retained without a plan.

The existing per-site Supabase provider is preserved. Operations requests use
its public key to verify a bearer token with the provider, then require a
server-pinned subject ID with verified email and no active ban. Profile roles
and user-editable metadata cannot grant access. Only the explicitly authorised
Stuart account is initially pinned; add further staff only after identity and
business-authority verification. All reads, status writes and downloads repeat
the check, with no-store responses. Browser account changes and page hiding
clear private records and reject late responses.

`/operations/enquiries` supports staff sign-in, list/detail, older pages,
actor-attributed status audit, protected document downloads and manual customer
reply drafts. The page never sends mail itself. File validation is not antivirus
certification; staff should open customer documents with their normal managed
document protection. No SMTP client is instantiated by the enquiry API.

## Reproducible checks

Use Node 22.x. Install with `npm ci --ignore-scripts --legacy-peer-deps`.
Install offline tools separately with
`npm ci --prefix tools/enquiry-review --ignore-scripts --no-audit --no-fund`.
Run the capture/staff/API tests in `scripts/*.test.cjs`; the SQL regression uses
`NODE_PATH=tools/enquiry-review/node_modules node --test scripts/enquiry-sql.test.cjs`.
The SQL check applies the actual migrations twice against embedded PostgreSQL,
exercises the actual adapter as a restricted role, and verifies retry/conflict,
attachment ownership, rollback, status audit, immutable details and denied
DELETE/TRUNCATE/DDL. It is not proof of independent-process transport or locks.
Run `node scripts/operations-component.cjs` for actual React privacy/action checks.
Run `npm run build` with synthetic public Auth configuration for offline builds.
Never load real SMTP, billing or migration-owner credentials into a test build.

## Operations acceptance

Verify real hosted capture, unchanged retry, changed-payload conflict, one
stored record and original audit using labelled synthetic enquiries only.
Verify anonymous/wrong-account denial before retrieval. Stuart must complete
his own real staff login; synthetic fixtures cannot establish a human login or
inbox delivery. Actual production credentials must stay in encrypted hosting
settings. Capture success means storage, not booking or delivered email.

Before commercial claims beyond enquiry handling, confirm the legal company
name/number/registered office, retention and transport terms with the owner.
No placeholder VAT, address, company number, schedule, accreditation or owned
fleet claim is introduced by this release.

## Hosted acceptance — 16 November 2026

The protected preview built successfully on Vercel in Frankfurt. Chromium
confirmed the restored professional heading/design, no horizontal overflow at
390 px, and successful responses for every homepage navigation link. Images
loaded after normal page scrolling. A synthetic API enquiry returned a stored
receipt; six simultaneous unchanged retries recovered that reference. Changed
details under the same key returned 409. Anonymous staff access returned 401
with private/no-store. Readback using the restricted PostgreSQL runtime role
confirmed one synthetic record, its audit, notification disabled and zero
email attempts. See `preview-acceptance-20261116.json`.

Both production builds and runtime dependency audits passed (zero runtime
findings). Capture/staff/API tests, actual React form/operations checks and
restricted-role migration/repository checks passed. These do not establish
Stuart's real password login or an actual human response; those remain owner
acceptance. No emails or billing actions were performed.

## Exact remaining release decisions

1. Approve merging this release branch and production publication.
2. Provision a separate empty production enquiry database/branch and fresh
   restricted credentials/HMAC secret; do not copy Preview credentials.
3. For Midnight, publish only `apps/midnight-commercial` on its dedicated
   `midnight-commercial` Vercel project, then move only midnight-xpress.com
   and www.midnight-xpress.com. Keep Express Pallets, Lithium Battery and ADR
   infrastructure and domain assignments untouched.
4. Stuart signs in to `/operations/enquiries`, retrieves the labelled test
   enquiry, and confirms the team's manual response process. Only Stuart's
   existing verified account is initially allowed.
5. Supply/approve the legal entity name, number, registered office and
   retention/transport terms before declaring commercial launch complete.

Automatic email, billing, live job acceptance and automated booking remain off.
