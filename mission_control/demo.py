from __future__ import annotations

import json

from mission_control.models import (
    AgentEvent,
    ChannelHealth,
    EventType,
    ExecutionState,
    FeedState,
    NotificationState,
    RiskState,
    Severity,
    SystemHealth,
)
from mission_control.stub import build_stub_store


def main() -> None:
    store = build_stub_store()
    store.set_system_health(
        SystemHealth(
            market_data_feed=FeedState.RECONNECTING,
            market_data_source="Binance",
            market_data_last_error="Transient websocket disconnect",
            market_data_next_retry="5s",
            execution=ExecutionState.PAPER,
            risk_module=RiskState.SAFE,
            risk_reason="Within limits",
            notifications_discord=ChannelHealth(state=NotificationState.OK),
            notifications_telegram=ChannelHealth(state=NotificationState.DEGRADED, last_error="Rate limited"),
            stub_mode=True,
        )
    )
    store.append_event(
        AgentEvent.now(
            agent_id="SigmaX",
            event_type=EventType.SYSTEM.value,
            severity=Severity.INFO,
            summary="Mission Control running in stub mode; abstract telemetry only.",
            correlation_id="boot-001",
        )
    )
    print(json.dumps(store.snapshot(), indent=2))


if __name__ == "__main__":
    main()
