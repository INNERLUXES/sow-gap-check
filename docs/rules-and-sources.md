# Rules and sources

Every sentence the tool quotes, in a report or in these documents, comes from a page that was opened and saved as plain text in `research/sources`, with its address on the first line. `src/data.js` holds the sentences, and `test/data.test.js` compares each one with the saved page, word for word, with runs of white space read as one space. It also checks that every sentence these documents put in double quotes is on a saved page.

## The saved pages

| File | Page | What is quoted |
| --- | --- | --- |
| `commonmark-headings-and-blocks.txt` | CommonMark Spec 0.31.2, https://spec.commonmark.org/0.31.2/ | the prose of sections 4.2 ATX headings, 4.3 Setext headings, 4.4 Indented code blocks, 4.5 Fenced code blocks and 5.1 Block quotes, without the numbered examples |
| `gfm-tables.txt` | GitHub Flavored Markdown Spec, https://github.github.com/gfm/ | the prose of section 4.10 Tables (extension), without the numbered examples |
| `gsa-sow-pws-template.txt` | U.S. General Services Administration, Schedule 70 task order template for a Statement of Work/Performance Work Statement (SOW/PWS), https://buy.gsa.gov/api/system/files/documents/Sch_70_SOW_PWS_TaskOrder_Template_opt.pdf | the headings of the template and the text of the sections that say what an SOW/PWS holds |
| `far-37-602-performance-work-statement.txt` | Federal Acquisition Regulation 37.602, Performance work statement, on Acquisition.GOV, https://www.acquisition.gov/far/37.602 | the whole section, with the list of what a statement of objectives holds at a minimum |
| `gov-uk-dos-manage-contract.txt` | GOV.UK, Government Digital Service: How to manage your Digital Outcomes and Specialists contract, https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract | the text of the guidance, with the list of what a statement of work should include |
| `rfc8259-json-objects.txt` | RFC 8259, The JSON Data Interchange Format, https://www.rfc-editor.org/rfc/rfc8259 | section 4, objects and repeated names |

Notes on the pages:

- The GOV.UK page is marked on GOV.UK as withdrawn: "This page has been withdrawn as it is out of date." It is kept as a published government description of what a statement of work holds, not as current buying rules, and the reports name it with the word withdrawn in its label.
- The GSA template is a PDF file of instructions to the person who fills it in, many of them written in capitals. Its page headers, the clauses it quotes in full, its tables of examples and its appendixes on quotes and invoices are left out of the saved text, and `[...]` marks every cut.
- The two specs are saved as their prose. The numbered examples hold Markdown and HTML that the tests of this repository cover in their own way.
- Typographic quotes, apostrophes and dashes are saved as their nearest ASCII characters; the first lines of each saved page say so.

## The rules

