# Limits

The tool checks the structure and the wording of a statement of work. It is not a legal review and gives no legal advice: it does not read what a sentence means, and a document with no finding can still be a poor or unfair contract. Have a person who knows the law of the contract read it.

## What it cannot see

- **Meaning.** The tool finds headings and phrases. It cannot tell whether a section says the right thing, whether two sections contradict each other, whether a price is right, whether a clause is fair, or whether a term holds under the law of the contract.
- **Sections under other headings.** A section is found by the aliases of its heading. A section written under a heading with none of its aliases is reported missing; add the heading to the aliases in the configuration. A subject covered in a paragraph of another section, with no heading of its own, is not seen.
- **A heading that matches by its words but holds something else.** A heading `Payment` that holds only a sentence about something unrelated counts as the pricing section.
- **Vague sentences without a listed word.** `vague-wording` finds the phrases of its list and nothing else. A sentence such as `the portal will do what the client expects` has no listed word and is not reported.
- **Whether a measure is right.** `unmeasurable-criterion` asks for a measurable element: a digit, a number word, a code span, a named standard, or a quoted test name. It does not judge whether the number is the right one, whether the test exists or whether the standard applies. Acceptance criteria written as paragraphs or table rows are not judged.
- **Words inside code, quotes and block quotes.** These are never read for vague words or placeholders, on purpose (docs/method.md). A vague promise written in double quotes is not reported.
- **Phrases broken across lines.** A phrase, a code span or a quotation is found within one line.
- **Documents other than Markdown.** A Word file or a PDF must be turned into Markdown first. Link reference definitions, HTML blocks other than comments and entity references are not read as CommonMark reads them; they do not change where a heading is.
- **Headings inside lists and block quotes.** Only headings outside them make sections.
- **Other documents.** A master agreement, an order form or an annex that the statement of work points to is not read. A link is text; the tool never opens it.

## Size limits

Past a limit, the input is refused with exit code `2` and no verdict, or, where the limit is on the work and not the input, the report says so in a note.

| What | Limit |
| --- | --- |
| statement of work | 4 MB, 200,000 lines |
| configuration file | 1 MB; 100 sections, 50 aliases each, 500 phrases in a list, 120 characters for a title, an alias or a phrase |
| JSON of the configuration | nesting 32 deep, 100,000 values, 4,096 characters in a string |
| nesting of lists and block quotes | 16 levels; deeper text is read as plain paragraphs, with a note |
| words of a heading compared with the aliases | the first 64 words, after the first 1,000 characters |
| findings of one rule | 500 listed; the rest are counted in a note |

The tests read a line of three megabytes, lists nested three thousand deep, block quotes with a hundred thousand markers, fifty thousand headings, a hundred thousand list items and table rows, and lines full of backticks, quotes and brackets that are never closed, each with a time check.
