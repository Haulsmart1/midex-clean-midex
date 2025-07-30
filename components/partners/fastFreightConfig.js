// /components/partners/fastFreightConfig.js
const FAST_FREIGHT_AREAS = [
  // All relevant SW Scotland, Highlands & Islands postcodes, EXCLUDING 'EH'
  "AB","DD","FK","G","HS","IV","KA","KW","KY","ML","PA","PH","ZE","DG"
  // Add/adjust as needed
];

export default {
  name: "Fast Freight Solutions Ltd",
  description: "Covers Scotland, Highlands, Islands (excluding EH postcodes).",
  coverageAreas: FAST_FREIGHT_AREAS,
  brandColor: "#f77209",
  filterLeg: (leg) => {
    // Return true if collection or delivery matches, but NOT if starts with EH
    const startsWith = (pc, areaList) =>
      !!pc &&
      areaList.some(area =>
        pc.toUpperCase().replace(/\s/g,"").startsWith(area)
      ) && !pc.toUpperCase().replace(/\s/g,"").startsWith("EH");
    return (
      startsWith(leg.collection?.postcode, FAST_FREIGHT_AREAS) ||
      startsWith(leg.delivery?.postcode, FAST_FREIGHT_AREAS)
    );
  },
};
