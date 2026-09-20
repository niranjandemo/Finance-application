import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { brokerApi } from "../services/api";
import {
  ExternalLink,
  ShieldCheck,
  Building2,
  RefreshCw,
  Info,
  X,
  Layers,
} from "lucide-react";

function Brokers() {
  const [brokers, setBrokers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBroker, setSelectedBroker] = useState(null);

  const fetchBrokers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await brokerApi.getBrokers();
      setBrokers(data.brokers || []);
    } catch (err) {
      console.error("Failed to load brokers:", err);
      setError(err?.data?.message || err?.message || "Failed to load brokers directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokers();
  }, []);

  // Keyboard accessibility: Close modal on Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && selectedBroker) {
        setSelectedBroker(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBroker]);

  const formatMinInvestment = (product) => {
    if (product.minimumInvestment !== null && product.minimumInvestment !== undefined) {
      const isDollar = product.minimumUnit?.includes("$");
      const prefix = isDollar ? "$" : "₹";
      const amount = Number(product.minimumInvestment).toLocaleString("en-IN");
      const unitClean = product.minimumUnit?.replace(/[₹$]/g, "").trim();
      return unitClean ? `${prefix}${amount} ${unitClean}` : `${prefix}${amount}`;
    }
    return product.minimumUnit || "Scheme dependent";
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-IN", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return String(dateStr);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="page-label">BROKERS</span>
              <h1>Loading Broker Directory...</h1>
              <p>Fetching available investment and brokerage platforms...</p>
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
            <span>Loading platforms...</span>
          </div>
        </main>
      </div>
    );
  }

  if (error && brokers.length === 0) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-header">
            <div>
              <span className="page-label">BROKERS</span>
              <h1>Unable to load brokers</h1>
              <p style={{ color: "#ef4444" }}>{error}</p>
            </div>
            <button onClick={fetchBrokers} className="primary-btn">
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
            <span className="page-label">BROKERS</span>

            <h1>Broker Directory</h1>

            <p>
              Explore verified brokerage and investment platforms with product-level minimum investments.
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
                Informational Platform Directory (Non-Execution)
              </span>
              <span
                style={{
                  background: "#ecfdf5",
                  border: "1px solid #a7f3d0",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  color: "#065f46",
                  fontWeight: 500,
                }}
              >
                Verified Product Minimums
              </span>
            </div>
          </div>
        </div>

        {brokers.length === 0 ? (
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
            <Building2 size={40} color="#9ca3af" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "16px", color: "#111827", marginBottom: "6px" }}>
              No Broker Platforms Available
            </h3>
            <p style={{ fontSize: "13px" }}>
              The broker directory is currently empty. Please check back later.
            </p>
          </div>
        ) : (
          <div className="broker-table">
            <div
              className="broker-header"
              style={{
                display: "grid",
                gridTemplateColumns: "1.7fr 1.1fr 1.5fr 1.3fr 0.9fr 1fr",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>Broker / Platform</span>
              <span>Platform Type</span>
              <span>Supported Products</span>
              <span>Min. Investment</span>
              <span>Details</span>
              <span>Website</span>
            </div>

            {brokers.map((broker) => (
              <div
                className="broker-row"
                key={broker.id || broker.name}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.7fr 1.1fr 1.5fr 1.3fr 0.9fr 1fr",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <div>
                  <strong style={{ color: "#111827", fontSize: "14px" }}>
                    {broker.name}
                  </strong>
                  {broker.description && (
                    <p
                      style={{
                        fontSize: "12px",
                        color: "#64748b",
                        margin: "2px 0 0 0",
                        lineHeight: "1.4",
                      }}
                    >
                      {broker.description}
                    </p>
                  )}
                </div>

                <span style={{ color: "#374151" }}>
                  {broker.platformType || "Brokerage"}
                </span>

                <span style={{ color: "#4b5563", fontSize: "12px" }}>
                  {broker.supportedInvestments || "Equities, Mutual Funds"}
                </span>

                <div>
                  <span
                    style={{
                      color: "#0f172a",
                      fontWeight: 600,
                      fontSize: "13px",
                      display: "block",
                    }}
                  >
                    {broker.minInvestmentSummary || "Varies by product"}
                  </span>
                  <span style={{ color: "#64748b", fontSize: "11px", display: "block" }}>
                    Product-dependent
                  </span>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setSelectedBroker(broker)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      background: "#ffffff",
                      color: "#1f2937",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      transition: "all 0.15s ease-in-out",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f9fafb";
                      e.currentTarget.style.borderColor = "#9ca3af";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#ffffff";
                      e.currentTarget.style.borderColor = "#d1d5db";
                    }}
                  >
                    <Info size={13} color="#2563eb" />
                    View Details
                  </button>
                </div>

                <div>
                  {broker.website ? (
                    <a
                      href={broker.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        color: "#2563eb",
                        fontSize: "12px",
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Visit Platform
                      <ExternalLink size={12} />
                    </a>
                  ) : (
                    <span style={{ color: "#9ca3af", fontSize: "12px" }}>N/A</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="responsible-note" style={{ marginTop: "24px" }}>
          <ShieldCheck size={20} />
          <p>
            This directory provides informational platform options for educational purposes only. InvestAI is not a broker, does not execute transactions, and does not provide financial or brokerage advice. Product minimums are verified from official sources and may vary by specific asset or AMC scheme.
          </p>
        </div>

        {/* Broker Details Modal */}
        {selectedBroker && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(15, 23, 42, 0.55)",
              backdropFilter: "blur(4px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
              zIndex: 1000,
            }}
            onClick={() => setSelectedBroker(null)}
          >
            <div
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #e2e8f0",
                borderRadius: "14px",
                maxWidth: "760px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                padding: "28px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                position: "relative",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedBroker(null)}
                aria-label="Close details"
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  color: "#64748b",
                  padding: "4px",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={20} />
              </button>

              {/* Modal Header */}
              <div style={{ paddingRight: "36px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "6px" }}>
                  <span
                    style={{
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      color: "#6b7280",
                      textTransform: "uppercase",
                    }}
                  >
                    PLATFORM DIRECTORY
                  </span>
                  <span
                    style={{
                      background: "#eff6ff",
                      color: "#1d4ed8",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      border: "1px solid #bfdbfe",
                    }}
                  >
                    {selectedBroker.platformType || "Brokerage"}
                  </span>
                  <span
                    style={{
                      background: "#ecfdf5",
                      color: "#047857",
                      fontSize: "11px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "12px",
                      border: "1px solid #a7f3d0",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <ShieldCheck size={12} />
                    Verified Official Data
                  </span>
                </div>

                <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px 0", color: "#0f172a" }}>
                  {selectedBroker.name}
                </h2>

                <p style={{ color: "#475569", fontSize: "13px", lineHeight: "1.5", margin: "0 0 16px 0" }}>
                  {selectedBroker.description}
                </p>

                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    marginBottom: "20px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    color: "#334155",
                  }}
                >
                  <Layers size={16} color="#64748b" />
                  <span>
                    <strong>Supported Asset Classes:</strong> {selectedBroker.supportedInvestments || "Equities, Mutual Funds"}
                  </span>
                </div>
              </div>

              {/* Products Breakdown Table */}
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: 0, color: "#1e293b" }}>
                    Minimum Investment by Product
                  </h3>
                  <span style={{ fontSize: "11px", color: "#64748b" }}>
                    Verified from official sources
                  </span>
                </div>

                {(!selectedBroker.products || selectedBroker.products.length === 0) ? (
                  <p style={{ fontSize: "13px", color: "#64748b" }}>
                    No detailed product records available for this broker.
                  </p>
                ) : (
                  <div
                    style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: "8px",
                      overflow: "hidden",
                    }}
                  >
                    {/* Header */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1.6fr 1.3fr 2.2fr 1fr",
                        backgroundColor: "#f1f5f9",
                        padding: "10px 14px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#475569",
                        textTransform: "uppercase",
                        letterSpacing: "0.03em",
                      }}
                    >
                      <span>Product</span>
                      <span>Min. Investment</span>
                      <span>Notes & Structure</span>
                      <span>Source</span>
                    </div>

                    {/* Product Rows */}
                    {selectedBroker.products.map((prod, idx) => (
                      <div
                        key={prod.id || `${selectedBroker.id}-${idx}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.6fr 1.3fr 2.2fr 1fr",
                          padding: "12px 14px",
                          borderTop: idx > 0 ? "1px solid #f1f5f9" : "none",
                          backgroundColor: idx % 2 === 0 ? "#ffffff" : "#fbfcfe",
                          alignItems: "center",
                          fontSize: "12px",
                        }}
                      >
                        {/* Product Type */}
                        <div>
                          <strong style={{ color: "#0f172a", fontSize: "13px" }}>
                            {prod.productType}
                          </strong>
                        </div>

                        {/* Minimum Investment */}
                        <div>
                          <span
                            style={{
                              display: "inline-block",
                              background: prod.minimumInvestment !== null ? "#ecfdf5" : "#f3f4f6",
                              color: prod.minimumInvestment !== null ? "#065f46" : "#374151",
                              border: prod.minimumInvestment !== null ? "1px solid #a7f3d0" : "1px solid #e5e7eb",
                              padding: "2px 8px",
                              borderRadius: "6px",
                              fontWeight: 700,
                              fontSize: "12px",
                            }}
                          >
                            {formatMinInvestment(prod)}
                          </span>
                        </div>

                        {/* Notes */}
                        <div style={{ color: "#475569", fontSize: "12px", lineHeight: "1.4", paddingRight: "8px" }}>
                          {prod.notes || "—"}
                        </div>

                        {/* Source & Verified Date */}
                        <div>
                          {prod.sourceUrl ? (
                            <a
                              href={prod.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                                color: "#2563eb",
                                fontSize: "11px",
                                fontWeight: 600,
                                textDecoration: "none",
                              }}
                            >
                              Official Source
                              <ExternalLink size={10} />
                            </a>
                          ) : (
                            <span style={{ color: "#9ca3af", fontSize: "11px" }}>Official</span>
                          )}
                          <span
                            style={{
                              display: "block",
                              color: "#94a3b8",
                              fontSize: "10px",
                              marginTop: "2px",
                            }}
                          >
                            {formatDate(prod.lastUpdated)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Informational Disclaimer */}
              <p
                style={{
                  fontSize: "11px",
                  color: "#94a3b8",
                  lineHeight: "1.5",
                  margin: "0 0 20px 0",
                  fontStyle: "italic",
                }}
              >
                * Informational directory only. InvestAI does not execute transactions, receive commissions, or provide financial advice. Minimum investments are determined by platform policies and underlying fund AMCs.
              </p>

              {/* Actions Footer */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "16px",
                }}
              >
                {selectedBroker.website ? (
                  <a
                    href={selectedBroker.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "#2563eb",
                      fontSize: "13px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    Visit {selectedBroker.name} Website
                    <ExternalLink size={14} />
                  </a>
                ) : <div />}

                <button
                  type="button"
                  className="primary-btn"
                  onClick={() => setSelectedBroker(null)}
                  style={{ padding: "8px 22px" }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Brokers;