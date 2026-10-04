## What changes

<!-- One or two sentences. -->

## Checks

- [ ] `npm test`, `npm run test:coverage`, `npm run check` and `npm run example` pass, and the files under `examples/output` are the ones `npm run example` wrote
- [ ] A change to a rule, the checklist or the Markdown reader is described in docs/method.md or docs/inputs.md, says what it can and cannot see, and has a test with the document written inline and a near miss on each side
- [ ] A section added to the default checklist names the sentences of a saved page it comes from, or is marked as the tool's own choice with its reason in `src/defaults.js` and docs/rules-and-sources.md
- [ ] A change to a quoted sentence follows the saved page: the new page text is saved in research/sources, `src/data.js` and docs/rules-and-sources.md match it, and nothing was added from memory
- [ ] Every key the tool does not know is still an error, and a key named twice is still refused
- [ ] Text from the input goes through `safeText` before it reaches a report, a note or an error message
- [ ] The tool still opens no network connection, follows no link in the document, runs no program and writes nothing but the report `--out` names
- [ ] No sentence of a report, the README or the documents reads as legal advice; the tool checks structure and wording only
- [ ] Work stays bounded: the limits of docs/limits.md hold, and a hostile test has a time check that widens under coverage through `NODE_V8_COVERAGE`
- [ ] A test that depends on the operating system (a link, a device) is guarded with `process.platform`, asserts no line or column of its own, and builds its paths with `resolve()` from forward-slash names
- [ ] No real person, company or email address in fixtures or examples, no date, and no number that reads like a year anywhere
- [ ] The commit messages of this pull request follow Conventional Commits
