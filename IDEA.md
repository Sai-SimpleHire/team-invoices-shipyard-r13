# Team invoices

## The problem

Small design and marketing studios send invoices from Word templates. Numbers get reused, totals are added up by hand, and nobody can see which invoices are still unpaid without opening every file.

## Who has it

Studios of two to ten people. The owner signs up for the studio and adds a colleague or two who also send invoices.

## How they cope today

A folder of Word files and a spreadsheet of what has been paid.

## What else already does this

- FreeAgent — https://www.freeagent.com — full accounting, far more than they need. (unverified)
- Word templates and a spreadsheet.

## What is different about yours

Only invoicing, for a whole studio at once: clients, invoices with line items and correct totals, and one list of what is unpaid. Every studio's information is completely separate from every other studio's.

## The core flows

1. An owner signs up, which creates their studio, and adds a colleague to the studio (name and email, with a starting password).
2. Anyone in the studio adds clients (name, email, address).
3. Anyone in the studio creates an invoice for a client with line items (description, quantity, unit price). The subtotal, a tax rate set per invoice, the tax and the total are worked out by the app. Each invoice gets the studio's next invoice number, never reused.
4. An invoice moves from draft to sent to paid, and the studio sees one list of invoices with what is unpaid first and the total still owed.

## What is in the first version, and what is not

In: sign-up and sign-in, studios with more than one person, clients, invoices with line items, tax and totals, invoice numbers, the draft, sent and paid statuses, all saved in the database. Every studio sees only its own clients and invoices. Out: emailing invoices, PDFs, online payment, more than one currency, roles beyond "member of the studio".

## The riskiest assumptions

- Studios will move off Word templates for a tool that only does invoices. Test: five studios for one month.

## Still open

Nothing for the first version.
