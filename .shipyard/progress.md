# Progress

## Done (2026-11-09, "Build everything")

- design: DESIGN.md completed below the marker.
- phase-1: frame (`(app)/layout.tsx`, AppShell restyled as a top bar in `src/lib/ui/frame.css`),
  `/` redirect, `/welcome` (names the studio via installed `POST /api/organizations`), Clients
  (list + add/edit dialog), Invoices (list with owed total, new/edit form with live totals,
  read-only sheet once sent, status buttons). Tests in `tests/invoices/`.
- phase-2: Team (list + add colleague dialog, `POST /api/team`). Tests in `tests/team/`.
- phase-3: `(app)/loading.tsx`, `(app)/error.tsx`, noindex in root metadata.
- Walked on the preview with curl: sign-up -> welcome -> client -> invoices INV-0001/0002 ->
  sent; refusals for draft->paid and editing a sent invoice; colleague signs in and sees the
  same invoices; a second studio gets 404 for the first studio's invoice.

## Sample accounts in the preview database

- owner@sample-studio.test / Northlight-Paper-2026 (studio "Northlight Studio (sample)")
- colleague@sample-studio.test / Blue-Lantern-Desk-9 (same studio)
- other@other-studio.test / Separate-Kettle-55 ("Other Studio (sample)", empty)

## Decisions the next session needs

- Currency is GBP for the whole app (`CURRENCY` in `src/lib/invoices/totals.ts`).
- The register screen is protected and sends only email + password, so the studio is
  created on `/welcome` after the first sign-in.
- Colleagues are created in `src/lib/team/service.ts` with the auth part's
  `checkPassword`/`hashPassword`, then `addMember()`. An email that already has an account is
  refused (one studio per person for now).
- "Still owed" = sum of SENT invoices. Lines and tax can change only while DRAFT.
- Status moves forward only: DRAFT -> SENT -> PAID. New invoices default to 20% tax.
- Numbers: per-studio `InvoiceCounter`, bumped in the create transaction; never reused (no
  invoice delete).
- Money in whole pence; quantity in hundredths; tax rate in basis points.
- `src/components/data_table/presentation.tsx` (ours) renders `Cell` from `src/lib/ui/cell.ts`
  so rich cells sort and search by text.
- Tests have no database: separation is tested by mocking prisma and checking every query's
  organizationId.

## Before launch (done 2026-11-09)

- tests: e2e/signup, team, clients, invoices, separation specs (+ shared steps in e2e/studio.ts).
- browser-check: fixed phone sideways scroll (hidden table labels), line-field alignment, button
  link underline, Actions heading; `/welcome` now also asks "Your name" via `POST /api/studio`.
- security: all routes/pages checked; invoice amounts capped at GBP 20m (Int columns), price
  < 10m, quantity < 10,000.

## Known, accepted for this stage

- Any studio member can add colleagues (no roles, by design).
- The installed `POST /api/organizations` lets a signed-in person create extra organisations;
  the app only ever uses their first, so it reveals nothing.
- No rate limit per network address on adding colleagues or sign-in (hosting edge's job).
