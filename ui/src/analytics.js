import React, { useState, useEffect } from "react";

export default function AnalyticsPage() {
  // State for analytics data
  const [analytics, setAnalytics] = useState({
    cpu: 0,
    ram: 0,
    total_ram: 0,
    used_ram: 0,
    disk: 0
  });

  const [loading, setLoading] = useState(true);

  // Fetch analytics from backend
  useEffect(() => {
    fetch("http://localhost:9000/analytics")
      .then(res => res.json())
      .then(data => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching analytics:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p style={{ textAlign: "center" }}>Loading analytics...</p>;

  // Helper function to get RAM percentage
  const ramPercent = analytics.total_ram
    ? ((analytics.used_ram / analytics.total_ram) * 100).toFixed(1)
    : 0;

  return (
    <div style={{ maxWidth: "800px", margin: "20px auto", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>System Analytics</h2>
      
      {/* CPU Card */}
      <div style={cardStyle}>
        <h3>CPU Usage</h3>
        <p>{analytics.cpu}%</p>
        <div style={progressContainer}>
          <div style={{ ...progressBar, width: `${analytics.cpu}%`, backgroundColor: "#4caf50" }}></div>
        </div>
      </div>

      {/* RAM Card */}
      <div style={cardStyle}>
        <h3>RAM Usage</h3>
        <p>{analytics.used_ram} / {analytics.total_ram} GB ({ramPercent}%)</p>
        <div style={progressContainer}>
          <div style={{ ...progressBar, width: `${ramPercent}%`, backgroundColor: "#2196f3" }}></div>
        </div>
      </div>

      {/* Disk Card */}
      <div style={cardStyle}>
        <h3>Disk Usage</h3>
        <p>{analytics.disk}%</p>
        <div style={progressContainer}>
          <div style={{ ...progressBar, width: `${analytics.disk}%`, backgroundColor: "#f44336" }}></div>
        </div>
      </div>
    </div>
  );
}

// Styles
const cardStyle = {
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "15px",
  boxShadow: "0 2px 5px rgba(0,0,0,0.1)"
};

const progressContainer = {
  height: "20px",
  background: "#eee",
  borderRadius: "10px",
  overflow: "hidden",
  marginTop: "10px"
};

const progressBar = {
  height: "100%",
  borderRadius: "10px",
  transition: "width 0.5s ease-in-out"
};