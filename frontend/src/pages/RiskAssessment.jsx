import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

function RiskAssessment() {
  const navigate = useNavigate();

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState({
    lossReaction: "",
    volatility: "",
    returnPreference: "",
    emergencyFund: "",
    investmentBehavior: "",
  });

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
        "Higher tolerance for volatility generally indicates greater risk tolerance.",
      options: [
        {
          value: "1",
          title: "Very uncomfortable",
          description: "I prefer stable investments.",
        },
        {
          value: "2",
          title: "Somewhat uncomfortable",
          description: "I can accept small fluctuations.",
        },
        {
          value: "3",
          title: "Comfortable",
          description: "I can tolerate noticeable fluctuations.",
        },
        {
          value: "4",
          title: "Very comfortable",
          description: "Large fluctuations do not concern me.",
        },
      ],
    },

    {
      name: "returnPreference",
      question: "Which investment approach would you prefer?",
      description:
        "This helps identify how you balance potential returns against risk.",
      options: [
        {
          value: "1",
          title: "Lower risk",
          description: "Lower potential return with lower risk.",
        },
        {
          value: "2",
          title: "Balanced",
          description: "A balance between risk and return.",
        },
        {
          value: "3",
          title: "Growth",
          description: "Higher potential return with higher risk.",
        },
        {
          value: "4",
          title: "Maximum growth",
          description: "I prioritize growth potential.",
        },
      ],
    },

    {
      name: "emergencyFund",
      question:
        "How prepared are you for unexpected financial expenses?",
      description:
        "Your emergency savings can affect your ability to tolerate investment losses.",
      options: [
        {
          value: "1",
          title: "Not prepared",
          description: "I have little or no emergency savings.",
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

  const calculateRisk = () => {
    const profile =
      JSON.parse(localStorage.getItem("investorProfile")) || {};

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

    localStorage.setItem(
      "riskAssessment",
      JSON.stringify(riskResult)
    );

    navigate("/dashboard");
  };

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="risk-main">

        <div className="risk-content">

          {/* HEADER */}
          <div className="risk-top">

            <div>

              <div className="page-label">
                RISK ASSESSMENT
              </div>

              <h1>
                Understand your risk profile.
              </h1>

              <p>
                Answer a few questions so InvestAI can
                understand your investment risk tolerance.
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

              <h2>
                {current.question}
              </h2>

              <p>
                {current.description}
              </p>

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

                      <strong>
                        {option.title}
                      </strong>

                      <span>
                        {option.description}
                      </span>

                    </div>

                  </button>
                );
              })}

            </div>

            {/* BUTTONS */}
            <div className="question-actions">

              <button
                className="secondary-button"
                onClick={goPrevious}
                disabled={currentQuestion === 0}
              >
                <ArrowLeft size={18} />
                Previous
              </button>

              <button
                className="primary-button"
                onClick={goNext}
                disabled={!answers[current.name]}
              >
                {currentQuestion === questions.length - 1
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
                InvestAI uses your responses to build an
                investor profile. The assessment is designed
                as decision-support and does not guarantee
                investment returns.
              </p>

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default RiskAssessment;