// /components/partners/247despatchConfig.js
const DESPATCH247_POSTCODES = [
  "SS", "CM", "CO", "IG", "RM",           // Essex
  "E", "SE", "SW", "W", "WC", "BR",       // South & West London
  "ME", "DA", "CT", "TN",                 // Kent
  "SO", "GU", "PO", "RG",                 // Hampshire
  "BH",                                   // Dorset
  "SN",                                   // Wiltshire
];

const despatch247Config = {
  name: "247Despatch",
  coverage: DESPATCH247_POSTCODES.join(', '),
  coverageAreas: DESPATCH247_POSTCODES,
  primaryColor: "#ffce00",
  logo: "/logos/247despatch.png",
  allowedRolesForFinance: ["admin", "finance", "super"]
};

export default despatch247Config;
