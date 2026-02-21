import unittest

from settings_agent.api import SettingsAPI
from settings_agent.models import Role, UserContext


class SettingsAgentTest(unittest.TestCase):
    def setUp(self) -> None:
        self.api = SettingsAPI()
        self.admin = UserContext(user_id="alice", role=Role.ADMIN)
        self.user = UserContext(user_id="bob", role=Role.USER)

    def test_parser_phrase_to_command_and_confirm(self) -> None:
        resp = self.api.post_propose_from_text(
            self.admin,
            "Switch to OpenRouter and set model to anthropic/claude-3.5-sonnet",
        )
        self.assertIn("proposal_id", resp)
        self.assertEqual(resp["parsed_command"]["intent"], "set_global_provider_model")
        confirm = self.api.post_confirm(self.admin, resp["proposal_id"])
        self.assertTrue(confirm["applied"])
        snap = self.api.debug_snapshot()
        self.assertEqual(snap["global_settings"]["provider"], "openrouter")
        self.assertEqual(snap["global_settings"]["model"], "anthropic/claude-3.5-sonnet")

    def test_non_admin_cannot_confirm_global_change(self) -> None:
        resp = self.api.post_propose_from_text(self.user, "set global model to openai/gpt-4.1-mini")
        self.assertIn("proposal_id", resp)
        confirm = self.api.post_confirm(self.user, resp["proposal_id"])
        self.assertFalse(confirm["applied"])

    def test_secret_detection_blocks_prompt(self) -> None:
        resp = self.api.post_propose_from_text(self.admin, "set key to sk-secretsecretsecret")
        self.assertIn("error", resp)
        self.assertIn("secure key field", resp["error"])

    def test_two_phase_commit_no_persist_before_confirm(self) -> None:
        before = self.api.debug_snapshot()["global_settings"]["model"]
        resp = self.api.post_propose_from_text(self.admin, "set global model to openai/gpt-4.1-mini")
        self.assertIn("proposal_id", resp)
        mid = self.api.debug_snapshot()["global_settings"]["model"]
        self.assertEqual(before, mid)
        self.api.post_confirm(self.admin, resp["proposal_id"])
        after = self.api.debug_snapshot()["global_settings"]["model"]
        self.assertEqual(after, "openai/gpt-4.1-mini")

    def test_audit_log_redacts_secrets(self) -> None:
        self.api.post_propose_from_text(self.admin, "set key to sk-verysecretvalue123456")
        events = self.api.get_audit(self.admin)["events"]
        flat = str(events)
        self.assertNotIn("sk-verysecretvalue123456", flat)

    def test_openrouter_models_endpoints(self) -> None:
        models_before = self.api.get_openrouter_models()
        self.assertEqual(models_before["provider"], "openrouter")
        refreshed = self.api.post_refresh_openrouter_models(self.admin)
        self.assertIn("models", refreshed)

    def test_secure_key_field(self) -> None:
        res1 = self.api.post_openrouter_secret(self.admin, "tiny", confirm=True)
        self.assertFalse(res1["updated"])
        res2 = self.api.post_openrouter_secret(self.admin, "supersecretkeyvalue", confirm=True)
        self.assertTrue(res2["updated"])
        self.assertTrue(res2["is_set"])


if __name__ == "__main__":
    unittest.main()
