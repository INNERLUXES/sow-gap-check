// The configuration: the checklist of sections with their aliases and levels, the lists of phrases, the levels of the
// rules and the fail level. Without a configuration file the defaults of src/defaults.js apply; a file changes them
// entry by entry (docs/inputs.md). Every key the tool does not know is an error, so a typo such as "aliasses" cannot
// silently leave the default in place, and an entry of a list that is removed but was never there is an error too. The
// file is read with the strict JSON reader of src/json.js, which refuses an object that names a key twice.

import { JsonError, jsonProblem, parseJson } from './json.js';
import { LEVELS, SECTION_LEVELS } from './data.js';
import { DEFAULT_FAIL_ON, DEFAULT_MEASURE_WORDS, DEFAULT_PLACEHOLDERS, DEFAULT_RULES, DEFAULT_SECTIONS, DEFAULT_STANDARDS, DEFAULT_TEST_WORDS, DEFAULT_VAGUE_PHRASES } from './defaults.js';
import { normalizeHeading, wordsOf } from './sections.js';
import { safeText } from './text.js';

export const CONFIG_LIMITS = { maxSections: 100, maxAliases: 50, maxPhrases: 500, maxString: 120 };

// The lists of phrases, by their key in the configuration, with their defaults.
export const PHRASE_LISTS = {
  vaguePhrases: DEFAULT_VAGUE_PHRASES,
  placeholders: DEFAULT_PLACEHOLDERS,
  standards: DEFAULT_STANDARDS,
  measureWords: DEFAULT_MEASURE_WORDS,
  testWords: DEFAULT_TEST_WORDS
};

// The keys of the configuration file, as a tree: what each level may hold.
export const KEYS = {
  name: 'string',
  useDefaultSections: 'boolean',
  sections: 'sections',
  vaguePhrases: { replace: 'phrases', add: 'phrases', remove: 'phrases' },
  placeholders: { replace: 'phrases', add: 'phrases', remove: 'phrases' },
  standards: { replace: 'phrases', add: 'phrases', remove: 'phrases' },
  measureWords: { replace: 'phrases', add: 'phrases', remove: 'phrases' },
  testWords: { replace: 'phrases', add: 'phrases', remove: 'phrases' },
  rules: {
    missingSection: { required: 'ruleLevel', recommended: 'ruleLevel' },
    emptySection: { level: 'ruleLevel' },
    placeholder: { level: 'ruleLevel' },
    vagueWording: { level: 'ruleLevel' },
    unmeasurableCriterion: { level: 'ruleLevel' },
    noOutOfScope: { level: 'ruleLevel', inScope: 'sectionId', outOfScope: 'sectionId' }
  },
  failOn: 'level'
};

// The keys of one section in sections.
export const SECTION_KEYS = { title: 'string', aliases: 'aliases', level: 'sectionLevel', wording: 'boolean', criteria: 'boolean' };

// The rule ids as the reports show them, by their key in the configuration.
export const RULE_IDS = { missingSection: 'missing-section', emptySection: 'empty-section', placeholder: 'placeholder', vagueWording: 'vague-wording', unmeasurableCriterion: 'unmeasurable-criterion', noOutOfScope: 'no-out-of-scope' };

export class ConfigError extends Error {
  constructor(problems) {
    super(problems.map((p) => p.text).join('\n'));
    this.problems = problems;
  }
}

