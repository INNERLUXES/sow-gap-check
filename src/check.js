// Puts the parts together: reads the configuration and the document, matches the headings to the checklist, runs the
// rules and builds the report. This is the only place that knows every part. An input that cannot be read stops the run
// with an InputError that names every problem; there is then no verdict.

import { ConfigError, defaultConfig, readConfig } from './config.js';
import { FILE_LIMITS, readTextFile } from './files.js';
import { MARKDOWN_LIMITS, columnOf, readMarkdown, textOf } from './markdown.js';
import { excerpt, findPhrases, hasWordsOutside, maskLine, preparePhrase } from './inline.js';
import { headingExtents, matchHeading } from './sections.js';
import { RULES, decide, ruleById } from './rules.js';
import { FACTS, LEVELS, NOT_LEGAL_ADVICE, factPage } from './data.js';
import { grouped, listText, plural } from './size.js';
import { safeText } from './text.js';

// maxFindingsPerRule keeps a report readable: past it, the findings of a rule are counted in a note, not listed.
export const LIMITS = { ...FILE_LIMITS, ...MARKDOWN_LIMITS, maxFindingsPerRule: 500 };

export class InputError extends Error {
  constructor(problems) {
    super(problems.join('\n'));
    this.problems = problems;
  }
}

const RULE_ORDER = RULES.map((r) => r.id);
const SCANNED = new Set(['paragraph', 'item', 'row']);
const quoteOf = (t) => safeText(t, 80);

// The masked text of every segment of a unit, computed once.
function masked(unit) {
  if (!unit.masks) unit.masks = unit.segments.map((g) => maskLine(g.s));
  return unit.masks;
}

// The heading of a unit as a report names it.
const headingName = (headings, index) => (index < 0 ? 'the text before the first heading' : headings[index].text ? `"${quoteOf(headings[index].text)}"` : `the heading on line ${headings[index].line}`);

// Why an acceptance criterion counts as measurable, or null: a digit, a number word, a code span, a named standard, or a
// quoted name next to a test word.
export function measurableElement(unit, prepared) {
  const masks = masked(unit);
  const loose = masks.map((m) => m.loose).join(' ');
  const digit = /[0-9]/.exec(loose);
  if (digit) return 'a number';
  if (masks.some((m) => m.codeSpans > 0)) return 'a code span';
  const standard = findPhrases(loose, prepared.standards)[0];
  if (standard) return `the standard ${standard.phrase}`;
  const word = findPhrases(masks.map((m) => m.plain).join(' '), prepared.measureWords)[0];
  if (word) return `the number word ${word.phrase}`;
  if (masks.some((m) => m.quotes > 0) && findPhrases(masks.map((m) => m.plain).join(' '), prepared.testWords).length) return 'a quoted name next to a test word';
  return null;
}

