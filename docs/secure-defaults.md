# Secure defaults

The default run is the safe run. Nothing in the first section needs a flag, and none of it can be switched off. The rest of the document is about what the tool cannot do for you: where the documents come from, where a report goes, and who may change the configuration.

## How the tool behaves by default

- **Reads, never runs.** The tool reads the statement of work and the configuration. It opens no network connection, follows no link, image or autolink of the document, refuses an argument that looks like an address, and starts no program.
- **A checklist from the first run.** Without a configuration, the default checklist of 21 sections applies, with eight of them required, and every rule is on. A configuration changes the defaults entry by entry; a checklist with every section off is refused, because the check would always pass.
- **Unknown keys are errors.** A key in the configuration that the tool does not know stops the run, with its line and a suggestion, so a typo cannot leave a default in place unnoticed. A key named twice stops the run. Removing a phrase that is not on a list, adding one that is already there, and an alias shared by two sections stop the run too.
- **Fail closed on what it cannot read.** An input that cannot be read stops the run with exit code `2` and no verdict: a missing file, a file over its limit, a binary file, UTF-16, bytes that are not UTF-8, more lines than the limit.
- **Empty is not found.** A section whose every heading has nothing under it, or nothing but placeholders, counts as empty, and is reported.
- **No regular expression from the input.** No pattern is built from the document or the configuration; phrases are found with indexOf, and every search runs once over a line.
- **No prototype tricks.** Sections are kept in arrays and maps, JSON objects are built with own properties, and a section id is a letter followed by letters and digits, so a name such as `__proto__` is refused or stays data.
- **Clean output.** Text from the input has control characters, line separators and direction controls removed and its length capped before it reaches a report or an error message. Markdown cells escape pipes, backslashes, square brackets, backticks, asterisks, underscores, line breaks and `<`, `>` and `&`, and a cell that starts with `=`, `+`, `-`, `@`, a tab or a carriage return gets a leading apostrophe, so a table pasted into a spreadsheet is not read as a formula.
- **The same file gives the same report.** The tool reads no clock, no time zone, no locale and no random number. Case is changed for the letters A to Z without the locale of the machine.
- **No legal advice.** Every report ends with the sentence that it checks the structure and the wording of the document only and is not a legal review. [The decision](decisions/0001-read-headings-not-meaning-and-give-no-legal-advice.md) explains why.
- **No dependencies.** Node 22 or newer and nothing else.

## Rules that make the check stricter

- **`"failOn": "notice"`.** Every finding fails the run, missing recommended sections included.
- **`"rules": { "missingSection": { "recommended": "warning" } }`.** A missing recommended section fails the run at the default fail level.
- **More sections required.** Set `level` to `required` for the sections your contracts must always have, as the example configuration does for security, data protection and intellectual property.
- **More sections read for wording.** Set `wording` on the scope or the support section to read them for vague phrases too, and `criteria` on a section of service levels to judge its items as criteria.
- **Your own words.** Add the vague phrases and placeholders your team sees with `add`.

## Running it in a pipeline

```yaml
permissions:
  contents: read
steps:
  - uses: actions/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7.0.1
  - uses: actions/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7.0.0
    with:
      node-version: 22
  - name: Statement of work gaps
    run: npx --yes github:INNERLUXES/sow-gap-check contracts/sow.md --config contracts/sow-check.json --format markdown >> "$GITHUB_STEP_SUMMARY"
```

- Give the job read access to the contents and nothing more. The tool needs no secret.
- Pin every action to a full commit, as above, and pin the tool to a release commit or a tag you have read, because `npx` runs what it downloads.
- Do not hide the exit code with a trailing `|| true`.
- A statement of work can hold prices, names and business plans. Post the report only where the people who may read the contract read it.

## Protecting the configuration

The configuration decides which sections are required, which words are vague and what fails the run. Keep it in the repository, in its own path, and put the path in `CODEOWNERS` with the people who own the contracts; require their review in branch protection. Review a change that sets a section or a rule to off, removes a phrase, or lowers `failOn` like a change to code: each of them can let a weak document pass.

## SSDF

The repository is checked against NIST SP 800-218 (SSDF) in its own pipeline and before every release, with `ssdf-repo-check` pinned to its release commit. The evidence it looks for is in these files:

| Practice | Evidence in this repository |
| --- | --- |
| PO.1 Define security requirements | CONTRIBUTING.md, docs/secure-defaults.md |
| PO.2 Roles and responsibilities | .github/CODEOWNERS |
| PO.3 Toolchain | .github/workflows/ci.yml, codeql.yml, release.yml |
| PO.4 Criteria for security checks | CodeQL with the security-extended queries, the SSDF gate in ci.yml and release.yml |
| PO.5 Secure environments | a `permissions:` block in every workflow, actions pinned to commits |
| PS.1 Protect the code | .gitignore for keys and `.env`, `npm run check` for committed secrets |
| PS.2 Integrity of releases | SHA-256 checksums and a build provenance attestation in release.yml |
| PS.3 Archive and provenance | a CycloneDX SBOM and the CHANGELOG with every release |
| PW.1 Design for security | docs/threat-model.md |
| PW.2 Review the design | docs/decisions |
| PW.4 Reuse secure components | no runtime dependencies, a lock file, Dependabot |
| PW.5 Secure coding | CONTRIBUTING.md, `npm run check` |
| PW.6 Build settings | `npm ci` from the lock file |
| PW.7 Code review | the pull request template and CODEOWNERS |
| PW.8 Testing | `npm test` on Linux, Windows and macOS with Node 22 and 24, `npm run test:coverage`, hostile input tests |
| PW.9 Secure defaults | this document |
| RV.1 Find vulnerabilities | SECURITY.md, Dependabot |
| RV.2 Respond to vulnerabilities | SECURITY.md |
