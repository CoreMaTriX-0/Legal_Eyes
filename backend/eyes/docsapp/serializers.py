from rest_framework import serializers
from .models import LegalDocument

class LegalDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = LegalDocument
        fields = ['id', 'original_name', 'file_type', 'file_size', 'uploaded_at', 'processing_status']
        read_only_fields = ['id', 'uploaded_at', 'processing_status']

class DocumentUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()
    
    class Meta:
        model = LegalDocument
        fields = ['file']
    
    def validate_file(self, value):
        # File size validation (10MB limit)
        if value.size > 10 * 1024 * 1024:
            raise serializers.ValidationError("File size cannot exceed 10MB.")
        
        # File type validation
        allowed_types = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
        if value.content_type not in allowed_types:
            raise serializers.ValidationError("Only PDF, DOCX, and TXT files are supported.")
        
        return value
    
    def create(self, validated_data):
        file = validated_data['file']
        return LegalDocument.objects.create(
            user=self.context['request'].user,
            file=file,
            original_name=file.name,
            file_type=file.content_type,
            file_size=file.size
        )
