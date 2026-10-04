# Method

This document says exactly how the tool goes from a Markdown file to the findings: how the file is read, how a heading is matched to a section of the checklist, what each rule reports, and what each rule can and cannot see. Where the tool makes its own choice, it says so and says why. The sentences quoted here are on the pages saved in `research/sources`; [rules-and-sources.md](rules-and-sources.md) lists them.

The tool checks the structure and the wording of a statement of work. It is not a legal review: it does not read what a sentence means, whether a term is fair, whether a clause is enforceable or what law applies. A document with no finding can still be a poor contract, and a finding is a prompt for a person to read that part again.

## What the check rests on

Two public-sector pages say what a statement of work holds. The GOV.UK guidance of the Government Digital Service (now marked as withdrawn) lists it: "A statement of work should include:" followed by "clear descriptions of the work that needs to be done", how long the work should take, "a list of people needed to do the work", how the buyer will pay and how much the work will cost. The Federal Acquisition Regulation, section 37.602, says of a statement of objectives: "The SOO shall, at a minimum, include-" a purpose, a scope or mission, a period and place of performance, a background, performance objectives and operating constraints. The task order template of the U.S. General Services Administration has headings for the background, the objectives, the scope, the deliverables, inspection and acceptance, the period of performance, security, the Privacy Act, records and data, government furnished items, invoicing and points of contact.

On wording, FAR 37.602 asks agencies to "Enable assessment of work performance against measurable performance standards;", and the GSA template says that "All periodic reports and task deliverables shall be inspected, tested (where applicable), reviewed, and accepted by the Government within a reasonable period of time". A deliverable that is fast or user-friendly gives no standard to inspect it against.

## Reading the file

The file is read as UTF-8. A byte order mark at the start is left out. A file that holds a null byte, is UTF-16 or is not valid UTF-8 is refused with exit code `2`. A line ends at LF, CR LF or a lone CR, so the three give the same report.

The reader finds the blocks of a subset of CommonMark and the tables of GitHub Flavored Markdown:

- **ATX headings.** One to six `#` at the start of a line. CommonMark: "The opening sequence of # characters must be followed by spaces or tabs, or by the end of line." and "The opening # character may be preceded by up to three spaces of indentation." A closing sequence of `#` preceded by a space is left out. "The heading level is equal to the number of # characters in the opening sequence."
- **Setext headings.** One or more lines of text followed by an underline: "A setext heading underline is a sequence of = characters or a sequence of - characters, with no more than 3 spaces of indentation and any number of trailing spaces or tabs." and "The heading is a level 1 heading if = characters are used in the setext heading underline, and a level 2 heading if - characters are used." After a blank line, `---` is a thematic break, not a heading.
- **Code blocks.** "An indented chunk is a sequence of non-blank lines, each preceded by four or more spaces of indentation." A fenced block starts with three or more backticks or tildes and ends at a fence of the same character that is at least as long. "The content of a code fence is treated as literal text, not parsed as inlines.", so a `#` line inside a code block is never a heading and its words are never read. "If the end of the containing block (or document) is reached and no closing code fence has been found, the code block contains all of the lines after the opening code fence until the end of the containing block (or document)." The report adds a note for such a fence, because everything after it goes unchecked.
- **Block quotes.** Lines that start with `>`, and lazy lines that continue their text. A block quote is text of its section, so a section that holds one is not empty, but its words are never read for vague wording or placeholders: a block quote is most often a quotation of another document.
- **Lists.** Items marked with `-`, `+` or `*`, or with a number of up to nine digits followed by `.` or `)`. The lines of an item are the lines indented to its content, and lazy lines that continue its text. An ordered item interrupts a paragraph only when it starts at 1.
- **Tables.** A header row, a delimiter row and the rows up to a blank line or another block. GitHub Flavored Markdown: "The delimiter row consists of cells whose only content are hyphens (-), and optionally, a leading or trailing colon (:), or both, to indicate left, right, or center alignment respectively." and "The header row must match the delimiter row in the number of cells." Cells are split at each pipe that is not escaped. The tool also asks for a pipe in the delimiter row, so `---` under a line with a pipe stays a setext underline.
- **HTML comments** from `<!--` to `-->` are skipped. Other HTML is read as text.
- **Paragraphs** are everything else, up to a blank line or a block that interrupts them.

