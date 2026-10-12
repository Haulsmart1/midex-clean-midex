// ---------- SUPPORTED VEHICLES ----------
const JJX_VEHICLES = [
  '7.5T Tail-lift',
  '18 Tonner Tail-lift',
  '26 Tonner Tail-lift',
  'Artic Lorry'
];

// ---------- JJX PARTNER CONFIG ----------
const jjxConfig = {
  name: "JJX Logistics",
  coverage: JJX_VEHICLES.join(', '),
  coverageAreas: JJX_VEHICLES,
  primaryColor: "#f79d00",
  logo: "/logos/jjx.png",
  allowedRolesForFinance: ["admin", "finance", "super"],

  // 🔍 Filter jobs by vehicle type
  filterLeg: (leg) => {
    const vehicle = leg?.vehicle_type?.trim();
    return JJX_VEHICLES.includes(vehicle);
  }
};

export default jjxConfig;
