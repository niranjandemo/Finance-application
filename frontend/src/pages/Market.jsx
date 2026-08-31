import Sidebar from "../components/Sidebar";

const stocks = [
  {
    name: "Reliance Industries",
    symbol: "RELIANCE",
    price: "1,421.30",
    change: "+1.42%"
  },
  {
    name: "Tata Consultancy Services",
    symbol: "TCS",
    price: "3,185.60",
    change: "+0.82%"
  },
  {
    name: "Infosys",
    symbol: "INFY",
    price: "1,522.40",
    change: "-0.35%"
  },
  {
    name: "HDFC Bank",
    symbol: "HDFCBANK",
    price: "1,938.20",
    change: "+0.67%"
  },
  {
    name: "ICICI Bank",
    symbol: "ICICIBANK",
    price: "1,405.10",
    change: "+1.12%"
  }
];

function Market() {
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
          </div>

        </div>


        <div className="market-index-grid">

          <div className="index-card">
            <span>NIFTY 50</span>
            <h2>24,680.35</h2>
            <strong>+0.72%</strong>
          </div>

          <div className="index-card">
            <span>SENSEX</span>
            <h2>80,950.10</h2>
            <strong>+0.58%</strong>
          </div>

          <div className="index-card">
            <span>NIFTY BANK</span>
            <h2>55,120.40</h2>
            <strong>+0.41%</strong>
          </div>

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

            {stocks.map((stock) => (

              <div className="stock-row" key={stock.symbol}>

                <strong>{stock.name}</strong>

                <span>{stock.symbol}</span>

                <span>₹{stock.price}</span>

                <strong>{stock.change}</strong>

              </div>

            ))}

          </div>

        </div>

      </main>

    </div>
  );
}

export default Market;