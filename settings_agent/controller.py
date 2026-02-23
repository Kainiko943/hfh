from __future__ import annotations

import re
from datetime import datetime, timezone
from typing import Dict, List, Optional

from .models import GlobalSettings, Provider


class ValidationError(ValueError):
    pass


class SettingsController:
    ALLOWLIST = {
        "set_global_provider",
        "set_global_model",
        "set_global_params",
        "set_agent_override",
        "test_connection",
        "refresh_models",
    }

    def __init__(self) -> None:
        self.global_settings = GlobalSettings()
        self.agent_overrides: Dict[str, Dict[str, object]] = {}
        self.openrouter_models_cache: List[str] = [
            "anthropic/claude-3.5-sonnet",
            "openai/gpt-4.1-mini",
            "google/gemini-2.0-flash",
        ]
        self.cache_updated_at = datetime.now(tz=timezone.utc).isoformat()

    def _validate_provider(self, provider: str) -> None:
        if provider != Provider.OPENROUTER.value:
            raise ValidationError("Unsupported provider")

    def _validate_model(self, model: str) -> None:
        if not (3 <= len(model) <= 120):
            raise ValidationError("Invalid model length")
        if not re.fullmatch(r"[A-Za-z0-9._:/-]+", model):
            raise ValidationError("Invalid model charset")

    def _validate_params(self, params: Dict[str, object]) -> None:
        allowed = {"temperature", "max_tokens", "top_p", "timeout", "retries"}
        if any(k not in allowed for k in params.keys()):
            raise ValidationError("Unsupported params key")
        if "temperature" in params and not (0.0 <= float(params["temperature"]) <= 2.0):
            raise ValidationError("temperature out of range")
        if "max_tokens" in params and not (1 <= int(params["max_tokens"]) <= 32768):
            raise ValidationError("max_tokens out of range")
        if "top_p" in params and not (0.0 < float(params["top_p"]) <= 1.0):
            raise ValidationError("top_p out of range")
        if "timeout" in params and not (1 <= int(params["timeout"]) <= 600):
            raise ValidationError("timeout out of range")
        if "retries" in params and not (0 <= int(params["retries"]) <= 20):
            raise ValidationError("retries out of range")

    def set_global_provider(self, provider: str) -> None:
        self._validate_provider(provider)
        self.global_settings.provider = provider

    def set_global_model(self, model: str, manual_override: bool = True) -> str:
        self._validate_model(model)
        warning = ""
        if model not in self.openrouter_models_cache and not manual_override:
            raise ValidationError("Model not in OpenRouter cache")
        if model not in self.openrouter_models_cache:
            warning = "Model not in cache; applied via manual override"
        self.global_settings.model = model
        return warning

    def set_global_params(self, params: Dict[str, object]) -> None:
        self._validate_params(params)
        self.global_settings.params.update(params)

    def set_agent_override(self, agent_id: str, override: Dict[str, object]) -> str:
        if not re.fullmatch(r"[A-Za-z0-9_-]{2,50}", agent_id):
            raise ValidationError("Invalid agent_id")
        provider = override.get("provider")
        model = override.get("model")
        params = override.get("params", {})
        if provider is not None:
            self._validate_provider(str(provider))
        if model is not None:
            self._validate_model(str(model))
        self._validate_params(dict(params))
        record = self.agent_overrides.get(agent_id, {})
        if provider:
            record["provider"] = provider
        if model:
            record["model"] = model
        if params:
            record.setdefault("params", {}).update(params)
        self.agent_overrides[agent_id] = record
        return ""

    def test_connection(self, scope: str = "global") -> Dict[str, object]:
        if scope not in {"global", "agent"}:
            raise ValidationError("Invalid scope")
        return {"ok": True, "scope": scope, "provider": self.global_settings.provider}

    def refresh_models(self, provider: str = "openrouter") -> List[str]:
        self._validate_provider(provider)
        self.openrouter_models_cache = sorted(set(self.openrouter_models_cache + ["meta-llama/llama-3.1-70b-instruct"]))
        self.cache_updated_at = datetime.now(tz=timezone.utc).isoformat()
        return self.openrouter_models_cache

    def get_openrouter_models(self) -> Dict[str, object]:
        return {
            "provider": "openrouter",
            "base_url": "https://openrouter.ai/api/v1",
            "models": self.openrouter_models_cache,
            "cached_at": self.cache_updated_at,
        }
