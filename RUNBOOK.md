# RUNBOOK

This repository currently ships a single TradingView Pine Script indicator (`sg`) for the Northstar Terminal signal surface.

## 1) Prerequisites

- TradingView account (free or paid).
- TradingView Pine Editor access from browser desktop.
- Pine Script version: `@version=6` (already declared in the script).

## 2) Repository layout

- `sg` — primary indicator source (Pine Script v6).
- `CONFIG.md` — configuration and input mapping.
- `.env.example` — placeholder environment template for future integrations.

## 3) Run (load indicator in TradingView)

### macOS / Linux / Windows (same workflow)

1. Open this repository locally and copy the full contents of `sg`.
2. Open TradingView in your browser.
3. Open **Pine Editor**.
4. Paste script content.
5. Click **Save** and then **Add to chart**.
6. Confirm the indicator appears as:
   - Name: `Final Boss • Struct+ATR (No HTF)`
   - Short title: `FB S+ATR`

## 4) Validation checklist

After adding to chart, verify:

- EMAs render when `Show EMAs` is enabled.
- Buy/Sell labels appear only when signal conditions are met.
- SL/TP lines appear when `Show SL/TP` is enabled.
- Alerts can be created for BUY/SELL/TP/SL conditions.

## 5) Safe defaults and trading controls

This script emits **signals only**. It does not place exchange orders.

Recommended safe operating baseline:

- Start on paper/simulated workflows only.
- Treat alerts as decision support, not auto-execution.
- Review risk inputs (`Max Stop (ATR)`, TP levels, trailing settings) before any live deployment.

## 6) Troubleshooting

- If the script fails to compile in TradingView, ensure the first line remains `//@version=6`.
- If visuals are noisy, disable `Show Signals` and tune filters (`ADX`, `Volume`, `Anti-Chop`, `Score`).
- If no signals appear, lower `Min Score` and verify market regime (trend/chop filters can intentionally suppress entries).

## 7) Reproducibility notes

- Source of truth for logic: `sg` in this repository.
- Runtime engine: TradingView Pine Script v6.
- No external package manager or runtime dependency is required for the current scope.


## 8) Context and source of truth

- Review `CONTEXT.md` before making architecture or product-facing changes.
- Keep proprietary strategy logic abstracted and expose signal outputs only.


## 9) Mission Control MVP (local contract demo)

This repository now includes a lightweight Mission Control data-contract module for agent status, events, and system health.

- Run demo snapshot: `python3 -m mission_control.demo`
- Run tests: `python3 -m unittest discover -s tests -p 'test_*.py' -v`
- Details: `MISSION_CONTROL.md`

- Mission Control schema docs: `MISSION_CONTROL.md`
- Contract includes UI-required heartbeat/task-phase/system-health fields in read-only MVP mode.


## 10) Privileged Settings Agent (LLM config by prompt)

This repo includes a backend-only privileged settings workflow for safe LLM provider/model switching.

- Test suite: `python3 -m unittest discover -s tests -p 'test_*.py' -v`
- UI mock component: `ui/settings_command_bar.html`
- Python modules: `settings_agent/`

Key behavior:
- Two-phase commit: propose from text, then confirm with proposal ID.
- RBAC enforced server-side: only `ADMIN`/`OWNER` can confirm global changes.
- Command bar blocks key-like strings; secret updates only via secure API method.
