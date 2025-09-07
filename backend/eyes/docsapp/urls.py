from django.urls import path
from . import views

urlpatterns = [
    # Document management
    path('', views.DocumentListView.as_view(), name='document-list'),
    path('upload/', views.DocumentUploadView.as_view(), name='document-upload'),
    path('<int:pk>/', views.DocumentDetailView.as_view(), name='document-detail'),
    
    # AI-powered features
    path('<int:document_id>/summary/', views.document_summary, name='document-summary'),
    path('<int:document_id>/simplify/', views.document_simplify, name='document-simplify'),
    path('<int:document_id>/risks/', views.document_risks, name='document-risks'),
    path('<int:document_id>/qa/', views.document_qa, name='document-qa'),
    
    # Test APIs (for development/testing)
    path('test/gemini/', views.test_gemini_connection, name='test-gemini'),
    path('test/extract/', views.test_text_extraction, name='test-text-extraction'),
    path('test/ai/', views.test_ai_analysis, name='test-ai-analysis'),
    path('test/qa/', views.test_qa, name='test-qa'),
]
