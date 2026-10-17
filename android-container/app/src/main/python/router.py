"""
Multi-Provider API Client & Failover Router
Handles key rotation, encrypted keystore retrieval, and automatic failover across:
1. Anthropic (Claude 3.7 Sonnet, Claude 3.5 Haiku)
2. Google AI Studio (Gemini 2.5 Flash, Gemini 2.5 Pro)
3. Grok (xAI Grok-2 / Groq Cloud)
4. Hugging Face (DeepSeek-R1, Qwen 2.5 Coder)

Includes structured Tagged Communication Protocol for organized query dispatch and logging.
"""

import json
import logging
import os
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
import urllib.request
import urllib.error

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MultiProviderRouter")

# Check if running inside Chaquopy Android container
CHAQUOPY_AVAILABLE = False
try:
    from com.selfevolving.container import EncryptedKeyManager  # type: ignore
    CHAQUOPY_AVAILABLE = True
    logger.info("Chaquopy environment detected: Hardware-backed EncryptedKeyManager linked.")
except Exception:
    CHAQUOPY_AVAILABLE = False
    logger.info("Standalone/Host environment detected: Falling back to environment variables.")


class ProviderConfig:
    def __init__(
        self,
        provider_type: str,
        name: str,
        base_url: str,
        api_key: str,
        model_name: str,
        protocol: str = "openai",  # 'openai' or 'anthropic'
        timeout: int = 30
    ):
        self.provider_type = provider_type.upper()  # ANTHROPIC, GEMINI, GROK, HUGGINGFACE
        self.name = name
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self.model_name = model_name
        self.protocol = protocol
        self.timeout = timeout
        self.failure_count = 0
        self.rate_limited_until = 0.0

    def is_available(self) -> bool:
        return time.time() >= self.rate_limited_until

    def mark_rate_limited(self, cooldown_seconds: float = 60.0):
        self.rate_limited_until = time.time() + cooldown_seconds
        self.failure_count += 1
        logger.warning(f"Provider '{self.name}' marked RATE_LIMITED for {cooldown_seconds}s (failures: {self.failure_count})")

    def get_effective_key(self) -> str:
        """Retrieves decrypted key from Android EncryptedKeyManager if available."""
        if CHAQUOPY_AVAILABLE:
            try:
                decrypted = EncryptedKeyManager.getDecryptedKey(self.provider_type)
                if decrypted and decrypted.strip():
                    return decrypted.strip()
            except Exception as e:
                logger.error(f"Failed to read from EncryptedKeyManager for {self.provider_type}: {e}")
        
        # Fallback to env or pre-configured key
        env_key = os.environ.get(f"{self.provider_type}_API_KEY")
        if env_key:
            return env_key
        return self.api_key


class TaggedCommunicationRecord:
    def __init__(
        self,
        query_id: str,
        provider: str,
        model: str,
        tags: List[str],
        prompt_snippet: str,
        response_content: str,
        structured_data: Optional[Dict[str, Any]],
        latency_ms: float,
        timestamp: float
    ):
        self.query_id = query_id
        self.provider = provider
        self.model = model
        self.tags = tags
        self.prompt_snippet = prompt_snippet
        self.response_content = response_content
        self.structured_data = structured_data
        self.latency_ms = latency_ms
        self.timestamp = timestamp

    def to_dict(self) -> Dict[str, Any]:
        return {
            "query_id": self.query_id,
            "provider": self.provider,
            "model": self.model,
            "tags": self.tags,
            "prompt_snippet": self.prompt_snippet,
            "response_content": self.response_content,
            "structured_data": self.structured_data,
            "latency_ms": self.latency_ms,
            "timestamp": self.timestamp,
            "iso_time": datetime.fromtimestamp(self.timestamp).isoformat()
        }


