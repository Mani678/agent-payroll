"use client";
import { useState, useEffect, useCallback } from "react";
import TxFeed from "./TxFeed";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const TYPE_META: Record<string, { icon: string; color: string }> = {
  research: { icon: "◎", color: "#7c6fff" },
  writer:   { icon: "✦", color: "#00e5a0" },
  analyst:  { icon: "▲", color: "#ffb347" },
  intel:    { icon: "◆", color: "#ff4d6a" },
};

function AgentRow({ agent }: { agent: any }) {
  const meta = TYPE_META[agent.type] || { icon: "●", color: "#fff" };
  const score = agent.score ? Math.round(agent.score.score * 100) : null;
  const isWinner = agent.status === "done";
  const isElim = agent.status === "replaced";

  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: 12,
      padding: "10px 14px",
      borderRadius: 8,
      background: isWinner ? "rgba(0,229,160,0.05)" : isElim ? "rgba(255,77,106,0.04)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${isWinner ? "rgba(0,229,160,0.15)" : isElim ? "rgba(255,77,106,0.1)" : "rgba(255,255,255,0.05)"}`,
      transition: "all 0.3s",
    }}>
      <span style={{ fontSize: 16, color: meta.color, flexShrink: 0 }}>{meta.icon}</span>
      <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase" as const, letterSpacing: "0.06em", minWidth: 70 }}>
        {agent.type}
      </span>

      {score !== null ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
            <div style={{
              width: `${score}%`,
              height: "100%",
              background: isWinner ? "var(--green)" : isElim ? "var(--red)" : "var(--accent)",
              borderRadius: 2,
              transition: "width 0.8s ease",
              boxShadow: isWinner ? "0 0 6px var(--green)" : "none",
            }} />
          </div>
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: isWinner ? "var(--green)" : isElim ? "var(--red)" : "var(--text-dim)", minWidth: 32, textAlign: "right" as const }}>
            {score}
          </span>
        </div>
      ) : (
        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.04)", borderRadius: 2 }}>
          <div style={{ width: agent.status === "working" ? "60%" : "0%", height: "100%", background: "var(--accent)", borderRadius: 2, opacity: 0.5, transition: "width 1s ease" }} />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {agent.costXLM > 0 && (
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--green)" }}>
            +{Number(agent.costXLM).toFixed(4)} XLM
          </span>
        )}
        <span style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 4,
          background: isWinner ? "rgba(0,229,160,0.1)" : isElim ? "rgba(255,77,106,0.1)" : "rgba(255,255,255,0.05)",
          color: isWinner ? "var(--green)" : isElim ? "var(--red)" : "var(--text-faint)",
          textTransform: "uppercase" as const,
          letterSpacing: "0.08em",
        }}>
          {isWinner ? "paid ✓" : isElim ? "cut ✗" : agent.status}
        </span>
        {agent.txHash && (
          <a href={`https://stellar.expert/explorer/testnet/tx/${agent.txHash}`} target="_blank" rel="noreferrer"
            style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)" }}>↗</a>
        )}
      </div>
    </div>
  );
}

function JobCard({ job, isActive, onClick }: { job: any; isActive: boolean; onClick: () => void }) {
  const agents = job.agents || [];
  const doneCount = agents.filter((a: any) => a.status === "done").length;
  const cutCount = agents.filter((a: any) => a.status === "replaced").length;
  const isDone = job.status === "done";

  return (
    <div onClick={onClick} style={{
      background: isActive ? "var(--surface2)" : "var(--surface)",
      border: `1px solid ${isActive ? "var(--accent)" : "var(--border)"}`,
      borderRadius: 12,
      padding: "1.25rem",
      cursor: "pointer",
      transition: "all 0.2s",
      boxShadow: isActive ? "0 0 0 1px rgba(124,111,255,0.2), 0 8px 32px rgba(124,111,255,0.08)" : "none",
    }}>
      {/* Job header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", margin: 0, lineHeight: 1.5, flex: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
          {job.goal}
        </p>
        <span style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          padding: "3px 8px",
          borderRadius: 4,
          background: isDone ? "rgba(0,229,160,0.1)" : "rgba(255,179,71,0.1)",
          color: isDone ? "var(--green)" : "var(--amber)",
          border: isDone ? "1px solid rgba(0,229,160,0.2)" : "1px solid rgba(255,179,71,0.2)",
          flexShrink: 0,
          textTransform: "uppercase" as const,
          letterSpacing: "0.08em",
        }}>
          {job.status}
        </span>
      </div>

      {/* Inline agent competition preview */}
      {agents.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 6, marginBottom: 12 }}>
          {agents.map((agent: any) => (
            <AgentRow key={agent.id} agent={agent} />
          ))}
        </div>
      )}

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)" }}>
          {doneCount} paid · {cutCount} cut
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--green)" }}>
          {Number(job.totalSpent).toFixed(4)} XLM spent
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", marginLeft: "auto" }}>
          {Object.keys(job.results || {}).length}/4 tasks
        </span>
      </div>
    </div>
  );
}

