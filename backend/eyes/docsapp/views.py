import os
import logging
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django.shortcuts import get_object_or_404
from django.conf import settings

from .models import LegalDocument
from .serializers import LegalDocumentSerializer, DocumentUploadSerializer
from .services import extract_text_from_file
from .ai_service import GeminiService

logger = logging.getLogger(__name__)

class DocumentListView(generics.ListAPIView):
    """List all documents for the authenticated user"""
    serializer_class = LegalDocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LegalDocument.objects.filter(user=self.request.user)

class DocumentUploadView(generics.CreateAPIView):
    """Upload a new document"""
    serializer_class = DocumentUploadSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]
    
    def perform_create(self, serializer):
        document = serializer.save()
        
        # Extract text in the background (you might want to use Celery for this in production)
        try:
            file_path = document.file.path
            extracted_text = extract_text_from_file(file_path, document.file_type)
            
            if extracted_text:
                document.extracted_text = extracted_text
                document.processing_status = 'completed'
            else:
                document.processing_status = 'failed'
            
            document.save()
            
        except Exception as e:
            logger.error(f"Error processing document {document.id}: {str(e)}")
            document.processing_status = 'failed'
            document.save()

class DocumentDetailView(generics.RetrieveDestroyAPIView):
    """Get or delete a specific document"""
    serializer_class = LegalDocumentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return LegalDocument.objects.filter(user=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def document_summary(request, document_id):
    """Generate a summary of the document using AI"""
    document = get_object_or_404(
        LegalDocument, 
        id=document_id, 
        user=request.user
    )
    
    if not document.extracted_text:
        return Response(
            {'error': 'Document text not available. Processing may have failed.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    gemini_service = GeminiService()
    summary = gemini_service.summarize_document(document.extracted_text)
    
    if summary:
        return Response({'summary': summary})
    else:
        return Response(
            {'error': 'Failed to generate summary. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def document_simplify(request, document_id):
    """Simplify the document language using AI"""
    document = get_object_or_404(
        LegalDocument, 
        id=document_id, 
        user=request.user
    )
    
    if not document.extracted_text:
        return Response(
            {'error': 'Document text not available. Processing may have failed.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    gemini_service = GeminiService()
    simplified = gemini_service.simplify_clauses(document.extracted_text)
    
    if simplified:
        return Response({'simplified_text': simplified})
    else:
        return Response(
            {'error': 'Failed to simplify document. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def document_risks(request, document_id):
    """Identify risks in the document using AI"""
    document = get_object_or_404(
        LegalDocument, 
        id=document_id, 
        user=request.user
    )
    
    if not document.extracted_text:
        return Response(
            {'error': 'Document text not available. Processing may have failed.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    gemini_service = GeminiService()
    risks = gemini_service.identify_risks(document.extracted_text)
    
    if risks:
        return Response({'risks': risks})
    else:
        return Response(
            {'error': 'Failed to identify risks. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def document_qa(request, document_id):
    """Answer questions about the document using AI"""
    document = get_object_or_404(
        LegalDocument, 
        id=document_id, 
        user=request.user
    )
    
    question = request.data.get('question')
    if not question:
        return Response(
            {'error': 'Question is required.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    if not document.extracted_text:
        return Response(
            {'error': 'Document text not available. Processing may have failed.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    gemini_service = GeminiService()
    answer = gemini_service.answer_question(document.extracted_text, question)
    
    if answer:
        return Response({
            'question': question,
            'answer': answer
        })
    else:
        return Response(
            {'error': 'Failed to answer question. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

# Test APIs for easy feature testing
@api_view(['GET'])
def test_gemini_connection(request):
    """Test if Gemini API is working"""
    gemini_service = GeminiService()
    
    # Simple test prompt
    test_response = gemini_service._make_request("Hello, can you respond with 'Gemini API is working!'?")
    
    if test_response:
        return Response({
            'status': 'success',
            'message': 'Gemini API is connected and working',
            'response': test_response
        })
    else:
        return Response({
            'status': 'error',
            'message': 'Failed to connect to Gemini API. Check your API key.'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def test_text_extraction(request):
    """Test text extraction without saving document"""
    if 'file' not in request.FILES:
        return Response({
            'error': 'No file provided'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    file = request.FILES['file']
    
    # Validate file type
    allowed_types = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
    if file.content_type not in allowed_types:
        return Response({
            'error': 'Only PDF, DOCX, and TXT files are supported'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Save file temporarily
    import tempfile
    import os
    
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=f'.{file.name.split(".")[-1]}') as temp_file:
            for chunk in file.chunks():
                temp_file.write(chunk)
            temp_file_path = temp_file.name
        
        # Extract text
        extracted_text = extract_text_from_file(temp_file_path, file.content_type)
        
        # Clean up
        os.unlink(temp_file_path)
        
        if extracted_text:
            return Response({
                'status': 'success',
                'file_name': file.name,
                'file_type': file.content_type,
                'file_size': file.size,
                'extracted_text': extracted_text[:500] + '...' if len(extracted_text) > 500 else extracted_text,
                'full_text_length': len(extracted_text)
            })
        else:
            return Response({
                'status': 'error',
                'message': 'Failed to extract text from file'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        # Clean up on error
        if 'temp_file_path' in locals():
            try:
                os.unlink(temp_file_path)
            except:
                pass
        
        return Response({
            'status': 'error',
            'message': f'Error processing file: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def test_ai_analysis(request):
    """Test AI analysis with sample text"""
    text = request.data.get('text')
    analysis_type = request.data.get('type', 'summary')  # summary, simplify, risks
    
    if not text:
        return Response({
            'error': 'No text provided. Send JSON with "text" field.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    gemini_service = GeminiService()
    
    try:
        if analysis_type == 'summary':
            result = gemini_service.summarize_document(text)
        elif analysis_type == 'simplify':
            result = gemini_service.simplify_clauses(text)
        elif analysis_type == 'risks':
            result = gemini_service.identify_risks(text)
        else:
            return Response({
                'error': 'Invalid analysis type. Use: summary, simplify, or risks'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        if result:
            return Response({
                'status': 'success',
                'analysis_type': analysis_type,
                'original_text_length': len(text),
                'result': result
            })
        else:
            return Response({
                'status': 'error',
                'message': f'Failed to perform {analysis_type} analysis'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error during AI analysis: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def test_qa(request):
    """Test Q&A functionality with sample text"""
    text = request.data.get('text')
    question = request.data.get('question')
    
    if not text or not question:
        return Response({
            'error': 'Both "text" and "question" fields are required.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    gemini_service = GeminiService()
    
    try:
        answer = gemini_service.answer_question(text, question)
        
        if answer:
            return Response({
                'status': 'success',
                'question': question,
                'answer': answer,
                'document_length': len(text)
            })
        else:
            return Response({
                'status': 'error',
                'message': 'Failed to generate answer'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
    except Exception as e:
        return Response({
            'status': 'error',
            'message': f'Error during Q&A: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
