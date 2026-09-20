import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { marketApi } from "../services/api";
import { RefreshCw } from "lucide-react";

function Market() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchMarketData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const result = await marketApi.getMarketData();
      setData(result);
    } catch (err) {
      console.error("Failed to load market data:", err);
      setError(err?.data?.message || err?.message || "Failed to load market data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="page-label">MARKET</span>
              <h1>Loading Market Data...</h1>
              <p>Fetching the latest index and stock information...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="page-label">MARKET</span>
              <h1>Unable to load market data</h1>
              <p style={{ color: "#ef4444" }}>{error}</p>
            </div>
            <button onClick={() => fetchMarketData()} className="primary-btn">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const indices = data?.indices || [];
  const stocks = data?.stocks || [];
  const timestamp = data?.timestamp;
  const dataSource = data?.dataSource;

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <div className="dashboard-header">

          <div>
            <span className="page-label">
              MARKET
            </span>

            <h1>Market Overview</h1>

            <p>
              Track market information and investment instruments.
            </p>

            {timestamp && (
              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "#6b7280" }}>
                <span>Last updated: {new Date(timestamp).toLocaleTimeString()}</span>
                <span
                  style={{
                    background: "#f3f4f6",
                    border: "1px solid #e5e7eb",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "11px",
                    color: "#4b5563",
                    fontWeight: 500,
                  }}
                >
                  {dataSource === "live" ? "Live Data" : "Reference Data (Non-Live)"}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => fetchMarketData(true)}
            disabled={loading || refreshing}
            className="primary-btn"
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", cursor: "pointer" }}
          >
            <RefreshCw size={16} className={refreshing ? "spin" : ""} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>

        </div>


        <div className="market-index-grid">

          {indices.map((idx) => {
            const isPositive = idx.change && !idx.change.startsWith("-");
            const formattedPrice =
              typeof idx.price === "number"
                ? idx.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                : idx.price;

            return (
              <div className="index-card" key={idx.symbol || idx.name}>
                <span>{idx.name}</span>
                <h2>{formattedPrice}</h2>
                <strong style={{ color: isPositive ? "#047857" : "#dc2626" }}>
                  {idx.change}
                </strong>
              </div>
            );
          })}

        </div>


        <div className="panel">

          <div className="panel-header">
            <div>
              <span>MARKET DATA</span>
              <h2>Popular Stocks</h2>
            </div>
          </div>


          <div className="stock-table">

            <div className="table-header">
              <span>Company</span>
              <span>Symbol</span>
              <span>Price</span>
              <span>Change</span>
            </div>

            {stocks.length === 0 ? (
              <div style={{ padding: "20px", color: "#6b7280", textAlign: "center" }}>
                No stock data available at this time.
              </div>
            ) : (
              stocks.map((stock) => {
                const isPositive = stock.change && !stock.change.startsWith("-");
                const formattedPrice =
                  typeof stock.price === "number"
                    ? stock.price.toLocaleString("en-IN", { minimumFractionDigits: 2 })
                    : stock.price;

                return (
                  <div className="stock-row" key={stock.symbol}>
                    <strong>{stock.name}</strong>
                    <span>{stock.symbol}</span>
                    <span>₹{formattedPrice}</span>
                    <strong style={{ color: isPositive ? "#047857" : "#dc2626" }}>
                      {stock.change}
                    </strong>
                  </div>
                );
              })
            )}

          </div>

        </div>

      </main>

    </div>
  );
}

export default Market;