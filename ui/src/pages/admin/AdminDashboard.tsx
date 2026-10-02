import { apiUrl, uploadUrl } from '../../config/api';
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, BookOpen, Calendar, Image as ImageIcon, MessageSquare, Mail, 
  Plus, Trash2, Check, LogOut, Upload, Shield, Eye, ThumbsUp, MapPin, Compass,
  Bell, Menu, X, Users, RefreshCw, ArrowLeft, Activity, Smartphone, Laptop, Tablet, Clock, TrendingUp, Wrench, Home
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';
import { adminAuth } from '../../services/adminAuth';
import { initAdminPushNotifications, stopAdminPushNotifications, getLocalFCMToken, submitFCMTokenToServer } from '../../services/adminPushNotifications';

type Tab = 'overview' | 'analytics' | 'blogs' | 'timeline' | 'news' | 'gallery' | 'messages' | 'comments' | 'notifications' | 'subscribers' | 'diagnostics';

const tabLabels: Record<Tab, string> = {
  overview: 'Overview',
  analytics: 'Visitor Analytics',
  blogs: 'Manage Blogs',
  timeline: 'Manage Timeline',
  news: 'Manage News',
  gallery: 'Manage Gallery',
  messages: 'Messages',
  comments: 'Comments',
  notifications: 'Notifications',
  subscribers: 'Subscribers',
  diagnostics: 'Diagnostics'
};

interface Stats {
  total_blogs: number;
  total_timeline: number;
  total_news: number;
  total_gallery: number;
  unread_messages: number;
  pending_comments: number;
  total_subscribers: number;
  unread_notifications: number;
  unique_visitors_today?: number;
  total_unique_visitors?: number;
}

