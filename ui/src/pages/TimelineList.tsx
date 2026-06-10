import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Home as HomeIcon, ChevronLeft } from 'lucide-react';
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
  },
  {
    id: 4,
    text: "Attended the World Base Metal Conference meeting, representing the Indian National Metal Workers Federation.",
    location: "Geneva, Switzerland",
    date: "2026-02-18",
    image: "/img/43.jpg"
  },
  {
    id: 5,
    text: "Distributed blankets and winter packages to over 1000 rural families during a severe cold wave in Bhabhua districts.",
    location: "Bhabhua, Bihar",
    date: "2026-01-14",
    image: "/img/g37.jpg"
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
                <div className="timeline-panel glass-card">
                  {event.image && (
                    <div className="timeline-panel-img-wrapper">
                      <img src={event.image} alt={event.location} className="timeline-panel-img" />
                    </div>
                  )}
                  <div className="timeline-panel-body">
                    <div className="timeline-panel-meta">
                      <span className="panel-date"><Calendar size={14} /> {event.date}</span>
                      <span className="panel-location"><MapPin size={14} /> {event.location}</span>
                    </div>
                    <p className="timeline-panel-text">{event.text}</p>
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
