import React from "react";
import "../components/Auth/Auth.css";
import { MessagesSquare, File, UserCircle, Folder, FolderArchive } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function IndexPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col items-center justify-center relative">
      {/* Profile Icon (Top Right) */}
      <div
        style={{ position: "fixed", top: 24, right: 32, zIndex: 1000, cursor: "pointer" }}
        onClick={() => navigate('/login')}
        className="profile-icon-container"
      >
        <UserCircle className="profile-icon" style={{ color: '#f5f5f5' }} />
      </div>
      <style>{`
        .profile-icon {
          transition: transform 0.18s cubic-bezier(.4,2,.3,1), box-shadow 0.18s;
        }
        .profile-icon-container:hover .profile-icon {
          transform: scale(1.12);
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.25);
        }
      `}</style>

      {/* Centered Logo and Legal eyes text */}
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', maxWidth: 340, margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <img
            src="/legaleye logo.png"
            alt="Legal Eyes Logo"
            style={{ width: 200, height: 200, objectFit: 'contain', marginBottom: 0 }}
          />
          <span style={{
            fontFamily: 'Itim, cursive',
            fontSize: 50,
            color: '#fff',
            textAlign: 'center',
            marginTop: 0,
            marginBottom: 300,
            fontWeight: 'bold',
            textShadow: '0 2px 2px #dededeff, 2px 2px 8px #222',
            display: 'block'
          }}>Legal Eyes</span>
        </div>
      </div>
      {/* Buttons at bottom */}
      <div style={{ position: 'fixed', left: 0, right: 0, bottom: 30, display: 'flex', gap: 32, justifyContent: 'center' }}>
  <button className="btn" style={{ background: '#F2F2F2', color: '#222', padding: '32px 40px', borderRadius: 24, boxShadow: '0 32px 96px 0 rgba(0,0,0,0.30)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: 317, height: 227, fontSize: 22, fontWeight: 500, border: 'none', cursor: 'pointer' }} onClick={() => navigate('/chat')}>
          <MessagesSquare style={{ width: 40, height: 40, marginBottom: 12, color: '#2f2f2f' }} />
          Chat with LE
        </button>
  <button className="btn" style={{ background: '#F2F2F2', color: '#222', padding: '32px 40px', borderRadius: 24, boxShadow: '0 16px 48px 0 rgba(0,0,0,0.30)', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 50, justifyContent: 'center', width: 317, height: 227, fontSize: 22, fontWeight: 500, border: 'none', cursor: 'pointer' }} onClick={() => navigate('/upload')}>
          <FolderArchive style={{ width: 40, height: 40, marginBottom: 12, color: '#2f2f2f' }} />
          Upload Document
        </button>
      </div>
      <style>{`
        .btn {
          transition: transform 0.18s cubic-bezier(.4,2,.3,1), box-shadow 0.18s;
        }
        .btn:hover {
          transform: scale(1.00);
          box-shadow: 0 36px 112px 0 rgba(0,0,0,0.35);
        }
      `}</style>
    </div>
  );
}