// The edit distance of two short words, for the "did you mean" of an unknown key.
function distance(a, b) {
  if (a.length > 40 || b.length > 40) return 99;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const row = [i];
    for (let j = 1; j <= b.length; j += 1) row[j] = Math.min(prev[j] + 1, row[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = row;
  }
  return prev[b.length];
}

const kindOf = (v) => (v === null ? 'null' : Array.isArray(v) ? 'an array' : typeof v === 'object' ? 'an object' : typeof v === 'string' ? 'a string' : typeof v === 'number' ? 'a number' : 'a boolean');
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/;
const SECTION_ID = /^[A-Za-z][A-Za-z0-9]{0,39}$/;
const isObject = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
const fold = (s) => s.trim().split(/\s+/).join(' ').toLowerCase();

// A section of the checklist in its normal form.
function sectionOf(s, origin) {
  return {
    id: s.id,
    title: s.title,
    level: s.level,
    aliases: [...s.aliases],
    aliasWords: s.aliases.map((a) => wordsOf(normalizeHeading(a, { numbered: false }))),
    wording: Boolean(s.wording),
    criteria: Boolean(s.criteria),
    basis: [...(s.basis ?? [])],
    own: s.own ?? null,
    origin
  };
}

// The configuration that applies without a file.
export function defaultConfig() {
  return {
    name: '',
    defaults: true,
    sections: DEFAULT_SECTIONS.map((s) => sectionOf(s, 'default')),
    ...Object.fromEntries(Object.entries(PHRASE_LISTS).map(([k, list]) => [k, [...list]])),
    rules: JSON.parse(JSON.stringify(DEFAULT_RULES)),
    failOn: DEFAULT_FAIL_ON
  };
}

// The defaults written out as a configuration file, for --print-defaults: every section with every key, every list in
// full, every rule. useDefaultSections is false, so the file holds the whole checklist and can be edited on its own.
export function defaultsAsConfig() {
  return {
    name: 'default checklist',
    useDefaultSections: false,
    sections: Object.fromEntries(DEFAULT_SECTIONS.map((s) => [s.id, { title: s.title, aliases: s.aliases, level: s.level, wording: Boolean(s.wording), criteria: Boolean(s.criteria) }])),
    ...Object.fromEntries(Object.entries(PHRASE_LISTS).map(([k, list]) => [k, { replace: list }])),
    rules: DEFAULT_RULES,
    failOn: DEFAULT_FAIL_ON
  };
}

// Checks the value of a configuration file against KEYS and builds the normal form over the defaults.
export function validateConfig(value, lines = new Map(), file = 'config') {
  const problems = [];
  const lim = CONFIG_LIMITS;
  const at = (path) => (path === '' ? file : `${file}${lines.has(path) ? `:${lines.get(path)}` : ''}: ${path}`);
  const bad = (path, message) => {
    problems.push({ path, text: `${at(path)}: ${message}` });
  };

  const text = (v, path) => {
    if (typeof v !== 'string' || v.trim() === '') return bad(path, `must be a string that is not empty, not ${kindOf(v)}`);
    if (v.length > lim.maxString || CONTROL.test(v)) return bad(path, `must be at most ${lim.maxString} characters with no control character`);
    return v.trim();
  };
  const strings = (v, path, max, check) => {
    if (!Array.isArray(v)) return bad(path, `must be a list of strings, not ${kindOf(v)}`);
    if (v.length > max) return bad(path, `holds more than ${max} entries`);
    const out = [];
    const seen = new Set();
    let ok = true;
    v.forEach((item, i) => {
      const p = `${path}[${i}]`;
      const t = text(item, p);
      if (t === undefined) {
        ok = false;
        return;
      }
      const k = fold(t);
      if (seen.has(k)) {
        bad(p, `${safeText(t, 60)} is named twice`);
        ok = false;
        return;
      }
      if (check && !check(t, p)) {
        ok = false;
        return;
      }
      seen.add(k);
      out.push(t);
    });
    return ok ? out : undefined;
  };

  const check = (kind, v, p) => {
    if (kind === 'string') return text(v, p);
    if (kind === 'boolean') return typeof v === 'boolean' ? v : bad(p, `must be true or false, not ${kindOf(v)}`);
    if (kind === 'level') return typeof v === 'string' && LEVELS.includes(v) ? v : bad(p, `must be one of ${LEVELS.join(', ')}`);
    if (kind === 'ruleLevel') return typeof v === 'string' && (LEVELS.includes(v) || v === 'off') ? v : bad(p, `must be one of ${LEVELS.join(', ')}, or off`);
    if (kind === 'sectionLevel') return typeof v === 'string' && SECTION_LEVELS.includes(v) ? v : bad(p, `must be one of ${SECTION_LEVELS.join(', ')}`);
    if (kind === 'sectionId') return typeof v === 'string' && SECTION_ID.test(v) ? v : bad(p, 'must be the id of a section, such as inScope');
    if (kind === 'phrases') return strings(v, p, lim.maxPhrases);
    if (kind === 'aliases') {
      const list = strings(v, p, lim.maxAliases, (t, q) => (normalizeHeading(t, { numbered: false }) === '' ? bad(q, `${safeText(t, 60)} has no letter or digit, so no heading can match it`) ?? false : true));
      if (list && list.length === 0) return bad(p, 'is an empty list; a section needs at least one alias');
      return list;
    }
    if (kind === 'sections') {
      if (!isObject(v)) return bad(p, `must be an object that maps the id of a section to its keys, not ${kindOf(v)}`);
      const ids = Object.keys(v);
      if (ids.length > lim.maxSections) return bad(p, `holds more than ${lim.maxSections} sections`);
      const out = {};
      for (const id of ids) {
        const q = `${p}.${id}`;
        if (!SECTION_ID.test(id)) {
          bad(q, 'the id of a section is a letter followed by letters and digits, at most 40 characters, such as dataProtection');
          continue;
        }
        const s = walk(v[id], SECTION_KEYS, q);
        if (s) out[id] = s;
      }
      return out;
    }
    return bad(p, 'cannot be read');
  };

  // Walks a level of the configuration against its allowed keys; returns the checked values by key.
  const walk = (obj, spec, path) => {
    if (!isObject(obj)) {
      bad(path, `must be an object, not ${kindOf(obj)}`);
      return null;
    }
    const out = {};
    for (const key of Object.keys(obj)) {
      const p = path ? `${path}.${key}` : key;
      if (!Object.hasOwn(spec, key)) {
        const near = Object.keys(spec).map((k) => [k, distance(k.toLowerCase(), key.toLowerCase())]).sort((a, b) => a[1] - b[1])[0];
        bad(p, `unknown key${near && near[1] <= 3 ? `; did you mean ${near[0]}?` : `; the keys here are ${Object.keys(spec).join(', ')}`}`);
        continue;
      }
      const kind = spec[key];
      out[key] = typeof kind === 'object' ? walk(obj[key], kind, p) : check(kind, obj[key], p);
    }
    return out;
  };

  if (!isObject(value)) {
    bad('', `the configuration must be one JSON object, not ${kindOf(value)}`);
    throw new ConfigError(problems);
  }
  const top = walk(value, KEYS, '');
  if (problems.length) throw new ConfigError(problems);

  const config = defaultConfig();
  config.defaults = false;
  config.name = top.name ? safeText(top.name, 120) : '';

  // The checklist: the defaults unless useDefaultSections is false, each changed by the keys given for its id; an id that
  // is not a default adds a section, which needs a title, aliases and a level.
  const base = top.useDefaultSections === false ? [] : config.sections;
  const sections = base.map((s) => ({ ...s }));
  for (const [id, given] of Object.entries(top.sections ?? {})) {
    const p = `sections.${id}`;
    const known = sections.find((s) => s.id === id);
    if (known) {
      const changed = sectionOf({ ...known, ...given, aliases: given.aliases ?? known.aliases }, 'changed');
      sections[sections.indexOf(known)] = changed;
    } else {
      const missing = ['title', 'aliases', 'level'].filter((k) => given[k] === undefined);
      if (missing.length) {
        const def = DEFAULT_SECTIONS.some((s) => s.id === id) ? '; it is a default section, but useDefaultSections is false' : '';
        bad(p, `is a new section and needs ${missing.join(', ')}${def}`);
        continue;
      }
      sections.push(sectionOf({ id, ...given, basis: [], own: null }, 'config'));
    }
  }
  if (sections.length > lim.maxSections) bad('sections', `the checklist holds more than ${lim.maxSections} sections`);
  const aliasOwner = new Map();
  for (const s of sections) {
    if (s.level === 'off') continue;
    s.aliasWords.forEach((words, i) => {
      const key = words.join(' ');
      const other = aliasOwner.get(key);
      if (other && other !== s.id) bad(`sections.${s.id}`, `the alias ${safeText(s.aliases[i], 60)} is also an alias of ${other}; a heading would match both`);
      else aliasOwner.set(key, s.id);
    });
  }
  if (!sections.some((s) => s.level !== 'off')) bad('sections', 'the checklist has no section that is not off; a check with no section would always pass');
  config.sections = sections;

  // The lists of phrases: replace, then add, then remove.
  for (const key of Object.keys(PHRASE_LISTS)) {
    const spec = top[key];
    if (!spec) continue;
    let list = spec.replace ? [...spec.replace] : [...config[key]];
    for (const t of spec.add ?? []) {
      if (list.some((x) => fold(x) === fold(t))) bad(`${key}.add`, `${safeText(t, 60)} is already in the list`);
      else list.push(t);
    }
    for (const t of spec.remove ?? []) {
      if (!list.some((x) => fold(x) === fold(t))) bad(`${key}.remove`, `${safeText(t, 60)} is not in the list`);
      list = list.filter((x) => fold(x) !== fold(t));
    }
    if (list.length > lim.maxPhrases) bad(key, `holds more than ${lim.maxPhrases} phrases`);
    config[key] = list;
  }

  // The rules and the fail level.
  for (const [key, given] of Object.entries(top.rules ?? {})) Object.assign(config.rules[key], given);
  const scope = config.rules.noOutOfScope;
  if (scope.level !== 'off') {
    for (const k of ['inScope', 'outOfScope']) {
      const s = sections.find((x) => x.id === scope[k]);
      if (!s) bad(`rules.noOutOfScope.${k}`, `${scope[k]} is not a section of the checklist; set the rule to off or name a section`);
      else if (s.level === 'off') bad(`rules.noOutOfScope.${k}`, `${scope[k]} is off; set the rule to off or turn the section on`);
    }
    if (scope.inScope === scope.outOfScope) bad('rules.noOutOfScope', 'inScope and outOfScope name the same section');
  }
  if (top.failOn) config.failOn = top.failOn;
  if (problems.length) throw new ConfigError(problems);
  return config;
}

// Reads the text of a configuration file into the normal form. file is the path shown. Throws ConfigError with every
// problem.
export function readConfig(text, file = 'config') {
  let parsed;
  try {
    parsed = parseJson(text);
  } catch (error) {
    if (error instanceof JsonError) throw new ConfigError([{ path: '', text: `${file}: ${jsonProblem(error, text)}` }]);
    throw error;
  }
  return validateConfig(parsed.value, parsed.lines, file);
}
