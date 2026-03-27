import logging
import hashlib
import time
import uuid
import json
import requests
from typing import Iterable, Optional, Union
from decouple import config

logger = logging.getLogger(__name__)

class OllamaService:
    """Service for interacting with a local Ollama model."""
    
    def __init__(self):
        self.base_url = config('OLLAMA_BASE_URL', default='http://127.0.0.1:11434')
        self.model = config('OLLAMA_MODEL', default='qwen2.5:7b')
        self.timeout = config('OLLAMA_TIMEOUT', default=60, cast=int)
        self.log_prompt_preview = config('OLLAMA_LOG_PROMPT_PREVIEW', default=True, cast=bool)
        self.log_response_preview = config('OLLAMA_LOG_RESPONSE_PREVIEW', default=False, cast=bool)
        self.prompt_preview_chars = config('OLLAMA_LOG_PROMPT_CHARS', default=500, cast=int)
        self.response_preview_chars = config('OLLAMA_LOG_RESPONSE_CHARS', default=500, cast=int)

    @staticmethod
    def _preview_text(text: str, max_chars: int) -> str:
        """Return a single-line preview to keep logs compact and readable."""
        collapsed = " ".join(text.split())
        return collapsed[:max_chars]
    
    def _make_request(self, prompt: str) -> Optional[str]:
        """Make a request to the local Ollama API."""
        request_id = uuid.uuid4().hex[:8]
        endpoint = f"{self.base_url.rstrip('/')}/api/generate"
        prompt_chars = len(prompt)
        prompt_sha = hashlib.sha256(prompt.encode('utf-8', errors='ignore')).hexdigest()[:16]

        headers = {
            'Content-Type': 'application/json',
        }
        
        data = {
            "model": self.model,
            "prompt": prompt,
            "stream": False,
        }

        logger.info(
            "ollama_request_start request_id=%s model=%s endpoint=%s timeout_s=%s prompt_chars=%s prompt_sha=%s",
            request_id,
            self.model,
            endpoint,
            self.timeout,
            prompt_chars,
            prompt_sha,
        )
        if self.log_prompt_preview:
            logger.debug(
                "ollama_prompt_preview request_id=%s preview=%s",
                request_id,
                self._preview_text(prompt, self.prompt_preview_chars),
            )

        started_at = time.perf_counter()
        
        try:
            response = requests.post(
                endpoint,
                headers=headers,
                json=data,
                timeout=self.timeout
            )
            response.raise_for_status()
            
            result = response.json()
            generated_text = result.get('response', '').strip()
            elapsed_ms = int((time.perf_counter() - started_at) * 1000)

            logger.info(
                "ollama_request_success request_id=%s elapsed_ms=%s response_chars=%s prompt_eval_count=%s eval_count=%s done_reason=%s total_duration_ns=%s",
                request_id,
                elapsed_ms,
                len(generated_text),
                result.get('prompt_eval_count'),
                result.get('eval_count'),
                result.get('done_reason'),
                result.get('total_duration'),
            )

            if self.log_response_preview and generated_text:
                logger.debug(
                    "ollama_response_preview request_id=%s preview=%s",
                    request_id,
                    self._preview_text(generated_text, self.response_preview_chars),
                )

            if generated_text:
                return generated_text
            else:
                logger.warning(
                    "ollama_empty_response request_id=%s finish_reason=%s",
                    request_id,
                    result.get('done_reason'),
                )
                return None

        except requests.exceptions.Timeout as e:
            elapsed_ms = int((time.perf_counter() - started_at) * 1000)
            logger.error(
                "ollama_request_timeout request_id=%s elapsed_ms=%s error=%s",
                request_id,
                elapsed_ms,
                str(e),
            )
            return None
        except requests.exceptions.HTTPError as e:
            elapsed_ms = int((time.perf_counter() - started_at) * 1000)
            status_code = e.response.status_code if e.response is not None else "unknown"
            response_body = e.response.text if e.response is not None else ""
            logger.error(
                "ollama_request_http_error request_id=%s status=%s elapsed_ms=%s body_preview=%s",
                request_id,
                status_code,
                elapsed_ms,
                self._preview_text(response_body, 1000),
            )
            return None
        except requests.exceptions.RequestException as e:
            elapsed_ms = int((time.perf_counter() - started_at) * 1000)
            logger.error(
                "ollama_request_network_error request_id=%s elapsed_ms=%s error=%s",
                request_id,
                elapsed_ms,
                str(e),
            )
            return None
        except Exception as e:
            elapsed_ms = int((time.perf_counter() - started_at) * 1000)
            logger.exception(
                "ollama_request_unexpected_error request_id=%s elapsed_ms=%s error=%s",
                request_id,
                elapsed_ms,
                str(e),
            )
            return None

    def _make_stream_request(self, prompt: str) -> Iterable[str]:
        """Stream chunks from the local Ollama API as they are generated."""
        request_id = uuid.uuid4().hex[:8]
        endpoint = f"{self.base_url.rstrip('/')}/api/generate"
        prompt_chars = len(prompt)
        prompt_sha = hashlib.sha256(prompt.encode('utf-8', errors='ignore')).hexdigest()[:16]

        headers = {
            'Content-Type': 'application/json',
        }

        data = {
            "model": self.model,
            "prompt": prompt,
            "stream": True,
        }

        logger.info(
            "ollama_stream_start request_id=%s model=%s endpoint=%s timeout_s=%s prompt_chars=%s prompt_sha=%s",
            request_id,
            self.model,
            endpoint,
            self.timeout,
            prompt_chars,
            prompt_sha,
        )
        if self.log_prompt_preview:
            logger.debug(
                "ollama_stream_prompt_preview request_id=%s preview=%s",
                request_id,
                self._preview_text(prompt, self.prompt_preview_chars),
            )

        started_at = time.perf_counter()

        def chunk_generator():
            response_chars = 0
            try:
                with requests.post(
                    endpoint,
                    headers=headers,
                    json=data,
                    timeout=self.timeout,
                    stream=True,
                ) as response:
                    response.raise_for_status()

                    for line in response.iter_lines(decode_unicode=True):
                        if not line:
                            continue

                        try:
                            payload = json.loads(line)
                        except json.JSONDecodeError:
                            logger.warning(
                                "ollama_stream_bad_json request_id=%s line_preview=%s",
                                request_id,
                                self._preview_text(line, 200),
                            )
                            continue

                        chunk = payload.get('response', '')
                        if chunk:
                            response_chars += len(chunk)
                            yield chunk

                        if payload.get('done'):
                            elapsed_ms = int((time.perf_counter() - started_at) * 1000)
                            logger.info(
                                "ollama_stream_success request_id=%s elapsed_ms=%s response_chars=%s prompt_eval_count=%s eval_count=%s done_reason=%s total_duration_ns=%s",
                                request_id,
                                elapsed_ms,
                                response_chars,
                                payload.get('prompt_eval_count'),
                                payload.get('eval_count'),
                                payload.get('done_reason'),
                                payload.get('total_duration'),
                            )
                            break
            except requests.exceptions.Timeout as e:
                elapsed_ms = int((time.perf_counter() - started_at) * 1000)
                logger.error(
                    "ollama_stream_timeout request_id=%s elapsed_ms=%s error=%s",
                    request_id,
                    elapsed_ms,
                    str(e),
                )
            except requests.exceptions.HTTPError as e:
                elapsed_ms = int((time.perf_counter() - started_at) * 1000)
                status_code = e.response.status_code if e.response is not None else "unknown"
                response_body = e.response.text if e.response is not None else ""
                logger.error(
                    "ollama_stream_http_error request_id=%s status=%s elapsed_ms=%s body_preview=%s",
                    request_id,
                    status_code,
                    elapsed_ms,
                    self._preview_text(response_body, 1000),
                )
            except requests.exceptions.RequestException as e:
                elapsed_ms = int((time.perf_counter() - started_at) * 1000)
                logger.error(
                    "ollama_stream_network_error request_id=%s elapsed_ms=%s error=%s",
                    request_id,
                    elapsed_ms,
                    str(e),
                )
            except Exception as e:
                elapsed_ms = int((time.perf_counter() - started_at) * 1000)
                logger.exception(
                    "ollama_stream_unexpected_error request_id=%s elapsed_ms=%s error=%s",
                    request_id,
                    elapsed_ms,
                    str(e),
                )

        return chunk_generator()
    
    def summarize_document(self, text: str, stream: bool = False) -> Union[Optional[str], Iterable[str]]:
        """Generate a summary of the legal document"""
        prompt = f"""
        Please provide a clear, concise summary of this legal document. Focus on:
        1. Main purpose and type of document
        2. Key parties involved
        3. Important terms, dates, and obligations
        4. Key risks or notable clauses
        
        Document text:
        {text[:10000]}  # Limit text to avoid token limits
        """
        
        if stream:
            return self._make_stream_request(prompt)
        return self._make_request(prompt)
    
    def simplify_clauses(self, text: str, stream: bool = False) -> Union[Optional[str], Iterable[str]]:
        """Simplify complex legal language"""
        prompt = f"""
        Please rewrite this legal text in simple, easy-to-understand language while maintaining the original meaning. 
        Explain any legal jargon and break down complex sentences:
        
        {text[:4000]}
        """
        
        if stream:
            return self._make_stream_request(prompt)
        return self._make_request(prompt)
    
    def identify_risks(self, text: str, stream: bool = False) -> Union[Optional[str], Iterable[str]]:
        """Identify potential risks in the document"""
        prompt = f"""
        Please analyze this legal document and identify potential risks, concerns, or unfavorable terms. 
        Provide a bullet-pointed list of issues to watch out for:
        
        {text[:4000]}
        """
        
        if stream:
            return self._make_stream_request(prompt)
        return self._make_request(prompt)
    
    def answer_question(self, document_text: str, question: str, stream: bool = False) -> Union[Optional[str], Iterable[str]]:
        """Answer a specific question about the document"""
        prompt = f"""
        Based on the following legal document, please answer this question: {question}
        
        Document:
        {document_text[:3000]}
        
        Question: {question}
        
        Please provide a clear, specific answer based only on the information in the document.
        """
        
        if stream:
            return self._make_stream_request(prompt)
        return self._make_request(prompt)