// Builds the report from a read document and a configuration. meta: { version, file, configFile, maxFindingsPerRule }.
export function buildReport(doc, config, meta = {}) {
  const file = meta.file ?? 'document';
  const maxPerRule = meta.maxFindingsPerRule ?? LIMITS.maxFindingsPerRule;
  const prepare = (list) => list.map(preparePhrase);
  const prepared = { vague: prepare(config.vaguePhrases), placeholders: prepare(config.placeholders), standards: prepare(config.standards), measureWords: prepare(config.measureWords), testWords: prepare(config.testWords) };
  const { headings, units } = doc;
  const sections = config.sections;
  const active = sections.filter((s) => s.level !== 'off');
  const sectionById = new Map(sections.map((s) => [s.id, s]));
  const notes = [];

  // Which sections each heading matches, and the units under each heading.
  const matches = headings.map((h) => matchHeading(h.text, sections));
  const ends = headingExtents(headings);
  const firstUnit = new Array(headings.length + 1).fill(units.length);
  for (let u = units.length - 1; u >= 0; u -= 1) if (units[u].heading >= 0) firstUnit[units[u].heading] = u;
  for (let h = headings.length - 1; h >= 0; h -= 1) if (firstUnit[h] > firstUnit[h + 1]) firstUnit[h] = firstUnit[h + 1];
  const extent = (h) => [firstUnit[h], firstUnit[ends[h]]];

  // Placeholders in every unit with text, and whether the unit holds nothing but placeholders.
  for (const unit of units) {
    unit.placeholders = [];
    if (!unit.segments.length) continue;
    masked(unit).forEach((m, g) => {
      for (const hit of findPhrases(m.plain, prepared.placeholders)) unit.placeholders.push({ ...hit, segment: g });
    });
    unit.onlyPlaceholders = unit.placeholders.length > 0 && !masked(unit).some((m, g) => hasWordsOutside(m.plain, unit.placeholders.filter((p) => p.segment === g)));
  }

  // The state of every heading: body, empty (nothing under it) or placeholder (nothing but placeholders).
  const states = headings.map((h, i) => {
    const [a, b] = extent(i);
    const body = units.slice(a, b).filter((u) => u.kind !== 'heading');
    if (!body.length) return { state: 'empty', placeholders: [] };
    if (body.every((u) => u.segments.length && u.onlyPlaceholders)) return { state: 'placeholder', placeholders: [...new Set(body.flatMap((u) => u.placeholders.map((p) => p.phrase)))] };
    return { state: 'body', placeholders: [] };
  });

  // The checklist: each section with the headings that match it and its status.
  const checklist = sections.map((s) => {
    const found = [];
    headings.forEach((h, i) => {
      const m = matches[i].find((x) => x.id === s.id);
      if (m) found.push({ index: i, text: quoteOf(h.text), line: h.line, alias: m.alias, state: states[i].state });
    });
    let status = 'off';
    if (s.level !== 'off') status = !found.length ? 'missing' : found.every((f) => f.state !== 'body') ? 'empty' : 'found';
    return { id: s.id, title: s.title, level: s.level, status, headings: found, aliases: s.aliases, wording: s.wording, criteria: s.criteria, basis: s.basis, own: s.own, origin: s.origin };
  });
  const entry = new Map(checklist.map((c) => [c.id, c]));

  const findings = [];
  const counts = new Map();
  const push = (f) => {
    const n = (counts.get(f.rule) ?? 0) + 1;
    counts.set(f.rule, n);
    if (n <= maxPerRule) findings.push(f);
  };
  const where = (line, column) => (line ? `${file}:${line}${column ? `:${column}` : ''}` : file);
  const rules = config.rules;
  const suppressed = new Set();

  // no-out-of-scope: a scope that holds text and no out-of-scope section, or an empty one.
  if (rules.noOutOfScope.level !== 'off') {
    const inScope = entry.get(rules.noOutOfScope.inScope);
    const outOfScope = entry.get(rules.noOutOfScope.outOfScope);
    if (inScope.status === 'found' && (outOfScope.status === 'missing' || outOfScope.status === 'empty')) {
      const h = inScope.headings.find((x) => x.state === 'body');
      const head = headings[h.index];
      suppressed.add(outOfScope.id);
      const empty = outOfScope.headings[0];
      push({
        rule: 'no-out-of-scope',
        level: rules.noOutOfScope.level,
        section: outOfScope.id,
        line: head.line,
        column: head.column,
        at: where(head.line, head.column),
        found: empty ? `the scope is described under "${h.text}" (line ${h.line}), but the section ${outOfScope.title} under "${empty.text}" (line ${empty.line}) is empty` : `the scope is described under "${h.text}" (line ${h.line}), but there is no section ${outOfScope.title}`,
        why: [
          `${inScope.title} is matched by the heading "${h.text}" through the alias ${h.alias}, and holds text`,
          empty ? `every heading that matches ${outOfScope.title} has no text under it or nothing but placeholders` : `no heading matches an alias of ${outOfScope.title}: ${listText(outOfScope.aliases, 6)}`,
          'what is not part of the work is then decided later, by whoever reads the scope'
        ]
      });
    }
  }

  // missing-section.
  for (const c of checklist) {
    if (c.status !== 'missing' || suppressed.has(c.id)) continue;
    const level = rules.missingSection[c.level];
    if (!level || level === 'off') continue;
    push({ rule: 'missing-section', level, section: c.id, line: null, column: null, at: where(null), found: `${c.level} section ${c.title} is missing`, why: [`no heading matches one of its aliases: ${listText(c.aliases, 8)}`, c.own ? `on the checklist as the tool's own choice: ${c.own}` : `on the checklist because ${c.basis.map((k) => `"${FACTS[k].text}"`).join(' and ')}`] });
  }

  // empty-section, for every heading; a heading of a suppressed section is reported by no-out-of-scope instead.
  const coveredByEmpty = new Set();
  if (rules.emptySection.level !== 'off') {
    headings.forEach((h, i) => {
      const st = states[i];
      if (st.state === 'body') return;
      const [a, b] = extent(i);
      for (let u = a; u < b; u += 1) coveredByEmpty.add(u);
      // A heading with headings under it that are all empty is reported through them.
      if (ends[i] > i + 1) return;
      const own = matches[i].map((m) => m.id);
      if (own.length && own.every((id) => suppressed.has(id))) return;
      const names = own.map((id) => sectionById.get(id).title);
      push({
        rule: 'empty-section',
        level: rules.emptySection.level,
        section: own[0] ?? null,
        line: h.line,
        column: h.column,
        at: where(h.line, h.column),
        found: st.state === 'empty' ? `the heading ${headingName(headings, i)} has no text under it` : `the heading ${headingName(headings, i)} holds nothing but ${listText(st.placeholders.map((p) => safeText(p, 30)), 3)}`,
        why: [names.length ? `the heading matches the checklist section ${listText(names, 3)}` : 'the heading matches no section of the checklist', st.state === 'empty' ? 'there is no paragraph, list, table, code block or block quote before the next heading at its level or above' : 'every piece of text under it is a placeholder once the placeholders are taken out']
      });
    });
  }

  // placeholder, in every unit not covered by an empty section, outside code and quotes.
  if (rules.placeholder.level !== 'off') {
    units.forEach((unit, u) => {
      if (coveredByEmpty.has(u)) return;
      for (const p of unit.placeholders) {
        const g = unit.segments[p.segment];
        const column = columnOf(g.line, g.start + p.from);
        push({ rule: 'placeholder', level: rules.placeholder.level, section: null, line: g.line.no, column, at: where(g.line.no, column), found: `placeholder ${safeText(p.phrase, 40)} in ${headingName(headings, unit.heading)}: ${safeText(excerpt(g.s, p.from, p.to), 120)}`, why: [`${safeText(p.phrase, 40)} is on the list of placeholders; the text around it is not written yet`] });
      }
    });
  }

  // The units under the headings of the sections marked for wording and for criteria, each once, with the innermost
  // marked heading that covers it.
  const marked = (flag) => {
    const out = new Map();
    headings.forEach((h, i) => {
      const own = matches[i].map((m) => sectionById.get(m.id)).filter((s) => s[flag]);
      if (!own.length) return;
      const [a, b] = extent(i);
      for (let u = a; u < b; u += 1) out.set(u, { heading: i, section: own[0] });
    });
    return out;
  };

  if (rules.vagueWording.level !== 'off') {
    for (const [u, ctx] of marked('wording')) {
      const unit = units[u];
      if (!SCANNED.has(unit.kind)) continue;
      masked(unit).forEach((m, g) => {
        const seg = unit.segments[g];
        for (const hit of findPhrases(m.plain, prepared.vague)) {
          const column = columnOf(seg.line, seg.start + hit.from);
          push({ rule: 'vague-wording', level: rules.vagueWording.level, section: ctx.section.id, line: seg.line.no, column, at: where(seg.line.no, column), found: `vague wording "${safeText(seg.s.slice(hit.from, hit.to), 40)}" in ${headingName(headings, ctx.heading)}: ${safeText(excerpt(seg.s, hit.from, hit.to), 120)}`, why: [`${safeText(hit.phrase, 40)} is on the list of vague phrases, and ${headingName(headings, ctx.heading)} matches ${ctx.section.title}, a section marked for wording`, 'two people can read it two ways, so it cannot decide whether the work is done'] });
        }
      });
    }
  }

  if (rules.unmeasurableCriterion.level !== 'off') {
    for (const [u, ctx] of marked('criteria')) {
      const unit = units[u];
      if (unit.kind !== 'item' || !unit.leaf || !unit.segments.length || unit.onlyPlaceholders) continue;
      if (measurableElement(unit, prepared)) continue;
      const seg = unit.segments[0];
      const column = columnOf(seg.line, seg.start);
      push({ rule: 'unmeasurable-criterion', level: rules.unmeasurableCriterion.level, section: ctx.section.id, line: seg.line.no, column, at: where(seg.line.no, column), found: `acceptance criterion with nothing to measure in ${headingName(headings, ctx.heading)}: ${safeText(excerpt(textOf(unit.segments), 0, 0), 120)}`, why: [`a list item under ${headingName(headings, ctx.heading)}, which matches ${ctx.section.title}, a section marked for criteria`, 'it holds no digit, no number word, no code span, no named standard and no quoted name next to a test word'] });
    }
  }

  for (const [rule, n] of counts) if (n > maxPerRule) notes.push(`${rule}: ${plural(n, 'finding')}; the first ${grouped(maxPerRule)} are listed`);
  if (!headings.length) notes.push('the document has no heading that is not inside a list or a block quote, so no section of the checklist can be found');
  for (const line of doc.unclosed) notes.push(`a code fence opened on line ${grouped(line)} is never closed, so the rest of its container, up to the end of the document or of its list item or block quote, is read as code and not checked`);
  if (doc.tooDeep !== null) notes.push(`lists or block quotes are nested more than ${LIMITS.maxDepth} deep from line ${grouped(doc.tooDeep)}; the deeper text is read as plain paragraphs`);

  const levelRank = (l) => LEVELS.length - LEVELS.indexOf(l);
  findings.sort((a, b) => levelRank(a.level) - levelRank(b.level) || (a.line ?? 0) - (b.line ?? 0) || (a.column ?? 0) - (b.column ?? 0) || RULE_ORDER.indexOf(a.rule) - RULE_ORDER.indexOf(b.rule));

  const verdict = decide(findings, config.failOn);
  const ruleLevels = (key) => (key === 'missingSection' ? { required: rules.missingSection.required, recommended: rules.missingSection.recommended } : { level: rules[key].level });
  return {
    tool: 'sow-gap-check',
    version: meta.version ?? '',
    document: { file, lines: doc.lines, ...doc.counts },
    config: {
      file: meta.configFile ?? null,
      name: config.name,
      failOn: config.failOn,
      sections: { total: active.length, required: active.filter((s) => s.level === 'required').length, recommended: active.filter((s) => s.level === 'recommended').length, off: sections.length - active.length },
      phrases: { vague: config.vaguePhrases.length, placeholders: config.placeholders.length, standards: config.standards.length, measureWords: config.measureWords.length, testWords: config.testWords.length },
      rules: RULES.map((r) => ({ id: r.id, ...ruleLevels(r.key), rule: r.rule(rules[r.key], config) }))
    },
    totals: { found: checklist.filter((c) => c.status === 'found').length, empty: checklist.filter((c) => c.status === 'empty').length, missing: checklist.filter((c) => c.status === 'missing').length, off: checklist.filter((c) => c.status === 'off').length },
    checklist: checklist.map(({ headings: hs, basis, ...c }) => ({ ...c, headings: hs.map(({ index, ...h }) => h), basis: basis.map((k) => ({ ...FACTS[k], page: factPage(k) })) })),
    findings: findings.map((f) => ({ ...f, basis: ruleById(f.rule).facts.map((k) => ({ ...FACTS[k], page: factPage(k) })) })),
    verdict,
    notes,
    notice: NOT_LEGAL_ADVICE
  };
}

// Reads the paths and gives the report. o: { document, config, failOn, base, limits, version }.
export async function checkPaths(o) {
  const base = o.base ?? process.cwd();
  const limits = { ...LIMITS, ...(o.limits ?? {}) };
  const problems = [];
  let config = defaultConfig();
  let configFile = null;
  if (o.config) {
    try {
      const read = await readTextFile(o.config, base, limits.maxConfigBytes);
      configFile = read.file;
      config = readConfig(read.text, read.file);
    } catch (error) {
      if (error instanceof ConfigError) problems.push(...error.problems.map((p) => p.text));
      else problems.push(error.message);
    }
  }
  let doc = null;
  let file = o.document;
  try {
    const read = await readTextFile(o.document, base, limits.maxDocumentBytes);
    file = read.file;
    doc = readMarkdown(read.text, { maxDepth: limits.maxDepth, maxLines: limits.maxLines });
  } catch (error) {
    problems.push(error.reason ? error.message : `${file}: ${error.message}`);
  }
  if (problems.length) throw new InputError(problems.map((p) => safeText(p, 1500)));
  if (o.failOn) config.failOn = o.failOn;
  return buildReport(doc, config, { version: o.version, file, configFile, maxFindingsPerRule: limits.maxFindingsPerRule });
}
