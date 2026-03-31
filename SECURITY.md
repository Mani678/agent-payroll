# Security

## Current State (Hackathon / Testnet)

agent_payroll is currently running on Stellar testnet with the following security posture:

### Key Storage
- The manager wallet secret key is stored in `.env` as plaintext
- Sub-agent wallets are generated ephemerally per job and discarded
- No real funds are at risk — testnet XLM has no monetary value

### Known Risks

| Risk | Current State | Production Solution |
|---|---|---|
| Secret key in `.env` | Plaintext | AWS Secrets Manager / Doppler |
| No spending limits onchain | Budget enforced in code only | Soroban contract accounts |
| No API authentication | Open endpoints | JWT / API key middleware |
| In-memory job store | Lost on restart | PostgreSQL with encryption at rest |
| Sub-agent key exposure | Generated in memory, discarded | HSM-backed key generation |

## Production Architecture

For a production deployment handling real funds:

1. **Manager wallet** — store secret in a TEE (Trusted Execution Environment) or HSM. Never in `.env`.
2. **Soroban contract accounts** — enforce hard spending limits per sub-agent wallet onchain, not just in application code.
3. **Sub-agent isolation** — each sub-agent wallet should have a Soroban-enforced budget cap so a compromised agent cannot drain the treasury.
4. **API authentication** — all endpoints behind JWT with role-based access (operator vs read-only).
5. **Audit log** — append-only log of all payment events, stored separately from application logs.

## Reporting Issues

If you discover a security issue please open a private GitHub issue or contact the maintainer directly.