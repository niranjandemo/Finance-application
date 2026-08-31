import Sidebar from "../components/Sidebar";

const brokers = [
  {
    name: "Broker A",
    fee: "₹20/order",
    maintenance: "₹0",
    products: "Stocks, ETFs, MF",
    match: "94%"
  },
  {
    name: "Broker B",
    fee: "₹15/order",
    maintenance: "₹300/year",
    products: "Stocks, ETFs, Bonds",
    match: "89%"
  },
  {
    name: "Broker C",
    fee: "₹0",
    maintenance: "₹0",
    products: "Stocks, MF",
    match: "83%"
  }
];

function Brokers() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <div className="dashboard-header">

          <div>
            <span className="page-label">
              BROKERS
            </span>

            <h1>Broker Suitability</h1>

            <p>
              Compare brokerage platforms according to your requirements.
            </p>
          </div>

        </div>


        <div className="broker-table">

          <div className="broker-header">
            <span>Broker</span>
            <span>Brokerage</span>
            <span>Maintenance</span>
            <span>Products</span>
            <span>AI Match</span>
          </div>


          {brokers.map((broker) => (

            <div className="broker-row" key={broker.name}>

              <strong>{broker.name}</strong>

              <span>{broker.fee}</span>

              <span>{broker.maintenance}</span>

              <span>{broker.products}</span>

              <strong>{broker.match}</strong>

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}

export default Brokers;