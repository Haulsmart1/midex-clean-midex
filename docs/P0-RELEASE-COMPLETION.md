# Midnight P0 release completion

Base checkpoint: `34353e70926ecc3e7cb051c20853ebfd55864484`, branch
`stu-development`. Existing Vercel project: `midex-clean-midex`
(`prj_ssFhW39cgBpDO7aZsP5ifUnj0iJw`), team `team_4s3slf7RDwc6sdOHUHIp2NoJ`.

**NEXTAUTH_SECRET: configured.**

Existing legitimate `NEXT_PUBLIC_TOMTOM_API_KEY` was recovered and configured in
Production. The local `.env` and `.env.js` raw SHA1 hashes match the corresponding
deployed source UIDs, establishing provenance without displaying values. The approved new authentication secret, recovered public map setting and verified
existing IONOS mail configuration were added to Production. Supabase settings
and unrelated existing secrets were left unchanged.
The production authentication-provider response confirms HTTPS URLs on Midnight's
primary www host. The connector does not decrypt the existing encrypted URL;
its ciphertext is not misinterpreted as an invalid URL or replaced unnecessarily.

All 23 missing production routes were classified individually and preserved in
[P0-ROUTE-GAPS.md](P0-ROUTE-GAPS.md). Public recovery includes all 2,352 post records,
870 European route records, ten independently checked 100-post groups and all
2,352 homepage post links. Dashboard recovery remaps the actual served component
factories to current local framework imports, retaining forms, data tables,
filters and actions. JJX configuration and archive region logic were recovered.
The existing dedicated partner pages and prior recovery/security work remain.
The working `/booking?partner=…` production booking-table flow is also recovered;
the existing recovered wizard remains the default `/booking` flow. Neither is
discarded. The partner query flow requires the same partner role and tenant scope
before rendering and uses the canonical bearer token for existing RLS.

Protected views enforce valid current NextAuth sessions and roles server-side.
Recovered database calls use the canonical request bearer token and existing RLS,
with no second persistent browser login or refresh-token rotation. The restored
invitation form targets a super-admin-only endpoint using the existing Supabase
provider; its role/account/profile contract was exercised only with mocks.
Official SDK contract: [inviteUserByEmail](https://supabase.com/docs/reference/javascript/auth-admin-inviteuserbyemail).

## Focused validation

- All existing 40 tests plus nine focused P0 tests: **49/49 passed**. No dependency
  security upgrade or recovery redo; four pinned package versions and lock remain.
- Root and app TypeScript: exit 0.
- Exact Next **15.5.27** production build: exit 0, **156/156** static pages plus
  restored server-rendered routes. The count increased because missing routes
  were preserved. Article URLs are cached server routes backed by exact recovered
  records, avoiding a multi-thousand-path build.
- Local production server: all 23 representative gap URLs verified; public routes
  render, protected routes redirect anonymously; auth providers/session return 200;
  unknown post/group remain 404. Build manifest has **zero missing production
  patterns**. Six representative browser renders have no detected client exception.
- Seven protected views render HTTP 200 with locally signed synthetic sessions.
  No production login or provider action was attempted.
- Known private recovered credentials: zero matches in candidate/source files or
  generated client assets. Fresh production secret was never saved locally.
  Server-only auth/service-role/mail modules are absent from client assets.
- Whitespace and exact candidate checkpoint review pass. Dependencies are unchanged
  from the already verified lock; no repeat general npm audit was performed.
- Shared domains retain their existing project attachment, apex-to-www behavior
  and live production deployment. No DNS/domain operation occurred.
- No Supabase production mutation, customer/test email, payment or Xero action.
  Temporary local verification servers were stopped.

## Production configuration resolved

All 14 required Production environment names are present. The existing same-application EMAIL and SMTP accounts passed TLS/authentication-only checks; no messages were sent. Their IONOS provider settings were reused for the required mail variables. No credentials were fabricated, exposed, committed or rotated; no new provider was introduced. Prior local NODEMAILER settings could not be verified and were not used. Booking notifications use the verified authenticated sender.

The existing quote endpoint now supplies the wizard's route and totalIncVat fields, and the notification handler accepts its JSON request as well as the existing multipart contract. All transports were mocked during request/handler tests. Working production freight URLs discovered in navigation/sitemaps were recovered with exact public descriptions and their served component; all 12 prior candidate freight URLs are retained.

The exact corrective commit is to be pushed only to stu-development and deployed to the existing Midnight project after final validation. No main/DNS/domain/Supabase mutation is part of this release. Deployment and post-deployment verification results are recorded separately.
