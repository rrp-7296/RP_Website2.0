import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Home as HomeIcon, X, ExternalLink, ThumbsUp, Heart } from 'lucide-react';
import { apiUrl, uploadUrl } from '../config/api';
import ShareButtons from '../components/ShareButtons';
import { useVisitor } from '../context/VisitorContext';

interface NewsItem {
  id: number;
  title: string;
  text: string;
  image?: string;
  url?: string;
  date: string;
  likes: number;
  liked?: boolean;
}

const mockNews: NewsItem[] = [
  {
    id: 1,
    title: "INTUC Protests Against Amendment of Labor Laws",
    text: "Jharkhand INTUC President Rakeshwar Pandey led a massive demonstration against the proposed amendments in industrial relations code, claiming they undermine collective bargaining rights.",
    image: "/img/edu/intuc.png",
    date: "2026-05-10",
    url: "https://www.prabhatkhabar.com",
    likes: 12
  },
  {
    id: 2,
    title: "Wage Revision Pact Signed for Tata Power Employees",
    text: "A new three-year wage revision agreement was signed between Tata Power management and the Employees Union headed by Rakeshwar Pandey, ensuring a 12% salary hike and better medical benefits.",
    image: "/img/edu/tatapower.jpg",
    date: "2026-04-28",
    url: "https://www.avenuemail.in",
    likes: 24
  },
  {
    id: 3,
    title: "Rakeshwar Pandey Attends IndustriAll Metal Conference",
    text: "National Secretary of INTUC, Rakeshwar Pandey, highlighted the challenges of contract workers in Indian steel factories during the base metals steering committee meeting.",
    image: "/img/02.jpg",
    date: "2026-04-05",
    url: "https://www.industriall-union.org",
    likes: 18
  },
  {
    id: 4,
    title: "Tinplate Mahila College Celebrates Annual Day",
    text: "As Chairman of the institution, Mr. Rakeshwar Pandey distributed scholarships and merit awards to poor female students, urging them to lead in tech and governance.",
    image: "/img/g7.jpg",
    date: "2026-03-18",
    likes: 9
  },
  {
    id: 5,
    title: "Support Extended to INCAB Workers in Jamshedpur",
    text: "At the General Body Meeting of the INCAB Employees Association, Union President Rakeshwar Pandey assured workers that talks are ongoing with potential buyers to revive the closed plant.",
    image: "/img/53.jpg",
    date: "2026-02-28",
    likes: 15
  },
  {
    id: 6,
    title: "Medical Camp Organized for Slum Areas in Adityapur",
    text: "Under the supervision of RSB Employees Association and NGO coordination, a free health checkup and medicine distribution camp was set up benefiting 800+ families.",
    image: "/img/g37.jpg",
    date: "2026-02-12",
    likes: 31
  }
];

export default function NewsList() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<NewsItem | null>(null);

  useEffect(() => {
    fetch(apiUrl('/news?page=1&limit=50'))
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data && data.items && data.items.length > 0) {
          const formatted = data.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            text: item.text,
            image: item.image ? uploadUrl(item.image) : undefined,
            date: item.date ? new Date(item.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent',
            url: item.url || undefined,
            likes: item.likes || item.likes_count || 0
          }));
          setNews(formatted);
        } else {
          setNews(mockNews);
        }
        setLoading(false);
      })
      .catch(() => {
        setNews(mockNews);
        setLoading(false);
      });
  }, []);

  const { requireVisitor } = useVisitor();

  const handleLike = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Check if already liked
    const target = news.find(n => n.id === id);
    if (target?.liked) return;

    requireVisitor(async (prof) => {
      // Optimistic UI update
      setNews(prev => prev.map(n => n.id === id ? { ...n, likes: n.likes + 1, liked: true } : n));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => prev ? { ...prev, likes: prev.likes + 1, liked: true } : null);
      }

      try {
        const res = await fetch(apiUrl(`/news/${id}/like`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: prof.name })
        });
        if (res.ok) {
          const data = await res.json();
          const updatedLikes = data.likes ?? data.likes_count;
          if (updatedLikes !== undefined) {
            setNews(prev => prev.map(n => n.id === id ? { ...n, likes: updatedLikes, liked: true } : n));
            if (selectedItem && selectedItem.id === id) {
              setSelectedItem(prev => prev ? { ...prev, likes: updatedLikes, liked: true } : null);
            }
          }
        }
      } catch (err) {
        console.error('Failed to record like', err);
      }
    });
  };

  return (
    <div className="news-page page-container container section-padding" style={{ paddingTop: '120px' }}>
      <div className="page-breadcrumbs">
        <Link to="/"><HomeIcon size={16} /> Home</Link>
        <span>/</span>
        <span className="current">News</span>
      </div>

      <div className="section-header" style={{ textAlign: 'left', marginBottom: '48px' }}>
        <h1 className="section-title" style={{ fontSize: '3rem' }}>News & Media Coverage</h1>
        <p className="section-subtitle" style={{ margin: '0' }}>Full archive of press releases, newspapers headlines, and coverage of INTUC rallies.</p>
      </div>

      {loading ? (
        <div className="text-center">Loading news archive...</div>
      ) : (
        <div className="news-list-grid grid-3">
          {news.map((item) => (
            <div key={item.id} className="news-card glass-card">
              <div className="news-card-img-wrapper">
                <img src={item.image || '/img/edu/intuc.png'} alt={item.title} className="news-card-img" />
              </div>
              <div className="news-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span className="news-date"><Calendar size={12} /> {item.date}</span>
                  <button
                    onClick={(e) => handleLike(item.id, e)}
                    disabled={item.liked}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: item.liked ? '#FF9933' : 'var(--text-secondary)',
                      cursor: item.liked ? 'default' : 'pointer',
                      fontSize: '0.8rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      padding: '4px 8px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <Heart size={14} className={item.liked ? 'fill-saffron' : ''} /> {item.likes}
                  </button>
                </div>
                <h3 className="news-card-title">{item.title}</h3>
                <p className="news-card-excerpt">{item.text.length > 150 ? `${item.text.substring(0, 150)}...` : item.text}</p>
                <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button onClick={() => setSelectedItem(item)} className="btn btn-outline btn-sm">
                    Read Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* News Modal Detail */}
      {selectedItem && (
        <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
          <div className="modal-content glass-card animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedItem(null)}>
              <X size={24} />
            </button>
            <div className="modal-body">
              <img src={selectedItem.image || '/img/edu/intuc.png'} alt={selectedItem.title} className="modal-img" />
              <div className="modal-meta" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                <span><Calendar size={14} /> {selectedItem.date}</span>
                <button
                  onClick={() => handleLike(selectedItem.id)}
                  disabled={selectedItem.liked}
                  className={`btn btn-sm ${selectedItem.liked ? 'btn-saffron' : 'btn-outline'}`}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <ThumbsUp size={14} /> {selectedItem.liked ? 'Liked!' : 'Like'} ({selectedItem.likes})
                </button>
              </div>
              <h3 className="modal-title" style={{ marginTop: '16px' }}>{selectedItem.title}</h3>
              <p className="modal-text" style={{ whiteSpace: 'pre-line' }}>{selectedItem.text}</p>
              
              {selectedItem.url && (
                <a href={selectedItem.url} target="_blank" rel="noopener noreferrer" className="btn btn-saffron modal-link-btn" style={{ marginTop: '20px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Read External Source <ExternalLink size={16} />
                </a>
              )}

              <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                <ShareButtons title={selectedItem.title} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

