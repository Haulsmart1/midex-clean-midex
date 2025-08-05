// /components/partners/bondConfig.js

const BOND_NI_POSTCODES = ["BT"]; // Northern Ireland

const ROI_EIRCODE_KEYS = [
  "A41", "A42", "A45", "A63", "A67", "A75", "A81", "A82", "A83", "A84", "C15",
  "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11",
  "D12", "D13", "D14", "D15", "D16", "D17", "D18", "D20", "D22", "D24", "E21",
  "E25", "E32", "E34", "E41", "E45", "E53", "E91", "F12", "F23", "F26", "F28",
  "F31", "F35", "F42", "F45", "F52", "F56", "G04", "G12", "G14", "G16", "G18",
  "G20", "G21", "H12", "H14", "H16", "H18", "H23", "K32", "K34", "K36", "K45",
  "K56", "N37", "N39", "N41", "N91", "P12", "P14", "P17", "P24", "P25", "P31",
  "P32", "P36", "P43", "P47", "P51", "P56", "P61", "P67", "P72", "P75", "P81",
  "P85", "R14", "R21", "R32", "R35", "R42", "R45", "R51", "R56", "T12", "T23",
  "T34", "T45", "T56", "V14", "V15", "V23", "V31", "V35", "V42", "V92", "V93",
  "V94", "W12", "W23", "W34", "X35", "X36", "X42", "X91", "Y14", "Y21", "Y25",
  "Y34", "Y35"
];

const bondConfig = {
  name: "Bond Deliveries",
  coverage: "BT (Northern Ireland), All Eircode routing keys (Republic of Ireland)",
  coverageAreas: [...BOND_NI_POSTCODES, ...ROI_EIRCODE_KEYS],
  primaryColor: "#9b4dff",
  logo: "/logos/bond.png",
  allowedRolesForFinance: ["admin", "finance", "super"],
  isIrelandBooking: (leg) => {
    const check = (pc) => {
      if (!pc) return false;
      if (pc.toUpperCase().startsWith("BT")) return true;
      const key = pc.replace(/\s/g, "").substring(0, 3).toUpperCase();
      return ROI_EIRCODE_KEYS.includes(key);
    };
    return check(leg.collection?.postcode) || check(leg.delivery?.postcode);
  }
};

export default bondConfig;
