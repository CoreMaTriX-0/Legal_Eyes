import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText, CheckCircle, XCircle, Loader,
  FileArchive, Download, AlertCircle, MessagesSquare, Trash2,
  AlertTriangle
} from "lucide-react";
import Sidebar from "../components/Sidebar/Sidebar";
import { getDocuments, deleteDocument } from "../utils/authApi";
import "./DocumentsPage.css";

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Modal state
  const [documentToDelete, setDocumentToDelete] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await getDocuments();
        setDocuments(data.results || data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDocs();
  }, []);

  const handleDeleteClick = (doc) => {
    setDocumentToDelete(doc);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;
    try {
      await deleteDocument(documentToDelete.id);
      setDocuments(docs => docs.filter(d => d.id !== documentToDelete.id));
    } catch (err) {
      setError("Failed to delete document: " + err.message);
    } finally {
      setDocumentToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setDocumentToDelete(null);
  };

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getFileTypeLabel = (mimeType, filename) => {
    if (mimeType === 'application/pdf') return 'PDF';
    if (mimeType === 'text/plain') return 'TXT';
    if (mimeType && mimeType.includes('wordprocessingml')) return 'DOCX';
    return filename && filename.includes('.') ? filename.split('.').pop().toUpperCase() : 'FILE';
  };

  return (
    <div className="docs-page">
      <Sidebar />

      <header className="docs-header">
        <div className="docs-header-inner">
          <h1 className="docs-title animate-slide-up">My Documents</h1>
          <p className="docs-subtitle animate-slide-up delay-1">
            View and manage your uploaded legal documents
          </p>
        </div>
      </header>

      <main className="docs-content">
        {error && (
          <div className="docs-error animate-slide-down">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="docs-loader">
            <Loader className="docs-spinner" size={32} />
            <p>Loading documents…</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="docs-empty animate-fade-in">
            <FileArchive size={48} strokeWidth={1.2} className="docs-empty-icon" />
            <h2>No documents found</h2>
            <p>Upload your first document in the Chat page to get started.</p>
            <button className="docs-cta" onClick={() => navigate('/chat')}>
              <MessagesSquare size={16} />
              Go to Chat
            </button>
          </div>
        ) : (
          <div className="docs-grid">
            {documents.map((doc, index) => (
              <div
                key={doc.id}
                className="doc-card"
                style={{ animationDelay: `${index * 80}ms` }}
              >
                <div className="doc-card-top">
                  <div className="doc-card-icon-wrap">
                    <FileText size={22} />
                  </div>
                  <div className="doc-card-info">
                    <h3 className="doc-card-name">{doc.original_name}</h3>
                    <span className="doc-card-date">{formatDate(doc.uploaded_at)}</span>
                  </div>
                </div>

                <div className="doc-card-bottom">
                  <div className="doc-card-status">
                    {doc.processing_status === 'completed' ? (
                      <span className="status-pill success">
                        <CheckCircle size={13} /> Completed
                      </span>
                    ) : doc.processing_status === 'failed' ? (
                      <span className="status-pill error">
                        <XCircle size={13} /> Failed
                      </span>
                    ) : (
                      <span className="status-pill pending">
                        <Loader size={13} className="docs-spinner-sm" /> Processing
                      </span>
                    )}
                  </div>
                  <div className="doc-card-actions">
                    <span className="file-type-badge">
                      {getFileTypeLabel(doc.file_type, doc.original_name)}
                    </span>
                    
                    <button
                      className="doc-action-btn doc-delete"
                      onClick={() => handleDeleteClick(doc)}
                      title="Delete Document"
                    >
                      <Trash2 size={16} />
                    </button>

                    <a
                      href={doc.file}
                      download={doc.original_name}
                      target="_blank"
                      rel="noreferrer"
                      title="Download Document"
                      className="doc-action-btn doc-download"
                    >
                      <Download size={16} />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {documentToDelete && (
        <div className="delete-modal-overlay animate-fade-in">
          <div className="delete-modal animate-scale-in">
            <div className="delete-modal-icon">
              <AlertTriangle size={32} />
            </div>
            <h3 className="delete-modal-title">Delete Document</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete <strong>{documentToDelete.original_name}</strong>?
              <br/>
              This action is irrecoverable and the document will be permanently removed.
            </p>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={handleCancelDelete}>Cancel</button>
              <button className="btn-confirm-delete" onClick={handleConfirmDelete}>Confirm Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
