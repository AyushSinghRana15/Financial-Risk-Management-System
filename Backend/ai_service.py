import requests
import os
import json
import hashlib
import time

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

# Simple in-memory cache (5 min TTL)
_ai_cache = {}
_CACHE_TTL = 300  # 5 minutes

def _get_cache_key(data):
    return hashlib.md5(json.dumps(data, sort_keys=True).encode()).hexdigest()

def _get_cached(key):
    if key in _ai_cache:
        entry = _ai_cache[key]
        if time.time() - entry["time"] < _CACHE_TTL:
            return entry["data"]
        else:
            del _ai_cache[key]
    return None

def _set_cache(key, data):
    _ai_cache[key] = {"data": data, "time": time.time()}

def get_ai_insights(portfolio):

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
- No markdown

Format:
{{
  "risk": "Low/Medium/High",
  "insights": ["...", "...", "..."],
  "suggestions": ["...", "..."]
}}
"""

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemini-2.0-flash-thinking-exp-01-21",
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
        content = data["choices"][0]["message"]["content"]

        # CLEAN RESPONSE
        content = content.strip()

        # Remove markdown if exists
        if "```" in content:
            content = content.split("```")[1]

        # Extract JSON safely
        start = content.find("{")
        end = content.rfind("}") + 1
        content = content[start:end]

        try:
            result = json.loads(content)
            _set_cache(cache_key, result)  # Cache successful response
            return result
        except:
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