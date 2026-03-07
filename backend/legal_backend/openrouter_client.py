"""
OpenRouter AI client – drop-in replacement for gemini_client.get_gemini_response.

Uses the plain `requests` library (no extra SDK needed).
Set the OPENROUTER_API_KEY environment variable before starting Django.

Optional env vars:
  OPENROUTER_MODEL       – model slug  (default: google/gemma-3-12b-it:free)
  OPENROUTER_SITE_URL    – your site URL sent in HTTP-Referer header
  OPENROUTER_SITE_NAME   – your site name sent in X-OpenRouter-Title header
"""

import json
import logging
import os
import time

import requests

logger = logging.getLogger(__name__)

# ── configuration ──────────────────────────────────────────────────────────────

OPENROUTER_API_KEY  = os.getenv("OPENROUTER_API_KEY", "MISSING_API_KEY")
OPENROUTER_MODEL    = os.getenv("OPENROUTER_MODEL", "stepfun/step-3.5-flash:free")
SITE_URL            = os.getenv("OPENROUTER_SITE_URL", "")
SITE_NAME           = os.getenv("OPENROUTER_SITE_NAME", "Legalease")

_API_URL       = "https://openrouter.ai/api/v1/chat/completions"
_MAX_RETRIES   = 4          # total attempts (1 original + 3 retries)
_RETRY_DELAYS  = [2, 5, 10] # seconds to wait before each retry

# ── public helpers ─────────────────────────────────────────────────────────────

def get_gemini_response(user_query: str) -> str:
    """
    Generate a response from OpenRouter (same signature as the original
    gemini_client.get_gemini_response so no other code needs to change).

    Includes automatic retry with exponential-style back-off for 429 and 5xx
    responses so transient upstream rate limits resolve transparently.

    Args:
        user_query: The natural-language question / prompt.
    Returns:
        A plain-text response string.
    """
    query = (user_query or "").strip()
    if not query:
        return "Please provide a non-empty query."

    if OPENROUTER_API_KEY == "MISSING_API_KEY":
        return (
            "Configuration error: OPENROUTER_API_KEY is not set on the server. "
            "Please add it to your environment variables."
        )

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type":  "application/json",
    }
    if SITE_URL:
        headers["HTTP-Referer"] = SITE_URL
    if SITE_NAME:
        headers["X-OpenRouter-Title"] = SITE_NAME

    payload = {
    "model": OPENROUTER_MODEL,
    "messages": [
        {
            "role": "system",
            "content": (
                "You are LegalEase, a professional Indian legal assistant.\n\n"
                "STRICT RULES:\n"
                "1. Answer ONLY questions related to Indian law.\n"
                "2. If the query is not legal in nature, respond with: "
                "'This assistant only handles Indian legal queries.'\n"
                "3. Do NOT provide U.S. or foreign law unless explicitly requested.\n"
                "4. Base answers on Indian statutes such as the Transfer of Property Act, 1882, "
                "Indian Penal Code, 1860, Code of Civil Procedure, 1908, "
                "Code of Criminal Procedure, 1973, State Rent Control Acts, "
                "Model Tenancy Act, 2021, and other applicable Indian laws.\n"
                "5. If the issue depends on a specific Indian state, ask the user to specify the state.\n"
                "6. If unsure, clearly state uncertainty instead of guessing.\n"
                "7. Keep the complete response within 700 tokens.\n"
                "8. Maintain a professional and structured tone.\n\n"
                "FORMAT:\n"
                "1. Legal Position under Indian Law\n"
                "2. Relevant Act / Provision\n"
                "3. Practical Steps\n"
                "4. Important Caution\n"
            )
        },
        {
            "role": "user",
            "content": query
        }
    ],
    "max_tokens": 1000,
    "temperature": 0.3
}

    last_status = None

    for attempt in range(_MAX_RETRIES):
        try:
            resp = requests.post(
                _API_URL,
                headers=headers,
                data=json.dumps(payload),
                timeout=60,
            )
            resp.raise_for_status()
            data = resp.json()
            content = (
                data.get("choices", [{}])[0]
                    .get("message", {})
                    .get("content", "")
            )
            return (content or "").strip() or "No response generated."

        except requests.exceptions.Timeout:
            logger.warning("OpenRouter request timed out (attempt %d/%d).", attempt + 1, _MAX_RETRIES)
            last_status = "timeout"
            # Timeouts are not retried — the user should not wait even longer
            return "I'm sorry, the AI service took too long to respond. Please try again in a moment."

        except requests.exceptions.HTTPError as exc:
            last_status = resp.status_code
            logger.warning(
                "OpenRouter HTTP error on attempt %d/%d: %s",
                attempt + 1, _MAX_RETRIES, exc,
            )

            # Only retry on 429 (rate-limit) and 5xx (server errors)
            if last_status == 429 or last_status >= 500:
                if attempt < _MAX_RETRIES - 1:
                    wait = _RETRY_DELAYS[min(attempt, len(_RETRY_DELAYS) - 1)]
                    logger.info("Retrying in %ds (status %s)...", wait, last_status)
                    time.sleep(wait)
                    continue  # next attempt

            # Non-retryable or exhausted retries
            logger.error("OpenRouter HTTP error (giving up): %s – %s", exc, resp.text)
            if last_status == 401:
                return "I'm unable to connect to the AI service right now (authentication issue). Please contact support."
            elif last_status == 429:
                return "The AI service is currently experiencing high traffic. Please try again in a few seconds."
            elif last_status >= 500:
                return "The AI service is temporarily unavailable. Please try again shortly."
            return "The AI service returned an error. Please try again."

        except Exception as exc:  # pragma: no cover
            logger.exception("OpenRouter request failed on attempt %d/%d", attempt + 1, _MAX_RETRIES)
            if attempt < _MAX_RETRIES - 1:
                wait = _RETRY_DELAYS[min(attempt, len(_RETRY_DELAYS) - 1)]
                logger.info("Retrying in %ds after unexpected error...", wait)
                time.sleep(wait)
                continue
            return "Something went wrong while processing your request. Please try again."

    return "The AI service could not be reached after multiple attempts. Please try again later."