| Rule | Key | Sentences | Method |
| --- | --- | --- | --- |
| `missing-section` | `rules.missingSection` | `ukShouldInclude`, `farSoo` | [missing-section](method.md#missing-section) |
| `empty-section` | `rules.emptySection` | `ukWork` | [empty-section](method.md#empty-section) |
| `placeholder` | `rules.placeholder` | `ukWork` | [placeholder](method.md#placeholder) |
| `vague-wording` | `rules.vagueWording` | `farMeasurable`, `ukWork` | [vague-wording](method.md#vague-wording) |
| `unmeasurable-criterion` | `rules.unmeasurableCriterion` | `farMeasurable`, `gsaInspection` | [unmeasurable-criterion](method.md#unmeasurable-criterion) |
| `no-out-of-scope` | `rules.noOutOfScope` | `ukScope` | [no-out-of-scope](method.md#no-out-of-scope) |

`--explain` prints the sentences of each rule under its findings, with the section and the page. The sentences say why a rule is worth running; none of the pages defines the rule itself. The lists of vague phrases and placeholders, the measurable elements of an acceptance criterion, and the no-out-of-scope rule as a rule of its own are the tool's own choices.

## The default checklist

Where each section of the default checklist comes from. A section with sentences is named, in so many words or as a heading, by one of the saved pages. A section marked as the tool's own choice is named by none of them; its reason is in `src/defaults.js` and in the report with `--explain`.

| Section | Title | Level | Sentences | Note |
| --- | --- | --- | --- | --- |
| `background` | Background | recommended | `gsaBackground`, `farBackground` | heading 1.0 of the GSA template; item (4) of the FAR list |
| `objectives` | Objectives | required | `gsaObjectives`, `farPurpose`, `farObjectives` | heading 2.0 of the GSA template; items (1) and (5) of the FAR list |
| `inScope` | In scope | required | `ukWork`, `gsaScope`, `farScope` | the first item of the GOV.UK list; heading 3.0 of the GSA template; item (2) of the FAR list |
| `outOfScope` | Out of scope | required | none | the tool's own choice: no page names a list of what is excluded |
| `deliverables` | Deliverables | required | `gsaDeliverables` | heading 5.1 of the GSA template |
| `acceptance` | Acceptance criteria | required | `gsaInspection`, `gsaAcceptance`, `farMeasurable` | heading 5.1.2 of the GSA template; FAR 37.602(b)(2) |
| `changeControl` | Change control | required | `ukChangeNotice` | the GOV.UK section Changes to contracts |
| `assumptions` | Assumptions | recommended | `farConstraints` | item (6) of the FAR list names operating constraints; assumptions are the tool's own addition |
| `clientResponsibilities` | Dependencies and client responsibilities | recommended | `gsaFurnished` | heading 6.6.9 of the GSA template, the items the government furnishes |
| `roles` | Roles and contacts | recommended | `ukPeople`, `gsaContacts` | the third item of the GOV.UK list; Appendix A of the GSA template |
| `schedule` | Schedule and milestones | required | `ukHowLong`, `farPeriod`, `gsaPeriod` | the second item of the GOV.UK list; item (3) of the FAR list; heading 6.2 of the GSA template |
| `pricing` | Pricing and payment terms | required | `ukPay`, `ukCost`, `gsaInvoice` | the fourth and fifth items of the GOV.UK list; heading 7.0 of the GSA template |
| `intellectualProperty` | Intellectual property and ownership | recommended | `gsaProperty` | heading 6.6.8 of the GSA template |
| `confidentiality` | Confidentiality | recommended | none | the tool's own choice: no page names it |
| `dataProtection` | Data protection | recommended | `gsaPrivacy` | heading 6.6.5 of the GSA template, the Privacy Act |
| `security` | Security requirements | recommended | `gsaSecurity` | heading 6.4 of the GSA template |
| `warranty` | Warranty and defects | recommended | `gsaDefects` | the correction of defects in heading 5.1.2 of the GSA template |
| `support` | Support after delivery | recommended | none | the tool's own choice: the GSA transition plan out of the task order is close but not the same |
| `termination` | Termination | recommended | `ukEnd` | the GOV.UK section Ending a contract |
| `governance` | Governance and reporting | recommended | `ukMeasure`, `ukMeet`, `gsaMonitor` | the GOV.UK section How to manage supplier performance; heading 5.1.2 of the GSA template |
| `disputes` | Dispute resolution | recommended | `ukDispute` | the GOV.UK section Dispute resolution |

The levels are the tool's own choice. The eight required sections are the ones that the GOV.UK list or the FAR list names (the work, how long it takes, how it is paid, and the purpose and scope), the deliverables and their acceptance that the GSA template asks for, change control, and the out-of-scope section that the no-out-of-scope rule looks for. Every level can be changed in the configuration.

## Every quoted sentence

| Key | Used by | Sentence | Section | Page |
| --- | --- | --- | --- | --- |
| `ukShouldInclude` | `missing-section` | A statement of work should include: | Understanding the contract scope and writing 'statements of work' | gov-uk |
| `ukWork` | `empty-section`, `placeholder`, `vague-wording`, the section `inScope` | clear descriptions of the work that needs to be done | Understanding the contract scope and writing 'statements of work' | gov-uk |
| `ukHowLong` | the section `schedule` | how long the work should take | Understanding the contract scope and writing 'statements of work' | gov-uk |
| `ukPeople` | the section `roles` | a list of people needed to do the work | Understanding the contract scope and writing 'statements of work' | gov-uk |
| `ukPay` | the section `pricing` | how the buyer will pay for the work, using either the 'fixed price', 'time and materials' or 'capped time and materials' approach | Understanding the contract scope and writing 'statements of work' | gov-uk |
| `ukCost` | the section `pricing` | how much the work will cost | Understanding the contract scope and writing 'statements of work' | gov-uk |
| `ukScope` | `no-out-of-scope` | You'll agree the scope of the contract with the supplier before the buying process ends so you both know what the contract covers. | Understanding the contract scope and writing 'statements of work' | gov-uk |
| `ukChangeNotice` | the section `changeControl` | You must complete a contract change notice (CCN) if: | Changes to contracts | gov-uk |
| `ukMeasure` | the section `governance` | agree how you'll measure it upfront | How to manage supplier performance | gov-uk |
| `ukMeet` | the section `governance` | meet regularly to discuss ongoing performance | How to manage supplier performance | gov-uk |
| `ukDispute` | the section `disputes` | If you disagree with the supplier about the work that's being done and both parties have made all efforts to resolve the dispute, you should follow a dispute resolution process. | Dispute resolution | gov-uk |
| `ukEnd` | the section `termination` | You can end a contract for: | Ending a contract | gov-uk |
| `ukWithdrawn` | this document | This page has been withdrawn as it is out of date. | How to manage your Digital Outcomes and Specialists contract | gov-uk |
| `farMeasurable` | `vague-wording`, `unmeasurable-criterion`, the section `acceptance` | Enable assessment of work performance against measurable performance standards; | 37.602 Performance work statement. | far |
| `farSoo` | `missing-section` | The SOO shall, at a minimum, include- | 37.602 Performance work statement. | far |
| `farPurpose` | the section `objectives` | (1) Purpose; | 37.602 Performance work statement. | far |
| `farScope` | the section `inScope` | (2) Scope or mission; | 37.602 Performance work statement. | far |
| `farPeriod` | the section `schedule` | (3) Period and place of performance; | 37.602 Performance work statement. | far |
| `farBackground` | the section `background` | (4) Background; | 37.602 Performance work statement. | far |
| `farObjectives` | the section `objectives` | (5) Performance objectives, i.e., required results; and | 37.602 Performance work statement. | far |
| `farConstraints` | the section `assumptions` | (6) Any operating constraints. | 37.602 Performance work statement. | far |
| `gsaBackground` | the section `background` | PROVIDE THE BACKGROUND INFORMATION THAT PROVIDES A HIGH LEVEL DESCRIPTION OF THE REQUIREMENT OF THE CLIENT. | 1.0 BACKGROUND | gsa |
| `gsaObjectives` | the section `objectives` | DESCRIBE WHAT THIS TASK WILL ACCOMPLISH. THIS SHOULD REFLECT THE END STATE THE CLIENT WANTS TO ACHIEVE. | 2.0 OBJECTIVES | gsa |
| `gsaScope` | the section `inScope` | DESCRIBE THE TYPE OF WORK (RANGE OF TASKS) THE TASK ORDER WILL SUPPORT. | 3.0 SCOPE | gsa |
| `gsaDeliverables` | the section `deliverables` | DESCRIBE ALL EXPECTED DELIVERABLES AND THE TIMEFRAME FOR THEIR DELIVERY. | 5.1 Deliverables | gsa |
| `gsaInspection` | `unmeasurable-criterion`, the section `acceptance` | All periodic reports and task deliverables shall be inspected, tested (where applicable), reviewed, and accepted by the Government within a reasonable period of time | 5.1.2 Inspection and Acceptance of Services | gsa |
| `gsaAcceptance` | the section `acceptance` | DESCRIBE ACCEPTANCE CRITERIA AS APPLICABLE TO THE TASK. | 5.1.2 Inspection and Acceptance of Services | gsa |
| `gsaDefects` | the section `warranty` | Performance by the Contractor to correct defects found by the Government as a result of quality assurance surveillance and by the Contractor as a result of quality control | 5.1.2 Inspection and Acceptance of Services | gsa |
| `gsaMonitor` | the section `governance` | The client representative will monitor compliance and report to the PM. | 5.1.2 Inspection and Acceptance of Services | gsa |
| `gsaPeriod` | the section `schedule` | The POP for this task is a [#-MONTH BASE + #/DURATION OF OPTIONS]. | 6.2 Period of Performance (POP) and FAR Clauses in Full Text or by Reference | gsa |
| `gsaSecurity` | the section `security` | Note: This requirement must be met on any procurement, IT, PS, etc., where the contractor will have access to government electronic information. | 6.4 Security | gsa |
| `gsaTransition` | docs/method.md (support after delivery) | The contractor shall provide a transition plan that outlines the designated time period and strategy to transition into the duties as the contractor and to transition out of the task order at the end of the period of performance. | 6.6.3 Transition Plan (Phase In and Out of Task Order) | gsa |
| `gsaPrivacy` | the section `dataProtection` | Work on this project may require that personnel have access to Privacy Information. | 6.6.5 Privacy Act | gsa |
| `gsaProperty` | the section `intellectualProperty` | All deliverables become the sole property of the United States Government. | 6.6.8 Records/Data | gsa |
| `gsaFurnished` | the section `clientResponsibilities` | DESCRIBE ALL GFE. INCLUDE WHAT IS BEING PROVIDED AND WHEN IT WILL BE PROVIDED. | 6.6.9 Government Furnished Items | gsa |
| `gsaInvoice` | the section `pricing` | The contractor shall submit only one invoice per month per order/contract. | 7.0 INVOICING/ PROCEDURES FOR PAYMENT | gsa |
| `gsaContacts` | the section `roles` | 1.0 POINTS OF CONTACT. | APPENDIX A | gsa |
| `atxOpening` | the Markdown reader | The opening sequence of # characters must be followed by spaces or tabs, or by the end of line. | 4.2 ATX headings | commonmark |
| `atxIndent` | the Markdown reader | The opening # character may be preceded by up to three spaces of indentation. | 4.2 ATX headings | commonmark |
| `atxLevel` | the Markdown reader | The heading level is equal to the number of # characters in the opening sequence. | 4.2 ATX headings | commonmark |
| `setextUnderline` | the Markdown reader | A setext heading underline is a sequence of = characters or a sequence of - characters, with no more than 3 spaces of indentation and any number of trailing spaces or tabs. | 4.3 Setext headings | commonmark |
| `setextLevel` | the Markdown reader | The heading is a level 1 heading if = characters are used in the setext heading underline, and a level 2 heading if - characters are used. | 4.3 Setext headings | commonmark |
| `indentedCode` | the Markdown reader | An indented chunk is a sequence of non-blank lines, each preceded by four or more spaces of indentation. | 4.4 Indented code blocks | commonmark |
| `fenceOpen` | the Markdown reader | A code fence is a sequence of at least three consecutive backtick characters (`) or tildes (~). | 4.5 Fenced code blocks | commonmark |
| `fenceLiteral` | the Markdown reader, code is never read for words | The content of a code fence is treated as literal text, not parsed as inlines. | 4.5 Fenced code blocks | commonmark |
| `fenceUnclosed` | the Markdown reader, the note of an unclosed fence | If the end of the containing block (or document) is reached and no closing code fence has been found, the code block contains all of the lines after the opening code fence until the end of the containing block (or document). | 4.5 Fenced code blocks | commonmark |
| `tableDelimiter` | the Markdown reader | The delimiter row consists of cells whose only content are hyphens (-), and optionally, a leading or trailing colon (:), or both, to indicate left, right, or center alignment respectively. | 4.10 Tables (extension) | gfm |
| `tableHeader` | the Markdown reader | The header row must match the delimiter row in the number of cells. | 4.10 Tables (extension) | gfm |
| `jsonUnpredictable` | the JSON reader | When the names within an object are not unique, the behavior of software that receives such an object is unpredictable. | 4. Objects | rfc8259 |

## What no page says

These are the choices of the tool, each explained in docs/method.md or docs/decisions:

- the sections out of scope, confidentiality and support after delivery, and the assumptions next to the operating constraints;
- the level of each section, required or recommended;
- the aliases of each section, and taking the longest alias first;
- the lists of vague phrases and placeholders, and reading them only outside code, quotes, block quotes and links;
- reading vague phrases only in the sections marked for wording, deliverables and acceptance criteria by default;
- what counts as a measurable element of an acceptance criterion: a digit, a number word, a code span, a named standard, or a quoted name next to a test word;
- the no-out-of-scope rule;
- reading headings and phrases, never the meaning of a sentence, and giving no legal advice ([the decision](decisions/0001-read-headings-not-meaning-and-give-no-legal-advice.md)).

Add a rule, a section or a sentence only after opening the page, saving its text in `research/sources` and quoting it word for word. If a page cannot be opened, do not cite it.
