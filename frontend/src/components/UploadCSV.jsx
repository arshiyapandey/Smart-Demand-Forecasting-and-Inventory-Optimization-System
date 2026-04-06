import { useState } from "react";
import { uploadCSV } from "../api";

export default function UploadCSV() {
  const [file, setFile]     = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);

  const handleFile  = e => { setFile(e.target.files[0]); setResult(null); setError(null); };

  const handleUpload = async () => {
    if (!file) { setError("Please select a CSV file first."); return; }
    setLoading(true); setError(null);
    try {
      const res = await uploadCSV(file);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.detail || "Upload failed.");
    }
    setLoading(false);
  };

  const downloadSample = () => {
    const csv = [
      "product_name,quantity_sold,stock_level,date",
      "Amul Butter 500g,120,800,2024-01-15",
      "Amul Butter 500g,135,680,2024-01-16",
      "Milk 1L,200,1200,2024-01-15",
      "Milk 1L,185,1015,2024-01-16",
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = "sample_sales_data.csv"; a.click();
  };

  return (
    <div className="card">
      <h2 className="card-title">Upload Sales Data (CSV)</h2>
      <p className="card-subtitle">Bulk import historical data — useful to kickstart predictions</p>

      {/* Format guide */}
      <div className="format-box">
        <p style={{ fontSize: "13px", fontWeight: 600, marginBottom: "8px" }}>Required columns:</p>
        <code>product_name, quantity_sold, stock_level, date</code>
        <p style={{ fontSize: "12px", color: "#888", margin: "6px 0 0" }}>
          Date format: YYYY-MM-DD &nbsp;·&nbsp; Price is taken from your product settings
        </p>
        <button className="btn-outline" style={{ marginTop: "10px" }} onClick={downloadSample}>
          Download Sample CSV
        </button>
      </div>

      {/* Upload zone */}
      <div className="upload-area" style={{ margin: "1.5rem 0 1rem" }}>
        <input type="file" accept=".csv" onChange={handleFile} id="csv-input" />
        <label htmlFor="csv-input" className="upload-label">
          {file ? `Selected: ${file.name}` : "Click to select a CSV file"}
        </label>
      </div>

      <button className="btn-primary" onClick={handleUpload} disabled={loading || !file}>
        {loading ? "Uploading..." : "Upload & Import"}
      </button>

      {error && <p className="msg-error" style={{ marginTop: "1rem" }}>{error}</p>}

      {result && (
        <div style={{ marginTop: "1.5rem" }}>
          {result.status === "success" ? (
            <div className="msg-success-box">
              <p style={{ fontWeight: 600, marginBottom: "4px" }}>Import successful!</p>
              <p>Rows imported: <strong>{result.rows_imported}</strong></p>
              <p>Total entries in system: <strong>{result.total_entries}</strong></p>
            </div>
          ) : (
            <div>
              <p className="msg-error">{result.message}</p>
              <p style={{ fontSize: "13px", color: "#666", marginTop: "6px" }}>
                Required: {result.required_format?.join(", ")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}