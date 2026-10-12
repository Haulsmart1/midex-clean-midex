# Exact production route-gap resolution

Live evidence: deployment `dpl_HcxMpNQukFUaEMV8qqbWbmgqEgXT`, anonymous GET,
isolated Chrome rendering, served page factories, public page props and navigation.
Dynamic examples use `fastfreight`, `group-1` and `oxford-to-helsinki`.
All 23 are preserved. No route is classified obsolete/dead or discarded.

Classes: **A** required Midnight functionality; **B** compatibility/redirect;
**C** intentionally shared brand functionality. C also serves Midnight.

| Exact production pattern | Class | Live evidence | Candidate preservation |
| --- | --- | --- | --- |
| /auth/redirect | B | 200, “Signing you in…”; served factory routes authenticated roles to dashboards | Recovered role-routing factory, unchanged destinations |
| /blog | C | 200; route index links /blog/routes/group-1; 200 on both shared www domains | Restored index and public navigation |
| /blog/group-1 | C | 200; 100 production post records and rendered articles | Exact records 1–100 restored |
| /blog/group-2 | C | 200; 100 production post records and rendered articles | Exact records 101–200 restored |
| /blog/group-3 | C | 200; 100 production post records and rendered articles | Exact records 201–300 restored |
| /blog/group-4 | C | 200; 100 production post records and rendered articles | Exact records 301–400 restored |
| /blog/group-5 | C | 200; 100 production post records and rendered articles | Exact records 401–500 restored |
| /blog/group-6 | C | 200; 100 production post records and rendered articles | Exact records 501–600 restored |
| /blog/group-7 | C | 200; 100 production post records and rendered articles | Exact records 601–700 restored |
| /blog/group-8 | C | 200; 100 production post records and rendered articles | Exact records 701–800 restored |
| /blog/group-9 | C | 200; 100 production post records and rendered articles | Exact records 801–900 restored |
| /blog/group-10 | C | 200; 100 production post records and rendered articles | Exact records 901–1000 restored |
| /blog/routes/[group] | C | group-1 returns 200, 870 European freight records; linked by blog index | Exact 870 records restored; unknown groups remain 404 |
| /blog/[slug] | C | Sample 200 on all www brands; homepage has 2,352 post links | Complete 2,352-record served array restored; same first matching slug lookup; unknown slugs 404 |
| /dashboard/admin/super/default | B | 200; “Default Dashboard”, no-role fallback message; no data operations | Recovered fallback component |
| /dashboard/admin/super/users/invite | A | 200 anonymous “Not authorised”; factory has role/account/invoice-company form and /api/admin/invite action | Recovered form; server super-admin guard; matching protected Supabase invitation endpoint |
| /dashboard/currys/admin/users | A | 200 anonymous Currys role denial; factory contains user search, invitation, role/status controls | Recovered table/factory and Currys server role guard |
| /dashboard/currys/bookings/all/bookings | A | 200; Currys booking cards, status/progress, attachments and edit navigation in factory | Recovered booking factory; valid Currys session required |
| /dashboard/default | B | 307 /login anonymously; recovered source redirects signed-in visitors | URL retained with existing role-aware dashboard dispatcher, avoiding unconditional super-admin redirection |
| /dashboard/partner/[partner] | A | 200 then client /login; factory contains bookings/finance/settings/archive navigation and coverage | Recovered generic dashboard, partner configs and existing dedicated partner pages retained |
| /dashboard/partner/[partner]/archive | A | 200 then /login; factory includes five archive tabs, region filters, search, pagination, POD and deletion controls | Full factory and region helper recovered; canonical token/RLS client and partner/session guard |
| /dashboard/partner/[partner]/vehicles | A | 200 then /login; factory contains vehicle list and authorized add/delete controls | Full factory recovered; canonical token/RLS client, role/partner guards; refresh-token bridge superseded |
| /thank-you | B | 200; confirmation message and Return to Home link | Confirmation URL and home navigation restored |

The protected routes now reject anonymous access before rendering via 307 /login,
rather than relying exclusively on production's client redirect/denial. This
preserves authorized workflows and strengthens access checks. No production
authenticated account, database write, email or payment was used to verify them.
Synthetic local sessions rendered the six restored protected views successfully;
role/expiry/tenant denial and the invitation contract were tested with offline mocks.

[P0-ROUTE-EVIDENCE.json](P0-ROUTE-EVIDENCE.json) records production observations.
[P0-PUBLIC-RECOVERY-PROOF.json](P0-PUBLIC-RECOVERY-PROOF.json) records dataset
provenance and all ten independently observed group digests. Public article
routes use cached server rendering instead of rebuilding thousands of static
paths; their content and URLs are retained. All 23 patterns are present in the
verified candidate's build manifest. Complete original server source remains
unavailable; this is evidence-backed route/component recovery, not a full-source
equality claim or a successful production transaction claim.

The separately observed working `/booking?partner=…` compatibility flow is also
retained using its served production factory; default `/booking` retains the
previously recovered wizard. This prevents a functional replacement at a URL
that was present in both manifests and therefore absent from the 23-gap list.
