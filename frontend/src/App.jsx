import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from './context/AuthContext';
import AuthGate from './components/AuthGate';
import { API_URL } from './config';

/* ── Helper: Material Icon shorthand ── */
function Icon({ name, fill = false, size = 'text-[20px]', className = '' }) {
  return (
    <span
      className={`material-symbols-outlined ${size} ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : {}}
    >
      {name}
    </span>
  );
}

/* ── Profile Panel ── */
function ProfilePanel({ onClose, sessions, user, logout }) {
  const { token } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ full_name: user?.full_name || '', email: user?.email || '' });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const firstSession = sessions.length > 0
    ? new Date(sessions[sessions.length - 1].updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Today';

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        window.location.reload();
      } else {
        const err = await res.json();
        alert('Failed to update: ' + (err.detail || 'Unknown error'));
        setIsSaving(false);
      }
    } catch (e) {
      alert('Error updating profile');
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/${user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        logout();
        window.location.href = '/';
      } else {
        alert('Failed to delete account');
        setIsSaving(false);
      }
    } catch (e) {
      alert('Error deleting account');
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      {/* Panel */}
      <div className="relative ml-auto w-full md:w-[340px] h-full bg-surface-container-low border-l border-surface-variant/30 shadow-2xl shadow-black/40 flex flex-col animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface-variant/30">
          <h2 className="font-headline font-bold text-lg text-on-surface">Profile</h2>
          <button onClick={onClose} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
            <Icon name="close" size="text-[20px]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <div className="w-20 h-20 rounded-full surgical-gradient flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-on-primary-container font-headline font-bold text-3xl">
                {user?.full_name?.charAt(0) || 'U'}
              </span>
            </div>
            {editing ? (
              <div className="w-full flex flex-col gap-3 mt-2">
                <input 
                  type="text" 
                  value={editForm.full_name} 
                  onChange={e => setEditForm({...editForm, full_name: e.target.value})}
                  className="w-full bg-surface-container-high text-on-surface text-sm rounded px-3 py-2 border border-primary outline-none" 
                  placeholder="Full Name"
                />
                <input 
                  type="email" 
                  value={editForm.email} 
                  onChange={e => setEditForm({...editForm, email: e.target.value})}
                  className="w-full bg-surface-container-high text-on-surface text-sm rounded px-3 py-2 border border-outline-variant outline-none focus:border-primary" 
                  placeholder="Email"
                />
                <div className="flex gap-2 mt-1">
                  <button onClick={() => setEditing(false)} className="flex-1 px-3 py-1.5 text-xs text-on-surface-variant hover:bg-surface-container-high rounded transition-colors font-medium">Cancel</button>
                  <button onClick={handleSaveProfile} disabled={isSaving} className="flex-1 px-3 py-1.5 surgical-gradient text-on-primary-container font-bold text-xs rounded transition-opacity hover:opacity-90 disabled:opacity-50">Save</button>
                </div>
              </div>
            ) : (
              <div>
                <p className="font-headline font-bold text-on-surface text-lg">
                  {user?.full_name || 'Dr. Unknown'}
                </p>
                <p className="text-on-surface-variant text-xs font-medium mt-1">{user?.email}</p>
                <button onClick={() => setEditing(true)} className="mt-2 text-primary text-xs font-bold hover:underline flex items-center justify-center gap-1 mx-auto">
                  <Icon name="edit" size="text-[14px]"/> Edit Profile
                </button>
              </div>
            )}
          </div>

          {!editing && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-surface-container-high rounded-lg p-4 text-center">
                  <p className="font-headline text-2xl font-bold text-primary">{sessions.length}</p>
                  <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mt-1">Consultations</p>
                </div>
                <div className="bg-surface-container-high rounded-lg p-4 text-center">
                  <p className="font-headline text-sm font-bold text-primary leading-tight">{firstSession}</p>
                  <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest mt-1">Member Since</p>
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 p-3 bg-surface-container-high rounded-lg">
                  <Icon name="verified" size="text-[18px]" className="text-primary flex-shrink-0" />
                  <div>
                    <p className="text-on-surface-variant text-[10px] font-bold uppercase tracking-widest">Status</p>
                    <p className="text-on-surface text-xs font-bold mt-0.5">Active</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-surface-variant/30 flex flex-col gap-3">
          {isDeleting ? (
            <div className="bg-error/10 border border-error/20 p-4 rounded-lg flex flex-col gap-3 text-center">
              <p className="text-error font-headline font-bold text-sm">Delete Account?</p>
              <p className="text-on-surface-variant text-xs font-medium">This action is permanent and cannot be undone.</p>
              <div className="flex gap-2 mt-1">
                <button onClick={() => setIsDeleting(false)} className="flex-1 px-3 py-2 text-xs text-on-surface-variant hover:bg-surface-container-high rounded transition-colors font-medium">Cancel</button>
                <button onClick={handleDeleteProfile} disabled={isSaving} className="flex-1 px-3 py-2 bg-error text-white font-bold text-xs rounded transition-opacity hover:opacity-90 disabled:opacity-50">Confirm Delete</button>
              </div>
            </div>
          ) : (
             <button
              onClick={() => setIsDeleting(true)}
              className="w-full h-11 rounded-lg bg-surface-container-high text-error font-headline font-bold text-sm hover:bg-error/10 transition-colors"
            >
              Delete Account
            </button>
          )}

          {!isDeleting && (
            <button
              onClick={() => { logout(); onClose(); }}
              className="w-full flex items-center justify-center gap-2 h-11 rounded-lg border border-outline-variant/30 text-on-surface-variant font-headline font-bold text-sm hover:bg-surface-container-high hover:text-on-surface transition-colors"
            >
              <Icon name="logout" size="text-[18px]" /> Disconnect
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Shared Chat View ── */
function SharedChatView({ shareId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/chat/share/${shareId}`)
      .then(res => {
        if (!res.ok) throw new Error('Shared consultation not found');
        return res.json();
      })
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [shareId]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-on-surface">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 rounded-full bg-primary animate-ping" />
          <span className="font-headline font-medium">Loading Shared Consultation...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface text-error flex-col gap-4">
        <Icon name="error" size="text-[48px]" />
        <span className="font-headline font-bold text-lg">{error}</span>
        <button onClick={() => window.location.href = '/'} className="px-6 py-2 surgical-gradient text-on-primary-container rounded shadow hover:opacity-90">Start Your Own</button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex h-screen w-full max-w-[1440px] mx-auto bg-surface relative flex-col">
      <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 bg-surface/90 glass-effect border-b border-surface-variant/30 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <img src="/avatar.png" alt="NEXUS AI Avatar" className="w-8 h-8 rounded-full shadow-[0_4px_12px_rgba(74,142,255,0.2)]" />
          <h2 className="text-on-surface font-headline font-bold text-lg">NEXUS AI <span className="text-on-surface-variant font-normal">| Shared</span></h2>
          <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant font-label text-[10px] uppercase font-bold tracking-widest">
            Read-Only
          </span>
        </div>
        <button onClick={() => window.location.href = '/'} className="px-4 py-2 surgical-gradient text-on-primary-container font-headline font-bold text-sm rounded hover:opacity-90 shadow-[0_4px_12px_rgba(74,142,255,0.15)] transition-opacity">
          Start Your Own
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar flex flex-col gap-6 pb-20">
        <div className="max-w-4xl mx-auto w-full mb-6 text-center">
          <h1 className="text-2xl font-headline font-bold text-on-surface">{data.title}</h1>
          <p className="text-sm text-on-surface-variant mt-2 font-medium">This is a read-only shared clinical consultation.</p>
        </div>

        {data.messages.map((msg, i) => (
          msg.role === 'user' ? (
            <div key={i} className="flex flex-col items-end gap-1 w-full max-w-4xl mx-auto group">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-on-surface font-headline text-sm font-medium">Student</span>
              </div>
              <div className="relative bg-[#21262d] text-[#e6edf3] p-4 md:p-5 rounded-[0.75rem] rounded-tr-[0.25rem] max-w-[95%] md:max-w-[85%] border border-[#30363d] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <p className="font-body text-[15px] leading-[1.6] whitespace-pre-wrap">{msg.content}</p>
              </div>
            </div>
          ) : (
            <div key={i} className="flex flex-col items-start gap-1 w-full max-w-4xl mx-auto group">
              <div className="flex items-center gap-2 mb-1">
                <img src="/avatar.png" alt="NEXUS AI Avatar" className="w-6 h-6 rounded-full object-cover shadow-sm shadow-primary/30" />
                <span className="text-primary font-headline text-sm font-bold tracking-wide">NEXUS AI</span>
              </div>
              <div className="relative bg-[#161b22] text-[#e6edf3] p-4 md:p-6 rounded-[0.75rem] rounded-tl-[0.25rem] max-w-[95%] md:max-w-[90%] border border-[#30363d] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                <div className="font-body text-[15px] leading-[1.7] prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-headings:font-headline prose-headings:text-[#e6edf3] prose-a:text-primary hover:prose-a:text-primary-container prose-strong:text-[#e6edf3] prose-ul:my-2 prose-li:my-0.5 prose-th:text-[#e6edf3] prose-td:border-[#30363d] prose-th:border-[#30363d] prose-table:border-[#30363d]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [sharedId, setSharedId] = useState(null);

  useEffect(() => {
    const p = window.location.pathname;
    if (p.startsWith('/shared/')) {
      const id = p.split('/shared/')[1];
      if (id) {
        setSharedId(id);
      }
    }
  }, []);

  const { isAuthenticated, token, user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Welcome, Colleague. How can I assist with your clinical cases or ENT revision today?' }
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [sessions, setSessions] = useState([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editCache, setEditCache] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [renameId, setRenameId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);
  
  const getInitialThread = () => {
    const hash = window.location.hash.replace('#', '');
    return hash && hash.length === 36 ? hash : crypto.randomUUID();
  };
  const threadId = useRef(getInitialThread());
  const menuRef = useRef(null);

  useEffect(() => {
    window.location.hash = threadId.current;
  }, []);

  // Close 3-dot menu when clicking outside
  useEffect(() => {
    const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpenId(null); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Track mobile/desktop breakpoint
  useEffect(() => {
    const mql = window.matchMedia('(max-width: 767px)');
    const handler = (e) => {
      setIsMobile(e.matches);
      if (e.matches) setSidebarOpen(false);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 2500);
  };

  // Auto-scroll to bottom on every message update (including each streaming chunk)
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const loadSessions = async () => {
    try {
      const res = await fetch(`${API_URL}/api/chat/sessions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadHistory = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/chat/history/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (res.ok) {
        const data = await res.json();
        threadId.current = data.thread_id;
        window.location.hash = data.thread_id;
        setMessages(data.messages || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isAuthenticated && token) {
      loadSessions();
      const hash = window.location.hash.replace('#', '');
      if (hash && hash.length === 36) {
        loadHistory(hash);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, token]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    // Block sending if not connected
    if (!isAuthenticated) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsStreaming(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input, thread_id: threadId.current }),
      });
      if (!response.ok) throw new Error('Backend Connection Failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiResponse += decoder.decode(value);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: aiResponse };
          return updated;
        });
      }
    } catch (error) {
      console.error('Streaming Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Error: Could not reach the Clinical Engine. Ensure Uvicorn is running.' },
      ]);
    } finally {
      setIsStreaming(false);
      loadSessions();
    }
  };

  const handleEditSubmit = async (index) => {
    if (!editCache.trim() || isStreaming) {
      setEditingIndex(null);
      return;
    }
    
    const newHistory = messages.slice(0, index);
    newHistory.push({ role: 'user', content: editCache });
    setMessages(newHistory);
    setEditingIndex(null);
    setIsStreaming(true);

    try {
      await fetch(`${API_URL}/api/chat/edit`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          thread_id: threadId.current, 
          message_index: index, 
          new_content: editCache 
        }),
      });

      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ message: editCache, thread_id: threadId.current }),
      });
      
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponse = '';
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        aiResponse += decoder.decode(value);
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = { ...updated[updated.length - 1], content: aiResponse };
          return updated;
        });
      }
    } catch (error) {
       console.error(error);
    } finally {
       setIsStreaming(false);
       loadSessions();
    }
  };

  const handleNewConsultation = () => {
    threadId.current = crypto.randomUUID();
    window.location.hash = threadId.current;
    setMessages([
      { role: 'assistant', content: 'New consultation started. How can I assist you today?' },
    ]);
  };

  const toggleSidebar = () => setSidebarOpen(prev => !prev);

  // ── Share consultation ──
  const handleShare = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await fetch(`${API_URL}/api/chat/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ thread_id: threadId.current }),
      });
      if (res.ok) {
        const data = await res.json();
        const link = `${window.location.origin}/shared/${data.share_id}`;
        setShareLink(link);
        setShowShareModal(true);
      } else {
        showToast('Start a conversation before sharing');
      }
    } catch (e) {
      console.error(e);
      showToast('Could not generate share link');
    }
  };

  // ── Download as PDF ──
  const handleDownloadPDF = () => {
    // Build a clean HTML document for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) { showToast('Please allow popups to download PDF'); return; }

    const chatHTML = messages.map(m => {
      const role = m.role === 'user' ? 'Student' : 'NEXUS AI';
      const bg = m.role === 'user' ? '#e3f2fd' : '#f5f5f5';
      const align = m.role === 'user' ? 'right' : 'left';
      return `<div style="margin:12px 0;text-align:${align}">
        <div style="display:inline-block;max-width:80%;background:${bg};padding:14px 18px;border-radius:12px;text-align:left">
          <strong style="color:#1a73e8;font-size:12px;text-transform:uppercase;letter-spacing:1px">${role}</strong>
          <div style="margin-top:6px;font-size:14px;line-height:1.7;white-space:pre-wrap">${m.content}</div>
        </div>
      </div>`;
    }).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>NEXUS AI Consultation</title>
        <style>
          body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a; }
          h1 { font-size: 20px; color: #1a73e8; border-bottom: 2px solid #e8eaed; padding-bottom: 12px; }
          .meta { font-size: 11px; color: #666; margin-bottom: 24px; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <h1>NEXUS AI — Clinical Consultation</h1>
        <div class="meta">Exported ${new Date().toLocaleString()} • ${messages.length} messages</div>
        ${chatHTML}
        <div style="margin-top:32px;padding-top:16px;border-top:1px solid #e8eaed;font-size:10px;color:#999;text-align:center">
          © ${new Date().getFullYear()} Theophilus Olayiwola • NEXUS AI Clinical Engine
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
  };

  /* ───────────────────────────  PAYMENT GATE  ─────────────────────────────── */
  if (sharedId) {
    return <SharedChatView shareId={sharedId} />;
  }

  if (!isAuthenticated) {
    return <AuthGate />;
  }

  /* ─────────────────────────  MAIN CHAT INTERFACE  ────────────────────────── */
  return (
    <div className="flex h-screen w-full max-w-[1440px] mx-auto bg-surface-container-low relative overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-inverse-surface text-inverse-on-surface px-6 py-3 rounded-full shadow-lg font-headline text-sm font-medium animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <Icon name="check_circle" size="text-[18px]" className="text-primary" />
          {toastMessage}
        </div>
      )}

      {/* Profile Panel */}
      {showProfile && (
        <ProfilePanel
          onClose={() => setShowProfile(false)}
          sessions={sessions}
          user={user}
          logout={logout}
        />
      )}

      {/* ── Sidebar ── */}
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}
      <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative inset-y-0 left-0 w-[280px] h-full flex flex-col bg-surface-container-low border-r border-surface-variant/30 md:border-transparent flex-shrink-0 z-30 md:z-20 transition-transform duration-300 ${!sidebarOpen ? 'md:-translate-x-0 md:w-0 md:overflow-hidden' : ''}`}>
        <div className="p-6 flex flex-col h-full gap-8 min-w-[280px]">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <img src="/avatar.png" alt="NEXUS AI Avatar" className="w-10 h-10 rounded-full object-cover shadow-[0_4px_12px_rgba(74,142,255,0.2)]" />
            <div className="flex flex-col flex-1">
              <h1 className="text-on-surface font-headline font-bold text-lg leading-tight tracking-tight">NEXUS AI</h1>
              <p className="text-on-surface-variant font-label text-xs uppercase tracking-wider font-bold">Clinical Engine</p>
            </div>
            <button onClick={toggleSidebar} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors" title="Collapse sidebar">
              <Icon name="menu_open" size="text-[20px]" />
            </button>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-4">
            <button
              onClick={handleNewConsultation}
              disabled={!isAuthenticated}
              className="w-full h-11 surgical-gradient text-on-primary-container font-headline font-bold text-sm rounded flex items-center justify-center gap-2 hover:opacity-90 transition-opacity shadow-[0_8px_16px_rgba(74,142,255,0.15)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="add" size="text-[20px]" /> New Consultation
            </button>
            <div className="relative group">
              <Icon name="search" size="text-[20px]" className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
              <input
                className="w-full h-10 bg-surface-container-high border-none rounded text-sm text-on-surface placeholder-on-surface-variant focus:ring-1 focus:ring-outline-variant focus:bg-surface-container-highest transition-colors pl-10 pr-4"
                placeholder="Search histories..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
             </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
            <h2 className="text-on-surface-variant font-label text-[10px] uppercase font-bold tracking-widest mb-2 mt-4 px-2">Recent Consultations</h2>
            {isAuthenticated && sessions.filter(s => s.title.toLowerCase().includes(searchQuery.toLowerCase())).map(session => (
              <div key={session.thread_id} className="relative group/session">
                {/* Rename inline input */}
                {renameId === session.thread_id ? (
                  <div className="flex items-center gap-1 px-3 py-1.5">
                    <input
                      autoFocus
                      className="flex-1 bg-surface-container-high text-on-surface text-sm rounded px-2 py-1.5 border border-primary focus:ring-1 focus:ring-primary outline-none"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          await fetch(`${API_URL}/api/chat/rename`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                            body: JSON.stringify({ thread_id: session.thread_id, new_title: renameValue }),
                          });
                          setRenameId(null);
                          loadSessions();
                          showToast('Session renamed');
                        }
                        if (e.key === 'Escape') setRenameId(null);
                      }}
                    />
                    <button onClick={() => setRenameId(null)} className="p-1 text-on-surface-variant hover:text-on-surface">
                      <Icon name="close" size="text-[16px]" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => { loadHistory(session.thread_id); if (isMobile) setSidebarOpen(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded hover:bg-surface-container-high font-headline font-medium text-sm transition-colors text-left relative ${
                      threadId.current === session.thread_id ? 'bg-surface-container-high text-primary' : 'text-on-surface-variant'
                    }`}
                  >
                    {threadId.current === session.thread_id && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary rounded-r-full" />
                    )}
                    <Icon name="chat" fill={threadId.current === session.thread_id} size="text-[20px]" className="flex-shrink-0" />
                    <span className="truncate flex-1">{session.title}</span>
                    {/* 3-dot menu trigger */}
                    <span
                      onClick={(e) => { e.stopPropagation(); setMenuOpenId(menuOpenId === session.thread_id ? null : session.thread_id); }}
                      className="opacity-0 group-hover/session:opacity-100 p-0.5 rounded hover:bg-surface-container-highest transition-opacity flex-shrink-0 cursor-pointer"
                    >
                      <Icon name="more_vert" size="text-[18px]" />
                    </span>
                  </button>
                )}
                {/* Dropdown menu */}
                {menuOpenId === session.thread_id && (
                  <div ref={menuRef} className="absolute right-2 top-full mt-1 z-50 bg-surface-container-high border border-outline-variant/30 rounded-lg shadow-xl shadow-black/40 py-1 w-40">
                    <button
                      onClick={() => { setRenameId(session.thread_id); setRenameValue(session.title); setMenuOpenId(null); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-highest transition-colors"
                    >
                      <Icon name="edit" size="text-[16px]" /> Rename
                    </button>
                    <button
                      onClick={async () => {
                        await fetch(`${API_URL}/api/chat/${session.thread_id}`, {
                          method: 'DELETE',
                          headers: { 'Authorization': `Bearer ${token}` },
                        });
                        setMenuOpenId(null);
                        if (threadId.current === session.thread_id) handleNewConsultation();
                        loadSessions();
                        showToast('Session deleted');
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-error hover:bg-surface-container-highest transition-colors"
                    >
                      <Icon name="delete" size="text-[16px]" /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
            {isAuthenticated && sessions.length === 0 && (
              <div className="px-3 py-4 text-center text-on-surface-variant text-xs font-medium">
                No consultations yet.
              </div>
            )}
          </nav>

          {/* User Identity */}
          <div className="mt-auto pt-4 flex items-center justify-between border-t border-surface-variant/30">
              <button 
                onClick={() => setShowProfile(true)}
                className="flex items-center gap-3 hover:bg-surface-container-high p-2 -ml-2 rounded cursor-pointer transition-colors flex-1 min-w-0 bg-transparent border-none text-on-surface text-left"
              >
                  <div className="w-8 h-8 rounded-full surgical-gradient flex items-center justify-center flex-shrink-0 font-bold text-on-primary-container">
                    {user?.full_name?.charAt(0) || 'U'}
                  </div>
                  <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-on-surface font-headline font-bold text-sm leading-tight truncate">{user?.full_name || 'User'}</span>
                      <span className="text-on-surface-variant text-xs truncate">{user?.email || ''}</span>
                  </div>
              </button>
              <button
                onClick={() => setShowProfile(true)}
                className="text-on-surface-variant hover:text-on-surface p-2 rounded hover:bg-surface-container-high transition-colors"
              >
                <Icon name="settings" size="text-[20px]" />
              </button>
          </div>
        </div>
      </aside>

      {/* ── Main Chat Area ── */}
      <main className="flex-1 flex flex-col bg-surface relative min-w-0">
        {/* Top Bar */}
        <header className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 bg-surface/90 glass-effect border-b border-surface-variant/30 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            {(!sidebarOpen || isMobile) && (
              <button onClick={toggleSidebar} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors mr-1" title="Open sidebar">
                <Icon name="menu" size="text-[20px]" />
              </button>
            )}
            <h2 className="text-on-surface font-headline font-bold text-lg">NEXUS AI</h2>
            <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-container font-label text-[10px] uppercase font-bold tracking-widest">
              Active
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleDownloadPDF} disabled={!isAuthenticated} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors disabled:opacity-30" title="Export to PDF">
              <Icon name="download" size="text-[20px]" />
            </button>
            <button onClick={handleShare} disabled={!isAuthenticated} className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors disabled:opacity-30" title="Share Consultation">
              <Icon name="share" size="text-[20px]" />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar flex flex-col gap-4 md:gap-6 pb-32">
          {messages.map((msg, i) => (
            msg.role === 'user' ? (
              /* ── User Message ── */
              <div key={i} className="flex flex-col items-end gap-1 w-full max-w-4xl mx-auto group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-on-surface font-headline text-sm font-medium">Student</span>
                </div>
                <div className="relative bg-[#21262d] text-[#e6edf3] p-4 md:p-5 rounded-[0.75rem] rounded-tr-[0.25rem] max-w-[95%] md:max-w-[85%] border border-[#30363d] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  {editingIndex === i ? (
                    <div className="flex flex-col gap-2 min-w-0 w-full">
                      <textarea
                        className="w-full bg-[#161b22] text-[#e6edf3] p-2 rounded text-[15px] custom-scrollbar resize-none border border-[#30363d] focus:ring-1 focus:ring-primary outline-none"
                        value={editCache}
                        onChange={(e) => setEditCache(e.target.value)}
                        rows={3}
                        autoFocus
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setEditingIndex(null)} className="px-3 py-1 text-xs text-[#8b949e] hover:text-[#e6edf3] focus:outline-none">Cancel</button>
                        <button onClick={() => handleEditSubmit(i)} className="px-3 py-1 bg-primary text-on-primary rounded text-xs font-bold shadow focus:outline-none">Update & Send</button>
                      </div>
                    </div>
                  ) : (
                    <p className="font-body text-[15px] leading-[1.6] whitespace-pre-wrap">{msg.content}</p>
                  )}
                  {/* Action buttons (Hover) */}
                  {!editingIndex && (
                    <div className="flex gap-1 mt-2 md:mt-0 md:absolute md:-left-12 md:top-1/2 md:-translate-y-1/2 md:opacity-0 md:group-hover:opacity-100 transition-opacity md:flex-col">
                      <button
                        onClick={() => { setEditingIndex(i); setEditCache(msg.content); }}
                        className="p-1.5 rounded-full bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors shadow-sm"
                        title="Edit Message"
                      >
                        <Icon name="edit" size="text-[16px]" />
                      </button>
                      <button
                        onClick={() => { navigator.clipboard.writeText(msg.content); showToast('Message copied to clipboard'); }}
                        className="p-1.5 rounded-full bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors shadow-sm"
                        title="Copy text"
                      >
                        <Icon name="content_copy" size="text-[16px]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── AI Message ── */
              <div key={i} className="flex flex-col items-start gap-1 w-full max-w-4xl mx-auto group">
                <div className="flex items-center gap-2 mb-1">
                  <img src="/avatar.png" alt="NEXUS AI Avatar" className="w-6 h-6 rounded-full object-cover shadow-sm shadow-primary/30" />
                  <span className="text-primary font-headline text-sm font-bold tracking-wide">NEXUS AI</span>
                </div>
                <div className="relative bg-[#161b22] text-[#e6edf3] p-4 md:p-6 rounded-[0.75rem] rounded-tl-[0.25rem] max-w-[95%] md:max-w-[90%] border border-[#30363d] shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
                  <div className="font-body text-[15px] leading-[1.7] prose prose-invert max-w-none prose-p:my-2 prose-headings:my-3 prose-headings:font-headline prose-headings:text-[#e6edf3] prose-a:text-primary hover:prose-a:text-primary-container prose-strong:text-[#e6edf3] prose-ul:my-2 prose-li:my-0.5 prose-th:text-[#e6edf3] prose-td:border-[#30363d] prose-th:border-[#30363d] prose-table:border-[#30363d]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                  {/* Action buttons (Hover) */}
                  {msg.content && (
                    <div className="flex gap-1 mt-2 md:mt-0 md:absolute md:-right-12 md:top-1/2 md:-translate-y-1/2 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => { navigator.clipboard.writeText(msg.content); showToast('Message copied to clipboard'); }}
                        className="p-1.5 rounded-full bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-[#8b949e] hover:text-[#e6edf3] transition-colors shadow-sm"
                        title="Copy text"
                      >
                        <Icon name="content_copy" size="text-[16px]" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          ))}
          {isStreaming && messages[messages.length - 1]?.content === '' && (
            <div className="flex flex-col items-start gap-1 w-full max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-1">
                <img src="/avatar.png" alt="NEXUS AI Avatar" className="w-6 h-6 rounded-full object-cover shadow-sm shadow-primary/30" />
                <span className="text-primary font-headline text-sm font-bold tracking-wide">NEXUS AI</span>
              </div>
              <div className="bg-[#161b22] border border-[#30363d] rounded-[0.75rem] rounded-tl-[0.25rem] p-6 max-w-[90%] w-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-[#8b949e] font-label text-xs font-medium">NEXUS AI is analyzing...</span>
                </div>
                <div className="space-y-3 animate-pulse">
                  <div className="h-3 bg-[#30363d] rounded-full w-[85%]" />
                  <div className="h-3 bg-[#30363d] rounded-full w-[70%]" />
                  <div className="h-3 bg-[#30363d] rounded-full w-[60%]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-surface via-surface/90 to-transparent pt-10 pb-4 md:pb-6 px-3 md:px-8 pointer-events-none">
          <div className="max-w-4xl mx-auto w-full pointer-events-auto">
              <div className="bg-surface-bright/80 glass-effect rounded-[0.5rem] border border-outline-variant/30 shadow-[0_20px_40px_rgba(0,0,0,0.4)] flex items-end gap-2 p-3 transition-all focus-within:border-primary/50 focus-within:bg-surface-bright">
                <button className="p-2.5 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded transition-colors flex-shrink-0 mb-0.5" title="Attach Medical File">
                  <Icon name="attach_file" size="text-[20px]" />
                </button>
                <textarea
                  className="flex-1 max-h-32 bg-transparent border-none text-on-surface placeholder-on-surface-variant font-body text-[15px] resize-none focus:ring-0 p-2.5 custom-scrollbar leading-relaxed"
                  placeholder="Ask a clinical question..."
                  rows="1"
                  style={{ minHeight: '44px' }}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                />
                <button
                  onClick={handleSend}
                  disabled={isStreaming}
                  className="w-10 h-10 rounded surgical-gradient text-on-primary-container flex items-center justify-center flex-shrink-0 hover:opacity-90 transition-opacity mb-0.5 shadow-[0_4px_12px_rgba(74,142,255,0.2)] disabled:opacity-50"
                >
                  <Icon name="send" fill size="text-[20px]" />
                </button>
              </div>
              <span className="text-on-surface-variant/70 font-label text-[10px] font-medium tracking-wide flex items-center justify-center gap-1 flex-wrap mt-3">
                <span>NEXUS AI can make mistakes. Always verify critical clinical information.</span>
                <span className="opacity-50 mx-1">•</span>
                <span>&copy; {new Date().getFullYear()} Theophilus Olayiwola</span>
              </span>
          </div>
        </div>
      </main>

      {/* ── Share Modal ── */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowShareModal(false)} />
          <div className="relative bg-surface-container-low border border-outline-variant/30 rounded-xl shadow-2xl shadow-black/50 p-8 w-full max-w-md mx-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-headline font-bold text-lg text-on-surface">Share Consultation</h3>
              <button onClick={() => setShowShareModal(false)} className="p-1.5 rounded hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors">
                <Icon name="close" size="text-[20px]" />
              </button>
            </div>
            <p className="text-on-surface-variant text-sm mb-4">Anyone with this link can view this consultation (read-only).</p>
            <div className="flex items-center gap-2 bg-surface-container-high rounded-lg p-3 border border-outline-variant/20">
              <Icon name="link" size="text-[18px]" className="text-primary flex-shrink-0" />
              <input
                readOnly
                value={shareLink}
                className="flex-1 bg-transparent text-on-surface text-sm font-mono truncate focus:outline-none"
                onClick={(e) => e.target.select()}
              />
              <button
                onClick={() => { navigator.clipboard.writeText(shareLink); showToast('Link copied to clipboard'); }}
                className="px-3 py-1.5 surgical-gradient text-on-primary-container font-headline font-bold text-xs rounded hover:opacity-90 transition-opacity flex items-center gap-1 flex-shrink-0"
              >
                <Icon name="content_copy" size="text-[14px]" /> Copy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}