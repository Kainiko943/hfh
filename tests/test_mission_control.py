import unittest

from mission_control.models import (
    AgentEvent,
    AgentResult,
    AgentState,
    ChannelHealth,
    EventType,
    ExecutionState,
    FeedState,
    NotificationState,
    RiskState,
    Severity,
    SystemHealth,
    TaskPhase,
)
from mission_control.store import AgentStatus, MissionControlStore


class MissionControlStoreTest(unittest.TestCase):
    def test_store_snapshot_contract(self) -> None:
        store = MissionControlStore(max_events=2)
        status = AgentStatus(
            agent_id="SigmaX",
            state=AgentState.RUNNING,
            current_task="Aggregate abstract signals",
            task_phase=TaskPhase.EXECUTING,
            last_result=AgentResult.OK,
            message="Healthy",
            queue_depth=1,
        )
        store.upsert_agent_status(status)
        store.set_system_health(
            SystemHealth(
                market_data_feed=FeedState.CONNECTED,
                market_data_source="Binance",
                execution=ExecutionState.PAPER,
                risk_module=RiskState.SAFE,
                notifications_discord=ChannelHealth(state=NotificationState.OK),
                notifications_telegram=ChannelHealth(state=NotificationState.DEGRADED),
            )
        )
        store.append_event(
            AgentEvent.now(
                agent_id="SigmaX",
                event_type=EventType.TASK_START.value,
                severity=Severity.INFO,
                summary="Task started (abstracted)",
                correlation_id="cid-1",
            )
        )
        store.append_event(
            AgentEvent.now(
                agent_id="SigmaX",
                event_type=EventType.TASK_DONE.value,
                severity=Severity.INFO,
                summary="Task finished (abstracted)",
                correlation_id="cid-1",
            )
        )
        store.append_event(
            AgentEvent.now(
                agent_id="Hermes",
                event_type=EventType.RETRY.value,
                severity=Severity.WARN,
                summary="Retry queued",
                correlation_id="cid-2",
            )
        )

        snap = store.snapshot()
        self.assertIn("agent_status", snap)
        self.assertIn("events", snap)
        self.assertIn("system_health", snap)
        self.assertIn("meta", snap)
        self.assertEqual(snap["agent_status"][0]["agent_id"], "SigmaX")
        self.assertEqual(snap["agent_status"][0]["task_phase"], "EXECUTING")
        self.assertIn(snap["agent_status"][0]["heartbeat_state"], ["HEALTHY", "STALE", "MISSING"])
        self.assertEqual(snap["system_health"]["market_data_feed"], "CONNECTED")
        self.assertEqual(snap["system_health"]["notifications_discord"]["state"], "OK")
        self.assertEqual(len(snap["events"]), 2)

    def test_event_filters(self) -> None:
        store = MissionControlStore()
        store.append_event(AgentEvent.now("SigmaX", EventType.SYSTEM.value, Severity.INFO, "all good"))
        store.append_event(AgentEvent.now("Hermes", EventType.RETRY.value, Severity.WARN, "retrying route"))

        warn_events = store.list_events(severity=Severity.WARN)
        self.assertEqual(len(warn_events), 1)
        self.assertEqual(warn_events[0]["agent_id"], "Hermes")

        sigma_events = store.list_events(agent_id="SigmaX")
        self.assertEqual(len(sigma_events), 1)

        search_events = store.list_events(text="route")
        self.assertEqual(len(search_events), 1)


if __name__ == "__main__":
    unittest.main()
