import dotenv from "dotenv";
dotenv.config();

export interface MPPSession {
  sessionId: string;
  budget: number;
  spent: number;
  agentId: string;
}

const sessions = new Map<string, MPPSession>();

export function createMPPSession(agentId: string, budget: number): MPPSession {
  const session: MPPSession = {
    sessionId: `mpp_${agentId}_${Date.now()}`,
    budget,
    spent: 0,
    agentId,
  };
  sessions.set(session.sessionId, session);
  return session;
}

export function recordPayment(sessionId: string, amount: number): boolean {
  const session = sessions.get(sessionId);
  if (!session) return false;
  if (session.spent + amount > session.budget) return false;
  session.spent += amount;
  sessions.set(sessionId, session);
  return true;
}

export function getSession(sessionId: string): MPPSession | undefined {
  return sessions.get(sessionId);
}

export function getRemainingBudget(sessionId: string): number {
  const session = sessions.get(sessionId);
  if (!session) return 0;
  return parseFloat((session.budget - session.spent).toFixed(4));
}

export function closeSession(sessionId: string): MPPSession | undefined {
  const session = sessions.get(sessionId);
  sessions.delete(sessionId);
  return session;
}