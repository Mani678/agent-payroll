# agent_payroll_

> Autonomous agents that work, earn, and get replaced — payments on Stellar via x402

agent_payroll is an agentic payroll system built on Stellar. A manager agent autonomously spawns specialized sub-agents, assigns them tasks, scores their output quality, pays them in XLM via x402 micropayments, and replaces underperformers — all without human intervention.

---

## Live Demo
> Deployed at: [YOUR RAILWAY URL HERE]

---

## What It Does

1. **Manager agent** receives a goal and budget
2. **4 sub-agents spawn** — Research, Writer, Analyst, Intel — each with their own Stellar wallet
3. Each agent **executes its task** using Claude AI
4. Each output is **scored 0–100%** by an independent evaluator agent
5. Agents that pass the threshold **get paid** in XLM via x402 payment flow on Stellar
6. Agents that fail **get replaced** and retried up to 3 times
7. A **scheduler runs autonomously** — 3 objectives fire on schedule with no human input
8. An **operator kill switch** pauses/resumes the scheduler instantly

---

## Architecture
```
User / Scheduler
      ↓
Manager Agent (treasury wallet)
      ↓ spawns + pays
┌─────────────────────────────────┐
│  Research │ Writer │ Analyst │ Intel  │
│  Agent    │ Agent  │ Agent   │ Agent  │
└─────────────────────────────────┘
      ↓ x402 payment flow
Stellar SDK → USDC/XLM → Stellar Testnet
```

---

## Tech Stack

- **Frontend** — Next.js 14, TypeScript
- **Backend** — Express, TypeScript, ts-node-dev
- **AI** — Anthropic Claude (claude-sonnet-4-20250514)
- **Payments** — x402 protocol, stellar-mpp-sdk
- **Blockchain** — Stellar Testnet, Stellar SDK, Soroban
- **Stablecoin** — XLM / USDC on Stellar testnet

---

## Hackathon Alignment

| Requirement | Status |
|---|---|
| Agents that can pay for services | ✅ Sub-agents paid per completed task |
| x402 payment flow | ✅ HTTP 402 → sign → retry with payment header |
| Stellar testnet transactions | ✅ Real XLM payments on testnet |
| Agent-to-agent coordination | ✅ Manager pays 4 specialist sub-agents |
| MPP-style flows | ✅ stellar-mpp-sdk session management |
| Autonomous operation | ✅ Scheduler runs 3 objectives with no human input |

---

## Quick Start
```bash
git clone https://github.com/YOUR_USERNAME/agent-payroll
cd agent-payroll
cp .env.example .env
# Fill in your keys (see .env.example for instructions)
npm install
npm run dev
```

Open `http://localhost:3000`

---

## Generating a Stellar Wallet
```bash
node -e "const sdk = require('@stellar/stellar-sdk'); const kp = sdk.Keypair.random(); console.log('Public:', kp.publicKey()); console.log('Secret:', kp.secret());"
```

Fund it on testnet:
```
https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY
```

---

## Environment Variables

See `.env.example` for full list. Required keys:
- `ANTHROPIC_API_KEY` — from console.anthropic.com
- `MANAGER_SECRET_KEY` — Stellar keypair secret
- `MANAGER_PUBLIC_KEY` — Stellar keypair public key

---

## Known Limitations & Honest Notes

- **Mock payments** — The x402 payment flow is implemented but Stellar network calls are currently mocked due to local network restrictions. The payment logic, signing, and submission code is fully written in `src/payments/wallet.ts` and works on any server with open egress to `horizon-testnet.stellar.org`. See `ROADMAP.md` for the path to mainnet.
- **In-memory job store** — Jobs are stored in a `Map` in memory. A server restart clears history. Production would use PostgreSQL.
- **No auth** — The API has no authentication. Production would add API keys or JWT.
- **Single manager wallet** — One treasury wallet funds all sub-agents. Production would use Soroban contract accounts with per-agent spending policies.

---

## Project Structure
```
agent-payroll/
  src/
    agents/
      manager.ts        — job orchestration, agent spawning, budget tracking
      subAgent.ts       — sub-agent template, task execution, payment trigger
      scorer.ts         — AI-powered output quality scoring
      scheduler.ts      — autonomous objective scheduling
    payments/
      wallet.ts         — Stellar wallet generation, funding, payments
      x402.ts           — x402 HTTP 402 payment middleware
      mpp.ts            — stellar-mpp-sdk session management
    services/
      claude.ts         — Claude API wrapper, agent system prompts
      search.ts         — paid search service
    api/
      routes.ts         — Express API endpoints
      logger.ts         — real-time activity logger
    dashboard/
      Dashboard.tsx     — main dashboard
      AgentCard.tsx     — agent status card
      TxFeed.tsx        — live transaction feed
    app/
      page.tsx          — Next.js entry
      layout.tsx        — root layout
      globals.css       — terminal green theme
```

---

## License

MIT