interface Job {
  id: string;
  goal: string;
  budget: number;
  status: string;
  agents: any[];
  results: Record<string, string>;
  totalSpent: number;
  startedAt: string;
  completedAt?: string;
}

export default function Dashboard() {
  const [goal, setGoal] = useState("");
  const [budget, setBudget] = useState("2");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [activeJob, setActiveJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<any[]>([]);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/jobs`);
      const data = await res.json();
      const reversed = data.reverse();
      setJobs(reversed);
      if (activeJob) {
        const updated = reversed.find((j: Job) => j.id === activeJob.id);
        if (updated) setActiveJob(updated);
      }
    } catch {}
  }, [activeJob]);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(async () => {
      fetchJobs();
      try {
        const logsRes = await fetch(`${API}/api/logs`);
        const logsData = await logsRes.json();
        setLogs(Array.isArray(logsData) ? logsData : []);
      } catch {}
    }, 3000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  async function submitJob() {
    if (!goal.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/api/job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, budget: parseFloat(budget) }),
      });
      if (!res.ok) throw new Error("Job failed");
      const job = await res.json();
      setActiveJob(job);
      setGoal("");
      fetchJobs();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem", fontFamily: "var(--sans)" }}>

      {/* Header */}
      <div className="animate-in" style={{ marginBottom: "3rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)", animation: "pulse-dot 2s ease infinite" }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.15em", textTransform: "uppercase" as const }}>
            live · stellar testnet
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--display)", fontSize: 42, fontWeight: 800, color: "var(--text)", letterSpacing: "-0.03em", lineHeight: 1.1, marginBottom: 12 }}>
          Agent<span style={{ color: "var(--accent)" }}>Payroll</span>
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-dim)", fontWeight: 300, maxWidth: 520, lineHeight: 1.6, marginBottom: 16 }}>
          Spawn competing AI agents, score their work, and pay only the best — all onchain via x402 on Stellar.
        </p>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderRadius: 8,
          background: "rgba(124,111,255,0.08)",
          border: "1px solid rgba(124,111,255,0.2)",
        }}>
          <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 500 }}>
            ⚡ Multiple agents compete per task. Only top performers get paid.
          </span>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>

        {/* Left — Jobs */}
        <div>
          {/* Input */}
          <div className="animate-in-2" style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: 14,
            padding: "1.5rem",
            marginBottom: "1.5rem",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)", letterSpacing: "0.12em", textTransform: "uppercase" as const }}>new mission</span>
            </div>
            <textarea
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) submitJob(); }}
              placeholder="e.g. Research Tesla Q1 2026 earnings, write a market analysis, track competitor reactions..."
              rows={3}
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-faint)" }}>budget</span>
                <input type="number" value={budget} min="0.1" step="0.1" onChange={(e) => setBudget(e.target.value)} />
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-faint)" }}>XLM</span>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)" }}>⌘+enter</span>
                <button onClick={submitJob} disabled={loading || !goal.trim()}>
                  {loading ? "spawning..." : "Deploy agents →"}
                </button>
              </div>
            </div>
            {error && <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--red)", margin: "8px 0 0" }}>{error}</p>}
          </div>

          {/* How it works — always visible */}
          <div className="animate-in-3" style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: "1.5rem",
          }}>
            {[
              { icon: TYPE_META.research.icon, color: TYPE_META.research.color, label: "Research", desc: "Finds key facts" },
              { icon: TYPE_META.writer.icon, color: TYPE_META.writer.color, label: "Writer", desc: "Drafts content" },
              { icon: TYPE_META.analyst.icon, color: TYPE_META.analyst.color, label: "Analyst", desc: "Spots patterns" },
              { icon: TYPE_META.intel.icon, color: TYPE_META.intel.color, label: "Intel", desc: "Tracks competitors" },
            ].map((a) => (
              <div key={a.label} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                padding: "12px",
                textAlign: "center" as const,
              }}>
                <div style={{ fontSize: 20, color: a.color, marginBottom: 6 }}>{a.icon}</div>
                <p style={{ fontFamily: "var(--display)", fontSize: 12, fontWeight: 600, margin: "0 0 2px", color: "var(--text)" }}>{a.label}</p>
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)", margin: 0 }}>{a.desc}</p>
              </div>
            ))}
          </div>

          {/* Jobs list */}
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
            {jobs.length === 0 ? (
              <div style={{
                padding: "3rem",
                textAlign: "center" as const,
                border: "1px dashed var(--border)",
                borderRadius: 14,
                color: "var(--text-faint)",
                fontFamily: "var(--mono)",
                fontSize: 12,
              }}>
                no jobs yet — deploy your first mission above
              </div>
            ) : (
              jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isActive={activeJob?.id === job.id}
                  onClick={() => setActiveJob(activeJob?.id === job.id ? null : job)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right panel */}
        <div style={{ display: "flex", flexDirection: "column" as const, gap: 16, position: "sticky" as const, top: 24 }}>

          {/* Results panel */}
          {activeJob && Object.keys(activeJob.results || {}).length > 0 && (
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 14,
              overflow: "hidden",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Agent Outputs</span>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)" }}>{Object.keys(activeJob.results).length}/4</span>
              </div>
              <div style={{ maxHeight: 400, overflowY: "auto" as const }}>
                {Object.entries(activeJob.results).map(([type, output], i, arr) => (
                  <div key={type} style={{ padding: "14px 16px", borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, color: TYPE_META[type]?.color || "var(--accent)" }}>{TYPE_META[type]?.icon}</span>
                      <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>{type}</span>
                    </div>
                    <p style={{ fontSize: 12, margin: 0, lineHeight: 1.7, color: "var(--text-dim)", whiteSpace: "pre-wrap" }}>{output}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tx Feed */}
          {activeJob && (activeJob.agents || []).length > 0 && (
            <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontFamily: "var(--display)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Transactions</span>
              </div>
              <TxFeed agents={activeJob.agents} />
            </div>
          )}

          {/* Activity log */}
          <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontFamily: "var(--display)", fontSize: 13, fontWeight: 600, color: "var(--text)" }}>Live Log</span>
            </div>
            <div style={{ padding: "10px", height: 200, overflowY: "auto" as const, display: "flex", flexDirection: "column" as const, gap: 3 }}>
              {logs.length === 0 ? (
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", padding: "8px 4px" }}>awaiting activity...</span>
              ) : (
                logs.map((entry: any, i: number) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontFamily: "var(--mono)", fontSize: 9, color: "var(--text-faint)", flexShrink: 0, minWidth: 60, paddingTop: 1 }}>{entry.timestamp}</span>
                    <span style={{
                      fontFamily: "var(--mono)", fontSize: 10, lineHeight: 1.5,
                      color: entry.level === "success" ? "var(--green)" : entry.level === "error" ? "var(--red)" : entry.level === "warn" ? "var(--amber)" : "var(--text-dim)",
                    }}>{entry.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer */}
          <div style={{ padding: "12px 4px", display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)" }}>agentpayroll v1.0</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)" }}>x402 + stellar</span>
          </div>
        </div>
      </div>
    </div>
  );
}