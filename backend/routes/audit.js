const express = require("express");
const router = express.Router();
// FIXED PATH: removed /src/
const auditQueue = require("../queue/auditQueue"); 
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// POST: Submit code
router.post("/", async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Code is required" });

  const job = await auditQueue.add('runAudit', { code });
  res.status(202).json({ message: "Audit queued", jobId: job.id });
});

// GET: History
router.get("/history/all", async (req, res) => {
  try {
    const audits = await prisma.audit.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10 
    });
    res.json(audits.map(a => ({ ...a, issues: JSON.parse(a.issues), fixes: JSON.parse(a.fixes) })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// GET: Status
router.get("/:id", async (req, res) => {
  const job = await auditQueue.getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "Job not found" });

  const state = await job.getState();
  if (state === 'completed') return res.json({ status: state, result: job.returnvalue });
  res.json({ status: state });
});

module.exports = router;