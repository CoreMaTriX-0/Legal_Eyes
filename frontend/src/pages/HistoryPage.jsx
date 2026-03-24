import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Trash2, Search, MessagesSquare, FileText, X, AlertCircle } from "lucide-react";
import Sidebar from "../components/Sidebar/Sidebar";
import { getAllChats, deleteChat, groupChatsByDate, updateChatTitle } from "../utils/chatHistory";
import "./HistoryPage.css";

export default function HistoryPage() {
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingChat, setDeletingChat] = useState(null);
  const [editingChatId, setEditingChatId] = useState(null);
  const [editTitleValue, setEditTitleValue] = useState("");

  useEffect(() => {
    setChats(getAllChats());
  }, []);

  const handleDelete = (chat, e) => {
    e.stopPropagation();
    setDeletingChat(chat);
  };

  const confirmDeleteChat = () => {
    if (deletingChat) {
      deleteChat(deletingChat.id);
      setChats(getAllChats());
      setDeletingChat(null);
    }
  };

  const cancelDelete = () => {
    setDeletingChat(null);
  };

  const startEditingTitle = (chat, e) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitleValue(chat.title || "Untitled Chat");
  };

  const saveEditedTitle = (chat, e) => {
    if (e) e.stopPropagation();
    if (editTitleValue.trim()) {
      updateChatTitle(chat.id, editTitleValue.trim());
      setChats(getAllChats());
    }
    setEditingChatId(null);
  };

  const handleOpenChat = (chatId) => {
    if (editingChatId === chatId) return;
    navigate(`/chat?id=${chatId}`);
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (chat.title || '').toLowerCase().includes(q) ||
      (chat.document?.original_name || '').toLowerCase().includes(q) ||
      (chat.messages || []).some(m => m.text.toLowerCase().includes(q))
    );
  });

  const groupedChats = groupChatsByDate(filteredChats);

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getPreviewText = (messages) => {
    if (!messages || messages.length === 0) return 'No messages';
    const last = [...messages].reverse().find(m => m.role === 'assistant' || m.role === 'user');
    if (!last) return 'No messages';
    return last.text.length > 80 ? last.text.substring(0, 80) + '…' : last.text;
  };

  return (
    <div className="history-page">
      <Sidebar />

      <header className="history-header">
        <div className="history-header-inner">
          <h1 className="history-title animate-slide-up">Chat History</h1>
          <p className="history-subtitle animate-slide-up delay-1">
            Your previous conversations with Legal Eyes
          </p>
        </div>
      </header>

      <main className="history-content">
        {/* Search */}
        <div className="history-search-container animate-fade-slide-in delay-2">
          <div className="history-search">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search conversations…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button className="search-clear" onClick={() => setSearchQuery("")}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Chat List */}
        {filteredChats.length === 0 ? (
          <div className="history-empty animate-fade-in">
            <Clock size={48} strokeWidth={1.2} className="empty-icon" />
            <h2>{searchQuery ? 'No matching chats' : 'No chat history yet'}</h2>
            <p>{searchQuery ? 'Try a different search term.' : 'Start a new chat to see your history here.'}</p>
            {!searchQuery && (
              <button className="history-cta" onClick={() => navigate('/chat')}>
                <MessagesSquare size={16} />
                Start a Chat
              </button>
            )}
          </div>
        ) : (
          <div className="history-groups">
            {Object.entries(groupedChats).map(([groupName, groupChats]) => {
              if (groupChats.length === 0) return null;
              return (
                <div key={groupName} className="history-group">
                  <h3 className="group-label">{groupName}</h3>
                  <div className="group-list">
                    {groupChats.map((chat, index) => (
                      <div
                        key={chat.id}
                        className="history-card"
                        onClick={() => handleOpenChat(chat.id)}
                        style={{ animationDelay: `${index * 60}ms` }}
                      >
                        <div className="card-icon-wrapper">
                          <MessagesSquare size={18} />
                        </div>
                        <div className="card-body">
                          <div className="card-header-row">
                            {editingChatId === chat.id ? (
                              <input
                                type="text"
                                className="history-title-input"
                                value={editTitleValue}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                                onBlur={(e) => saveEditedTitle(chat, e)}
                                onChange={(e) => setEditTitleValue(e.target.value)}
                                onKeyDown={(e) => { 
                                  if (e.key === 'Enter') saveEditedTitle(chat, e); 
                                  if (e.key === 'Escape') { e.stopPropagation(); setEditingChatId(null); }
                                }}
                              />
                            ) : (
                              <h4 
                                className="card-title" 
                                onClick={(e) => startEditingTitle(chat, e)} 
                                title="Click to rename" 
                              >
                                {chat.title || 'Untitled Chat'}
                              </h4>
                            )}
                            <span className="card-time">{formatTime(chat.updatedAt)}</span>
                          </div>
                          <p className="card-preview">{getPreviewText(chat.messages)}</p>
                          <div className="card-meta">
                            {chat.document && (
                              <span className="card-doc">
                                <FileText size={12} />
                                {chat.document.original_name}
                              </span>
                            )}
                            <span className="card-date">{formatDate(chat.updatedAt)}</span>
                          </div>
                        </div>
                        <button
                          className="card-delete"
                          onClick={(e) => handleDelete(chat, e)}
                          title="Delete chat"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Delete Confirmation Modal */}
      {deletingChat && (
        <div className="delete-modal-overlay animate-fade-in" onClick={cancelDelete}>
          <div className="delete-modal animate-scale-in" onClick={e => e.stopPropagation()}>
            <div className="delete-modal-icon">
              <AlertCircle size={28} />
            </div>
            <h3 className="delete-modal-title">Delete Chat?</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete the chat <strong>"{deletingChat.title || 'Untitled Chat'}"</strong>? <br /><br />
              This action is irrecoverable and the chat will be permanently removed.
            </p>
            <div className="delete-modal-actions">
              <button className="btn-cancel" onClick={cancelDelete}>Cancel</button>
              <button className="btn-confirm-delete" onClick={confirmDeleteChat}>
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
