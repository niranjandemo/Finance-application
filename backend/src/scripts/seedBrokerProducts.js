import pool from "../config/db.js";

/**
 * Seed script for broker_products table.
 * Populates verified product-level minimum investment data for supported brokers.
 */
export const seedBrokerProducts = async () => {
  try {
    console.log("Ensuring broker_products table exists...");

    await pool.query(`
      CREATE TABLE IF NOT EXISTS broker_products (
        id SERIAL PRIMARY KEY,
        broker_id INTEGER NOT NULL REFERENCES brokers(id) ON DELETE CASCADE,
        product_type VARCHAR(120) NOT NULL,
        minimum_investment NUMERIC(12, 2) DEFAULT NULL,
        minimum_unit VARCHAR(50),
        notes TEXT,
        source_url TEXT,
        last_updated DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT unique_broker_product UNIQUE (broker_id, product_type)
      );
    `);

    // Fetch existing broker IDs by name
    const brokerRes = await pool.query("SELECT id, name FROM brokers");
    const brokerMap = {};
    brokerRes.rows.forEach((b) => {
      brokerMap[b.name.trim()] = b.id;
    });

    const productsData = [
      // Zerodha
      {
        brokerName: "Zerodha",
        productType: "Equity Delivery (Stocks & ETFs)",
        minimumInvestment: null,
        minimumUnit: "1 share",
        notes: "1 share at prevailing market price; ₹0 brokerage on delivery",
        sourceUrl: "https://zerodha.com/charges",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "Zerodha",
        productType: "Direct Mutual Funds",
        minimumInvestment: null,
        minimumUnit: "Scheme dependent",
        notes: "Determined by AMC; select funds allow micro SIP from ₹10–₹100, standard SIPs from ₹500",
        sourceUrl: "https://coin.zerodha.com",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "Zerodha",
        productType: "Government Securities & T-Bills",
        minimumInvestment: 10000.0,
        minimumUnit: "₹ (100 units/lot)",
        notes: "Minimum order lot of 100 units for G-Secs and Treasury Bills",
        sourceUrl: "https://support.zerodha.com",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "Zerodha",
        productType: "Stock SIP",
        minimumInvestment: null,
        minimumUnit: "1 share",
        notes: "Quantity-based SIP starting from 1 share per scheduled cycle",
        sourceUrl: "https://support.zerodha.com",
        lastUpdated: "2026-09-18",
      },

      // Groww
      {
        brokerName: "Groww",
        productType: "US Stocks",
        minimumInvestment: 1.0,
        minimumUnit: "$",
        notes: "Fractional shares supported from $1",
        sourceUrl: "https://groww.in/us-stocks",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "Groww",
        productType: "Stock SIP",
        minimumInvestment: 500.0,
        minimumUnit: "₹/cycle",
        notes: "Amount-based SIP from ₹500/cycle or 1 share for quantity-based SIP",
        sourceUrl: "https://groww.in/blog/stock-sip",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "Groww",
        productType: "Mutual Funds",
        minimumInvestment: null,
        minimumUnit: "Scheme dependent",
        notes: "Varies by scheme; SIPs typically start from ₹100 or ₹500 as set by AMC",
        sourceUrl: "https://groww.in/mutual-funds",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "Groww",
        productType: "Equity Delivery (Indian Stocks)",
        minimumInvestment: null,
        minimumUnit: "1 share",
        notes: "1 share at prevailing market price",
        sourceUrl: "https://groww.in/pricing",
        lastUpdated: "2026-09-18",
      },

      // Upstox
      {
        brokerName: "Upstox",
        productType: "US Stocks",
        minimumInvestment: 1.0,
        minimumUnit: "$",
        notes: "Fractional share investing via GIFT City starting from $1",
        sourceUrl: "https://upstox.com",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "Upstox",
        productType: "Mutual Fund SIP",
        minimumInvestment: 100.0,
        minimumUnit: "₹/month",
        notes: "Starting from ₹100/month for select schemes; varies by AMC",
        sourceUrl: "https://upstox.com/mutual-funds",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "Upstox",
        productType: "Digital Gold",
        minimumInvestment: 1.0,
        minimumUnit: "₹",
        notes: "Micro-investments in 24K digital gold starting from ₹1",
        sourceUrl: "https://upstox.com",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "Upstox",
        productType: "Equity Delivery (Stocks)",
        minimumInvestment: null,
        minimumUnit: "1 share",
        notes: "1 share at prevailing market price",
        sourceUrl: "https://upstox.com/pricing",
        lastUpdated: "2026-09-18",
      },

      // ICICI Direct
      {
        brokerName: "ICICI Direct",
        productType: "Stock SIP",
        minimumInvestment: 50.0,
        minimumUnit: "₹/cycle",
        notes: "Amount-based Stock SIP starting from ₹50 per order",
        sourceUrl: "https://www.icicidirect.com",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "ICICI Direct",
        productType: "Mutual Funds",
        minimumInvestment: null,
        minimumUnit: "Scheme dependent",
        notes: "Varies by fund house; SIPs typically start from ₹100 or ₹500",
        sourceUrl: "https://www.icicidirect.com/mutual-funds",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "ICICI Direct",
        productType: "National Pension System (NPS)",
        minimumInvestment: 500.0,
        minimumUnit: "₹/contribution",
        notes: "Minimum ₹500 initial contribution for Tier I; ₹1,000 required annually",
        sourceUrl: "https://www.icicidirect.com/nps",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "ICICI Direct",
        productType: "Equity Delivery (Stocks & ETFs)",
        minimumInvestment: null,
        minimumUnit: "1 share",
        notes: "1 share at prevailing market price",
        sourceUrl: "https://www.icicidirect.com/pricing",
        lastUpdated: "2026-09-18",
      },

      // HDFC Sky
      {
        brokerName: "HDFC Sky",
        productType: "Global Equities (US Stocks)",
        minimumInvestment: null,
        minimumUnit: "Fractional share",
        notes: "Fractional shares supported; no fixed platform minimum (orders typically from $1 via LRS)",
        sourceUrl: "https://hdfcsky.com",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "HDFC Sky",
        productType: "Mutual Funds",
        minimumInvestment: null,
        minimumUnit: "Scheme dependent",
        notes: "Varies by scheme; SIPs start as low as ₹100–₹500 per month depending on AMC",
        sourceUrl: "https://hdfcsky.com/mutual-funds",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "HDFC Sky",
        productType: "Stock SIP",
        minimumInvestment: null,
        minimumUnit: "1 share / custom amount",
        notes: "Automated recurring stock purchases configured by quantity or cycle budget",
        sourceUrl: "https://hdfcsky.com",
        lastUpdated: "2026-09-18",
      },
      {
        brokerName: "HDFC Sky",
        productType: "Equity Delivery (Indian Stocks)",
        minimumInvestment: null,
        minimumUnit: "1 share",
        notes: "1 share at prevailing market price; flat ₹20 or 0.1% per delivery order",
        sourceUrl: "https://hdfcsky.com/pricing",
        lastUpdated: "2026-09-18",
      },
    ];

    let insertedCount = 0;

    for (const item of productsData) {
      const brokerId = brokerMap[item.brokerName];
      if (!brokerId) {
        console.warn(`Broker "${item.brokerName}" not found in database. Skipping product ${item.productType}.`);
        continue;
      }

      await pool.query(
        `INSERT INTO broker_products (
          broker_id, product_type, minimum_investment, minimum_unit, notes, source_url, last_updated, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
        ON CONFLICT (broker_id, product_type) DO UPDATE SET
          minimum_investment = EXCLUDED.minimum_investment,
          minimum_unit = EXCLUDED.minimum_unit,
          notes = EXCLUDED.notes,
          source_url = EXCLUDED.source_url,
          last_updated = EXCLUDED.last_updated,
          updated_at = CURRENT_TIMESTAMP;`,
        [
          brokerId,
          item.productType,
          item.minimumInvestment,
          item.minimumUnit,
          item.notes,
          item.sourceUrl,
          item.lastUpdated,
        ]
      );
      insertedCount++;
    }

    console.log(`Successfully seeded/updated ${insertedCount} broker products across ${Object.keys(brokerMap).length} brokers.`);
  } catch (error) {
    console.error("Error seeding broker products:", error);
    throw error;
  }
};

// If run directly via `node seedBrokerProducts.js`
if (process.argv[1]?.endsWith("seedBrokerProducts.js")) {
  seedBrokerProducts()
    .then(() => {
      console.log("Broker products seed script completed successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Broker products seed script failed:", err);
      process.exit(1);
    });
}
