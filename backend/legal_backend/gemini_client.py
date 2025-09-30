import os
import logging
from typing import Optional

import google.generativeai as genai
from google.api_core import exceptions as gexc

logger = logging.getLogger(__name__)

API_KEY = os.getenv('GEMINI_API_KEY') or os.getenv('GOOGLE_API_KEY')
if not API_KEY:
    API_KEY = 'MISSING_API_KEY'

# Allow override of model via env var; pick a currently supported default
# Use a newer stable default and keep a fallback list to try if one fails
DEFAULT_MODEL = os.getenv('GEMINI_MODEL', 'gemini-1.5-flash-002')

# Candidates in order of preference; environment value (if any) is tried first
PREFERRED_MODELS = [
    os.getenv('GEMINI_MODEL'),
    'gemini-1.5-flash-002',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash-8b',
    'gemini-1.5-flash-8b-latest',
    'gemini-1.5-pro-002',
    'gemini-1.5-pro-latest',
    'gemini-1.0-pro',
]

genai.configure(api_key=API_KEY if API_KEY != 'MISSING_API_KEY' else 'invalid')

_model_instance: Optional[object] = None
_model_name: Optional[str] = None

def _discover_supported_models() -> list[str]:
    """Return a list of available model ids that support generateContent.

    The SDK returns model names like 'models/gemini-1.5-flash-002'. We strip the
    'models/' prefix for use with GenerativeModel.
    """
    try:
        models = list(genai.list_models())
    except Exception as e:  # pragma: no cover
        logger.warning('Failed to list Gemini models: %s', e)
        return []

    supported = []
    for m in models:
        try:
            name = getattr(m, 'name', '') or ''
            methods = set(getattr(m, 'supported_generation_methods', []) or [])
            # Be defensive about method naming
            methods = {str(x) for x in methods}
            if ('generateContent' in methods) or ('generate_content' in methods):
                short = name.split('/')[-1] if '/' in name else name
                if short:
                    supported.append(short)
        except Exception:
            continue
    # Prefer flash before pro, keep stable ones first
    supported_sorted = sorted(
        supported,
        key=lambda s: (
            0 if 'flash' in s else 1,
            0 if '1.5' in s else 1,
            0 if s.endswith('-002') else 1,
        )
    )
    return supported_sorted

def _get_model():
    global _model_instance
    global _model_name
    if _model_instance is None:
        if API_KEY == 'MISSING_API_KEY':
            raise RuntimeError('Configuration error: Gemini API key not set on server.')
        try:
            _model_instance = genai.GenerativeModel(DEFAULT_MODEL)
            _model_name = DEFAULT_MODEL
        except gexc.NotFound:
            raise RuntimeError(
                f"Model '{DEFAULT_MODEL}' not found. Set GEMINI_MODEL env var to a supported one (e.g. gemini-1.5-flash-002, gemini-1.5-pro-002)."
            )
        except Exception as e:  # pragma: no cover
            raise RuntimeError(f'Failed to initialize Gemini model: {e}')
    return _model_instance

def get_gemini_response(user_query: str) -> str:
    """Generate a response from Gemini.

    Args:
        user_query: The natural language user input.
    Returns:
        A text string response. If an error occurs, a fallback message is returned.
    """
    global _model_instance, _model_name
    q = (user_query or '').strip()
    if not q:
        return 'Please provide a non-empty query.'
    try:
        model = _get_model()
        response = model.generate_content(q)
        text = getattr(response, 'text', '')
        return (text or '').strip() or 'No response generated.'
    except gexc.NotFound as e:
        # Try fallbacks when the configured model is not available/supported
        logger.warning('Configured Gemini model not found (%s). Trying fallbacks...', e)
        attempts = []
        for name in PREFERRED_MODELS:
            if not name:
                continue
            try:
                attempts.append(name)
                model = genai.GenerativeModel(name)
                response = model.generate_content(q)
                text = getattr(response, 'text', '')
                # Cache the working model for future calls
                _model_instance = model
                _model_name = name
                logger.info('Gemini model switched to %s after fallback', name)
                return (text or '').strip() or 'No response generated.'
            except gexc.NotFound:
                continue
            except Exception as inner_e:  # pragma: no cover
                logger.warning('Gemini model %s failed with error: %s', name, inner_e)
                continue
        # Dynamic discovery as a last resort
        discovered = _discover_supported_models()
        for name in discovered:
            if name in attempts:
                continue
            try:
                attempts.append(name)
                model = genai.GenerativeModel(name)
                response = model.generate_content(q)
                text = getattr(response, 'text', '')
                _model_instance = model
                _model_name = name
                logger.info('Gemini model switched to %s after discovery', name)
                return (text or '').strip() or 'No response generated.'
            except Exception as inner_e:  # pragma: no cover
                logger.warning('Discovered model %s failed: %s', name, inner_e)
                continue
        tried = ', '.join([m for m in attempts]) or '<none>'
        return (
            'No compatible Gemini model was found for generateContent. '
            f'Tried: {tried}. Set GEMINI_MODEL to a supported id such as '
            'gemini-1.5-flash-002 or gemini-1.5-pro-002.'
        )
    except RuntimeError as e:
        return str(e)
    except Exception as e:  # pragma: no cover
        logger.exception('Gemini generation failed')
        return f'Error while generating response: {e}'
