# Threat model

## What the tool touches

- It reads the statement of work and the configuration file named on the command line. Nothing else is opened.
- It writes the report to the screen, or to the one file `--out` names. It writes nothing else.
- It opens no network connection, follows no link of the document, evaluates nothing it reads and starts no program.

## What the input may hold

A statement of work is written by many hands: the client, the supplier, their lawyers, and whoever copied a template. In a pipeline that checks every pull request of a contracts repository, the document is written by whoever opened the pull request. The configuration lives in the same repository and can be changed the same way.

Through the inputs, a person can try to:

- make a weak document pass: a heading that matches an alias but holds nothing, a section that holds nothing but a placeholder, a vague promise hidden from the list by spelling, quotes or a code span, an acceptance criterion with a number that measures nothing;
- move the verdict through the configuration: a key named twice, an unknown key that looks like a known one, a section set to off, an alias shared by two sections, a rule set to off, a phrase removed from a list;
- make the tool open something: a link, an image or an autolink to an address on the network or to a file on the machine;
- exhaust the memory or the time: a file of gigabytes, a line of megabytes, lists or block quotes nested thousands deep, backticks, quotes, brackets and angle brackets that are never closed, a heading of megabytes, a hundred thousand headings, JSON nested a million deep;
- slip in something that is not text: a binary file renamed `.md`, a file in UTF-16, bytes that are not UTF-8;
- rewrite the terminal or break a report: control characters, ANSI escapes, direction controls and line separators in a heading, and pipes, brackets and angle brackets that a Markdown table would render;
- run a formula: a heading that starts with `=`, `+`, `-` or `@`, which a spreadsheet would run when a Markdown table of the report is pasted into it;
- change how objects behave: a section id, a heading or a phrase such as `__proto__`, `constructor` or `toString`;
- make the tool overwrite its input: `--out` pointed at the statement of work;
- read the report as legal advice: a PASS taken to mean that the contract is sound.

## What could go wrong, and what stops it

| Risk | Control |
| --- | --- |
| A heading with nothing under it passes as a section | A section whose every heading is empty, or holds nothing but placeholders, is empty, not found; `empty-section` reports every such heading, and `no-out-of-scope` reports an empty out-of-scope section |
| A heading inside a code block is read as a section | Code blocks are found first and never read for headings or words; an unclosed fence is noted, because the rest of the document is then code |
| Quotes, code spans or block quotes hide a vague word | That is the design, written in docs/method.md: names and quotations are not the author's promise. The rule is narrow on purpose, and docs/limits.md says what it cannot see |
| A key named twice or an unknown key moves the verdict | The JSON reader refuses a repeated key, as RFC 8259 says the behavior of software that receives one is unpredictable; an unknown key stops the run with its line and a suggestion; removing a phrase that is not on a list is an error; an alias shared by two sections is refused; a checklist with every section off is refused |
| The tool opens a link | No module of the network is imported, no link is followed, and a URL given on the command line is refused; a test checks the imports of src, and a hostile test runs a document full of links to local addresses and files |
| The memory or the time is exhausted | Every input has a size limit checked on the open file before it is read; lines are capped; nesting stops at 16 levels; the closing backtick run, quote, parenthesis and angle bracket of a line are found with positions that only move forward, so openers that are never closed cost one pass; a heading is cut before it is matched; findings are capped per rule. Tests check the time, with limits that widen under coverage only |
| A pattern from the input is slow | No regular expression is built from the document or the configuration; phrases are found with indexOf; a test looks for `new RegExp` in src |
| A binary or UTF-16 file is read as text | A null byte, a UTF-16 byte order mark or bytes that are not valid UTF-8 stop the run with exit code `2` |
| Text from the input rewrites the terminal or breaks a Markdown table | Every text goes through `safeText`, which removes control, line separator and direction characters and caps the length; Markdown cells escape the characters a table, a link or HTML needs. A test puts ANSI escapes and direction controls in headings and text |
| A cell is run as a formula | A Markdown cell that starts with `=`, `+`, `-`, `@`, a tab or a carriage return gets a leading apostrophe |
| `__proto__` changes how objects behave | Sections are kept in arrays and maps; the JSON reader defines own properties; a section id must be a letter followed by letters and digits. A test uses `__proto__`, `constructor` and `toString` as ids, headings and phrases |
| A device or a pipe named as an input hangs the tool | A file is opened once, and its type and size are taken from the open handle: a device or a pipe is refused as not a regular file. A path named on the command line may be a link to a regular file, because the person who runs the tool named it |
| A report overwrites an input, or the tool leaves files behind | Only `--out` writes, and a path that is one of the inputs is refused; there is no cache or temporary file. A test checks that a run leaves the folder as it was |
| A PASS is read as legal advice | Every report ends with the sentence that it checks structure and wording only and is not a legal review; the README, the usage and docs/limits.md say the same |

## Out of scope

Whether a statement of work is a good contract, the law that applies to it, whether the configuration of a team is strict enough, who may change the configuration in your repository, and where your pipeline keeps the reports.
