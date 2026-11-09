<!-- shipyard:design -->

# project: design blueprint

*Shipyard writes the part between the `shipyard:design` markers from the approved pages, the theme and the installed parts, and rewrites it when they change. Add your decisions below the closing marker: they are kept.*

## Purpose

Let a small studio's team create, number and track invoices, with each studio's data kept completely separate.

Used by: Studios of two to ten people. The owner signs up for the studio and adds a colleague or two who also send invoices.

## Flows

1. An owner signs up, which creates their studio, and adds a colleague to the studio (name and email, with a starting password).
2. Anyone in the studio adds clients (name, email, address).
3. Anyone in the studio creates an invoice for a client with line items (description, quantity, unit price). The subtotal, a tax rate set per invoice, the tax and 
4. An invoice moves from draft to sent to paid, and the studio sees one list of invoices with what is unpaid first and the total still owed.

## Screens

1. **Sign up and sign in** (form) — An owner creates a studio; anyone in a studio signs in.
   One task, top to bottom: labels above fields, one primary button, errors next to the field. Buttons and messages from `ui_foundation`.
2. **Team** (table) — Add a colleague to the studio.
   A list people scan, sort and filter. Use the data table if it is installed. Built with `data_table`.
3. **Clients** (table) — The studio's clients; add and edit one.
   A list people scan, sort and filter. Use the data table if it is installed. Built with `data_table`.
4. **Invoices** (table) — Every invoice, unpaid first, with the total still owed.
   A list people scan, sort and filter. Use the data table if it is installed. Built with `data_table`.
5. **Invoice** (form) — Create or edit an invoice: client, line items, tax rate, worked-out totals, and its status.
   One task, top to bottom: labels above fields, one primary button, errors next to the field. Buttons and messages from `ui_foundation`.

## Frame and density

- Frame: a top bar with the app's name and one link per screen above (`ui_blocks` AppShell). No sidebar for this few screens.
- Each screen starts with its title and at most one primary action; other actions are quiet buttons.
- Lists are compact: one line per record, the columns people scan first on the left, actions at the end of the row.
- Forms are one column, labels above fields, the primary button at the end; errors sit next to their field.

## Tokens

Theme: **Calm** — The default. Quiet, high contrast, no personality — it gets out of the way.

Use these values through their CSS variables. Never write a colour, a radius or a spacing step by hand.

| Role | CSS variable | Light value |
| --- | --- | --- |
| bg | `var(--bg)` | `#ffffff` |
| surface | `var(--surface)` | `#f7f8fa` |
| fg | `var(--fg)` | `#14181f` |
| muted | `var(--muted)` | `#5b6472` |
| line | `var(--line)` | `#e3e7ec` |
| accent | `var(--accent)` | `#1f5fd0` |
| accentFg | `var(--accent-fg)` | `#ffffff` |
| focus | `var(--focus)` | `#1f5fd0` |
| ok | `var(--ok)` | `#e6f4ea` |
| okFg | `var(--ok-fg)` | `#1b5e34` |
| warn | `var(--warn)` | `#fdf3e0` |
| warnFg | `var(--warn-fg)` | `#7a4f0c` |
| danger | `var(--danger)` | `#fdecec` |
| dangerFg | `var(--danger-fg)` | `#96201f` |
| radius | `var(--radius)` | from the theme |
| space | `var(--space)` | from the theme |
| fontFamily | `var(--font-family)` | from the theme |
| fontSize | `var(--font-size)` | from the theme |
| lineHeight | `var(--line-height)` | from the theme |

