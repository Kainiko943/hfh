from .models import AgentResult, AgentState, TaskPhase
from .store import AgentStatus, MissionControlStore


def build_stub_store() -> MissionControlStore:
    store = MissionControlStore()
    for agent_id in ["SigmaX", "Hermes", "Chronos", "Orion", "Atlas RL", "Vault Orchestrator"]:
        store.upsert_agent_status(
            AgentStatus(
                agent_id=agent_id,
                state=AgentState.IDLE,
                current_task="N/A",
                task_phase=TaskPhase.NA,
                last_result=AgentResult.WARN,
                message="Not implemented (stub mode)",
                queue_depth=0,
                heartbeat_alive=False,
                stub_mode=True,
            )
        )
    return store
