const test = require('node:test');
const assert = require('node:assert/strict');
const { NOT_STATED, DESCRIPTION_PLACEHOLDER, NOTE_FIELDS, DEFAULT_NOTES, isMissing, missingFields, missingWithoutNote, missingValue } = require('./field-notes');

const full = () => ({
  sector: 'Engineering', province: 'Gauteng', qualification_level: 'Matric', stipend: 'R5 000 per month', closing_date: '2026-12-01',
  description: 'A twelve month engineering learnership.', eligibility: ['Citizen'], documents_needed: ['ID'], employment_eligibility: ['unemployed'],
});

test('a complete record has no missing fields', () => {
  assert.deepEqual(missingFields(full()), []);
});

test('each field has its own "missing" representation', () => {
  assert.ok(isMissing('stipend', NOT_STATED));
  assert.ok(isMissing('stipend', '  '));
  assert.ok(isMissing('closing_date', null));
  assert.ok(isMissing('description', DESCRIPTION_PLACEHOLDER));
  assert.ok(isMissing('eligibility', []));
  assert.ok(!isMissing('stipend', 'R5 000 per month'));
  assert.ok(!isMissing('eligibility', ['Citizen']));
  assert.ok(!isMissing('title', ''), 'only note-able fields can be missing');
  for (const field of NOTE_FIELDS) assert.ok(isMissing(field, missingValue(field)), field);
});

test('every missing field must have a non-empty comment', () => {
  const record = { ...full(), stipend: NOT_STATED, closing_date: null, eligibility: [] };
  assert.deepEqual(missingWithoutNote(record), ['stipend', 'closing_date', 'eligibility']);
  record.field_notes = { stipend: 'Stipend unknown: not in the advert.', closing_date: '   ', eligibility: DEFAULT_NOTES.eligibility };
  assert.deepEqual(missingWithoutNote(record), ['closing_date']);
});

test('every note-able field has a default comment that says the value is unknown or unavailable', () => {
  for (const field of NOTE_FIELDS) assert.match(DEFAULT_NOTES[field], /unknown|No description/i, field);
});
