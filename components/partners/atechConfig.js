// /components/partners/atechConfig.js
const ATECH_AREAS = ["EH", "TD", "NE", "DL", "TS", "SR", "LS", "HU", "YO", "BD"];

export default {
  name: "Atech Transport",
  description: "Atech covers UK postcodes: EH, TD, NE, TS, DL, SR, LS, HU, YO, BD.",
  coverageAreas: ATECH_AREAS,
  brandColor: "#09e5fa",
  filterLeg: (leg) => {
    // Custom filter: show if collection or delivery postcode in Atech area
    const startsWith = (pc) => !!pc && ATECH_AREAS.some(area => pc.toUpperCase().replace(/\s/g,"").startsWith(area));
    return startsWith(leg.collection?.postcode) || startsWith(leg.delivery?.postcode);
  },
  allocateToExchange: async (leg) => {
    // You can add custom logic here per partner, or use shared handler!
    return fetch('/api/haulsmart/post-leg', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leg }),
    });
  }
};
