// utils/logisticsRules.js

export function isCustomsApplicable(from, to) {
  const code = c => (c || '').toUpperCase().replace(/\s/g, '');
  const gb = c => /^[A-Z]{1,2}[0-9][0-9A-Z]?[0-9][A-Z]{2}$/.test(code(c)) && !/^BT/.test(code(c));
  const ni = c => /^BT\d{1,2}/.test(code(c));
  const roi = c => /^[D|V]\d{1,2}/.test(code(c));
  const eu = c => /^[A-Z]{1,2}\d{1,2}$/.test(code(c)) && !ni(c) && !gb(c) && !roi(c);

  const fromPost = code(from);
  const toPost = code(to);

  if (
    (gb(fromPost) && (ni(toPost) || roi(toPost))) ||
    (ni(fromPost) && roi(toPost)) ||
    (roi(fromPost) && (gb(toPost) || ni(toPost))) ||
    (eu(fromPost) || eu(toPost))
  ) return true;

  return false;
}

export function isVatApplicable(from, to) {
  const code = c => (c || '').toUpperCase().replace(/\s/g, '');
  const gb = c => /^[A-Z]{1,2}[0-9][0-9A-Z]?[0-9][A-Z]{2}$/.test(code(c)) && !/^BT/.test(code(c));
  const roi = c => /^[D|V]\d{1,2}/.test(code(c));
  const eu = c => /^[A-Z]{1,2}\d{1,2}$/.test(code(c)) && !gb(c) && !roi(c) && !/^BT/.test(code(c));

  if ((gb(from) && eu(to)) || (eu(from) && gb(to))) return false;
  return true;
}