Only headings that are not inside a list item or a block quote make sections. A heading inside a list item is read as text of the item.

Where the reader is simpler than CommonMark: link reference definitions, HTML blocks other than comments, entity references and the rules for emphasis are not read, and an inline code span or a quotation is found within one line only. None of these changes where a heading is; they can only make the tool read a few more words, or a few less, as wording.

Tabs are expanded to the next multiple of four columns for the block structure, and every column in a report is the column in the file, counted in characters from 1, with a tab counted as one character. A column counts UTF-16 code units, so a character outside the Basic Multilingual Plane counts as two.

Nesting stops at 16 levels of lists and block quotes. The rest of a container deeper than that is read as plain text, and a note says from which line.

## Matching a heading to a section

Each section of the checklist has a title, a level (`required`, `recommended` or `off`) and a list of aliases. A heading and an alias are put in one normal form:

1. The numbering at the start of a heading is left out: `4.2`, `1.`, `1)`, `A.`, `iv)`, and a section word with a number or a letter, such as `Section 3:`, `Appendix B -` or `Part D`. A heading that would be left with no letter or digit keeps its numbering.
2. The destination of a link is left out, and the characters `*`, `_`, backtick, `[`, `]`, `<`, `>`, `#` and backslash are read as spaces.
3. The text is put in lower case, `&` is read as `and`, and every run of characters that are not letters or digits is read as one space.

The words of the heading are then compared with the words of every alias of every section that is not off. An alias matches where all of its words stand together in the heading, in order. The longest alias, in words and then in characters, is taken first, and its words are used up; then the next longest that only uses free words, and so on. A section is matched at most once by a heading, and a heading can match more than one section.

So `Out of scope` is the out-of-scope section and not the scope, because `out of scope` uses up the word `scope`; `Data protection and confidentiality` matches both of its sections; `Fees and payment schedule` is the pricing, because `payment schedule` is an alias of pricing and uses up `schedule`. Nothing is matched by similarity, spelling or meaning: `Acceptable use` is not acceptance, and `Scoping` is not the scope. An alias belongs to one section only; the configuration refuses an alias that two sections share.

A section is **found** when at least one heading matches it and at least one of those headings has text under it, **empty** when every heading that matches it is empty, **missing** when no heading matches it, and **off** when its level is off.

## The text of a heading

The text of a heading is everything under it down to the next heading at its level or above, subheadings and their text included. A heading is:

- **empty** when there is no paragraph, list, table, code block, HTML comment or block quote in that part;
- **placeholder** when every paragraph, list item and table row in that part is nothing but placeholders once the placeholders are taken out (no letter or digit is left), and there is no code block, comment or block quote;
- otherwise it has text.

## The rules

A rule whose level is `off` is not run. The levels are the configuration's (docs/inputs.md); the defaults are in brackets.

### `missing-section`

A finding for each section of the checklist that is missing: at the level of `rules.missingSection.required` for a required section (error) and of `rules.missingSection.recommended` for a recommended one (notice). The finding names the section, every alias that was looked for, and the sentences the section comes from, or the reason why it is the tool's own choice. It has no line, because what is missing has no place.

It can see: whether a heading with one of the aliases is in the document. It cannot see: a section written under a heading with none of the aliases (add the heading to the aliases in the configuration), a section that is only a paragraph with no heading, or text that covers the subject in another section.

### `empty-section`

A finding at the level of `rules.emptySection` (warning) for each heading that is empty or holds nothing but placeholders, with its line and column. It looks at every heading, matched to the checklist or not. A heading whose subheadings are all empty is reported through its subheadings, not once more itself. A heading of the out-of-scope section is left to `no-out-of-scope` when that rule reports it.

### `placeholder`

