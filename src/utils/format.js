const priceFormatter = new Intl.NumberFormat('pl-PL', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPrice = (value) => {
  const num = Number(value);
  if (Number.isNaN(num)) return '';
  return `${priceFormatter.format(num)} zł`;
};

export const parsePriceInput = (raw) => {
  if (raw === null || raw === undefined) return '';
  const normalized = String(raw).replace(',', '.').replace(/[^0-9.]/g, '');
  const parts = normalized.split('.');
  if (parts.length <= 1) return normalized;
  return `${parts[0]}.${parts.slice(1).join('').slice(0, 2)}`;
};

export const priceInputToNumber = (input) => {
  const normalized = parsePriceInput(input);
  const num = Number(normalized);
  return Number.isNaN(num) ? null : num;
};
