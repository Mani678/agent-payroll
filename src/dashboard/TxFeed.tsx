"use client";

export default function TxFeed({ agents }: { agents: any[] }) {
  const feed = agents
    .filter((a) => a.txHash || a.status === "replaced")
    .reverse();

  if (feed.length === 0) {
    return (
      <div style={{
        padding: "16px",
        fontFamily: "var(--mono)",
        fontSize: 12,
        color: "var(--text-faint)",
        border: "1px solid var(--border)",
        borderRadius: 6,
        textAlign: "center",
      }}>
        awaiting transactions...
      </div>
    );
  }

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 6, overflow: "hidden" }}>
      {feed.map((tx: any, i: number) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: i < feed.length - 1 ? "1px solid var(--border)" : "none",
          background: tx.status === "done" ? "rgba(0,255,136,0.03)" : "rgba(255,77,106,0.03)",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
              background: tx.status === "done" ? "var(--green)" : "var(--red)",
              boxShadow: tx.status === "done" ? "0 0 5px var(--green)" : "0 0 5px var(--red)",
            }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 12, color: "var(--text-dim)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
              {tx.type}
            </span>
            {tx.txHash ? (
              <a href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`} target="_blank" rel="noreferrer"
                style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--green-dim)" }}>
                {tx.txHash.slice(0, 14)}... ↗
              </a>
            ) : (
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--red)" }}>agent replaced</span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            {tx.status === "done" && (
              <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--green)" }}>
                {Number(tx.costXLM).toFixed(4)} XLM
              </span>
            )}
            <span style={{
              fontFamily: "var(--mono)",
              fontSize: 10,
              padding: "2px 7px",
              borderRadius: 4,
              background: tx.status === "done" ? "rgba(0,255,136,0.08)" : "rgba(255,77,106,0.08)",
              color: tx.status === "done" ? "var(--green)" : "var(--red)",
              border: tx.status === "done" ? "1px solid rgba(0,255,136,0.2)" : "1px solid rgba(255,77,106,0.2)",
              textTransform: "uppercase" as const,
              letterSpacing: "0.08em",
            }}>
              {tx.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}