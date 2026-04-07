import React, { useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";

const API_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

function App() {
  const [code, setCode] = useState("// Paste your Express.js code here...\n");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("Ready to audit.");
  const [loading, setLoading] = useState(false);

  const pollJobStatus = async (jobId) => {
    try {
      const res = await axios.get(`${API_URL}/audit/${jobId}`);
      const jobStatus = res.data.status;

      if (jobStatus === "completed") {
        setResult(res.data.result);
        setStatus("Audit Complete!");
        setLoading(false);
      } else if (jobStatus === "failed") {
        setStatus(`Audit Failed: ${res.data.error}`);
        setLoading(false);
      } else {
        setStatus(`Status: ${jobStatus}... running simulations...`);
        setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (err) {
      console.error(err);
      setStatus("Error checking job status.");
      setLoading(false);
    }
  };

  const handleAudit = async () => {
    setLoading(true);
    setResult(null);
    setStatus("Submitting to queue...");

    try {
      const res = await axios.post(`${API_URL}/audit`, { code });
      pollJobStatus(res.data.jobId);
    } catch (err) {
      console.error(err);
      setStatus("Failed to submit audit.");
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif" }}>
      
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "2px solid #333" }}>
        <div style={{ padding: "20px", backgroundColor: "#1e1e1e", color: "white" }}>
          <h1 style={{ margin: 0, fontSize: "24px" }}>VibeCheck.ai</h1>
          <p style={{ color: "#aaa", margin: "5px 0 0 0" }}>Behavioral Code Auditing</p>
        </div>
        
        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on" }}
          />
        </div>

        <div style={{ padding: "15px", backgroundColor: "#1e1e1e" }}>
          <button 
            onClick={handleAudit} 
            disabled={loading}
            style={{
              width: "100%", padding: "15px", fontSize: "16px", fontWeight: "bold",
              backgroundColor: loading ? "#555" : "#007acc", color: "white",
              border: "none", borderRadius: "5px", cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Running Audit..." : "Run Security Audit"}
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: "40px", backgroundColor: "#f9f9f9", overflowY: "auto" }}>
        <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#fff", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <h3 style={{ margin: 0, color: "#333" }}>System Status</h3>
          <p style={{ margin: "5px 0 0 0", color: loading ? "#007acc" : "#555" }}>{status}</p>
        </div>

        {result && (
          <div>
            <div style={{ textAlign: "center", padding: "30px", backgroundColor: "#fff", borderRadius: "8px", marginBottom: "20px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
              <h2 style={{ margin: 0, color: "#666" }}>Vibe Score</h2>
              <h1 style={{ fontSize: "64px", margin: "10px 0", color: result.score > 70 ? "#28a745" : (result.score > 40 ? "#ffc107" : "#dc3545") }}>
                {result.score}/100
              </h1>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h2 style={{ borderBottom: "2px solid #dc3545", paddingBottom: "5px" }}>Detected Vulnerabilities</h2>
              {result.issues.length === 0 ? (
                <p>No vulnerabilities detected!</p>
              ) : (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {result.issues.map((issue, i) => (
                    <li key={i} style={{ padding: "12px", backgroundColor: "#fff3f3", borderLeft: "4px solid #dc3545", marginBottom: "10px", borderRadius: "4px" }}>
                      ⚠️ {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 style={{ borderBottom: "2px solid #28a745", paddingBottom: "5px" }}>AI Resolution Strategies</h2>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {result.fixes.map((fix, i) => (
                  <li key={i} style={{ padding: "12px", backgroundColor: "#f0fdf4", borderLeft: "4px solid #28a745", marginBottom: "10px", borderRadius: "4px", fontFamily: "monospace", fontSize: "14px" }}>
                    💡 {fix}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;