# Drishyam Realty

A light, navy-and-champagne real estate website built with Next.js App Router, React, strict TypeScript, Tailwind, Motion, GSAP, Lenis, and a progressively enhanced React Three Fiber architectural viewer. The original supplied logo is used without redesigning it.

## Current local setup

The app uses **Microsoft SQL Server through the `mssql` driver**, with your provided connection settings in the private, git-ignored `.env`. The tables and stored procedures have been installed in the separate **`drishyam`** schema inside the supplied database. Existing unrelated tables are preserved.

All application reads and writes use parameterized **stored-procedure execution**. There is no Prisma, ORM, `.query()`, or `.batch()` application access. SQL stays in `database/001_schema_and_procedures.sql`. The setup command uses SQL Server's `sys.sp_executesql` stored procedure only to install the fixed, checked-in DDL batches; runtime data access calls the named `drishyam.usp_*` procedures.

The administrator email is **`admin@drishyam.example`**. Use the admin password you provided; it is stored as a bcrypt hash in SQL Server. The plaintext connection and bootstrap values remain only in `.env` and are never returned to the browser.

Open the local site at `http://127.0.0.1:3000` and the administrator workspace at `/admin`.

## Start the application

```sh
cd website
npm install
npm run dev
```

For another installation, copy `.env.example` to `.env`, fill in the connection values, and run:

```sh
npm run db:check
npm run db:migrate
npm run admin:create
```

The database must already exist. `db:migrate` is repeatable; it creates missing application tables and installs or updates the stored procedures. `admin:create` creates a new administrator and deliberately does not overwrite an existing administrator's password.

A named SQL Express instance uses `DB_SERVER=host\instance`. SQL Server Browser discovery is used when an instance name is provided. Set `DB_PORT` to your instance's actual fixed TCP port to bypass discovery. Encryption and certificate trust follow the configured values.

## Content and administration

Public routes: `/`, `/about`, `/buy-properties`, `/sell-properties`, `/property/[slug]`, `/testimonials`, `/contact`, `/privacy-policy`, `/terms-and-conditions`, and `/disclaimer`.

The protected administrator workspace supports:

- Property creation and editing, availability, buy/sell visibility, featured state, specifications, amenities, media order, main image, video and documentation.
- Reversible property archiving; unavailable listings are omitted from public discovery.
- Enquiry search, status filtering, contact information, internal notes and CSV export.
- Approved customer stories, optional ratings, images and video links.
- Business contact details, WhatsApp number, address, office hours and service areas.

Six **clearly marked sample properties** are stored for review. They are illustrative development content, not real inventory. No reviews or business achievements were invented. Temporary contact details use the reserved `.example` domain. Replace sample records and contact information in `/admin` before launch.

`DEMO_MODE=true` allows clearly labelled sample content when SQL Server is temporarily unavailable. Set `DEMO_MODE=false` for live operation. Sample database seeding requires `ALLOW_DEMO_SEED=true` and is disabled under `NODE_ENV=production`; the seed preserves existing records.

## Enquiries and security

Enquiries are validated on the client and server. Explicit contact consent, a honeypot, durable SQL rate limits, idempotency keys, and transactional stored procedures protect submissions. Property enquiry context is recorded with each lead. Success is shown only after SQL Server acknowledges the saved record.

Administrator sessions use opaque random tokens; only token hashes are stored in SQL Server. Cookies are HttpOnly and SameSite Strict, and Secure in production. Every administrator API checks authorization. Site settings and testimonial publication require the ADMIN role. Mutation endpoints require the configured site origin. Set `NEXT_PUBLIC_SITE_URL` to the exact production origin when deploying. A reverse proxy must supply trustworthy client IP headers for per-client rate limiting.

## Optional connections

- **WhatsApp:** set a valid business number in admin settings. The site does not create a click-to-chat link until a number is configured.
- **Email notifications:** fill `RESEND_API_KEY`, `ADMIN_NOTIFICATION_EMAIL`, and `NOTIFICATION_FROM` using your verified sender. Unconfigured notifications remain pending in the dashboard; enquiry persistence still works.
- **Photo uploads:** set the S3-compatible storage variables and configure bucket CORS for the site origin and PUT requests. Uploads use short-lived signed URLs. Without storage credentials, admin image URLs and ordering still work. JPG, PNG and WebP files are limited to 10 MB each.
- **Maps:** provide actual coordinates on property records and an actual business address. Sample locations are not presented as verified map pins.

## Validation

```sh
npm run typecheck
npm test
npm run test:db
npm run test:http
npm run build
```

`test:db` validates property media, lead persistence, idempotency, status updates and archiving through stored procedures, inside a transaction that rolls back all verification records. `test:http` checks the local routes, API authorization, origin protection, form validation, admin login and session revocation. It does not publish fake testimonials or retain test leads.

Reduced-motion users receive simplified transitions and a static architecture image. The Three.js enhancement is dynamically loaded only on capable desktop devices. No browser was connected to this agent session, so real-device visual review remains a manual step.

## Deployment

This is a **Node.js application**, not a static export. Deploy it on a Node.js server that can reach your private LAN SQL Server (directly or through your existing private network). The private `192.168.*` database cannot be reached by ordinary public cloud hosting without a network connection.

```sh
npm run build
npm run start
```

For remote access, run behind your chosen HTTPS reverse proxy; configure the public origin and firewall/network access appropriately. The runtime needs access to the database and execution permissions on the application stored procedures. Do not upload `.env` into a public repository or frontend assets.

## Assets

- `public/logo.png`: proportion-preserving optimized copy of your official logo. The original remains in the parent project folder.
- Hero and villa: one original generated architectural visualization, not a depiction of live inventory.
- Interior: [Unsplash source](https://unsplash.com/photos/modern-living-room-with-elegant-furniture-and-decor--QCjahEjubY), free under the Unsplash License.
- Office: [Unsplash source](https://unsplash.com/photos/modern-office-buildings-with-glass-windows-ouCp9PvYuuA), free under the Unsplash License.

Legal page copy is a draft and includes the outstanding business-specific details to finalize before launch. Notifications, uploads, actual contact data, and live property information need the corresponding business configuration.
