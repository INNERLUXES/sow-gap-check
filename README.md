# sow-gap-check

Checks a statement of work for an outsourced software project, written in Markdown, for the gaps that cause disputes later: sections that are missing, headings with nothing under them, placeholders such as TBD, vague words in the deliverables and the acceptance criteria, acceptance criteria with nothing to measure, and a scope that never says what is out of scope. It reads the headings and the text of the document, lists each gap with its line and column, and exits with a code a pipeline can act on.

It checks the structure and the wording of the document only. **It is not a legal review and gives no legal advice**: it does not read what a sentence means, whether a term is fair or what law applies. Every report ends with a sentence that says so.

Public-sector guidance says what a statement of work holds. The GOV.UK guidance of the Government Digital Service lists it: "A statement of work should include:" followed by "clear descriptions of the work that needs to be done", how long the work should take, "a list of people needed to do the work", how the buyer will pay and how much the work will cost. The Federal Acquisition Regulation asks to "Enable assessment of work performance against measurable performance standards;". This tool turns that into a checklist and a few narrow rules you can run on every change to a contract.

- **A checklist of 21 sections, each with its source.** Objectives, in scope, out of scope, deliverables, acceptance criteria, change control, schedule and milestones, pricing and payment terms (required), and background, assumptions, client responsibilities, roles and contacts, intellectual property, confidentiality, data protection, security, warranty, support, termination, governance and dispute resolution (recommended). Each one names the sentence of a saved government page it comes from, or is marked as the tool's own choice.
- **Matched by headings, explained.** A heading matches a section when the words of one of its aliases stand together in it, after numbering, case and punctuation are left out, the longest alias first. `--explain` shows every alias that was looked for.
- **Vague words where they hurt.** `fast`, `user-friendly`, `as needed`, `etc.`, `best effort` and 43 more phrases are looked for in the deliverables and the acceptance criteria only, never inside code, code spans, quotes, block quotes or links, with the line and the column.
- **Acceptance criteria you can check.** A criterion with no number, no number word, no code span, no named standard and no quoted test name is reported. The rule is conservative on purpose.
- **Everything is yours to change.** Every section, alias, level and list of phrases can be changed in a configuration file; `--print-defaults` writes the defaults out as one. A key the tool does not know is an error.
- **Reads, never runs.** No link of the document is opened, nothing is fetched, nothing is written but the report `--out` names. Binary, UTF-16 and invalid UTF-8 input is refused.
- Reports as text, Markdown and JSON, with an exit code for a pipeline: `0` no finding at or above the fail level, `1` a finding at or above it, `2` usage or input error.
- Plain JavaScript, no dependencies.

```
npm test
```

```
tests 140
pass 138
fail 0
skipped 2
```

These are the summary lines that `npm test` prints at the end on Windows. The skipped tests are the ones that need a symbolic link or a device (a link to `/dev/zero` named as the document, and a link to a regular file); they are guarded with `process.platform`, run on Linux and macOS, and none of them asserts a line or a column. `npm run test:coverage` runs the same tests with coverage; their time limits are four times wider when coverage is on.

## Quick start

Requires Node 22 or newer. There is nothing to install.

```
git clone https://github.com/INNERLUXES/sow-gap-check.git
cd sow-gap-check
node bin/sow-gap-check.js examples/weak-sow.md --config examples/config.json
```

Or without a clone, on your own document:

```
npx --yes github:INNERLUXES/sow-gap-check contracts/sow.md
```

`examples/` holds two made-up statements of work for an order portal that a software supplier builds for a bakery wholesaler, both on `example.com`, and a configuration that makes security, data protection and intellectual property required and adds a section for accessibility. The weak one has goals, a scope and deliverables but no out-of-scope section, vague deliverables, acceptance criteria that cannot be measured, a timeline that says TBD and an empty change section. The solid one has every section, with numbers in its acceptance criteria.

## Usage

```
sow-gap-check <file.md> [--config <file>] [options]
```

```
--config <file>           a configuration file (JSON) that changes the checklist, the phrases or the rules
                          (default: the built-in checklist; --print-defaults shows it)
--format <name>           text, markdown or json (default: text)
--explain                 show the rule, the reasons and the sentences behind each finding, and where each section
                          of the checklist comes from
--fail-on <level>         the lowest level of a finding that fails the run: notice, warning, error (default: failOn of
                          the configuration, else warning)
--out <file>              write the report to this file instead of the screen
--print-defaults          print the built-in configuration as a configuration file and exit
--help                    show the usage
--version                 show the version
```

