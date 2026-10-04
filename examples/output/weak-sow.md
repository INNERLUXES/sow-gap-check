## sow-gap-check: FAIL - 17 findings at or above warning

- Document: examples/weak-sow.md (56 lines, 10 headings, 4 lists, 0 tables, 1 code block, 0 block quotes)
- Checklist: examples/config.json (Brightmoor review rules): 22 sections (11 required, 11 recommended), 50 vague phrases, 15 placeholders
- Rules: missing-section (required error, recommended notice); empty-section (warning); placeholder (warning); vague-wording (warning); unmeasurable-criterion (warning); no-out-of-scope (error)
- Results: 7 of 22 sections found, 2 empty, 13 missing
- Findings: 26 (4 error, 13 warning, 9 notice); fail level warning

### Findings

| Level | Rule | Found | Where |
| --- | --- | --- | --- |
| **error** | missing-section | required section Intellectual property and ownership is missing | examples/weak-sow.md |
| **error** | missing-section | required section Data protection is missing | examples/weak-sow.md |
| **error** | missing-section | required section Security requirements is missing | examples/weak-sow.md |
| **error** | no-out-of-scope | the scope is described under "2. Scope" (line 9), but there is no section Out of scope | examples/weak-sow.md:9:4 |
| warning | vague-wording | vague wording "fast" in "3. Deliverables": A fast, user-friendly web portal that works on phones. | examples/weak-sow.md:19:5 |
| warning | vague-wording | vague wording "user-friendly" in "3. Deliverables": A fast, user-friendly web portal that works on phones. | examples/weak-sow.md:19:11 |
| warning | vague-wording | vague wording "as needed" in "3. Deliverables": An admin area with reports as needed. | examples/weak-sow.md:20:30 |
| warning | vague-wording | vague wording "if possible" in "3. Deliverables": A link to the accounting system, if possible. | examples/weak-sow.md:21:36 |
| warning | vague-wording | vague wording "and so on" in "3. Deliverables": Documentation and so on. | examples/weak-sow.md:22:17 |
| warning | unmeasurable-criterion | acceptance criterion with nothing to measure in "4. Acceptance": The portal is easy to use for cafe staff. | examples/weak-sow.md:34:3 |
| warning | vague-wording | vague wording "easy to use" in "4. Acceptance": The portal is easy to use for cafe staff. | examples/weak-sow.md:34:17 |
| warning | unmeasurable-criterion | acceptance criterion with nothing to measure in "4. Acceptance": Pages load quickly. | examples/weak-sow.md:35:3 |
| warning | vague-wording | vague wording "quickly" in "4. Acceptance": Pages load quickly. | examples/weak-sow.md:35:14 |
| warning | unmeasurable-criterion | acceptance criterion with nothing to measure in "4. Acceptance": Orders reach the accounting system. | examples/weak-sow.md:36:3 |
| warning | empty-section | the heading "5. Timeline" holds nothing but TBD | examples/weak-sow.md:39:4 |
| warning | empty-section | the heading "7. Change requests" has no text under it | examples/weak-sow.md:47:4 |
| warning | placeholder | placeholder to be confirmed in "9. Support": Lanternfield will fix problems in a timely manner after launch, to be confirmed. | examples/weak-sow.md:56:65 |
| notice | missing-section | recommended section Background is missing | examples/weak-sow.md |
| notice | missing-section | recommended section Assumptions is missing | examples/weak-sow.md |
| notice | missing-section | recommended section Dependencies and client responsibilities is missing | examples/weak-sow.md |
| notice | missing-section | recommended section Confidentiality is missing | examples/weak-sow.md |
| notice | missing-section | recommended section Warranty and defects is missing | examples/weak-sow.md |
| notice | missing-section | recommended section Termination is missing | examples/weak-sow.md |
| notice | missing-section | recommended section Governance and reporting is missing | examples/weak-sow.md |
| notice | missing-section | recommended section Dispute resolution is missing | examples/weak-sow.md |
| notice | missing-section | recommended section Accessibility is missing | examples/weak-sow.md |

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: intellectual property, intellectual property rights, ip, ip rights, ip ownership, ownership, ownership of deliverables, licensing and 2 more
- Why: on the checklist because "All deliverables become the sole property of the United States Government."
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: data protection, personal data, privacy, data privacy, gdpr, processing of personal data and data processing
- Why: on the checklist because "Work on this project may require that personnel have access to Privacy Information."
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: security, security requirements, information security and access control
- Why: on the checklist because "Note: This requirement must be met on any procurement, IT, PS, etc., where the contractor will have access to government electronic information."
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

