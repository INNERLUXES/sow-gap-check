# Contributing

Every change goes through a pull request and is reviewed before it is merged. The pipeline runs the tests on Linux, Windows and macOS with Node 22 and 24, the tests with coverage, the repository checks, CodeQL, and a secure development check of the repository itself.

Commit messages in this repository follow Conventional Commits: `feat:`, `fix:`, `docs:`, `test:`, `ci:`, `chore:`, with `!` for a breaking change.

## Changing a rule

1. Describe the change in docs/method.md first: what the rule looks at, in which sections, and what it can and cannot see. Where the tool makes its own choice, say so and say why.
2. Keep the rules conservative. A finding must point at something a reader can check in the document: a heading that is not there, a heading with nothing under it, a phrase on a list, an item with nothing to measure. Never add a rule that guesses what a sentence means.
3. A run must never pass because something could not be read: an input that cannot be read stops the run with exit code `2`.
4. Add a test with the document written inline (`FULL`, `fullWith()` and `reportOf()` in test/helpers.js build them), small enough that the result can be worked out by hand, with a near miss on each side.
5. A rule id, once released, keeps its meaning: pipelines and other tools read it from the JSON report.

## Changing the checklist

1. Every default section names the sentences of a saved page it comes from (`basis`, keys of `FACTS` in `src/data.js`). A section that no saved page names is the tool's own choice: it says why in `own`, and docs/rules-and-sources.md marks it so.
2. An alias belongs to one section only; `npm test` fails when two default sections share one. Prefer aliases of two or more words over single words that many headings hold.
3. Describe the section in docs/inputs.md and in the table of the README.

## Changing the configuration file

1. A new key is added to `KEYS` or `SECTION_KEYS` in src/config.js, documented in docs/inputs.md, and tested with a good value and a bad one. Every key the tool does not know stays an error, and an object that names a key twice stays refused.
2. A list of phrases keeps `replace`, `add` and `remove`; removing an entry that is not there stays an error.

## Changing a reader

1. The tool reads; it never runs. A reader must not fetch anything a document links to, follow anything but own properties, or build a pattern from the input.
2. Keep the work bounded: the limits of docs/limits.md, and a hostile test with a large input and a time check.
3. A time check in a test widens under coverage: read `process.env.NODE_V8_COVERAGE`, which the test runner sets only when coverage is on, and allow four times the time. Never read the flags of the process for this, because they hold the coverage flags of the runner in every run. Run `npm run test:coverage` before you open the pull request.
4. A document written with LF and with CRLF line ends must give the same report. The example inputs are stored as written (`.gitattributes`), and a test reads them both ways.
5. Where the reader is simpler than CommonMark, say so in docs/method.md.

## Tests that depend on the system

A test that depends on the operating system (a symbolic link, a device) is guarded with `process.platform`, says why in its `t.skip`, and asserts no line or column of its own: a line or column is asserted only in a test that runs on every system, and is worked out there with `lineOf()` or `columnIn()` of test/helpers.js or from the text itself, never written by hand. `test/repo.test.js` fails when a guarded test asserts a line or a column. Every other test builds its paths with `resolve()` from names with forward slashes.

A test never reads the clock, the time zone or the locale.

## Rules for the code

- No runtime dependencies. Node 22 or newer and nothing else.
- The tool reads the files it is given and writes only to the screen or to the file `--out` names. It opens no network connection, follows no link of the document and runs no program.
- Text from the input goes through `safeText` before it reaches a report, a note or an error message.
- No report, document or message gives legal advice. The tool checks structure and wording only.
- Source files stay ASCII; write any other character as a Unicode escape, or build it from its code point.
- Never commit a real secret, even as a fixture. `npm run check` fails on anything that looks like a credential.
- No file carries a date, and no file holds a number that reads like a year. Version numbers (Node 22, 1.0.0) and the numbers of a standard (RFC 8259, FAR 37.602) are fine.
- Examples and tests use made-up companies and people on example.com, never a real contract.

## Before you open the pull request

```
npm test
npm run test:coverage
npm run check
npm run example
```
