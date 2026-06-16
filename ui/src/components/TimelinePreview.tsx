import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { apiUrl, uploadUrl } from '../config/api';

interface TimelineEvent {
  id: number;
  text: string;
  location: string;
  date: string;
  image?: string;
}

const mockEvents: TimelineEvent[] = [
  {
    id: 1,
    text: "Addressed the national delegate conference on labor reforms, emphasizing workers' rights in emerging gig economies.",
    location: "New Delhi",
    date: "2026-05-15",
    image: "/img/58.jpg"
  },
  {
    id: 2,
    text: "Inaugurated the educational wing at Bal Gyam Peeth High School to provide free computer education to over 500 poor students.",
    location: "Jamshedpur",
    date: "2026-04-10",
    image: "/img/g37.jpg"
  },
  {
    id: 3,
    text: "Successfully negotiated the annual wage and productivity bonus agreement for workers in TRF and Tayo Rolls.",
    location: "Jamshedpur",
    date: "2026-03-25",
    image: "/img/02.jpg"
  }
];

export default function TimelinePreview() {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/timeline?page=1&limit=3'))
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data && data.items && data.items.length > 0) {
          // Format date strings
          const formatted = data.items.map((item: any) => ({
            id: item.id,
            text: item.text,
            location: item.location || 'Jamshedpur',
            date: item.date ? new Date(item.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent',
            image: item.image ? uploadUrl(item.image) : undefined
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

  return (
    <section id="timeline" className="timeline-section section-padding">
      <div className="container">
        <div className="section-header">
          <div className="section-eyebrow">
            <div className="eyebrow-line" aria-hidden="true" />
            Timeline
            <div className="eyebrow-line" aria-hidden="true" />
          </div>
          <h2 className="section-title">Recent Timeline</h2>
          <div className="section-divider" aria-hidden="true">
            <div className="divider-line divider-saffron" />
            <div className="divider-dot" />
            <div className="divider-line divider-green" />
          </div>
          <p className="section-subtitle">Track the latest activities, labor union engagements, and social work in progress.</p>
        </div>

        {loading ? (
          <div className="timeline-loading text-center">Loading timeline...</div>
        ) : (
          <div className="timeline-preview-layout">
            <div className="timeline-main-image-side">
              <div className="timeline-graphic-wrapper glass-card">
                <img src="/img/58.jpg" alt="Timeline Feature" className="timeline-feature-img" />
              </div>
            </div>
            
            <div className="timeline-events-side">
              <div className="timeline-vertical-line"></div>
              {events.map((event, idx) => (
                <div key={event.id} className="timeline-event-item glass-card animate-fade-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                  <div className="timeline-event-marker"></div>
                  <div className="timeline-event-meta">
                    <span className="event-date"><Calendar size={14} /> {event.date}</span>
                    {event.location && <span className="event-location"><MapPin size={14} /> {event.location}</span>}
                  </div>
                  <p className="timeline-event-text">{event.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="section-footer-actions text-center">
          <Link to="/timeline" className="btn btn-saffron">
            View Full Timeline <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
