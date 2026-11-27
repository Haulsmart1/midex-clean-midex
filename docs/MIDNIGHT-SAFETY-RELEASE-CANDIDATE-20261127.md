# Midnight Express — security repair release candidate (27 November 2026)

**Status: DRAFT / NOT APPROVED FOR MERGE OR PRODUCTION.**

## Scope and boundaries

- Branch: `repair/midnight-enquiry-booking-safety-20261127`
- Base: shared Midnight repository `main`, in a separate repair branch only.
- No merges, production deployments, database migrations, billing, real customer data changes or outbound emails authorised or performed.
- Existing independent `apps/midnight-commercial` application was kept unchanged, including its manual-enquiry, persistence and staff workflow.

## Repairs prepared

1. `pages/api/sendBookingAlerts.js` — legacy unauthenticated booking alert is disabled, responding with HTTP 410 for POST instead of SMTP.
2. `pages/api/notify-fast-booking.js` — old urgent booking notifications disabled; no claims of a successful booking.
3. `pages/api/submit-booking.js` — retired endpoint cannot acknowledge a client-provided quotation as a saved booking.
4. `pages/api/contact.js` — retired insecure SMTP handler; no raw user input is interpolated into HTML mail.
5. `pages/api/send-new-admin-email.js` — unauthenticated administrator email and embedded SMTP secret removed from current branch. **Rotate the credential at the SMTP provider immediately.** This branch change does not erase repository history or affect any deployed instance.
6. `pages/api/bookings/index.js` — authenticated read access restricted to the server-side session identity, with a 100-record limit; unsafe booking creation returns 410.
7. `pages/api/quote.js` — preview route cannot mutate another booking using a caller-supplied booking identifier.
8. `pages/contact.js`, `pages/booking.js` — manual-enquiry guidance, explicitly not a booking confirmation, with user-initiated email link to `hazload@adrcarriers.net`.

## Test evidence and limitations

Isolated in-memory execution of the exact GitHub branch source verified:
- Five retired API endpoints reject POST with 410 and GET with 405.
- Anonymous booking read receives 401; cross-account access 403; own-account read 200; unauthorised client-priced POST 410.
- Synthetic quote result is read-only, with no database update.
- Separate commercial enquiry capture returns a stored receipt, recovers a same-payload retry, rejects a conflicting payload with 409, and does not send email.
- Unconfigured operations staff access fails closed without a network request.

No network calls, real email, live data or production database access took place during these tests. Node test entry point: `npm run test:release-safety`. These are isolated checks, **not** a complete hosted E2E test, nor proof of authorised staff login or inbox delivery. Vercel READY alone is not operational acceptance.

## Remaining pre-release requirements

- **Rotate compromised legacy SMTP credentials** via the actual email host and audit any affected accounts. Do not put new credentials into source. Treat historical secrets as exposed.
- Audit remaining legacy endpoints and revoke unused SMTP/auth permissions; confirm no vulnerable legacy implementation will be released.
- Test new dedicated commercial app against an isolated database, including multiple synthetic enquiries, status updates, anonymous denial and operator sign-in with authorised tester.
- Confirm `hazload@adrcarriers.net` is the agreed recipient. The commercial app currently has automatic SMTP turned off; enable delivery only after separate authorisation and approved safe notification implementation. A browser mailto link requires customers to send the email themselves.
- Reconcile the correct final homepage and brand domains; do not alter Express Pallets, Lithium Battery, ADR main, DNS or production settings without specific approval.
- Run `npm run test:release-safety`, isolated database permission tests, complete application builds and hosted acceptance before considering merge.
- Obtain written owner approval for the exact change set, credential rotation and production release.

## Important distinctions

An enquiry stored in the database is not a booking; a generated quotation is not an accepted price; an email handed to an SMTP server is not verified destination-mailbox delivery. Customer-facing language must preserve those distinctions.
