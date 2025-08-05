// /components/partners/alpTransConfig.js

const ALPTRANS_POSTCODES = [
  // South Wales
  "CF", "NP", "SA",
  // Midlands East
  "B", "CV", "LE", "NG", "NN", "ST", "DE", "WS", "DY",
  // Oxfordshire
  "OX",
  // Anglia
  "CB", "IP", "NR", "PE",
  // North/East London & Essex
  "N", "E", "EN", "IG", "RM", "CM",
  // Buckinghamshire (and surrounds)
  "MK", "HP", "LU", "SL", "BU",
];

const alpTransConfig = {
  name: "Alp Trans",
  coverage: ALPTRANS_POSTCODES.join(', '),
  coverageAreas: ALPTRANS_POSTCODES,
  primaryColor: "#40c4ff",
  logo: "/logos/alptrans.png",
  allowedRolesForFinance: ["admin", "finance", "super"], // ← Add role access here
};

export default alpTransConfig;
