import React from "react";

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#1E1E1E] text-white">
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 24 }}>Legal Eyes Chat</h1>
      <div style={{ background: '#222', borderRadius: 16, padding: 32, minWidth: 340, minHeight: 220, boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}>
        <p style={{ color: '#aaa', fontSize: 18 }}>
          Welcome to the chat! Start your conversation here.
        </p>
      </div>
    </div>
  );
}