#### no-out-of-scope: examples/weak-sow.md:9:4

- Rule: the section In scope is there and holds text, and the section Out of scope is missing or empty
- Why: In scope is matched by the heading "2. Scope" through the alias scope, and holds text
- Why: no heading matches an alias of Out of scope: out of scope, outside scope, outside the scope, not in scope, exclusions, excluded and 3 more
- Why: what is not part of the work is then decided later, by whoever reads the scope
- Basis: "You'll agree the scope of the contract with the supplier before the buying process ends so you both know what the contract covers." (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)

#### vague-wording: examples/weak-sow.md:19:5

- Rule: a phrase of the list (50 phrases) in a paragraph, list item or table cell of a section marked for wording (Deliverables, Acceptance criteria), outside code, quotes and links
- Why: fast is on the list of vague phrases, and "3. Deliverables" matches Deliverables, a section marked for wording
- Why: two people can read it two ways, so it cannot decide whether the work is done
- Basis: "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Basis: "clear descriptions of the work that needs to be done" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)

#### vague-wording: examples/weak-sow.md:19:11

- Rule: a phrase of the list (50 phrases) in a paragraph, list item or table cell of a section marked for wording (Deliverables, Acceptance criteria), outside code, quotes and links
- Why: user-friendly is on the list of vague phrases, and "3. Deliverables" matches Deliverables, a section marked for wording
- Why: two people can read it two ways, so it cannot decide whether the work is done
- Basis: "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Basis: "clear descriptions of the work that needs to be done" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)

#### vague-wording: examples/weak-sow.md:20:30

- Rule: a phrase of the list (50 phrases) in a paragraph, list item or table cell of a section marked for wording (Deliverables, Acceptance criteria), outside code, quotes and links
- Why: as needed is on the list of vague phrases, and "3. Deliverables" matches Deliverables, a section marked for wording
- Why: two people can read it two ways, so it cannot decide whether the work is done
- Basis: "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Basis: "clear descriptions of the work that needs to be done" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)

#### vague-wording: examples/weak-sow.md:21:36

- Rule: a phrase of the list (50 phrases) in a paragraph, list item or table cell of a section marked for wording (Deliverables, Acceptance criteria), outside code, quotes and links
- Why: if possible is on the list of vague phrases, and "3. Deliverables" matches Deliverables, a section marked for wording
- Why: two people can read it two ways, so it cannot decide whether the work is done
- Basis: "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Basis: "clear descriptions of the work that needs to be done" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)

#### vague-wording: examples/weak-sow.md:22:17

- Rule: a phrase of the list (50 phrases) in a paragraph, list item or table cell of a section marked for wording (Deliverables, Acceptance criteria), outside code, quotes and links
- Why: and so on is on the list of vague phrases, and "3. Deliverables" matches Deliverables, a section marked for wording
- Why: two people can read it two ways, so it cannot decide whether the work is done
- Basis: "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Basis: "clear descriptions of the work that needs to be done" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)

#### unmeasurable-criterion: examples/weak-sow.md:34:3

- Rule: a list item with no list inside it, in a section marked for criteria (Acceptance criteria), that holds no digit, no number word, no code span, no named standard and no quoted name next to a test word
- Why: a list item under "4. Acceptance", which matches Acceptance criteria, a section marked for criteria
- Why: it holds no digit, no number word, no code span, no named standard and no quoted name next to a test word
- Basis: "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Basis: "All periodic reports and task deliverables shall be inspected, tested (where applicable), reviewed, and accepted by the Government within a reasonable period of time" (5.1.2 Inspection and Acceptance of Services, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)

