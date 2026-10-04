# Inputs

The tool reads two files: the statement of work, and a configuration file when `--config` names one. Without a configuration file, the built-in defaults apply; `--print-defaults` writes them out as a configuration file that can be saved and edited.

## The statement of work

One Markdown file, in UTF-8, at most 4 MB and 200,000 lines. A byte order mark is left out; LF, CR LF and CR line ends give the same report. A file that holds a null byte, is UTF-16 or is not valid UTF-8 is refused. [method.md](method.md) says how the file is read.

The tool reads the headings to find the sections, and the text under them for placeholders, vague words and acceptance criteria. Write each part of the statement of work under its own heading, with the words of one of its aliases in the heading.

## The configuration file

One JSON object. The file is read with a strict reader: no comments, no trailing comma, and an object that names a key twice is refused, because RFC 8259 says "When the names within an object are not unique, the behavior of software that receives such an object is unpredictable." Every key the tool does not know is an error, with a suggestion when a known key is close, so a typo cannot leave a default in place unnoticed. Every key is optional.

| Key | Value | Default |
| --- | --- | --- |
| `name` | a name for the configuration, shown in the report | none |
| `useDefaultSections` | `false` to start from an empty checklist instead of the default one | `true` |
| `sections` | an object that maps the id of a section to its keys, below | the default checklist |
| `vaguePhrases` | changes to the list of vague phrases: `replace`, `add`, `remove` | the list below |
| `placeholders` | changes to the list of placeholders | the list below |
| `standards` | changes to the list of names of standards | the list below |
| `measureWords` | changes to the list of number words | the list below |
| `testWords` | changes to the list of test words | the list below |
| `rules` | the level of each rule, and the sections of `noOutOfScope` | below |
| `failOn` | the lowest level of a finding that fails the run: `notice`, `warning` or `error` | `warning` |

### Sections

`sections` maps the id of a section to an object. For a default section, the keys given replace its defaults one by one and the others stay. An id that is not a default section adds a section, which needs `title`, `aliases` and `level`. An id is a letter followed by letters and digits, at most 40 characters.

| Key | Value |
| --- | --- |
| `sections.<id>.title` | the name of the section in the report |
| `sections.<id>.aliases` | the headings that mean this section, one to 50, each with a letter or a digit; [method.md](method.md) says how they are matched |
| `sections.<id>.level` | `required`, `recommended` or `off` |
| `sections.<id>.wording` | `true` to read the text under the section for vague phrases |
| `sections.<id>.criteria` | `true` to judge the list items under the section as acceptance criteria |

An alias may belong to one section only; an alias that two sections share is refused, because a heading would match both. A checklist where every section is off is refused, because the check would always pass.

### Lists of phrases

Each list is changed with an object of up to three keys, applied in this order:

| Key | Value |
| --- | --- |
| `vaguePhrases.replace` | the whole list, in place of the default one |
| `vaguePhrases.add` | phrases added to the list; a phrase that is already there is an error |
| `vaguePhrases.remove` | phrases taken off the list; a phrase that is not there is an error |

`placeholders.replace`, `placeholders.add`, `placeholders.remove`, `standards.replace`, `standards.add`, `standards.remove`, `measureWords.replace`, `measureWords.add`, `measureWords.remove`, `testWords.replace`, `testWords.add` and `testWords.remove` work the same way. A phrase is at most 120 characters with no control character; a list holds at most 500 phrases; a phrase is named once, compared without case. A phrase written in capitals only is matched with case, any other without case for the letters A to Z. Runs of white space in a phrase are read as one space.

### Rules

| Key | Value | Default |
| --- | --- | --- |
| `rules.missingSection` | the levels of `missing-section` | |
| `rules.missingSection.required` | the level of a missing required section, or `off` | `error` |
| `rules.missingSection.recommended` | the level of a missing recommended section, or `off` | `notice` |
| `rules.emptySection` | the level of `empty-section` | |
| `rules.emptySection.level` | `notice`, `warning`, `error` or `off` | `warning` |
| `rules.placeholder` | the level of `placeholder` | |
| `rules.placeholder.level` | `notice`, `warning`, `error` or `off` | `warning` |
| `rules.vagueWording` | the level of `vague-wording` | |
| `rules.vagueWording.level` | `notice`, `warning`, `error` or `off` | `warning` |
| `rules.unmeasurableCriterion` | the level of `unmeasurable-criterion` | |
| `rules.unmeasurableCriterion.level` | `notice`, `warning`, `error` or `off` | `warning` |
| `rules.noOutOfScope` | the level and the sections of `no-out-of-scope` | |
| `rules.noOutOfScope.level` | `notice`, `warning`, `error` or `off` | `error` |
| `rules.noOutOfScope.inScope` | the id of the section that holds the scope | `inScope` |
| `rules.noOutOfScope.outOfScope` | the id of the section that holds the exclusions | `outOfScope` |

When `noOutOfScope` is on, both of its sections must be in the checklist and not off.

## The default checklist

