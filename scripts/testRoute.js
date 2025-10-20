// scripts/testRoute.js

// ❌ wrong (Next.js style alias, Node can’t resolve outside Next.js):
// import { resolveRoute } from '@/utils/resolveRoute.js';

// ✅ correct (relative path, works with Node directly):
import { resolveRoute } from '../utils/resolveRoute.js';

async function runTests() {
  console.log("=== Route Tests ===");

  let r1 = await resolveRoute({ from: "M1 1AE", to: "D01 P3K2" });
  console.log("\nGB → ROI:");
  console.log("Ferry:", r1.ferryRoute, "Customs:", r1.customsRequired, "Legs:", r1.legs.length);

  let r2 = await resolveRoute({ from: "M1 1AE", to: "BT1 5GS" });
  console.log("\nGB → NI:");
  console.log("Ferry:", r2.ferryRoute, "Customs:", r2.customsRequired, "Legs:", r2.legs.length);

  let r3 = await resolveRoute({ from: "BT1 5GS", to: "D01 P3K2" });
  console.log("\nNI → ROI:");
  console.log("Ferry:", r3.ferryRoute, "Customs:", r3.customsRequired, "Legs:", r3.legs.length);

  let r4 = await resolveRoute({ from: "M1 1AE", to: "SW1A 1AA" });
  console.log("\nGB → GB:");
  console.log("Ferry:", r4.ferryRoute, "Customs:", r4.customsRequired, "Legs:", r4.legs.length);
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
