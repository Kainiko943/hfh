from __future__ import annotations

from dataclasses import asdict
from typing import Dict

from .controller import SettingsController, ValidationError
from .models import AuditEvent, Role, UserContext
from .parser import ParseError, parse_prompt_to_command
from .security import contains_secret_like_text
from .store import InMemorySettingsStore


class ForbiddenError(PermissionError):
    pass


class SettingsAPI:
    def __init__(self, controller: SettingsController | None = None, store: InMemorySettingsStore | None = None) -> None:
        self.controller = controller or SettingsController()
        self.store = store or InMemorySettingsStore()

    def _ensure_admin(self, user: UserContext) -> None:
        if user.role not in {Role.ADMIN, Role.OWNER}:
            raise ForbiddenError("Admin/Owner role required")

    def post_propose_from_text(self, user: UserContext, text: str) -> Dict[str, object]:
        if contains_secret_like_text(text):
            self.store.add_audit(
                AuditEvent.now(
                    user_id=user.user_id,
                    action="propose_from_text",
                    command={"intent": "blocked_secret"},
                    diff_summary="Blocked secret-like input in command bar",
                    confirmed=False,
                    result="blocked",
                    error="For security, keys must be entered in the secure key field.",
                )
            )
            return {"error": "For security, keys must be entered in the secure key field."}

        try:
            parsed_command, diff_summary, requires_admin = parse_prompt_to_command(text)
        except ParseError as exc:
            self.store.add_audit(
                AuditEvent.now(
                    user_id=user.user_id,
                    action="propose_from_text",
                    command={"intent": "parse_error"},
                    diff_summary="Unable to parse settings command",
                    confirmed=False,
                    result="failed",
                    error=str(exc),
                )
            )
            return {"error": str(exc)}

        proposal = self.store.add_proposal(user.user_id, parsed_command, diff_summary, requires_admin)
        self.store.add_audit(
            AuditEvent.now(
                user_id=user.user_id,
                action="propose_from_text",
                command=parsed_command,
                diff_summary=diff_summary,
                confirmed=False,
                result="proposed",
            )
        )
        return {
            "proposal_id": proposal.proposal_id,
            "parsed_command": parsed_command,
            "diff_summary": diff_summary,
            "requires_admin": requires_admin,
        }

    def _apply_command(self, parsed_command: Dict[str, object]) -> str:
        intent = str(parsed_command.get("intent", ""))
        warning = ""
        if intent == "set_global_provider":
            self.controller.set_global_provider(str(parsed_command["provider"]))
        elif intent == "set_global_model":
            warning = self.controller.set_global_model(str(parsed_command["model"]))
        elif intent == "set_global_provider_model":
            self.controller.set_global_provider(str(parsed_command["provider"]))
            warning = self.controller.set_global_model(str(parsed_command["model"]))
        elif intent == "set_global_params":
            self.controller.set_global_params(dict(parsed_command["params"]))
        elif intent == "set_agent_override":
            warning = self.controller.set_agent_override(
                str(parsed_command["agent_id"]),
                {
                    "provider": parsed_command.get("provider"),
                    "model": parsed_command.get("model"),
                    "params": parsed_command.get("params", {}),
                },
            )
        elif intent == "test_connection":
            self.controller.test_connection(str(parsed_command.get("scope", "global")))
        elif intent == "refresh_models":
            self.controller.refresh_models(str(parsed_command.get("provider", "openrouter")))
        else:
            raise ValidationError("Unsupported intent")
        return warning

    def post_confirm(self, user: UserContext, proposal_id: str) -> Dict[str, object]:
        proposal = self.store.get_proposal(proposal_id)
        if not proposal:
            return {"applied": False, "message": "Proposal missing or expired"}

        if proposal.requires_admin:
            try:
                self._ensure_admin(user)
            except ForbiddenError as exc:
                self.store.add_audit(
                    AuditEvent.now(
                        user_id=user.user_id,
                        action="confirm",
                        command=proposal.parsed_command,
                        diff_summary=proposal.diff_summary,
                        confirmed=False,
                        result="denied",
                        error=str(exc),
                    )
                )
                return {"applied": False, "message": str(exc)}

        try:
            warning = self._apply_command(proposal.parsed_command)
        except (ValidationError, KeyError, ValueError) as exc:
            self.store.add_audit(
                AuditEvent.now(
                    user_id=user.user_id,
                    action="confirm",
                    command=proposal.parsed_command,
                    diff_summary=proposal.diff_summary,
                    confirmed=True,
                    result="failed",
                    error=str(exc),
                )
            )
            return {"applied": False, "message": str(exc)}

        proposal.confirmed = True
        self.store.add_audit(
            AuditEvent.now(
                user_id=user.user_id,
                action="confirm",
                command=proposal.parsed_command,
                diff_summary=proposal.diff_summary,
                confirmed=True,
                result="applied",
                error=warning,
            )
        )
        message = "Settings updated"
        if warning:
            message = f"{message} ({warning})"
        return {"applied": True, "message": message}

    def get_audit(self, user: UserContext) -> Dict[str, object]:
        self._ensure_admin(user)
        return {"events": self.store.list_audit()}

    def get_openrouter_models(self) -> Dict[str, object]:
        return self.controller.get_openrouter_models()

    def post_refresh_openrouter_models(self, user: UserContext) -> Dict[str, object]:
        self._ensure_admin(user)
        models = self.controller.refresh_models("openrouter")
        return {"provider": "openrouter", "models": models}

    def post_openrouter_secret(self, user: UserContext, secret: str, confirm: bool) -> Dict[str, object]:
        self._ensure_admin(user)
        if not confirm:
            return {"updated": False, "message": "Confirmation required", "is_set": self.store.openrouter_secret_is_set()}
        if len(secret) < 12:
            return {"updated": False, "message": "Secret too short", "is_set": self.store.openrouter_secret_is_set()}
        self.store.set_openrouter_secret(secret)
        self.store.add_audit(
            AuditEvent.now(
                user_id=user.user_id,
                action="set_secret",
                command={"intent": "set_secret", "provider": "openrouter"},
                diff_summary="Updated OpenRouter secret via secure field",
                confirmed=True,
                result="applied",
            )
        )
        return {"updated": True, "message": "Secret updated", "is_set": True}

    def debug_snapshot(self) -> Dict[str, object]:
        return {
            "global_settings": asdict(self.controller.global_settings),
            "agent_overrides": self.controller.agent_overrides,
            "openrouter_secret_is_set": self.store.openrouter_secret_is_set(),
        }
