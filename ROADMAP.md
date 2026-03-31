# Roadmap

## Shipped (v1.0.0 — hackathon build)

- Manager agent with treasury wallet
- 4 specialist sub-agents (Research, Writer, Analyst, Intel)
- AI-powered quality scoring per agent output
- Agent replacement on low scores (up to 3 retries)
- x402 payment middleware (HTTP 402 → sign → retry)
- stellar-mpp-sdk session management
- Autonomous scheduler (3 objectives, configurable intervals)
- Operator kill switch (pause/resume)
- Live activity log
- Real-time transaction feed
- Terminal dashboard (Next.js)

## Next Up (v1.1.0)

- [ ] Real Stellar mainnet transactions (remove mock)
- [ ] Soroban contract accounts with per-agent spending limits
- [ ] PostgreSQL job persistence (replace in-memory Map)
- [ ] BullMQ job queue for concurrent job handling
- [ ] API authentication (JWT)
- [ ] Agent reputation scores that persist across jobs

## Future (v2.0.0)

- [ ] Agent marketplace — agents can advertise services, other agents discover and pay
- [ ] Multi-manager coordination — managers that hire other managers
- [ ] USDC stablecoin payments (replace XLM)
- [ ] Soroban escrow contracts — payment held until output verified
- [ ] Agent memory — cross-session learning from past job performance
- [ ] Web3 auth — connect Stellar wallet to dashboard
- [ ] Public API — let anyone build agents that plug into the payroll system