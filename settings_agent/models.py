from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone
from enum import Enum
from typing import Dict, Optional


class Role(str, Enum):
    OWNER = "OWNER"
    ADMIN = "ADMIN"
    USER = "USER"


class Provider(str, Enum):
    OPENROUTER = "openrouter"


@dataclass
class UserContext:
    user_id: str
    role: Role


@dataclass
class LLMParams:
    temperature: Optional[float] = None
    max_tokens: Optional[int] = None
    top_p: Optional[float] = None
    timeout: Optional[int] = None
    retries: Optional[int] = None


@dataclass
class AgentOverride:
    provider: Optional[str] = None
    model: Optional[str] = None
    params: Dict[str, object] = field(default_factory=dict)


@dataclass
class GlobalSettings:
    provider: str = Provider.OPENROUTER.value
    model: str = "anthropic/claude-3.5-sonnet"
    params: Dict[str, object] = field(default_factory=lambda: {
        "temperature": 0.2,
        "max_tokens": 1024,
        "top_p": 1.0,
        "timeout": 30,
        "retries": 2,
    })


@dataclass
class Proposal:
    proposal_id: str
    user_id: str
    parsed_command: Dict[str, object]
    diff_summary: str
    requires_admin: bool
    created_at: datetime
    expires_at: datetime
    confirmed: bool = False


@dataclass
class AuditEvent:
    ts: str
    user_id: str
    action: str
    command: Dict[str, object]
    diff_summary: str
    confirmed: bool
    result: str
    error: str = ""

    @staticmethod
    def now(
        user_id: str,
        action: str,
        command: Dict[str, object],
        diff_summary: str,
        confirmed: bool,
        result: str,
        error: str = "",
    ) -> "AuditEvent":
        return AuditEvent(
            ts=datetime.now(tz=timezone.utc).isoformat(),
            user_id=user_id,
            action=action,
            command=command,
            diff_summary=diff_summary,
            confirmed=confirmed,
            result=result,
            error=error,
        )
