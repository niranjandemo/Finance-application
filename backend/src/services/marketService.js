/**
 * Market Data Service
 *
 * Provides benchmark index and stock market data for InvestAI.
 * Currently uses structured reference/fallback data since no third-party
 * live market provider API key (e.g. Alpha Vantage, Yahoo Finance) is configured.
 *
 * Designed with an extensible interface so live data providers can be plugged in.
 */

export const getFallbackMarketData = () => {
  const indices = [
    {
      name: "NIFTY 50",
      symbol: "^NSEI",
      price: 24680.35,
      change: "+0.72%",
      changePercent: 0.72,
      high: 24740.10,
      low: 24610.20,
    },
    {
      name: "SENSEX",
      symbol: "^BSESN",
      price: 80950.10,
      change: "+0.58%",
      changePercent: 0.58,
      high: 81120.00,
      low: 80730.50,
    },
    {
      name: "NIFTY BANK",
      symbol: "^NSEBANK",
      price: 55120.40,
      change: "+0.41%",
      changePercent: 0.41,
      high: 55300.00,
      low: 54950.00,
    },
  ];

  const stocks = [
    {
      name: "Reliance Industries",
      symbol: "RELIANCE",
      price: 1421.30,
      change: "+1.42%",
      changePercent: 1.42,
      high: 1435.00,
      low: 1410.20,
    },
    {
      name: "Tata Consultancy Services",
      symbol: "TCS",
      price: 3185.60,
      change: "+0.82%",
      changePercent: 0.82,
      high: 3210.00,
      low: 3170.00,
    },
    {
      name: "Infosys",
      symbol: "INFY",
      price: 1522.40,
      change: "-0.35%",
      changePercent: -0.35,
      high: 1538.00,
      low: 1515.50,
    },
    {
      name: "HDFC Bank",
      symbol: "HDFCBANK",
      price: 1938.20,
      change: "+0.67%",
      changePercent: 0.67,
      high: 1950.00,
      low: 1928.00,
    },
    {
      name: "ICICI Bank",
      symbol: "ICICIBANK",
      price: 1405.10,
      change: "+1.12%",
      changePercent: 1.12,
      high: 1415.00,
      low: 1395.00,
    },
  ];

  return {
    indices,
    stocks,
    timestamp: new Date().toISOString(),
    dataSource: "fallback",
    isLive: false,
  };
};

export const fetchMarketData = async () => {
  // If an external market API provider is configured in environment in the future,
  // query it here. For now, return structured fallback/reference data.
  return getFallbackMarketData();
};
