import React, { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Paperclip, Send, Square, AlertCircle, CheckCircle,
  X, Sparkles, FileText
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Sidebar from "../components/Sidebar/Sidebar";
import { saveChat, getChat, generateChatId } from "../utils/chatHistory";
import "./ChatPage.css";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:8000/api";

// ─── helpers ──────────────────────────────────────────────────────────────────
function authHeaders(extra = {}) {
  const token = localStorage.getItem("token");
  return {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

// XHR-based upload so we can track progress
function uploadDocumentXHR(file, onProgress, signal) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}/docs/upload/`);

    const token = localStorage.getItem("token");
    if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try { resolve(JSON.parse(xhr.responseText)); }
        catch { reject(new Error("Invalid JSON response")); }
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(Object.assign(new Error("AbortError"), { name: "AbortError" }));

    // Hook into AbortController signal
    if (signal) signal.addEventListener("abort", () => xhr.abort());

    xhr.send(form);
  });
}

async function askQuestion(documentId, question, signal, onChunk) {
  const res = await fetch(`${API_BASE}/docs/${documentId}/qa/`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ question }),
    signal,
  });

  if (!res.ok) {
    let errorMessage = `Q&A failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) errorMessage = data.error;
    } catch {
      try {
        const text = await res.text();
        if (text) errorMessage = text;
      } catch {
        // Use the default error message when response parsing fails.
      }
    }
    throw new Error(errorMessage);
  }

  const reader = res.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      fullText += chunk;
      onChunk?.(chunk);
    }
  }

  const trailing = decoder.decode();
  if (trailing) {
    fullText += trailing;
    onChunk?.(trailing);
  }

  return fullText;
}

async function fetchSummary(documentId, signal, onChunk) {
  const res = await fetch(`${API_BASE}/docs/${documentId}/summary/`, {
    method: "POST",
    headers: authHeaders({ "Content-Type": "application/json" }),
    signal,
  });

  if (!res.ok) {
    let errorMessage = `Summary failed: ${res.status}`;
    try {
      const data = await res.json();
      if (data?.error) errorMessage = data.error;
    } catch {
      try {
        const text = await res.text();
        if (text) errorMessage = text;
      } catch {
        // Use the default error message when response parsing fails.
      }
    }
    throw new Error(errorMessage);
  }

  const reader = res.body?.getReader();
  if (!reader) return "";

  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    if (chunk) {
      fullText += chunk;
      onChunk?.(chunk);
    }
  }

  const trailing = decoder.decode();
  if (trailing) {
    fullText += trailing;
    onChunk?.(trailing);
  }

  return fullText;
}

// SVG circular progress ring  
function ProgressRing({ progress }) {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;
  return (
    <svg className="upload-progress-ring" viewBox="0 0 68 68">
      <circle className="upload-ring-bg" cx="34" cy="34" r={r} />
      <circle
        className="upload-ring-fill"
        cx="34" cy="34" r={r}
        strokeDasharray={circ}
        strokeDashoffset={offset}
      />
    </svg>
  );
}

// Get user initial for avatar
function getUserInitial() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  return (user.username || user.name || "U")[0].toUpperCase();
}

