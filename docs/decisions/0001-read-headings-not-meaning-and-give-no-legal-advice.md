# 1. Read headings and listed phrases, not meaning, and give no legal advice

## Status

Accepted.

## Context

A statement of work for an outsourced software project is part of a contract. The gaps that cause disputes later are often plain to see: a scope with no list of what is excluded, deliverables that are `fast` and `user-friendly`, acceptance criteria that say the client accepts the work when it is ready, a timeline that says TBD. Public-sector guidance lists what a statement of work holds. The GOV.UK guidance of the Government Digital Service says "A statement of work should include:" and lists the work, how long it takes, the people, how the buyer pays and how much it costs; FAR 37.602 asks to "Enable assessment of work performance against measurable performance standards;".

A tool could try to go further: read each sentence, judge whether a liability cap is reasonable, compare a clause with the law of a country, or score the document. Each of those needs a reading of meaning that a program cannot do reliably, and a wrong answer would look like advice. A report that says PASS about a contract is easy to read as "this contract is fine".

## Decision

1. The tool reads structure and listed words only. A section is found by the aliases of its heading; a placeholder and a vague phrase are found by a list; an acceptance criterion is measurable when it holds one of a few elements written in docs/method.md. Nothing is matched by similarity or meaning, so every finding points at something a person can see in the document and check.
2. The rules are conservative. A finding must be worth a person's time: vague words are read only in the deliverables and the acceptance criteria by default, words in code, quotes and block quotes are not read, and an acceptance criterion with a number is not judged further. A missed gap is better than a report full of noise that people learn to ignore.
3. Every list, alias and level is the configuration's to change, with the defaults written out by `--print-defaults`. Where a default comes from a saved page, docs/rules-and-sources.md names the sentence; where it is the tool's own choice, it says so.
4. The tool gives no legal advice. Every report, in every format, ends with the sentence that it checks the structure and the wording of the document only and is not a legal review. The README, the usage text and docs/limits.md say the same, and a test checks that they do.
5. The tool reads no clock, no locale and no network, so the same document gives the same report everywhere, and no file of the repository holds a date.

## Consequences

- A document can pass and still be a poor contract. The README and docs/limits.md say so in plain words, and the report says it every time.
- A section written under a heading the aliases do not know is reported missing. The fix is one line in the configuration, and the report shows every alias that was looked for.
- A vague promise in quotes, or a vague sentence with no listed word, is not reported. This is the price of rule 2, and docs/limits.md lists it.
- Teams can make the check stricter for their own contracts without changing the tool: required sections, more sections read for wording, their own phrases.
