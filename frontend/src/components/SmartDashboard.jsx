import { useState, useEffect } from "react";
import { getProducts, getDashboard } from "../api";

const ALERT_STYLE = {
  danger:  { background: "#ffebee", color: "#c62828", border: "1px solid #ef9a9a" },
  warning: { background: "#fff8e1", color: "#e65100", border: "1px solid #ffe082" },
  success: { background: "#e8f5e9", color: "#2e7d32", border: "1px solid #a5d6a7" },
};

const ALERT_ICON = { danger: "⚠", warning: "●", success: "✓" };

export default function SmartDashboard() {
  const [products, setProducts]   = useState([]);
  const [selected, setSelected]   = useState("");
  const [data, setData]           = useState(null);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  useEffect(() => {
    getProducts().then(res => {
      setProducts(res.data);
      if (res.data.length > 0) setSelected(res.data[0].name);
    }).catch(() => {});
  }, []);

  const fetchDashboard = async (name) => {
    if (!name) return;
    setLoading(true); setError(null); setData(null);
    try {
      const res = await getDashboard(name);
      setData(res.data);
    } catch { setError("Could not load dashboard. Is the backend running?"); }
    setLoading(false);
  };

  const handleSelect = (name) => { setSelected(name); fetchDashboard(name); };

  return (
    <div>
      {/* Product selector */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <h2 className="card-title">Smart Dashboard</h2>
        <p className="card-subtitle">Select a product to see AI-generated insights</p>

        {products.length === 0 ? (
          <p style={{ color: "#999", fontSize: "14px" }}>
            No products found. Add products first, then log daily sales.
          </p>
        ) : (
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "1rem" }}>
            {products.map(p => (
              <button
                key={p.name}
                onClick={() => handleSelect(p.name)}
                className={selected === p.name ? "product-chip active" : "product-chip"}
              >
                {p.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && <div className="card"><p style={{ color: "#999", fontSize: "14px" }}>Loading insights...</p></div>}
      {error   && <div className="card"><p className="msg-error">{error}</p></div>}

      {data && data.message && (
        <div className="card">
          <p style={{ color: "#888", fontSize: "14px" }}>{data.message}</p>
          <p style={{ color: "#888", fontSize: "13px", marginTop: "8px" }}>
            Entries logged so far: {data.total_entries}
          </p>
        </div>
      )}

      {data && data.alert && (
        <>
          {/* Alert */}
          <div style={{ ...ALERT_STYLE[data.alert_level], borderRadius: "10px",
            padding: "1rem 1.25rem", marginBottom: "1rem" }}>
            <p style={{ fontWeight: 600, margin: 0, fontSize: "15px" }}>
              {ALERT_ICON[data.alert_level]} {data.alert}
            </p>
          </div>

          {/* Trend */}
          <div style={{ background: "#e3f2fd", border: "1px solid #90caf9",
            borderRadius: "10px", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
            <p style={{ fontSize: "13px", color: "#1565c0", margin: "0 0 4px" }}>Demand Trend</p>
            <p style={{ fontWeight: 600, color: "#0d47a1", fontSize: "15px", margin: 0 }}>
              {data.trend}
            </p>
          </div>

          {/* ML Prediction badge */}
          {data.predicted_demand && (
            <div style={{ background: "#f3e5f5", border: "1px solid #ce93d8",
              borderRadius: "10px", padding: "1rem 1.25rem", marginBottom: "1rem" }}>
              <p style={{ fontSize: "13px", color: "#6a1b9a", margin: "0 0 4px" }}>
                AI Predicted Demand (XGBoost)
              </p>
              <p style={{ fontWeight: 700, color: "#4a148c", fontSize: "22px", margin: 0 }}>
                {data.predicted_demand} units
              </p>
            </div>
          )}

          {/* Key metrics */}
          <div className="metrics-grid" style={{ marginBottom: "1rem" }}>
            <div className="metric">
              <span className="metric-label">Avg Daily Demand</span>
              <span className="metric-value">{data.avg_daily_demand}</span>
              <span className="metric-unit">units/day</span>
            </div>
            <div className="metric">
              <span className="metric-label">Stock Remaining</span>
              <span className="metric-value">{data.days_of_supply}</span>
              <span className="metric-unit">days</span>
            </div>
            <div className="metric">
              <span className="metric-label">Profit / Unit</span>
              <span className="metric-value">₹{data.profit_margin}</span>
              <span className="metric-unit">margin</span>
            </div>
            <div className="metric">
              <span className="metric-label">Est. Monthly Profit</span>
              <span className="metric-value">₹{data.estimated_monthly_profit?.toLocaleString()}</span>
              <span className="metric-unit">projected</span>
            </div>
          </div>

          {/* Inventory recommendations */}
          {data.inventory && (
            <div className="card" style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>
                Inventory Recommendations
              </h3>
              <div className="metrics-grid">
                <div className="metric">
                  <span className="metric-label">Safety Stock</span>
                  <span className="metric-value">{data.inventory.safety_stock}</span>
                  <span className="metric-unit">units (buffer)</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Reorder When Stock Hits</span>
                  <span className="metric-value">{data.inventory.reorder_point}</span>
                  <span className="metric-unit">units</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Order This Qty</span>
                  <span className="metric-value">{data.inventory.order_quantity}</span>
                  <span className="metric-unit">units (EOQ)</span>
                </div>
              </div>
            </div>
          )}

          {/* 7-day sales chart */}
          {data.chart_data && data.chart_data.length > 0 && (
            <div className="card">
              <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "1rem" }}>
                Last {data.chart_data.length} Days — Sales Volume
              </h3>
              <MiniChart data={data.chart_data} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Inline mini bar chart — no external library needed
function MiniChart({ data }) {
  const max = Math.max(...data.map(d => d.quantity_sold));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "100px" }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
          <span style={{ fontSize: "10px", color: "#888" }}>{d.quantity_sold}</span>
          <div style={{
            width: "100%",
            height: `${Math.round((d.quantity_sold / max) * 70)}px`,
            background: "#1565c0",
            borderRadius: "4px 4px 0 0",
            minHeight: "4px"
          }} />
          <span style={{ fontSize: "9px", color: "#aaa" }}>
            {d.date?.slice(5)} {/* show MM-DD only */}
          </span>
        </div>
      ))}
    </div>
  );
}