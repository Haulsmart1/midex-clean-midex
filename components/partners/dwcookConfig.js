// /components/partners/dwCookConfig.js

const DWCOOK_POSTCODES = [
  // Devon
  "EX", "PL", "TQ",
  // Cornwall
  "TR",
  // Somerset
  "TA"
];

const dwCookConfig = {
  name: "DW Cook",
  coverage: DWCOOK_POSTCODES.join(', '),
  coverageAreas: DWCOOK_POSTCODES,
  primaryColor: "#ff7c47",
  logo: "/logos/dwcook.png",
  allowedRolesForFinance: ["admin", "finance", "super"]
};

export default dwCookConfig;
