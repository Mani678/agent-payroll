import { log } from "../api/logger";
import { v4 as uuidv4 } from "uuid";
import { AgentType } from "../services/claude";
import { spawnSubAgent, runSubAgent, SubAgent } from "./subAgent";
import { getManagerKeypair } from "../payments/wallet";
import dotenv from "dotenv";
dotenv.config();

export interface Job {
  id: string;
  goal: string;
  budget: number;
  status: "running" | "done" | "failed";
  agents: SubAgent[];
  results: Record<string, string>;
  totalSpent: number;
  startedAt: Date;
  completedAt?: Date;
}

const jobs = new Map<string, Job>();

export function getJob(jobId: string): Job | undefined {
  return jobs.get(jobId);
}

export function getAllJobs(): Job[] {
  return Array.from(jobs.values());
}

function parseGoalIntoTasks(goal: string): Record<AgentType, string> {
  return {
    research: `Research the following and return key findings: ${goal}`,
    writer: `Write a concise 3-paragraph analysis about: ${goal}`,
    analyst: `Analyze data and trends related to: ${goal}`,
    intel: `Monitor and report competitive intelligence about: ${goal}`,
  };
}

export async function runJob(goal: string, budgetXLM: number): Promise<Job> {
  const job: Job = {
    id: uuidv4(),
    goal,
    budget: budgetXLM,
    status: "running",
    agents: [],
    results: {},
    totalSpent: 0,
    startedAt: new Date(),
  };

  jobs.set(job.id, job);

  log(`job started: ${job.id.slice(0, 8)} — "${goal.slice(0, 50)}..."`, "info");

  const managerKeypair = await getManagerKeypair();
  const managerSecret = managerKeypair.secret();
  const budgetPerAgent = parseFloat((budgetXLM / 4).toFixed(4));
  const agentTypes: AgentType[] = ["research", "writer", "analyst", "intel"];
  const tasks = parseGoalIntoTasks(goal);
  const maxRetries = parseInt(process.env.MAX_RETRIES || "3");

  log(`budget: ${budgetXLM} XLM — ${budgetPerAgent} XLM per agent — spawning 4 agents`, "info");

  await Promise.all(
    agentTypes.map(async (type) => {
      let attempts = 0;
      let success = false;

      while (attempts < maxRetries && !success) {
        log(`spawning ${type} agent (attempt ${attempts + 1}/${maxRetries})`, "info");

        const agent = await spawnSubAgent(type, budgetPerAgent);
        job.agents.push(agent);

        log(`${type} agent wallet: ${agent.wallet.publicKey.slice(0, 8)}...`, "info");

        const result = await runSubAgent(agent, tasks[type], managerSecret);

        if (result.status === "done") {
          const score = Math.round((result.score?.score || 0) * 100);
          log(`${type} agent completed — score: ${score}% — paid ${result.costXLM} XLM — tx: ${result.txHash?.slice(0, 10)}...`, "success");
          job.results[type] = result.output!;
          job.totalSpent += result.costXLM;
          success = true;
        } else {
          const score = Math.round((result.score?.score || 0) * 100);
          log(`${type} agent scored too low (${score}%) — replacing with new agent`, "warn");
          attempts++;
        }
      }

      if (!success) {
        log(`${type} agent failed after ${maxRetries} retries — marking failed`, "error");
        job.results[type] = "Agent failed after max retries.";
      }
    })
  );

  job.status = "done";
  job.completedAt = new Date();
  jobs.set(job.id, job);

  log(`job completed: ${job.id.slice(0, 8)} — total spent: ${job.totalSpent.toFixed(4)} XLM — ${Object.keys(job.results).length}/4 tasks done`, "success");

  return job;
}