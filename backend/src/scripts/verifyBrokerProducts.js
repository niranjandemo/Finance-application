import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET || "investai_super_secret_key_change_this_later";
const token = jwt.sign({ id: 1, email: "test@example.com" }, secret, { expiresIn: "1h" });

async function runTestSuite() {
  console.log("=== RUNNING BROKER DIRECTORY VERIFICATION SUITE ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  // Test 1: Unauthorized access
  try {
    const unauthRes = await fetch("http://localhost:5000/api/brokers");
    assert(unauthRes.status === 401, "GET /api/brokers rejects unauthenticated requests with 401");
  } catch (e) {
    assert(false, `Unauthorized check failed: ${e.message}`);
  }

  // Test 2: Authorized GET /api/brokers
  try {
    const res = await fetch("http://localhost:5000/api/brokers", {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(res.status === 200, "GET /api/brokers returns 200 OK");
    const data = await res.json();
    assert(data.success === true, "Response has success: true");
    assert(Array.isArray(data.brokers) && data.brokers.length === 5, "Returns exactly 5 brokers");

    for (const broker of data.brokers) {
      assert(broker.minimumInvestment !== 0, `${broker.name}: minimumInvestment is not numeric 0`);
      assert(
        broker.minInvestmentSummary && !broker.minInvestmentSummary.includes("₹0"),
        `${broker.name}: minInvestmentSummary is valid ("${broker.minInvestmentSummary}") and does not contain ₹0`
      );
      assert(Array.isArray(broker.products) && broker.products.length >= 4, `${broker.name}: Contains ${broker.products?.length} products`);
    }
  } catch (e) {
    assert(false, `GET /api/brokers failed: ${e.message}`);
  }

  // Test 3: GET /api/brokers/:id/products for all 5 brokers
  for (let id = 1; id <= 5; id++) {
    try {
      const res = await fetch(`http://localhost:5000/api/brokers/${id}/products`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      assert(res.status === 200, `GET /api/brokers/${id}/products returns 200 OK`);
      const data = await res.json();
      assert(data.success === true && data.brokerId === id, `Broker ${id} response format valid`);
      assert(Array.isArray(data.products) && data.products.length === 4, `Broker ${id} has 4 products`);

      for (const prod of data.products) {
        assert(Boolean(prod.productType), `Broker ${id} product "${prod.productType}" has productType`);
        assert(Boolean(prod.sourceUrl), `Broker ${id} product "${prod.productType}" has sourceUrl (${prod.sourceUrl})`);
        assert(Boolean(prod.lastUpdated), `Broker ${id} product "${prod.productType}" has lastUpdated (${prod.lastUpdated})`);
        assert(prod.minimumInvestment !== 0, `Broker ${id} product "${prod.productType}" minimumInvestment is not 0`);
      }
    } catch (e) {
      assert(false, `GET /api/brokers/${id}/products failed: ${e.message}`);
    }
  }

  // Test 4: Invalid ID handling
  try {
    const badRes = await fetch("http://localhost:5000/api/brokers/invalid-id/products", {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(badRes.status === 400, "GET /api/brokers/invalid-id/products returns 400 Bad Request");
  } catch (e) {
    assert(false, `Invalid ID check failed: ${e.message}`);
  }

  console.log(`\nVerification Suite Complete: ${passed} passed, ${failed} failed.`);
  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((e) => {
  console.error("Test suite fatal error:", e);
  process.exit(1);
});