Paths in the report are relative to the folder you run the command in, with forward slashes on every system, followed by the line and the column of the finding. A column counts characters from 1 in the line as written, a tab as one.

The report of the weak example starts with what was read and the counts, then the findings, then the checklist with the heading that matched each section:

```
sow-gap-check: examples/weak-sow.md
document: examples/weak-sow.md (56 lines, 10 headings, 4 lists, 0 tables, 1 code block, 0 block quotes)
checklist: examples/config.json (Brightmoor review rules): 22 sections (11 required, 11 recommended), 50 vague phrases, 15 placeholders
rules: missing-section (required error, recommended notice); empty-section (warning); placeholder (warning); vague-wording (warning); unmeasurable-criterion (warning); no-out-of-scope (error)
results: 7 of 22 sections found, 2 empty, 13 missing
findings: 26 (4 error, 13 warning, 9 notice); fail level warning

Findings (26)

  ERROR    missing-section         examples/weak-sow.md
           required section Intellectual property and ownership is missing

  ERROR    missing-section         examples/weak-sow.md
           required section Data protection is missing

  ERROR    missing-section         examples/weak-sow.md
           required section Security requirements is missing

  ERROR    no-out-of-scope         examples/weak-sow.md:9:4
           the scope is described under "2. Scope" (line 9), but there is no section Out of scope

  WARNING  vague-wording           examples/weak-sow.md:19:5
           vague wording "fast" in "3. Deliverables": A fast, user-friendly web portal that works on phones.

  WARNING  vague-wording           examples/weak-sow.md:19:11
           vague wording "user-friendly" in "3. Deliverables": A fast, user-friendly web portal that works on phones.

  WARNING  vague-wording           examples/weak-sow.md:20:30
           vague wording "as needed" in "3. Deliverables": An admin area with reports as needed.

  WARNING  vague-wording           examples/weak-sow.md:21:36
           vague wording "if possible" in "3. Deliverables": A link to the accounting system, if possible.

  WARNING  vague-wording           examples/weak-sow.md:22:17
           vague wording "and so on" in "3. Deliverables": Documentation and so on.

  WARNING  unmeasurable-criterion  examples/weak-sow.md:34:3
           acceptance criterion with nothing to measure in "4. Acceptance": The portal is easy to use for cafe staff.

  WARNING  vague-wording           examples/weak-sow.md:34:17
           vague wording "easy to use" in "4. Acceptance": The portal is easy to use for cafe staff.

  WARNING  unmeasurable-criterion  examples/weak-sow.md:35:3
           acceptance criterion with nothing to measure in "4. Acceptance": Pages load quickly.

  WARNING  vague-wording           examples/weak-sow.md:35:14
           vague wording "quickly" in "4. Acceptance": Pages load quickly.

  WARNING  unmeasurable-criterion  examples/weak-sow.md:36:3
           acceptance criterion with nothing to measure in "4. Acceptance": Orders reach the accounting system.

  WARNING  empty-section           examples/weak-sow.md:39:4
           the heading "5. Timeline" holds nothing but TBD

  WARNING  empty-section           examples/weak-sow.md:47:4
           the heading "7. Change requests" has no text under it

  WARNING  placeholder             examples/weak-sow.md:56:65
           placeholder to be confirmed in "9. Support": Lanternfield will fix problems in a timely manner after launch, to be confirmed.

  NOTICE   missing-section         examples/weak-sow.md
           recommended section Background is missing

  NOTICE   missing-section         examples/weak-sow.md
           recommended section Assumptions is missing

  NOTICE   missing-section         examples/weak-sow.md
           recommended section Dependencies and client responsibilities is missing

  NOTICE   missing-section         examples/weak-sow.md
           recommended section Confidentiality is missing

  NOTICE   missing-section         examples/weak-sow.md
           recommended section Warranty and defects is missing

  NOTICE   missing-section         examples/weak-sow.md
           recommended section Termination is missing

  NOTICE   missing-section         examples/weak-sow.md
           recommended section Governance and reporting is missing

  NOTICE   missing-section         examples/weak-sow.md
           recommended section Dispute resolution is missing

  NOTICE   missing-section         examples/weak-sow.md
           recommended section Accessibility is missing

Checklist (22)

  missing  recommended  Background
  found    required     Objectives                                line 5 "1. Goals"
  found    required     In scope                                  line 9 "2. Scope"
  missing  required     Out of scope
  found    required     Deliverables                              line 17 "3. Deliverables"
  found    required     Acceptance criteria                       line 30 "4. Acceptance"
  empty    required     Change control                            line 47 "7. Change requests" (empty)
  missing  recommended  Assumptions
  missing  recommended  Dependencies and client responsibilities
  found    recommended  Roles and contacts                        line 49 "8. Team"
  empty    required     Schedule and milestones                   line 39 "5. Timeline" (placeholder)
  found    required     Pricing and payment terms                 line 43 "6. Pricing"
  missing  required     Intellectual property and ownership
  missing  recommended  Confidentiality
  missing  required     Data protection
  missing  required     Security requirements
  missing  recommended  Warranty and defects
  found    recommended  Support after delivery                    line 54 "9. Support"
  missing  recommended  Termination
  missing  recommended  Governance and reporting
  missing  recommended  Dispute resolution
  missing  recommended  Accessibility

This report checks the structure and the wording of the document only. It is not a legal review and gives no legal advice.

RESULT: FAIL - 17 findings at or above warning
```

