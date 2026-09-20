import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { userApi } from "../services/api";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  TrendingUp,
  Calendar,
  AlertTriangle,
  AlertCircle,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

function RiskAssessment() {
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState(null);
  const [viewMode, setViewMode] = useState("loading"); // "loading", "summary", "empty", "questionnaire"
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saveError, setSaveError] = useState("");

  const [answers, setAnswers] = useState({
    lossReaction: "",
    volatility: "",
    returnPreference: "",
    emergencyFund: "",
    investmentBehavior: "",
  });

  const fetchExistingAssessment = async () => {
    try {
      setLoadingInitial(true);
      setError(null);
      const data = await userApi.getRiskAssessment();
      if (data && data.assessment && (data.assessment.risk_score !== undefined || data.assessment.riskScore !== undefined)) {
        setAssessment(data.assessment);
        setViewMode("summary");
        setAnswers({
          lossReaction: data.assessment.loss_reaction || "",
          volatility: data.assessment.volatility || "",
          returnPreference: data.assessment.return_preference || "",
          emergencyFund: data.assessment.emergency_fund || "",
          investmentBehavior: data.assessment.investment_behavior || "",
        });

        localStorage.setItem(
          "riskAssessment",
          JSON.stringify({
            lossReaction: data.assessment.loss_reaction,
            volatility: data.assessment.volatility,
            returnPreference: data.assessment.return_preference,
            emergencyFund: data.assessment.emergency_fund,
            investmentBehavior: data.assessment.investment_behavior,
            riskScore: data.assessment.risk_score,
            riskCategory: data.assessment.risk_category,
          })
        );
      } else {
        setAssessment(null);
        setViewMode("empty");
      }
    } catch (err) {
      if (err?.status === 404) {
        setAssessment(null);
        setViewMode("empty");
      } else {
        console.error("Failed to load existing risk assessment:", err);
        setError(err?.data?.message || err?.message || "Unable to load your risk assessment.");
      }
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchExistingAssessment();
  }, []);

  const questions = [
    {
      name: "lossReaction",
      question:
        "If your investment falls by 20%, what would you most likely do?",
      description:
        "This helps us understand how you react to short-term investment losses.",
      options: [
        {
          value: "1",
          title: "Sell immediately",
          description: "I would sell to avoid further losses.",
        },
        {
          value: "2",
          title: "Sell some",
          description: "I would reduce part of my investment.",
        },
        {
          value: "3",
          title: "Hold",
          description: "I would hold and wait for recovery.",
        },
        {
          value: "4",
          title: "Invest more",
          description: "I may invest more because prices are lower.",
        },
      ],
    },

    {
      name: "volatility",
      question:
        "How comfortable are you with significant changes in investment value?",
      description:
        "This indicates your emotional tolerance for market volatility.",
      options: [
        {
          value: "1",
          title: "Very uncomfortable",
          description: "I prefer stable investments even if returns are low.",
        },
        {
          value: "2",
          title: "Somewhat uncomfortable",
          description: "I can accept small fluctuations only.",
        },
        {
          value: "3",
          title: "Comfortable",
          description: "I understand that markets fluctuate over time.",
        },
        {
          value: "4",
          title: "Very comfortable",
          description: "I accept high volatility for higher return potential.",
        },
      ],
    },

    {
      name: "returnPreference",
      question: "What is your primary investment expectation?",
      description: "This reflects your return objective and risk balance.",
      options: [
        {
          value: "1",
          title: "Capital preservation",
          description: "Protecting my money is more important than returns.",
        },
        {
          value: "2",
          title: "Stable growth",
          description: "I want steady and predictable returns.",
        },
        {
          value: "3",
          title: "Balanced growth",
          description: "I want moderate growth with manageable risk.",
        },
        {
          value: "4",
          title: "Maximum growth",
          description: "I want highest possible growth and accept higher risk.",
        },
      ],
    },

    {
      name: "emergencyFund",
      question: "Do you have emergency savings set aside?",
      description: "Emergency funds reduce the need to liquidate investments.",
      options: [
        {
          value: "1",
          title: "No emergency fund",
          description: "I do not have separate emergency savings.",
        },
        {
          value: "2",
          title: "Somewhat prepared",
          description: "I have some emergency savings.",
        },
        {
          value: "3",
          title: "Prepared",
          description: "I have adequate emergency savings.",
        },
        {
          value: "4",
          title: "Very prepared",
          description: "I have a strong emergency fund.",
        },
      ],
    },

    {
      name: "investmentBehavior",
      question:
        "How would you react if your investment performed poorly for one year?",
      description:
        "This helps us understand your long-term investment behaviour.",
      options: [
        {
          value: "1",
          title: "Exit",
          description: "I would probably exit the investment.",
        },
        {
          value: "2",
          title: "Reduce",
          description: "I would reduce my investment.",
        },
        {
          value: "3",
          title: "Continue",
          description: "I would continue holding the investment.",
        },
        {
          value: "4",
          title: "Invest more",
          description: "I would consider investing more.",
        },
      ],
    },
  ];

  const current = questions[currentQuestion];

  const handleAnswer = (value) => {
    setAnswers({
      ...answers,
      [current.name]: value,
    });
  };

  const goNext = () => {
    if (!answers[current.name]) return;

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateRisk();
    }
  };

  const goPrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleStartRetake = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmRetake = () => {
    setShowConfirmModal(false);
    setCurrentQuestion(0);
    setSaveError("");
    setSaveSuccess(false);
    setViewMode("questionnaire");
  };

  const handleCancelRetake = () => {
    setShowConfirmModal(false);
  };

  const handleStartFirstTime = () => {
    setCurrentQuestion(0);
    setSaveError("");
    setSaveSuccess(false);
    setViewMode("questionnaire");
  };

  const calculateRisk = async () => {
    const profile =
      JSON.parse(localStorage.getItem("investmentProfile")) ||
      JSON.parse(localStorage.getItem("investorProfile")) ||
      {};

    const answerValues = Object.values(answers).map(Number);

    const totalScore = answerValues.reduce(
      (sum, value) => sum + value,
      0
    );

    const maxScore = questions.length * 4;

    const riskScore = Math.round(
      (totalScore / maxScore) * 100
    );

    let riskCategory;

    if (riskScore <= 40) {
      riskCategory = "Conservative";
    } else if (riskScore <= 70) {
      riskCategory = "Moderate";
    } else {
      riskCategory = "Aggressive";
    }

    const riskResult = {
      ...profile,
      ...answers,
      riskScore,
      riskCategory,
    };

    try {
      setSubmitting(true);
      setSaveError("");

      const saveRes = await userApi.saveRiskAssessment({
        answers,
        riskScore,
        riskCategory,
      });

      const updatedAssessment = {
        ...riskResult,
        risk_score: riskScore,
        risk_category: riskCategory,
        riskScore,
        riskCategory,
        updated_at: saveRes?.assessment?.updated_at || new Date().toISOString(),
        updatedAt: saveRes?.assessment?.updated_at || new Date().toISOString(),
      };

      setAssessment(updatedAssessment);

      localStorage.setItem(
        "riskAssessment",
        JSON.stringify(riskResult)
      );

      setSaveSuccess(true);
      setViewMode("summary");
    } catch (error) {
      console.error("Failed to save risk assessment:", error);
      setSaveError(
        error?.data?.message ||
          "Failed to save risk assessment to server. Please try again."
      );
      // Fallback: still keep in local storage
      localStorage.setItem(
        "riskAssessment",
        JSON.stringify(riskResult)
      );
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "Recently";
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Recently";
    }
  };

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  const category = assessment?.risk_category || assessment?.riskCategory || "Moderate";
  const score = assessment?.risk_score ?? assessment?.riskScore;
  const lastDate = assessment?.updated_at || assessment?.updatedAt || assessment?.created_at;

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="risk-main">

        <div className="risk-content">

          {/* LOADING STATE */}
          {loadingInitial ? (
            <>
              <div className="risk-top">
                <div>
                  <div className="page-label">RISK ASSESSMENT</div>
                  <h1>Loading your risk assessment...</h1>
                  <p>Fetching your risk tolerance and behavioral profile...</p>
                </div>
              </div>

              <div className="risk-status-card">
                <RefreshCw
                  size={30}
                  className="spin"
                  style={{ color: "#2563eb", marginBottom: "16px" }}
                />
                <p style={{ color: "#667085" }}>Loading assessment data...</p>
              </div>
            </>
          ) : error ? (
            /* ERROR STATE */
            <>
              <div className="risk-top">
                <div>
                  <div className="page-label">RISK ASSESSMENT</div>
                  <h1>Unable to load your risk assessment.</h1>
                  <p style={{ color: "#ef4444" }}>{error}</p>
                </div>
              </div>

              <div className="risk-status-card">
                <AlertCircle
                  size={36}
                  style={{ color: "#ef4444", marginBottom: "16px" }}
                />
                <h2>Unable to load your risk assessment</h2>
                <p style={{ color: "#667085", marginBottom: "20px" }}>{error}</p>
                <button
                  onClick={fetchExistingAssessment}
                  className="primary-btn"
                >
                  Retry
                </button>
              </div>
            </>
          ) : viewMode === "summary" && assessment ? (
            /* SUMMARY VIEW (EXISTING COMPLETED ASSESSMENT) */
            <>
              <div className="risk-top">
                <div>
                  <div className="page-label">RISK ASSESSMENT</div>
                  <h1>Your Current Risk Profile</h1>
                  <p>
                    Overview of your evaluated risk tolerance and suitability tier.
                  </p>
                </div>
              </div>

              {saveSuccess && (
                <div className="risk-success-banner">
                  <CheckCircle2 size={18} />
                  <span>Risk assessment updated successfully! Your new risk profile is saved.</span>
                </div>
              )}

              <div className="risk-summary-grid">
                <div className="risk-summary-card">
                  <div className="risk-card-top">
                    <span className="summary-card-label">RISK LEVEL</span>
                    <ShieldCheck size={20} className="summary-card-icon" />
                  </div>
                  <h2 className={`risk-level-badge ${category.toLowerCase()}`}>
                    {category}
                  </h2>
                  <p className="summary-card-desc">
                    {category.toLowerCase() === "conservative"
                      ? "Prioritizes capital preservation with minimal volatility exposure."
                      : category.toLowerCase() === "aggressive"
                      ? "Seeks higher capital appreciation with higher tolerance for market fluctuations."
                      : "Seeks balanced growth through a diversified mix of stability and growth assets."}
                  </p>
                </div>

                <div className="risk-summary-card">
                  <div className="risk-card-top">
                    <span className="summary-card-label">SCORE</span>
                    <TrendingUp size={20} className="summary-card-icon" />
                  </div>
                  <h2>{score !== undefined && score !== null ? `${score}/100` : "—"}</h2>
                  <p className="summary-card-desc">
                    Derived from your behavioral responses to loss, volatility, and market dips.
                  </p>
                </div>

                <div className="risk-summary-card">
                  <div className="risk-card-top">
                    <span className="summary-card-label">LAST ASSESSMENT</span>
                    <Calendar size={20} className="summary-card-icon" />
                  </div>
                  <h3>{formatDate(lastDate)}</h3>
                  <p className="summary-card-desc">
                    Saved assessment date informing portfolio and asset recommendations.
                  </p>
                </div>
              </div>

              <div className="risk-summary-actions">
                <button
                  onClick={handleStartRetake}
                  className="primary-btn"
                  id="retake-assessment-btn"
                >
                  <RotateCcw size={17} />
                  Retake Assessment
                </button>
              </div>
            </>
          ) : viewMode === "empty" ? (
            /* FIRST-TIME USER EMPTY STATE */
            <>
              <div className="risk-top">
                <div>
                  <div className="page-label">RISK ASSESSMENT</div>
                  <h1>Risk Assessment</h1>
                  <p>
                    Complete your risk assessment to determine your investment risk profile.
                  </p>
                </div>
              </div>

              <div className="risk-status-card">
                <div className="risk-status-icon">
                  <ShieldAlert size={36} />
                </div>
                <h2>No risk assessment completed yet.</h2>
                <p>
                  Complete your risk assessment to determine your investment risk profile and receive personalized investment insights.
                </p>
                <button
                  onClick={handleStartFirstTime}
                  className="primary-btn"
                  id="start-assessment-btn"
                >
                  Start Assessment
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          ) : (
            /* QUESTIONNAIRE VIEW */
            <>
              <div className="risk-top">
                <div>
                  {assessment && (
                    <button
                      className="back-button"
                      onClick={() => {
                        setSaveSuccess(false);
                        setViewMode("summary");
                      }}
                      style={{
                        marginBottom: "16px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: "transparent",
                        border: "none",
                        color: "#64748b",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: 500,
                      }}
                    >
                      <ArrowLeft size={16} /> Back to Summary
                    </button>
                  )}

                  <div className="page-label">RISK ASSESSMENT</div>

                  <h1>Understand your risk profile.</h1>

                  <p>
                    Answer a few questions so InvestAI can understand your investment risk tolerance.
                  </p>
                </div>

                <div className="risk-progress-text">
                  {currentQuestion + 1} / {questions.length}
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="progress-container">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* QUESTION CARD */}
              <div className="question-card">
                <div className="question-header">
                  <div className="question-badge">
                    QUESTION {currentQuestion + 1}
                  </div>

                  <h2>{current.question}</h2>

                  <p>{current.description}</p>
                </div>

                {/* OPTIONS */}
                <div className="answer-grid">
                  {current.options.map((option) => {
                    const selected =
                      answers[current.name] === option.value;

                    return (
                      <button
                        key={option.value}
                        className={`answer-card ${
                          selected ? "selected" : ""
                        }`}
                        onClick={() =>
                          handleAnswer(option.value)
                        }
                      >
                        <div className="answer-radio">
                          {selected && (
                            <CheckCircle2 size={20} />
                          )}
                        </div>

                        <div className="answer-content">
                          <strong>{option.title}</strong>
                          <span>{option.description}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* BUTTONS */}
                {saveError && (
                  <p
                    style={{
                      color: "#ef4444",
                      fontSize: "14px",
                      marginTop: "10px",
                      marginBottom: "0px",
                    }}
                  >
                    {saveError}
                  </p>
                )}

                <div className="question-actions">
                  <button
                    className="secondary-button"
                    onClick={goPrevious}
                    disabled={currentQuestion === 0 || submitting}
                  >
                    <ArrowLeft size={18} />
                    Previous
                  </button>

                  <button
                    className="primary-button"
                    onClick={goNext}
                    disabled={!answers[current.name] || submitting}
                  >
                    {submitting
                      ? "Saving Assessment..."
                      : currentQuestion === questions.length - 1
                      ? "Calculate Risk Profile"
                      : "Next Question"}

                    <ArrowRight size={18} />
                  </button>
                </div>
              </div>

              {/* INFORMATION */}
              <div className="risk-note">
                <ShieldCheck size={20} />
                <div>
                  <strong>
                    Your information is used for suitability analysis.
                  </strong>
                  <p>
                    InvestAI uses your responses to build an investor profile. The assessment is designed as decision-support and does not guarantee investment returns.
                  </p>
                </div>
              </div>
            </>
          )}

        </div>

      </main>

      {/* CONFIRMATION MODAL FOR RETAKE */}
      {showConfirmModal && (
        <div className="risk-modal-overlay" onClick={handleCancelRetake}>
          <div className="risk-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="risk-modal-header">
              <AlertTriangle size={24} style={{ color: "#f59e0b" }} />
              <h3>Retake Risk Assessment?</h3>
            </div>
            <p className="risk-modal-body">
              Your new answers will replace your current risk assessment.
            </p>
            <div className="risk-modal-actions">
              <button
                className="secondary-btn"
                onClick={handleCancelRetake}
                id="cancel-retake-btn"
              >
                Cancel
              </button>
              <button
                className="primary-btn"
                onClick={handleConfirmRetake}
                id="continue-retake-btn"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default RiskAssessment;