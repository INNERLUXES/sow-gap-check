# Security

## Reporting a problem

Write to info@innerluxes.dev with the subject line "sow-gap-check security", or use private vulnerability reporting on this repository. Please do not open a public issue for a vulnerability.

Include a small made-up statement of work and configuration that show the problem, the command you ran, what you expected and what happened. Use made-up names on example.com, never a real contract, and never a real key, token or password, even a revoked one.

## Scope

In scope:

- an input that makes the tool open a network connection, follow a link of the document, run a program, load a module or evaluate any part of a file
- an input that makes the tool write a file other than the one `--out` names, or write the report over one of its inputs
- an input that makes the tool hang, take very long or use unbounded memory, such as a very large file, a very long line, lists or block quotes nested very deep, openers that are never closed, or JSON nested very deep
- binary, UTF-16 or invalid UTF-8 input that the tool reads as if it were text
- an input that the tool fails to read and passes over without an error, such as an unknown key or a key named twice in the configuration
- a code block, a code span, a quotation or a block quote whose words are reported as vague wording or placeholders, or a heading inside a code block that is read as a section
- a run that passes although a required section is missing, or a rule that runs or does not run against docs/method.md
- text from the document that breaks a Markdown table, makes a link, is read as a formula when a table is pasted into a spreadsheet, rewrites the terminal through control or direction characters, or is shown unescaped in a report
- a name such as `__proto__` that changes how objects behave inside the tool
- a report that changes with the clock, the time zone or the locale of the machine
- a sentence in src/data.js that differs from the saved page in research/sources

Out of scope: whether a statement of work is a good contract, whether a section says the right thing, the law that applies to it (the tool gives no legal advice; docs/limits.md lists what it cannot see), who may change the configuration in your repository, and where your pipeline keeps the reports.

Read [docs/threat-model.md](docs/threat-model.md) for the rest.
