'use strict';

// Missing-field contract for data/opportunities.json.
//
// A real advert often leaves things out (no stipend, no closing date, no
// documents list). That must not stop the listing being published, but it must
// never be hidden either. So a field the advert does not state is stored as an
// explicit "missing" value AND a human-readable comment in `field_notes`:
//
//   "stipend": "Not stated",
//   "field_notes": { "stipend": "Stipend unknown: the advert does not state one." }
//
// Missing values:
//   text fields  -> NOT_STATED ("Not stated")           (description -> DESCRIPTION_PLACEHOLDER)
//   closing_date -> null
//   list fields  -> []
//
// Rule enforced by the validator: every missing field MUST have a non-empty
// comment. Nothing here guesses a value; "unknown" is recorded as unknown.

const NOT_STATED = 'Not stated';
const DESCRIPTION_PLACEHOLDER = 'Details were not provided with this listing. Read the official advert before applying.';

const TEXT_FIELDS = ['sector', 'province', 'qualification_level', 'stipend'];
const LIST_FIELDS = ['eligibility', 'documents_needed', 'employment_eligibility'];
// Every field that may legitimately be missing (and therefore needs a comment).
const NOTE_FIELDS = [...TEXT_FIELDS, 'closing_date', 'description', ...LIST_FIELDS];

const DEFAULT_NOTES = Object.freeze({
  sector: 'Sector unknown: the advert does not say which sector or SETA this falls under.',
  province: 'Province unknown: the advert does not state where the opportunity is based. Check the official advert.',
  qualification_level: 'Minimum qualification unknown: the advert does not state one.',
  stipend: 'Stipend unknown: the advert does not state one.',
  closing_date: 'Closing date unknown: no closing date was published. Confirm on the official page before applying.',
  description: 'No description was available when this listing was added.',
  eligibility: 'Eligibility requirements unknown: the advert does not list any.',
  documents_needed: 'Required documents unknown: the advert does not list any.',
  employment_eligibility: 'Who may apply (unemployed, student or employed) is unknown: the advert does not say.',
});

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim() !== '';
}

// True when `value` is how the given field represents "not stated".
function isMissing(field, value) {
  if (field === 'closing_date') return value === null || value === undefined || value === '';
  if (field === 'description') return !isNonEmptyText(value) || value === DESCRIPTION_PLACEHOLDER;
  if (LIST_FIELDS.includes(field)) return !Array.isArray(value) || value.length === 0;
  if (TEXT_FIELDS.includes(field)) return !isNonEmptyText(value) || value.trim() === NOT_STATED;
  return false;
}

// Fields of a stored record that are missing, in NOTE_FIELDS order.
function missingFields(record) {
  const r = record || {};
  return NOTE_FIELDS.filter((field) => isMissing(field, r[field]));
}

// Missing fields that have no usable comment in record.field_notes.
function missingWithoutNote(record) {
  const notes = record && record.field_notes && typeof record.field_notes === 'object' ? record.field_notes : {};
  return missingFields(record).filter((field) => !isNonEmptyText(notes[field]));
}

// The value stored for a missing field.
function missingValue(field) {
  if (field === 'closing_date') return null;
  if (field === 'description') return DESCRIPTION_PLACEHOLDER;
  if (LIST_FIELDS.includes(field)) return [];
  return NOT_STATED;
}

// Short label for display, e.g. "Stipend".
function fieldLabel(field) {
  return field.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

module.exports = {
  NOT_STATED,
  DESCRIPTION_PLACEHOLDER,
  NOTE_FIELDS,
  LIST_FIELDS,
  TEXT_FIELDS,
  DEFAULT_NOTES,
  isMissing,
  missingFields,
  missingWithoutNote,
  missingValue,
  fieldLabel,
};
