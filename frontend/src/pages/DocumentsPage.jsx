import React, { useState, useEffect } from "react";
import { Home, MessagesSquare, Search, FileText, UserCircle, CheckCircle, XCircle, AlertCircle, Loader, FileArchive, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getDocuments } from "../utils/authApi";

export default function DocumentsPage() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    <div className="chat-layout">
      {/* Sidebar / Bottom Nav (reused from ChatPage) */}
      <div className="chat-sidebar">
        <div className="sidebar-content">
          <div className="sidebar-hint">
            {[0, 1, 2].map(i => <div key={i} className="hint-line" />)}
          </div>
          <h2 className="sidebar-label app-title">Legal Eyes</h2>
          <ul className="nav-list">
            {[
              { href: "/", icon: <Home className="nav-icon" />, label: "Home" },
              { href: "/chat", icon: <MessagesSquare className="nav-icon" />, label: "Chat" },
              { href: "/search", icon: <Search className="nav-icon" />, label: "Search" },
              { href: "/documents", icon: <FileText className="nav-icon" />, label: "Documents" },
            ].map(({ href, icon, label }) => (
              <li key={label} className="nav-item">
                <a href={href} className="nav-link">
                  {icon}
                  <span className="sidebar-label nav-label">{label}</span>
                </a>
              </li>
            ))}
          </ul>
          <div className="profile-wrapper">
            <a href="/login" className="nav-link">
              <UserCircle className="profile-icon" />
              <span className="sidebar-label nav-label">Profile</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="docs-main">
        <div className="docs-header">
          <h1>My Documents</h1>
          <p>View and manage the legal documents you've uploaded for AI analysis.</p>
        </div>

        <div className="docs-content">
          {error && (
            <div className="error-banner" style={{ borderRadius: 8, marginBottom: 20 }}>
              <AlertCircle className="badge-icon error" />
              <span className="error-text">{error}</span>
            </div>
          )}

          {loading ? (
            <div className="docs-loader">
              <Loader className="spinner" />
              <p>Loading your documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="docs-empty">
              <FileArchive className="empty-icon" />
              <h2>No documents found</h2>
              <p>You haven't uploaded any documents yet. Head over to the Chat page to upload your first legal document!</p>
              <button className="btn-primary" onClick={() => navigate('/chat')}>Go to Chat</button>
            </div>
          ) : (
            <div className="docs-grid">
              {documents.map((doc) => (
                <div key={doc.id} className="doc-card">
                  <div className="doc-card-header">
                    <FileText className="doc-icon" />
                    <div className="doc-info">
                      <h3>{doc.original_name}</h3>
                      <span className="doc-date">{formatDate(doc.uploaded_at)}</span>
                    </div>
                  </div>
                  <div className="doc-card-body">
                    <div className="doc-status">
                      <span className="status-label">Status:</span>
                      {doc.processing_status === 'completed' ? (
                        <span className="status-indicator success"><CheckCircle className="status-icon" /> Completed</span>
                      ) : doc.processing_status === 'failed' ? (
                        <span className="status-indicator error"><XCircle className="status-icon" /> Failed</span>
                      ) : (
                        <span className="status-indicator pending"><Loader className="status-icon spinner" /> Processing</span>
                      )}
                    </div>
                    <div className="doc-type" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="type-badge">{getFileTypeLabel(doc.file_type, doc.original_name)}</span>
                      <a href={doc.file} download={doc.original_name} target="_blank" rel="noreferrer" title="Download Document" style={{ color: '#888', display: 'flex' }} onMouseEnter={e => e.currentTarget.style.color = '#3a3aff'} onMouseLeave={e => e.currentTarget.style.color = '#888'}>
                        <Download size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        /* Reused Sidebar Styles */
        .chat-layout {
          display: flex;
          min-height: 100vh;
          height: 100vh;
          background: #1E1E1E;
          overflow: hidden;
        }

        .chat-sidebar {
          width: 60px;
          transition: width 0.25s;
          background: #fff;
          overflow: visible;
          box-shadow: 2px 0 16px rgba(0,0,0,0.08);
          position: relative;
          z-index: 30;
          border-right: 1px solid #ececec;
        }

        .chat-sidebar:hover { width: 220px; }
        .chat-sidebar:hover .sidebar-hint { opacity: 0; pointer-events: none; }
        .chat-sidebar:hover .sidebar-label { opacity: 1; pointer-events: auto; }

        .sidebar-content { padding: 24px 0; height: 100%; position: relative; display: flex; flex-direction: column; }
        .sidebar-hint { display: flex; flex-direction: column; align-items: center; margin-bottom: 18px; }
        .hint-line { width: 28px; height: 3px; background: #222; border-radius: 2px; margin: 3px 0; }
        .sidebar-label { opacity: 0; transition: opacity 0.2s; pointer-events: none; }
        .app-title { font-size: 26px; font-weight: 700; margin-bottom: 32px; color: #222; letter-spacing: 1px; font-family: 'Itim', cursive; text-align: center; }
        .nav-list { list-style: none; padding: 0; margin: 0; flex: 1; }
        .nav-item { margin-bottom: 24px; display: flex; align-items: center; justify-content: center; }
        .nav-link { color: #222; text-decoration: none; font-weight: 500; display: flex; flex-direction: column; align-items: center; }
        .nav-icon { width: 28px; height: 28px; color: #222; }
        .nav-label { font-size: 14px; margin-top: 6px; }
        
        .profile-wrapper { position: absolute; bottom: 24px; left: 0; width: 100%; display: flex; flex-direction: column; align-items: center; }
        .profile-icon { width: 38px; height: 38px; color: #222; cursor: pointer; background: #fff; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.10); }

        /* Documents Page Specific Styles */
        .docs-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          background-color: #121212;
          color: #ffffff;
        }

        .docs-header {
          padding: 40px 40px 20px;
          border-bottom: 1px solid #2a2a2a;
        }

        .docs-header h1 {
          font-size: 32px;
          margin-bottom: 8px;
          font-family: 'Itim', cursive;
        }

        .docs-header p {
          color: #888;
          font-size: 16px;
        }

        .docs-content {
          padding: 30px 40px;
          flex: 1;
        }

        .docs-loader {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: #aaa;
          gap: 16px;
        }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { width: 32px; height: 32px; animation: spin 1s linear infinite; }

        .docs-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          height: 400px;
          background: #1e1e1e;
          border-radius: 12px;
          border: 1px dashed #333;
        }

        .empty-icon {
          width: 64px;
          height: 64px;
          color: #444;
          margin-bottom: 20px;
        }

        .docs-empty h2 {
          font-size: 24px;
          margin-bottom: 12px;
        }

        .docs-empty p {
          color: #888;
          max-width: 400px;
          margin-bottom: 30px;
          line-height: 1.5;
        }

        .btn-primary {
          background: #3a3aff;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 24px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }
        
        .btn-primary:hover {
          background: #2a2acc;
        }

        .docs-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        .doc-card {
          background: #1e1e1e;
          border: 1px solid #333;
          border-radius: 12px;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .doc-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.4);
          border-color: #444;
        }

        .doc-card-header {
          display: flex;
          gap: 16px;
          margin-bottom: 20px;
          align-items: flex-start;
        }

        .doc-icon {
          width: 40px;
          height: 40px;
          color: #3a3aff;
          background: rgba(58, 58, 255, 0.1);
          padding: 10px;
          border-radius: 8px;
        }

        .doc-info h3 {
          font-size: 16px;
          margin: 0 0 6px 0;
          word-break: break-all;
          line-height: 1.3;
        }

        .doc-date {
          font-size: 13px;
          color: #888;
        }

        .doc-card-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 16px;
          border-top: 1px solid #333;
        }

        .doc-status {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .status-label {
          color: #888;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }
        
        .status-icon {
          width: 14px;
          height: 14px;
        }
        
        .status-indicator.success { color: #4caf50; }
        .status-indicator.error { color: #f44336; }
        .status-indicator.pending { color: #ff9800; }

        .type-badge {
          background: #2a2a2a;
          color: #ccc;
          font-size: 11px;
          padding: 4px 8px;
          border-radius: 12px;
          font-weight: 600;
          letter-spacing: 0.5px;
        }

        /* Mobile View Overrides */
        @media (max-width: 768px) {
          .chat-layout { flex-direction: column; }
          .chat-sidebar {
            width: 100% !important; height: 60px;
            border-right: none; border-top: 1px solid #111;
            position: fixed; bottom: 0; left: 0; right: 0; z-index: 100;
            background: #222;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.2);
          }
          .chat-sidebar:hover { width: 100% !important; }
          .sidebar-content { padding: 0; flex-direction: row; justify-content: space-around; align-items: center; }
          .sidebar-hint, .app-title, .nav-label { display: none !important; }
          .nav-list { display: flex; justify-content: space-around; align-items: center; width: 100%; margin: 0; }
          .nav-item { margin: 0; width: 100%; height: 60px; }
          .nav-link { justify-content: center; height: 100%; width: 100%; }
          .nav-icon { color: #ccc; width: 24px; height: 24px; }
          .profile-wrapper { position: relative; bottom: 0; width: auto; flex: 1; display: flex; justify-content: center; }
          .profile-icon { width: 24px; height: 24px; box-shadow: none; color: #ccc; background: transparent; }
          
          .docs-main { padding-bottom: 70px; }
          .docs-header { padding: 30px 20px 15px; }
          .docs-header h1 { font-size: 26px; }
          .docs-content { padding: 20px; }
        }
      `}</style>
    </div>
  );
}
