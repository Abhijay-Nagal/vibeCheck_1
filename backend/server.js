const express = require("express");
const cors = require("cors");
const auditRoute = require("./routes/audit");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/audit", auditRoute); // 👈 ADD HERE

app.get("/test", (req, res) => {
  res.send("Backend is working");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});