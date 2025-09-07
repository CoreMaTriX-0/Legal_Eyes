import os
import logging
import requests
from typing import Optional, Dict, Any
from decouple import config

logger = logging.getLogger(__name__)

class GeminiService:
    """Service for interacting with Google Gemini API"""
    
    def __init__(self):
        self.api_key = config('GEMINI_API_KEY', default=None)
        self.base_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
    
    def _make_request(self, prompt: str) -> Optional[str]:
        """Make a request to Gemini API"""
        if not self.api_key:
            logger.error("GEMINI_API_KEY not found in environment variables")
            return None
        
        headers = {
            'Content-Type': 'application/json',
        }
        
        data = {
            "contents": [{
                "parts": [{
                    "text": prompt
                }]
            }]
        }
        
        try:
            response = requests.post(
                f"{self.base_url}?key={self.api_key}",
                headers=headers,
                json=data,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                return result['candidates'][0]['content']['parts'][0]['text']
            else:
                logger.warning("No content returned from Gemini API")
                return None
                
        except requests.exceptions.RequestException as e:
            logger.error(f"Error calling Gemini API: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Unexpected error with Gemini API: {str(e)}")
            return None
    
    def summarize_document(self, text: str) -> Optional[str]:
        """Generate a summary of the legal document"""
        prompt = f"""
        Please provide a clear, concise summary of this legal document. Focus on:
        1. Main purpose and type of document
        2. Key parties involved
        3. Important terms, dates, and obligations
        4. Key risks or notable clauses
        
        Document text:
        {text[:4000]}  # Limit text to avoid token limits
        """
        
        return self._make_request(prompt)
    
    def simplify_clauses(self, text: str) -> Optional[str]:
        """Simplify complex legal language"""
        prompt = f"""
        Please rewrite this legal text in simple, easy-to-understand language while maintaining the original meaning. 
        Explain any legal jargon and break down complex sentences:
        
        {text[:4000]}
        """
        
        return self._make_request(prompt)
    
    def identify_risks(self, text: str) -> Optional[str]:
        """Identify potential risks in the document"""
        prompt = f"""
        Please analyze this legal document and identify potential risks, concerns, or unfavorable terms. 
        Provide a bullet-pointed list of issues to watch out for:
        
        {text[:4000]}
        """
        
        return self._make_request(prompt)
    
    def answer_question(self, document_text: str, question: str) -> Optional[str]:
        """Answer a specific question about the document"""
        prompt = f"""
        Based on the following legal document, please answer this question: {question}
        
        Document:
        {document_text[:3000]}
        
        Question: {question}
        
        Please provide a clear, specific answer based only on the information in the document.
        """
        
        return self._make_request(prompt)
