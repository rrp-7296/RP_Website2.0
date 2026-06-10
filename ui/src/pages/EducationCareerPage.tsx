import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, ChevronLeft, ChevronRight, Award, Compass, ShieldCheck } from 'lucide-react';

const careerCarousel = [
  "/img/edu/e5.jpg",
  "/img/edu/e4.jpg",
  "/img/edu/ec01.jpeg",
  "/img/edu/e2.jpg",
  "/img/edu/e1.jpg"
];

const mainPosts = [
  { role: "President", organization: "Indian National Trade Union Congress (INTUC), Jharkhand", details: "Directs policies and represents 100,000+ workers." },
  { role: "National Secretary", organization: "INTUC Center, New Delhi", details: "Co-coordinates metal and energy sector negotiations nationally." },
  { role: "Working Committee Member", organization: "Jharkhand Pradesh Congress Committee (JPCC), Ranchi", details: "Aids party organization and aligns political labor cells." },
  { role: "General Secretary", organization: "Indian National Metal Workers Federation, New Delhi", details: "Handles steel and mining federation worker negotiations." },
  { role: "Senior Vice President", organization: "Indian National Cement Workers Federation, Mumbai", details: "Co-represents cement sector labor agreements." },
  { role: "Member", organization: "Central Advisory Board (CAB), Ministry of Labor, Govt of India", details: "Advises the national wage cell on labor standards." }
];

const unionPresidencies = [
  { name: "Tata Power Employees Union", loc: "Jamshedpur", img: "/img/edu/tatapower.jpg" },
  { name: "Tata Robins Fraser (TRF) Labour Union", loc: "Jamshedpur", img: "/img/edu/trf.png" },
  { name: "Tisco Mazdoor Union (Growth Shop)", loc: "Jamshedpur", img: "/img/edu/tisco.jpg" },
  { name: "The Golmuri Tinplate Workers Union", loc: "Jamshedpur", img: "/img/edu/tinplate.png" },
  { name: "Tata Steel Processing & Distribution Employees Union", loc: "Jamshedpur", img: "/img/edu/tspdl.png" },
  { name: "India Steel and Wire (ISWP) Labour Union", loc: "Jamshedpur", img: "/img/edu/iswp.png" },
  { name: "Indian Oxygen (Linde) Workers Union", loc: "Jamshedpur", img: "/img/edu/linde.png" },
  { name: "Tata Tayo Workers Union", loc: "Jamshedpur", img: "/img/edu/tayo.png" },
  { name: "RSB Group Employees Association", loc: "Adityapur", img: "/img/edu/rsb.png" },
  { name: "Tata Steel Rural Development Workers Union", loc: "Jamshedpur", img: "/img/edu/tayo.png" },
  { name: "Nuvoco Cement Employees Union", loc: "Jamshedpur", img: "/img/edu/nuvoco.png" },
  { name: "Jamshedpur Eye Hospital Employees Union", loc: "Jamshedpur", img: "/img/edu/eyehsptl.png" },
  { name: "Tata Steel Tribal Society Workers Union", loc: "Jamshedpur", img: "/img/edu/tayo.png" },
  { name: "MTMH (Meherbai Cancer Hospital) Workers Union", loc: "Jamshedpur", img: "/img/edu/mtmh.png" }
];

