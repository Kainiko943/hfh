from __future__ import annotations

from dataclasses import asdict
from datetime import datetime, timedelta, timezone
from typing import Dict, List, Optional
from uuid import uuid4

from .models import AuditEvent, Proposal
from .security import hash_secret, redact_text


class InMemorySettingsStore:
    def __init__(self) -> None:
        self.proposals: Dict[str, Proposal] = {}
        self.audit_events: List[AuditEvent] = []
        self._openrouter_secret_hash: str = ""

    def add_proposal(self, user_id: str, parsed_command: Dict[str, object], diff_summary: str, requires_admin: bool) -> Proposal:
        now = datetime.now(tz=timezone.utc)
        proposal = Proposal(
            proposal_id=str(uuid4()),
            user_id=user_id,
            parsed_command=parsed_command,
            diff_summary=diff_summary,
            requires_admin=requires_admin,
            created_at=now,
            expires_at=now + timedelta(minutes=5),
        )
        self.proposals[proposal.proposal_id] = proposal
        return proposal

    def get_proposal(self, proposal_id: str) -> Optional[Proposal]:
        proposal = self.proposals.get(proposal_id)
        if not proposal:
            return None
        if proposal.expires_at < datetime.now(tz=timezone.utc):
            return None
        return proposal

    def add_audit(self, event: AuditEvent) -> None:
        event.error = redact_text(event.error)
        event.diff_summary = redact_text(event.diff_summary)
        self.audit_events.append(event)

    def list_audit(self) -> List[Dict[str, object]]:
        return [asdict(a) for a in sorted(self.audit_events, key=lambda x: x.ts, reverse=True)]

    def set_openrouter_secret(self, secret: str) -> None:
        self._openrouter_secret_hash = hash_secret(secret)

    def openrouter_secret_is_set(self) -> bool:
        return bool(self._openrouter_secret_hash)
