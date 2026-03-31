"use client";
import { useState, useEffect, useCallback } from "react";
import AgentCard from "./AgentCard";
import TxFeed from "./TxFeed";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

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
  const [tick, setTick] = useState(0);
  const [logs, setLogs] = useState<any[]>([]);
  const [paused, setPausedState] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTick(n => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/jobs`);
      const data = await res.json();
      setJobs(data.reverse());
    } catch { }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(async () => {
      fetchJobs();
      try {
        const [logsRes, statusRes] = await Promise.all([
          fetch(`${API}/api/logs`),
          fetch(`${API}/api/status`),
        ]);
        const logsData = await logsRes.json();
        setLogs(Array.isArray(logsData) ? logsData : []);
        const status = await statusRes.json();
        setPausedState(status.paused);
      } catch { }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);

  async function submitJob() {
    if (!goal.trim()) return;
    setLoading(true);
    setError("");
    setActiveJob(null);
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

  async function togglePause() {
    try {
      const res = await fetch(`${API}/api/pause`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paused: !paused }),
      });
      const data = await res.json();
      setPausedState(data.paused);
    } catch { }
  }

  const allAgents = activeJob?.agents || [];
  const elapsed = activeJob
    ? Math.round((Date.now() - new Date(activeJob.startedAt).getTime()) / 1000)
    : 0;

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "2.5rem 1.5rem", fontFamily: "var(--sans)" }}>

      {/* Header */}
      <div className="animate-in" style={{ marginBottom: "2.5rem", borderBottom: "1px solid var(--border)", paddingBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--green)", boxShadow: "0 0 8px var(--green)", animation: "pulse-dot 2s ease infinite" }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.15em", textTransform: "uppercase" as const }}>
            system online — stellar testnet
          </span>
        </div>
        <h1 style={{ fontFamily: "var(--mono)", fontSize: 28, fontWeight: 600, color: "var(--green)", letterSpacing: "-0.02em", marginBottom: 4 }}>
          agent_payroll<span style={{ color: "var(--text-faint)" }}>_</span>
        </h1>
        <p style={{ fontSize: 14, color: "var(--text-dim)", fontWeight: 300, marginBottom: 12 }}>
          Autonomous agents that work, earn, and get replaced — payments on Stellar via x402
        </p>

        {/* Autonomy status + kill switch row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" as const }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid rgba(0,255,136,0.2)",
            background: "rgba(0,255,136,0.05)",
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%",
              background: paused ? "var(--amber)" : "var(--green)",
              boxShadow: paused ? "0 0 8px var(--amber)" : "0 0 8px var(--green)",
              animation: "pulse-dot 1.5s ease infinite",
            }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: paused ? "var(--amber)" : "var(--green)", letterSpacing: "0.1em" }}>
              {paused ? "scheduler paused" : "3 autonomous objectives running"}
            </span>
          </div>

          <button
            onClick={togglePause}
            style={{
              padding: "6px 14px",
              fontSize: 11,
              fontFamily: "var(--mono)",
              letterSpacing: "0.1em",
              textTransform: "uppercase" as const,
              borderRadius: 6,
              border: paused ? "1px solid rgba(0,255,136,0.3)" : "1px solid rgba(255,77,106,0.3)",
              background: paused ? "rgba(0,255,136,0.08)" : "rgba(255,77,106,0.08)",
              color: paused ? "var(--green)" : "var(--red)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {paused ? "▶ resume scheduler" : "⏸ pause scheduler"}
          </button>
        </div>
      </div>

      {/* Input Panel */}
      <div className="animate-in-delay" style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 8,
        padding: "1.5rem",
        marginBottom: "1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            &gt; new_job.goal
          </span>
        </div>
        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && e.metaKey) submitJob(); }}
          placeholder="e.g. Research Tesla Q1 2026 earnings, write a 3-paragraph analysis, monitor competitor reactions..."
          rows={3}
        />
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-faint)" }}>budget</span>
            <input
              type="number"
              value={budget}
              min="0.1"
              step="0.1"
              onChange={(e) => setBudget(e.target.value)}
            />
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-faint)" }}>XLM</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)" }}>⌘+enter to run</span>
            <button onClick={submitJob} disabled={loading || !goal.trim()}>
              {loading ? "spawning agents..." : "run job →"}
            </button>
          </div>
        </div>
        {error && (
          <p style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--red)", margin: 0 }}>
            error: {error}
          </p>
        )}
      </div>

      {/* Active Job */}
      {activeJob && (
        <div className="animate-in">

          {/* Stats Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10, marginBottom: "1.25rem" }}>
            {[
              { label: "status", value: activeJob.status, color: activeJob.status === "done" ? "var(--green)" : "var(--amber)" },
              { label: "elapsed", value: `${elapsed}s`, color: "var(--text)" },
              { label: "spent", value: `${activeJob.totalSpent.toFixed(4)} XLM`, color: "var(--green)" },
              { label: "tasks", value: `${Object.keys(activeJob.results).length}/4`, color: "var(--text)" },
            ].map((m) => (
              <div key={m.label} style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 6,
                padding: "12px 14px",
              }}>
                <p style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)", margin: "0 0 4px", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>{m.label}</p>
                <p style={{ fontFamily: "var(--mono)", fontSize: 16, fontWeight: 500, margin: 0, color: m.color }}>{m.value}</p>
              </div>
            ))}
          </div>

          {/* Goal display */}
          <div style={{
            background: "var(--green-faint)",
            border: "1px solid var(--green-border)",
            borderRadius: 6,
            padding: "10px 14px",
            marginBottom: "1.25rem",
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--text-dim)",
          }}>
            <span style={{ color: "var(--text-faint)" }}>goal: </span>{activeJob.goal}
          </div>

          {/* Agent Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 10, marginBottom: "1.25rem" }}>
            {allAgents.map((agent) => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>

          {/* Tx Feed */}
          <div style={{ marginBottom: "1.25rem" }}>
            <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", margin: "0 0 8px", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
              transaction feed
            </p>
            <TxFeed agents={allAgents} />
          </div>

          {/* Results */}
          {Object.keys(activeJob.results).length > 0 && (
            <div style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: "1.25rem",
            }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
                  agent outputs
                </span>
              </div>
              {Object.entries(activeJob.results).map(([type, output], i, arr) => (
                <div key={type} style={{
                  padding: "16px",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                }}>
                  <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--green-dim)", margin: "0 0 8px", textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>
                    [{type}]
                  </p>
                  <p style={{ fontSize: 13, margin: 0, lineHeight: 1.7, color: "var(--text-dim)", whiteSpace: "pre-wrap" }}>{output}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Previous Jobs */}
      {jobs.length > 0 && (
        <div style={{ marginTop: "2rem" }}>
          <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", margin: "0 0 10px", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
            job history
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {jobs.slice(0, 5).map((job) => (
              <div
                key={job.id}
                onClick={() => setActiveJob(job)}
                style={{
                  background: activeJob?.id === job.id ? "var(--green-faint)" : "var(--surface)",
                  border: activeJob?.id === job.id ? "1px solid var(--green-border)" : "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "10px 14px",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {job.goal}
                </span>
                <span style={{
                  fontFamily: "var(--mono)",
                  fontSize: 10,
                  padding: "2px 8px",
                  borderRadius: 4,
                  background: job.status === "done" ? "rgba(0,255,136,0.08)" : "var(--amber-faint)",
                  color: job.status === "done" ? "var(--green)" : "var(--amber)",
                  border: job.status === "done" ? "1px solid rgba(0,255,136,0.2)" : "1px solid rgba(255,184,48,0.2)",
                  flexShrink: 0,
                  textTransform: "uppercase" as const,
                  letterSpacing: "0.08em",
                }}>
                  {job.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Log */}
      <div style={{ marginTop: "2rem" }}>
        <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", margin: "0 0 8px", textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>
          live activity log
        </p>
        <div style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "12px",
          height: 220,
          overflowY: "auto" as const,
          display: "flex",
          flexDirection: "column" as const,
          gap: 4,
        }}>
          {logs.length === 0 ? (
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)" }}>
              awaiting activity...
            </span>
          ) : (
            logs.map((entry: any, i: number) => (
              <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)", flexShrink: 0, minWidth: 70 }}>
                  {entry.timestamp}
                </span>
                <span style={{
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  color: entry.level === "success" ? "var(--green)"
                    : entry.level === "error" ? "var(--red)"
                      : entry.level === "warn" ? "var(--amber)"
                        : "var(--text-dim)",
                  lineHeight: 1.5,
                }}>
                  {entry.message}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: "3rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)" }}>
          agent_payroll v1.0.0 — stellar testnet
        </span>
        <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)" }}>
          powered by x402 + soroban
        </span>
      </div>
    </div>
  );
}