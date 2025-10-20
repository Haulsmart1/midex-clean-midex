const DESPATCH247_POSTCODES = [
  "SS", "CM", "CO", "IG", "RM",           // Essex
  "E", "SE", "SW", "W", "WC", "BR",       // South & West London
  "ME", "DA", "CT", "TN",                 // Kent
  "SO", "GU", "PO", "RG",                 // Hampshire
  "BH",                                   // Dorset
  "SN"                                    // Wiltshire
];

const despatch247Config = {
  name: "247Despatch",
  description: "Covers South, London, and South East. Matches collections only.",
  coverage: DESPATCH247_POSTCODES.join(', '),
  coverageAreas: DESPATCH247_POSTCODES,
  primaryColor: "#ffce00",
  logo: "/logos/247despatch.png",
  allowedRolesForFinance: ["admin", "finance", "super"],

  // ✅ Only match collection postcode
  filterLeg: (leg) => {
    const normalize = (pc) => pc?.toUpperCase().replace(/\s/g, '') || '';
    const postcode = normalize(leg?.postcode);
    return DESPATCH247_POSTCODES.some(prefix => postcode.startsWith(prefix));
  },

  // 🔄 Allocation endpoint (optional, if used)
  allocateToExchange: async (leg) => {
    return fetch('/api/haulsmart/post-leg', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leg }),
    });
  }
};

export default despatch247Config;
