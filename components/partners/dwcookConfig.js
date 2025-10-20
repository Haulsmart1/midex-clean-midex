const DWCOOK_POSTCODES = ["EX", "PL", "TQ", "TR", "TA"];

const dwCookConfig = {
  name: "DW Cook",
  coverage: DWCOOK_POSTCODES.join(', '),
  coverageAreas: DWCOOK_POSTCODES,
  primaryColor: "#ff7c47",
  logo: "/logos/dwcook.png",
  allowedRolesForFinance: ["admin", "finance", "super"],

  // ✅ Only filter collection points directly
  filterLeg: (leg) => {
    const normalize = (pc) => pc?.toUpperCase().replace(/\s/g, '') || '';
    const postcode = normalize(leg?.postcode); // direct from leg
    return DWCOOK_POSTCODES.some(prefix => postcode.startsWith(prefix));
  }
};

export default dwCookConfig;
