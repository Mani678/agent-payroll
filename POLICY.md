# Policy

agent_payroll has a built-in policy layer that controls autonomous agent behavior.

## Spending Policy

Every job enforces a hard budget set at submission time. The manager splits the budget equally across 4 sub-agents. No sub-agent can spend more than its allocated share.

| Parameter | Default | Description |
|---|---|---|
| `MAX_BUDGET_USDC` | 10 | Maximum total budget per job |
| `PAYMENT_AMOUNT_USDC` | 0.01 | Payment per completed task |
| `MAX_RETRIES` | 3 | Max retries before agent is marked failed |
| `MIN_PERFORMANCE_SCORE` | 0.6 | Minimum quality score to trigger payment |

## Scheduler Policy

The autonomous scheduler runs 3 objectives on configurable intervals. Operators can pause and resume the scheduler instantly via the dashboard kill switch or the API.
```
POST /api/pause
{ "paused": true }   // pause
{ "paused": false }  // resume
```

## Kill Switch

The operator kill switch immediately stops all scheduled job spawning. Any job currently in progress will complete. No new jobs will be spawned until the scheduler is resumed.

## Agent Replacement Policy

If a sub-agent scores below `MIN_PERFORMANCE_SCORE` its payment is withheld and a new agent is spawned to retry the task. After `MAX_RETRIES` failed attempts the task is marked failed and the budget for that agent is returned to the job summary.

## Production Policy Recommendations

For mainnet deployment:
- Enforce spending limits via Soroban contract accounts (onchain, not application-level)
- Add time-window restrictions (agents only operate during business hours)
- Add program allowlists (agents can only interact with whitelisted Stellar contracts)
- Add daily spend caps across all jobs combined