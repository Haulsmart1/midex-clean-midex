// /components/partners/tcrConfig.js

const TCR_POSTCODES = [
  // Cumbria
  "LA", "CA",
  // Lancashire, Merseyside, Cheshire, North Wales
  "PR", "FY", "BB", "BL", "WN", "L", "M", "OL", "WA", "CH",
  // North Wales
  "LL",
  // More Cheshire/Manchester
  "CW", "SK"
];

const tcrConfig = {
  name: "TCR Courier Services",
  coverage: TCR_POSTCODES.join(', '),
  coverageAreas: TCR_POSTCODES,
  primaryColor: "#ff5757",
  logo: "/logos/tcr.png",
  allowedRolesForFinance: ["admin", "finance", "super"]
};

export default tcrConfig;
