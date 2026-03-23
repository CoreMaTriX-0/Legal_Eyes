import React from "react";
import "../components/Auth/Auth.css";
import { MessagesSquare, File, UserCircle, Folder, FolderArchive } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
    <div className="landing-container">
      {/* Profile Icon (Top Right) */}
      <div className="profile-icon-container" onClick={() => navigate('/login')}>
        <UserCircle className="profile-icon" />
      </div>

      {/* Main Content */}
      <div className="landing-content">
        <div className="logo-container">
          <img src="/legaleye logo.png" alt="Legal Eyes Logo" className="landing-logo" />
          <span className="landing-title">Legal Eyes</span>
        </div>

        {/* Hidden File Input for seamless uploads */}
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          onChange={handleFileChange} 
          accept=".pdf,.docx,.txt"
        />

        {/* Buttons at bottom */}
        <div className="landing-buttons">
          <button className="btn landing-btn" onClick={() => navigate('/chat')}>
            <MessagesSquare className="btn-icon" />
            Chat with LE
          </button>
          <button className="btn landing-btn" onClick={() => fileInputRef.current.click()}>
            <FolderArchive className="btn-icon" />
            Upload Document
          </button>
        </div>
      </div>

      <style>{`
        .landing-container {
          min-height: 100vh;
          background-color: #1E1E1E;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
        }

        .profile-icon-container {
          position: absolute;
          top: 24px;
          right: 32px;
          z-index: 1000;
          cursor: pointer;
        }

        .profile-icon {
          color: #f5f5f5;
          width: 38px;
          height: 38px;
          transition: transform 0.18s cubic-bezier(.4,2,.3,1), box-shadow 0.18s;
        }

        .profile-icon-container:hover .profile-icon {
          transform: scale(1.12);
          box-shadow: 0 4px 24px 0 rgba(0,0,0,0.25);
        }

        .landing-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 20px;
          gap: 60px;
        }

        .logo-container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .landing-logo {
          width: 200px;
          height: 200px;
          object-fit: contain;
        }

        .landing-title {
          font-family: 'Itim', cursive;
          font-size: 50px;
          color: #fff;
          text-align: center;
          font-weight: bold;
          text-shadow: 0 2px 2px #dededeff, 2px 2px 8px #222;
        }

        .landing-buttons {
          display: flex;
          gap: 32px;
          justify-content: center;
          flex-wrap: wrap;
          width: 100%;
          max-width: 800px;
        }

        .landing-btn {
          background: #F2F2F2;
          color: #222;
          padding: 32px 40px;
          border-radius: 24px;
          box-shadow: 0 32px 96px 0 rgba(0,0,0,0.30);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 317px;
          height: 227px;
          font-size: 22px;
          font-weight: 500;
          border: none;
          cursor: pointer;
          transition: transform 0.18s cubic-bezier(.4,2,.3,1), box-shadow 0.18s;
        }

        .btn-icon {
          width: 40px;
          height: 40px;
          margin-bottom: 12px;
          color: #2f2f2f;
        }

        .landing-btn:hover {
          transform: scale(1.02);
          box-shadow: 0 36px 112px 0 rgba(0,0,0,0.35);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .profile-icon-container {
            top: 16px;
            right: 16px;
          }
          
          .landing-content {
            gap: 40px;
            padding: 80px 20px 40px 20px;
          }

          .landing-logo {
            width: 140px;
            height: 140px;
          }

          .landing-title {
            font-size: 40px;
            text-shadow: 0 1px 1px #dededeff, 1px 1px 4px #222;
          }

          .landing-buttons {
            flex-direction: column;
            align-items: center;
            gap: 20px;
          }

          .landing-btn {
            width: 100%;
            max-width: 350px;
            height: 160px;
            padding: 24px;
            font-size: 20px;
            border-radius: 20px;
          }
          
          .btn-icon {
            width: 32px;
            height: 32px;
            margin-bottom: 8px;
          }
        }
      `}</style>
    </div>
  );
}