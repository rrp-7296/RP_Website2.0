import { apiUrl, uploadUrl } from '../../config/api';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, BookOpen, Calendar, Image as ImageIcon, MessageSquare, Mail, 
  Plus, Trash2, Check, LogOut, Upload, Shield, Eye, ThumbsUp, MapPin, Compass,
  Bell, Menu, X, Users, RefreshCw
} from 'lucide-react';
import ThemeToggle from '../../components/ThemeToggle';

type Tab = 'overview' | 'blogs' | 'timeline' | 'news' | 'gallery' | 'messages' | 'comments' | 'notifications' | 'subscribers';

interface Stats {
  total_blogs: number;
  total_timeline: number;
  total_news: number;
  total_gallery: number;
  unread_messages: number;
  pending_comments: number;
  total_subscribers: number;
  unread_notifications: number;
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
  const token = localStorage.getItem('admin_token');

  // Verify Auth on Load
  useEffect(() => {
    if (!token) {
      navigate('/admin');
      return;
    }

    fetch(apiUrl('/auth/me'), {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      if (!res.ok) {
        localStorage.removeItem('admin_token');
        navigate('/admin');
      }
    })
    .catch(() => {
      // Allow demo environment fallback if server not running
    });

    fetchStats();
  }, [token, navigate]);

