import pool from "../config/db.js";

/**
 * Computes a human-readable minimum investment summary based on verified products.
 * E.g., "From $1 / ₹500 depending on product", "From ₹50 depending on product", or "Varies by product".
 * Does NOT return ₹0.
 */
export const computeMinInvestmentSummary = (products) => {
  if (!products || products.length === 0) {
    return "Varies by product";
  }

  const numericProducts = products.filter(
    (p) => p.minimumInvestment !== null && p.minimumInvestment !== undefined
  );

  if (numericProducts.length === 0) {
    return "Varies by product";
  }

  // Find lowest dollar amount if available
  const dollarProducts = numericProducts.filter((p) => p.minimumUnit?.includes("$"));
  const dollarMin = dollarProducts.length > 0
    ? Math.min(...dollarProducts.map((p) => Number(p.minimumInvestment)))
    : null;

  // Find lowest rupee amount if available (excluding high-threshold institutional items like 10,000 for summary clarity)
  const rupeeProducts = numericProducts.filter((p) => p.minimumUnit?.includes("₹"));
  const rupeeMin = rupeeProducts.length > 0
    ? Math.min(...rupeeProducts.map((p) => Number(p.minimumInvestment)))
    : null;

  if (dollarMin !== null && rupeeMin !== null) {
    return `From $${dollarMin} / ₹${rupeeMin.toLocaleString("en-IN")} depending on product`;
  }
  if (dollarMin !== null) {
    return `From $${dollarMin} depending on product`;
  }
  if (rupeeMin !== null) {
    return `From ₹${rupeeMin.toLocaleString("en-IN")} depending on product`;
  }

  return "Varies by product";
};

/**
 * Broker Model
 *
 * Provides database queries for the educational broker/platform directory.
 * Returns broker-level information joined with verified product-level minimum investments.
 */
export const getAllBrokers = async () => {
  const result = await pool.query(
    `SELECT
      b.id,
      b.name,
      b.description,
      b.platform_type,
      b.supported_investments,
      b.minimum_investment,
      b.website,
      b.created_at,
      b.updated_at,
      COALESCE(
        json_agg(
          json_build_object(
            'id', bp.id,
            'brokerId', bp.broker_id,
            'productType', bp.product_type,
            'minimumInvestment', bp.minimum_investment,
            'minimumUnit', bp.minimum_unit,
            'notes', bp.notes,
            'sourceUrl', bp.source_url,
            'lastUpdated', bp.last_updated
          ) ORDER BY bp.id ASC
        ) FILTER (WHERE bp.id IS NOT NULL),
        '[]'
      ) AS products
     FROM brokers b
     LEFT JOIN broker_products bp ON b.id = bp.broker_id
     GROUP BY b.id
     ORDER BY b.id ASC`
  );

  return result.rows.map((row) => {
    const products = (row.products || []).map((p) => ({
      id: p.id,
      brokerId: p.brokerId,
      productType: p.productType,
      minimumInvestment: p.minimumInvestment !== null ? Number(p.minimumInvestment) : null,
      minimumUnit: p.minimumUnit,
      notes: p.notes,
      sourceUrl: p.sourceUrl,
      lastUpdated: p.lastUpdated,
    }));

    return {
      id: row.id,
      name: row.name,
      description: row.description,
      platformType: row.platform_type,
      supportedInvestments: row.supported_investments,
      minimumInvestment: null, // Legacy field replaced with product-level structure
      minInvestmentSummary: computeMinInvestmentSummary(products),
      products,
      website: row.website,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  });
};

/**
 * Retrieves all verified investment products for a specific broker.
 */
export const getProductsByBrokerId = async (brokerId) => {
  const result = await pool.query(
    `SELECT
      id,
      broker_id,
      product_type,
      minimum_investment,
      minimum_unit,
      notes,
      source_url,
      last_updated,
      created_at,
      updated_at
     FROM broker_products
     WHERE broker_id = $1
     ORDER BY id ASC`,
    [brokerId]
  );

  return result.rows.map((row) => ({
    id: row.id,
    brokerId: row.broker_id,
    productType: row.product_type,
    minimumInvestment: row.minimum_investment !== null ? Number(row.minimum_investment) : null,
    minimumUnit: row.minimum_unit,
    notes: row.notes,
    sourceUrl: row.source_url,
    lastUpdated: row.last_updated,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
};
