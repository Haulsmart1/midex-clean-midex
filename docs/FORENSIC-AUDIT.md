# Midnight forensic audit — 2026-10-10

Baseline: `539b115`, clean `stu-development`. Static repository audit only; WORKING means locally executed verification. Database behaviour cannot be established from source alone. No hosted services were queried or changed.

## Original architecture and intent

Next.js 15 Pages Router, React 18, JavaScript, CSS modules/Bootstrap. Supabase Auth/database/storage and NextAuth JWT coexist. Browser components query Supabase directly; some APIs use anonymous clients, others service-role credentials, and sign-off uses a user-token client. There is no committed SQL schema, migration history or RLS policy evidence. No organisation membership model was found. Ownership is inconsistently `user_id` versus `forwarder_id`. Preserve the booking table as the existing operational record rather than replacing the application.

Bookings contain collections/deliveries JSON, pallets, references, customer, goods/weight, vehicle/equipment/ADR flags, quote components, currency, status, route legs, documents and trailer/Haulsmart flags. Invoices, users, customs_agents, currys_users, manufacturers, partners, routes, settings and forwarder_commissions appear in source; actual database constraints are unknown.

History shows booking recovery/build fixes, partner dashboard additions and password invitation/session work. The most recent three commits concern deployment builds; that history is intent, not evidence of a passing build here.

## Feature classification at baseline

| Area | Classification | Evidence / limitation |
| --- | --- | --- |
| Routes/dashboard/navigation | PARTIAL | Extensive admin/super-admin/forwarder/user/Currys/partner routes; duplicated user/users and super/admin-super trees |
| Shipment creation | PARTIAL / BROKEN | Multiple booking wizards and direct inserts; `/api/submit-booking` logs data then falsely reports saved; booking API loops over invalid pallets before safely rejecting |
| Company/customer/carrier network | PARTIAL | Users, manufacturers, distributors and named partner dashboards; no verified tenant-scoped approved-carrier panel |
| Planning/load boards/allocation | PARTIAL | Internal/cross-border booking tables, routes/trailer manifests; no procurement-stage desk or verified carrier award transaction |
| Pricing/quotes | PARTIAL / BROKEN | Multiple pricing engines and surcharge tables; quote API passes incorrect mileage arguments; floating arithmetic and trusted client costs |
| Booking/status/tracking | PARTIAL | Pending/draft/payment/approval/delivered/signed_off and progress bars; no neutral external status event model |
| POD/documents/customs | PARTIAL / BROKEN | Upload/POD buttons, packing lists, invoice PDFs and customs templates; public URL helpers; unauthenticated temporary-file download |
| Finance/reporting | PARTIAL / PLACEHOLDER | Invoice/commission/exports pages; ReportsDashboard is placeholder; sign-off invoice insert/status update is non-atomic |
| Templates/recurrence/bulk imports | NOT IMPLEMENTED | Seed/import/export scripts are not a safe user-facing repeat-order workflow |
| Addresses/contacts | PARTIAL | Collection/delivery forms, postcode lookup and company/contact fields; no verified reusable tenant address book |
| Notifications | PARTIAL | Nodemailer and booking/invitation APIs exist; not executed because they send real messages |
| Authentication/permissions | BROKEN / PARTIAL | Real login uses Supabase password auth; lib/authOptions compares plaintext passwords; fallback JWT secret; many APIs lack auth |
| Tenancy/invitations/entitlements | PARTIAL | Roles/invitations/subscription and credit-account helper; no organisation isolation schema evidence |
| Currencies/languages | PARTIAL | Many locale files and currency formatting; live FX endpoint imports missing axios, lacks snapshot contract; pricing/register API files contain page components |
| ADR/DG | PARTIAL | ADR flags/class/upload and surcharge handling; no complete structured DG declaration or sourced/effective-dated acceptance rules |
| International/customs | PARTIAL | GB/NI/ROI/EU routing/ferry/customs forms; broad postcode-derived customs/VAT assumptions require regulatory review |
| Reporting | PARTIAL | Export and commission reports; no audited procurement spend/performance/savings model |
| Mobile/PWA | PARTIAL / NOT IMPLEMENTED | Some responsive styling; no manifest/service-worker found |
| AI desk assistant | NOT IMPLEMENTED | No contextual authorised assistant found |
| Integrations | LEGACY / UNSAFE | Haulsmart API/script writes directly into another product database; Xero/Stripe/email/maps helpers exist, none activated in this run |
| Tests | BROKEN | Only configured test-route script imports Next aliases unsupported by Node; email/seed scripts must not run |
| Legacy/demo/dead code | LEGACY | middleware.temp.js, temp users, static build/public index, duplicated wizards/pages, dummy scripts and placeholder success screens |

## Baseline checks before material changes

- `npm run build`: PowerShell execution policy blocks npm.ps1. Used npm.cmd subsequently.
- `npm.cmd run build`: failed: next executable missing (node_modules absent).
- `npm.cmd run test-route`: failed: ERR_MODULE_NOT_FOUND for @/utils from resolveRoute.js, before routing or external calls.
- No test-suite, lint or typecheck scripts, eslint config, tsconfig or SQL migrations at baseline.
- Runtime is Node 24.19.0; package engine requests 22.x.

## Priority risks

1. Committed .env/.env.local/.env.js must be treated as potentially exposed credentials; do not print values or rotate externally during this run.
2. Public booking reads, quote update-by-ID and service-role user administration can bypass record ownership.
3. No local evidence proves database RLS or private storage; application fixes cannot substitute for policy verification.
4. Public URLs and temp ZIP downloads need record-scoped document grants, private buckets and expiring URLs.
5. Haulsmart direct database writes conflict with independent products and must be disabled in favour of an explicitly authorised versioned API boundary.
6. Existing commercial amounts, sign-off and rates require server calculation and transactional uniqueness/compare-and-swap constraints.
7. Production is not ready until the outstanding endpoints, tenant schema, RLS, storage and credentials are reviewed.

## Scope of safe continuation

Repair selected authenticated boundaries and false-success behaviour; preserve existing dashboards/wizards. Add a local provider-neutral shipment/procurement domain with deterministic tests and a read-only planning desk over existing bookings. No speculative hosted schema changes, real exchange publication, emails, billing or transport bookings. Organisation procurement persistence must wait for an authoritative local schema and migration plan.
