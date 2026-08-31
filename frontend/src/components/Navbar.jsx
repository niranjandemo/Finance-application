import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

function Navbar() {
  return (
    <nav className="navbar">

      <Link to="/" className="logo">
        <BrainCircuit size={25} />
        InvestAI
      </Link>

      <div className="nav-links">
        <Link to="/market">Market</Link>
        <Link to="/investments">Investments</Link>
        <Link to="/brokers">Brokers</Link>
        <Link to="/education">Learn</Link>

        <Link to="/login" className="login-btn">
          Login
        </Link>

        <Link to="/register" className="signup-btn">
          Get Started
        </Link>
      </div>

    </nav>
  );
}

export default Navbar;