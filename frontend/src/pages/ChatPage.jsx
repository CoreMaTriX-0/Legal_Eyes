import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import {
  MessagesSquare, Search, Home, FileText, UserCircle,
  Paperclip, Send, X, Loader, AlertCircle, CheckCircle
} from "lucide-react";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// ─── helpers ────────────────────────────────────────────────────────────────

function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

async function uploadDocument(file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_BASE}/docs/upload/`, {
    method: "POST",
    headers: authHeaders(),
    body: form,
  });
  if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
  return res.json();
}

async function askQuestion(documentId, question) {
  const res = await fetch(`${API_BASE}/docs/${documentId}/qa/`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error(`Q&A failed: ${res.status}`);
  const data = await res.json();
  return data.answer;
}

async function fetchSummary(documentId) {
  const res = await fetch(`${API_BASE}/docs/${documentId}/summary/`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
  });
  if (!res.ok) throw new Error(`Summary failed: ${res.status}`);
  const data = await res.json();
  return data.summary;
}

// ─── component ───────────────────────────────────────────────────────────────

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [document, setDocument] = useState(null);      // uploaded doc metadata
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const location = useLocation();

  // Pick up routed file uploads from other pages (like the landing page)
  useEffect(() => {
    if (location.state?.initialFile) {
      const mockEvent = {
        target: {
          files: [location.state.initialFile],
          value: ""
        }
      };
      
      // Delay the upload execution slightly to allow UI paint to finish
      setTimeout(() => {
        handleFileChange(mockEvent);
      }, 300);
      
      // Clear history state to prevent loop on refresh
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  // auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── file handling ──
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowed = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    if (!allowed.includes(file.type)) {
      setError("Only PDF, DOCX, and TXT files are supported.");
      return;
    }

    setError(null);
    setUploading(true);
    addMessage("system", `📎 Uploading "${file.name}"…`);

    try {
      const doc = await uploadDocument(file);
      setDocument(doc);
      addMessage("system", `✅ Document uploaded! Generating summary…`);

      // auto-summarise on upload
      const summary = await fetchSummary(doc.id);
      addMessage("assistant", summary);
    } catch (err) {
      setError(err.message);
      addMessage("system", `❌ ${err.message}`);
    } finally {
      setUploading(false);
      // reset file input so the same file can be re-uploaded if needed
      e.target.value = "";
    }
  };

  // ── message helpers ──
  const addMessage = (role, text) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now() + Math.random(), role, text },
    ]);
  };

  // ── send question ──
  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;

    if (!document) {
      setError("Please upload a document first before asking questions.");
      return;
    }

    setError(null);
    setInput("");
    addMessage("user", q);
    setLoading(true);

    try {
      const answer = await askQuestion(document.id, q);
      addMessage("assistant", answer);
    } catch (err) {
      setError(err.message);
      addMessage("system", `❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ─── render ───────────────────────────────────────────────────────────────
  return (
    <div className="chat-layout">
      {/* Sidebar / Bottom Nav */}
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

      {/* Main chat area */}
      <div className="chat-main">
        {/* Active document badge */}
        {document && (
          <div className="doc-badge">
            <CheckCircle className="badge-icon success" />
            <span className="badge-text">Active document: <strong>{document.original_name}</strong></span>
            <button onClick={() => { setDocument(null); setMessages([]); }} className="badge-close" title="Remove document">
              <X className="close-icon" />
            </button>
          </div>
        )}

        {/* Error banner */}
        {error && (
          <div className="error-banner">
            <AlertCircle className="badge-icon error" />
            <span className="error-text">{error}</span>
            <button onClick={() => setError(null)} className="badge-close">
              <X className="close-icon" />
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="messages-area">
          {messages.length === 0 ? (
            <div className="empty-state">
              <img src="/legaleye logo.png" alt="Legal Eyes Logo" className="empty-logo" />
              <h1 className="empty-title">Legal Eyes Chat</h1>
              <p className="empty-subtitle">Upload a PDF, DOCX, or TXT document<br />then ask me anything about it.</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className={`message-row ${msg.role === "user" ? "row-user" : "row-assistant"}`}>
                <div className={`message-bubble ${msg.role}`}>
                  {msg.text}
                </div>
              </div>
            ))
          )}
          {(loading || uploading) && (
            <div className="message-row row-assistant">
              <div className="message-bubble system loading-bubble">
                <Loader className="spinner" />
                {uploading ? "Processing document…" : "Thinking…"}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="input-bar-container">
          <div className="input-bar">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={document ? "Ask a question about your document…" : "Upload a document first, then ask questions…"}
              disabled={loading || uploading}
              className="chat-input"
            />
            <button
              onClick={handleSend}
              disabled={loading || uploading || !input.trim()}
              className={`send-button ${input.trim() && document ? "active" : ""}`}
              title="Send message"
            >
              <Send className="send-icon" />
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || uploading}
              className="attach-button"
              title="Attach document (PDF, DOCX, TXT)"
            >
              <Paperclip className={`attach-icon ${uploading ? "uploading" : ""}`} />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>

      <style>{`
        /* Desktop Layout Defaults */
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

        .chat-sidebar:hover {
          width: 220px;
        }

        .chat-sidebar:hover .sidebar-hint { opacity: 0; pointer-events: none; }
        .chat-sidebar:hover .sidebar-label { opacity: 1; pointer-events: auto; }

        .sidebar-content {
          padding: 24px 0;
          height: 100%;
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .sidebar-hint {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 18px;
        }

        .hint-line {
          width: 28px;
          height: 3px;
          background: #222;
          border-radius: 2px;
          margin: 3px 0;
        }

        .sidebar-label {
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
        }

        .app-title {
          font-size: 26px;
          font-weight: 700;
          margin-bottom: 32px;
          color: #222;
          letter-spacing: 1px;
          font-family: 'Itim', cursive;
          text-align: center;
        }

        .nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          flex: 1;
        }

        .nav-item {
          margin-bottom: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .nav-link {
          color: #222;
          text-decoration: none;
          font-weight: 500;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .nav-icon { width: 28px; height: 28px; color: #222; }
        .nav-label { font-size: 14px; margin-top: 6px; }

        .profile-wrapper {
          position: absolute;
          bottom: 24px;
          left: 0;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .profile-icon {
          width: 38px;
          height: 38px;
          color: #222;
          cursor: pointer;
          background: #fff;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }

        /* Main Chat Area */
        .chat-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .doc-badge {
          padding: 10px 24px;
          background: #2a2a2a;
          border-bottom: 1px solid #333;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .badge-text { color: #ccc; font-size: 14px; }
        .badge-text strong { color: #fff; }
        .badge-icon { width: 18px; height: 18px; }
        .badge-icon.success { color: #4caf50; }
        .badge-icon.error { color: #f44336; }
        .badge-close { margin-left: auto; background: none; border: none; cursor: pointer; color: #888; }
        .close-icon { width: 18px; height: 18px; }

        .error-banner {
          padding: 10px 24px;
          background: #3d1a1a;
          border-bottom: 1px solid #5c2626;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .error-text { color: #f44336; font-size: 14px; flex: 1; }

        .messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px 32px 120px 32px;
        }

        .empty-state {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          max-width: 400px;
          z-index: 5;
          text-align: center;
        }
        .empty-logo { width: 160px; height: 160px; object-fit: contain; }
        .empty-title { font-size: 32px; font-weight: 700; margin: 16px 0; color: #fff; letter-spacing: 1px; font-family: 'Itim', cursive; }
        .empty-subtitle { color: #888; font-size: 15px; }

        .message-row { display: flex; margin-bottom: 16px; }
        .row-user { justify-content: flex-end; }
        .row-assistant { justify-content: flex-start; }

        .message-bubble {
          max-width: 75%;
          padding: 12px 18px;
          font-size: 15px;
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .message-bubble.user { background: #3a3aff; color: #fff; border-radius: 18px 18px 4px 18px; }
        .message-bubble.assistant { background: #2a2a2a; color: #fff; border-radius: 18px 18px 18px 4px; }
        .message-bubble.system { background: #333; color: #aaa; font-style: italic; border-radius: 18px 18px 18px 4px; }
        .loading-bubble { display: flex; align-items: center; gap: 8px; font-style: normal !important; }

        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spinner { width: 16px; height: 16px; animation: spin 1s linear infinite; }

        .input-bar-container {
          position: fixed;
          left: 60px;
          right: 0;
          bottom: 0;
          background: transparent;
          z-index: 20;
          display: flex;
          justify-content: center;
          padding-bottom: 28px;
          transition: left 0.25s;
        }

        .input-bar {
          background: #222;
          border-radius: 32px;
          box-shadow: 0 -2px 32px rgba(0,0,0,0.3);
          padding: 10px 20px;
          display: flex;
          align-items: center;
          width: 640px;
          max-width: 90vw;
          gap: 8px;
        }

        .chat-input {
          flex: 1;
          padding: 10px 16px;
          border-radius: 24px;
          border: none;
          font-size: 16px;
          background: #333;
          color: #fff;
          outline: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.10);
        }

        .send-button {
          background: #444; border: none; cursor: pointer; padding: 8px;
          display: flex; align-items: center; justify-content: center;
          border-radius: 50%; transition: background 0.2s;
        }
        .send-button.active { background: #3a3aff; }
        .send-icon { width: 22px; height: 22px; color: #fff; }

        .attach-button {
          background: none; border: none; cursor: pointer; padding: 4px;
          display: flex; align-items: center; justify-content: center;
        }
        .attach-icon { width: 26px; height: 26px; color: #aaa; }
        .attach-icon.uploading { color: #555; }

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
          
          .sidebar-content {
            padding: 0; flex-direction: row; justify-content: space-around; align-items: center;
          }
          
          .sidebar-hint, .app-title, .nav-label { display: none !important; }
          
          .nav-list { display: flex; justify-content: space-around; align-items: center; width: 100%; margin: 0; }
          .nav-item { margin: 0; width: 100%; height: 60px; }
          .nav-link { justify-content: center; height: 100%; width: 100%; }
          .nav-icon { color: #ccc; width: 24px; height: 24px; }
          
          .profile-wrapper { position: relative; bottom: 0; width: auto; flex: 1; display: flex; justify-content: center; }
          .profile-icon { width: 24px; height: 24px; box-shadow: none; color: #ccc; background: transparent; }
          
          .chat-main { padding-bottom: 60px; height: 100%; } /* Space for nav bar */
          .messages-area { padding: 16px 12px 90px 12px; }
          
          .input-bar-container {
            left: 0; bottom: 60px; /* Above nav bar */
            padding-bottom: 12px;
          }
          .input-bar {
            padding: 6px 12px; max-width: 95vw;
          }
          .chat-input { font-size: 14px; padding: 8px 12px; }
          .empty-title { font-size: 24px; margin: 12px 0; }
          .message-bubble { max-width: 85%; }
        }
      `}</style>
    </div>
  );
}