// ─── component ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [document, setDocument] = useState(null);
  const [stagedFile, setStagedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadPreview, setUploadPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [chatTitle, setChatTitle] = useState("New Chat");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);
  const abortRef = useRef(null);
  const dragCounter = useRef(0);
  const userInitial = getUserInitial();

  const location = useLocation();
  const navigate = useNavigate();

  // Load existing chat if route param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const existingChatId = params.get("id");
    if (existingChatId) {
      const chat = getChat(existingChatId);
      if (chat) {
        setChatId(chat.id);
        setChatTitle(chat.title || "Untitled Chat");
        setMessages(chat.messages || []);
        if (chat.document) setDocument(chat.document);
      }
    } else {
      setChatId(generateChatId());
      setChatTitle("New Chat");
    }
  }, [location.search]);

  // Handle file passed from landing page
  useEffect(() => {
    if (location.state?.initialFile) {
      const mockEvent = { target: { files: [location.state.initialFile], value: "" } };
      setTimeout(() => handleFileChange(mockEvent), 300);
      window.history.replaceState({}, "");
    }
  }, [location.state]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  // Persist chat
  const persistChat = useCallback((msgs, doc, title) => {
    if (chatId && msgs.length > 0) {
      const isDefault = title === "New Chat" || title === "Untitled Chat";
      const saved = saveChat({ 
        id: chatId, 
        messages: msgs, 
        document: doc ? { id: doc.id, original_name: doc.original_name } : null,
        title: isDefault ? "" : title
      });
      // Update UI title if auto-generated a new one
      if (isDefault && saved.title && saved.title !== "New Chat") {
        setChatTitle(saved.title);
      }
    }
  }, [chatId]);

  useEffect(() => {
    persistChat(messages, document, chatTitle);
  }, [messages, document, chatTitle, persistChat]);

  // Sync URL with active chat so browser navigation works
  useEffect(() => {
    if (chatId && messages.length > 0 && !location.search.includes(`id=${chatId}`)) {
      navigate(`/chat?id=${chatId}`, { replace: true });
    }
  }, [chatId, messages.length, location.search, navigate]);

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

    setStagedFile(file);
    setError(null);

    // Build preview
    let previewUrl = null;
    if (file.type.startsWith("image/")) {
      previewUrl = URL.createObjectURL(file);
    }
    setUploadPreview({ name: file.name, previewUrl, type: file.type });
    setUploadProgress(0);

    // Clear input so same file can be selected again if cancelled
    if (e.target && e.target.value !== undefined) e.target.value = "";
  };

  const handleCancelUpload = () => {
    if (abortRef.current && uploading) {
      abortRef.current.abort();
    } else {
      setStagedFile(null);
      setUploadPreview(null);
    }
  };

  // ── message helpers ──
  const addMessage = (role, text, fileData = null, customId = null) => {
    const id = customId ?? Date.now() + Math.random();
    setMessages((prev) => [...prev, { id, role, text, fileData }]);
    return id;
  };

  const appendMessageChunk = (messageId, chunk) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, text: `${msg.text || ""}${chunk}` } : msg
      )
    );
  };

  // ── send question / staged file ──
  const handleSend = async () => {
    const q = input.trim();
    if (!q && !stagedFile) return;

    if (!document && !stagedFile) {
      setError("Please upload a document first before asking questions.");
      return;
    }

    setError(null);
    setInput("");
    
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      if (stagedFile) {
        setUploadProgress(0);
        setUploading(true);
        const doc = await uploadDocumentXHR(stagedFile, setUploadProgress, controller.signal);
        setDocument(doc);
        
        // Save references before clearing state
        const originalName = doc.original_name || stagedFile.name;
        const fileType = stagedFile.type;
        const docId = doc.id;

        setStagedFile(null);
        setUploadPreview(null);
        setUploading(false);

        // Render the single unified user bubble
        addMessage("user", q, { name: originalName, type: fileType });
        setLoading(true);
        setIsStreaming(true);

        const assistantMessageId = Date.now() + Math.random();
        addMessage("assistant", "", null, assistantMessageId);

        let receivedChunk = false;
        const onChunk = (chunk) => {
          if (!chunk) return;
          if (!receivedChunk) {
            receivedChunk = true;
            setLoading(false);
          }
          appendMessageChunk(assistantMessageId, chunk);
        };

        const finalText = q
          ? await askQuestion(docId, q, controller.signal, onChunk)
          : await fetchSummary(docId, controller.signal, onChunk);

        if (!receivedChunk) {
          setLoading(false);
          appendMessageChunk(assistantMessageId, finalText || "No response generated.");
        }
      } else {
        // No new file, just standard Q&A
        addMessage("user", q);
        setLoading(true);
        setIsStreaming(true);

        const assistantMessageId = Date.now() + Math.random();
        addMessage("assistant", "", null, assistantMessageId);

        let receivedChunk = false;
        const onChunk = (chunk) => {
          if (!chunk) return;
          if (!receivedChunk) {
            receivedChunk = true;
            setLoading(false);
          }
          appendMessageChunk(assistantMessageId, chunk);
        };

        const finalText = await askQuestion(document.id, q, controller.signal, onChunk);

        if (!receivedChunk) {
          setLoading(false);
          appendMessageChunk(assistantMessageId, finalText || "No response generated.");
        }
      }
    } catch (err) {
      if (err.name === "AbortError") {
        setUploadPreview(null);
        addMessage("system", "⏹ Cancelled.");
      } else {
        setError(err.message);
        setUploadPreview(null);
        addMessage("system", `❌ ${err.message}`);
      }
    } finally {
      setUploading(false);
      setIsStreaming(false);
      setLoading(false);
      setUploadProgress(0);
      abortRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleNewChat = () => {
    setMessages([]); setDocument(null); setStagedFile(null); setError(null); setInput("");
    setUploadPreview(null);
    setChatId(generateChatId());
    setChatTitle("New Chat");
    navigate("/chat");
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange({ target: { files: [e.dataTransfer.files[0]] } });
    }
  };

  const isProcessing = loading || uploading || isStreaming;

  // ─── render ─────────────────────────────────────────────────────────────────
  return (
    <div 
      className="chat-page"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <Sidebar />
      
      {isDragging && (
        <div className="drag-overlay animate-fade-in">
          <FileText size={56} className="drag-icon" />
          <h2>Drop document here</h2>
          <p>PDF, DOCX, or TXT</p>
        </div>
      )}

      {/* Top Bar */}
      <header className="chat-header">
        <div className="chat-header-center">
          <div className="chat-title-container">
            {isEditingTitle ? (
              <input
                type="text"
                className="chat-title-input animate-fade-in"
                value={chatTitle}
                autoFocus
                onBlur={() => setIsEditingTitle(false)}
                onChange={(e) => setChatTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') setIsEditingTitle(false); }}
              />
            ) : (
              <h2 className="chat-title-display animate-fade-in" onClick={() => setIsEditingTitle(true)} title="Click to rename">
                {chatTitle}
              </h2>
            )}
          </div>
          {document && (
            <div className="doc-badge animate-fade-slide-in">
              <CheckCircle size={16} className="doc-badge-icon" />
              <span className="doc-badge-name">{document.original_name}</span>
              <button
                onClick={() => { setDocument(null); setMessages([]); setChatId(generateChatId()); setChatTitle("New Chat"); }}
                className="doc-badge-close" title="Remove document"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
        <button className="new-chat-btn" onClick={handleNewChat} title="New Chat">
          <Sparkles size={16} />
          <span>New Chat</span>
        </button>
      </header>

      {/* Error banner */}
      {error && (
        <div className="error-banner animate-slide-down">
          <AlertCircle size={16} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="error-close"><X size={14} /></button>
        </div>
      )}

      {/* Messages Area */}
      <main className="chat-messages">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <img src="/legaleye logo.png" alt="Legal Eyes" className="chat-empty-logo animate-fade-in" />
            <h1 className="chat-empty-title animate-slide-up delay-1">Legal Eyes</h1>
            <p className="chat-empty-subtitle animate-slide-up delay-2">
              Upload a legal document and ask me anything about it.
            </p>
            <div className="chat-empty-hints animate-slide-up delay-3">
              <button className="hint-chip" onClick={() => fileInputRef.current?.click()}>
                <Paperclip size={14} />
                Upload a document to start
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-messages-list">
            {messages.map((msg, index) => (
              <div
                key={msg.id}
                className={`msg-row msg-${msg.role}`}
                style={{ animationDelay: `${Math.min(index * 40, 300)}ms` }}
              >
                {/* AI / System avatar — left side */}
                {(msg.role === "assistant" || msg.role === "system") && (
                  <div className="msg-avatar">
                    <img src="/legaleye logo.png" alt="LE" className="msg-avatar-img" />
                  </div>
                )}

                <div className={`msg-bubble msg-bubble-${msg.role}`}>
                  {msg.fileData ? (
                    <div className="msg-file-attachment">
                      <div className="msg-file-icon">
                        <FileText size={20} />
                      </div>
                      <div className="msg-file-info">
                        <span className="msg-file-name">{msg.fileData.name}</span>
                        <span className="msg-file-type">Document</span>
                      </div>
                    </div>
                  ) : (
                    <div className="msg-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.text}
                      </ReactMarkdown>
                    </div>
                  )}
                </div>

                {/* User avatar — right side */}
                {msg.role === "user" && (
                  <div className="msg-avatar-user">{userInitial}</div>
                )}
              </div>
            ))}

            {(loading || uploading) && (
              <div className="msg-row msg-assistant">
                <div className="msg-avatar">
                  <img src="/legaleye logo.png" alt="LE" className="msg-avatar-img" />
                </div>
                <div className="msg-bubble msg-bubble-assistant typing-bubble">
                  <div className="typing-dots">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </main>

      {/* Input Bar */}
      <div className="chat-input-container">
        {/* Upload Preview Card */}
        {uploadPreview && (
          <div className="upload-preview animate-fade-slide-in">
            <div className="upload-preview-card">
              <div className="upload-thumb-wrap">
                {uploadPreview.previewUrl ? (
                  <img src={uploadPreview.previewUrl} alt="preview" className="upload-thumb" />
                ) : (
                  <div className="upload-file-icon">
                    <FileText size={22} />
                  </div>
                )}
                <ProgressRing progress={uploadProgress} />
              </div>
              <div className="upload-preview-info">
                <div className="upload-preview-name">{uploadPreview.name}</div>
                <div className="upload-preview-status">
                  {uploading ? (uploadProgress < 100 ? `Uploading… ${uploadProgress}%` : "Processing…") : "Staged for upload - Press Send"}
                </div>
              </div>
              <button className="upload-preview-cancel" onClick={handleCancelUpload} title="Cancel upload">
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        <div className="chat-input-bar">
          <button
            className="input-btn attach-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessing}
            title="Attach document (PDF, DOCX, TXT)"
          >
            <Paperclip size={20} />
          </button>

          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={stagedFile ? "Ask a question along with your document..." : (document ? "Ask about your document…" : "Upload a document to start chatting…")}
            disabled={isProcessing}
            className="chat-textarea"
            rows={1}
          />

          {isProcessing ? (
            <button className="input-btn stop-btn" onClick={handleStop} title="Stop">
              <Square size={16} fill="currentColor" />
            </button>
          ) : (
            <button
              className="input-btn send-btn"
              onClick={handleSend}
              disabled={(!input.trim() && !stagedFile) || (!document && !stagedFile)}
              title="Send message"
            >
              <Send size={18} />
            </button>
          )}

          <input ref={fileInputRef} type="file" accept=".pdf,.docx,.txt"
            style={{ display: "none" }} onChange={handleFileChange} />
        </div>
        <p className="input-disclaimer">
          Legal Eyes may produce inaccurate information. Verify important legal details.
        </p>
      </div>
    </div>
  );
}
