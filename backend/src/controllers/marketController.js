import { fetchMarketData } from "../services/marketService.js";

export const getMarketOverview = async (req, res) => {
  try {
    const marketData = await fetchMarketData();

    res.status(200).json({
      success: true,
      indices: marketData.indices,
      stocks: marketData.stocks,
      timestamp: marketData.timestamp,
      dataSource: marketData.dataSource,
      isLive: marketData.isLive,
    });
  } catch (error) {
    console.error("Market data retrieval error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve market data",
    });
  }
};
