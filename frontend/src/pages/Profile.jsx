import React, { useState } from "react";
import { ArrowLeft, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const Profile = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: "",
    income: "",
    savings: "",
    investmentAmount: "",
    goal: "",
    horizon: "",
    experience: "",
    liquidity: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleContinue = () => {
    // Save profile data for later ML/recommendation processing
    localStorage.setItem("investmentProfile", JSON.stringify(formData));

    navigate("/risk-assessment");
  };

  return (
    <div className="app-layout">

      {/* Common Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="profile-page">

        {/* Back */}
        <button
          className="back-button"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft size={20} />
          Back
        </button>

        {/* Header */}
        <div className="profile-header">

          <div className="profile-icon">
            <User size={32} />
          </div>

          <h1>Build Your Investment Profile</h1>

          <p>
            Tell us about your financial situation and investment preferences
            so we can understand your suitability profile.
          </p>

        </div>

        {/* Form Card */}
        <div className="profile-card">

          {/* Personal Information */}
          <section className="profile-section">

            <h2>Personal Information</h2>

            <div className="form-grid">

              <div className="form-group">
                <label>Age</label>
                <input
                  type="number"
                  name="age"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Monthly Income (₹)</label>
                <input
                  type="number"
                  name="income"
                  placeholder="Example: 50000"
                  value={formData.income}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Monthly Savings (₹)</label>
                <input
                  type="number"
                  name="savings"
                  placeholder="Example: 15000"
                  value={formData.savings}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Amount Available for Investment (₹)</label>
                <input
                  type="number"
                  name="investmentAmount"
                  placeholder="Example: 100000"
                  value={formData.investmentAmount}
                  onChange={handleChange}
                />
              </div>

            </div>

          </section>

          {/* Investment Preferences */}
          <section className="profile-section">

            <h2>Investment Preferences</h2>

            <div className="form-grid">

              <div className="form-group">
                <label>Primary Investment Goal</label>

                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                >
                  <option value="">Select your goal</option>
                  <option value="wealth-growth">Wealth Growth</option>
                  <option value="retirement">Retirement</option>
                  <option value="education">Education</option>
                  <option value="house">Buying a House</option>
                  <option value="emergency">Emergency Fund</option>
                  <option value="income">Regular Income</option>
                </select>
              </div>

              <div className="form-group">
                <label>Investment Horizon</label>

                <select
                  name="horizon"
                  value={formData.horizon}
                  onChange={handleChange}
                >
                  <option value="">Select investment horizon</option>
                  <option value="short">Less than 3 years</option>
                  <option value="medium">3–7 years</option>
                  <option value="long">More than 7 years</option>
                </select>
              </div>

              <div className="form-group">
                <label>Investment Experience</label>

                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                >
                  <option value="">Select your experience level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="experienced">Experienced</option>
                </select>
              </div>

              <div className="form-group">
                <label>Liquidity Requirement</label>

                <select
                  name="liquidity"
                  value={formData.liquidity}
                  onChange={handleChange}
                >
                  <option value="">Select liquidity requirement</option>
                  <option value="high">
                    High – I may need the money anytime
                  </option>
                  <option value="medium">
                    Medium – I may need it occasionally
                  </option>
                  <option value="low">
                    Low – I can keep money invested
                  </option>
                </select>
              </div>

            </div>

          </section>

          {/* Continue Button */}
          <div className="profile-actions">

            <button
              className="continue-button"
              onClick={handleContinue}
            >
              Continue to Risk Assessment
              <ArrowRight size={20} />
            </button>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Profile;