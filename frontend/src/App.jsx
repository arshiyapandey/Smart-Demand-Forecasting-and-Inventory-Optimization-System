import { useState, useEffect } from "react";
import AuthPage from "./components/AuthPage";
import ProductManager from "./components/ProductManager";
import DailyEntry from "./components/DailyEntry";
import SmartDashboard from "./components/SmartDashboard";
import UploadCSV from "./components/UploadCSV";
import "./App.css";

// Tab order: Products → Daily Entry → Dashboard → Upload CSV
const TABS = ["Products", "Daily Entry", "Dashboard", "Upload CSV"];

export default function App() {
  const [user, setUser]           = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("diq_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (username, password) => {
    const userData = { username, password };
    localStorage.setItem("diq_user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("diq_user");
    setUser(null);
    setActiveTab(0);
  };

  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="app">
      <header className="header">
        {/* Logo on the LEFT */}
        <div className="logo">
          <span className="logo-icon">◈</span>
          <span className="logo-text">DemandIQ</span>
        </div>

        {/* User info + logout on the RIGHT */}
        <div className="header-right">
          <span className="header-user">👤 {user.username}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      {/* Tab order: Products → Daily Entry → Dashboard → Upload CSV */}
      <nav className="tabs">
        {TABS.map((tab, i) => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === i ? "active" : ""}`}
            onClick={() => setActiveTab(i)}
          >
            {tab}
          </button>
        ))}
      </nav>

      <main className="main">
        {activeTab === 0 && <ProductManager />}
        {activeTab === 1 && <DailyEntry onGoToDashboard={() => setActiveTab(2)} />}
        {activeTab === 2 && <SmartDashboard />}
        {activeTab === 3 && <UploadCSV />}
      </main>
    </div>
  );
}