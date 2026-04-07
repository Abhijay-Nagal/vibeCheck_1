const express = require("express");
const cors = require("cors");
const auditRoute = require("./routes/audit");

// FIXED PATH: removed /src/
require("./workers/auditWorker"); 

const app = express();

app.use(cors());
app.use(express.json());

app.use("/audit", auditRoute);

app.get("/test", (req, res) => {
  res.send("Backend API is working!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});