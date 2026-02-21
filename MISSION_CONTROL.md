# Mission Control (MVP Contract for UI)

Mission Control provides a single-screen contract for SIGMA agent activity and system health, aligned to the Northstar Terminal UI spec.

## Scope
- Read-only MVP backend contract (single in-memory source for UI).
- Abstract summaries only; no proprietary strategy/alpha internals.
- Stub mode is explicit and uses `N/A` / `Not implemented` instead of fake metrics.

## UI-aligned contract

### Agent tile model (`AgentStatus`)
- `agent_id`
- `state`: `IDLE | RUNNING | WAITING | DEGRADED | ERROR`
- `current_task`
- `task_phase`: `STARTING | EXECUTING | FINALIZING | N/A`
- `last_update`
- `last_result`: `OK | WARN | FAIL`
- `message`
- `queue_depth`
- `heartbeat_alive`
- `heartbeat_state`: `HEALTHY | STALE | MISSING`
- `heartbeat_age_sec`
- `stub_mode`

### Event timeline model (`AgentEvent`)
- `ts`
- `agent_id`
- `type` (supports: `HEARTBEAT`, `TASK_START`, `TASK_DONE`, `RETRY`, `FEED_DOWN`, `RISK_HALT`, `SYSTEM`)
- `severity`: `INFO | WARN | ERROR`
- `summary` (abstracted)
- `correlation_id`

### System health strip (`SystemHealth`)
- Market data:
  - `market_data_feed`: `CONNECTED | RECONNECTING | DEGRADED | DOWN`
  - `market_data_source`
  - `market_data_last_update`
  - `market_data_last_error`
  - `market_data_next_retry`
- Execution:
  - `execution`: `PAPER | LIVE` (defaults to `PAPER`)
- Risk:
  - `risk_module`: `SAFE | WARNING | HALTED`
  - `risk_reason`
- Notifications (channel-level):
  - `notifications_discord.state`: `OK | DEGRADED | DOWN`
  - `notifications_telegram.state`: `OK | DEGRADED | DOWN`
- `stub_mode`

## Store behavior
- `MissionControlStore.snapshot()` returns a single payload:
  - `agent_status`
  - `events`
  - `system_health`
  - `meta`
- `MissionControlStore.list_events(...)` supports timeline filtering by:
  - severity
  - agent
  - text search
- Event buffer is bounded (`max_events`) for stable runtime behavior.

## Usage

```bash
python3 -m mission_control.demo
python3 -m unittest discover -s tests -p 'test_*.py' -v
```

## Files
- `mission_control/models.py` — enums + event/health schemas.
- `mission_control/store.py` — in-memory store, heartbeat freshness, filters.
- `mission_control/stub.py` — stub cards for SigmaX/Hermes/Chronos/Orion/Atlas RL/Vault Orchestrator.
- `mission_control/demo.py` — sample snapshot output.
- `tests/test_mission_control.py` — contract and filtering tests.
