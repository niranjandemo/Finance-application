import { Link } from "react-router-dom";

import Sidebar from "../components/Sidebar";

import {
  TrendingUp,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  ArrowRight
} from "lucide-react";

function Dashboard() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <div className="dashboard-header">

          <div>
            <span className="page-label">OVERVIEW</span>

            <h1>Good afternoon, Investor.</h1>

            <p>
              Here's an overview of your investment profile.
            </p>
          </div>

          <Link to="/risk-assessment" className="primary-btn">
            Update Risk Profile
          </Link>

        </div>


        <div className="stats-grid">

          <div className="stat-card">
            <span>Risk Profile</span>
            <h2>Moderate</h2>
            <ShieldCheck />
          </div>

          <div className="stat-card">
            <span>Investment Horizon</span>
            <h2>5–10 Years</h2>
            <TrendingUp />
          </div>

          <div className="stat-card">
            <span>AI Suitability</span>
            <h2>87%</h2>
            <Sparkles />
          </div>

          <div className="stat-card">
            <span>Profile Completion</span>
            <h2>82%</h2>
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

            <p>
              Based on your current profile, you have a moderate
              risk tolerance and a medium-to-long investment horizon.
              Diversified investments may align better with your profile.
            </p>

            <Link to="/recommendations" className="text-link">
              View recommendations
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