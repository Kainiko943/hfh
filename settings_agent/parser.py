from __future__ import annotations

import re
from typing import Dict, Tuple

from .security import contains_secret_like_text


class ParseError(ValueError):
    pass


def parse_prompt_to_command(text: str) -> Tuple[Dict[str, object], str, bool]:
    lowered = text.strip().lower()
    if not lowered:
        raise ParseError("Command text is empty")
    if contains_secret_like_text(text):
        raise ParseError("For security, keys must be entered in the secure key field.")

    if "refresh" in lowered and "model" in lowered:
        return ({"intent": "refresh_models", "provider": "openrouter"}, "Refresh OpenRouter models list", True)

    if "test connection" in lowered:
        scope = "agent" if "agent" in lowered else "global"
        return ({"intent": "test_connection", "scope": scope}, f"Test {scope} LLM connection", True)

    m = re.search(r"set\s+(?P<agent>[a-z0-9 _-]+)\s+to\s+use\s+openrouter\s+model\s+(?P<model>[a-z0-9./:_-]+)", lowered)
    if m:
        agent_id = m.group("agent").strip().replace(" ", "_")
        model = m.group("model").strip()
        return (
            {"intent": "set_agent_override", "agent_id": agent_id, "provider": "openrouter", "model": model},
            f"Set agent override: {agent_id} -> openrouter/{model}",
            True,
        )

    m = re.search(r"set\s+global\s+model\s+to\s+(?P<model>[a-z0-9./:_-]+)", lowered)
    if m:
        model = m.group("model").strip()
        return ({"intent": "set_global_model", "model": model}, f"Change global model to {model}", True)

    if "switch to openrouter" in lowered or "set global provider" in lowered:
        model_match = re.search(r"model\s+to\s+([a-z0-9./:_-]+)", lowered)
        if model_match:
            model = model_match.group(1)
            return (
                {"intent": "set_global_provider_model", "provider": "openrouter", "model": model},
                f"Change global provider to openrouter and model to {model}",
                True,
            )
        return ({"intent": "set_global_provider", "provider": "openrouter"}, "Change global provider to openrouter", True)

    param_patterns = {
        "temperature": r"temperature\s*(?:to|=)?\s*([0-9]*\.?[0-9]+)",
        "max_tokens": r"max[_ ]tokens\s*(?:to|=)?\s*([0-9]+)",
        "top_p": r"top[_ ]p\s*(?:to|=)?\s*([0-9]*\.?[0-9]+)",
        "timeout": r"timeout\s*(?:to|=)?\s*([0-9]+)",
        "retries": r"retries\s*(?:to|=)?\s*([0-9]+)",
    }
    params = {}
    for key, pattern in param_patterns.items():
        mm = re.search(pattern, lowered)
        if mm:
            value = mm.group(1)
            params[key] = float(value) if key in {"temperature", "top_p"} else int(value)
    if params and ("global" in lowered or "set" in lowered):
        return ({"intent": "set_global_params", "params": params}, f"Change global params: {params}", True)

    raise ParseError("Unsupported settings command. Use approved settings intents only.")
