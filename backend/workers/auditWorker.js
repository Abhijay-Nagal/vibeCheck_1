const { Worker } = require('bullmq');
const { PrismaClient } = require('@prisma/client');

const staticScan = require("../services/staticScan");
const discoverRoutes = require("../services/discovery");
const simulate = require("../services/simulator");
const getFixes = require("../services/ai");

const prisma = new PrismaClient();

const worker = new Worker('auditQueue', async (job) => {
  console.log(`[Worker] Starting job ${job.id}...`);
  const { code } = job.data;

  try {
    console.log(`[Worker ${job.id}] Running static scan...`);
    const staticIssues = staticScan(code);
    
    console.log(`[Worker ${job.id}] Discovering API routes...`);
    const routes = discoverRoutes(code);
    
    console.log(`[Worker ${job.id}] Running behavioral simulations...`);
    const simulationIssues = await simulate(routes);

    const allIssues = [...staticIssues, ...simulationIssues];

    console.log(`[Worker ${job.id}] Generating AI fixes...`);
    const fixes = await getFixes(code, staticIssues, simulationIssues);

    const totalIssues = allIssues.length;
    const score = Math.max(100 - totalIssues * 10, 0);

    console.log(`[Worker ${job.id}] Saving to database...`);
    await prisma.audit.create({
      data: {
        jobId: job.id,
        code: code,
        score: score,
        issues: JSON.stringify(allIssues),
        fixes: JSON.stringify(fixes)
      }
    });

    return { score, issues: allIssues, fixes };

  } catch (error) {
    console.error(`[Worker ${job.id}] Critical Failure:`, error);
    throw new Error("Audit failed during processing.");
  }
}, {
  connection: {
    host: process.env.REDIS_HOST || '127.0.0.1',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  }
});

worker.on('completed', job => console.log(`[Worker] Job ${job.id} completed!`));
worker.on('failed', (job, err) => console.error(`[Worker] Job ${job.id} failed: ${err.message}`));