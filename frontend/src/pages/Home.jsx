import { Link } from "react-router-dom";
import {
  ArrowRight,
  BrainCircuit,
  ShieldCheck,
  TrendingUp,
  Building2,
  Sparkles
} from "lucide-react";

import Navbar from "../components/Navbar";

function Home() {
  return (
    <div className="home-page">

      <Navbar />

      <section className="hero">

        <div className="hero-content">

          <div className="hero-badge">
            <Sparkles size={15} />
            AI-POWERED INVESTMENT DECISION SUPPORT
          </div>

          <h1>
            Invest based on
            <span> who you are.</span>
          </h1>

          <p>
            InvestAI analyzes your financial goals, risk tolerance,
            investment horizon and preferences to provide personalized
            investment and broker recommendations.
          </p>

          <div className="hero-actions">

            <Link to="/register" className="primary-btn">
              Build My Investment Profile
              <ArrowRight size={18} />
            </Link>

            <Link to="/market" className="secondary-btn">
              Explore Platform
            </Link>

          </div>

        </div>


        <div className="hero-dashboard">

          <div className="score-card">

            <div className="score-header">
              <span>AI SUITABILITY SCORE</span>
              <Sparkles size={18} />
            </div>

            <div className="score">
              87<span>%</span>
            </div>

            <p>Excellent Match</p>

            <div className="score-bars">

              <div>
                <span>Risk Profile</span>
                <strong>82%</strong>
              </div>

              <div className="progress">
                <span style={{ width: "82%" }} />
              </div>

              <div>
                <span>Investment Horizon</span>
                <strong>91%</strong>
              </div>

              <div className="progress">
                <span style={{ width: "91%" }} />
              </div>

              <div>
                <span>Financial Goal</span>
                <strong>85%</strong>
              </div>

              <div className="progress">
                <span style={{ width: "85%" }} />
              </div>

            </div>

          </div>

        </div>

      </section>


      <section className="features-section">

        <div className="section-heading">
          <span>CORE FEATURES</span>

          <h2>
            One platform for
            <br />
            better investment decisions.
          </h2>
        </div>


        <div className="feature-grid">

          <div className="feature-card">
            <BrainCircuit size={30} />

            <h3>Investor Profiling</h3>

            <p>
              Build a personalized financial profile using
              goals, savings, experience and investment horizon.
            </p>
          </div>


          <div className="feature-card">
            <TrendingUp size={30} />

            <h3>Investment Suitability</h3>

            <p>
              Evaluate investment categories according to
              your personal financial characteristics.
            </p>
          </div>


          <div className="feature-card">
            <Building2 size={30} />

            <h3>Broker Recommendation</h3>

            <p>
              Compare brokers based on fees, products,
              features and your requirements.
            </p>
          </div>


          <div className="feature-card">
            <ShieldCheck size={30} />

            <h3>Explainable AI</h3>

            <p>
              Understand the factors responsible for every
              recommendation instead of receiving a black-box result.
            </p>
          </div>

        </div>

      </section>


      <section className="how-section">

        <div className="section-heading">
          <span>HOW IT WORKS</span>

          <h2>
            From your profile
            <br />
            to your recommendation.
          </h2>
        </div>


        <div className="steps">

          <div className="step">
            <span>01</span>
            <h3>Build Profile</h3>
            <p>
              Enter your financial and investment information.
            </p>
          </div>

          <div className="step">
            <span>02</span>
            <h3>Assess Risk</h3>
            <p>
              Complete a behavioral risk assessment.
            </p>
          </div>

          <div className="step">
            <span>03</span>
            <h3>AI Analysis</h3>
            <p>
              ML models analyze your suitability.
            </p>
          </div>

          <div className="step">
            <span>04</span>
            <h3>Understand</h3>
            <p>
              Receive recommendations with explanations.
            </p>
          </div>

        </div>

      </section>


      <footer className="footer">

        <strong>InvestAI</strong>

        <span>
          AI-powered investment decision support.
        </span>

      </footer>

    </div>
  );
}

export default Home;