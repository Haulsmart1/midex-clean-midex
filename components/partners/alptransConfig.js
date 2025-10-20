const ALPTRANS_POSTCODES = [
  // Wales
  "CF", "NP", "SA",

  // Midlands
  "B", "CV",
  "LE1", "LE2", "LE3", "LE4", "LE5", "LE6", "LE7", "LE8", "LE9",
  "LE10", "LE11", "LE12", "LE13", "LE14", "LE15", "LE16", "LE17", "LE18", "LE19",
  "NG", "NN", "ST", "DE", "WS", "DY",

  // East
  "OX", "CB", "IP", "NR", "PE",

  // Greater London and surroundings
  "N", "E", "EN", "IG", "RM", "CM", "MK", "HP", "LU", "SL", "BU"
];

const alptransConfig = {
  name: "Alp Trans",
  primaryColor: "#40c4ff",
  logo: "/logos/alptrans.png",
  coverageAreas: ALPTRANS_POSTCODES,
  allowedRolesForFinance: ["admin", "finance", "super"],

  filterLeg: (leg) => {
    try {
      const normalizeOutwardCode = (postcode) => {
        if (!postcode) return '';
        const pc = postcode.toUpperCase().replace(/\s/g, '');
        const match = pc.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)/);
        return match ? match[1] : '';
      };

      const code = normalizeOutwardCode(leg?.postcode);

      const isMatch = ALPTRANS_POSTCODES.some(prefix => {
        return prefix.length >= 2
          ? code.startsWith(prefix)
          : code === prefix;
      });

      console.log(`[FILTER] AlpTrans checking postcode: ${leg?.postcode} → ${code} → Match: ${isMatch}`);
      return isMatch;
    } catch (e) {
      console.warn('[FILTER ERROR] alptransConfig.filterLeg failed for:', leg, e);
      return false;
    }
  }
};

export default alptransConfig;

