import { Link } from "react-router-dom";
import Sidebar from "../components/Sidebar";

import {
  Sparkles,
  ArrowRight,
  ShieldCheck
} from "lucide-react";

function Recommendations() {
  return (
    <div className="dashboard-layout">

      <Sidebar />

      <main className="dashboard-main">

        <div className="dashboard-header">

          <div>
            <span className="page-label">
              AI RECOMMENDATIONS
            </span>

            <h1>Your personalized recommendations</h1>

            <p>
              Recommendations generated from your investor profile.
            </p>
          </div>

        </div>


        <div className="ai-result">

          <div className="ai-result-icon">
            <Sparkles size={30} />
          </div>

          <div>
            <span>OVERALL SUITABILITY</span>

            <h2>
              87%
            </h2>

            <p>
              Your current profile has a strong suitability match
              with a diversified moderate-risk investment strategy.
            </p>
          </div>

        </div>


        <div className="recommendation-list">

          <div className="recommendation-result">

            <div>
              <span>01 · 91% MATCH</span>

              <h2>Large Cap Equity</h2>

              <p>
                Suitable due to your medium-to-long investment
                horizon and moderate risk tolerance.
              </p>
            </div>

            <Link to="/xai" className="outline-btn">
              Why this?
              <ArrowRight size={16} />
            </Link>

          </div>


          <div className="recommendation-result">

            <div>
              <span>02 · 87% MATCH</span>

              <h2>Diversified Equity</h2>

              <p>
                Diversification may reduce concentration risk
                while providing long-term growth exposure.
              </p>
            </div>

            <Link to="/xai" className="outline-btn">
              Why this?
              <ArrowRight size={16} />
            </Link>

          </div>


          <div className="recommendation-result">

            <div>
              <span>03 · 78% MATCH</span>

              <h2>Government Bonds</h2>

              <p>
                Provides a relatively lower-risk option that
                can support the stability portion of a portfolio.
              </p>
            </div>

            <Link to="/xai" className="outline-btn">
              Why this?
              <ArrowRight size={16} />
            </Link>

          </div>

        </div>


        <div className="responsible-note">

          <ShieldCheck size={20} />

          <p>
            These results are educational decision-support outputs,
            not guaranteed investment advice or return predictions.
          </p>

        </div>

      </main>

    </div>
  );
}

export default Recommendations;