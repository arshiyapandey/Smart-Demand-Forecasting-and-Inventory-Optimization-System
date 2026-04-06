import { useState, useEffect } from "react";
import { getProducts, logSale } from "../api";

export default function DailyEntry({ onGoToDashboard }) {
  const [products, setProducts]   = useState([]);
  const [selected, setSelected]   = useState("");
  const [form, setForm]           = useState({ quantity_sold: "", stock_level: "", stock_added: "" });
  const [status, setStatus]       = useState(null);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    getProducts().then(res => {
      setProducts(res.data);
      if (res.data.length > 0) setSelected(res.data[0].name);
    }).catch(() => {});
  }, []);

  const handleSubmit = async () => {
    setStatus(null);
    if (!selected)              { setStatus({ type: "error", msg: "Please select a product." }); return; }
    if (!form.quantity_sold)    { setStatus({ type: "error", msg: "Quantity sold is required." }); return; }
    if (!form.stock_level)      { setStatus({ type: "error", msg: "Current stock is required." }); return; }

    setLoading(true);
    try {
      const res = await logSale({
        product_name:  selected,
        quantity_sold: parseFloat(form.quantity_sold),
        stock_level:   parseFloat(form.stock_level),
        stock_added:   parseFloat(form.stock_added) || 0,
      });
      setStatus({
        type: "success",
        msg: `Logged! This product now has ${res.data.entries_for_product} days of data.`
      });
      setForm({ quantity_sold: "", stock_level: "", stock_added: "" });
    } catch (e) {
      setStatus({ type: "error", msg: e.response?.data?.detail || "Failed to log. Check backend." });
    }
    setLoading(false);
  };

  const selectedProduct = products.find(p => p.name === selected);

  return (
    <div className="card">
      <h2 className="card-title">Daily Sales Entry</h2>
      <p className="card-subtitle">Enter what happened today — predictions update automatically</p>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>No products found. Go to the <strong>Products</strong> tab and add your products first.</p>
        </div>
      ) : (
        <>
          {/* Product dropdown */}
          <div className="field" style={{ marginBottom: "1.5rem" }}>
            <label>Select Product</label>
            <select value={selected} onChange={e => setSelected(e.target.value)}>
              {products.map(p => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Selected product info strip */}
          {selectedProduct && (
            <div className="product-info-strip">
              <span>Price: <strong>₹{selectedProduct.price}</strong></span>
              <span>Cost: <strong>₹{selectedProduct.supplier_cost}</strong></span>
              <span>Margin: <strong>₹{(selectedProduct.price - selectedProduct.supplier_cost).toFixed(2)}</strong></span>
              <span>Unit: <strong>{selectedProduct.unit}</strong></span>
            </div>
          )}

          <div className="form-grid">
            <div className="field">
              <label>Quantity Sold Today</label>
              <input type="number" value={form.quantity_sold}
                onChange={e => setForm({ ...form, quantity_sold: e.target.value })}
                placeholder="e.g. 120" />
            </div>
            <div className="field">
              <label>Current Stock Level</label>
              <input type="number" value={form.stock_level}
                onChange={e => setForm({ ...form, stock_level: e.target.value })}
                placeholder="e.g. 800" />
            </div>
            <div className="field">
              <label>Stock Added Today (optional)</label>
              <input type="number" value={form.stock_added}
                onChange={e => setForm({ ...form, stock_added: e.target.value })}
                placeholder="e.g. 200 (new delivery)" />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading ? "Saving..." : "Log Today's Sales"}
            </button>
            {status?.type === "success" && (
              <button className="btn-secondary" onClick={onGoToDashboard}>
                View Dashboard →
              </button>
            )}
          </div>

          {status && (
            <p className={status.type === "success" ? "msg-success" : "msg-error"}
              style={{ marginTop: "1rem" }}>
              {status.msg}
            </p>
          )}
        </>
      )}
    </div>
  );
}