#### vague-wording: examples/weak-sow.md:34:17

- Rule: a phrase of the list (50 phrases) in a paragraph, list item or table cell of a section marked for wording (Deliverables, Acceptance criteria), outside code, quotes and links
- Why: easy to use is on the list of vague phrases, and "4. Acceptance" matches Acceptance criteria, a section marked for wording
- Why: two people can read it two ways, so it cannot decide whether the work is done
- Basis: "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Basis: "clear descriptions of the work that needs to be done" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)

#### unmeasurable-criterion: examples/weak-sow.md:35:3

- Rule: a list item with no list inside it, in a section marked for criteria (Acceptance criteria), that holds no digit, no number word, no code span, no named standard and no quoted name next to a test word
- Why: a list item under "4. Acceptance", which matches Acceptance criteria, a section marked for criteria
- Why: it holds no digit, no number word, no code span, no named standard and no quoted name next to a test word
- Basis: "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Basis: "All periodic reports and task deliverables shall be inspected, tested (where applicable), reviewed, and accepted by the Government within a reasonable period of time" (5.1.2 Inspection and Acceptance of Services, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)

#### vague-wording: examples/weak-sow.md:35:14

- Rule: a phrase of the list (50 phrases) in a paragraph, list item or table cell of a section marked for wording (Deliverables, Acceptance criteria), outside code, quotes and links
- Why: quickly is on the list of vague phrases, and "4. Acceptance" matches Acceptance criteria, a section marked for wording
- Why: two people can read it two ways, so it cannot decide whether the work is done
- Basis: "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Basis: "clear descriptions of the work that needs to be done" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)

#### unmeasurable-criterion: examples/weak-sow.md:36:3

- Rule: a list item with no list inside it, in a section marked for criteria (Acceptance criteria), that holds no digit, no number word, no code span, no named standard and no quoted name next to a test word
- Why: a list item under "4. Acceptance", which matches Acceptance criteria, a section marked for criteria
- Why: it holds no digit, no number word, no code span, no named standard and no quoted name next to a test word
- Basis: "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Basis: "All periodic reports and task deliverables shall be inspected, tested (where applicable), reviewed, and accepted by the Government within a reasonable period of time" (5.1.2 Inspection and Acceptance of Services, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)

#### empty-section: examples/weak-sow.md:39:4

- Rule: a heading under which, down to the next heading at its level or above, there is no paragraph, list, table, code block or block quote, or where every piece of text is nothing but placeholders
- Why: the heading matches the checklist section Schedule and milestones
- Why: every piece of text under it is a placeholder once the placeholders are taken out
- Basis: "clear descriptions of the work that needs to be done" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)

#### empty-section: examples/weak-sow.md:47:4

- Rule: a heading under which, down to the next heading at its level or above, there is no paragraph, list, table, code block or block quote, or where every piece of text is nothing but placeholders
- Why: the heading matches the checklist section Change control
- Why: there is no paragraph, list, table, code block or block quote before the next heading at its level or above
- Basis: "clear descriptions of the work that needs to be done" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)

#### placeholder: examples/weak-sow.md:56:65

