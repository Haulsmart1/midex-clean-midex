# Production environment names — 2026-10-12

Target: Midnight `midex-clean-midex`, project `prj_ssFhW39cgBpDO7aZsP5ifUnj0iJw`,
team `team_4s3slf7RDwc6sdOHUHIp2NoJ`. Read-only Vercel inventory returned four
names, each scoped to Production, Preview and Development. Values were not
decrypted, displayed or changed. Name presence does not prove credential validity.
Ignored local environments were inspected for names only, never copied to Vercel.

## Authentication intent and history

Authentication is part of this release: `/login` calls `signIn('credentials')`,
`pages/_app.js` supplies SessionProvider, canonical server auth uses Supabase
password login and encrypted JWT sessions, and account/booking APIs verify those
sessions. `NEXTAUTH_SECRET` encrypts/signs the session cookie and supplies
cryptographic key material; it cannot be replaced by the Supabase anon key.
The route intentionally returns 503 when this variable is absent.
Do not disable this guard or authentication.

Recovered parent `539b115953fb693c78d8ca8c3062307e37935521` also references
`process.env.NEXTAUTH_SECRET` and CredentialsProvider, including JWT strategy in
the auth API route. Current production metadata identifies commit
`5feb51fddde6fc8e1142b76075a53af1927bc830`, whose Git object is unavailable locally.
The connector's production authOptions contents are truncated. The production
source file inventory includes `.env` and `.env.js`; anonymous auth endpoints
respond 200 despite the secret being absent from the project-level inventory.
Uploaded environments are a plausible source of its effective configuration,
but the effective production secret's origin/value has not been established.
The candidate excludes those files. It must receive its secret from Vercel.
Historical credential exposure is recorded in the existing secret-scan reports;
do not reuse a Git-exposed secret.

