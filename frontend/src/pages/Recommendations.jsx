import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import RecommendationExplanation from "../components/RecommendationExplanation";
import { recommendationApi } from "../services/api";

import {
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

function Recommendations() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeExplanation, setActiveExplanation] = useState(null);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await recommendationApi.getRecommendations();
      setData(result);
    } catch (err) {
      console.error("Failed to load recommendations:", err);
      setError(err?.data?.message || err?.message || "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="page-label">RECOMMENDATIONS</span>
              <h1>Loading Recommendations...</h1>
              <p>Analyzing your risk profile and calculating category suitability...</p>
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
              <span className="page-label">RECOMMENDATIONS</span>
              <h1>Unable to load recommendations</h1>
              <p style={{ color: "#ef4444" }}>{error}</p>
            </div>
            <button onClick={fetchRecommendations} className="primary-btn">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const isPersonalized = data?.isPersonalized;
  const recommendations = data?.recommendations || [];
  const overallSuitability = data?.overallSuitability;
  const overallSummary = data?.overallSummary;

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <div className="dashboard-header">

          <div>
            <span className="page-label">
              RECOMMENDATIONS
            </span>

            <h1>Your personalized recommendations</h1>

            <p>
              Recommendations generated from your investor profile.
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
                Rule-Based Suitability Logic (Non-AI)
              </span>
              {isPersonalized && (
                <span style={{ color: "#047857", fontWeight: 500 }}>
                  • Personalized to your profile
                </span>
              )}
            </div>
          </div>

        </div>


        {!isPersonalized || recommendations.length === 0 ? (
          <div className="ai-result">
            <div className="ai-result-icon">
              <Sparkles size={30} />
            </div>

            <div>
              <span>ASSESSMENT REQUIRED</span>
              <h2>Personalization Pending</h2>
              <p>
                {data?.message ||
                  "Complete your risk assessment to generate personalized category recommendations matching your risk tolerance and investment horizon."}
              </p>
              <div style={{ marginTop: "14px" }}>
                <Link to="/risk-assessment" className="primary-btn" style={{ display: "inline-block" }}>
                  Complete Risk Assessment
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="ai-result">
              <div className="ai-result-icon">
                <Sparkles size={30} />
              </div>

              <div>
                <span>OVERALL HYBRID SUITABILITY</span>
                <h2>{overallSuitability}%</h2>
                <p>
                  {overallSummary ||
                    "Your current profile has a strong suitability match with a diversified moderate-risk investment strategy."}
                </p>
              </div>
            </div>

            {/* Market Context Signal (Task 10/11 Integration) */}
            {data?.mlContext?.available && (
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "16px 20px",
                  marginBottom: "20px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      style={{
                        background: "#e0f2fe",
                        color: "#0369a1",
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "6px",
                      }}
                    >
                      MARKET CONTEXT SIGNAL
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>
                      Historical Benchmark Model ({data.mlContext.model || "LogisticRegression"})
                    </span>
                  </div>
                  <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                    Non-Live · Educational Decision Support
                  </span>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                  <div>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>Predicted 21-Day Regime:</span>
                    <strong style={{ marginLeft: "6px", fontSize: "13px", color: "#0f172a" }}>
                      {data.mlContext.regimeName || "Neutral / Stable"}
                    </strong>
                  </div>
                  {data.mlContext.probabilities && (
                    <div style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
                      <span style={{ color: "#ef4444" }}>
                        Downward (&lt; -2%): <strong>{Math.round(data.mlContext.probabilities.tier0 * 100)}%</strong>
                      </span>
                      <span style={{ color: "#64748b" }}>
                        Neutral: <strong>{Math.round(data.mlContext.probabilities.tier1 * 100)}%</strong>
                      </span>
                      <span style={{ color: "#10b981" }}>
                        Upward (&gt; +3%): <strong>{Math.round(data.mlContext.probabilities.tier2 * 100)}%</strong>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="recommendation-list">
              {recommendations.map((rec, idx) => {
                const rank = String(idx + 1).padStart(2, "0");

                return (
                  <div className="recommendation-result" key={rec.id || rec.name}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                        <span>{rank} · {rec.match || `${rec.suitabilityScore}%`} MATCH</span>
                        {rec.baseSuitability !== undefined && rec.mlAdjustment !== undefined && (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "#64748b",
                              background: "#f1f5f9",
                              padding: "2px 6px",
                              borderRadius: "4px",
                            }}
                          >
                            Base: {rec.baseSuitability}% · Context: {rec.mlAdjustment >= 0 ? `+${rec.mlAdjustment}%` : `${rec.mlAdjustment}%`}
                          </span>
                        )}
                      </div>

                      <h2>{rec.name}</h2>

                      <p>{rec.reason || rec.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveExplanation({ id: rec.id, name: rec.name })}
                      className="outline-btn"
                      style={{ cursor: "pointer" }}
                    >
                      Why this?
                      <ArrowRight size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="responsible-note">
          <ShieldCheck size={20} />
          <p>
            These results are educational decision-support outputs based on hybrid suitability (rule-based investor profiling + historical NIFTY 50 benchmark model), not guaranteed investment advice or live return predictions.
          </p>
        </div>

      </main>

      {/* Transparent Rule-Based XAI Explanation Modal */}
      <RecommendationExplanation
        isOpen={Boolean(activeExplanation)}
        onClose={() => setActiveExplanation(null)}
        investmentId={activeExplanation?.id}
        investmentName={activeExplanation?.name}
      />

    </div>
  );
}

export default Recommendations;