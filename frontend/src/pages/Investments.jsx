import Sidebar from "../components/Sidebar";

const investments = [
  {
    name: "Large Cap Equity",
    risk: "Moderate",
    match: "91%",
    description:
      "Established companies with relatively lower volatility."
  },
  {
    name: "Diversified Equity",
    risk: "Moderate",
    match: "87%",
    description:
      "Diversified exposure across multiple sectors."
  },
  {
    name: "Government Bonds",
    risk: "Low",
    match: "78%",
    description:
      "Lower-risk fixed-income investment category."
  },
  {
    name: "Equity Mutual Funds",
    risk: "Moderate-High",
    match: "76%",
    description:
      "Professionally managed diversified equity exposure."
  }
];

function Investments() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <div className="dashboard-header">

          <div>
            <span className="page-label">
              INVESTMENTS
            </span>

            <h1>Investment Suitability</h1>

            <p>
              Investment categories ranked according to your profile.
            </p>
          </div>

        </div>


        <div className="investment-grid">

          {investments.map((investment) => (

            <div
              className="investment-card"
              key={investment.name}
            >

              <div className="match-score">
                {investment.match}
              </div>

              <span>
                {investment.risk} RISK
              </span>

              <h2>{investment.name}</h2>

              <p>
                {investment.description}
              </p>

              <button className="outline-btn">
                View Details
              </button>

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}

export default Investments;