# P0 / P1 / P2 Backlog

## P0 — Production blockers
- [x] Documented run/install workflow for current Pine Script scope.
- [x] Added config reference for script inputs.
- [x] Added `.env.example` placeholders (no secrets).
- [x] Added `.gitignore` coverage for common artifacts and secret files.
- [ ] Add CI check to validate repository policy files are present.

## P1 — Reliability and production readiness
- [x] Add Privileged Settings Agent with allowlisted propose/confirm flow, RBAC, audit logging, and OpenRouter model refresh endpoints.
- [x] Align Mission Control data contract with authoritative UI spec (heartbeat freshness, task phase, channel-level notification states).
- [x] Mission Control MVP contract implemented (agent status, events, system health, stub mode).
- [ ] Add a canonical config abstraction if/when execution/integration services are introduced.
- [ ] Add structured logging and health checks for any future backend components.
- [ ] Add retry/backoff wrappers for network integrations (market data + notifications).
- [ ] Add tests for config validation and risk guard defaults in non-Pine components.

## P2 — Product polish
- [ ] Package script release process (versioned changelog + release checklist).
- [ ] Improve UI signal ergonomics based on live feedback (label density, color contrast).
- [ ] Define desktop terminal integration path for abstracted signals.


