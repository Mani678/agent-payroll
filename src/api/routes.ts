import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { runJob, getJob, getAllJobs } from "../agents/manager";
import { startScheduler, getObjectives } from "../agents/scheduler";
import { getLogs, isPaused, setPaused } from "../api/logger";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { error: "too many requests, slow down" }
}));

app.post("/api/job", async (req, res) => {
  const { goal, budget } = req.body;
  if (!goal || !budget) {
    return res.status(400).json({ error: "goal and budget are required" });
  }
  try {
    const job = await runJob(goal, parseFloat(budget));
    res.json(job);
  } catch (err: any) {
    console.error("JOB ERROR:", err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

app.get("/api/job/:id", (req, res) => {
  const job = getJob(req.params.id);
  if (!job) return res.status(404).json({ error: "job not found" });
  res.json(job);
});

app.get("/api/jobs", (_req, res) => {
  res.json(getAllJobs());
});

app.get("/api/logs", (_req, res) => {
  res.json(getLogs());
});

app.post("/api/pause", (req, res) => {
  const { paused } = req.body;
  setPaused(paused);
  res.json({ paused: isPaused() });
});

app.get("/api/status", (_req, res) => {
  res.json({ paused: isPaused() });
});

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/api/objectives", (_req, res) => {
  res.json(getObjectives());
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Agent Payroll API running on port ${PORT}`);
  startScheduler();
});