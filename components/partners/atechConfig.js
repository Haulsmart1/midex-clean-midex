const ATECH_AREAS = ["EH", "TD", "NE", "DL", "TS", "SR", "LS", "HU", "YO", "BD"];

const atechConfig = {
  name: "Atech Transport",
  coverage: ATECH_AREAS.join(', '),
  coverageAreas: ATECH_AREAS,
  primaryColor: "#09e5fa",
  logo: "/logos/atech.png",
  allowedRolesForFinance: ["admin", "finance", "super"],

  // 🔍 Add this filtering logic
  filterLeg: (leg) => {
    const normalize = (pc) => pc?.toUpperCase().replace(/\s/g, '') || '';
    const postcode = normalize(leg?.postcode);
    return ATECH_AREAS.some(prefix => postcode.startsWith(prefix));
  }
};

export default atechConfig;
