const axios = require("axios");
require("dotenv").config();

const payloads = [
  { name: "Empty Payload", data: {} },
  { name: "Missing Fields", data: { username: "" } },
  { name: "SQL Injection Attempt", data: { id: "1 OR 1=1" } },
  { name: "Large Payload", data: { text: "A".repeat(1000) } }
];

async function simulate(discoveredRoutes) {
  const issues = [];
  const TARGET_URL = process.env.TARGET_URL || "http://localhost:3000";

  for (const route of discoveredRoutes) {
    if (['POST', 'PUT', 'PATCH'].includes(route.method)) {
      for (const payload of payloads) {
        try {
          const res = await axios({
            method: route.method,
            url: `${TARGET_URL}${route.path}`,
            data: payload.data,
            timeout: 2000 
          });

          if (res.status === 200) {
            issues.push(`Vulnerability: ${route.method} ${route.path} accepted ${payload.name} without validation.`);
          }
        } catch (err) {
          if (err.response && err.response.status === 500) {
            issues.push(`Critical: ${route.method} ${route.path} crashed (500) on ${payload.name}.`);
          }
        }
      }
    }
  }

  return issues;
}

module.exports = simulate;