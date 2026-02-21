# CONTEXT.md — Prior Chat Context (SIGMA / Northstar Terminal)

## 1) Identity & Branding
- Brand/company name: **Northstar Labs**
- Product name: **Northstar Terminal**
- Core system name: **SIGMA** (private, modular, multi-agent AI trading intelligence system)
- Goal: professional “hedge-fund-level” trading intelligence + signal terminal, with strong **risk controls** and **edge security**.

## 2) SIGMA System Vision (High-level)
SIGMA is described as a modular multi-agent stack:
- **Signal Engine**: generates abstracted signals (not raw proprietary logic)
- **Execution Engine / Router**: routes orders to exchanges/brokers (gated, safe by default)
- **Risk / Controls**: strict drawdown and sizing controls, circuit breakers
- **Agents referenced**:
  - **SigmaX**: orchestration / coordinator
  - **Hermes**: execution router / order ops
  - **HermesGEN**: content/gen tasks (adjacent helper)
  - **Chronos**: risk control + timing constraints
  - **Orion**: regime detection / market structure / context
  - **Atlas RL**: reinforcement learning component (future / optional)
  - **Vault Orchestrator / DNA-Vault**: strategy lineage, versioning, edge protection
- Comms: Discord/Telegram signals, exposing only **abstracted outputs**.

## 3) Crypto Screener / Terminal UI Requirements (Major thread)
A large portion of the project work focused on a live crypto trend screener + terminal UI:
- Wants a **high-budget, professional** look (like a top exchange).
- Layout preference:
  - Title aligned **top-left**
  - Search bar **top-right**
  - Screener directly under title
- Wants **dark mode** and polished spacing + typography.
- Wants “constant” professional ticker/news-style animation showing:
  - Pair + price (+ daily % change)
  - Green for up, red for down
  - Smooth continuous motion
- Wants lots of “attention-grabbing” live feedback:
  - Highlight flashes when price moves (thresholds like 0.01%/0.1% were discussed)
  - Outline/highlight whole row/column on movement
- Ranking:
  - List crypto pairs by **market cap**, largest to smallest (eventually top 50 USDT pairs)
  - Remove deprecated/unwanted tickers (e.g., VENUSDT, PAXUSDT, BCHABCUSDT, BCCUSDT, BCHSVUSDT, WAVESUSDT, BTTUSDT, USDSUSDT, XMRUSDT, NANOUSDT, OMGUSDT, MITHUSDT, etc.)
- Data source:
  - Live updates via Binance WebSocket endpoint like `!miniTicker@arr` for many symbols
  - Prefer updating only prices (not full table refresh)
- Trend logic evolved:
  - Multiple MA/EMA-based variants were discussed:
    - 50 EMA trend basis (above = bullish variants; below = bearish variants)
    - Later, MA set of 50/80/200 with classification:
      - Bullish: above 50
      - Very Bullish: above 50 & 80
      - Bull: above 50 & 80 & 200
      - Bearish: below 50
      - Very Bearish: below 50 & 80
      - Bear: below 50 & 80 & 200
- Multi-timeframe categories discussed:
  - 15m, 1h, 4h, 24h trend labels
- “Grade” section concept:
  - Entry timing grade D→A (D dark red → A solid green)

## 4) Automation / Refresh / Performance
- User wanted frequent updates; at one point “auto-refresh every 0.2 seconds” was mentioned.
- Later refined: **avoid full-table refresh**, update live prices incrementally (WebSocket-driven).

## 5) Project Delivery Expectations
- User repeatedly wants “launch-ready”, “perfect”, “S-tier/God-mode” quality deliverables.
- Often requests full repo outputs, full folder contents, build steps, and compiled builds (.exe).
- Wants desktop first, then mobile later; voice interface ideas (Jarvis-like) mentioned.

## 6) Security, Edge Protection, and Safety Constraints
Non-negotiables emphasized across threads:
- Protect proprietary “edge”:
  - Do NOT expose raw strategy internals in logs, UI, or outbound messages.
  - Prefer abstracted signals/labels and modular interfaces.
- Strong secure communications stance:
  - Discord/Telegram signals should expose only abstracted outcomes.
- Avoid unsafe content:
  - The user asked for “phishing network / agent protocol” visuals; this is explicitly disallowed.
  - Any implementation should avoid enabling wrongdoing.

## 7) OpenClaw / Multi-model Orchestration Thread
- User explored using “OpenClaw” (and comparisons to Agent Zero) to orchestrate models that browse/use tools.
- User asked for an LLM to “assume Sigma’s role” and trade similarly; emphasis: spot + margin, trend-heavy, shorting allowed.
- System should remain safe-by-default (paper mode, explicit gates before live execution).

## 8) Other Project-adjacent Threads (Context Only)
- Sports betting card generator (daily picks, odds constraints).
- Various theology/philosophy debates (not core to repo).
- Misc current events/conspiracies (not relevant to codebase).

## 9) Codex Handoff Objective (What Codex must do)
Primary need: Codex must “inherit” prior chat context from files in repo:
- Read `AGENTS.md` + this `CONTEXT.md` before coding.
- Build/run/test instructions must be made explicit and reproducible.
- Fix only what is necessary to run cleanly (minimal diffs).
- Ensure no secrets are committed; provide `.env.example` + docs.
- End with P0/P1/P2 backlog for launch readiness.

## 10) P0 / P1 / P2 Priorities (Recommended)
P0 — Make repo runnable and documented:
- Identify stack + entrypoints + scripts
- Create `RUNBOOK.md` (Windows/macOS)
- Create `CONFIG.md` + `.env.example`
- Fix build/run failures minimally
- Add `.gitignore` and remove artifacts/secrets

P1 — Reliability:
- Central config loader + validation
- Logging + error handling
- Retry/backoff for network calls (HTTP/WebSocket)
- Basic health checks
- Tests for config + core modules

P2 — Product polish:
- UI performance (incremental updates)
- Improved error states and empty states
- Packaging/distribution pipeline (desktop first)

## 11) Non-negotiable Defaults
- SAFE by default: paper mode / no auto-exec unless explicitly enabled.
- Keep alpha logic abstracted; output signals/labels only.
- No secrets in repo; env-based config only.
- Minimal, high-confidence changes; avoid rewrites.
