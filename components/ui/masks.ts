/**
 * masks.ts — Input formatting/masking functions
 *
 * Each function accepts a raw (possibly partially formatted) string
 * and returns the correctly formatted string.
 *
 * To add a new field type:
 *   1. Add the key to MaskKey
 *   2. Implement a maskXxx function with the same signature
 *   3. Register it in MASKS
 *   4. Add a matching validator in validators.ts
 */

export type MaskKey =
  | 'tin'
  | 'td-number'
  | 'phone'
  | 'rpt-id'
  | 'barangay-code'
  | 'text'
  | 'email'
  | 'employee-Id'
  | 'ORnumber' 
  | 'name'
  | 'account-number'
  | 'permission-&-role-name'
  | 'pin'
  | 'arp-number'
  | 'lot-number'
  | 'decimal-numeric'
  | 'year'
  | 'percentage';


export type MaskFn = (raw: string) => string;

// ── Account Number ───────────────────────────────────────────────────────────
// Format: XXXX-XXXX-XX (10 digits: 4-4-2 with dashes)

export function maskAccountNumber(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 10);
  if (d.length <= 4) return d;
  if (d.length <= 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 8)}-${d.slice(8)}`;
}

// ── TIN ───────────────────────────────────────────────────────────────────────
// Format: ###-###-###  or  ###-###-###-###  (9 or 12 digits, dash-separated)

export function maskTin(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 12);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6, 9)}-${d.slice(9)}`;
}

// ── TD Number ─────────────────────────────────────────────────────────────────
// Prefix: "TD-"  |  Format: TD-####-####(-####-####-####)  |  Up to 20 digits
// The prefix is always preserved; only the digit portion is masked.

export function maskTdNumber(raw: string): string {
  const withoutPrefix = raw.replace(/^[Tt][Dd]-?/, '');
  const d = withoutPrefix.replace(/\D/g, '').slice(0, 20);

  if (!d) return 'TD-';

  const parts: string[] = [];
  for (let i = 0; i < d.length; i += 4) {
    parts.push(d.slice(i, i + 4));
  }
  return 'TD-' + parts.join('-');
}

// ── Phone ─────────────────────────────────────────────────────────────────────
// Format: ### ### #### (10 digits, no leading zero)

export function maskPhone(raw: string): string {
  const d = raw.replace(/\D/g, '').replace(/^0+/, '').slice(0, 10);

  // Format as ### ### ####
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)} ${d.slice(3)}`;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

export function maskText(raw: string): string {
  return raw;
}

// ── Email ───────────────────────────────────────────────────────────────────
// Email doesn't need masking, just return as-is

export function maskEmail(raw: string): string {
  return raw;
}

// ── RPT ID ────────────────────────────────────────────────────────────────────
// Format: ##-###-#### (9 digits)

export function maskRptId(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 9);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}-${d.slice(2)}`;
  return `${d.slice(0, 2)}-${d.slice(2, 5)}-${d.slice(5)}`;
}

// ── Barangay Code ─────────────────────────────────────────────────────────────
// Format: ###-## (5 digits)

export function maskBarangayCode(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 5);
  if (d.length <= 3) return d;
  return `${d.slice(0, 3)}-${d.slice(3)}`;
}

// ── Employee ID ─────────────────────────────────────────────────────────────
// Format: XXXX-XXXX (8 digits with hyphen in middle)

export function maskEmployeeId(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 4) return d;
  return `${d.slice(0, 4)}-${d.slice(4)}`;
}

// ── Name ─────────────────────────────────────────────────────────────────────
// Allows only letters, spaces, hyphens, periods, and apostrophes