class MultiProviderRouter:
    def __init__(self, files_dir: Optional[str] = None):
        """
        Maintains an ordered list of provider configurations across the 4 primary providers:
        Anthropic, Gemini, Grok, and Hugging Face.
        """
        self.files_dir = files_dir or os.path.dirname(os.path.abspath(__file__))
        self.providers: List[ProviderConfig] = []
        self.current_index: int = 0
        self.communication_history: List[TaggedCommunicationRecord] = []
        self.log_file = os.path.join(self.files_dir, "logs", "tagged_communications.jsonl")

        os.makedirs(os.path.dirname(self.log_file), exist_ok=True)
        self._init_default_providers()

    def _init_default_providers(self):
        """Configures the 4 major supported models in priority order."""
        self.providers = [
            # 1. Google AI Studio (Gemini)
            ProviderConfig(
                provider_type="GEMINI",
                name="Google AI Studio (Gemini 2.5 Flash)",
                base_url="https://generativelanguage.googleapis.com/v1beta/openai",
                api_key=os.environ.get("GEMINI_API_KEY", "ENV_GEMINI_API_KEY"),
                model_name="gemini-2.5-flash",
                protocol="openai"
            ),
            # 2. Anthropic (Claude 3.7 Sonnet)
            ProviderConfig(
                provider_type="ANTHROPIC",
                name="Anthropic (Claude 3.7 Sonnet)",
                base_url="https://api.anthropic.com/v1",
                api_key=os.environ.get("ANTHROPIC_API_KEY", "ENV_ANTHROPIC_API_KEY"),
                model_name="claude-3-7-sonnet-20250219",
                protocol="anthropic"
            ),
            # 3. Grok (xAI / Groq)
            ProviderConfig(
                provider_type="GROK",
                name="Grok Platform (xAI / Groq)",
                base_url="https://api.groq.com/openai/v1",
                api_key=os.environ.get("GROK_API_KEY", "ENV_GROK_API_KEY"),
                model_name="llama-3.3-70b-versatile",
                protocol="openai"
            ),
            # 4. Hugging Face Inference API
            ProviderConfig(
                provider_type="HUGGINGFACE",
                name="Hugging Face Hub (DeepSeek / Qwen)",
                base_url="https://api-inference.huggingface.co/v1",
                api_key=os.environ.get("HF_TOKEN", "ENV_HF_TOKEN"),
                model_name="deepseek-ai/DeepSeek-R1",
                protocol="openai"
            )
        ]

    def add_provider(self, provider: ProviderConfig):
        self.providers.append(provider)

    def rotate_provider(self) -> ProviderConfig:
        """Rotates to the next available provider in the list."""
        if not self.providers:
            raise RuntimeError("No providers configured in MultiProviderRouter")
        
        self.current_index = (self.current_index + 1) % len(self.providers)
        return self.providers[self.current_index]

    def execute_query(
        self,
        messages: List[Dict[str, str]],
        tags: Optional[List[str]] = None,
        temperature: float = 0.2,
        json_schema: Optional[Dict[str, Any]] = None,
        max_retries: int = 5
    ) -> Dict[str, Any]:
        """
        Executes model call with:
        1. Automatic hardware-encrypted key resolution from EncryptedKeyManager
        2. Tagging protocol (#accessibility, #automation, #codegen, etc.)
        3. Automatic failover on HTTP 429 or network errors
        4. Support for Anthropic REST format and OpenAI REST format
        """
        active_tags = tags or ["#general", "#android_container"]
        attempts = 0
        last_error = None
        query_id = f"qry_{int(time.time() * 1000)}"
        start_time = time.time()

        while attempts < max_retries:
            provider = self.providers[self.current_index]
            effective_key = provider.get_effective_key()

            if not provider.is_available():
                logger.info(f"Skipping rate-limited provider: {provider.name}")
                self.rotate_provider()
                attempts += 1
                continue

            logger.info(f"[{query_id}] Querying [{provider.name}] | Tags: {active_tags}")

            try:
                # Dispatch according to protocol
                if provider.protocol == "anthropic":
                    result_data = self._dispatch_anthropic(provider, effective_key, messages, temperature)
                else:
                    result_data = self._dispatch_openai(provider, effective_key, messages, temperature, json_schema)

                latency_ms = (time.time() - start_time) * 1000.0

                # Record in tagged communications log
                prompt_snippet = messages[-1].get("content", "")[:120] if messages else ""
                record = TaggedCommunicationRecord(
                    query_id=query_id,
                    provider=provider.provider_type,
                    model=provider.model_name,
                    tags=active_tags,
                    prompt_snippet=prompt_snippet,
                    response_content=result_data["raw_content"],
                    structured_data=result_data["structured_data"],
                    latency_ms=latency_ms,
                    timestamp=time.time()
                )
                self._record_communication(record)

                return {
                    "status": "success",
                    "query_id": query_id,
                    "provider": provider.provider_type,
                    "provider_name": provider.name,
                    "model": provider.model_name,
                    "tags": active_tags,
                    "raw_content": result_data["raw_content"],
                    "structured_data": result_data["structured_data"],
                    "latency_ms": latency_ms,
                    "attempts": attempts + 1
                }

            except urllib.error.HTTPError as http_err:
                last_error = f"HTTP {http_err.code}: {http_err.reason}"
                logger.warning(f"Provider [{provider.name}] failed with {last_error}")

                if http_err.code == 429:
                    provider.mark_rate_limited(cooldown_seconds=60.0)
                else:
                    provider.failure_count += 1

                self.rotate_provider()
                attempts += 1

            except (urllib.error.URLError, TimeoutError, Exception) as net_err:
                last_error = f"Network exception: {str(net_err)}"
                logger.warning(f"Provider [{provider.name}] network failure: {last_error}")
                provider.failure_count += 1
                self.rotate_provider()
                attempts += 1

        raise RuntimeError(f"All providers exhausted after {attempts} attempts. Last error: {last_error}")

    def _dispatch_openai(
        self,
        provider: ProviderConfig,
        api_key: str,
        messages: List[Dict[str, str]],
        temperature: float,
        json_schema: Optional[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Dispatches to OpenAI-compatible endpoint (Gemini, Grok/xAI, HuggingFace)."""
        payload: Dict[str, Any] = {
            "model": provider.model_name,
            "messages": messages,
            "temperature": temperature
        }
        if json_schema:
            payload["response_format"] = {"type": "json_object"}

        data = json.dumps(payload).encode("utf-8")
        url = f"{provider.base_url}/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
            "User-Agent": "SelfEvolvingAndroidContainer/1.0"
        }

        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=provider.timeout) as resp:
            body = resp.read().decode("utf-8")
            parsed = json.loads(body)
            content = parsed["choices"][0]["message"]["content"]
            return {"raw_content": content, "structured_data": self._parse_json_safely(content)}

    def _dispatch_anthropic(
        self,
        provider: ProviderConfig,
        api_key: str,
        messages: List[Dict[str, str]],
        temperature: float
    ) -> Dict[str, Any]:
        """Dispatches to Anthropic native /v1/messages endpoint."""
        system_prompt = ""
        user_messages = []
        for m in messages:
            if m.get("role") == "system":
                system_prompt = m.get("content", "")
            else:
                user_messages.append({"role": m.get("role", "user"), "content": m.get("content", "")})

        payload: Dict[str, Any] = {
            "model": provider.model_name,
            "max_tokens": 4096,
            "messages": user_messages,
            "temperature": temperature
        }
        if system_prompt:
            payload["system"] = system_prompt

        data = json.dumps(payload).encode("utf-8")
        url = f"{provider.base_url}/messages"
        headers = {
            "Content-Type": "application/json",
            "x-api-key": api_key,
            "anthropic-version": "2023-06-01",
            "User-Agent": "SelfEvolvingAndroidContainer/1.0"
        }

        req = urllib.request.Request(url, data=data, headers=headers, method="POST")
        with urllib.request.urlopen(req, timeout=provider.timeout) as resp:
            body = resp.read().decode("utf-8")
            parsed = json.loads(body)
            # Anthropic returns content as array of blocks
            content = "".join([block.get("text", "") for block in parsed.get("content", [])])
            return {"raw_content": content, "structured_data": self._parse_json_safely(content)}

    def _parse_json_safely(self, text: str) -> Optional[Dict[str, Any]]:
        clean = text.strip()
        if clean.startswith("```json"):
            clean = clean[7:]
        if clean.startswith("```"):
            clean = clean[3:]
        if clean.endswith("```"):
            clean = clean[:-3]
        try:
            return json.loads(clean.strip())
        except Exception:
            return None

    def _record_communication(self, record: TaggedCommunicationRecord):
        self.communication_history.append(record)
        try:
            with open(self.log_file, "a", encoding="utf-8") as f:
                f.write(json.dumps(record.to_dict()) + "\n")
        except Exception as e:
            logger.error(f"Failed to append to tagged communication log: {e}")

    def get_history_by_tag(self, tag: str) -> List[Dict[str, Any]]:
        """Filters communication history by tag (e.g. '#accessibility', '#critic')."""
        normalized = tag.lower().strip()
        return [
            rec.to_dict() for rec in self.communication_history
            if any(normalized == t.lower() for t in rec.tags)
        ]
