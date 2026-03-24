import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Menu, X, Home, MessagesSquare, Clock, FileText, UserCircle, LogOut
} from 'lucide-react';
import { clearAuthData } from '../../utils/authApi';
import './Sidebar.css';

const NAV_ITEMS = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/chat', icon: MessagesSquare, label: 'Chat' },
  { path: '/history', icon: Clock, label: 'History' },
  { path: '/documents', icon: FileText, label: 'Documents' },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleLogout = () => {
    clearAuthData();
    navigate('/login');
  };

  const handleNavClick = (path) => {
    navigate(path);
    setOpen(false);
  };

  return (
    <>
      {/* Hamburger Toggle */}
      <button
        className="sidebar-hamburger"
        onClick={() => setOpen(!open)}
        aria-label={open ? 'Close menu' : 'Open menu'}
      >
        {open ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* Overlay */}
      <div
        className={`sidebar-overlay ${open ? 'visible' : ''}`}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar Panel */}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-header">
          <img src="/legaleye logo.png" alt="Legal Eyes" className="sidebar-logo" />
          <span className="sidebar-brand">Legal Eyes</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
            <button
              key={path}
              className={`sidebar-nav-item ${location.pathname === path ? 'active' : ''}`}
              onClick={() => handleNavClick(path)}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-nav-item" onClick={() => handleNavClick('/dashboard')}>
            <UserCircle size={20} />
            <span>Profile</span>
          </button>
          <button className="sidebar-nav-item logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <nav className="mobile-nav">
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            className={`mobile-nav-item ${location.pathname === path ? 'active' : ''}`}
            onClick={() => navigate(path)}
          >
            <Icon size={20} />
            <span className="mobile-nav-label">{label}</span>
          </button>
        ))}
        <button className="mobile-nav-item" onClick={() => navigate('/dashboard')}>
          <UserCircle size={20} />
          <span className="mobile-nav-label">Profile</span>
        </button>
      </nav>
    </>
  );
}
