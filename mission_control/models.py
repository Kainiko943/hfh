from __future__ import annotations

from dataclasses import asdict, dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Any, Dict


class AgentState(str, Enum):
    IDLE = "IDLE"
    RUNNING = "RUNNING"
    WAITING = "WAITING"
    DEGRADED = "DEGRADED"
    ERROR = "ERROR"


class AgentResult(str, Enum):
    OK = "OK"
    WARN = "WARN"
    FAIL = "FAIL"


class Severity(str, Enum):
    INFO = "INFO"
    WARN = "WARN"
    ERROR = "ERROR"


class EventType(str, Enum):
    HEARTBEAT = "HEARTBEAT"
    TASK_START = "TASK_START"
    TASK_DONE = "TASK_DONE"
    RETRY = "RETRY"
    FEED_DOWN = "FEED_DOWN"
    RISK_HALT = "RISK_HALT"
    SYSTEM = "SYSTEM"


class TaskPhase(str, Enum):
    STARTING = "STARTING"
    EXECUTING = "EXECUTING"
    FINALIZING = "FINALIZING"
    NA = "N/A"


class HeartbeatState(str, Enum):
    HEALTHY = "HEALTHY"
    STALE = "STALE"
    MISSING = "MISSING"


class FeedState(str, Enum):
    CONNECTED = "CONNECTED"
    RECONNECTING = "RECONNECTING"
    DEGRADED = "DEGRADED"
    DOWN = "DOWN"


class NotificationState(str, Enum):
    OK = "OK"
    DEGRADED = "DEGRADED"
    DOWN = "DOWN"


class RiskState(str, Enum):
    SAFE = "SAFE"
    WARNING = "WARNING"
    HALTED = "HALTED"


class ExecutionState(str, Enum):
    PAPER = "PAPER"
    LIVE = "LIVE"


@dataclass
class AgentEvent:
    ts: str
    agent_id: str
    type: str
    severity: Severity
    summary: str
    correlation_id: str = ""

    @staticmethod
    def now(
        agent_id: str,
        event_type: str,
        severity: Severity,
        summary: str,
        correlation_id: str = "",
    ) -> "AgentEvent":
        return AgentEvent(
            ts=datetime.now(tz=timezone.utc).isoformat(),
            agent_id=agent_id,
            type=event_type,
            severity=severity,
            summary=summary,
            correlation_id=correlation_id,
        )

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["severity"] = self.severity.value
        return data


@dataclass
class ChannelHealth:
    state: NotificationState
    last_update: str = ""
    last_error: str = "N/A"

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["state"] = self.state.value
        return data


@dataclass
class SystemHealth:
    market_data_feed: FeedState = FeedState.DOWN
    market_data_source: str = "N/A"
    market_data_last_update: str = ""
    market_data_last_error: str = "N/A"
    market_data_next_retry: str = "N/A"
    execution: ExecutionState = ExecutionState.PAPER
    risk_module: RiskState = RiskState.SAFE
    risk_reason: str = "N/A"
    notifications_discord: ChannelHealth = field(default_factory=lambda: ChannelHealth(state=NotificationState.DEGRADED))
    notifications_telegram: ChannelHealth = field(default_factory=lambda: ChannelHealth(state=NotificationState.DEGRADED))
    stub_mode: bool = True

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["market_data_feed"] = self.market_data_feed.value
        data["execution"] = self.execution.value
        data["risk_module"] = self.risk_module.value
        data["notifications_discord"] = self.notifications_discord.to_dict()
        data["notifications_telegram"] = self.notifications_telegram.to_dict()
        return data