  const fetchStats = async () => {
    try {
      const res = await fetch(apiUrl('/admin/stats'), {
        headers: { 'Authorization': `Bearer ${token}` }
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

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin');
  };

  const handleTabClick = (tab: Tab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="admin-dashboard container section-padding" style={{ paddingTop: '120px', minHeight: '90vh' }}>
      {/* Header */}
      <div className="admin-dash-header glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="mobile-menu-toggle btn-icon"
            style={{ display: 'none' }}
            title="Toggle Menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Shield className="saffron" size={28} />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: '0' }}>Admin Dashboard</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Welcome, Administrator</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ThemeToggle />
          <button onClick={handleLogout} className="btn btn-outline btn-sm" style={{ gap: '8px' }}>
            <LogOut size={16} /> Logout
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
          </ul>
        </aside>

        {/* Content Area */}
        <main className="dashboard-content-panel">
          {activeTab === 'overview' && <OverviewTab stats={stats} />}
          {activeTab === 'blogs' && <BlogsManager token={token} onUpdate={fetchStats} />}
          {activeTab === 'timeline' && <TimelineManager token={token} onUpdate={fetchStats} />}
          {activeTab === 'news' && <NewsManager token={token} onUpdate={fetchStats} />}
          {activeTab === 'gallery' && <GalleryManager token={token} onUpdate={fetchStats} />}
          {activeTab === 'messages' && <MessagesInbox token={token} onUpdate={fetchStats} />}
          {activeTab === 'comments' && <CommentsApproval token={token} onUpdate={fetchStats} />}
          {activeTab === 'notifications' && <NotificationsPanel token={token} onUpdate={fetchStats} setActiveTab={setActiveTab} />}
          {activeTab === 'subscribers' && <SubscribersManager token={token} onUpdate={fetchStats} />}
        </main>
      </div>
    </div>
  );
}

// ─── OVERVIEW TAB ───────────────────────────────────────────────────
function OverviewTab({ stats }: { stats: Stats }) {
  return (
    <div className="overview-tab animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>System Overview</h2>
      <div className="grid-3" style={{ gap: '20px', marginBottom: '32px' }}>
        <div className="stat-card gradient-cyan" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px' }}>
          <div className="stat-icon-wrapper" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}><BookOpen size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0', color: 'white' }}>{stats.total_blogs}</h3>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)' }}>Total Blogs</span>
          </div>
        </div>

        <div className="stat-card gradient-saffron" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px' }}>
          <div className="stat-icon-wrapper" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}><Calendar size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0', color: 'white' }}>{stats.total_timeline}</h3>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)' }}>Timeline Events</span>
          </div>
        </div>

        <div className="stat-card gradient-pink" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '16px' }}>
          <div className="stat-icon-wrapper" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', color: 'white' }}><Compass size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0', color: 'white' }}>{stats.total_news}</h3>
            <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.85)' }}>News Articles</span>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: '24px' }}>
        <div className="stat-card gradient-purple" style={{ padding: '24px', display: 'flex', gap: '16px', borderRadius: '16px' }}>
          <div className="stat-icon-wrapper" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', color: 'white', height: 'fit-content' }}><Mail size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0', color: 'white' }}>{stats.unread_messages}</h3>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white' }}>Unread Messages</span>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: '8px' }}>Inbox messages submitted via contact form that require review and response.</p>
          </div>
        </div>

        <div className="stat-card gradient-blue" style={{ padding: '24px', display: 'flex', gap: '16px', borderRadius: '16px' }}>
          <div className="stat-icon-wrapper" style={{ padding: '16px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', color: 'white', height: 'fit-content' }}><MessageSquare size={24} /></div>
          <div>
            <h3 style={{ fontSize: '1.8rem', fontWeight: '700', margin: '0', color: 'white' }}>{stats.pending_comments}</h3>
            <span style={{ fontSize: '0.95rem', fontWeight: '600', color: 'white' }}>Pending Comments</span>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.85)', marginTop: '8px' }}>Comments posted on blog articles awaiting approval prior to public rendering.</p>
          </div>
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
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    if (imageFile) {
      formData.append('image', imageFile);
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
        setImageFile(null);
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

      {showAddForm && (
        <div className="modal-overlay" onClick={() => setShowAddForm(false)}>
          <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
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
                <label>Featured Image File</label>
                <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="form-input" />
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
        </div>
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
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    if (imageFile) {
      formData.append('image', imageFile);
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
        setImageFile(null);
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
              <label>Event Image File</label>
              <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="form-input" />
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
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    if (imageFile) {
      formData.append('image', imageFile);
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
        setImageFile(null);
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
              <label>News Banner Image</label>
              <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="form-input" />
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
  const [imageFile, setImageFile] = useState<File | null>(null);
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
    if (!token || !imageFile) return;
    setSubmitting(true);

    const formData = new FormData();
    formData.append('tag', tag);
    formData.append('caption', caption);
    formData.append('image', imageFile);

    try {
      const res = await fetch(apiUrl('/admin/gallery'), {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setCaption('');
        setImageFile(null);
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
      const res = await fetch(apiUrl(`/admin/gallery/${id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchImages();
        onUpdate();
      }
    } catch (e) {
      alert('Delete failed');
    }
  };

  return (
    <div className="gallery-manager animate-fade-in">
      <h2 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '24px' }}>Manage Gallery</h2>

      <div className="grid-2" style={{ alignItems: 'start', gap: '32px', gridTemplateColumns: '320px 1fr' }}>
        <div className="upload-form glass-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '16px' }}><Upload size={18} style={{ display: 'inline', marginRight: '8px' }} /> Upload Photo</h3>
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
              <label>Choose File</label>
              <input type="file" required onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="form-input" />
            </div>
            <button type="submit" disabled={submitting || !imageFile} className="btn btn-saffron" style={{ width: '100%' }}>
              {submitting ? 'Uploading...' : 'Upload Image'}
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

      {activeReplyMessage && (
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
        </div>
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

      <div className="notifications-list" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {loading ? (
          <div className="glass-card text-center" style={{ padding: '40px' }}>Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: '40px' }}>No notifications found.</div>
        ) : (
          notifications.map((n) => (
            <div 
              key={n.id} 
              className="notification-item glass-card" 
              style={{ 
                padding: '20px', 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                borderLeft: n.is_read ? '1px solid var(--border-color)' : '4px solid var(--saffron)',
                background: n.is_read ? 'var(--bg-card)' : 'rgba(245, 158, 11, 0.04)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1', marginRight: '24px' }}>
                <div style={{ 
                  padding: '10px', 
                  borderRadius: '50%', 
                  background: n.type === 'like' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: n.type === 'like' ? 'var(--saffron)' : '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {n.type === 'like' ? <ThumbsUp size={18} /> : <MessageSquare size={18} />}
                </div>
                <div>
                  <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', margin: '0 0 4px', fontWeight: n.is_read ? 'normal' : '600' }}>
                    {n.message}
                  </p>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(n.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                    </span>
                    {n.post && (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Post: <strong style={{ color: 'var(--saffron)' }}>{n.post.title}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {n.type === 'comment' && (
                  <button 
                    onClick={() => setActiveTab('comments')} 
                    className="btn btn-saffron btn-sm" 
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    Go to Comments
                  </button>
                )}
                {!n.is_read && (
                  <button 
                    onClick={() => handleMarkRead(n.id)} 
                    className="btn btn-outline btn-sm" 
                    style={{ padding: '6px 10px', fontSize: '0.78rem' }}
                  >
                    Mark Read
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(n.id)} 
                  className="btn btn-outline btn-sm text-red" 
                  style={{ padding: '6px', minWidth: '32px', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  title="Delete Notification"
                >
                  <Trash2 size={14} />
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
