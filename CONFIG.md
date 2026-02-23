# CONFIG

This project currently uses **TradingView inputs** (not runtime environment variables) as the canonical configuration surface.

## Input groups

### Core
- `Show Signals` (bool)
- `Show SL/TP` (bool)
- `Soft BG` (bool)

### Trend
- `EMA Fast` (int)
- `EMA Slow` (int)
- `Show EMAs` (bool)

### Structure
- `Pivot Length` (int)
- `BOS Micro Pivot Len` (int)
- `Require Sweep+Reclaim` (bool)
- `Require BOS` (bool)
- `Armed Valid (bars)` (int)
- `Entry Mode` (`BOS+Retest` or `Instant BOS`)
- `Retest Window (bars)` (int)
- `Retest Slack (ATR)` (float)

### Filters
- `Use ADX` (bool)
- `ADX Length` (int)
- `ADX Threshold` (float)
- `RSI Length` (int)
- `RSI Bull` (float)
- `RSI Bear` (float)
- `Require Volume Confirm` (bool)
- `Volume SMA Len` (int)
- `Volume Mult` (float)
- `Anti-Chop (BB width + EMA slope)` (bool)
- `BB Length` (int)
- `BB Mult` (float)
- `Min BB Width %` (float)
- `EMA Slow Slope Lookback` (int)
- `Min EMA Slope %` (float)

### Score
- `Enable Score Filter` (bool)
- `Min Score` (int)
- `Show Grade` (bool)
- `W: Trend` (float)
- `W: ADX` (float)
- `W: RSI` (float)
- `W: Volume` (float)
- `W: ChopOK` (float)

### Risk (Struct+ATR)
- `ATR Length` (int)
- `ATR Buffer` (float)
- `Max Stop (ATR)` (float)
- `TP1 (R)` (float)
- `TP2 (R)` (float)
- `Trail After TP1` (bool)
- `BE+Fees (%)` (float)
- `Trail ATR Mult` (float)
- `Extend Lines (bars)` (int)
- `Mark SL/TP Hits` (bool)

## Environment variables

No environment variables are required for the current Pine Script-only setup.

Future integrations should use `.env` (local only) and update `.env.example` without committing secrets.


## Mission Control (MVP module)

The Mission Control MVP module is in-memory by default and requires no env vars. Optional future env knobs:

- `MISSION_CONTROL_STUB_MODE` (`true|false`)
- `MISSION_CONTROL_MAX_EVENTS` (int, for bounded logs if persistence is added)
- `MISSION_CONTROL_LIVE_GATE` (`false` default; when true, execution strip can display LIVE if explicitly set)


Current implementation notes:
- Event timeline supports severity/agent/text filters via store API.
- Channel-level notification states are modeled separately for Discord/Telegram.
- Default execution health is `PAPER`; no live toggle is implemented in this repo.


## Privileged Settings Agent

### Supported intents (allowlist)
- `set_global_provider`
- `set_global_model`
- `set_global_params`
- `set_agent_override`
- `test_connection`
- `refresh_models`

### OpenRouter defaults
- Provider: `openrouter`
- Base URL: `https://openrouter.ai/api/v1`

### API-style methods (backend contract)
- `POST /api/settings/propose-from-text`
- `POST /api/settings/confirm`
- `GET /api/settings/audit`
- `GET /api/llm/openrouter/models`
- `POST /api/llm/openrouter/models/refresh`
- `POST /api/llm/secret/openrouter`
