import requests  # HTTP client for calling the OpenRouter API
import os
import json
import hashlib  # For creating cache keys
import time

# OpenRouter provides a unified API to access various LLMs (GPT-4, Claude, etc.)
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Simple in-memory cache (5 min TTL) to avoid re-calling the paid API for the same input
# "TTL" = Time To Live — how long an entry stays valid before being evicted
_ai_cache = {}
_CACHE_TTL = 300  # 5 minutes in seconds

def _get_cache_key(data):
    # Creates a unique fingerprint by JSON-serializing (with sorted keys for consistency)
    # then MD5-hashing into a compact 32-character hex string
    return hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()

def _get_cached(key):
    if key in _ai_cache:
        entry = _ai_cache[key]
        # Check if entry is still fresh (not expired)
        if time.time() - entry["time"] < _CACHE_TTL:
            return entry["data"]
        else:
            del _ai_cache[key]  # Expired — remove it
    return None

def _set_cache(key, data):
    _ai_cache[key] = {"data": data, "time": time.time()}

def get_ai_insights(portfolio):
    """Sends portfolio data to an LLM and returns structured JSON insights."""

    # Check cache first
    cache_key = _get_cache_key(portfolio)
    cached = _get_cached(cache_key)
    if cached:
        return cached

    prompt = f"""
You are a financial risk advisor.

Analyze this portfolio:
{portfolio}

IMPORTANT:
- Return ONLY valid JSON
- No text before or after
- No markdown  (no ``` code fences)

Format:
{{
  "risk": "Low/Medium/High",
  "insights": ["...", "...", "..."],
  "suggestions": ["...", "..."]
}}
"""

    try:
        # OpenRouter API endpoint — routes to various LLMs
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "tencent/hy3:free",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "max_tokens": 500
            },
            timeout=15
        )

        if response.status_code != 200:
            return {"error": response.text}

        data = response.json()
        content = data["choices"][0]["message"]["content"]  # Extract AI's text reply

        # CLEAN RESPONSE
        content = content.strip()

        # Remove markdown code fences if the AI wraps JSON in ```json ... ```
        if "```" in content:
            content = content.split("```")[1]

        # Extract JSON safely — find first { and last }
        start = content.find("{")
        end = content.rfind("}") + 1
        content = content[start:end]

        try:
            result = json.loads(content)  # Parse JSON string into Python dict
            _set_cache(cache_key, result)  # Cache successful response
            return result
        except:
            # If JSON parsing fails, return raw text as a fallback
            return {
                "risk": "Unknown",
                "insights": [content[:200]],
                "suggestions": []
            }

    except requests.Timeout:
        return {
            "risk": "Unknown",
            "insights": ["AI analysis timed out. Please try again."],
            "suggestions": []
        }
    except Exception as e:
        return {"error": str(e)}


def chatbot_response(system_prompt, messages):
    """
    Takes a system prompt (with context about the user's portfolio/risk data)
    and a list of chat messages, returns the AI response text.
    Unlike get_ai_insights, this returns plain text (for conversation), not JSON.
    """
    # Build the message array: system role sets the AI's behavior, then conversation history
    openrouter_messages = [{"role": "system", "content": system_prompt}]
    for msg in messages:
        openrouter_messages.append({"role": msg["role"], "content": msg["content"]})

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "tencent/hy3:free",
                "messages": openrouter_messages,
                "max_tokens": 800
            },
            timeout=30  # Longer timeout for multi-turn conversation
        )

        if response.status_code != 200:
            return f"Error: {response.text}"

        data = response.json()
        content = data["choices"][0]["message"]["content"]
        return content.strip()

    except requests.Timeout:
        return "I'm sorry, the AI service timed out. Please try again."
    except Exception as e:
        return f"Sorry, I encountered an error: {str(e)}"