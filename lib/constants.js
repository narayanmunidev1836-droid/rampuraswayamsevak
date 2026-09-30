export const departments = ['ભોજનાલય વિભાગ'];

// Festival month used for the on-page text (૨૩ – ૩૧ December ૨૦૨૆)
export const eventYear = 2026;
export const eventMonth = 11; // 0-indexed → ડિસેમ્બર

export const eventStartDay = 23;
export const eventEndDay = 31;

// Seva dates are restricted to this single month (December 2026)
export const isSelectableMonth = (year, month) =>
  year === eventYear && month === eventMonth;

export const lastSelectableDate = () => new Date(eventYear, eventMonth + 1, 0);

export const sevaTypes = [
  'કાર',
  'બોલેરો',
  'આઈશર',
  'ટ્રેક્ટર મીની / મોટું'
];

export const shirtSizes = [
  '38',
  '40',
  '42',
  '44',
  '46',
  '48'
];