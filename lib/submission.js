import { eventYear, eventMonth, isSelectableMonth } from './constants';

const GU_MONTH_FULL = ['જાન્યુઆરી', 'ફેબ્રુઆરી', 'માર્ચ', 'એપ્રિલ', 'મે', 'જૂન', 'જુલાઈ', 'ઓગસ્ટ', 'સપ્ટેમ્બર', 'ઓક્ટોબર', 'નવેમ્બર', 'ડિસેમ્બર'];
const MONTHS_LABEL = `${GU_MONTH_FULL[eventMonth]} ${eventYear}`;

const MIN_DAYS = 5;
const DAY_MS = 1000 * 60 * 60 * 24;

const STR_FIELDS = [
  'surname',
  'name',
  'fatherName',
  'village',
  'address',
  'mobile',
  'age',
  'shirtSize',
  'fromDate',
  'toDate',
  'otherDepartment',
  'santName',
  'santMobile',
  'photoData',
];

const LIST_FIELDS = ['departments', 'sevaType'];

const toStr = v => (typeof v === 'string' ? v.trim() : v === undefined || v === null ? '' : String(v));

const toStrList = v => {
  if (Array.isArray(v)) return v.filter(x => typeof x === 'string').map(x => x.trim()).filter(Boolean);
  return typeof v === 'string' && v.trim() !== '' ? [v.trim()] : [];
};

const inSelectableMonth = d => !isNaN(d) && isSelectableMonth(d.getFullYear(), d.getMonth());

export function validateSevaDates({ fromDate, toDate } = {}) {
  if (!fromDate || !toDate) return null;

  const from = new Date(fromDate);
  const to = new Date(toDate);

  if (!inSelectableMonth(from) || !inSelectableMonth(to)) {
    return `સેવાની તારીખ ફક્ત ${MONTHS_LABEL} માટે જ સાધ્ય છે.`;
  }

  if (Math.round((to - from) / DAY_MS) < MIN_DAYS - 1) {
    return `સેવાનો સમયગાળો ઓછામાં ઓછો ${MIN_DAYS} દિવસ હોવો જ જોઈએ.`;
  }

  return null;
}

export function sanitizeSubmission(body = {}) {
  const out = {};

  for (const key of STR_FIELDS) out[key] = toStr(body[key]);
  for (const key of LIST_FIELDS) out[key] = toStrList(body[key]);

  return out;
}