Official requirements: [NextAuth v4 configuration](https://next-auth.js.org/configuration/options#secret).

## Classification

`STUART CONFIGURATION REQUIRED` means required candidate functionality lacks
the corresponding Vercel Production name. `OPTIONAL — FAILS CLOSED` means the
optional capability cannot complete without configuration; this does not imply
every legacy endpoint has a polished 503 guard. `NOT USED BY CURRENT PUBLIC
RELEASE` means no active website import/caller was found, or the integration
remains a scaffold/local utility. These are source/inventory classifications,
not successful live integration tests.

| Name | Classification | Evidence / action |
| --- | --- | --- |
| NEXTAUTH_SECRET | STUART CONFIGURATION REQUIRED | Create a fresh cryptographically random secret of at least 32 bytes; add as a Secret scoped to Production on this project. Keep it stable across replicas/deployments; rotation invalidates old sessions. Do not reuse historical Git values. |
| NEXTAUTH_URL | REQUIRED FOR CURRENT PRODUCTION | Name present. Confirm canonical Midnight URL in Vercel; no value was read. Shared domains remain attached and can have host-specific cookies. |
| NEXT_PUBLIC_SUPABASE_URL | REQUIRED FOR CURRENT PRODUCTION | Name present; browser and CredentialsProvider require it. |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | REQUIRED FOR CURRENT PRODUCTION | Name present; browser and request-scoped user clients require it. Public anon key does not confer service-role rights. |
| SUPABASE_SERVICE_ROLE_KEY | REQUIRED FOR CURRENT PRODUCTION | Name present; protected account administration requires it. Server-only. No production Supabase operation performed. |
| NEXT_PUBLIC_TOMTOM_API_KEY | STUART CONFIGURATION REQUIRED | Configure provider-authorized public map/geocoding/routing key for all approved hosts. General postcode resolution explicitly rejects a missing key; map and booking components use it. Public key must have suitable provider restrictions. |
| NODEMAILER_SMTP_HOST | STUART CONFIGURATION REQUIRED | Booking-alert and invoice-mail SMTP transport hostname. Public `/booking` calls booking-alert API; no mail was sent. |
| NODEMAILER_USER | STUART CONFIGURATION REQUIRED | Booking-alert/invoice SMTP identity. |
| NODEMAILER_PASS | STUART CONFIGURATION REQUIRED | Booking-alert/invoice SMTP credential; Secret in Production. These transports currently require implicit TLS on port 465. |
| EMAIL_USER | STUART CONFIGURATION REQUIRED | Active add-admin flow calls send-new-admin-email; contact API and export mail use this identity. |
| EMAIL_PASS | STUART CONFIGURATION REQUIRED | Active admin welcome/export mail credential; Secret in Production. |
| EMAIL_HOST | STUART CONFIGURATION REQUIRED | `exportBundleForTrailer` → `sendToFiona` has no host default; must identify the approved export SMTP provider. The separate generic transporter has a Gmail fallback. |
| EMAIL_PORT | STUART CONFIGURATION REQUIRED | Export transport uses Number(EMAIL_PORT) with no valid port default. Configure the provider's actual port. |
| EMAIL_SECURE | STUART CONFIGURATION REQUIRED | Export SMTP TLS choice: explicit string `true` for implicit TLS, or provider-appropriate setting for STARTTLS. Configure consistently with EMAIL_PORT; not a secret. |
| SMTP_HOST | OPTIONAL — FAILS CLOSED | Legacy notify-fast-booking transport; no current frontend caller found. Missing provider/credentials prevents delivery. |
| SMTP_PORT | OPTIONAL — FAILS CLOSED | Legacy notification transport port. Generic unused mail helper defaults to 465; notify-fast-booking does not. |
| SMTP_USER | OPTIONAL — FAILS CLOSED | Legacy optional notification identity. |
| SMTP_PASS | OPTIONAL — FAILS CLOSED | Legacy optional notification credential. |
| RESEND_API_KEY | OPTIONAL — FAILS CLOSED | Standalone send-welcome API; no active UI caller found. Missing bearer credential cannot authorize provider delivery; not live-tested. |
| NEXT_PUBLIC_GOOGLE_MAPS_API_KEY | OPTIONAL — FAILS CLOSED | Dashboard static maps; missing key causes provider rejection and SafeMapImage's image-error fallback. Core booking routing uses TomTom. |
| NEXT_PUBLIC_TOMTOM_KEY | NOT USED BY CURRENT PUBLIC RELEASE | Alternate key spelling only in unreferenced MapPreviewTomTom component. Not interchangeable with the active API_KEY spelling. |
| NEXT_PUBLIC_OPENCAGE_API_KEY | NOT USED BY CURRENT PUBLIC RELEASE | Unreferenced MapRoute/postcode-cache helpers. |
| NEXT_PUBLIC_ORS_API_KEY | NOT USED BY CURRENT PUBLIC RELEASE | Unreferenced MapRoute helper. |
| ORS_API_KEY | NOT USED BY CURRENT PUBLIC RELEASE | ORS helpers/routeBuilder have no active page/API import chain. Public booking attempts `/api/ors-route`, which is absent; adding this name alone does not create that endpoint. |
| STRIPE_SECRET_KEY | OPTIONAL — FAILS CLOSED | Checkout API exists; constructor rejects missing key and cannot create a payment. No active checkout UI import found. Needs approved credentials and server-priced payment review before enabling. |
| NEXT_PUBLIC_STRIPE_PUBLIC_KEY | NOT USED BY CURRENT PUBLIC RELEASE | lib/stripe is unreferenced; standalone CheckoutForm imports missing utils/stripe and is not imported by a page. No current public payment flow established. |
| XERO_CLIENT_ID | NOT USED BY CURRENT PUBLIC RELEASE | Xero scaffold retains placeholder redirect URI and no complete callback flow. Credentials alone do not make this production-ready. |
| XERO_CLIENT_SECRET | NOT USED BY CURRENT PUBLIC RELEASE | Same Xero scaffold; do not provision merely to silence build checks. |
| DATABASE_URL | NOT USED BY CURRENT PUBLIC RELEASE | lib/db only used by unreferenced postcode-cache helpers. |
| REDIS_URL | NOT USED BY CURRENT PUBLIC RELEASE | Redis postcode cache has no active website importer. Localhost fallback is not a production service. |
| SUPABASE_URL | NOT USED BY CURRENT PUBLIC RELEASE | Unreferenced supabaseAdmin helper. Active clients use NEXT_PUBLIC_SUPABASE_URL. |
| MIDNIGHT_SUPABASE_URL | NOT USED BY CURRENT PUBLIC RELEASE | Standalone retired cross-product/local export scripts; not browser app configuration. |
| HAULSMART_SUPABASE_URL | NOT USED BY CURRENT PUBLIC RELEASE | Retired cross-product scripts; never enable live publication. |
| HAULSMART_SUPABASE_SERVICE_KEY | NOT USED BY CURRENT PUBLIC RELEASE | Retired cross-product scripts; not part of this website release. |
| HASH_GENERATOR_PASSWORD | NOT USED BY CURRENT PUBLIC RELEASE | Standalone local password hashing utility; never a deployed website requirement. |

Names found only in ignored recovered environments, with no current tracked
website environment access: `MIDNIGHT_SUPABASE_SERVICE_KEY`,
`NEXT_PUBLIC_BASE_URL`, `POSTGRES_URL_NON_POOLING`, `OPENCAGE_API_KEY`,
`NEXT_PUBLIC_GRAPHHOPPER_API_KEY`, `TOMTOM_API_KEY`, `SUPABASE_ANON_KEY`,
`NEXT_PUBLIC_ORS_KEY`. All are **NOT USED BY CURRENT PUBLIC RELEASE**; do not
fabricate aliases or assume a historical value is safe to deploy. `NODE_ENV` is
runtime/build configuration supplied by Next/Vercel, not a provider credential.

## Required Stuart action

On the existing Midnight project, add a fresh **NEXTAUTH_SECRET** as a
**Production Secret**, and supply the required TomTom/SMTP configuration named
above. Do not send test customer mail. Credentials are not sufficient to authorize
deployment while the independently documented production route/source gaps remain.
