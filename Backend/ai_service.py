import requests
import os
import json

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

def get_ai_insights(portfolio):

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
                "model": "openrouter/auto",
                "messages": [
                    {"role": "user", "content": prompt}
                ],
                "route": "fallback"
            },
            timeout=10
        )

        if response.status_code != 200:
            return {"error": response.text}

        data = response.json()
        content = data["choices"][0]["message"]["content"]

        # 🔥 CLEAN RESPONSE
        content = content.strip()

        # Remove markdown if exists
        if "```" in content:
            content = content.split("```")[1]

        # Extract JSON safely
        start = content.find("{")
        end = content.rfind("}") + 1
        content = content[start:end]

        try:
            return json.loads(content)
        except:
            return {
                "risk": "Unknown",
                "insights": [content],
                "suggestions": []
            }

    except Exception as e:
        return {"error": str(e)}