function ImageFilesPreview({ files, onRemove }: { files: File[], onRemove: (index: number) => void }) {
  if (files.length === 0) return null;
  return (
    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
      {files.map((file, idx) => (
        <div key={idx} style={{ position: 'relative', width: '75px', height: '75px', borderRadius: '8px', overflow: 'hidden', border: idx === 0 ? '2px solid #FF9933' : '1px solid rgba(255,255,255,0.2)', backgroundColor: '#0f172a' }}>
          <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <span style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: idx === 0 ? '#FF9933' : 'rgba(0,0,0,0.8)', color: idx === 0 ? '#0f172a' : '#fff', fontSize: '0.62rem', textAlign: 'center', fontWeight: 'bold', padding: '1px 0' }}>
            {idx === 0 ? '1st (Cover)' : `${idx + 1}th`}
          </span>
          <button
            type="button"
            onClick={() => onRemove(idx)}
            title="Remove image"
            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<Stats>({
    total_blogs: 0, total_timeline: 0, total_news: 0, total_gallery: 0,
    unread_messages: 0, pending_comments: 0, total_subscribers: 0, unread_notifications: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = adminAuth.getTokenSync();

  // Verify Auth on Load
  useEffect(() => {
    (async () => {
      const activeToken = await adminAuth.getToken();
      if (!activeToken) {
        stopAdminPushNotifications();
        navigate('/admin');
        return;
      }

      initAdminPushNotifications();

      fetch(apiUrl('/auth/me'), {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      })
      .then(async (res) => {
        if (!res.ok) {
          stopAdminPushNotifications();
          await adminAuth.clearToken();
          navigate('/admin');
        } else {
          try {
            const data = await res.json();
            if (data?.refreshed_token) {
              await adminAuth.setToken(data.refreshed_token, data);
            }
          } catch (e) {
            // ignore
          }
        }
      })
      .catch(() => {
        // Allow demo environment fallback if server not running
      });

      fetchStats();
    })();
  }, [navigate]);

  const fetchStats = async () => {
    try {
      const activeToken = await adminAuth.getToken();
      const res = await fetch(apiUrl('/admin/stats'), {
        headers: { 'Authorization': `Bearer ${activeToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      // Mock stats for frontend preview
      setStats({
        total_blogs: 3, total_timeline: 5, total_news: 6, total_gallery: 12,
        unread_messages: 2, pending_comments: 1, total_subscribers: 45, unread_notifications: 3
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    stopAdminPushNotifications();
    await adminAuth.clearToken();
    navigate('/admin');
  };

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="admin-dashboard container">
      {/* Header */}
      <div className="admin-dash-header glass-card">
        <div className="admin-dash-title-group">
          {activeTab !== 'overview' && (
            <button 
              onClick={() => handleTabClick('overview')} 
              className="mobile-hub-back-icon-btn btn-icon"
              title="Back to All Menus"
              aria-label="Back to All Menus"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="mobile-menu-toggle btn-icon"
            title="Toggle Menu"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
          <div className="admin-header-shield">
            <Shield className="saffron" size={26} />
          </div>
          <div 
            className="admin-header-text"
            style={{ cursor: activeTab !== 'overview' ? 'pointer' : 'default' }}
            onClick={() => activeTab !== 'overview' && handleTabClick('overview')}
            title={activeTab !== 'overview' ? 'Click to return to Admin Menu Hub' : undefined}
          >
            <h1 className="admin-dash-title">
              {activeTab === 'overview' ? 'Admin Dashboard' : tabLabels[activeTab]}
            </h1>
            <span className="admin-dash-sub">
              {activeTab === 'overview' ? 'Welcome, Administrator' : '← Return to Menu Hub'}
            </span>
          </div>
        </div>
        <div className="admin-dash-actions">
          <button 
            type="button"
            onClick={() => navigate('/')} 
            className="btn btn-outline btn-sm home-top-btn" 
            title="Navigate to Public Homepage"
            aria-label="Navigate to Public Homepage"
          >
            <Home size={15} /> <span className="home-top-text">Website</span>
          </button>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn btn-outline btn-sm logout-btn" title="Logout">
            <LogOut size={16} /> <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>

      <div className="dashboard-layout">
        {/* Mobile Sidebar Overlay/Backdrop */}
        {mobileMenuOpen && (
          <div 
            className="mobile-sidebar-backdrop" 
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Navigation Sidebar */}
        <aside className={`dashboard-sidebar glass-card ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="dash-nav-list">
            <li>
              <button onClick={() => handleTabClick('overview')} className={`dash-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}>
                <BarChart size={18} /> Overview
              </button>
            </li>
            <li>
              <button onClick={() => handleTabClick('analytics')} className={`dash-nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}>
                <Activity size={18} /> 
                <span>Analytics</span>
                {(stats.unique_visitors_today ?? 0) > 0 && <span className="badge saffron-bg">{stats.unique_visitors_today}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => handleTabClick('blogs')} className={`dash-nav-btn ${activeTab === 'blogs' ? 'active' : ''}`}>
                <BookOpen size={18} /> Manage Blogs
              </button>
            </li>
            <li>
              <button onClick={() => handleTabClick('timeline')} className={`dash-nav-btn ${activeTab === 'timeline' ? 'active' : ''}`}>
                <Calendar size={18} /> Manage Timeline
              </button>
            </li>
            <li>
              <button onClick={() => handleTabClick('news')} className={`dash-nav-btn ${activeTab === 'news' ? 'active' : ''}`}>
                <Compass size={18} /> Manage News
              </button>
            </li>
            <li>
              <button onClick={() => handleTabClick('gallery')} className={`dash-nav-btn ${activeTab === 'gallery' ? 'active' : ''}`}>
                <ImageIcon size={18} /> Manage Gallery
              </button>
            </li>
            <li>
              <button onClick={() => handleTabClick('messages')} className={`dash-nav-btn ${activeTab === 'messages' ? 'active' : ''}`}>
                <Mail size={18} /> 
                <span>Messages</span>
                {stats.unread_messages > 0 && <span className="badge saffron-bg">{stats.unread_messages}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => handleTabClick('comments')} className={`dash-nav-btn ${activeTab === 'comments' ? 'active' : ''}`}>
                <MessageSquare size={18} /> 
                <span>Comments</span>
                {stats.pending_comments > 0 && <span className="badge green-bg">{stats.pending_comments}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => handleTabClick('notifications')} className={`dash-nav-btn ${activeTab === 'notifications' ? 'active' : ''}`}>
                <Bell size={18} /> 
                <span>Notifications</span>
                {stats.unread_notifications > 0 && <span className="badge saffron-bg">{stats.unread_notifications}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => handleTabClick('subscribers')} className={`dash-nav-btn ${activeTab === 'subscribers' ? 'active' : ''}`}>
                <Users size={18} /> 
                <span>Subscribers</span>
                {stats.total_subscribers > 0 && <span className="badge green-bg">{stats.total_subscribers}</span>}
              </button>
            </li>
            <li>
              <button onClick={() => handleTabClick('diagnostics')} className={`dash-nav-btn ${activeTab === 'diagnostics' ? 'active' : ''}`}>
                <Wrench size={18} /> 
                <span>Diagnostics</span>
              </button>
            </li>
            <li className="sidebar-home-item" style={{ marginTop: '14px', borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
              <button onClick={() => navigate('/')} className="dash-nav-btn home-nav-btn" title="Navigate to Public Homepage">
                <Home size={18} /> 
                <span>Public Website</span>
              </button>
            </li>
          </ul>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content-panel">
          {activeTab !== 'overview' && (
            <div className="mobile-subtab-banner">
              <button 
                onClick={() => handleTabClick('overview')}
                className="mobile-subtab-return-btn"
                title="Return to Menu Hub"
                aria-label="Return to Menu Hub"
              >
                <ArrowLeft size={15} />
                <span>All Menus</span>
              </button>
              <span className="mobile-subtab-current-badge">{tabLabels[activeTab]}</span>
            </div>
          )}

          {activeTab === 'overview' && <OverviewTab stats={stats} onTabSelect={handleTabClick} />}
          {activeTab === 'analytics' && <AnalyticsPanel token={token} />}
          {activeTab === 'blogs' && <BlogsManager token={token} onUpdate={fetchStats} />}
          {activeTab === 'timeline' && <TimelineManager token={token} onUpdate={fetchStats} />}
          {activeTab === 'news' && <NewsManager token={token} onUpdate={fetchStats} />}
          {activeTab === 'gallery' && <GalleryManager token={token} onUpdate={fetchStats} />}
          {activeTab === 'messages' && <MessagesInbox token={token} onUpdate={fetchStats} />}
          {activeTab === 'comments' && <CommentsApproval token={token} onUpdate={fetchStats} />}
          {activeTab === 'notifications' && <NotificationsPanel token={token} onUpdate={fetchStats} setActiveTab={setActiveTab} />}
          {activeTab === 'subscribers' && <SubscribersManager token={token} onUpdate={fetchStats} />}
          {activeTab === 'diagnostics' && <DiagnosticsPanel token={token} />}
        </main>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ───────────────────────────────────────────────────
function OverviewTab({ stats, onTabSelect }: { stats: Stats, onTabSelect: (tab: Tab) => void }) {
  const navigate = useNavigate();
  const menuTiles = [
    {
      id: 'analytics' as Tab,
      title: 'Analytics',
      subtitle: (stats.unique_visitors_today ?? 0) > 0 ? `${stats.unique_visitors_today} Unique Today` : 'Traffic & Journeys',
      gradientClass: 'gradient-teal',
      icon: Activity
    },
    {
      id: 'notifications' as Tab,
      title: 'Notifications',
      subtitle: stats.unread_notifications > 0 ? `${stats.unread_notifications} Unread Alerts` : 'Activity Alerts',
      gradientClass: 'gradient-indigo',
      icon: Bell
    },
    {
      id: 'messages' as Tab,
      title: 'Messages',
      subtitle: stats.unread_messages > 0 ? `${stats.unread_messages} New Enquiries` : 'Visitor Inbox',
      gradientClass: 'gradient-purple',
      icon: Mail
    },
    {
      id: 'blogs' as Tab,
      title: 'Blogs',
      subtitle: `${stats.total_blogs} Articles`,
      gradientClass: 'gradient-cyan',
      icon: BookOpen
    },
    {
      id: 'gallery' as Tab,
      title: 'Gallery',
      subtitle: `${stats.total_gallery} Photos`,
      gradientClass: 'gradient-violet',
      icon: ImageIcon
    },
    {
      id: 'timeline' as Tab,
      title: 'Timeline',
      subtitle: `${stats.total_timeline} Milestones`,
      gradientClass: 'gradient-saffron',
      icon: Calendar
    },
    {
      id: 'news' as Tab,
      title: 'News',
      subtitle: `${stats.total_news} Press Items`,
      gradientClass: 'gradient-pink',
      icon: Compass
    },
    {
      id: 'comments' as Tab,
      title: 'Comments',
      subtitle: stats.pending_comments > 0 ? `${stats.pending_comments} Pending Review` : 'Visitor Feedback',
      gradientClass: 'gradient-blue',
      icon: MessageSquare
    },
    {
      id: 'subscribers' as Tab,
      title: 'Subscribers',
      subtitle: `${stats.total_subscribers} Audience`,
      gradientClass: 'gradient-emerald',
      icon: Users
    },
    {
      id: 'diagnostics' as Tab,
      title: 'Diagnostics',
      subtitle: 'FCM & System Status',
      gradientClass: 'gradient-slate',
      icon: Wrench
    }
  ];

  return (
    <div className="overview-tab animate-fade-in">
      <div className="mobile-menu-hub-section">
        <h2 className="mobile-menu-hub-heading">
          <span>Admin Menu</span>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="hub-home-btn"
            title="Navigate to Public Homepage"
            aria-label="Navigate to Public Homepage"
          >
            <Home size={15} />
            <span>Public Homepage</span>
          </button>
        </h2>
        <div className="mobile-menu-tiles-grid">
          {menuTiles.map((tile) => (
            <button
              key={tile.id}
              onClick={() => onTabSelect(tile.id)}
              className={`mobile-menu-tile stat-card ${tile.gradientClass}`}
              aria-label={`Open ${tile.title}`}
            >
              <div className="stat-icon-wrapper">
                <tile.icon size={19} />
              </div>
              <div className="stat-details">
                <div className="mobile-menu-tile-title">{tile.title}</div>
                <span className="mobile-menu-tile-sub">{tile.subtitle}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── BLOGS MANAGER ─────────────────────────────────────────────────
function BlogsManager({ token, onUpdate }: { token: string | null, onUpdate: () => void }) {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [body, setBody] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [notifySubscribers, setNotifySubscribers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      const res = await fetch(apiUrl('/blogs?limit=100'));
      if (res.ok) {
        const data = await res.json();
        setBlogs(data.items || []);
      }
    } catch (e) {
      setBlogs([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('main_body', body);
    formData.append('notify_subscribers', String(notifySubscribers));
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('images[]', file);
      });
    }

    try {
      const res = await fetch(apiUrl('/admin/blogs'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setShowAddForm(false);
        setTitle('');
        setDescription('');
        setBody('');
        setImageFiles([]);
        fetchBlogs();
        onUpdate();
      }
    } catch (err) {
      alert('Failed to save blog post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this blog post?')) return;
    try {
      const res = await fetch(apiUrl(`/admin/blogs/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchBlogs();
        onUpdate();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div className="blogs-manager animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0' }}>Manage Blogs</h2>
        <button onClick={() => setShowAddForm(true)} className="btn btn-saffron btn-sm">
          <Plus size={16} /> Add New Blog
        </button>
      </div>

      {showAddForm && ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '20px' }}>Create Blog Post</h3>
            <form onSubmit={handleSubmit} className="dash-form">
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Blog Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input" />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Excerpt / Short Description</label>
                <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} required className="form-input" />
              </div>
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label>Main Body Content</label>
                <textarea rows={6} value={body} onChange={(e) => setBody(e.target.value)} required className="form-input" />
              </div>
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label>Featured Image Files (Select multiple)</label>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*"
                  onChange={(e) => {
                    const newFiles = Array.from(e.target.files || []);
                    setImageFiles(prev => [...prev, ...newFiles]);
                  }} 
                  className="form-input" 
                />
                <ImageFilesPreview files={imageFiles} onRemove={(idx) => setImageFiles(prev => prev.filter((_, i) => i !== idx))} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <input
                  type="checkbox"
                  id="notifyBlogSubscribers"
                  checked={notifySubscribers}
                  onChange={(e) => setNotifySubscribers(e.target.checked)}
                  style={{ accentColor: '#FF9933', cursor: 'pointer' }}
                />
                <label htmlFor="notifyBlogSubscribers" style={{ fontSize: '0.88rem', cursor: 'pointer', color: 'var(--text-primary)', margin: 0 }}>
                  Send Email Notification & Link to Active Subscribers
                </label>
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-outline">Cancel</button>
                <button type="submit" disabled={submitting} className="btn btn-saffron">{submitting ? 'Creating...' : 'Publish Post'}</button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Blogs List Table */}
      <div className="dash-table-wrapper glass-card">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Date</th>
              <th>Stats</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {blogs.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>No blog posts found.</td></tr>
            ) : (
              blogs.map((b) => (
                <tr key={b.id}>
                  <td><strong>{b.title}</strong></td>
                  <td>{new Date(b.date).toLocaleDateString()}</td>
                  <td>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginRight: '12px' }}><Eye size={12} style={{ display: 'inline', marginRight: '4px' }} /> {b.views}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}><ThumbsUp size={12} style={{ display: 'inline', marginRight: '4px' }} /> {b.likes}</span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(b.id)} className="btn-icon text-red" title="Delete"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── TIMELINE MANAGER ──────────────────────────────────────────────
function TimelineManager({ token, onUpdate }: { token: string | null, onUpdate: () => void }) {
  const [events, setEvents] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [location, setLocation] = useState('');
  const [addToGallery, setAddToGallery] = useState(true);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [notifySubscribers, setNotifySubscribers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(apiUrl('/timeline?limit=100'));
      if (res.ok) {
        const data = await res.json();
        setEvents(data.items || []);
      }
    } catch (e) {
      setEvents([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append('text', text);
    formData.append('location', location);
    formData.append('add_to_gallery', String(addToGallery));
    formData.append('notify_subscribers', String(notifySubscribers));
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('images[]', file);
      });
    }

    try {
      const res = await fetch(apiUrl('/admin/timeline'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setText('');
        setLocation('');
        setImageFiles([]);
        fetchEvents();
        onUpdate();
      }
    } catch (err) {
      alert('Failed to save event.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this timeline event?')) return;
    try {
      const res = await fetch(apiUrl(`/admin/timeline/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchEvents();
        onUpdate();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div className="timeline-manager animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>Manage Timeline</h2>

      <div className="grid-2" style={{ alignItems: 'start', gap: '32px' }}>
        {/* Form side */}
        <div className="add-event-form glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}>Add Timeline Event</h3>
          <form onSubmit={handleSubmit} className="dash-form">
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Event Description / Activity</label>
              <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} required className="form-input" />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Location</label>
              <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Jamshedpur" className="form-input" />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Event Image Files (Select multiple)</label>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || []);
                  setImageFiles(prev => [...prev, ...newFiles]);
                }} 
                className="form-input" 
              />
              <ImageFilesPreview files={imageFiles} onRemove={(idx) => setImageFiles(prev => prev.filter((_, i) => i !== idx))} />
            </div>
            <div className="form-group" style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="sync" checked={addToGallery} onChange={(e) => setAddToGallery(e.target.checked)} style={{ accentColor: '#FF9933' }} />
              <label htmlFor="sync" style={{ cursor: 'pointer', margin: 0 }}>Automatically add image to Gallery</label>
            </div>
            <div className="form-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="notifyTimeline" checked={notifySubscribers} onChange={(e) => setNotifySubscribers(e.target.checked)} style={{ accentColor: '#FF9933' }} />
              <label htmlFor="notifyTimeline" style={{ cursor: 'pointer', margin: 0 }}>Send Email Notification & Link to Active Subscribers</label>
            </div>
            <button type="submit" disabled={submitting} className="btn btn-saffron" style={{ width: '100%' }}>
              {submitting ? 'Saving Event...' : 'Add Event & Publish'}
            </button>
          </form>
        </div>

        {/* List side */}
        <div className="events-list glass-card" style={{ padding: '24px', maxHeight: '550px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}>Existing Events</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {events.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No events logged.</p>
            ) : (
              events.map((e) => (
                <div key={e.id} className="event-item glass-card" style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                  {e.image && <img src={uploadUrl(e.image)} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
                  <div style={{ flex: '1' }}>
                    <p style={{ fontSize: '0.9rem', margin: '0 0 6px' }}>{e.text}</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}><MapPin size={10} style={{ display: 'inline', marginRight: '4px' }} /> {e.location || 'Central'}</span>
                  </div>
                  <button onClick={() => handleDelete(e.id)} className="btn-icon text-red" style={{ height: 'fit-content' }}><Trash2 size={14} /></button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NEWS MANAGER ──────────────────────────────────────────────────
function NewsManager({ token, onUpdate }: { token: string | null, onUpdate: () => void }) {
  const [news, setNews] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [notifySubscribers, setNotifySubscribers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const res = await fetch(apiUrl('/news?limit=100'));
      if (res.ok) {
        const data = await res.json();
        setNews(data.items || []);
      }
    } catch (e) {
      setNews([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('text', text);
    formData.append('url', url);
    formData.append('notify_subscribers', String(notifySubscribers));
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        formData.append('images[]', file);
      });
    }

    try {
      const res = await fetch(apiUrl('/admin/news'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setTitle('');
        setText('');
        setUrl('');
        setImageFiles([]);
        fetchNews();
        onUpdate();
      }
    } catch (err) {
      alert('Failed to save news item.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this news item?')) return;
    try {
      const res = await fetch(apiUrl(`/admin/news/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNews();
        onUpdate();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div className="news-manager animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>Manage News</h2>

      <div className="grid-2" style={{ alignItems: 'start', gap: '32px' }}>
        <div className="add-news-form glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}>Add News Article</h3>
          <form onSubmit={handleSubmit} className="dash-form">
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Article Title</label>
              <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required className="form-input" />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Article Content / Report Summary</label>
              <textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} required className="form-input" />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>External Link (optional)</label>
              <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className="form-input" />
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>News Banner Images (Select multiple)</label>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || []);
                  setImageFiles(prev => [...prev, ...newFiles]);
                }} 
                className="form-input" 
              />
              <ImageFilesPreview files={imageFiles} onRemove={(idx) => setImageFiles(prev => prev.filter((_, i) => i !== idx))} />
            </div>
            <div className="form-group" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="notifyNews" checked={notifySubscribers} onChange={(e) => setNotifySubscribers(e.target.checked)} style={{ accentColor: '#FF9933' }} />
              <label htmlFor="notifyNews" style={{ cursor: 'pointer', margin: 0 }}>Send Email Notification & Link to Active Subscribers</label>
            </div>
            <button type="submit" disabled={submitting} className="btn btn-saffron" style={{ width: '100%' }}>
              {submitting ? 'Saving...' : 'Add News Article'}
            </button>
          </form>
        </div>

        <div className="news-list glass-card" style={{ padding: '24px', maxHeight: '550px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}>Existing Articles</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {news.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No articles logged.</p>
            ) : (
              news.map((item) => (
                <div key={item.id} className="event-item glass-card" style={{ padding: '16px', display: 'flex', gap: '12px' }}>
                  {item.image && <img src={uploadUrl(item.image)} alt="" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />}
                  <div style={{ flex: '1' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: '600', margin: '0 0 4px' }}>{item.title}</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0' }}>{item.text.substring(0, 80)}...</p>
                  </div>
                  <button onClick={() => handleDelete(item.id)} className="btn-icon text-red" style={{ height: 'fit-content' }}><Trash2 size={14} /></button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── GALLERY MANAGER ───────────────────────────────────────────────
function GalleryManager({ token, onUpdate }: { token: string | null, onUpdate: () => void }) {
  const [images, setImages] = useState<any[]>([]);
  const [tag, setTag] = useState('others');
  const [caption, setCaption] = useState('');
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const res = await fetch(apiUrl('/gallery?limit=100'));
      if (res.ok) {
        const data = await res.json();
        setImages(data || []);
      }
    } catch (e) {
      setImages([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || imageFiles.length === 0) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append('tag', tag);
    formData.append('caption', caption);
    imageFiles.forEach(file => {
      formData.append('images[]', file);
    });

    try {
      const res = await fetch(apiUrl('/admin/gallery'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setCaption('');
        setImageFiles([]);
        fetchImages();
        onUpdate();
      }
    } catch (err) {
      alert('Upload failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this image from gallery?')) return;
    try {
      let res = await fetch(apiUrl(`/admin/gallery/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        res = await fetch(apiUrl(`/admin/gallery/${id}/delete`), {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }
      if (res.ok) {
        fetchImages();
        onUpdate();
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.detail || errData?.message || 'Delete failed');
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div className="gallery-manager animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>Manage Gallery</h2>

      <div className="grid-2 gallery-manager-grid" style={{ alignItems: 'start', gap: '24px' }}>
        <div className="upload-form glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}><Upload size={18} style={{ display: 'inline', marginRight: '8px' }} /> Upload Photos</h3>
          <form onSubmit={handleSubmit} className="dash-form">
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label className="form-label">Tag Category</label>
              <select value={tag} onChange={(e) => setTag(e.target.value)} className="form-input" style={{ width: '100%', height: '44px' }}>
                <option value="international">International</option>
                <option value="intuc">INTUC</option>
                <option value="union">Unions</option>
                <option value="press">Press Release</option>
                <option value="others">Others</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: '16px' }}>
              <label>Caption Text</label>
              <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Description of photo" className="form-input" />
            </div>
            <div className="form-group" style={{ marginBottom: '20px' }}>
              <label>Choose Files (Select multiple)</label>
              <input 
                type="file" 
                multiple 
                accept="image/*"
                required={imageFiles.length === 0} 
                onChange={(e) => {
                  const newFiles = Array.from(e.target.files || []);
                  setImageFiles(prev => [...prev, ...newFiles]);
                }} 
                className="form-input" 
              />
              <ImageFilesPreview files={imageFiles} onRemove={(idx) => setImageFiles(prev => prev.filter((_, i) => i !== idx))} />
            </div>
            <button type="submit" disabled={submitting || imageFiles.length === 0} className="btn btn-saffron" style={{ width: '100%' }}>
              {submitting ? 'Uploading...' : `Upload ${imageFiles.length > 0 ? imageFiles.length : ''} Image(s)`}
            </button>
          </form>
        </div>

        {/* Gallery thumbnails grid */}
        <div className="gallery-thumbnails glass-card" style={{ padding: '24px', maxHeight: '550px', overflowY: 'auto' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}>Existing Images</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '12px' }}>
            {images.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No images uploaded.</p>
            ) : (
              images.map((img) => (
                <div key={img.id} className="thumb-item glass-card" style={{ position: 'relative', overflow: 'hidden', height: '100px' }}>
                  <img src={uploadUrl(img.filename)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  <button 
                    onClick={() => handleDelete(img.id)} 
                    style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.85)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MESSAGES INBOX ────────────────────────────────────────────────
function MessagesInbox({ token, onUpdate }: { token: string | null, onUpdate: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [activeReplyMessage, setActiveReplyMessage] = useState<any | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch(apiUrl('/admin/messages'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.items || []);
      }
    } catch (e) {
      setMessages([]);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/admin/messages/${id}/read`), {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchMessages();
        onUpdate();
      }
    } catch (e) {
      // ignore
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !activeReplyMessage || !replyText.trim()) return;
    setSendingReply(true);

    try {
      const res = await fetch(apiUrl(`/admin/messages/${activeReplyMessage.id}/reply`), {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reply_message: replyText })
      });
      if (res.ok) {
        alert('Reply email sent successfully!');
        setActiveReplyMessage(null);
        setReplyText('');
        fetchMessages();
        onUpdate();
      } else {
        const data = await res.json().catch(() => ({}));
        alert(data.detail || 'Failed to send reply email. Please verify SMTP settings in .env.');
      }
    } catch (err) {
      alert('Failed to connect to the server.');
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="messages-inbox animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>Contact Messages Inbox</h2>
      <div className="messages-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: '40px' }}>No messages in inbox.</div>
        ) : (
          messages.map((m) => {
            const isReplied = m.is_replied === true || m.is_replied === 1 || m.is_replied === '1';
            const isRead = m.is_read === true || m.is_read === 1 || m.is_read === '1';

            return (
              <div key={m.id} className="message-item glass-card" style={{ padding: '24px', borderLeft: isReplied ? '4px solid #10b981' : (isRead ? '1px solid var(--border-color)' : '4px solid var(--saffron)') }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: '600', margin: '0' }}>{m.subject}</h4>
                      {isReplied ? (
                        <span className="badge green-bg" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Replied</span>
                      ) : (
                        <span className="badge saffron-bg" style={{ fontSize: '0.7rem', padding: '2px 8px' }}>Pending Reply</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>From: <strong>{m.name}</strong> ({m.email})</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
                    {!isRead && (
                      <button onClick={() => handleMarkRead(m.id)} className="btn btn-outline btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                        <Check size={12} /> Mark Read
                      </button>
                    )}
                    {!isReplied && (
                      <button onClick={() => { setActiveReplyMessage(m); setReplyText(''); }} className="btn btn-saffron btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
                        Reply via Email
                      </button>
                    )}
                  </div>
                </div>
                <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', background: 'var(--saffron-pale)', border: '1px dashed var(--border-saffron)', padding: '14px 18px', borderRadius: '12px', margin: '0' }}>{m.message}</p>
                
                {isReplied && m.reply_message && (
                  <div style={{ marginTop: '16px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '14px 18px', borderRadius: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.8rem', color: '#10b981', fontWeight: '600' }}>
                      <span>Admin Reply History</span>
                      <span>Sent: {m.replied_at ? new Date(m.replied_at).toLocaleString() : ''}</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', margin: '0', whiteSpace: 'pre-wrap' }}>{m.reply_message}</p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {activeReplyMessage && ReactDOM.createPortal(
        <div className="modal-overlay" onClick={() => setActiveReplyMessage(null)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '16px' }}>Reply to Message</h3>
            
            <div style={{ marginBottom: '16px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              <div style={{ marginBottom: '4px' }}><strong>To:</strong> {activeReplyMessage.name} &lt;{activeReplyMessage.email}&gt;</div>
              <div><strong>Original Subject:</strong> {activeReplyMessage.subject}</div>
            </div>

            <div style={{ background: 'var(--saffron-pale)', padding: '12px', borderRadius: '8px', marginBottom: '20px', maxHeight: '120px', overflowY: 'auto', fontSize: '0.88rem', color: 'var(--text-secondary)', borderLeft: '3px solid var(--saffron)' }}>
              <strong style={{ display: 'block', marginBottom: '4px' }}>Original Message:</strong>
              {activeReplyMessage.message}
            </div>

            <form onSubmit={handleSendReply} className="dash-form">
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ fontWeight: '600', marginBottom: '8px', display: 'block' }}>Email Reply Body</label>
                <textarea 
                  rows={8} 
                  value={replyText} 
                  onChange={(e) => setReplyText(e.target.value)} 
                  required 
                  placeholder="Type your email response here..."
                  className="form-input"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-input)', color: 'var(--text-primary)' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setActiveReplyMessage(null)} className="btn btn-outline" style={{ padding: '8px 16px' }}>Cancel</button>
                <button type="submit" disabled={sendingReply || !replyText.trim()} className="btn btn-saffron" style={{ padding: '8px 20px', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                  {sendingReply ? 'Sending Email...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}


// ─── COMMENTS APPROVAL ─────────────────────────────────────────────
function CommentsApproval({ token, onUpdate }: { token: string | null, onUpdate: () => void }) {
  const [comments, setComments] = useState<any[]>([]);

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch(apiUrl('/admin/comments'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data || []);
      }
    } catch (e) {
      setComments([]);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/admin/comments/${id}/approve`), {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchComments();
        onUpdate();
      }
    } catch (e) {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Reject and delete this comment?')) return;
    try {
      const res = await fetch(apiUrl(`/admin/comments/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchComments();
        onUpdate();
      }
    } catch (e) {
      // ignore
    }
  };

  return (
    <div className="comments-approval animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>Pending Comments Queue</h2>
      <div className="comments-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {comments.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: '40px' }}>No comments awaiting approval.</div>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="comment-item glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ flex: '1', marginRight: '24px' }}>
                <div style={{ marginBottom: '6px' }}>
                  <strong style={{ fontSize: '1rem' }}>{c.name || c.author_name || 'Anonymous'}</strong>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '12px' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0' }}>{c.comment || c.comment_text || ''}</p>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '6px' }}>On Post ID: {c.post_id}</small>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => handleApprove(c.id)} className="btn btn-green btn-sm" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  <Check size={14} /> Approve
                </button>
                <button onClick={() => handleDelete(c.id)} className="btn btn-outline btn-sm text-red" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  Reject
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS PANEL ───────────────────────────────────────────
function NotificationsPanel({ 
  token, 
  onUpdate, 
  setActiveTab 
}: { 
  token: string | null; 
  onUpdate: () => void; 
  setActiveTab: (tab: any) => void;
}) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(apiUrl('/admin/notifications'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data || []);
      }
    } catch (e) {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/admin/notifications/${id}/read`), {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
        onUpdate();
      }
    } catch (e) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch(apiUrl('/admin/notifications/read-all'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
        onUpdate();
      }
    } catch (e) {
      // ignore
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(apiUrl(`/admin/notifications/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchNotifications();
        onUpdate();
      }
    } catch (e) {
      // ignore
    }
  };

  const hasUnread = notifications.some(n => !n.is_read);

  return (
    <div className="notifications-panel animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0' }}>Recent Activity Notifications</h2>
        {notifications.length > 0 && hasUnread && (
          <button onClick={handleMarkAllRead} className="btn btn-outline btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <Check size={16} /> Mark All Read
          </button>
        )}
      </div>

      <div className="notifications-list">
        {loading ? (
          <div className="glass-card text-center" style={{ padding: '40px' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: '40px' }}>No notifications found.</div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className={`notification-item glass-card ${n.is_read ? 'read' : 'unread'}`}
            >
              <div className="notif-content">
                <div className={`notif-icon-circle ${n.type === 'like' ? 'like' : 'comment'}`}>
                  {n.type === 'like' ? <ThumbsUp size={18} /> : <MessageSquare size={18} />}
                </div>
                <div className="notif-body">
                  <p className="notif-message">
                    {n.message}
                  </p>
                  <div className="notif-meta">
                    <span className="notif-date">
                      {new Date(n.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {n.post && (
                      <span className="notif-post">
                        Post: <strong>{n.post.title}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="notif-actions">
                {n.type === 'comment' && (
                  <button 
                    onClick={() => setActiveTab('comments')} 
                    className="btn btn-saffron btn-sm notif-btn"
                  >
                    Comments
                  </button>
                )}
                {!n.is_read && (
                  <button 
                    onClick={() => handleMarkRead(n.id)} 
                    className="btn btn-outline btn-sm notif-btn"
                  >
                    Mark Read
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(n.id)} 
                  className="btn-icon text-red notif-delete-btn" 
                  title="Delete Notification"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── SUBSCRIBERS / RECIPIENTS MANAGER ────────────────────────────────
function SubscribersManager({ token, onUpdate }: { token: string | null, onUpdate: () => void }) {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    try {
      const res = await fetch(apiUrl('/admin/subscribers'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(Array.isArray(data) ? data : (data.items || data.data || []));
      }
    } catch (e) {
      setSubscribers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'unsubscribed' ? 'active' : 'unsubscribed';
    try {
      const res = await fetch(apiUrl(`/admin/subscribers/${id}/status`), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchSubscribers();
        onUpdate();
      }
    } catch (err) {
      alert('Failed to update subscriber status');
    }
  };

  return (
    <div className="subscribers-manager animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '600', margin: '0 0 4px 0' }}>Manage Subscribers & Recipients</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
            Manage subscriber email/SMS broadcast lists. Statuses can be toggled without deleting recipient records.
          </p>
        </div>
      </div>

      <div className="dash-table-wrapper glass-card">
        <table className="dash-table">
          <thead>
            <tr>
              <th>Subscriber Name</th>
              <th>Email Address</th>
              <th>Phone</th>
              <th>Status</th>
              <th>Date Subscribed</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>Loading subscribers...</td></tr>
            ) : subscribers.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', padding: '24px' }}>No subscribers found.</td></tr>
            ) : (
              subscribers.map((sub) => (
                <tr key={sub.id}>
                  <td><strong>{sub.name || 'Anonymous'}</strong></td>
                  <td>{sub.email || '—'}</td>
                  <td>{sub.phone || '—'}</td>
                  <td>
                    <span className={`badge ${sub.status === 'unsubscribed' ? 'red-bg' : 'green-bg'}`}>
                      {sub.status === 'unsubscribed' ? 'Unsubscribed' : 'Active'}
                    </span>
                  </td>
                  <td>{new Date(sub.created_at).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => toggleStatus(sub.id, sub.status)}
                      className="btn btn-outline btn-sm"
                      style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                    >
                      {sub.status === 'unsubscribed' ? 'Mark Active' : 'Unsubscribe'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── VISITOR ANALYTICS PANEL ──────────────────────────────────────────

interface AnalyticsSession {
  session_id: string;
  visitor_id: string;
  visitor_name?: string | null;
  started_at: string;
  last_seen_at: string;
  duration_seconds: number | string;
  pageviews_count: number | string;
  entry_page: string;
  pages_visited: string;
  device_type: string;
  browser: string;
  os: string;
  referrer: string;
  pages_list?: string[];
}

interface AnalyticsData {
  range: string;
  kpis: {
    unique_visitors: number;
    unique_today: number;
    total_sessions: number;
    total_pageviews: number;
    avg_duration_seconds: number;
  };
  device_breakdown: Record<string, number>;
  top_pages: Array<{ path: string; views: number }>;
  top_entry_pages: Array<{ path: string; count: number }>;
  recent_sessions: AnalyticsSession[];
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function formatRouteLabel(path: string): string {
  if (!path || path === '/' || path === '/#/' || path === '/#') return 'Home (/)';
  const clean = path.replace(/^(\/#|\/)/, '').split('?')[0];
  if (!clean) return 'Home (/)';
  return '/' + clean;
}

function AnalyticsPanel({ token }: { token: string | null }) {
  const [range, setRange] = useState<'today' | '7d' | '30d' | 'all'>('7d');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (selectedRange = range, isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await fetch(apiUrl(`/admin/analytics?range=${selectedRange}`), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(range);
  }, [range, token]);

  const kpis = data?.kpis || {
    unique_visitors: 0,
    unique_today: 0,
    total_sessions: 0,
    total_pageviews: 0,
    avg_duration_seconds: 0
  };

  const deviceBreakdown = data?.device_breakdown || {};
  const totalDeviceCount = Object.values(deviceBreakdown).reduce((a, b) => a + b, 0) || 1;
  const mobileCount = deviceBreakdown.mobile || 0;
  const desktopCount = deviceBreakdown.desktop || 0;
  const tabletCount = deviceBreakdown.tablet || 0;

  const mobilePct = Math.round((mobileCount / totalDeviceCount) * 100);
  const desktopPct = Math.round((desktopCount / totalDeviceCount) * 100);
  const tabletPct = Math.max(0, 100 - (mobilePct + desktopPct));

  const topPages = data?.top_pages || [];
  const maxViews = topPages.length > 0 ? Math.max(...topPages.map(p => p.views), 1) : 1;
  const recentSessions = data?.recent_sessions || [];

  return (
    <div className="analytics-container animate-fade-in">
      {/* Header with Title and Range Switcher */}
      <div className="analytics-header glass-card">
        <div className="analytics-header-title">
          <h2>
            <Activity className="saffron" size={24} />
            Visitor Analytics & Usage Patterns
          </h2>
          <p>Real-time zero-impact visitor metrics, navigation journeys, and audience breakdown</p>
        </div>

        <div className="analytics-controls">
          <div className="analytics-range-selector">
            {(['today', '7d', '30d', 'all'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`analytics-range-btn ${range === r ? 'active' : ''}`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'All Time'}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => fetchAnalytics(range, true)}
            className="btn btn-outline analytics-refresh-btn"
            title="Refresh Data"
            disabled={refreshing || loading}
          >
            <RefreshCw size={14} className={refreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card glass-card">
          <div className="analytics-kpi-icon" style={{ background: 'rgba(13, 148, 136, 0.15)', color: '#14b8a6' }}>
            <Users size={22} />
          </div>
          <div className="analytics-kpi-info">
            <span className="analytics-kpi-value">{kpis.unique_visitors}</span>
            <span className="analytics-kpi-label">Unique Visitors</span>
            <span className="analytics-kpi-badge" style={{ background: 'rgba(13, 148, 136, 0.2)', color: '#2dd4bf' }}>
              Distinct People
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card glass-card">
          <div className="analytics-kpi-icon" style={{ background: 'rgba(255, 153, 51, 0.15)', color: '#FF9933' }}>
            <TrendingUp size={22} />
          </div>
          <div className="analytics-kpi-info">
            <span className="analytics-kpi-value">{kpis.unique_today}</span>
            <span className="analytics-kpi-label">Unique Today</span>
            <span className="analytics-kpi-badge saffron-bg" style={{ color: '#0f172a' }}>
              Live Counter
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card glass-card">
          <div className="analytics-kpi-icon" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
            <Activity size={22} />
          </div>
          <div className="analytics-kpi-info">
            <span className="analytics-kpi-value">{kpis.total_sessions}</span>
            <span className="analytics-kpi-label">Total Visits</span>
            <span className="analytics-kpi-badge" style={{ background: 'rgba(99, 102, 241, 0.2)', color: '#a5b4fc' }}>
              Sessions
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card glass-card">
          <div className="analytics-kpi-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#f472b6' }}>
            <Eye size={22} />
          </div>
          <div className="analytics-kpi-info">
            <span className="analytics-kpi-value">{kpis.total_pageviews}</span>
            <span className="analytics-kpi-label">Page Views</span>
            <span className="analytics-kpi-badge" style={{ background: 'rgba(236, 72, 153, 0.2)', color: '#fbcfe8' }}>
              Total Hits
            </span>
          </div>
        </div>

        <div className="analytics-kpi-card glass-card">
          <div className="analytics-kpi-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
            <Clock size={22} />
          </div>
          <div className="analytics-kpi-info">
            <span className="analytics-kpi-value">{formatDuration(kpis.avg_duration_seconds)}</span>
            <span className="analytics-kpi-label">Avg Time on Site</span>
            <span className="analytics-kpi-badge green-bg" style={{ color: '#0f172a' }}>
              Dwell Time
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Top Pages & Device Composition */}
      <div className="analytics-grid-two">
        {/* Top Pages */}
        <div className="analytics-card glass-card">
          <h3 className="analytics-card-title">
            <span>Popular Pages & Sections</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Views</span>
          </h3>

          {topPages.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
              No page visit data recorded in this period yet.
            </div>
          ) : (
            <div className="analytics-page-list">
              {topPages.map((page, idx) => {
                const pct = Math.max(8, Math.round((page.views / maxViews) * 100));
                return (
                  <div key={idx} className="analytics-page-item">
                    <div className="analytics-page-bar" style={{ width: `${pct}%` }} />
                    <div className="analytics-page-path">
                      <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>#{idx + 1}</span>
                      <span>{formatRouteLabel(page.path)}</span>
                    </div>
                    <span className="analytics-page-count">{page.views} views</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Device Breakdown & Top Entry Points */}
        <div className="analytics-card glass-card">
          <h3 className="analytics-card-title">
            <span>Device Distribution</span>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Total: {totalDeviceCount}</span>
          </h3>

          <div className="analytics-devices-wrap">
            {/* Visual Multi-Segment Bar */}
            <div className="analytics-device-bar-track">
              {desktopPct > 0 && <div className="analytics-device-bar-segment" style={{ width: `${desktopPct}%`, background: '#3b82f6' }} title={`Desktop: ${desktopPct}%`} />}
              {mobilePct > 0 && <div className="analytics-device-bar-segment" style={{ width: `${mobilePct}%`, background: '#10b981' }} title={`Mobile: ${mobilePct}%`} />}
              {tabletPct > 0 && <div className="analytics-device-bar-segment" style={{ width: `${tabletPct}%`, background: '#f59e0b' }} title={`Tablet: ${tabletPct}%`} />}
            </div>

            <div className="analytics-device-legend">
              <div className="analytics-device-item">
                <span className="analytics-device-item-name">
                  <Laptop size={14} style={{ color: '#3b82f6' }} /> Desktop
                </span>
                <span className="analytics-device-item-val">{desktopPct}%</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{desktopCount} visits</span>
              </div>
              <div className="analytics-device-item">
                <span className="analytics-device-item-name">
                  <Smartphone size={14} style={{ color: '#10b981' }} /> Mobile
                </span>
                <span className="analytics-device-item-val">{mobilePct}%</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{mobileCount} visits</span>
              </div>
              <div className="analytics-device-item">
                <span className="analytics-device-item-name">
                  <Tablet size={14} style={{ color: '#f59e0b' }} /> Tablet
                </span>
                <span className="analytics-device-item-val">{tabletPct > 0 ? tabletPct : 0}%</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{tabletCount} visits</span>
              </div>
            </div>

            {/* Top Landing / Entry Pages */}
            <div style={{ marginTop: '14px' }}>
              <h4 style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Top Entry Pages (Landing Points)
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {(data?.top_entry_pages || []).slice(0, 4).map((entry, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', padding: '6px 10px', borderRadius: '6px', background: 'rgba(255,255,255,0.03)' }}>
                    <span>{formatRouteLabel(entry.path)}</span>
                    <strong style={{ color: 'var(--primary)' }}>{entry.count} landings</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Visitor Journeys Table */}
      <div className="analytics-card glass-card">
        <h3 className="analytics-card-title">
          <span>Recent Visitor Navigation Journeys</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Latest {recentSessions.length} Sessions</span>
        </h3>

        <div className="responsive-table-wrap" style={{ maxHeight: '520px', overflowY: 'auto' }}>
          <table className="admin-table analytics-journey-table">
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Device & OS</th>
                <th>Dwell Time</th>
                <th>Pages Viewed</th>
                <th>Navigation Path Sequence</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {loading && recentSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                    Loading visitor sessions...
                  </td>
                </tr>
              ) : recentSessions.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '32px' }}>
                    No visitor sessions recorded yet.
                  </td>
                </tr>
              ) : (
                recentSessions.map((session) => {
                  const pagesList = session.pages_list && session.pages_list.length > 0
                    ? session.pages_list
                    : [session.entry_page || '/'];

                  return (
                    <tr key={session.session_id}>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          {session.visitor_name ? (
                            <strong style={{ color: 'var(--primary)' }}>
                              {session.visitor_name}
                            </strong>
                          ) : (
                            <span style={{ fontWeight: 600 }}>
                              Guest #{session.visitor_id.substring(session.visitor_id.length - 6)}
                            </span>
                          )}
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                            {session.visitor_id.substring(0, 10)}...
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.06)', textTransform: 'capitalize' }}>
                          {session.device_type} • {session.browser || session.os || 'Browser'}
                        </span>
                      </td>
                      <td>
                        <strong style={{ color: '#34d399' }}>
                          {formatDuration(Number(session.duration_seconds) || 0)}
                        </strong>
                      </td>
                      <td>
                        <span className="badge" style={{ background: 'rgba(255, 153, 51, 0.15)', color: '#FF9933' }}>
                          {session.pageviews_count} pages
                        </span>
                      </td>
                      <td>
                        <div className="analytics-journey-flow">
                          {pagesList.map((p, pIdx) => (
                            <React.Fragment key={pIdx}>
                              <span className="analytics-journey-step">
                                {formatRouteLabel(typeof p === 'string' ? p : (p as any)?.path || '/')}
                              </span>
                              {pIdx < pagesList.length - 1 && (
                                <span className="analytics-journey-arrow">→</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {session.last_seen_at ? new Date(session.last_seen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── DIAGNOSTICS PANEL (FCM & SYSTEM DIAGNOSTICS) ─────────────────────

function DiagnosticsPanel({ token }: { token: string | null }) {
  const [fcmStatus, setFcmStatus] = useState<any>(null);
  const [fcmLoading, setFcmLoading] = useState(false);
  const [testPushLoading, setTestPushLoading] = useState(false);
  const [diagMessage, setDiagMessage] = useState<string | null>(null);
  const [systemHealth, setSystemHealth] = useState<{ status: string; version: string } | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  const fetchFcmStatus = async () => {
    setFcmLoading(true);
    try {
      const res = await fetch(apiUrl('/admin/notifications/fcm-status'), {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFcmStatus(data);
      }
    } catch (e) {
      // ignore
    } finally {
      setFcmLoading(false);
    }
  };

  const checkHealth = async () => {
    setHealthLoading(true);
    try {
      const res = await fetch(apiUrl('/health'));
      if (res.ok) {
        const data = await res.json();
        setSystemHealth(data);
      }
    } catch (e) {
      setSystemHealth(null);
    } finally {
      setHealthLoading(false);
    }
  };

  useEffect(() => {
    fetchFcmStatus();
    checkHealth();
  }, []);

  const handleSyncToken = async () => {
    const curToken = getLocalFCMToken();
    if (!curToken) {
      setDiagMessage('⚠️ No local FCM token stored on this device yet. Open the native Android app while logged in.');
      return;
    }
    const res = await submitFCMTokenToServer(curToken, token || undefined);
    if (res.ok) {
      setDiagMessage('✅ Device FCM token registered successfully with server!');
      fetchFcmStatus();
    } else {
      setDiagMessage(`❌ Token submission failed: ${res.error || res.status}`);
    }
  };

  const handleSendTestPush = async () => {
    setTestPushLoading(true);
    setDiagMessage(null);
    try {
      const res = await fetch(apiUrl('/admin/notifications/test-push'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setDiagMessage('🚀 Test push dispatched! Close or minimize the app to verify background delivery.');
        fetchFcmStatus();
      } else {
        setDiagMessage(`❌ Test push failed: ${data?.detail || res.status}`);
      }
    } catch (err: any) {
      setDiagMessage(`❌ Network error: ${err?.message}`);
    } finally {
      setTestPushLoading(false);
    }
  };

  return (
    <div className="diagnostics-panel animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="glass-card" style={{ padding: '20px 24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', margin: '0 0 6px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Wrench className="saffron" size={24} />
          System & Background Diagnostics
        </h2>
        <p style={{ margin: 0, fontSize: '0.86rem', color: 'var(--text-muted)' }}>
          Verify FCM push notification infrastructure, device registration, and backend service status.
        </p>
      </div>

      {/* ─── Push Notification Diagnostics Card ─── */}
      <div className="glass-card fcm-diag-card">
        <div className="fcm-diag-header">
          <div className="fcm-diag-title-area">
            <h3 className="fcm-diag-title">
              <Bell size={18} style={{ color: '#f97316' }} /> Background Push Diagnostics
            </h3>
            <p className="fcm-diag-desc">
              Verify FCM device registration and test background delivery when app is closed.
            </p>
          </div>
          <div className="fcm-diag-actions">
            <button 
              onClick={handleSyncToken}
              className="btn btn-outline btn-sm sync-token-btn"
              title="Re-register this device's token with the server"
            >
              <RefreshCw size={14} /> <span>Sync Token</span>
            </button>
            <button 
              onClick={handleSendTestPush}
              disabled={testPushLoading}
              className="btn btn-primary btn-sm test-push-btn"
            >
              <Bell size={14} /> <span>{testPushLoading ? 'Sending...' : 'Test Push'}</span>
            </button>
          </div>
        </div>

        {diagMessage && (
          <div className="fcm-diag-alert">
            {diagMessage}
          </div>
        )}

        <div className="fcm-diag-grid">
          <div className="fcm-diag-box">
            <div className="fcm-diag-box-label">Device Token (Local)</div>
            <div className="fcm-diag-box-val">
              {getLocalFCMToken() ? `✅ Registered (${getLocalFCMToken()?.slice(0, 14)}...)` : '⚠️ None (Android App Only)'}
            </div>
          </div>
          <div className="fcm-diag-box">
            <div className="fcm-diag-box-label">Server Registered Tokens</div>
            <div className="fcm-diag-box-val">
              {fcmLoading ? 'Checking...' : fcmStatus ? `${fcmStatus.fcm_tokens_registered} device(s) in DB` : 'Unknown'}
            </div>
          </div>
          <div className="fcm-diag-box">
            <div className="fcm-diag-box-label">Service Account File</div>
            <div className="fcm-diag-box-val">
              {fcmLoading ? 'Checking...' : fcmStatus?.firebase_service_account_found ? '✅ Detected on Server' : '❌ Not Found (Upload to api/)'}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Backend & Environment Diagnostics Card ─── */}
      <div className="glass-card" style={{ padding: '22px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '700', margin: '0 0 4px 0' }}>
              Backend & Platform Environment
            </h3>
            <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Live connection status to the backend API services.
            </p>
          </div>
          <button 
            onClick={checkHealth}
            disabled={healthLoading}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <RefreshCw size={14} className={healthLoading ? 'spin' : ''} />
            <span>Check API</span>
          </button>
        </div>

        <div className="fcm-diag-grid">
          <div className="fcm-diag-box">
            <div className="fcm-diag-box-label">API Health</div>
            <div className="fcm-diag-box-val">
              {healthLoading ? 'Checking...' : systemHealth?.status === 'healthy' ? '✅ Online (Healthy)' : '⚠️ Unreachable'}
            </div>
          </div>
          <div className="fcm-diag-box">
            <div className="fcm-diag-box-label">Backend Version</div>
            <div className="fcm-diag-box-val">
              {systemHealth?.version ? `v${systemHealth.version}` : '—'}
            </div>
          </div>
          <div className="fcm-diag-box">
            <div className="fcm-diag-box-label">Client Platform</div>
            <div className="fcm-diag-box-val">
              {typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform?.() ? 'Android / Native App' : 'Web Browser'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

