from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from .models import AgentEvent, AgentResult, AgentState, HeartbeatState, Severity, SystemHealth, TaskPhase


@dataclass
class AgentStatus:
    agent_id: str
    state: AgentState = AgentState.IDLE
    current_task: str = "N/A"
    task_phase: TaskPhase = TaskPhase.NA
    last_update: str = ""
    last_result: AgentResult = AgentResult.OK
    message: str = "Not implemented"
    queue_depth: int = 0
    heartbeat_alive: bool = False
    heartbeat_state: HeartbeatState = HeartbeatState.MISSING
    heartbeat_age_sec: int = -1
    stub_mode: bool = True

    def heartbeat(self) -> None:
        self.last_update = datetime.now(tz=timezone.utc).isoformat()
        self.heartbeat_alive = True
        self.heartbeat_state = HeartbeatState.HEALTHY
        self.heartbeat_age_sec = 0

    def refresh_heartbeat_state(self, stale_after_seconds: int = 15, missing_after_seconds: int = 60) -> None:
        if not self.last_update:
            self.heartbeat_alive = False
            self.heartbeat_state = HeartbeatState.MISSING
            self.heartbeat_age_sec = -1
            return

        now = datetime.now(tz=timezone.utc)
        updated = datetime.fromisoformat(self.last_update)
        age = max(0, int((now - updated).total_seconds()))
        self.heartbeat_age_sec = age
        if age >= missing_after_seconds:
            self.heartbeat_alive = False
            self.heartbeat_state = HeartbeatState.MISSING
        elif age >= stale_after_seconds:
            self.heartbeat_alive = True
            self.heartbeat_state = HeartbeatState.STALE
        else:
            self.heartbeat_alive = True
            self.heartbeat_state = HeartbeatState.HEALTHY

    def to_dict(self) -> Dict[str, Any]:
        data = asdict(self)
        data["state"] = self.state.value
        data["task_phase"] = self.task_phase.value
        data["last_result"] = self.last_result.value
        data["heartbeat_state"] = self.heartbeat_state.value
        return data


class MissionControlStore:
    def __init__(self, max_events: int = 2000) -> None:
        self._agents: Dict[str, AgentStatus] = {}
        self._events: List[AgentEvent] = []
        self._system_health = SystemHealth()
        self._max_events = max_events

    def upsert_agent_status(self, status: AgentStatus) -> None:
        status.heartbeat()
        self._agents[status.agent_id] = status

    def append_event(self, event: AgentEvent) -> None:
        self._events.append(event)
        if len(self._events) > self._max_events:
            self._events = self._events[-self._max_events :]

    def set_system_health(self, health: SystemHealth) -> None:
        self._system_health = health

    def list_events(
        self,
        severity: Optional[Severity] = None,
        agent_id: Optional[str] = None,
        text: str = "",
        limit: int = 200,
    ) -> List[Dict[str, Any]]:
        events_desc = sorted(self._events, key=lambda e: e.ts, reverse=True)
        filtered: List[AgentEvent] = []
        text_q = text.lower().strip()
        for event in events_desc:
            if severity is not None and event.severity != severity:
                continue
            if agent_id and event.agent_id != agent_id:
                continue
            if text_q and text_q not in f"{event.type} {event.summary}".lower():
                continue
            filtered.append(event)
            if len(filtered) >= limit:
                break
        return [event.to_dict() for event in filtered]

    def snapshot(self) -> Dict[str, Any]:
        statuses = []
        for agent in self._agents.values():
            agent.refresh_heartbeat_state()
            statuses.append(agent.to_dict())
        return {
            "agent_status": statuses,
            "events": self.list_events(),
            "system_health": self._system_health.to_dict(),
            "meta": {
                "max_events": self._max_events,
                "generated_at": datetime.now(tz=timezone.utc).isoformat(),
            },
        }
