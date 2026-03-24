import React from "react";
import { MessagesSquare, FolderArchive, UserCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { isAuthenticated } from "../utils/authApi";
import "./IndexPage.css";

export default function IndexPage() {
  const navigate = useNavigate();
  const fileInputRef = React.useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      navigate('/chat', { state: { initialFile: file } });
    }
  };

  return (
    <div className="landing-page">
      {/* Background Particles */}
      <div className="landing-particles">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${10 + i * 15}%`,
            animationDelay: `${i * 2}s`,
            animationDuration: `${8 + i * 2}s`,
          }} />
        ))}
      </div>

      {/* Profile / Login Link */}
      <div className="landing-topbar">
        <button
          className="landing-profile-btn"
          onClick={() => navigate(isAuthenticated() ? '/chat' : '/login')}
        >
          <UserCircle size={24} />
          <span>
            {isAuthenticated() 
              ? (JSON.parse(localStorage.getItem('user') || '{}').username || JSON.parse(localStorage.getItem('user') || '{}').name || 'Profile') 
              : 'Sign In'}
          </span>
          <ArrowRight size={14} />
        </button>
      </div>

      {/* Main Content */}
      <div className="landing-hero">
        <img
          src="/legaleye logo.png"
          alt="Legal Eyes Logo"
          className="landing-logo animate-fade-in"
        />
        <h1 className="landing-title animate-slide-up delay-1">Legal Eyes</h1>
        <p className="landing-subtitle animate-slide-up delay-2">
          AI-powered legal document analysis for Indian law
        </p>

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept=".pdf,.docx,.txt"
        />

        {/* Action Buttons */}
        <div className="landing-actions animate-slide-up delay-3">
          <button className="landing-card" onClick={() => navigate('/chat')}>
            <div className="landing-card-icon">
              <MessagesSquare size={28} />
            </div>
            <div className="landing-card-text">
              <span className="landing-card-title">Chat with LE</span>
              <span className="landing-card-desc">Ask questions about your legal documents</span>
            </div>
            <ArrowRight size={18} className="landing-card-arrow" />
          </button>

          <button className="landing-card" onClick={() => fileInputRef.current.click()}>
            <div className="landing-card-icon upload-icon">
              <FolderArchive size={28} />
            </div>
            <div className="landing-card-text">
              <span className="landing-card-title">Upload Document</span>
              <span className="landing-card-desc">PDF, DOCX, or TXT files supported</span>
            </div>
            <ArrowRight size={18} className="landing-card-arrow" />
          </button>
        </div>
      </div>

      <footer className="landing-footer animate-fade-in delay-5">
        <p>Secure · Private · Built for Indian Legal Professionals</p>
      </footer>
    </div>
  );
}