The exit code is `1`: four findings are errors and thirteen are warnings, and the configuration fails on `warning`. The nine notices are recommended sections that are missing; they are shown and do not fail the run. Nothing is reported for the button whose name is in quotes, the `reorder-mode: fast` line in the code block, or the criterion that names its test script in quotes.

`--explain` shows the rule, the reasons and the sentences behind each finding; for the criterion on line 36:

```
  WARNING  unmeasurable-criterion  examples/weak-sow.md:36:3
           acceptance criterion with nothing to measure in "4. Acceptance": Orders reach the accounting system.
           rule: a list item with no list inside it, in a section marked for criteria (Acceptance criteria), that holds no digit, no number word, no code span, no named standard and no quoted name next to a test word
           why: a list item under "4. Acceptance", which matches Acceptance criteria, a section marked for criteria
           why: it holds no digit, no number word, no code span, no named standard and no quoted name next to a test word
           basis: "Enable assessment of work performance against measurable performance standards;" (37.602 Performance work statement., https://www.acquisition.gov/far/37.602)
           basis: "All periodic reports and task deliverables shall be inspected, tested (where applicable), reviewed, and accepted by the Government within a reasonable period of time" (5.1.2 Inspection and Acceptance of Services, https://buy.gsa.gov/api/system/files/documents/Sch_70_SOW_PWS_TaskOrder_Template_opt.pdf)
```

The solid example passes, with one notice for the accessibility section that the configuration added:

```
sow-gap-check: examples/solid-sow.md
document: examples/solid-sow.md (139 lines, 23 headings, 8 lists, 2 tables, 1 code block, 0 block quotes)
checklist: examples/config.json (Brightmoor review rules): 22 sections (11 required, 11 recommended), 50 vague phrases, 15 placeholders
rules: missing-section (required error, recommended notice); empty-section (warning); placeholder (warning); vague-wording (warning); unmeasurable-criterion (warning); no-out-of-scope (error)
results: 21 of 22 sections found, 0 empty, 1 missing
findings: 1 (1 notice); fail level warning

Findings (1)

  NOTICE   missing-section         examples/solid-sow.md
           recommended section Accessibility is missing

```

[examples/output](examples/output) holds the report of the weak example as text, with `--explain`, as Markdown and as JSON, the report of the solid one, and the defaults written out by `--print-defaults`.

## What it checks

| Rule | Key | A finding is | Default level |
| --- | --- | --- | --- |
| `missing-section` | `rules.missingSection` | a section of the checklist that no heading matches | `error` for a required section, `notice` for a recommended one |
| `empty-section` | `rules.emptySection` | a heading with nothing under it down to the next heading at its level, or nothing but placeholders | `warning` |
| `placeholder` | `rules.placeholder` | `TBD`, `TODO`, `to be confirmed`, `[...]` and the rest of the list, in a heading or text of any section | `warning` |
| `vague-wording` | `rules.vagueWording` | a vague phrase of the list in the deliverables or the acceptance criteria | `warning` |
| `unmeasurable-criterion` | `rules.unmeasurableCriterion` | a list item of the acceptance criteria with no digit, number word, code span, named standard or quoted test name | `warning` |
| `no-out-of-scope` | `rules.noOutOfScope` | a scope with text and no out-of-scope section, or an empty one | `error` |

