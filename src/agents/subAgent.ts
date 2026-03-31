import { v4 as uuidv4 } from "uuid";
import { runAgent, AgentType } from "../services/claude";
import { scoreOutput, ScoreResult } from "./scorer";
import { generateWallet, sendPayment, AgentWallet } from "../payments/wallet";
import { createMPPSession, recordPayment, closeSession } from "../payments/mpp";

export interface SubAgent {
  id: string;
  type: AgentType;
  wallet: AgentWallet;
  status: "idle" | "working" | "done" | "replaced";
  task?: string;
  output?: string;
  score?: ScoreResult;
  txHash?: string;
  costXLM: number;
  sessionId: string;
}

export async function spawnSubAgent(
  type: AgentType,
  budgetPerAgent: number
): Promise<SubAgent> {
  const wallet = await generateWallet();
  const session = createMPPSession(`agent_${type}_${Date.now()}`, budgetPerAgent);
  return {
    id: uuidv4(),
    type,
    wallet,
    status: "idle",
    costXLM: 0,
    sessionId: session.sessionId,
  };
}

export async function runSubAgent(
  agent: SubAgent,
  task: string,
  managerSecret: string
): Promise<SubAgent> {
  agent.status = "working";
  agent.task = task;

  const paymentAmount = process.env.PAYMENT_AMOUNT_USDC || "0.01";
  recordPayment(agent.sessionId, parseFloat(paymentAmount));

  const result = await runAgent(agent.type, task);
  agent.output = result.output;

  const score = await scoreOutput(task, result.output);
  agent.score = score;

  if (score.pass) {
    const txHash = await sendPayment(
      managerSecret,
      agent.wallet.publicKey,
      paymentAmount
    );
    agent.txHash = txHash;
    agent.costXLM += parseFloat(paymentAmount);
    agent.status = "done";
  } else {
    agent.status = "replaced";
  }

  closeSession(agent.sessionId);
  return agent;
}