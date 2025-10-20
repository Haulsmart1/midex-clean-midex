const FASTFREIGHT_SCOTLAND = [
  // ✅ Precise Scottish postcode areas — EH (Edinburgh) intentionally excluded
  "AB", "DD", "DG", "FK", "G1", "G2", "G3", "G4", "G5", "G11", "G12", "G13", "G14", "G15", "G20", "G21", "G22", "G23", "G31", "G32", "G33", "G34", "G40", "G41", "G42", "G43", "G44", "G45", "G46", "G51", "G52", "G53", "G60", "G61", "G62", "G63", "G64", "G65", "G66", "G67", "G68", "G69", // selected valid Glasgow codes, not just G
  "HS", "IV", "KA", "KW", "KY", "ML", "PA", "PH", "TD", "ZE"
];

const fastfreightConfig = {
  name: "Fast Freight",
  description: "All Scottish postcodes (including Highlands & Islands) EXCEPT EH (Edinburgh).",
  coverageAreas: FASTFREIGHT_SCOTLAND,
  primaryColor: "#09e5fa",
  logo: "/logos/fastfreight.png",
  allowedRolesForFinance: ["admin", "finance", "super"],

  // 🔍 Filtering logic: match either collection or delivery postcode
  filterLeg: (leg) => {
    const normalize = (pc) => pc?.toUpperCase().replace(/\s/g, '') || '';
    const postcode = normalize(leg?.postcode);

    // Prevents false positives like EH being caught by "E" or G catching "GL"
    return FASTFREIGHT_SCOTLAND.some(prefix => postcode.startsWith(prefix));
  },

  // 📨 Allocation API
  allocateToExchange: async (leg) => {
    return fetch('/api/haulsmart/post-leg', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leg }),
    });
  }
};

export default fastfreightConfig;
