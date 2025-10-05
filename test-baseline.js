/**
 * Simple test script to verify baseline feature loading
 * Run this with: node test-baseline.js
 */

// Compile TypeScript first if needed
const { execSync } = require("child_process");
const fs = require("fs");

async function runTests() {
  // Check if dist exists, if not compile
  if (!fs.existsSync("./dist")) {
    console.log("📦 Compiling TypeScript...");
    try {
      execSync("npx tsc", { stdio: "inherit" });
    } catch (error) {
      console.error("❌ TypeScript compilation failed");
      process.exit(1);
    }
  }

  console.log("🧪 Testing baseline feature loading...\n");

  // Import the compiled module
  const baseline = require("./dist/shared/baseline.js");

  // Test feature IDs that should exist in web-features
  // NOTE: web-features focuses on Web Platform APIs and CSS features,
  // not ECMAScript language features like optional chaining or private fields
  const testFeatures = [
    "top-level-await", // JS module feature (tracked)
    "container-queries", // CSS feature
    "has", // CSS :has() selector
    "grid", // CSS Grid
    "subgrid", // CSS Subgrid
    "nesting", // CSS Nesting (not "css-nesting")
    "custom-properties", // CSS Custom Properties
    "flexbox", // CSS Flexbox
    "fetch", // Fetch API
    "js-modules", // JavaScript modules
  ];

  console.log("Testing feature lookups:");
  console.log("========================\n");

  let successCount = 0;
  let failCount = 0;
  let notFoundCount = 0;

  for (const featureId of testFeatures) {
    try {
      const feature = await baseline.getFeatureById(featureId);

      if (feature) {
        console.log(`✅ ${featureId}: ${feature.name} (${feature.status})`);
        successCount++;
      } else {
        console.log(`⚠️  ${featureId}: Not found in web-features`);
        notFoundCount++;
      }
    } catch (error) {
      console.log(`❌ ${featureId}: Error - ${error.message}`);
      failCount++;
    }
  }

  console.log("\n========================");
  console.log(
    `Results: ${successCount} found, ${notFoundCount} not found, ${failCount} errors`
  );

  if (failCount > 0) {
    console.log("\n❌ Test failed - errors occurred");
    process.exit(1);
  } else if (notFoundCount === testFeatures.length) {
    console.log(
      "\n❌ Test failed - no features found (web-features not loading)"
    );
    process.exit(1);
  } else {
    console.log("\n✅ Test passed - baseline feature loading works!");
    process.exit(0);
  }
}

runTests().catch((error) => {
  console.error("❌ Test execution failed:", error);
  process.exit(1);
});
