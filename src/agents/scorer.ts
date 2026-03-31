import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";
dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ScoreResult {
  score: number;
  reason: string;
  pass: boolean;
}

export async function scoreOutput(
  task: string,
  output: string
): Promise<ScoreResult> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 256,
    system: `You are a strict output quality evaluator. Given a task and an agent's output, score the output from 0.0 to 1.0. Return ONLY valid JSON in this format: {"score": 0.0, "reason": "brief reason"}. Nothing else.`,
    messages: [
      {
        role: "user",
        content: `Task: ${task}\n\nOutput: ${output}`,
      },
    ],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    const parsed = JSON.parse(text);
    const score = parseFloat(parsed.score) || 0;
    const minScore = parseFloat(process.env.MIN_PERFORMANCE_SCORE || "0.6");
    return {
      score,
      reason: parsed.reason || "no reason given",
      pass: score >= minScore,
    };
  } catch {
    return { score: 0, reason: "failed to parse score", pass: false };
  }
}