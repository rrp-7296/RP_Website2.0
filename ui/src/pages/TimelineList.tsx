import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Home as HomeIcon, ThumbsUp, Heart } from 'lucide-react';
import { apiUrl, uploadUrl } from '../config/api';
import ShareButtons from '../components/ShareButtons';
import { useVisitor } from '../context/VisitorContext';

interface TimelineEvent {
  id: number;
  text: string;
  location: string;
  date: string;
  image?: string;
  likes: number;
  liked?: boolean;
}

const mockEvents: TimelineEvent[] = [
  {
    id: 1,
    text: "Addressed the national delegate conference on labor reforms, emphasizing workers' rights in emerging gig economies.",
    location: "New Delhi",
    date: "2026-05-15",
    image: "/img/58.jpg",
    likes: 18
  },
  {
    id: 2,
    text: "Inaugurated the educational wing at Bal Gyam Peeth High School to provide free computer education to over 500 poor students.",
    location: "Jamshedpur",
    date: "2026-04-10",
    image: "/img/g37.jpg",
    likes: 32
  },
  {
    id: 3,
    text: "Successfully negotiated the annual wage and productivity bonus agreement for workers in TRF and Tayo Rolls.",
    location: "Jamshedpur",
    date: "2026-03-25",
    image: "/img/02.jpg",
    likes: 25
  },
  {
    id: 4,
    text: "Attended the World Base Metal Conference meeting, representing the Indian National Metal Workers Federation.",
    location: "Geneva, Switzerland",
    date: "2026-02-18",
    image: "/img/43.jpg",
    likes: 14
  },
  {
    id: 5,
    text: "Distributed blankets and winter packages to over 1000 rural families during a severe cold wave in Bhabhua districts.",
    location: "Bhabhua, Bihar",
    date: "2026-01-14",
    image: "/img/g37.jpg",
    likes: 41
  }
];

export default function TimelineList() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/timeline?page=1&limit=50'))
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data && data.items && data.items.length > 0) {
          const formatted = data.items.map((item: any) => ({
            id: item.id,
            text: item.text,
            location: item.location || 'Jamshedpur',
            date: item.date ? new Date(item.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent',
            image: item.image ? uploadUrl(item.image) : undefined,
            likes: item.likes || item.likes_count || 0
          }));
          setEvents(formatted);
        } else {
          setEvents(mockEvents);
        }
        setLoading(false);
      })
      .catch(() => {
        setEvents(mockEvents);
        setLoading(false);
      });
  }, []);

  const { requireVisitor } = useVisitor();

  const handleLike = (id: number) => {
    const target = events.find(e => e.id === id);
    if (target?.liked) return;

    requireVisitor(async (prof) => {
      // Optimistic UI update
      setEvents(prev => prev.map(e => e.id === id ? { ...e, likes: e.likes + 1, liked: true } : e));

      try {
        const res = await fetch(apiUrl(`/timeline/${id}/like`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: prof.name })
        });
        if (res.ok) {
          const data = await res.json();
          const updatedLikes = data.likes ?? data.likes_count;
          if (updatedLikes !== undefined) {
            setEvents(prev => prev.map(e => e.id === id ? { ...e, likes: updatedLikes, liked: true } : e));
          }
        }
      } catch (err) {
        console.error('Failed to record like', err);
      }
    });
  };

  return (
    <div className="timeline-page page-container container section-padding" style={{ paddingTop: '120px' }}>
      <div className="page-breadcrumbs">
        <Link to="/"><HomeIcon size={16} /> Home</Link>
        <span>/</span>
        <span className="current">Timeline</span>
      </div>

      <div className="section-header" style={{ textAlign: 'left', marginBottom: '48px' }}>
        <h1 className="section-title" style={{ fontSize: '3rem' }}>Journey Timeline</h1>
        <p className="section-subtitle" style={{ margin: '0' }}>A chronological history of meetings, representations, struggles, and welfare activities.</p>
      </div>

      {loading ? (
        <div className="text-center">Loading journey details...</div>
      ) : (
        <div className="timeline-list-wrapper">
          <div className="timeline-vertical-center-line"></div>
          {events.map((event, index) => {
            const isEven = index % 2 === 0;
            return (
              <div key={event.id} className={`timeline-list-item ${isEven ? 'left-align' : 'right-align'} animate-fade-in`}>
                <div className="timeline-badge saffron"></div>
                <div className="timeline-panel glass-card" style={{ padding: '20px' }}>
                  {event.image && (
                    <div className="timeline-panel-img-wrapper">
                      <img src={event.image} alt={event.location} className="timeline-panel-img" />
                    </div>
                  )}
                  <div className="timeline-panel-body">
                    <div className="timeline-panel-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <span className="panel-date" style={{ marginRight: '12px' }}><Calendar size={14} /> {event.date}</span>
                        <span className="panel-location"><MapPin size={14} /> {event.location}</span>
                      </div>
                      <button
                        onClick={() => handleLike(event.id)}
                        disabled={event.liked}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: event.liked ? '#FF9933' : 'var(--text-secondary)',
                          cursor: event.liked ? 'default' : 'pointer',
                          fontSize: '0.85rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '4px 10px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <Heart size={14} className={event.liked ? 'fill-saffron' : ''} /> {event.likes}
                      </button>
                    </div>
                    <p className="timeline-panel-text" style={{ marginBottom: '16px' }}>{event.text}</p>
                    
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '12px' }}>
                      <ShareButtons title={`Journey Timeline: ${event.text.substring(0, 60)}...`} />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

