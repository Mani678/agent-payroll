"use client";

export default function AgentCard({ agent }: { agent: any }) {
  const typeColors: any = {
    research: "#00ff88",
    writer: "#00ccff", 
    analyst: "#ffb830",
    intel: "#ff6ef7",
  };

  const statusColors: any = {
    idle: "#3d6b4a",
    working: "#ffb830",
    done: "#00ff88",
    replaced: "#ff4d6a",
  };

  const color = typeColors[agent.type] || "#00ff88";
  const scolor = statusColors[agent.status] || "#00ff88";

  return (
    <div style={{
      background: "var(--surface)",
      border: `1px solid ${agent.status === "done" ? "rgba(0,255,136,0.2)" : agent.status === "replaced" ? "rgba(255,77,106,0.2)" : "var(--border)"}`,
      borderRadius: 8,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 10,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 6px ${color}` }} />
          <span style={{ fontFamily: "var(--mono)", fontSize: 12, fontWeight: 600, color, letterSpacing: "0.08em" }}>
            {agent.type.toUpperCase()}
          </span>
        </div>
        <span style={{
          fontFamily: "var(--mono)",
          fontSize: 10,
          padding: "2px 8px",
          borderRadius: 4,
          color: scolor,
          border: `1px solid ${scolor}40`,
          background: `${scolor}10`,
          textTransform: "uppercase" as const,
          letterSpacing: "0.08em",
        }}>
          {agent.status}
        </span>
      </div>

      {agent.task && (
        <p style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", margin: 0, lineHeight: 1.5 }}>
          {agent.task.slice(0, 80)}...
        </p>
      )}

      {agent.score && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)", textTransform: "uppercase" as const }}>quality score</span>
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: agent.score.pass ? "var(--green)" : "var(--red)" }}>
              {Math.round(agent.score.score * 100)}%
            </span>
          </div>
          <div style={{ height: 3, background: "#1a2a1e", borderRadius: 2 }}>
            <div style={{
              width: `${Math.round(agent.score.score * 100)}%`,
              height: "100%",
              background: agent.score.pass ? "var(--green)" : "var(--red)",
              borderRadius: 2,
              transition: "width 0.6s ease",
            }} />
          </div>
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 6, borderTop: "1px solid var(--border)" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)" }}>
          {agent.wallet?.publicKey?.slice(0, 6)}...{agent.wallet?.publicKey?.slice(-4)}
        </span>
        <div style={{ display: "flex", gap: 10 }}>
          {agent.costXLM > 0 && (
            <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--green)" }}>
              +{Number(agent.costXLM).toFixed(4)} XLM
            </span>
          )}
          {agent.txHash && (
            <a href={`https://stellar.expert/explorer/testnet/tx/${agent.txHash}`} target="_blank" rel="noreferrer"
              style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--green-dim)" }}>
              tx ↗
            </a>
          )}
        </div>
      </div>
    </div>
  );
}