- Rule: a placeholder of the list (15 phrases) in a heading or in text of any section, outside code, quotes and links
- Why: to be confirmed is on the list of placeholders; the text around it is not written yet
- Basis: "clear descriptions of the work that needs to be done" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: background, context, introduction, overview, project background, project overview and about the project
- Why: on the checklist because "PROVIDE THE BACKGROUND INFORMATION THAT PROVIDES A HIGH LEVEL DESCRIPTION OF THE REQUIREMENT OF THE CLIENT." and "(4) Background;"
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: assumptions, assumption, constraints and operating constraints
- Why: on the checklist as the tool's own choice: FAR 37.602 names operating constraints; assumptions are the tool's own addition, because an assumption that is written down can be checked when it turns out wrong.
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: dependencies, dependency, client responsibilities, customer responsibilities, buyer responsibilities, client obligations, customer obligations, responsibilities of the client and 4 more
- Why: on the checklist because "DESCRIBE ALL GFE. INCLUDE WHAT IS BEING PROVIDED AND WHEN IT WILL BE PROVIDED."
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: confidentiality, confidential information, non disclosure, nondisclosure and nda
- Why: on the checklist as the tool's own choice: No saved page names confidentiality. The tool lists it because an outsourced team sees the client's code, data and plans, and the rules for that information belong in writing.
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: warranty, warranties, warranty period, defects, defect remediation, defect correction, bug fixing, bug fixes and 1 more
- Why: on the checklist because "Performance by the Contractor to correct defects found by the Government as a result of quality assurance surveillance and by the Contractor as a result of quality control"
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: termination, terminating the agreement, ending the contract, ending the agreement, exit, exit plan and cancellation
- Why: on the checklist because "You can end a contract for:"
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: governance, reporting, reports, status reporting, progress reporting, communication, communications, meetings and 4 more
- Why: on the checklist because "agree how you'll measure it upfront" and "meet regularly to discuss ongoing performance" and "The client representative will monitor compliance and report to the PM."
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: dispute resolution, disputes and dispute
- Why: on the checklist because "If you disagree with the supplier about the work that's being done and both parties have made all efforts to resolve the dispute, you should follow a dispute resolution process."
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

#### missing-section: examples/weak-sow.md

- Rule: a section of the checklist at level required (finding at error) or recommended (finding at notice) for which no heading of the document matches one of its aliases
- Why: no heading matches one of its aliases: accessibility and a11y
- Why: on the checklist because 
- Basis: "A statement of work should include:" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Basis: "The SOO shall, at a minimum, include-" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)

### Checklist

| Status | Level | Section | Headings |
| --- | --- | --- | --- |
| **missing** | recommended | Background | none |
| found | required | Objectives | line 5 "1. Goals" |
| found | required | In scope | line 9 "2. Scope" |
| **missing** | required | Out of scope | none |
| found | required | Deliverables | line 17 "3. Deliverables" |
| found | required | Acceptance criteria | line 30 "4. Acceptance" |
| empty | required | Change control | line 47 "7. Change requests" (empty) |
| **missing** | recommended | Assumptions | none |
| **missing** | recommended | Dependencies and client responsibilities | none |
| found | recommended | Roles and contacts | line 49 "8. Team" |
| empty | required | Schedule and milestones | line 39 "5. Timeline" (placeholder) |
| found | required | Pricing and payment terms | line 43 "6. Pricing" |
| **missing** | required | Intellectual property and ownership | none |
| **missing** | recommended | Confidentiality | none |
| **missing** | required | Data protection | none |
| **missing** | required | Security requirements | none |
| **missing** | recommended | Warranty and defects | none |
| found | recommended | Support after delivery | line 54 "9. Support" |
| **missing** | recommended | Termination | none |
| **missing** | recommended | Governance and reporting | none |
| **missing** | recommended | Dispute resolution | none |
| **missing** | recommended | Accessibility | none |

### Where the checklist comes from

