// /components/partners/atechConfig.js

const ATECH_AREAS = ["EH", "TD", "NE", "DL", "TS", "SR", "LS", "HU", "YO", "BD"];

export default {
  name: "Atech Transport",
  coverage: ATECH_AREAS.join(', '),
  coverageAreas: ATECH_AREAS,
  primaryColor: "#09e5fa",
  logo: "/logos/atech.png",
  allowedRolesForFinance: ["admin", "finance", "super"], // ← role-based access
};