The theme decides light and dark (dark follows the computer's setting, with the same variables). The page is `var(--bg)`; panels, cards and quiet buttons are `var(--surface)`. Those are the pairs the theme's contrast is checked on.

## Components in use

- **How the app looks** (`ui_foundation`): import as `docs/components/ui_foundation.md` shows; do not copy or edit its files. Use it for every button (`ui-button`), status message and focus ring. Adapt it through `src/theme.ts`.
- **The screens every app starts with** (`ui_blocks`): import as `docs/components/ui_blocks.md` shows; do not copy or edit its files. Use it for the frame (AppShell), every confirm or create dialog (Dialog), and number tiles (StatGrid) only on an approved dashboard screen. Adapt it through `src/components/ui_blocks/copy.ts`.
- **The screens people sign in on** (`auth_screens`): import as `docs/components/auth_screens.md` shows; do not copy or edit its files. It ships `/sign-in`, `/register`, `/forgot-password`, `/reset-password`: link to it only if a screen above needs it. Adapt it through `src/components/auth_screens/copy.ts`, `src/components/auth_screens/auth-screens.css`.
- **A list people can sort and search** (`data_table`): import as `docs/components/data_table.md` shows; do not copy or edit its files. Use it for every list of records: sorting, paging and its own empty state; never a hand-written `<table>`. Adapt it through `src/components/data_table/presentation.tsx`, `src/components/data_table/table.css`.

## States every screen has

- **Empty**: what this is for and what to do first; never a blank panel.
- **Loading**: say what is loading; never a frozen screen.
- **Some data**: the ordinary view.
- **Too much data**: a sixty-character name and a hundred rows still read; lists page or scroll.
- **Broken**: a plain sentence and a way to try again; never a stack trace or a dead end.

## Not in this version

- emailing invoices
- PDFs
- online payment
- more than one currency
- roles beyond "member of the studio".

No screen, field or action beyond the flows and screens above without asking the founder first.

## Accessibility

- Text contrast at least 4.5:1 and controls at least 3:1, in both light and dark.
- Everything works with the keyboard, and the focus is always visible (`var(--focus)`).
- Every field has a label; every icon-only button has a name.
- Meaning is never carried by colour alone; respect reduced motion.

## Rules for building screens

- Build each screen in the order above, sample data first, then the real data behind it.
- One look across the app: the variables above, the installed parts, nothing else.
- Avoid the generic AI look: gradients, glows, rows of identical cards, big number tiles nobody asked for.
- Before calling a screen done, check it against this file and say which section it meets.

<!-- /shipyard:design -->

## Decisions made while building

The UI designer adds what the generated part cannot know: the details of each screen, wording, and anything decided with the founder.

### The scene

The owner of a four-person design studio at their desk on the last Friday of the month, laptop
open beside a client file, daylight from a window, wanting to know in under a minute who still
owes them money and to get one more invoice out before the weekend. They visit a few times a
week and stay two or three minutes. So: the amount owed is the first thing on the first screen,
lists are compact, and the invoice screen reads like the invoice itself.

### What this must not look like

- **An accounting suite.** No dashboard of charts, ledgers, sidebars of twenty sections or
  "insights". These people left Word because accounting tools are too much; one list and one
  form is the product.
- **A creative portfolio site.** No big hero, no imagery, no playful type. It is a working tool
  that sits next to their real work, quiet enough to disappear.

The invoice screen is laid out like a printed invoice: who it is for at the top, the lines in
the middle, the totals bottom right. That is the one place with a recognisable shape.

### Colour

**Restrained**, on the Calm theme as it ships (`src/theme.ts` unchanged). Neutrals carry the
page; `var(--accent)` is only the one primary button on a screen, links, and the current
section in the top bar. Status meaning, always word + mark + colour through `Status`:

- Draft: `neutral` — "Draft"
- Sent: `warn` — "Sent, unpaid"
- Paid: `ok` — "Paid"

Errors use `var(--danger)` / `var(--danger-fg)` beside their field. The owed total is plain
`var(--fg)` text, large, not a coloured tile.

### Type

One family, the theme's. Hierarchy from size and weight: page title 1.75rem/700, section 1.125rem
/600, body 1rem, secondary 0.875rem in `var(--muted)`. Every amount uses
`font-variant-numeric: tabular-nums` and is right-aligned, so columns of money line up. Invoice
numbers are shown as `INV-0007` (four digits, zero-padded, grows past 9999).

### Motion

Nothing moves except what the installed parts already do (the dialog opening, toasts). Buttons
show busy wording while saving ("Saving…"). No transitions of our own, so reduced motion needs
nothing extra.

### Frame

The `ui_blocks` AppShell, restyled in `src/lib/ui/frame.css` into a top bar (not a sidebar):
links **Invoices · Clients · Team**. Above each page's title, one quiet line: the studio name,
"Signed in as {name or email}", and a quiet **Sign out** button. Content is at most 64rem wide.
At phone width the links wrap; tables scroll inside their own box, never the page.

### Screens

**Sign up / sign in** (installed `auth_screens`). Register heading: "Create your studio's
account". After the first sign-in, a person who belongs to no studio sees **Name your studio**:
"Studio name" (hint: "This is how your team will see it.") and "Your name" (the sign-up screen
does not ask for it), button "Create studio".
Then they land on Invoices.

**Invoices** (`/invoices`, home after sign-in). Title "Invoices", primary button "New invoice".
Under the title, one sentence in large type: "£2,340.00 still owed" and a muted line "across 3
sent invoices · 2 drafts not sent yet". Then the table (`DataTable`, caption "Every invoice,
unpaid first"): Number (link to the invoice) · Client · Status · Total · Created. Order: sent,
then drafts, then paid; newest first within each. Empty: "No invoices yet. Add a client, then
create your first invoice." with a link to the right next step.

**Invoice** (`/invoices/new`, `/invoices/{id}`). Title "New invoice" or "INV-0007" with its
status chip. Fields, top to bottom: Client (select; if there are none, a link "Add a client
first"), then the lines: a row per line with Description · Quantity · Unit price · Amount (worked
out, read-only) and a quiet "Remove" per row, then a quiet "Add a line". Tax rate (%) beneath,
then the totals block bottom right: Subtotal, Tax (20%), Total in bold. Totals update as they
type and are worked out again on the server when saved. Primary "Save draft" (new: "Create
invoice"). Status actions, quiet, beside it: on a draft "Mark as sent"; on a sent invoice "Mark
as paid". Once sent, the lines and tax are shown read-only with the note "This invoice has been
sent, so its lines can no longer change."

**Clients** (`/clients`). Title "Clients", primary "Add client" opens a `Dialog` (form kind):
Name, Email, Address (textarea), button "Save client". Table (caption "Your studio's clients"):
Name · Email · Address (first line) · Invoices · an "Edit" quiet button per row opening the same
dialog filled in. Empty: "No clients yet. Add the first one to start invoicing them."

**Team** (`/team`). Title "Team", primary "Add a colleague" opens a `Dialog`: Name, Email,
Starting password (with the password rule as a hint, and "Tell them this password yourself;
nothing is emailed."), button "Add to studio". Table (caption "People in your studio"): Name ·
Email · Joined. Every member can do everything; there are no roles to show.

### Wording

Plain and short. Buttons say what they do. Errors say what to change: "Please enter the client's
name.", "Each line needs a description." A failed save says "That did not save. Nothing has
changed; try again." and keeps what they typed.
