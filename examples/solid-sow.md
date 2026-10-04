Statement of Work: Order Portal
===============================

Prepared by Lanternfield Software (the supplier) for Brightmoor Bakery Supply (the client). Contact:
orders@brightmoor.example.com.

Background
----------

Brightmoor supplies flour, butter and packaging to 140 cafes. Cafes order by phone and email today, and the office
team types each order into the accounting system by hand.

## 1. Objectives

1. Cafes place and repeat orders online without calling the office.
2. Orders reach the accounting system without being typed again.
3. The office team sees open orders and stock in one admin area.

## 2. Scope

### 2.1 In scope

- Customer accounts with sign-in by email and password, and password reset.
- A product catalogue with the prices agreed for each customer.
- Order history and one-step reorder.
- An admin area for orders, customers, products and prices.
- An export of each confirmed order to the accounting system through its import API.

### 2.2 Out of scope

- Payments by card; cafes keep paying by invoice.
- Native phone apps; the portal is a web site that works in phone browsers.
- Moving order history from before the launch.

## 3. Deliverables

| ID | Deliverable | Form |
| --- | --- | --- |
| D1 | Order portal and admin area | Source code in the client's repository, deployed to the client's hosting account |
| D2 | Automated test suite | Tests in the same repository, run by the build on every change |
| D3 | Operations guide | Markdown files in the repository: deploy, back up, restore |
| D4 | Handover notes | One document after the handover call |

The "Fast reorder" button keeps its name from the current paper order form. The build runs this command:

```sh
npm test -- --reporter fast
```

## 4. Acceptance criteria

The client tests each deliverable within 10 working days of delivery and accepts it in writing, or lists the criteria
below that it does not meet.

- 95% of catalogue and order pages load in under 2 seconds on the client's test account with 500 products.
- An order confirmed in the portal appears in the accounting system within 5 minutes, checked with 50 test orders.
- `npm test` passes on the main branch with no skipped tests.
- The portal meets WCAG 2.2 level AA on the pages listed in the operations guide.
- Zero open defects of severity 1 or 2 at the time of acceptance.
- The admin area passes the "Month end" test script.

## 5. Change control

Either party can ask for a change in writing. The supplier answers within 5 working days with the effect on price and
schedule, and no change is made before both parties sign it.

## 6. Assumptions

- The accounting system's import API stays at the version in use when the work starts.
- The client gives the supplier a test account in the accounting system in week 1.

## 7. Client responsibilities

- Name one product owner who answers questions within 2 working days.
- Provide product data and customer prices as a spreadsheet by the end of week 2.

## 8. Roles and contacts

| Role | Name | Party |
| --- | --- | --- |
| Project lead | Mara Quinlan | Supplier |
| Product owner | Theo Brandt | Client |
| Technical contact | Ines Okafor | Client |

## 9. Milestones

1. Design approved: end of week 3.
2. Catalogue and orders on the test site: end of week 8.
3. Accounting export on the test site: end of week 11.
4. Launch: end of week 14.

## 10. Pricing and payment terms

The fixed price is EUR 42,000, paid in three parts of EUR 14,000 at milestones 1, 3 and 4. Invoices are due 30 days
after receipt.

## 11. Intellectual property

The client owns the source code and the documents of the deliverables from payment of each invoice. Open source
libraries keep their own licences, listed in the repository.

## 12. Confidentiality

Each party keeps the other's business information confidential during the work and for 3 years after it.

## 13. Data protection

The portal stores the names, email addresses and orders of cafe staff. The supplier processes them only to build and
test the portal, on the client's instructions, and signs the client's data processing agreement.

## 14. Security requirements

- Passwords are stored with a slow hash function, never in plain text.
- The portal is served over HTTPS only.
- The supplier fixes findings of the client's security test rated high or above before launch.

## 15. Warranty

For 90 days after launch the supplier fixes, at no charge, any defect where the portal does not meet the acceptance
criteria.

## 16. Support after delivery

After the warranty, support is available at EUR 95 per hour, with a reply to severity 1 reports within 4 working hours.

## 17. Governance and reporting

A 30-minute call every Tuesday reviews progress, risks and open questions. The supplier sends a written status report
every second Friday.

## 18. Dispute resolution

The project lead and the product owner meet within 5 working days of a written dispute. If they do not agree, the
managing directors meet within 10 working days.

## 19. Termination

Either party can end this statement of work with 30 days' written notice. The client pays for the work done up to the
end date, and the supplier hands over all work in progress.
