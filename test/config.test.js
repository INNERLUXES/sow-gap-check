import { test } from 'node:test';
import assert from 'node:assert/strict';
import { CONFIG_LIMITS, ConfigError, DEFAULT_PLACEHOLDERS, DEFAULT_SECTIONS, DEFAULT_VAGUE_PHRASES, KEYS, PHRASE_LISTS, RULE_IDS, SECTION_KEYS, defaultConfig, defaultsAsConfig, readConfig, validateConfig } from '../src/index.js';
import { configOf, lineOf } from './helpers.js';

// The configuration file: every key, the defaults it changes, and the errors it gives.

const problemsOf = (text) => {
  try {
    readConfig(text, 'config.json');
  } catch (error) {
    assert.ok(error instanceof ConfigError, error.message);
    return error.problems.map((p) => p.text);
  }
  assert.fail('the configuration was accepted');
};
const problemOf = (object) => problemsOf(JSON.stringify(object, null, 2)).join('\n');

test('defaults: the built-in checklist, lists and rules, and the defaults written out read back to the same configuration', () => {
  const d = defaultConfig();
  assert.equal(d.defaults, true);
  assert.deepEqual(d.sections.map((s) => s.id), DEFAULT_SECTIONS.map((s) => s.id));
  assert.equal(d.sections.filter((s) => s.level === 'required').length, 8);
  assert.deepEqual(d.vaguePhrases, DEFAULT_VAGUE_PHRASES);
  assert.deepEqual(d.placeholders, DEFAULT_PLACEHOLDERS);
  assert.equal(d.failOn, 'warning');
  assert.deepEqual(d.rules.noOutOfScope, { level: 'error', inScope: 'inScope', outOfScope: 'outOfScope' });
  const back = readConfig(JSON.stringify(defaultsAsConfig()), 'defaults.json');
  assert.deepEqual(back.sections.map(({ id, title, level, aliases, wording, criteria }) => ({ id, title, level, aliases, wording, criteria })), d.sections.map(({ id, title, level, aliases, wording, criteria }) => ({ id, title, level, aliases, wording, criteria })));
  for (const k of Object.keys(PHRASE_LISTS)) assert.deepEqual(back[k], d[k], k);
  assert.deepEqual(back.rules, d.rules);
  assert.equal(back.name, 'default checklist');
  defaultConfig().rules.placeholder.level = 'off';
  assert.equal(defaultConfig().rules.placeholder.level, 'warning', 'the defaults are copied, never shared');
});

test('sections: a default section is changed key by key, a new one is added, and useDefaultSections: false starts empty', () => {
  const c = configOf({ sections: { security: { level: 'required', aliases: ['security', 'secure development'] }, accessibility: { title: 'Accessibility', aliases: ['accessibility'], level: 'recommended', criteria: true } } });
  const security = c.sections.find((s) => s.id === 'security');
  assert.equal(security.level, 'required');
  assert.deepEqual(security.aliases, ['security', 'secure development']);
  assert.deepEqual(security.aliasWords[1], ['secure', 'development']);
  assert.equal(security.title, 'Security requirements', 'the keys not given keep their default');
  assert.equal(security.origin, 'changed');
  const added = c.sections.at(-1);
  assert.deepEqual([added.id, added.criteria, added.origin, added.basis], ['accessibility', true, 'config', []]);
  const own = configOf({ useDefaultSections: false, sections: { scope: { title: 'Scope', aliases: ['scope'], level: 'required' } }, rules: { noOutOfScope: { level: 'off' } } });
  assert.deepEqual(own.sections.map((s) => s.id), ['scope']);
});

test('sections: a new section needs a title, aliases and a level; ids, aliases and levels are checked', () => {
  assert.match(problemOf({ sections: { accessibility: { aliases: ['a11y'] } } }), /sections\.accessibility: is a new section and needs title, level/);
  assert.match(problemOf({ useDefaultSections: false, sections: { security: { level: 'required' } } }), /it is a default section, but useDefaultSections is false/);
  assert.match(problemOf({ sections: { 'bad id': { level: 'off' } } }), /the id of a section is a letter followed by letters and digits/);
  assert.match(problemOf({ sections: { security: { level: 'must' } } }), /must be one of required, recommended, off/);
  assert.match(problemOf({ sections: { security: { aliases: [] } } }), /is an empty list; a section needs at least one alias/);
  assert.match(problemOf({ sections: { security: { aliases: ['---'] } } }), /has no letter or digit, so no heading can match it/);
  assert.match(problemOf({ sections: { security: { aliases: ['Security', 'security'] } } }), /security is named twice/);
  assert.match(problemOf({ sections: { security: { aliases: ['scope'] } } }), /the alias scope is also an alias of inScope; a heading would match both/);
  assert.match(problemOf({ sections: { security: { wording: 'yes' } } }), /must be true or false, not a string/);
  assert.match(problemOf({ sections: { security: { aliasses: ['x'] } } }), /sections\.security\.aliasses: unknown key; did you mean aliases\?/);
  assert.match(problemOf({ sections: [] }), /must be an object that maps the id of a section to its keys/);
  const all = Object.fromEntries(DEFAULT_SECTIONS.map((s) => [s.id, { level: 'off' }]));
  assert.match(problemOf({ sections: all }), /the checklist has no section that is not off/);
});

