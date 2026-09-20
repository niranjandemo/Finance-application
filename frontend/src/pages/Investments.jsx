import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { investmentApi } from "../services/api";
import { X, ShieldCheck, TrendingUp, DollarSign, Calendar } from "lucide-react";

function Investments() {
  const [investments, setInvestments] = useState([]);
  const [isPersonalized, setIsPersonalized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedInvestment, setSelectedInvestment] = useState(null);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await investmentApi.getInvestments();
      setInvestments(data.investments || []);
      setIsPersonalized(Boolean(data.isPersonalized));
    } catch (err) {
      console.error("Failed to load investments:", err);
      setError(err?.data?.message || err?.message || "Failed to load investment options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="page-label">INVESTMENTS</span>
              <h1>Loading Investments...</h1>
              <p>Evaluating investment options against your profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error && investments.length === 0) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="page-label">INVESTMENTS</span>
              <h1>Unable to load investments</h1>
              <p style={{ color: "#ef4444" }}>{error}</p>
            </div>
            <button onClick={fetchInvestments} className="primary-btn">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

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
              {isPersonalized
                ? "Investment categories ranked by rule-based suitability for your profile."
                : "Investment categories ranked according to baseline financial parameters. Complete risk assessment to personalize."}
            </p>

            <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "#6b7280" }}>
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
                Rule-Based Suitability Scoring (Non-AI)
              </span>
              {isPersonalized && (
                <span style={{ color: "#047857", fontWeight: 500 }}>
                  • Personalized to your profile
                </span>
              )}
            </div>
          </div>

        </div>


        <div className="investment-grid">

          {investments.length === 0 ? (
            <div style={{ padding: "30px", color: "#6b7280", gridColumn: "1 / -1", textAlign: "center" }}>
              No investment options available at this time.
            </div>
          ) : (
            investments.map((investment) => (

              <div
                className="investment-card"
                key={investment.id || investment.name}
              >

                <div className="match-score">
                  {investment.match || `${investment.suitabilityScore}%`}
                </div>

                <span>
                  {(investment.risk || investment.riskLevel || "MODERATE").toUpperCase()} RISK
                </span>

                <h2>{investment.name}</h2>

                <p>
                  {investment.description}
                </p>

                <button
                  className="outline-btn"
                  onClick={() => setSelectedInvestment(investment)}
                  style={{ cursor: "pointer" }}
                >
                  View Details
                </button>

              </div>

            ))
          )}

        </div>

        {/* Investment Details Modal */}
        {selectedInvestment && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              padding: "20px",
            }}
            onClick={() => setSelectedInvestment(null)}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "12px",
                maxWidth: "520px",
                width: "100%",
                padding: "28px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedInvestment(null)}
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#6b7280",
                }}
              >
                <X size={20} />
              </button>

              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  color: "#6b7280",
                  textTransform: "uppercase",
                }}
              >
                {selectedInvestment.category} • {selectedInvestment.risk || selectedInvestment.riskLevel} Risk
              </span>

              <h2 style={{ fontSize: "22px", margin: "8px 0 14px", color: "#111827" }}>
                {selectedInvestment.name}
              </h2>

              <p style={{ color: "#4b5563", fontSize: "14px", lineHeight: "1.6", marginBottom: "20px" }}>
                {selectedInvestment.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "14px",
                  padding: "16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  marginBottom: "20px",
                  fontSize: "13px",
                }}
              >
                <div>
                  <span style={{ color: "#6b7280", fontSize: "11px", display: "block" }}>Suitability Match</span>
                  <strong style={{ color: "#047857", fontSize: "16px" }}>
                    {selectedInvestment.match || `${selectedInvestment.suitabilityScore}%`}
                  </strong>
                </div>

                <div>
                  <span style={{ color: "#6b7280", fontSize: "11px", display: "block" }}>Indicative Return</span>
                  <strong style={{ color: "#111827", fontSize: "14px" }}>
                    {selectedInvestment.expectedReturn || "Market-driven"}
                  </strong>
                </div>

                <div>
                  <span style={{ color: "#6b7280", fontSize: "11px", display: "block" }}>Target Horizon</span>
                  <strong style={{ color: "#111827", fontSize: "14px", textTransform: "capitalize" }}>
                    {selectedInvestment.targetHorizon || "Medium"} term
                  </strong>
                </div>

                <div>
                  <span style={{ color: "#6b7280", fontSize: "11px", display: "block" }}>Min. Investment</span>
                  <strong style={{ color: "#111827", fontSize: "14px" }}>
                    ₹{selectedInvestment.minimumInvestment?.toLocaleString("en-IN") || 500}
                  </strong>
                </div>
              </div>

              <p style={{ fontSize: "11px", color: "#9ca3af", fontStyle: "italic", margin: 0 }}>
                * Match score is calculated using deterministic rule-based alignment with your risk assessment and investment horizon. Indicative returns are historical benchmarks, not guarantees.
              </p>

              <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
                <button
                  className="primary-btn"
                  onClick={() => setSelectedInvestment(null)}
                  style={{ padding: "8px 20px" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}

export default Investments;