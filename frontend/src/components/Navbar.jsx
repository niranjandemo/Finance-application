import { Link } from "react-router-dom";
import { BrainCircuit, ShieldCheck, UserRound } from "lucide-react";

function Navbar() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  return (
    <nav className="navbar" aria-label="Main Navigation">

      <Link to="/" className="logo">
        <BrainCircuit size={25} />
        InvestAI
      </Link>

      <div className="nav-links">
        <Link to="/market">Market</Link>
        <Link to="/investments">Investments</Link>
        <Link to="/brokers">Brokers</Link>
        <Link to="/education">Learn</Link>

        {token ? (
          <Link to="/dashboard" className="nav-dashboard-link">
            Dashboard
          </Link>
        ) : (
          <Link to="/login" className="login-btn">
            Login
          </Link>
        )}

        {/* Compact Top-Right Controls */}
        <div className="top-navbar-actions">
          <Link
            to="/risk-assessment"
            className="navbar-icon-btn"
            title="Risk Assessment"
            aria-label="Risk Assessment"
            id="navbar-risk-assessment"
          >
            <ShieldCheck size={19} />
            <span className="navbar-tooltip">Risk Assessment</span>
          </Link>

          <Link
            to="/profile"
            className="navbar-icon-btn"
            title="My Profile"
            aria-label="My Profile"
            id="navbar-profile"
          >
            <UserRound size={19} />
            <span className="navbar-tooltip">My Profile</span>
          </Link>
        </div>

        {!token && (
          <Link to="/register" className="signup-btn">
            Get Started
          </Link>
        )}
      </div>

    </nav>
  );
}

export default Navbar;