"use client";

export default function TxFeed({ agents }: { agents: any[] }) {
  const feed = agents
    .filter((a) => a.txHash || a.status === "replaced")
    .reverse();

  if (feed.length === 0) {
    return (
      <div style={{ padding: "16px", fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-faint)", textAlign: "center" as const }}>
        no transactions yet
      </div>
    );
  }

  return (
    <div>
      {feed.map((tx: any, i: number) => (
        <div key={i} style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 14px",
          borderBottom: i < feed.length - 1 ? "1px solid var(--border)" : "none",
          gap: 10,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%", flexShrink: 0,
              background: tx.status === "done" ? "var(--green)" : "var(--red)",
              boxShadow: tx.status === "done" ? "0 0 5px var(--green)" : "none",
            }} />
            <span style={{ fontFamily: "var(--mono)", fontSize: 11, color: "var(--text-dim)", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>
              {tx.type}
            </span>
            {tx.txHash ? (
              <a href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`} target="_blank" rel="noreferrer"
                style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--accent)" }}>
                {tx.txHash.slice(0, 10)}... ↗
              </a>
            ) : (
              <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--red)" }}>eliminated</span>
            )}
          </div>
          <span style={{
            fontFamily: "var(--mono)", fontSize: 10, padding: "2px 7px", borderRadius: 4,
            background: tx.status === "done" ? "rgba(0,229,160,0.1)" : "rgba(255,77,106,0.1)",
            color: tx.status === "done" ? "var(--green)" : "var(--red)",
            textTransform: "uppercase" as const, letterSpacing: "0.08em",
          }}>
            {tx.status === "done" ? `+${Number(tx.costXLM).toFixed(4)} XLM` : "cut"}
          </span>
        </div>
      ))}
    </div>
  );
}