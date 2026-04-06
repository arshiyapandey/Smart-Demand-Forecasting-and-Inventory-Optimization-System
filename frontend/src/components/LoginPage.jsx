import { useState } from "react";
import axios from "axios";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/login",
        {},
        { auth: { username, password } }
      );
      onLogin(res.data.username);
    } catch {
      setError("Invalid username or password.");
    }
    setLoading(false);
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="logo" style={{ marginBottom: "1.5rem" }}>
          <span className="logo-icon">◈</span>
          <span className="logo-text">DemandIQ</span>
        </div>
        <h2 className="card-title">Sign in</h2>
        <p className="card-subtitle">Enter your credentials to continue</p>
        <div className="field" style={{ marginBottom: "1rem" }}>
          <label>Username</label>
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="admin" />
        </div>
        <div className="field" style={{ marginBottom: "1.5rem" }}>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="error" style={{ marginBottom: "1rem" }}>{error}</p>}
        <button className="btn-primary" style={{ width: "100%" }} onClick={handleLogin} disabled={loading}>
          {loading ? "Signing in..." : "Sign In"}
        </button>
        <p style={{ fontSize: "12px", color: "#999", marginTop: "1rem", textAlign: "center" }}>
          Demo: admin / password123
        </p>
      </div>
    </div>
  );
}