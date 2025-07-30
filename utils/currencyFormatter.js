export function formatCurrency(value, currency = 'gbp') {
  const symbol = currency === 'eur' ? '€' : '£';
  return `${symbol}${value.toFixed(2)}`;
}