A rule set to `off` is not run, and the run fails when a finding is at `failOn` or above. Code blocks, code spans, text in double quotes, block quotes and link destinations are never read for vague words or placeholders: a button named in quotes or a flag in a code span is a name, not a promise. [docs/method.md](docs/method.md) says exactly what each rule looks at, and what it can and cannot see.

## The checklist

| Section | Title | Level | Comes from |
| --- | --- | --- | --- |
| `background` | Background | recommended | GSA template 1.0; FAR 37.602(c)(4) |
| `objectives` | Objectives | required | GSA template 2.0; FAR 37.602(c)(1) and (5) |
| `inScope` | In scope | required | GOV.UK list; GSA template 3.0; FAR 37.602(c)(2) |
| `outOfScope` | Out of scope | required | the tool's own choice |
| `deliverables` | Deliverables | required | GSA template 5.1 |
| `acceptance` | Acceptance criteria | required | GSA template 5.1.2; FAR 37.602(b)(2) |
| `changeControl` | Change control | required | GOV.UK, Changes to contracts |
| `assumptions` | Assumptions | recommended | FAR 37.602(c)(6), operating constraints; assumptions are the tool's own addition |
| `clientResponsibilities` | Dependencies and client responsibilities | recommended | GSA template 6.6.9 |
| `roles` | Roles and contacts | recommended | GOV.UK list; GSA template Appendix A |
| `schedule` | Schedule and milestones | required | GOV.UK list; FAR 37.602(c)(3); GSA template 6.2 |
| `pricing` | Pricing and payment terms | required | GOV.UK list; GSA template 7.0 |
| `intellectualProperty` | Intellectual property and ownership | recommended | GSA template 6.6.8 |
| `confidentiality` | Confidentiality | recommended | the tool's own choice |
| `dataProtection` | Data protection | recommended | GSA template 6.6.5 |
| `security` | Security requirements | recommended | GSA template 6.4 |
| `warranty` | Warranty and defects | recommended | GSA template 5.1.2, correction of defects |
| `support` | Support after delivery | recommended | the tool's own choice |
| `termination` | Termination | recommended | GOV.UK, Ending a contract |
| `governance` | Governance and reporting | recommended | GOV.UK, How to manage supplier performance; GSA template 5.1.2 |
| `disputes` | Dispute resolution | recommended | GOV.UK, Dispute resolution |

The deliverables and the acceptance criteria are read for vague wording; the acceptance criteria are judged as criteria. [docs/rules-and-sources.md](docs/rules-and-sources.md) quotes the sentence behind each section and says why the others are the tool's own choice; the GOV.UK page is marked as withdrawn on GOV.UK and is used as a published description of what a statement of work holds. [docs/inputs.md](docs/inputs.md) lists every alias.

## How headings are matched

| Step | Example |
| --- | --- |
| numbering at the start is left out | `4.2 Acceptance Criteria`, `Section 3: Deliverables`, `Appendix B - Pricing` |
| markup and the destination of a link are left out | `**Out-of-scope** items`, `[Scope](#scope)` |
| lower case, `&` read as `and`, punctuation read as a space | `Pricing & Payment` is `pricing and payment` |
| an alias matches where all its words stand together | `Our project goals` matches objectives |
| the longest alias first, and its words are used up | `Out of scope` is out of scope, not the scope; `Data protection and confidentiality` is both |

Only headings outside lists and block quotes make sections, and a heading inside a code block is never a heading. A section is found when a heading matches it and has text under it, empty when every heading that matches it is empty, and missing when none matches. Nothing is matched by similarity or meaning; a section written under another heading is found once its heading is added to the aliases.

## The configuration file

Without `--config`, the default checklist applies. A configuration changes it entry by entry; [docs/inputs.md](docs/inputs.md) has every key. The configuration of the example is [examples/config.json](examples/config.json):

```json
{
  "name": "Brightmoor review rules",
  "sections": {
    "security": { "level": "required" },
    "dataProtection": { "level": "required" },
    "intellectualProperty": { "level": "required" },
    "accessibility": {
      "title": "Accessibility",
      "aliases": ["accessibility", "a11y"],
      "level": "recommended"
    }
  },
  "vaguePhrases": { "add": ["world-class", "smooth"] },
  "rules": {
    "missingSection": { "required": "error", "recommended": "notice" },
    "emptySection": { "level": "warning" }
  },
  "failOn": "warning"
}
```

`--print-defaults` writes the whole default configuration out, with every section, alias, list and level, and `"useDefaultSections": false`, so the file can be saved and edited on its own.

## Formats

