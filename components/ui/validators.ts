/**
 * validators.ts — Validation rules for ValidatedInput
 *
 * Each validator declares:
 *   validate()     — returns true for a complete, correctly formatted value
 *   errorMessage   — shown to the user when validation fails
 *
 * To add a new validator:
 *   1. Add the key to ValidatorKey
 *   2. Add the rule object to VALIDATORS
 *   3. Add a matching mask in masks.ts
 */

export type ValidatorKey =
  | 'tin'
  | 'td-number'
  | 'phone'
  | 'rpt-id'
  | 'barangay-code'
  | 'text'
  | 'email'
  | 'employee-Id'
  | 'name'
  | 'account-number'
  | 'ORnumber'
  | 'permission-&-role-name'
  | 'pin'
  | 'arp-number'
  | 'lot-number'
  | 'decimal-numeric';

export interface Validator {
  /** Returns true when the fully-formatted value is complete and valid. */
  validate: (value: string) => boolean;
  /** User-facing message rendered below the field on validation failure. */
  errorMessage: string;
}

export const VALIDATORS: Record<ValidatorKey, Validator> = {
  // ── TIN: ###-###-###  or  ###-###-###-###
  'tin': {
    validate: (v) => /^\d{3}-\d{3}-\d{3}(-\d{3})?$/.test(v),
    errorMessage: 'TIN must be 123-456-789 or 123-456-789-000',
  },

  // ── Phone: ### ### #### (no leading zero)
  'phone': {
    validate: (v) => /^[1-9]\d{2} \d{3} \d{4}$/.test(v),
    errorMessage: 'Phone must be in ### ### #### format',
  },

  // ── RPT ID: ##-###-####
  'rpt-id': {
    validate: (v) => /^\d{2}-\d{3}-\d{4}$/.test(v),
    errorMessage: 'RPT ID must be ##-###-####',
  },

  // ── Barangay Code: ###-##
  'barangay-code': {
    validate: (v) => /^\d{3}-\d{2}$/.test(v),
    errorMessage: 'Barangay code must be ###-##',
  },

  'text': {
    validate: () => true,
    errorMessage: '',
  },

  'email': {
    validate: (v) => /^.+@.+\..+$/.test(v),
    errorMessage: 'Email must follow the format: name@example.com',
  },

  'employee-Id': {
    validate: (v) => /^\d{4}-\d{4}$/.test(v),
    errorMessage: 'ID must be in XXXX-XXXX format (8 digits)',
  },

'name': {
  validate: (v) => {
    if (v.length < 2 || v.length > 25) return false;

    const counts = {
      "'": (v.match(/\'/g) || []).length,
      ".": (v.match(/\./g) || []).length,
      "-": (v.match(/\-/g) || []).length,
    };
    if (counts["'"] > 3 || counts["."] > 3 || counts["-"] > 3) return false;

    return /^[A-Z\u00C0-\u017F][a-zA-Z\s\-\.\'\u00C0-\u017F]*$/.test(v);
  },
  errorMessage: 'Name must start with a capital, be 2-25 chars, and use symbols sparingly (max 3 each).',
},

  'ORnumber': {
    validate: (v) => /^OR-\d{4}-\d{6}$/.test(v),
    errorMessage: 'OR Number must be OR-XXXX-XXXXXX format',
  },

   // ── TD Number: TD-####-#### up to TD-####-####-####-####-####
  'td-number': {
    validate: (v) => /^TD-\d{4}-\d{4}(-\d{4}){0,3}$/.test(v),
    errorMessage: 'TD Number must be at least TD-####-#### (e.g. TD-2024-0001)',
  },

  'account-number': {
    validate: (v) => /^\d{4}-\d{4}-\d{2}$/.test(v),
    errorMessage: 'Account number must be XXXX-XXXX-XX format (10 digits)',
  },

 'permission-&-role-name': {
  validate: (v) => {
    const isRightLength = v.length >= 2 && v.length <= 50;
    // Fix: Explicitly escape the dot, space, underscore, and hyphen
    const isNormal = /^[a-zA-Z0-9\.\s\_\-']+$/.test(v); 
    return isRightLength && isNormal;
  },
  errorMessage: 'Must start with a capital, be 2-50 chars, and use no emojis or special symbols.',
},

  'pin': {
    validate: (v) => /^\d{3}-\d{2}-\d{3}-\d{2}-\d{3}$/.test(v),
    errorMessage: 'PIN must be XXX-XX-XXX-XX-XXX (prefix defaults to 088-01)',
  },

  'arp-number': {
    validate: (v) => /^[0-9]{4}-[0-9]{4}-[0-9]{4}-[0-9]{4}$/.test(v),
    errorMessage: 'ARP must be XXXX-XXXX-XXXX-XXXX (16 digits)',
  },

  'lot-number': {
    validate: (v) => /^[0-9-]{1,12}$/.test(v) && !/^-+$/.test(v),
    errorMessage: 'Lot/Block must be numeric, max 12 chars',
  },

  'decimal-numeric': {
    validate: (v) => {
      const num = parseFloat(v.replace(/,/g, ''));
      return Number.isFinite(num) && num > 0;
    },
    errorMessage: 'Must be a valid decimal number > 0',
  },
};
