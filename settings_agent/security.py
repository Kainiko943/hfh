from __future__ import annotations

import re
from hashlib import pbkdf2_hmac
from os import urandom

_KEY_PATTERN = re.compile(r"\b(?:sk|rk|or)-[A-Za-z0-9_-]{10,}\b")


def contains_secret_like_text(text: str) -> bool:
    return bool(_KEY_PATTERN.search(text))


def hash_secret(secret: str) -> str:
    salt = urandom(16)
    digest = pbkdf2_hmac("sha256", secret.encode("utf-8"), salt, 120_000)
    return f"pbkdf2_sha256${salt.hex()}${digest.hex()}"


def redact_text(text: str) -> str:
    return _KEY_PATTERN.sub("[REDACTED_SECRET]", text)
