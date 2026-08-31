import Sidebar from "../components/Sidebar";

const topics = [
  {
    title: "What is Risk Tolerance?",
    description:
      "Learn how your ability and willingness to handle investment losses affect investment suitability."
  },
  {
    title: "Stocks vs ETFs",
    description:
      "Understand the differences between individual stocks and exchange-traded funds."
  },
  {
    title: "Understanding Brokerage Fees",
    description:
      "Learn about brokerage charges, account maintenance fees and other costs."
  },
  {
    title: "Investment Diversification",
    description:
      "Understand why diversification can be important when constructing an investment portfolio."
  },
  {
    title: "Investment Horizon",
    description:
      "Learn how the length of time you plan to invest can influence suitable investment categories."
  },
  {
    title: "Understanding Market Volatility",
    description:
      "Learn what market volatility means and why prices can change over time."
  }
];

function Education() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <div className="dashboard-header">

          <div>
            <span className="page-label">
              FINANCIAL EDUCATION
            </span>

            <h1>Learn before you invest</h1>

            <p>
              Simple educational resources to help you understand
              investment concepts.
            </p>
          </div>

        </div>


        <div className="education-grid">

          {topics.map((topic) => (

            <div className="education-card" key={topic.title}>

              <span>LEARN</span>

              <h2>
                {topic.title}
              </h2>

              <p>
                {topic.description}
              </p>

              <button className="outline-btn">
                Read Article
              </button>

            </div>

          ))}

        </div>

      </main>

    </div>
  );
}

export default Education;