"""router.py - multi-provider LLM client with failover and key rotation.

Two wire formats:
  * "openai"    - OpenAI-compatible /chat/completions (Groq, OpenRouter, Google AI Studio, Ollama)
  * "anthropic" - Anthropic Messages API, POST {base_url}/v1/messages

Entries are tried in order. On HTTP 429 / 5xx / 529 / network errors the router rotates to the
next usable entry; the failed entry sits out for Retry-After (when the server sends it) or a default
cooldown. Bad keys (401/403) and unknown model/URL (404) are benched for an hour.
"""
import json
import time

import requests

ANTHROPIC_VERSION = "2023-06-01"
DEFAULT_MAX_TOKENS = 4096
MAX_RETRY_AFTER = 300.0

DEFAULT_PROVIDERS = [
    {"name": "groq", "base_url": "https://api.groq.com/openai/v1", "api_key": "", "model": "llama-3.3-70b-versatile"},
    {"name": "openrouter", "base_url": "https://openrouter.ai/api/v1", "api_key": "", "model": "meta-llama/llama-3.3-70b-instruct"},
    {"name": "google", "base_url": "https://generativelanguage.googleapis.com/v1beta/openai", "api_key": "", "model": "gemini-2.0-flash"},
    {"name": "claude", "base_url": "https://api.anthropic.com", "api_key": "", "model": "claude-sonnet-5-5",
     "api_type": "anthropic"},
    {"name": "ollama", "base_url": "http://127.0.0.1:11434/v1", "api_key": "", "model": "llama3.1", "keyless": True},
]


class RouterError(Exception):
    pass


def _is_anthropic(p):
    return p.get("api_type") == "anthropic"


def _snippet(resp):
    text = getattr(resp, "text", "") or ""
    return text.strip().replace("\n", " ")[:200]


def _retry_after(resp):
    headers = getattr(resp, "headers", None) or {}
    raw = headers.get("retry-after") or headers.get("Retry-After")
    try:
        return max(0.0, min(float(raw), MAX_RETRY_AFTER))
    except (TypeError, ValueError):
        return None


