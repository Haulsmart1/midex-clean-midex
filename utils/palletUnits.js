// /utils/palletUnits.js
export function palletUnits(pallets = []) {
  const validTypes = ['parcel', 'barrel', 'pallet', 'double pallet', 'ibc'];
  let units = pallets
    .filter(p =>
      p && typeof p.type === 'string' &&
      validTypes.includes(p.type.trim().toLowerCase()) &&
      Number(p.weight) > 0
    )
    .reduce((sum, p) => {
      const type = p.type.trim().toLowerCase();
      return sum + (type === 'double pallet' ? 2 : 1);
    }, 0);
  // Always at least 1 if user entered a valid type (even if weight 0)
  if (
    units === 0 &&
    pallets.length &&
    typeof pallets[0].type === 'string' &&
    validTypes.includes(pallets[0].type.trim().toLowerCase())
  ) {
    return 1;
  }
  return units;
}
