import React, { useEffect, useState } from "react";
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

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // ============================================================
  // LOAD EXISTING PROFILE FROM BACKEND
  // ============================================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = localStorage.getItem("token");

        // No token → user is not logged in
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await fetch(
          "http://localhost:5000/api/users/profile",
          {
            method: "GET",

            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        // Profile doesn't exist yet
        if (response.status === 404) {
          setLoading(false);
          return;
        }

        // Token may have expired
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        if (!response.ok) {
          console.error(
            data.message || "Failed to load profile"
          );

          setLoading(false);
          return;
        }

        const profile = data.profile;

        // Convert PostgreSQL data into React form format
        setFormData({
          age: profile.age ?? "",
          income: profile.income ?? "",
          savings: profile.savings ?? "",
          investmentAmount:
            profile.investment_amount ?? "",
          goal: profile.goal ?? "",
          horizon: profile.horizon ?? "",
          experience: profile.experience ?? "",
          liquidity: profile.liquidity ?? "",
        });

        // Keep a local copy as well
        localStorage.setItem(
          "investmentProfile",
          JSON.stringify({
            age: profile.age ?? "",
            income: profile.income ?? "",
            savings: profile.savings ?? "",
            investmentAmount:
              profile.investment_amount ?? "",
            goal: profile.goal ?? "",
            horizon: profile.horizon ?? "",
            experience: profile.experience ?? "",
            liquidity: profile.liquidity ?? "",
          })
        );

      } catch (error) {
        console.error(
          "Failed to load investment profile:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);


  // ============================================================
  // HANDLE INPUT CHANGES
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  };


  // ============================================================
  // SAVE PROFILE TO BACKEND
  // ============================================================

  const handleContinue = async (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (saving) {
      return;
    }

    const token = localStorage.getItem("token");

    // User is not logged in
    if (!token) {
      navigate("/login");
      return;
    }


    // ==========================================================
    // VALIDATION
    // ==========================================================

    if (
      !formData.age ||
      !formData.income ||
      !formData.savings ||
      !formData.investmentAmount ||
      !formData.goal ||
      !formData.horizon ||
      !formData.experience ||
      !formData.liquidity
    ) {
      alert("Please complete all profile fields.");
      return;
    }


    // ==========================================================
    // SAVE
    // ==========================================================

    try {
      setSaving(true);

      const response = await fetch(
        "http://localhost:5000/api/users/profile",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();


      // ========================================================
      // HANDLE AUTHENTICATION ERROR
      // ========================================================

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        localStorage.removeItem("token");

        alert("Your session has expired. Please login again.");

        navigate("/login");
        return;
      }


      // ========================================================
      // HANDLE OTHER ERRORS
      // ========================================================

      if (!response.ok) {
        alert(
          data.message ||
            "Failed to save your investment profile."
        );

        return;
      }


      // ========================================================
      // SAVE LOCAL COPY
      // ========================================================

      localStorage.setItem(
        "investmentProfile",
        JSON.stringify(formData)
      );


      // ========================================================
      // GO TO RISK ASSESSMENT
      // ========================================================

      navigate("/risk-assessment");

    } catch (error) {
      console.error(
        "Profile save error:",
        error
      );

      alert(
        "Unable to connect to the server. Please try again."
      );

    } finally {
      setSaving(false);
    }
  };


  // ============================================================
  // LOADING STATE
  // ============================================================

  if (loading) {
    return (
      <div className="app-layout">

        <Sidebar />

        <main className="profile-page">

          <div className="profile-header">

            <div className="profile-icon">
              <User size={32} />
            </div>

            <h1>Build Your Investment Profile</h1>

            <p>
              Loading your investment profile...
            </p>

          </div>

        </main>

      </div>
    );
  }


  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="app-layout">

      {/* Common Sidebar */}
      <Sidebar />


      {/* Main Content */}
      <main className="profile-page">


        {/* Back Button */}

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

          <h1>
            Build Your Investment Profile
          </h1>

          <p>
            Tell us about your financial situation
            and investment preferences so we can
            understand your suitability profile.
          </p>

        </div>


        {/* Form Card */}

        <div className="profile-card">


          {/* ==================================================
              PERSONAL INFORMATION
          ================================================== */}

          <section className="profile-section">

            <h2>Personal Information</h2>

            <div className="form-grid">


              {/* Age */}

              <div className="form-group">

                <label>Age</label>

                <input
                  type="number"
                  name="age"
                  placeholder="Enter your age"
                  value={formData.age}
                  onChange={handleChange}
                  min="18"
                  max="100"
                />

              </div>


              {/* Income */}

              <div className="form-group">

                <label>
                  Monthly Income (₹)
                </label>

                <input
                  type="number"
                  name="income"
                  placeholder="Example: 50000"
                  value={formData.income}
                  onChange={handleChange}
                  min="0"
                />

              </div>


              {/* Savings */}

              <div className="form-group">

                <label>
                  Monthly Savings (₹)
                </label>

                <input
                  type="number"
                  name="savings"
                  placeholder="Example: 15000"
                  value={formData.savings}
                  onChange={handleChange}
                  min="0"
                />

              </div>


              {/* Investment Amount */}

              <div className="form-group">

                <label>
                  Amount Available for Investment (₹)
                </label>

                <input
                  type="number"
                  name="investmentAmount"
                  placeholder="Example: 100000"
                  value={formData.investmentAmount}
                  onChange={handleChange}
                  min="0"
                />

              </div>

            </div>

          </section>


          {/* ==================================================
              INVESTMENT PREFERENCES
          ================================================== */}

          <section className="profile-section">

            <h2>Investment Preferences</h2>

            <div className="form-grid">


              {/* Investment Goal */}

              <div className="form-group">

                <label>
                  Primary Investment Goal
                </label>

                <select
                  name="goal"
                  value={formData.goal}
                  onChange={handleChange}
                >

                  <option value="">
                    Select your goal
                  </option>

                  <option value="wealth-growth">
                    Wealth Growth
                  </option>

                  <option value="retirement">
                    Retirement
                  </option>

                  <option value="education">
                    Education
                  </option>

                  <option value="house">
                    Buying a House
                  </option>

                  <option value="emergency">
                    Emergency Fund
                  </option>

                  <option value="income">
                    Regular Income
                  </option>

                </select>

              </div>


              {/* Investment Horizon */}

              <div className="form-group">

                <label>
                  Investment Horizon
                </label>

                <select
                  name="horizon"
                  value={formData.horizon}
                  onChange={handleChange}
                >

                  <option value="">
                    Select investment horizon
                  </option>

                  <option value="short">
                    Less than 3 years
                  </option>

                  <option value="medium">
                    3–7 years
                  </option>

                  <option value="long">
                    More than 7 years
                  </option>

                </select>

              </div>


              {/* Investment Experience */}

              <div className="form-group">

                <label>
                  Investment Experience
                </label>

                <select
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
                >

                  <option value="">
                    Select your experience level
                  </option>

                  <option value="beginner">
                    Beginner
                  </option>

                  <option value="intermediate">
                    Intermediate
                  </option>

                  <option value="experienced">
                    Experienced
                  </option>

                </select>

              </div>


              {/* Liquidity */}

              <div className="form-group">

                <label>
                  Liquidity Requirement
                </label>

                <select
                  name="liquidity"
                  value={formData.liquidity}
                  onChange={handleChange}
                >

                  <option value="">
                    Select liquidity requirement
                  </option>

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


          {/* ==================================================
              CONTINUE BUTTON
          ================================================== */}

          <div className="profile-actions">

            <button
              type="button"
              className="continue-button"
              onClick={handleContinue}
              disabled={saving}
            >

              {saving
                ? "Saving Profile..."
                : "Continue to Risk Assessment"}

              {!saving && (
                <ArrowRight size={20} />
              )}

            </button>

          </div>

        </div>

      </main>

    </div>
  );
};

export default Profile;