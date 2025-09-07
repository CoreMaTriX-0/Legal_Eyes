import os
import logging
from pathlib import Path
from typing import Optional

# For PDF processing
try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    PDF_AVAILABLE = False

# For DOCX processing
try:
    from docx import Document
    DOCX_AVAILABLE = True
except ImportError:
    DOCX_AVAILABLE = False

logger = logging.getLogger(__name__)

def extract_text_from_file(file_path: str, file_type: str) -> Optional[str]:
    """
    Extract text from uploaded file based on file type.
    
    Args:
        file_path: Path to the uploaded file
        file_type: MIME type of the file
    
    Returns:
        Extracted text or None if extraction fails
    """
    try:
        if file_type == 'application/pdf':
            return extract_pdf_text(file_path)
        elif file_type == 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return extract_docx_text(file_path)
        elif file_type == 'text/plain':
            return extract_txt_text(file_path)
        else:
            logger.warning(f"Unsupported file type: {file_type}")
            return None
    except Exception as e:
        logger.error(f"Error extracting text from {file_path}: {str(e)}")
        return None

def extract_pdf_text(file_path: str) -> Optional[str]:
    """Extract text from PDF file."""
    if not PDF_AVAILABLE:
        logger.error("PyPDF2 not installed. Cannot process PDF files.")
        return None
    
    try:
        with open(file_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        logger.error(f"Error extracting PDF text: {str(e)}")
        return None

def extract_docx_text(file_path: str) -> Optional[str]:
    """Extract text from DOCX file."""
    if not DOCX_AVAILABLE:
        logger.error("python-docx not installed. Cannot process DOCX files.")
        return None
    
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        logger.error(f"Error extracting DOCX text: {str(e)}")
        return None

def extract_txt_text(file_path: str) -> Optional[str]:
    """Extract text from TXT file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except UnicodeDecodeError:
        # Try with different encoding
        try:
            with open(file_path, 'r', encoding='latin-1') as file:
                return file.read().strip()
        except Exception as e:
            logger.error(f"Error reading TXT file: {str(e)}")
            return None
    except Exception as e:
        logger.error(f"Error extracting TXT text: {str(e)}")
        return None