test('lists: replace, add and remove, and removing or adding twice is an error', () => {
  const c = configOf({ vaguePhrases: { replace: ['fast', 'robust'], add: ['smooth'], remove: ['robust'] }, placeholders: { add: ['N/A'] } });
  assert.deepEqual(c.vaguePhrases, ['fast', 'smooth']);
  assert.deepEqual(c.placeholders, [...DEFAULT_PLACEHOLDERS, 'N/A']);
  assert.match(problemOf({ vaguePhrases: { remove: ['blazing'] } }), /vaguePhrases\.remove: blazing is not in the list/);
  assert.match(problemOf({ vaguePhrases: { add: ['Fast'] } }), /vaguePhrases\.add: Fast is already in the list/);
  assert.match(problemOf({ standards: { replace: ['ISO', 'iso'] } }), /iso is named twice/);
  assert.match(problemOf({ testWords: { replace: 'test' } }), /must be a list of strings, not a string/);
  assert.match(problemOf({ measureWords: { replace: [''] } }), /must be a string that is not empty/);
  assert.match(problemOf({ measureWords: { replace: ['x'.repeat(CONFIG_LIMITS.maxString + 1)] } }), /at most 120 characters/);
  assert.match(problemOf({ placeholders: { replace: Array.from({ length: CONFIG_LIMITS.maxPhrases + 1 }, (_, i) => `p${i}`) } }), /holds more than 500 entries/);
  assert.match(problemOf({ placeholders: { adds: ['x'] } }), /unknown key; did you mean add\?/);
  assert.match(problemOf({ placeholders: { append: ['x'] } }), /unknown key; the keys here are replace, add, remove/);
});

test('rules: levels or off, the sections of no-out-of-scope must exist and be on, and the fail level', () => {
  const c = configOf({ rules: { missingSection: { recommended: 'off' }, vagueWording: { level: 'error' } }, failOn: 'error' });
  assert.deepEqual(c.rules.missingSection, { required: 'error', recommended: 'off' });
  assert.equal(c.rules.vagueWording.level, 'error');
  assert.equal(c.failOn, 'error');
  assert.match(problemOf({ rules: { vagueWording: { level: 'high' } } }), /must be one of notice, warning, error, or off/);
  assert.match(problemOf({ failOn: 'off' }), /failOn: must be one of notice, warning, error/);
  assert.match(problemOf({ rules: { noOutOfScope: { inScope: 'scopeOfWork' } } }), /scopeOfWork is not a section of the checklist/);
  assert.match(problemOf({ sections: { outOfScope: { level: 'off' } } }), /outOfScope is off; set the rule to off or turn the section on/);
  assert.match(problemOf({ rules: { noOutOfScope: { outOfScope: 'inScope' } } }), /inScope and outOfScope name the same section/);
  assert.match(problemOf({ rules: { noOutOfScope: { inScope: 'in scope' } } }), /must be the id of a section/);
  assert.match(problemOf({ rules: { vagueWordings: {} } }), /rules\.vagueWordings: unknown key; did you mean vagueWording\?/);
  assert.doesNotThrow(() => configOf({ sections: { outOfScope: { level: 'off' } }, rules: { noOutOfScope: { level: 'off' } } }));
});

test('the file: one JSON object, a key named twice is refused, unknown keys name the keys there, and every problem has its line', () => {
  const text = '{\n  "name": "x",\n  "rules": {\n    "placeholder": { "level": "warning" },\n    "placeholder": { "level": "off" }\n  }\n}';
  assert.match(problemsOf(text)[0], /^config\.json: line 5, column 5: the name "placeholder" appears twice in one object/);
  assert.match(problemsOf('[]')[0], /the configuration must be one JSON object, not an array/);
  assert.match(problemsOf('{"zzz": 1}')[0], /unknown key; the keys here are name, useDefaultSections, sections/);
  const lined = '{\n  "failOn": "warning",\n  "rules": {\n    "emptySection": { "level": 3 }\n  }\n}';
  assert.equal(problemsOf(lined)[0], `config.json:${lineOf(lined, '"level": 3')}: rules.emptySection.level: must be one of notice, warning, error, or off`);
  assert.equal(problemsOf('{"name": 5, "failOn": 1}').length, 2, 'every problem is listed');
  assert.throws(() => validateConfig(null), ConfigError);
  assert.equal(configOf({ name: 'Team rules' }).name, 'Team rules');
});

test('keys: the tree of keys, the keys of a section and the rule ids', () => {
  assert.deepEqual(Object.keys(KEYS), ['name', 'useDefaultSections', 'sections', 'vaguePhrases', 'placeholders', 'standards', 'measureWords', 'testWords', 'rules', 'failOn']);
  assert.deepEqual(Object.keys(SECTION_KEYS), ['title', 'aliases', 'level', 'wording', 'criteria']);
  assert.deepEqual(Object.keys(RULE_IDS), Object.keys(KEYS.rules));
  assert.deepEqual(Object.keys(PHRASE_LISTS), ['vaguePhrases', 'placeholders', 'standards', 'measureWords', 'testWords']);
});