A finding at the level of `rules.placeholder` (warning) for each placeholder of the list in a heading or in a paragraph, list item or table cell of any section, with its line and column. Placeholders inside code blocks, code spans, double-quoted text, block quotes and link destinations are not read. A placeholder in a part that `empty-section` already reports is not reported again.

A placeholder written in capitals only (`TBD`, `TODO`, `XXX`) is matched with case, so `a todo list` is not one; any other (`to be confirmed`, `lorem ipsum`) is matched without case for the letters A to Z. A placeholder that starts or ends with a letter or a digit is matched only at the edge of a word, where letters, digits, `_` and `-` make words.

### `vague-wording`

A finding at the level of `rules.vagueWording` (warning) for each phrase of the list of vague phrases in a paragraph, list item or table cell under a heading that matches a section marked for wording: by default the deliverables and the acceptance criteria. The finding has the line and the column of the phrase and a short piece of the line around it.

Not read: code blocks, code spans, text in double quotes (straight or typographic), block quotes, link destinations, autolinks and HTML tags, and every other section. A button called "Fast reorder" in quotes, a `fast` flag in a code span, and a quotation in a block quote are names and quotations, not the author's promise. The text of a link is read, because it is the author's wording. Phrases are matched at the edges of words, with `-` part of a word, so `fast` is not found in `fast-track` or `breakfast`; where two phrases overlap, the first and then the longer one is kept, so `best efforts` is one finding, not two. A phrase is found within one line; a phrase broken across two lines is not found.

It can see: the words on the list. It cannot see: a vague sentence with no word of the list, a precise-sounding word used loosely, or a number that is too loose to check.

### `unmeasurable-criterion`

A finding at the level of `rules.unmeasurableCriterion` (warning) for each list item under a heading that matches a section marked for criteria (by default the acceptance criteria) that has nothing in it that can be measured. The rule is conservative, so that an item it reports really has nothing to hold on to:

- Only list items are read: an acceptance criterion is most often a list item. Paragraphs and table rows are not judged.
- Only items with no list inside them are judged. An item such as `Orders:` with items under it is judged through its items.
- An item that is nothing but placeholders is left to `placeholder`.
- An item has a measurable element, and is not reported, when it holds any of: a digit (`95%`, `2 seconds`, `severity 1`); a number word of the list (`zero`, `twelve`, `percent`, `none`); a code span, which names a command, a test or a file (`npm test`); the name of a standard of the list, matched with case when written in capitals (`WCAG`, `ISO`, `OWASP`); or a name in double quotes together with a test word of the list (`the "Month end" test script`).
- A digit inside the destination of a link does not count; a digit inside a code span or in quotes does.

The rule does not judge whether the number is the right one, whether the test exists, or whether the standard applies.

### `no-out-of-scope`

A finding at the level of `rules.noOutOfScope` (error) when the section named by `rules.noOutOfScope.inScope` (the scope) is found with text, and the section named by `rules.noOutOfScope.outOfScope` (out of scope) is missing or empty. The finding is placed at the first heading of the scope that has text. When this rule reports the out-of-scope section, `missing-section` and `empty-section` do not report it again, so a missing out-of-scope section gives one finding, not two.

This rule is the tool's own choice. No saved page names a list of exclusions. GOV.UK says "You'll agree the scope of the contract with the supplier before the buying process ends so you both know what the contract covers."; a scope that says what is in and is silent on what is out leaves the edge of the work to be argued about later. One heading can carry both, such as `Scope and exclusions`, which matches both sections.

## Levels and the verdict

Each finding has a level: `notice`, `warning` or `error`. The run fails when a finding is at `failOn` or above (`--fail-on` overrides it). Findings are sorted by level, then line and column (findings with no line first), then rule, so the same file always gives the same order. Each rule lists at most 500 findings; past that, a note gives the count.

Exit codes: `0` no finding at or above the fail level, `1` at least one, `2` a usage or input error. With `2` there is no verdict: an input that cannot be read stops the run, and every problem is printed on standard error.

Every report ends with the sentence that it checks the structure and the wording of the document only, and is not a legal review.
