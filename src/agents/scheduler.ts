import { runJob } from "./manager";
import dotenv from "dotenv";
dotenv.config();

interface ScheduledObjective {
  id: string;
  goal: string;
  budget: number;
  intervalMs: number;
  lastRun?: Date;
}

const OBJECTIVES: ScheduledObjective[] = [
  {
    id: "crypto-market-intel",
    goal: "Research latest Bitcoin, Ethereum and Solana price movements, write a market summary, analyze volatility trends, and monitor what competitors like Coinbase and Binance are doing",
    budget: 0.5,
    intervalMs: 30 * 60 * 1000,
  },
  {
    id: "stellar-ecosystem-monitor",
    goal: "Research latest Stellar network activity and new projects building on Stellar, write a summary of ecosystem growth, analyze on-chain metrics, and monitor competitor L1 chains like Ethereum and Solana",
    budget: 0.5,
    intervalMs: 60 * 60 * 1000,
  },
  {
    id: "ai-agent-industry-watch",
    goal: "Research latest developments in autonomous AI agents and the agentic economy, write an analysis of which companies are winning, analyze agent payment infrastructure trends, and monitor competitor agent frameworks like LangChain and AutoGPT",
    budget: 0.5,
    intervalMs: 2 * 60 * 60 * 1000,
  },
];

const timers: NodeJS.Timeout[] = [];

async function runObjective(objective: ScheduledObjective) {
  console.log(`[scheduler] running objective: ${objective.id}`);
  try {
    const job = await runJob(objective.goal, objective.budget);
    objective.lastRun = new Date();
    console.log(`[scheduler] completed: ${objective.id} — ${Object.keys(job.results).length}/4 tasks done`);
  } catch (err: any) {
    console.error(`[scheduler] failed: ${objective.id} — ${err.message}`);
  }
}

export function startScheduler() {
  console.log(`[scheduler] starting — ${OBJECTIVES.length} objectives loaded`);

  runObjective(OBJECTIVES[0]);

  setTimeout(() => runObjective(OBJECTIVES[1]), 60 * 1000);
  setTimeout(() => runObjective(OBJECTIVES[2]), 2 * 60 * 1000);

  OBJECTIVES.forEach((objective) => {
    const timer = setInterval(() => runObjective(objective), objective.intervalMs);
    timers.push(timer);
  });

  console.log(`[scheduler] all objectives scheduled`);
}

export function stopScheduler() {
  timers.forEach((t) => clearInterval(t));
  console.log(`[scheduler] stopped`);
}

export function getObjectives(): ScheduledObjective[] {
  return OBJECTIVES;
}