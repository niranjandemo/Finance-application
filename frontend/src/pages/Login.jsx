import { Link, useNavigate } from "react-router-dom";
import { BrainCircuit, Mail, Lock } from "lucide-react";
import { useState } from "react";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/auth/login",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed.");
        return;
      }

      // Store JWT
      localStorage.setItem("token", data.token);

      // Store user
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      // Navigate to profile
      navigate("/profile");

    } catch (error) {

      console.error("Login error:", error);

      setError(
        "Unable to connect to the server. Please try again."
      );

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <Link to="/" className="auth-logo">

          <BrainCircuit size={25} />

          InvestAI

        </Link>


        <h1>Welcome back</h1>

        <p className="auth-description">
          Login to continue your investment journey.
        </p>


        <form onSubmit={handleLogin}>

          {/* Email */}

          <label>Email</label>

          <div className="input-box">

            <Mail size={18} />

            <input
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>


          {/* Password */}

          <label>Password</label>

          <div className="input-box">

            <Lock size={18} />

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />

          </div>


          {/* Error */}

          {error && (
            <p className="auth-error">
              {error}
            </p>
          )}


          {/* Login button */}

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >

            {loading
              ? "Logging in..."
              : "Login"}

          </button>

        </form>


        <p className="auth-footer">

          Don't have an account?

          <Link to="/register">
            {" "}Create Account
          </Link>

        </p>

      </div>

    </div>
  );
}

export default Login;