export function maskName(raw: string): string {
  // 1. Allow A-Z, accents, spaces, and specific punctuation
  let filtered = raw.replace(/[^a-zA-Z\s\-\.\'\u00C0-\u017F]/g, '');
  
  // 2. Block leading punctuation/spaces
  filtered = filtered.replace(/^[^a-zA-Z\u00C0-\u017F]+/, '');

  // 3. Block punctuation following a space
  filtered = filtered.replace(/\s[\-\.\']/g, ' ');

  // 4. Collapse consecutive spaces or punctuation
  filtered = filtered
    .replace(/\s\s+/g, ' ')
    .replace(/\-\-+/g, '-')
    .replace(/\.\.+/g, '.')
    .replace(/\'\'+/g, "'");

  // 5. Apply your 3-occurrence limit
  const limitOccurrences = (str: string, char: string, limit: number) => {
    let count = 0;
    return str.split('').filter(c => {
      if (c === char) {
        count++;
        return count <= limit;
      }
      return true;
    }).join('');
  };

  filtered = limitOccurrences(filtered, "'", 3);
  filtered = limitOccurrences(filtered, ".", 3);
  filtered = limitOccurrences(filtered, "-", 3);

  if (!filtered) return '';

  // 6. Unicode-Aware Capitalization
  // 'u' flag + \p{L} ensures accented letters like 'ñ' are recognized as letters
  return filtered.toLowerCase().replace(/(^|[\s\-\.])\p{L}/gu, (match) => 
    match.toUpperCase()
  );
}

// ── OR Number ────────────────────────────────────────────────────────────────
// Prefix: "OR-" | Format: OR-####-###### | Up to 10 digits

export function maskORNumber(raw: string): string {
  const withoutPrefix = raw.replace(/^[Oo][Rr]-?/, '');
  const d = withoutPrefix.replace(/\D/g, '').slice(0, 10);

  if (!d) return 'OR-';
  if (d.length <= 4) return `OR-${d}`;
  return `OR-${d.slice(0, 4)}-${d.slice(4)}`;
}

// ── Permission/Role Name ────────────────────────────────────────────────────────
// Format: alphanumeric, dots, underscores, hyphens | Up to 50 characters

export function maskPermissionRole(raw: string): string {
  // Fix: Explicitly escape the dot, space, underscore, and hyphen
  let filtered = raw.replace(/[^a-zA-Z0-9\.\s\_\-']/g, '');

  filtered = filtered.slice(0, 50);

  // Fix: Explicitly escape them here as well
  return filtered.replace(/(^|[\.\s\_\-])([a-z0-9])/g, (match, separator, char) => {
    return separator + char.toUpperCase();
  });
}

// ── PIN: 088-01-001-01-001 (3-2-3-2-3 digits)
export function maskPin(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 13);
  if (!digits) return '';
  const groups = [3, 2, 3, 2, 3];
  const parts: string[] = [];
  let idx = 0;
  for (const len of groups) {
    if (idx >= digits.length) break;
    parts.push(digits.slice(idx, idx + len));
    idx += len;
  }
  return parts.join('-');
}

// ── ARP Number: XXXX-XXXX-XXXX-XXXX (numeric, 4 groups)
export function maskArpNumber(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^0-9]/g, '').slice(0, 16);
  if (!cleaned) return '';
  const parts: string[] = [];
  for (let i = 0; i < cleaned.length; i += 4) {
    parts.push(cleaned.slice(i, i + 4));
  }
  return parts.join('-');
}

// ── Lot/Block/Survey: LOT-12 (numeric + optional dash num)
export function maskLotNumber(raw: string): string {
  const cleaned = raw.toUpperCase().replace(/[^0-9-]/g, '').slice(0, 12);
  return cleaned.replace(/-+/g, '-').replace(/^-+/, '');
}

// ── Decimal Numeric: 1,234.56 (comma groups, decimal, max digits)
export function maskDecimalNumeric(raw: string, options: {maxInt: number, maxDec: number, allowDec?: boolean} = {maxInt: 12, maxDec: 2, allowDec: true}): string {
  const {maxInt, maxDec, allowDec} = options;
  let cleaned = raw.replace(/,/g, '').replace(/[^\d.]/g, '').replace(/^0+/, '');
  
  if (!allowDec) {
    const intPart = cleaned.replace(/\./g, '').slice(0, maxInt);
    const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return grouped;
  }
  
  const dotIdx = cleaned.indexOf('.');
  let intPart = dotIdx > 0 ? cleaned.slice(0, dotIdx) : cleaned;
  let decPart = dotIdx > 0 ? cleaned.slice(dotIdx + 1) : '';
  
  intPart = intPart.slice(0, maxInt);
  decPart = decPart.slice(0, maxDec);
  
  const groupedInt = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (!decPart) return groupedInt;
  return `${groupedInt}.${decPart}`;
}

export function maskYear(raw: string): string {
  return raw.replace(/\D/g, '').slice(0, 4);
}

export function maskPercentage(raw: string): string {
  let d = raw.replace(/\D/g, '').slice(0, 3);
  if (parseInt(d, 10) > 100) d = '100';
  return d;
}

// ── Registry ──────────────────────────────────────────────────────────────────

export const MASKS: Record<MaskKey, MaskFn> = {
  'tin': maskTin,
  'td-number': maskTdNumber,
  'phone': maskPhone,
  'rpt-id': maskRptId,
  'barangay-code': maskBarangayCode,
  'text': maskText,
  'email': maskEmail,
  'employee-Id': maskEmployeeId,
  'name': maskName,
  'ORnumber': maskORNumber,
  'account-number': maskAccountNumber,
  'pin': maskPin,
  'permission-&-role-name': maskPermissionRole,
  'arp-number': maskArpNumber,
  'lot-number': maskLotNumber,
  // decimal-numeric takes options param, but MaskFn is (raw: string) => string
  // Use wrapper for compatibility
  'decimal-numeric': ((raw) => maskDecimalNumeric(raw, {maxInt: 12, maxDec: 2, allowDec: true})) as MaskFn,
  'year': maskYear,
  'percentage': maskPercentage,
};

