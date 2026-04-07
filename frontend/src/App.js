import React, { useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";

// FIXED: Changed BACKEND_URL to API_URL to match your Vercel settings
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

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
        setStatus(`Audit Failed: ${res.data.error || "Unknown error"}`);
        setLoading(false);
      } else {
        setStatus(`Status: ${jobStatus}... analyzing code vibes...`);
        setTimeout(() => pollJobStatus(jobId), 2000);
      }
    } catch (err) {
      console.error("Polling error:", err);
      setStatus("Error checking job status.");
      setLoading(false);
    }
  };

  const handleAudit = async () => {
    if (!code.trim()) {
      setStatus("Please enter some code first.");
      return;
    }

    setLoading(true);
    setResult(null);
    setStatus("Submitting to Railway queue...");

    try {
      // The POST request to your Railway Backend
      const res = await axios.post(`${API_URL}/audit`, { code });
      pollJobStatus(res.data.jobId);
    } catch (err) {
      console.error("Submission error:", err);
      // This will show if the frontend still can't find the backend
      setStatus(`Failed to submit: ${err.message}. Check if Backend is Online.`);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "system-ui, sans-serif", backgroundColor: "#121212", color: "#eee" }}>
      
      {/* LEFT SIDE: Editor */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", borderRight: "2px solid #333" }}>
        <div style={{ padding: "20px", backgroundColor: "#1e1e1e", borderBottom: "1px solid #333" }}>
          <h1 style={{ margin: 0, fontSize: "24px", color: "#007acc" }}>VibeCheck.ai</h1>
          <p style={{ color: "#aaa", margin: "5px 0 0 0" }}>Behavioral Code Auditing</p>
        </div>
        
        <div style={{ flex: 1 }}>
          <Editor
            height="100%"
            defaultLanguage="javascript"
            theme="vs-dark"
            value={code}
            onChange={(value) => setCode(value || "")}
            options={{ minimap: { enabled: false }, fontSize: 14, wordWrap: "on", padding: { top: 20 } }}
          />
        </div>

        <div style={{ padding: "20px", backgroundColor: "#1e1e1e" }}>
          <button 
            onClick={handleAudit} 
            disabled={loading}
            style={{
              width: "100%", padding: "15px", fontSize: "16px", fontWeight: "bold",
              backgroundColor: loading ? "#444" : "#007acc", color: "white",
              border: "none", borderRadius: "5px", cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.2s"
            }}
          >
            {loading ? "Running Audit..." : "Run Security Audit"}
          </button>
        </div>
      </div>

      {/* RIGHT SIDE: Results */}
      <div style={{ flex: 1, padding: "40px", backgroundColor: "#0f0f0f", overflowY: "auto" }}>
        <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#1e1e1e", borderRadius: "8px", border: "1px solid #333" }}>
          <h3 style={{ margin: 0, color: "#ccc" }}>System Status</h3>
          <p style={{ margin: "5px 0 0 0", color: loading ? "#007acc" : "#00ff88" }}>{status}</p>
        </div>

        {result && (
          <div className="fade-in">
            <div style={{ textAlign: "center", padding: "30px", backgroundColor: "#1e1e1e", borderRadius: "8px", marginBottom: "20px", border: "1px solid #333" }}>
              <h2 style={{ margin: 0, color: "#aaa" }}>Vibe Score</h2>
              <h1 style={{ fontSize: "64px", margin: "10px 0", color: result.score > 70 ? "#00ff88" : (result.score > 40 ? "#ffcc00" : "#ff4444") }}>
                {result.score}/100
              </h1>
            </div>

            <div style={{ marginBottom: "30px" }}>
              <h2 style={{ borderBottom: "2px solid #ff4444", paddingBottom: "10px", color: "#ff4444" }}>Detected Vulnerabilities</h2>
              {result.issues.length === 0 ? (
                <p>No vulnerabilities detected! Your code has good vibes.</p>
              ) : (
                <ul style={{ listStyleType: "none", padding: 0 }}>
                  {result.issues.map((issue, i) => (
                    <li key={i} style={{ padding: "12px", backgroundColor: "rgba(255, 68, 68, 0.1)", borderLeft: "4px solid #ff4444", marginBottom: "10px", borderRadius: "4px" }}>
                      ⚠️ {issue}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h2 style={{ borderBottom: "2px solid #00ff88", paddingBottom: "10px", color: "#00ff88" }}>AI Resolution Strategies</h2>
              <ul style={{ listStyleType: "none", padding: 0 }}>
                {result.fixes.map((fix, i) => (
                  <li key={i} style={{ padding: "12px", backgroundColor: "rgba(0, 255, 136, 0.05)", borderLeft: "4px solid #00ff88", marginBottom: "10px", borderRadius: "4px", fontFamily: "monospace", fontSize: "14px", lineHeight: "1.5" }}>
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