import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { explanationApi } from "../services/api";
import {
  X,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  TrendingUp,
  User,
  Sliders,
} from "lucide-react";

/**
 * RecommendationExplanation Modal Component
 *
 * Displays transparent, deterministic, rule-based explanations for why a
 * specific investment was recommended to the authenticated user.
 *
 * Strictly rule-based — zero machine learning or AI generation.
 */
function RecommendationExplanation({
  isOpen,
  onClose,
  investmentId,
  investmentName,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchExplanation = async () => {
    if (!investmentId) return;

    try {
      setLoading(true);
      setError(null);
      const result = await explanationApi.getExplanation(investmentId);
      setData(result);
    } catch (err) {
      console.error("Failed to load explanation:", err);
      setError(
        err?.data?.message || err?.message || "Failed to load explanation."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && investmentId) {
      fetchExplanation();
    } else {
      setData(null);
      setError(null);
    }
  }, [isOpen, investmentId]);

  if (!isOpen) return null;

  const isPersonalized = data?.isPersonalized;
  const investment = data?.investment;
  const userProfile = data?.userProfile;
  const suitability = data?.suitability;
  const explanation = data?.explanation;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(5px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
        padding: "20px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "16px",
          maxWidth: "620px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "32px",
          boxShadow:
            "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
          position: "relative",
          animation: "modalFadeIn 0.2s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: "absolute",
            top: "22px",
            right: "22px",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: "34px",
            height: "34px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e2e8f0";
            e.currentTarget.style.color = "#0f172a";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#f1f5f9";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div style={{ marginBottom: "20px", paddingRight: "40px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "0.08em",
                color: "#2563eb",
                backgroundColor: "#eff6ff",
                padding: "3px 8px",
                borderRadius: "6px",
                textTransform: "uppercase",
              }}
            >
              Why this recommendation?
            </span>
          </div>

          <h2
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "#0f172a",
              margin: "0 0 4px 0",
              letterSpacing: "-0.02em",
            }}
          >
            {investmentName || investment?.name || "Investment Explanation"}
          </h2>
          <p style={{ margin: 0, fontSize: "14px", color: "#64748b" }}>
            Transparent rule-based factor analysis and profile suitability match
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 0",
              color: "#64748b",
            }}
          >
            <RefreshCw
              size={32}
              className="spin"
              style={{
                color: "#2563eb",
                marginBottom: "16px",
                animation: "spin 1s linear infinite",
              }}
            />
            <p style={{ fontSize: "14px", fontWeight: 500 }}>
              Evaluating suitability factors and profile rules...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
              margin: "20px 0",
            }}
          >
            <AlertTriangle
              size={32}
              color="#ef4444"
              style={{ margin: "0 auto 10px" }}
            />
            <h3
              style={{
                fontSize: "16px",
                fontWeight: 600,
                color: "#991b1b",
                marginBottom: "6px",
              }}
            >
              Unable to load explanation
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "#b91c1c",
                marginBottom: "16px",
              }}
            >
              {error}
            </p>
            <button
              onClick={fetchExplanation}
              className="primary-btn"
              style={{ padding: "8px 18px", fontSize: "13px" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Content State */}
        {!loading && !error && data && (
          <>
            {/* Unassessed User Notice (Step 9) */}
            {!isPersonalized ? (
              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "24px",
                  textAlign: "center",
                  margin: "12px 0 24px",
                }}
              >
                <Sparkles
                  size={36}
                  color="#6366f1"
                  style={{ margin: "0 auto 12px" }}
                />
                <h3
                  style={{
                    fontSize: "17px",
                    fontWeight: 600,
                    color: "#1e293b",
                    marginBottom: "8px",
                  }}
                >
                  Personalization Pending
                </h3>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#64748b",
                    lineHeight: "1.6",
                    marginBottom: "18px",
                  }}
                >
                  {data.message ||
                    "Complete your risk assessment to receive personalized explanations."}
                </p>
                <Link
                  to="/risk-assessment"
                  className="primary-btn"
                  style={{
                    display: "inline-block",
                    padding: "10px 20px",
                    textDecoration: "none",
                  }}
                  onClick={onClose}
                >
                  Complete Risk Assessment
                </Link>
              </div>
            ) : (
              <>
                {/* Suitability Score Banner */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    padding: "16px 20px",
                    marginBottom: "20px",
                  }}
                >
                  <div>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      Suitability Match
                    </span>
                    <div
                      style={{
                        fontSize: "26px",
                        fontWeight: 800,
                        color: "#0f172a",
                        marginTop: "2px",
                      }}
                    >
                      {suitability?.score}%
                      <span
                        style={{
                          fontSize: "13px",
                          fontWeight: 600,
                          color:
                            suitability?.level === "High"
                              ? "#047857"
                              : "#b45309",
                          backgroundColor:
                            suitability?.level === "High"
                              ? "#ecfdf5"
                              : "#fffbeb",
                          border: `1px solid ${
                            suitability?.level === "High"
                              ? "#a7f3d0"
                              : "#fde68a"
                          }`,
                          padding: "2px 8px",
                          borderRadius: "12px",
                          marginLeft: "10px",
                          verticalAlign: "middle",
                        }}
                      >
                        {suitability?.level} Suitability
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        display: "block",
                        marginBottom: "4px",
                      }}
                    >
                      Category
                    </span>
                    <span
                      style={{
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "#334155",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e2e8f0",
                        padding: "4px 10px",
                        borderRadius: "6px",
                      }}
                    >
                      {investment?.category}
                    </span>
                  </div>
                </div>

                {/* Profile vs Investment Factors Grid (Step 7) */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "20px",
                  }}
                >
                  {/* Your Profile */}
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#334155",
                        marginBottom: "10px",
                      }}
                    >
                      <User size={15} color="#2563eb" />
                      <span>YOUR PROFILE</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        fontSize: "12px",
                        color: "#475569",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Risk Category:</span>
                        <strong style={{ color: "#0f172a" }}>
                          {userProfile?.riskCategory}
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Risk Score:</span>
                        <strong style={{ color: "#0f172a" }}>
                          {userProfile?.riskScore} / 100
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Horizon:</span>
                        <strong style={{ color: "#0f172a" }}>
                          {userProfile?.horizon}
                        </strong>
                      </div>
                    </div>
                  </div>

                  {/* Investment Attributes */}
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "14px 16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#334155",
                        marginBottom: "10px",
                      }}
                    >
                      <Sliders size={15} color="#059669" />
                      <span>INVESTMENT</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        fontSize: "12px",
                        color: "#475569",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Category:</span>
                        <strong style={{ color: "#0f172a" }}>
                          {investment?.category}
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>Risk Level:</span>
                        <strong style={{ color: "#0f172a" }}>
                          {investment?.riskLevel} Risk
                        </strong>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <span style={{ color: "#64748b" }}>
                          Target Horizon:
                        </span>
                        <strong style={{ color: "#0f172a" }}>
                          {investment?.targetHorizon}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Why It Matches (Positive Factors) */}
                <div style={{ marginBottom: "20px" }}>
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 10px 0",
                      letterSpacing: "0.02em",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <TrendingUp size={16} color="#047857" />
                    Why it matches:
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {explanation?.positiveFactors?.map((factor, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          fontSize: "13px",
                          lineHeight: "1.5",
                          color: "#1e293b",
                          backgroundColor: "#f0fdf4",
                          border: "1px solid #dcfce7",
                          borderRadius: "8px",
                          padding: "10px 12px",
                        }}
                      >
                        <CheckCircle2
                          size={16}
                          color="#16a34a"
                          style={{ flexShrink: 0, marginTop: "2px" }}
                        />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Things to Consider (Risk Considerations) */}
                <div style={{ marginBottom: "22px" }}>
                  <h4
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: "#0f172a",
                      margin: "0 0 10px 0",
                      letterSpacing: "0.02em",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <AlertTriangle size={16} color="#b45309" />
                    Things to consider:
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    {explanation?.considerations?.map((note, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                          fontSize: "13px",
                          lineHeight: "1.5",
                          color: "#334155",
                          backgroundColor: "#fffbeb",
                          border: "1px solid #fef3c7",
                          borderRadius: "8px",
                          padding: "10px 12px",
                        }}
                      >
                        <span
                          style={{
                            color: "#d97706",
                            fontSize: "14px",
                            fontWeight: 700,
                            lineHeight: "1",
                            marginTop: "2px",
                          }}
                        >
                          •
                        </span>
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market-Context Factor (Task 11 Integration) */}
                {data?.marketContext?.available && (
                  <div
                    style={{
                      backgroundColor: "#f8fafc",
                      border: "1px solid #e2e8f0",
                      borderRadius: "10px",
                      padding: "14px 16px",
                      marginBottom: "20px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#334155",
                        }}
                      >
                        <Sliders size={15} color="#6366f1" />
                        <span>MARKET CONTEXT FACTOR</span>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          color: "#64748b",
                          backgroundColor: "#f1f5f9",
                          padding: "2px 8px",
                          borderRadius: "4px",
                        }}
                      >
                        Historical NIFTY 50 Benchmark Model
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        fontSize: "12px",
                        color: "#475569",
                        marginBottom: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>Predicted 21-Day Regime:</span>
                        <strong style={{ color: "#0f172a" }}>
                          {data.marketContext.regimeName}
                        </strong>
                      </div>
                      {data.marketContext.probabilities && (
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "#64748b" }}>Regime Probabilities:</span>
                          <span>
                            <span style={{ color: "#ef4444" }}>Down: {Math.round(data.marketContext.probabilities.tier0 * 100)}%</span>
                            {" · "}
                            <span style={{ color: "#64748b" }}>Neutral: {Math.round(data.marketContext.probabilities.tier1 * 100)}%</span>
                            {" · "}
                            <span style={{ color: "#10b981" }}>Up: {Math.round(data.marketContext.probabilities.tier2 * 100)}%</span>
                          </span>
                        </div>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#64748b" }}>Context Suitability Adjustment:</span>
                        <strong style={{ color: "#0f172a" }}>
                          {data.marketContext.mlAdjustment >= 0
                            ? `+${data.marketContext.mlAdjustment}%`
                            : `${data.marketContext.mlAdjustment}%`} (bounded max ±5%)
                        </strong>
                      </div>
                    </div>

                    <p
                      style={{
                        fontSize: "11px",
                        color: "#64748b",
                        margin: 0,
                        lineHeight: "1.4",
                        fontStyle: "italic",
                      }}
                    >
                      {data.marketContext.disclaimer}
                    </p>
                  </div>
                )}

                {/* Method Label */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "#475569",
                    marginBottom: "18px",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>Method:</span>
                  <span
                    style={{
                      backgroundColor: data?.marketContext?.available ? "#e0f2fe" : "#e0e7ff",
                      color: data?.marketContext?.available ? "#0369a1" : "#3730a3",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontWeight: 600,
                      fontSize: "11px",
                    }}
                  >
                    {data?.marketContext?.available
                      ? "Hybrid (Rule-Based + ML Market Context)"
                      : "Rule-Based Personalized Recommendation"}
                  </span>
                </div>
              </>
            )}

            {/* Educational Disclaimer (Step 20) */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "8px",
                fontSize: "11px",
                color: "#64748b",
                lineHeight: "1.5",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 12px",
                marginBottom: "20px",
              }}
            >
              <ShieldCheck
                size={16}
                color="#64748b"
                style={{ flexShrink: 0, marginTop: "1px" }}
              />
              <span>
                These explanations describe how the rule-based suitability
                system matches your profile with available investment options.
                They are for educational and decision-support purposes and do
                not guarantee investment returns.
              </span>
            </div>

            {/* Footer Close Button */}
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={onClose}
                className="outline-btn"
                style={{
                  padding: "8px 22px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default RecommendationExplanation;
