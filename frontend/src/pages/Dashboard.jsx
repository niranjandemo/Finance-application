import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { userApi, recommendationApi } from "../services/api";

import {
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowRight,
  UserRound
} from "lucide-react";

function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await userApi.getDashboard();

      // If aiSuitability is not yet populated from backend, fall back to existing recommendations API
      if (res && (res.aiSuitability === null || res.aiSuitability === undefined)) {
        try {
          const recRes = await recommendationApi.getRecommendations();
          if (
            recRes &&
            recRes.isPersonalized &&
            recRes.overallSuitability !== null &&
            recRes.overallSuitability !== undefined
          ) {
            res.aiSuitability = recRes.overallSuitability;
            res.aiSuitabilityLabel = "Overall Hybrid Score";
          }
        } catch {
          // Gracefully continue with pending evaluation
        }
      }

      setData(res);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
      setError(err?.data?.message || err?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const formatHorizon = (horizon) => {
    if (!horizon) return "Not Set";
    const lower = horizon.toLowerCase();
    if (lower === "short") return "Less than 3 Years";
    if (lower === "medium") return "3–7 Years";
    if (lower === "long") return "7+ Years";
    return horizon;
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="page-label">OVERVIEW</span>
              <h1>Loading Dashboard...</h1>
              <p>Fetching your personalized financial overview...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="page-label">OVERVIEW</span>
              <h1>Unable to load dashboard</h1>
              <p style={{ color: "#ef4444" }}>{error}</p>
            </div>
            <button onClick={fetchDashboardData} className="primary-btn">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  const userName = data?.user?.name || "Investor";
  const riskAssessment = data?.riskAssessment;
  const profile = data?.profile;
  const riskCategory = riskAssessment?.category || riskAssessment?.riskCategory;
  const riskScore = riskAssessment?.score ?? riskAssessment?.riskScore;
  const horizon = profile?.investmentHorizon || profile?.horizon;
  const profileCompletion = data?.profileCompletion ?? 0;
  const aiSuitability = data?.aiSuitability;
  const aiSuitabilityLabel = data?.aiSuitabilityLabel;

  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <div className="dashboard-header">

          <div>
            <span className="page-label">OVERVIEW</span>

            <h1>{getGreeting()}, {userName}.</h1>

            <p>
              Here's an overview of your investment profile.
            </p>
          </div>

          <nav className="top-navbar-actions" aria-label="Quick Actions">
            <Link
              to="/risk-assessment"
              className="navbar-icon-btn"
              title="Risk Assessment"
              aria-label="Risk Assessment"
              id="dashboard-risk-assessment-btn"
            >
              <ShieldCheck size={20} />
              <span className="navbar-tooltip">Risk Assessment</span>
            </Link>

            <Link
              to="/profile"
              className="navbar-icon-btn"
              title="My Profile"
              aria-label="My Profile"
              id="dashboard-profile-btn"
            >
              <UserRound size={20} />
              <span className="navbar-tooltip">My Profile</span>
            </Link>
          </nav>

        </div>


        <div className="stats-grid">

          <div className="stat-card">
            <span>Risk Profile</span>
            <h2>{riskCategory || "Not Assessed"}</h2>
            {riskScore !== undefined && riskScore !== null ? (
              <small style={{ color: "#667085", fontSize: "12px", display: "block", marginTop: "4px" }}>
                Score: {riskScore}/100
              </small>
            ) : (
              <small style={{ color: "#9ca3af", fontSize: "12px", display: "block", marginTop: "4px" }}>
                No assessment completed
              </small>
            )}
            <ShieldCheck />
          </div>

          <div className="stat-card">
            <span>Investment Horizon</span>
            <h2>{formatHorizon(horizon)}</h2>
            <TrendingUp />
          </div>

          <div className="stat-card">
            <span>AI Suitability</span>
            <h2>{aiSuitability !== null && aiSuitability !== undefined ? `${aiSuitability}%` : "—"}</h2>
            <small
              style={{
                color: aiSuitability !== null && aiSuitability !== undefined ? "#047857" : "#9ca3af",
                fontSize: "12px",
                display: "block",
                marginTop: "4px"
              }}
            >
              {aiSuitability !== null && aiSuitability !== undefined
                ? (aiSuitabilityLabel || "Overall Hybrid Score")
                : "Pending evaluation"}
            </small>
            <Sparkles />
          </div>

          <div className="stat-card">
            <span>Profile Completion</span>
            <h2>{profileCompletion}%</h2>
            <ArrowUpRight />
          </div>

        </div>


        <div className="dashboard-grid">

          <div className="panel">

            <div className="panel-header">
              <div>
                <span>AI INSIGHT</span>
                <h2>Your investment profile</h2>
              </div>

              <Sparkles size={22} />
            </div>

            {riskCategory && horizon ? (
              <p>
                Based on your current profile, you have a <strong>{riskCategory.toLowerCase()}</strong> risk tolerance and a <strong>{formatHorizon(horizon).toLowerCase()}</strong> investment horizon. Diversified investments may align better with your profile.
              </p>
            ) : riskCategory ? (
              <p>
                Based on your current profile, you have a <strong>{riskCategory.toLowerCase()}</strong> risk tolerance. Complete your profile horizon and goals to receive more tailored insights.
              </p>
            ) : (
              <p>
                You have not completed your risk assessment yet. Take the assessment to determine your risk profile and receive personalized investment insights.
              </p>
            )}

            <Link to={riskAssessment ? "/recommendations" : "/risk-assessment"} className="text-link">
              {riskAssessment ? "View recommendations" : "Start risk assessment"}
              <ArrowRight size={16} />
            </Link>

          </div>


          <div className="panel">

            <div className="panel-header">
              <div>
                <span>MARKET SNAPSHOT</span>
                <h2>Today's Market</h2>
              </div>

              <TrendingUp size={22} />
            </div>

            <div className="market-row">
              <span>NIFTY 50</span>
              <strong>24,680</strong>
              <small>+0.72%</small>
            </div>

            <div className="market-row">
              <span>SENSEX</span>
              <strong>80,950</strong>
              <small>+0.58%</small>
            </div>

            <div className="market-row">
              <span>NIFTY BANK</span>
              <strong>55,120</strong>
              <small>+0.41%</small>
            </div>

          </div>

        </div>


        <div className="panel">

          <div className="panel-header">

            <div>
              <span>RECOMMENDED FOR YOU</span>
              <h2>Investment Categories</h2>
            </div>

            <Link to="/recommendations">
              View All
            </Link>

          </div>


          <div className="recommendation-grid">

            <div className="recommendation-card">
              <span>LOW–MODERATE RISK</span>
              <h3>Large Cap Equity</h3>
              <strong>91% Match</strong>
            </div>

            <div className="recommendation-card">
              <span>MODERATE RISK</span>
              <h3>Diversified Equity</h3>
              <strong>87% Match</strong>
            </div>

            <div className="recommendation-card">
              <span>LOW RISK</span>
              <h3>Government Bonds</h3>
              <strong>78% Match</strong>
            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;