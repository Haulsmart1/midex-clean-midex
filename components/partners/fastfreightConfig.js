// Build compatibility for an existing partner route whose original config is missing.
// Fail closed on postcode routing until verified operational coverage is supplied.
const fastfreightConfig = {
  name: 'Fast Freight',
  primaryColor: '#0065bd',
  coverageAreas: [],
  coverage: 'Not configured',
  filterLeg: () => false,
};
export default fastfreightConfig;
