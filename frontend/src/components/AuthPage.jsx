import { useState } from "react";
import { loginUser, signupUser } from "../api";

export default function AuthPage({ onLogin }) {
  const [mode, setMode]         = useState("login"); // "login" | "signup"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);
  const [loading, setLoading]   = useState(false);

  const handle = async () => {
    setError(null); setSuccess(null);
    if (!username || !password) { setError("Both fields are required."); return; }
    setLoading(true);
    try {
      if (mode === "login") {
        await loginUser(username, password);
        onLogin(username, password);
      } else {
        await signupUser(username, password);
        setSuccess("Account created! You can now log in.");
        setMode("login");
        setPassword("");
      }
    } catch (e) {
      setError(e.response?.data?.detail || "Something went wrong.");
    }
    setLoading(false);
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <div className="logo" style={{ marginBottom: "1.5rem" }}>
          <span className="logo-icon">◈</span>
          <span className="logo-text">DemandIQ</span>
        </div>
        <p className="auth-tagline">Smart Demand Forecasting & Inventory System</p>

        <div className="auth-toggle">
          <button
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => { setMode("login"); setError(null); setSuccess(null); }}
          >Login</button>
          <button
            className={mode === "signup" ? "auth-tab active" : "auth-tab"}
            onClick={() => { setMode("signup"); setError(null); setSuccess(null); }}
          >Sign Up</button>
        </div>

        <div className="field" style={{ marginBottom: "1rem" }}>
          <label>Username</label>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="Enter username"
            onKeyDown={e => e.key === "Enter" && handle()}
          />
        </div>
        <div className="field" style={{ marginBottom: "1.5rem" }}>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            onKeyDown={e => e.key === "Enter" && handle()}
          />
        </div>

        {error   && <p className="msg-error">{error}</p>}
        {success && <p className="msg-success">{success}</p>}

        <button className="btn-primary" style={{ width: "100%" }} onClick={handle} disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <p className="auth-hint">Demo login: admin / password123</p>
      </div>
    </div>
  );
}