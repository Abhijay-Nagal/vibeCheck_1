const express = require("express");
const router = express.Router();
const auditQueue = require("../src/queue/auditQueue"); 
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// POST: Submit code for auditing (Adds to Queue)
router.post("/", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const job = await auditQueue.add('runAudit', { code });

  res.status(202).json({ 
    message: "Audit queued successfully", 
    jobId: job.id 
  });
});

// GET: Fetch all past audits (History)
router.get("/history/all", async (req, res) => {
  try {
    const audits = await prisma.audit.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10 
    });
    
    const formattedAudits = audits.map(audit => ({
      ...audit,
      issues: JSON.parse(audit.issues),
      fixes: JSON.parse(audit.fixes)
    }));

    res.json(formattedAudits);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// GET: Check the status of a specific audit
router.get("/:id", async (req, res) => {
  const job = await auditQueue.getJob(req.params.id);

  if (!job) {
    return res.status(404).json({ error: "Job not found" });
  }

  const state = await job.getState();

  if (state === 'completed') {
    return res.json({ status: state, result: job.returnvalue });
  } else if (state === 'failed') {
    return res.json({ status: state, error: job.failedReason });
  }

  res.json({ status: state });
});

module.exports = router;