- `text`: for a terminal: what was read, the counts, the findings with their file, line and column, the checklist with the headings that matched, the notes, the notice and the result. With `--explain` also the rule, the reasons and the sentences behind each finding, and the aliases and the source of each section.
- `markdown`: the same for a pull request, a ticket or a job summary, with the findings and the checklist as tables. Pipes, square brackets, backticks, asterisks, underscores, line breaks and angle brackets from the document are escaped, and a cell that starts with `=`, `+`, `-` or `@` gets a leading apostrophe, so a heading cannot break a table, make a link, or run as a formula when the table is pasted into a spreadsheet.
- `json`: the whole report: the document, the configuration, the totals, the checklist, every finding with its line and column, the verdict, the notes and the notice.

## Exit codes

`0`: no finding at or above the fail level. `1`: at least one finding at or above it. `2`: a usage or input error: no document or two, an unknown option, an option given twice, a URL in place of a path, a file that cannot be read, a file over its limit, a binary, UTF-16 or invalid UTF-8 file, a configuration with an unknown key, a key named twice, an alias shared by two sections or a phrase removed that is not on its list. With exit code `2` the tool gives no verdict and prints the problems on standard error.

## Not a legal review

The tool reads headings and listed phrases. It cannot tell whether a section says the right thing, whether a price or a liability term is fair, whether two sections contradict each other, or what the law of the contract requires. A document with no finding can still be a poor contract, and a finding is a prompt for a person to read that part again. Have the contract read by someone qualified in the law that governs it. [The decision](docs/decisions/0001-read-headings-not-meaning-and-give-no-legal-advice.md) explains why the tool stays at structure and wording.

## Limits

A section under a heading none of its aliases knows, a vague sentence without a listed word, a vague word in quotes, a phrase broken across two lines and acceptance criteria written as paragraphs are not seen. A link, an annex or a master agreement that the document points to is not read. [docs/limits.md](docs/limits.md) lists these, with the size limits: 4 MB and 200,000 lines for the document, 16 levels of nesting, 500 findings listed per rule. [docs/threat-model.md](docs/threat-model.md) lists the risks of reading documents written by many hands and their controls, and [docs/secure-defaults.md](docs/secure-defaults.md) the defaults and how to run the tool in a pipeline.

## Architecture

Plain ES modules in `src/`, with no dependencies.

| File | Job |
| --- | --- |
| `src/cli.js` | the command line, the usage and the exit codes |
| `src/check.js` | reads the inputs, matches the headings, runs the rules and builds the report |
| `src/markdown.js` | the block structure of the document: headings, code blocks, block quotes, lists, tables, paragraphs, with lines and columns |
| `src/inline.js` | the parts of a line that are not the author's wording, and finding phrases at the edges of words |
| `src/sections.js` | the normal form of a heading and the matching of headings to sections |
| `src/config.js`, `src/defaults.js` | the configuration file over the defaults, and the default checklist and lists |
| `src/rules.js` | the six rules and the verdict |
| `src/json.js`, `src/files.js` | the strict JSON reader, the bounded reading of the named files and the one write of `--out` |
| `src/report.js`, `src/text.js`, `src/size.js` | the reports, the cleaning of text from the input, number formats |
| `src/data.js` | the sentences the tool rests on, compared with the saved pages in `research/sources` |
| `tools/check.mjs`, `tools/example.mjs` | the repository checks, and the examples with their real output |

## Where the facts come from

| Fact | Source |
| --- | --- |
| ATX and setext headings, code blocks and block quotes | CommonMark Spec 0.31.2, https://spec.commonmark.org/0.31.2/ |
| Tables | GitHub Flavored Markdown Spec, section 4.10 |
| What a statement of work should include, changes, performance, disputes and ending a contract | GOV.UK, How to manage your Digital Outcomes and Specialists contract (withdrawn guidance) |
| What a statement of objectives holds, and measurable performance standards | FAR 37.602, on Acquisition.GOV |
| The sections of a statement of work: objectives, scope, deliverables, acceptance, security, privacy, records and data, payment | GSA, Schedule 70 task order template for a Statement of Work/Performance Work Statement |
| Repeated names in a JSON object | RFC 8259, https://www.rfc-editor.org/rfc/rfc8259 |

## Background

A statement of work is where an outsourced software project is decided before any code is written: what is built, what is not, how it is accepted and how changes are handled. The ways such projects are set up are described on the page [Software Development Outsourcing Services](https://innerluxes.dev/software-development/outsourcing).

## License

MIT
