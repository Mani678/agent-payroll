import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type AgentType = "research" | "writer" | "analyst" | "intel";

const SYSTEM_PROMPTS: Record<AgentType, string> = {
  research: `You are a research agent. Your job is to find relevant, accurate information on any topic given to you. Return structured findings with key facts, sources referenced, and a summary. Be concise and factual.`,
  writer: `You are a content writing agent. Your job is to produce clear, well-structured written content based on the brief given. Return polished prose ready for use. Match the tone and length requested.`,
  analyst: `You are a data analysis agent. Your job is to analyze information, identify patterns, and produce actionable insights. Return structured analysis with key findings, metrics where relevant, and recommendations.`,
  intel: `You are a competitive intelligence agent. Your job is to monitor and analyze competitor activity, market trends, and industry signals. Return structured intelligence reports with key observations and implications.`,
};

export interface AgentResult {
  output: string;
  tokensUsed: number;
  agentType: AgentType;
}

export async function runAgent(
  agentType: AgentType,
  task: string
): Promise<AgentResult> {
  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPTS[agentType],
    messages: [{ role: "user", content: task }],
  });

  const output =
    response.content[0].type === "text" ? response.content[0].text : "";

  return {
    output,
    tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    agentType,
  };
}