| Section | Title | Level | Read for | Aliases |
| --- | --- | --- | --- | --- |
| `background` | Background | recommended | | background, context, introduction, overview, project background, project overview, about the project |
| `objectives` | Objectives | required | | objectives, objective, goals, goal, aims, purpose, project objectives, business objectives, outcomes, desired outcomes |
| `inScope` | In scope | required | | in scope, scope, scope of work, scope of services, description of services, description of work, work to be performed, requirements, tasks |
| `outOfScope` | Out of scope | required | | out of scope, outside scope, outside the scope, not in scope, exclusions, excluded, excluded work, not included, what is not included |
| `deliverables` | Deliverables | required | wording | deliverables, deliverable, outputs, work products, what will be delivered |
| `acceptance` | Acceptance criteria | required | wording, criteria | acceptance criteria, acceptance, acceptance tests, acceptance testing, user acceptance testing, uat, definition of done, inspection and acceptance, sign off, completion criteria |
| `changeControl` | Change control | required | | change control, change process, change request, change requests, change management, changes, contract changes, changes to the contract, variations, change order, change orders |
| `assumptions` | Assumptions | recommended | | assumptions, assumption, constraints, operating constraints |
| `clientResponsibilities` | Dependencies and client responsibilities | recommended | | dependencies, dependency, client responsibilities, customer responsibilities, buyer responsibilities, client obligations, customer obligations, responsibilities of the client, client dependencies, government furnished items, client furnished items, inputs from the client |
| `roles` | Roles and contacts | recommended | | roles, roles and responsibilities, contacts, points of contact, point of contact, key personnel, key contacts, team, project team, staffing, people, stakeholders |
| `schedule` | Schedule and milestones | required | | schedule, milestones, milestone, timeline, timetable, delivery schedule, project schedule, phases, period of performance, duration, time frame, timeframe |
| `pricing` | Pricing and payment terms | required | | pricing, price, prices, fees, fee, payment, payments, payment terms, payment schedule, invoicing, charges, costs, cost, commercials, commercial terms, budget, rates, compensation |
| `intellectualProperty` | Intellectual property and ownership | recommended | | intellectual property, intellectual property rights, ip, ip rights, ip ownership, ownership, ownership of deliverables, licensing, license, licence |
| `confidentiality` | Confidentiality | recommended | | confidentiality, confidential information, non disclosure, nondisclosure, nda |
| `dataProtection` | Data protection | recommended | | data protection, personal data, privacy, data privacy, gdpr, processing of personal data, data processing |
| `security` | Security requirements | recommended | | security, security requirements, information security, access control |
| `warranty` | Warranty and defects | recommended | | warranty, warranties, warranty period, defects, defect remediation, defect correction, bug fixing, bug fixes, guarantee |
| `support` | Support after delivery | recommended | | support, maintenance, support and maintenance, post delivery support, after delivery support, hypercare, ongoing support, service levels, sla, handover, transition |
| `termination` | Termination | recommended | | termination, terminating the agreement, ending the contract, ending the agreement, exit, exit plan, cancellation |
| `governance` | Governance and reporting | recommended | | governance, reporting, reports, status reporting, progress reporting, communication, communications, meetings, project management, performance management, steering committee, escalation |
| `disputes` | Dispute resolution | recommended | | dispute resolution, disputes, dispute |

[rules-and-sources.md](rules-and-sources.md) says where each section comes from, and which ones are the tool's own choice.

## The default lists

- **Vague phrases** (48): `user-friendly`, `user friendly`, `easy to use`, `intuitive`, `fast`, `quick`, `quickly`, `responsive`, `performant`, `scalable`, `flexible`, `seamless`, `seamlessly`, `robust`, `modern`, `state of the art`, `state-of-the-art`, `industry standard`, `industry-standard`, `best practice`, `best practices`, `best effort`, `best efforts`, `high quality`, `high-quality`, `as needed`, `as required`, `as appropriate`, `if possible`, `where possible`, `as soon as possible`, `asap`, `in a timely manner`, `timely`, `reasonable`, `adequate`, `sufficient`, `etc.`, `and so on`, `and more`, `minimal`, `optimal`, `optimized`, `efficient`, `appropriate`, `normal`, `typical`, `and/or`.
- **Placeholders** (15): `TBD`, `TBC`, `TBA`, `TODO`, `FIXME`, `XXX`, `to be confirmed`, `to be determined`, `to be decided`, `to be defined`, `to be agreed`, `to be advised`, `lorem ipsum`, `[...]`, `[insert`.
- **Standards** (15): `WCAG`, `ISO`, `IEC`, `IEEE`, `RFC`, `OWASP`, `ASVS`, `NIST`, `PCI DSS`, `SOC`, `HIPAA`, `GDPR`, `EN 301 549`, `W3C`, `OpenAPI`.
- **Number words** (19): `zero`, `one`, `two`, `three`, `four`, `five`, `six`, `seven`, `eight`, `nine`, `ten`, `eleven`, `twelve`, `twenty`, `hundred`, `thousand`, `percent`, `half`, `none`.
- **Test words** (11): `test`, `tests`, `test case`, `test cases`, `test suite`, `suite`, `scenario`, `scenarios`, `checklist`, `script`, `scripts`.

The lists are the tool's own choice; no saved page lists vague words. They lean towards words that promise a quality without a measure. A team that finds one of them too strict for its documents removes it with `remove`.

## Defaults that are not rules

- Without `--config`, the default checklist, lists and levels apply.
- Without `--fail-on`, the fail level of the configuration applies, else `warning`.
- Without `--format`, the report is text.
- Without `--out`, the report goes to standard output.

## Example

The configuration of the examples, [examples/config.json](../examples/config.json), makes three recommended sections required, adds a section of its own and two vague phrases:

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
