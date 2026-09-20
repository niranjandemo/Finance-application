import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { educationApi } from "../services/api";
import {
  BookOpen,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  X,
  Clock,
  GraduationCap,
} from "lucide-react";

function Education() {
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedArticle, setSelectedArticle] = useState(null);

  const fetchEducation = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await educationApi.getEducation();
      setContent(data.content || []);
    } catch (err) {
      console.error("Failed to load educational content:", err);
      setError(
        err?.data?.message || err?.message || "Failed to load educational content"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="page-label">FINANCIAL EDUCATION</span>
              <h1>Loading Education Library...</h1>
              <p>Fetching educational resources and investment fundamentals...</p>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              padding: "60px 0",
              color: "#6b7280",
            }}
          >
            <RefreshCw
              size={30}
              className="spin"
              style={{ animation: "spin 1s linear infinite", marginRight: "12px" }}
            />
            <span>Loading articles...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error && content.length === 0) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="page-label">FINANCIAL EDUCATION</span>
              <h1>Unable to load educational content</h1>
              <p style={{ color: "#ef4444" }}>{error}</p>
            </div>
            <button onClick={fetchEducation} className="primary-btn">
              Retry
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <div>
            <span className="page-label">FINANCIAL EDUCATION</span>

            <h1>Learn before you invest</h1>

            <p>
              Simple educational resources to help you understand investment concepts.
            </p>

            <div
              style={{
                marginTop: "8px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "12px",
                color: "#6b7280",
              }}
            >
              <span
                style={{
                  background: "#f3f4f6",
                  border: "1px solid #e5e7eb",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#4b5563",
                  fontWeight: 500,
                }}
              >
                Informational Learning Content (Non-Advisory)
              </span>
            </div>
          </div>
        </div>

        {content.length === 0 ? (
          <div
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
              borderRadius: "12px",
              padding: "48px 24px",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            <BookOpen size={40} color="#9ca3af" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "16px", color: "#111827", marginBottom: "6px" }}>
              No Educational Articles Available
            </h3>
            <p style={{ fontSize: "13px" }}>
              The education library is currently empty. Please check back later.
            </p>
          </div>
        ) : (
          <div className="education-grid">
            {content.map((item) => (
              <div className="education-card" key={item.id || item.title}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "10px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      color: "#2563eb",
                      textTransform: "uppercase",
                    }}
                  >
                    {item.category || "LEARN"}
                  </span>
                  <span
                    style={{
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "10px",
                      backgroundColor:
                        item.difficulty === "Beginner" ? "#ecfdf5" : "#eff6ff",
                      color:
                        item.difficulty === "Beginner" ? "#047857" : "#1d4ed8",
                      border: `1px solid ${
                        item.difficulty === "Beginner" ? "#a7f3d0" : "#bfdbfe"
                      }`,
                    }}
                  >
                    {item.difficulty || "Beginner"}
                  </span>
                </div>

                <h2>{item.title}</h2>

                <p>{item.summary}</p>

                <button
                  type="button"
                  onClick={() => setSelectedArticle(item)}
                  className="outline-btn"
                  style={{ cursor: "pointer", width: "100%", textAlign: "center" }}
                >
                  Read Article
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Educational Disclaimer Banner (Step 10) */}
        <div className="responsible-note" style={{ marginTop: "28px" }}>
          <ShieldCheck size={20} />
          <p>
            Educational content is provided for general learning purposes and does not constitute personalized financial advice.
          </p>
        </div>

        {/* In-Page Article Reading Modal */}
        {selectedArticle && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(4px)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              padding: "20px",
            }}
            onClick={() => setSelectedArticle(null)}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "16px",
                maxWidth: "600px",
                width: "100%",
                maxHeight: "85vh",
                overflowY: "auto",
                padding: "32px",
                boxShadow:
                  "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedArticle(null)}
                aria-label="Close article"
                style={{
                  position: "absolute",
                  top: "22px",
                  right: "22px",
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                <X size={18} />
              </button>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.06em",
                    color: "#2563eb",
                    backgroundColor: "#eff6ff",
                    padding: "3px 8px",
                    borderRadius: "6px",
                    textTransform: "uppercase",
                  }}
                >
                  {selectedArticle.category}
                </span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    padding: "3px 8px",
                    borderRadius: "6px",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                  }}
                >
                  {selectedArticle.difficulty} Level
                </span>
              </div>

              <h2
                style={{
                  fontSize: "22px",
                  fontWeight: 700,
                  color: "#0f172a",
                  margin: "8px 0 14px",
                  lineHeight: "1.3",
                }}
              >
                {selectedArticle.title}
              </h2>

              <div
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "12px 16px",
                  marginBottom: "20px",
                  fontSize: "13px",
                  color: "#475569",
                  lineHeight: "1.6",
                }}
              >
                <strong>Overview: </strong>
                {selectedArticle.summary}
              </div>

              <div
                style={{
                  fontSize: "14px",
                  lineHeight: "1.75",
                  color: "#334155",
                  marginBottom: "24px",
                }}
              >
                <p>{selectedArticle.content}</p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  fontSize: "11px",
                  color: "#64748b",
                  lineHeight: "1.5",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  marginBottom: "20px",
                }}
              >
                <ShieldCheck
                  size={15}
                  color="#64748b"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <span>
                  This article is provided for educational and learning purposes only and does not constitute personalized financial or investment advice.
                </span>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button
                  onClick={() => setSelectedArticle(null)}
                  className="outline-btn"
                  style={{ padding: "8px 20px", fontSize: "13px", cursor: "pointer" }}
                >
                  Close Article
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Education;