export default function EducationCareerPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % careerCarousel.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="education-career-page page-container container section-padding" style={{ paddingTop: '120px' }}>
      <div className="page-breadcrumbs">
        <Link to="/"><HomeIcon size={16} /> Home</Link>
        <span>/</span>
        <span className="current">Education & Career</span>
      </div>

      <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '3rem' }}>Education & Career</h1>
        <p className="section-subtitle" style={{ margin: '0' }}>A timeline of trade union presidencies, national federation roles, and global representation.</p>
      </div>

      {/* Grid Summary */}
      <div className="grid-2" style={{ alignItems: 'start', gap: '48px', marginBottom: '60px' }}>
        <div className="bio-slider glass-card" style={{ position: 'relative', overflow: 'hidden', height: '400px', borderRadius: '12px' }}>
          <img 
            src={careerCarousel[activeSlide]} 
            alt={`Career slide ${activeSlide + 1}`} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button 
            className="carousel-nav prev" 
            onClick={() => setActiveSlide(prev => (prev > 0 ? prev - 1 : careerCarousel.length - 1))}
            style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}
          >
            <ChevronLeft size={24} />
          </button>
          <button 
            className="carousel-nav next" 
            onClick={() => setActiveSlide(prev => (prev + 1) % careerCarousel.length)}
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}
          >
            <ChevronRight size={24} />
          </button>
        </div>

        <div className="career-summary-text glass-card" style={{ padding: '32px' }}>
          <h2 className="sub-title" style={{ fontSize: '2rem', marginBottom: '16px' }}>Professional Beginnings</h2>
          <p className="c-text" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
            Mr. Rakeshwar Pandey started his career in the Tata Steel Growth Shop, joining as an apprentice. Driven by a deep commitment to labor equity, he actively engaged in grievances early on. He entered the trade union movement as a young worker in 1986. 
          </p>
          <p className="c-text" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
            His dedication quickly gained popularity. In 1988, he was elected Union President of the Tata Steel Growth Shop. Over the years, his influence grew, and he was elected to lead unions of major Tata subsidiaries, including TRF, Tayo Rolls, and Tinplate.
          </p>
          <p className="c-text" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
            Today, he is recognized as the National Secretary of INTUC, overseeing key metal and steel federations, and acts as the state President of INTUC Jharkhand, steering the labor policies for the region.
          </p>
        </div>
      </div>

      {/* Main Posts holding */}
      <div className="posts-holding-section" style={{ marginBottom: '60px' }}>
        <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '32px' }}>Key Posts Holding</h2>
        <div className="posts-grid grid-3">
          {mainPosts.map((post, index) => (
            <div key={index} className="post-card glass-card" style={{ padding: '24px' }}>
              <Award className="saffron" style={{ marginBottom: '12px' }} size={28} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '8px' }}>{post.role}</h3>
              <h4 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>{post.organization}</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{post.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Union Presidencies */}
      <div className="union-presidencies-section" style={{ marginBottom: '60px' }}>
        <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '32px' }}>Union Presidencies</h2>
        <p className="section-subtitle" style={{ marginBottom: '24px', textAlign: 'left' }}>Mr. Pandey leads the labor unions of over two dozen major corporations, steel, cement and power subsidiaries in Jamshedpur and Adityapur.</p>
        <div className="presidencies-grid grid-3">
          {unionPresidencies.map((union, index) => (
            <div key={index} className="union-item-card glass-card" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <img src={union.img} alt={union.name} style={{ width: '50px', height: '50px', objectFit: 'contain', borderRadius: '4px' }} />
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: '600', margin: '0 0 4px' }}>{union.name}</h4>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}><Compass size={12} style={{ display: 'inline', marginRight: '4px' }} /> {union.loc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Representation */}
      <div className="global-representation-section glass-card" style={{ padding: '40px' }}>
        <h2 className="sub-title" style={{ fontSize: '2.2rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px' }}><ShieldCheck className="green" size={32} /> International Representation</h2>
        <p className="c-text" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
          Mr. Pandey has represented Indian workers at international summits, conferences, and labor panels in more than <strong>30 countries</strong>, including the USA, China, Brazil, Switzerland, Japan, Singapore, Canada, Germany, Sweden, and South Africa.
        </p>
        <ul style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.8', paddingLeft: '20px' }}>
          <li>Served as a member of the official Indian Delegation for the <strong>World Summit for Social Development</strong> at Copenhagen.</li>
          <li>Attended the **International Labor Organization (ILO)** Conferences in Geneva and Bangkok multiple times.</li>
          <li>Represented the mining and metal labor force in the **World Base Metal Conference** in Pittsburgh in 2016.</li>
        </ul>
      </div>
    </div>
  );
}
