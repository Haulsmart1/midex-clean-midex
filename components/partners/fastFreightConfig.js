// /components/partners/fastFreightConfig.js

const FASTFREIGHT_SCOTLAND = [
  "AB", // Aberdeen
  "DD", // Dundee
  "DG", // Dumfries & Galloway
  "FK", // Falkirk
  "G",  // Glasgow
  "HS", // Western Isles
  "IV", // Inverness
  "KA", // Kilmarnock
  "KW", // Kirkwall/Orkney
  "KY", // Kirkcaldy/Fife
  "ML", // Motherwell
  "PA", // Paisley
  "PH", // Perth
  "TD", // Borders (partly in England)
  "ZE"  // Shetland
  // "EH" intentionally excluded!
];

const fastFreightConfig = {
  name: "Fast Freight",
  description: "All Scottish postcodes (including Highlands & Islands) EXCEPT EH (Edinburgh).",
  coverageAreas: FASTFREIGHT_SCOTLAND,
  primaryColor: "#09e5fa",
  logo: "/logos/fastfreight.png",
  allowedRolesForFinance: ["admin", "finance", "super"],

  filterLeg: (leg) => {
    const startsWith = (pc) =>
      !!pc && FASTFREIGHT_SCOTLAND.some(area => pc.toUpperCase().replace(/\s/g, "").startsWith(area));
    return startsWith(leg.collection?.postcode) || startsWith(leg.delivery?.postcode);
  },

  allocateToExchange: async (leg) => {
    return fetch('/api/haulsmart/post-leg', {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leg }),
    });
  }
};

export default fastFreightConfig;
