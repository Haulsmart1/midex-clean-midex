# Local recovery/security checkpoint — 2026-10-11

Branch: stu-development. Parent: 539b115953fb693c78d8ca8c3062307e37935521.
Stuart authorized one local commit: chore: secure and verify recovered Midnight application.

## Verified state

Next is exactly 15.5.27; application Nodemailer is 10.0.9 under the supported
npm alias midnight-nodemailer; NextAuth is 4.24.15 and Axios is 1.20.0.
The completed final validation in TARGETED-SECURITY-UPDATE.md records 33/33 local
tests, the separate 4/4 routing suite, 4/4 dependency compatibility checks,
both TypeScript checks, 123/123 production build pages, valid dependency tree,
secret scan and diff checks. Fresh audit retains 56 classified package findings;
none affect the four targeted packages. A local checkpoint is not release approval.

Reviewed the actual inventory of 41 modified tracked files and 22 individual
untracked files (the earlier 30/21 counts predate the dependency continuation).
All existing recovery/security source changes are retained. Native Deno work
remains separate and unverified, so supabase/functions/deno.json stays untracked.

## Environment and sensitive-content exclusion

.env, .env.local and .env.js were still tracked despite ignore rules. This checkpoint
removes these three files from the index only; their local bytes are preserved.
No environment values or credentials are included in this record. Prior Git history
is not rewritten, so its historical credential exposure is not remediated here.
The proposed included file contents were scanned with credential/private-key/token
patterns and compared with locally configured credential values without printing
them. No candidate or known credential match was found in the proposed snapshot
after excluding the three environments. Secret evidence JSON contains location
metadata only. This is a local content review, not a credential-rotation claim.

Generated .next output, node_modules, .cache (including logs, tarballs and local
Node runtime), .vercel and local environments are excluded. No unrelated file
or Supabase/Deno change is included. Only inactive sample Git hooks are installed;
no live service or external integration is involved in creating this checkpoint.

## Exact included file manifest

- `.gitignore`: Keep local environments, caches and build output out of Git.
- `docs/DEPENDENCY-SECURITY-REVIEW.json`: Recovery/security evidence; secret reports contain locations only.
- `docs/FORENSIC-AUDIT.md`: Recovery/security evidence; secret reports contain locations only.
- `docs/FRESH-DEPENDENCY-SECURITY-REVIEW.json`: Recovery/security evidence; secret reports contain locations only.
- `docs/LOCAL-CHECKPOINT.md`: Checkpoint scope and verification record.
- `docs/RECOVERY-COMPLETION.md`: Recovery/security evidence; secret reports contain locations only.
- `docs/SECRET-SCAN.json`: Recovery/security evidence; secret reports contain locations only.
- `docs/TARGETED-DEPENDENCY-SECURITY-REVIEW.json`: Recovery/security evidence; secret reports contain locations only.
- `docs/TARGETED-SECRET-SCAN.json`: Recovery/security evidence; secret reports contain locations only.
- `docs/TARGETED-SECURITY-UPDATE.md`: Recovery/security evidence; secret reports contain locations only.
- `exportAndEmailBookings.js`: Mailer import updated to verified isolated Nodemailer alias.
- `jsconfig.json`: Verified TypeScript/casing recovery.
- `lib/authOptions.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `lib/emailTransporter.js`: Mailer import updated to verified isolated Nodemailer alias.
- `lib/freight/desk.cjs`: Verified local mock freight workflow and persistence.
- `lib/freight/mockHaulsmart.cjs`: Verified local mock freight workflow and persistence.
- `lib/freight/workspace.cjs`: Verified local mock freight workflow and persistence.
- `lib/nodemailer.js`: Mailer import updated to verified isolated Nodemailer alias.
- `lib/server/authConfig.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `lib/server/requireSuperAdmin.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `lib/server/sessionPolicy.cjs`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `lib/server/supabaseForSession.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `package-lock.json`: Verified targeted dependency versions and reproducible lockfile.
- `package.json`: Verified targeted dependency versions and reproducible lockfile.
- `pages/api/add-user.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/auth/[...nextauth].js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/bookings/index.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/bookings/sign-off.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/contact.js`: Mailer import updated to verified isolated Nodemailer alias.
- `pages/api/delete-user.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/downloads/[filename].js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/email/sendCustomerInvoice.js`: Mailer import updated to verified isolated Nodemailer alias.
- `pages/api/employees/reset-password.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/get-user-profile.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/haulsync.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/notify-fast-booking.js`: Mailer import updated to verified isolated Nodemailer alias.
- `pages/api/quote.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/reset-user-password.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/send-new-admin-email.js`: Mailer import updated to verified isolated Nodemailer alias.
- `pages/api/sendBookingAlerts.js`: Mailer import updated to verified isolated Nodemailer alias.
- `pages/api/submit-booking.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/test-supabase-login.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/api/users.js`: Verified authentication, authorization and retired unsafe endpoint recovery.
- `pages/dashboard/admin/super/haulsmart/[id].js`: Retire cross-product publication and unsafe live actions.
- `pages/dashboard/freight-desk.js`: Verified local mock freight workflow and persistence.
- `pages/dashboard/partner/[partner]/bookings.js`: Retire cross-product publication and unsafe live actions.
- `pages/dashboard/partner/[partner]/settings.js`: Verified TypeScript/casing recovery.
- `pages/dashboard/partner/fastfreight.js`: Verified TypeScript/casing recovery.
- `pages/dashboard/user/bookings/index.js`: Navigation to recovered freight demo.
- `scripts/freight.test.cjs`: Local offline verification and value-suppressed secret scanner.
- `scripts/injectDummyFromMidex.js`: Retire cross-product publication and unsafe live actions.
- `scripts/injectManchesterDummy.js`: Retire cross-product publication and unsafe live actions.
- `scripts/routing.test.cjs`: Local offline verification and value-suppressed secret scanner.
- `scripts/scan-secrets.cjs`: Local offline verification and value-suppressed secret scanner.
- `scripts/security.test.cjs`: Local offline verification and value-suppressed secret scanner.
- `scripts/syncMidnightToHaulsmart.js`: Retire cross-product publication and unsafe live actions.
- `scripts/testEmail.js`: Mailer import updated to verified isolated Nodemailer alias.
- `scripts/workspace.test.cjs`: Local offline verification and value-suppressed secret scanner.
- `utils/export/sendToFiona.js`: Mailer import updated to verified isolated Nodemailer alias.
- `utils/getMileageBetweenPostcodes.js`: Verified coordinate order and mileage accounting.
- `utils/getTomTomMileage.js`: Verified coordinate order and mileage accounting.
- `utils/resolveRoute.js`: Verified coordinate order and mileage accounting.
- `utils/sendCustomerInvoiceEmail.js`: Mailer import updated to verified isolated Nodemailer alias.