class Router:
    def __init__(self, providers=None, timeout=60, cooldown=30.0, max_attempts=None):
        self.providers = [dict(p) for p in (providers or DEFAULT_PROVIDERS)]
        self.timeout = timeout
        self.cooldown = cooldown  # default seconds a rate-limited entry is skipped
        self.max_attempts = max_attempts or max(len(self.providers) * 2, 1)
        self.index = 0
        self._cooling = {}  # index -> resume time
        self.last_provider = None
        self.last_entry = None

    # ----- configuration -----

    def add_provider(self, name, base_url, api_key, model, api_type="openai", keyless=False):
        entry = {"name": name, "base_url": base_url, "api_key": api_key, "model": model, "api_type": api_type}
        if keyless:
            entry["keyless"] = True
        self.providers.append(entry)

    def load_json(self, text):
        self.providers = json.loads(text)
        self.index = 0
        self._cooling.clear()

    def _usable(self, i):
        p = self.providers[i]
        if not p.get("api_key") and not p.get("keyless"):
            return False  # unconfigured entry
        return self._cooling.get(i, 0) <= time.time()

    def _rotate(self):
        n = len(self.providers)
        for step in range(1, n + 1):
            cand = (self.index + step) % n
            if self._usable(cand):
                self.index = cand
                return True
        return False

    def _bench(self, seconds):
        self._cooling[self.index] = time.time() + seconds

    # ----- request building / parsing -----

    @staticmethod
    def _build(p, messages, json_mode, temperature, tools, extra):
        extra = dict(extra)
        headers = {"Content-Type": "application/json"}
        if _is_anthropic(p):
            system = "\n\n".join(m["content"] for m in messages if m.get("role") == "system")
            rest = [m for m in messages if m.get("role") != "system"]
            if json_mode:
                system = (system + "\n\n" if system else "") + "Respond with a single JSON object and nothing else."
            payload = {"model": p["model"], "max_tokens": extra.pop("max_tokens", DEFAULT_MAX_TOKENS),
                       "messages": rest}
            if system:
                payload["system"] = system
            payload.update(extra)  # temperature is deliberately not sent: newer models may restrict it
            headers["x-api-key"] = p.get("api_key", "")
            headers["anthropic-version"] = ANTHROPIC_VERSION
            url = p["base_url"].rstrip("/") + "/v1/messages"
        else:
            payload = {"model": p["model"], "messages": messages, "temperature": temperature}
            if json_mode:
                payload["response_format"] = {"type": "json_object"}
            if tools:
                payload["tools"] = tools
            payload.update(extra)
            if p.get("api_key"):
                headers["Authorization"] = "Bearer " + p["api_key"]
            url = p["base_url"].rstrip("/") + "/chat/completions"
        return url, headers, payload

    @staticmethod
    def extract_text(p, data):
        if _is_anthropic(p):
            return "".join(b.get("text", "") for b in data.get("content", []) if b.get("type") == "text")
        return data["choices"][0]["message"].get("content") or ""

    # ----- calling -----

    def chat(self, messages, json_mode=False, tools=None, temperature=0.2, **extra):
        """Return the raw response dict from the first provider that succeeds."""
        if not self.providers:
            raise RouterError("no providers configured")
        if not self._usable(self.index) and not self._rotate():
            raise RouterError("no usable providers (missing keys or all cooling down)")

        last_err = None
        use_json = json_mode
        for _ in range(self.max_attempts):
            p = self.providers[self.index]
            name = p.get("name")
            url, headers, payload = self._build(p, messages, use_json, temperature, tools, extra)
            try:
                r = requests.post(url, headers=headers, json=payload, timeout=self.timeout)
            except (requests.RequestException, ValueError) as exc:
                last_err = "%s %s: %s" % (name, type(exc).__name__, exc)
                self._bench(5)
                if not self._rotate():
                    break
                continue

            code = r.status_code
            if code == 400 and use_json and not _is_anthropic(p):
                use_json = False  # model rejected response_format; retry same entry without it
                continue
            if code == 429 or code >= 500:  # includes Anthropic 529 overloaded
                last_err = "%s HTTP %d %s" % (name, code, _snippet(r))
                self._bench(_retry_after(r) or self.cooldown)
            elif code in (401, 403):
                last_err = "%s auth error %d %s" % (name, code, _snippet(r))
                self._bench(3600)
            elif code == 404:
                last_err = "%s not found (check model name / URL) %s" % (name, _snippet(r))
                self._bench(3600)
            elif code >= 400:
                last_err = "%s HTTP %d %s" % (name, code, _snippet(r))
                self._bench(5)
            else:
                try:
                    data = r.json()
                except ValueError as exc:
                    last_err = "%s returned invalid JSON: %s" % (name, exc)
                    self._bench(5)
                    data = None
                if data is not None:
                    self.last_provider = name
                    self.last_entry = p
                    return data
            if not self._rotate():
                break
        raise RouterError("all providers failed; last error: %s" % last_err)

    def complete(self, messages, **kw):
        """Return just the assistant text."""
        data = self.chat(messages, **kw)
        return self.extract_text(self.last_entry, data)

    def complete_json(self, messages, **kw):
        """Return a parsed JSON object from the model."""
        text = self.complete(messages, json_mode=True, **kw)
        return parse_json_loose(text)


def parse_json_loose(text):
    """Parse JSON, tolerating code fences or leading/trailing prose."""
    text = text.strip()
    if text.startswith("```"):
        text = text.strip("`")
        if text.lower().startswith("json"):
            text = text[4:]
    try:
        return json.loads(text)
    except ValueError:
        start, end = text.find("{"), text.rfind("}")
        if start != -1 and end > start:
            return json.loads(text[start:end + 1])
        raise
