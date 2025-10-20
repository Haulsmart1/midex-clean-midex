const TCR_POSTCODES = [
  // Cumbria
  "LA", "CA",

  // Merseyside (Liverpool proper only)
  "L1", "L2", "L3", "L4", "L5", "L6", "L7", "L8", "L9",
  "L10", "L11", "L12", "L13", "L14", "L15", "L16", "L17",
  "L18", "L19", "L20", "L21", "L22", "L23", "L24", "L25",

  // Manchester proper
  "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9",
  "M11", "M12", "M13", "M14", "M15", "M16", "M17", "M18", "M19",
  "M20", "M21", "M22", "M23", "M24", "M25", "M26", "M27", "M28",
  "M29", "M30", "M31", "M32", "M33", "M34", "M35", "M38", "M40",
  "M41", "M43", "M44", "M45", "M46", "M50", "M60", "M90",

  // Other NW England
  "PR", "FY", "BB", "BL", "WN", "OL", "WA", "CH", "CW", "SK",

  // North Wales
  "LL"
];

const tcrConfig = {
  name: "TCR Courier Services",
  coverage: TCR_POSTCODES.join(', '),
  coverageAreas: TCR_POSTCODES,
  primaryColor: "#ff5757",
  logo: "/logos/tcr.png",
  allowedRolesForFinance: ["admin", "finance", "super"],

  // 🔒 Hard filter for collection/delivery legs
  filterLeg: (leg) => {
    const normalize = (pc) => pc?.toUpperCase().replace(/\s/g, '') || '';
    const postcode = normalize(leg?.postcode);

    // Check against allowed prefixes
    return TCR_POSTCODES.some(area => postcode.startsWith(area));
  }
};

export default tcrConfig;