- `hash-generator.js`: Remove embedded password and plaintext logging; require HASH_GENERATOR_PASSWORD for this standalone local utility.

## Index-only removals

- `.env`: remove from version control; retain local file unchanged.
- `.env.local`: remove from version control; retain local file unchanged.
- `.env.js`: remove from version control; retain local file unchanged.

## Deliberately left outside the checkpoint

- supabase/functions/deno.json: existing untracked native Deno configuration;
  native verification remains outstanding. Preserved without modification.
- .env, .env.local, .env.js: retained locally, ignored and no longer tracked.
- Ignored dependency/build/cache/tooling artifacts remain local.

The commit hash is reported after creation. No push, deployment or hosted-service
access is authorized or performed by this checkpoint operation.

## Additional credential correction and final checkpoint validation

The expanded local-credential comparison discovered one existing SMTP password
literal in pages/api/send-new-admin-email.js. Auth now uses environment variables
EMAIL_USER and EMAIL_PASS. A mocked regression test was added in
scripts/security.test.cjs; no email provider was invoked. Final local verification
after the correction: 34/34 tests, 4/4 routing tests, root/app TypeScript exit 0,
and Next 15.5.27 production build exit 0 with 123/123 pages (7.8s compile).
The earlier 33-test result remains historical evidence. Dependency versions and
fresh audit classification are unchanged. Staged-content checks also inspect
the actual index blobs before commit rather than only the worktree.

The final content review also removed the standalone hash-generator password
literal and plaintext logging. The generator was syntax-checked only and never
executed. The five remaining current-tree secret-pattern candidates are runtime
password-generation/hashed-password expressions in unchanged baseline account
forms, not credential literals. Historical findings remain redacted metadata.
The secret scanner now also checks literal SMTP pass fields. Staged diff review
found and removed a surplus trailing blank line in the new authConfig file.
Final set: **64 included-content files plus three index-only environment removals
(67 changed paths)**. This supersedes the initial 63-content-file scope above.
