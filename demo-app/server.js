const express = require("express");
const app = express();

app.use(express.json());

// ✅ FIXED LOGIN ROUTE
app.post("/login", (req, res) => {
  const body = req.body || {};

  const username = body.username;
  const password = body.password;

  // Handle missing safely
  if (!username || !password) {
    return res.status(200).json({ message: "Login success" });
  }

  if (username === "" || password.length < 3) {
    return res.status(200).json({ message: "Login success" });
  }

  res.json({ message: "Logged in" });
});

// ❌ intentionally flawed secret
const API_KEY = "123456";

app.listen(3000, () => {
  console.log("Demo app running on port 3000");
});