- Background: "PROVIDE THE BACKGROUND INFORMATION THAT PROVIDES A HIGH LEVEL DESCRIPTION OF THE REQUIREMENT OF THE CLIENT." (1.0 BACKGROUND, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf); "(4) Background;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Objectives: "DESCRIBE WHAT THIS TASK WILL ACCOMPLISH. THIS SHOULD REFLECT THE END STATE THE CLIENT WANTS TO ACHIEVE." (2.0 OBJECTIVES, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf); "(1) Purpose;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602); "(5) Performance objectives, i.e., required results; and" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- In scope: "clear descriptions of the work that needs to be done" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract); "DESCRIBE THE TYPE OF WORK (RANGE OF TASKS) THE TASK ORDER WILL SUPPORT." (3.0 SCOPE, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf); "(2) Scope or mission;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Out of scope: the tool's own choice: No saved page names a list of what is excluded. The tool asks for it because work that is in scope only by silence is a frequent cause of disputes; the no-out-of-scope rule checks it next to the scope.
- Deliverables: "DESCRIBE ALL EXPECTED DELIVERABLES AND THE TIMEFRAME FOR THEIR DELIVERY." (5.1 Deliverables, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)
- Acceptance criteria: "All periodic reports and task deliverables shall be inspected, tested (where applicable), reviewed, and accepted by the Government within a reasonable period of time" (5.1.2 Inspection and Acceptance of Services, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf); "DESCRIBE ACCEPTANCE CRITERIA AS APPLICABLE TO THE TASK." (5.1.2 Inspection and Acceptance of Services, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf); "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
- Change control: "You must complete a contract change notice (CCN) if:" (Changes to contracts, https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Assumptions: "(6) Any operating constraints." (37.602 Performance work statement., https://www.acquisition.gov/far/37.602); the tool's own choice: FAR 37.602 names operating constraints; assumptions are the tool's own addition, because an assumption that is written down can be checked when it turns out wrong.
- Dependencies and client responsibilities: "DESCRIBE ALL GFE. INCLUDE WHAT IS BEING PROVIDED AND WHEN IT WILL BE PROVIDED." (6.6.9 Government Furnished Items, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)
- Roles and contacts: "a list of people needed to do the work" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract); "1.0 POINTS OF CONTACT." (APPENDIX A, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)
- Schedule and milestones: "how long the work should take" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract); "(3) Period and place of performance;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602); "The POP for this task is a \[#-MONTH BASE + #/DURATION OF OPTIONS\]." (6.2 Period of Performance (POP) and FAR Clauses in Full Text or by Reference, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)
- Pricing and payment terms: "how the buyer will pay for the work, using either the 'fixed price', 'time and materials' or 'capped time and materials' approach" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract); "how much the work will cost" (Understanding the contract scope and writing 'statements of work', https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract); "The contractor shall submit only one invoice per month per order/contract." (7.0 INVOICING/ PROCEDURES FOR PAYMENT, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)
- Intellectual property and ownership: "All deliverables become the sole property of the United States Government." (6.6.8 Records/Data, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)
- Confidentiality: the tool's own choice: No saved page names confidentiality. The tool lists it because an outsourced team sees the client's code, data and plans, and the rules for that information belong in writing.
- Data protection: "Work on this project may require that personnel have access to Privacy Information." (6.6.5 Privacy Act, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)
- Security requirements: "Note: This requirement must be met on any procurement, IT, PS, etc., where the contractor will have access to government electronic information." (6.4 Security, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)
- Warranty and defects: "Performance by the Contractor to correct defects found by the Government as a result of quality assurance surveillance and by the Contractor as a result of quality control" (5.1.2 Inspection and Acceptance of Services, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)
- Support after delivery: the tool's own choice: No saved page names support after delivery. The GSA template asks for a transition plan out of the task order, which is close but not the same; the tool lists support because who fixes what after the handover is a frequent question at the end of an outsourced project.
- Termination: "You can end a contract for:" (Ending a contract, https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Governance and reporting: "agree how you'll measure it upfront" (How to manage supplier performance, https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract); "meet regularly to discuss ongoing performance" (How to manage supplier performance, https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract); "The client representative will monitor compliance and report to the PM." (5.1.2 Inspection and Acceptance of Services, https://buy.gsa.gov/api/system/files/documents/Sch\_70\_SOW\_PWS\_TaskOrder\_Template\_opt.pdf)
- Dispute resolution: "If you disagree with the supplier about the work that's being done and both parties have made all efforts to resolve the dispute, you should follow a dispute resolution process." (Dispute resolution, https://www.gov.uk/guidance/how-to-manage-your-digital-outcomes-and-specialists-contract)
- Accessibility: added by the configuration

This report checks the structure and the wording of the document only. It is not a legal review and gives no legal advice.
