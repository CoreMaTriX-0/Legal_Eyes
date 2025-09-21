import React from "react";
import { MessagesSquare, Search, Home, FileText, UserCircle, Paperclip, Send } from "lucide-react";

export default function ChatPage() {
  // Sidebar is always visible, expands on hover
  // File input ref for triggering file picker
  const fileInputRef = React.useRef(null);
  const handleAttachClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  const handleFileChange = (e) => {
    // You can handle the selected file(s) here
    // Example: console.log(e.target.files);
  };
  return (
    <div style={{ display: 'flex', minHeight: '100vh', height: '100vh', background: '#1E1E1E', overflow: 'hidden' }}>
      {/* Sidebar */}
      <div
        className="sidebar-strip"
        style={{
          width: 60,
          transition: 'width 0.25s',
          background: '#fff',
          overflow: 'visible',
          boxShadow: '2px 0 16px rgba(0,0,0,0.08)',
          position: 'relative',
          zIndex: 10,
          borderRight: '1px solid #ececec',
        }}
        onMouseEnter={e => e.currentTarget.style.width = '220px'}
        onMouseLeave={e => e.currentTarget.style.width = '60px'}
      >
        <div style={{ padding: '24px 0', height: '100%', position: 'relative' }}>
          {/* Hamburger lines indicator */}
          <div className="sidebar-hint" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18, transition: 'opacity 0.2s' }}>
            <div style={{ width: 28, height: 3, background: '#222', borderRadius: 2, margin: '3px 0' }}></div>
            <div style={{ width: 28, height: 3, background: '#222', borderRadius: 2, margin: '3px 0' }}></div>
            <div style={{ width: 28, height: 3, background: '#222', borderRadius: 2, margin: '3px 0' }}></div>
          </div>
          <h2 style={{ fontSize: 26, fontWeight: 700, marginBottom: 48, color: '#222', letterSpacing: 1, fontFamily: 'Itim, cursive', textAlign: 'center', opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }} className="sidebar-label">Legal Eyes</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <a href="/" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Home style={{ width: 28, height: 28, color: '#222' }} />
                <span className="sidebar-label" style={{ fontSize: 14, marginTop: 6, opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}>Home</span>
              </a>
            </li>
            <li style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <a href="/chat" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <MessagesSquare style={{ width: 28, height: 28, color: '#222' }} />
                <span className="sidebar-label" style={{ fontSize: 14, marginTop: 6, opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}>Chat</span>
              </a>
            </li>
            <li style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <a href="/search-history" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Search style={{ width: 28, height: 28, color: '#222' }} />
                <span className="sidebar-label" style={{ fontSize: 14, marginTop: 6, opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}>Search History</span>
              </a>
            </li>
            <li style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <a href="/documents" style={{ color: '#222', textDecoration: 'none', fontWeight: 500, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <FileText style={{ width: 28, height: 28, color: '#222' }} />
                <span className="sidebar-label" style={{ fontSize: 14, marginTop: 6, opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}>Documents</span>
              </a>
            </li>
          </ul>
          {/* Profile icon at bottom */}
          <div style={{ position: 'absolute', bottom: 24, left: 0, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <a href="/login" style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <UserCircle style={{ width: 38, height: 38, color: '#222', cursor: 'pointer', transition: 'transform 0.18s', background: '#fff', borderRadius: '50%', boxShadow: '0 2px 8px rgba(0,0,0,0.10)' }} />
              <span className="sidebar-label" style={{ color: '#222', fontSize: 14, marginTop: 4, fontWeight: 500, opacity: 0, transition: 'opacity 0.2s', pointerEvents: 'none' }}>Profile</span>
            </a>
          </div>
        </div>
        <style>{`
          .sidebar-strip:hover .sidebar-hint {
            opacity: 0 !important;
            pointer-events: none !important;
          }
          .sidebar-strip:hover {
            width: 220px !important;
          }
          .sidebar-strip:hover .sidebar-label {
            opacity: 1 !important;
            pointer-events: auto !important;
          }
        `}</style>
      </div>
      {/* Conversation/Search Bar at Bottom */}
      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: 0,
        background: 'transparent',
        zIndex: 20,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 32
      }}>
        <div style={{
          background: '#222',
          borderRadius: 32,
          boxShadow: '0 -2px 16px rgba(0,0,0,0.10)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          width: 550,
          maxWidth: '120vw',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <input
              type="text"
              placeholder="Type your message..."
              style={{
                width: 420,
                padding: '10px 16px',
                borderRadius: 24,
                border: 'none',
                fontSize: 18,
                background: '#333',
                color: '#fff',
                outline: 'none',
                marginRight: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)'
              }}
            />
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: 8
              }}
              title="Send message"
            >
              <Send style={{ width: 26, height: 26, color: '#fff' }} />
            </button>
            <button
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Attach document"
              onClick={handleAttachClick}
            >
              <Paperclip style={{ width: 28, height: 28, color: '#fff' }} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
          </div>
        </div>
      </div>
      {/* Main chat content */}
      <div style={{ flex: 1, position: 'relative', minHeight: '100vh', background: 'transparent' }}>
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: 400,
          zIndex: 5,
        }}>
          <img src="/legaleye logo.png" alt="Legal Eyes Logo" style={{ width: 200, height: 200, objectFit: 'contain', marginBottom: 0, display: 'block' }} />
          <h1 style={{ fontSize: 36, fontWeight: 700, marginTop: 16, marginBottom: 50, color: '#fff', textAlign: 'center', letterSpacing: 1, fontFamily: 'Itim, cursive', width: '100%' }}>Legal Eyes Chat</h1>
        </div>
      </div>
    </div>
  );
}
