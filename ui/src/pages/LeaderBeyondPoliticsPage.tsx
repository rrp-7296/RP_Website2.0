import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, ChevronLeft, ChevronRight, Heart, Award, CheckCircle } from 'lucide-react';

const socialCarousel = [
  "/img/social/s1.jpg",
  "/img/social/s2.jpg",
  "/img/social/s4.jpg",
  "/img/social/s5.jpg"
];

export default function LeaderBeyondPoliticsPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % socialCarousel.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="social-leadership-page page-container container section-padding" style={{ paddingTop: '120px' }}>
      <div className="page-breadcrumbs">
        <Link to="/"><HomeIcon size={16} /> Home</Link>
        <span>/</span>
        <span className="current">Leader Beyond Politics</span>
      </div>

      <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '3rem' }}>Leader Beyond Politics</h1>
        <p className="section-subtitle" style={{ margin: '0' }}>A summary of philanthropic engagements, healthcare campaigns, and educational leadership.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '48px', marginBottom: '60px' }}>
        {/* Slider */}
        <div className="social-slider-side">
          <div className="bio-slider glass-card" style={{ position: 'relative', overflow: 'hidden', height: '400px', borderRadius: '12px' }}>
            <img 
              src={socialCarousel[activeSlide]} 
              alt={`Social slide ${activeSlide + 1}`} 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button 
              className="carousel-nav prev" 
              onClick={() => setActiveSlide(prev => (prev > 0 ? prev - 1 : socialCarousel.length - 1))}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className="carousel-nav next" 
              onClick={() => setActiveSlide(prev => (prev + 1) % socialCarousel.length)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        </div>

        {/* Philosophy */}
        <div className="social-philosophy-text glass-card" style={{ padding: '32px' }}>
          <h2 className="sub-title" style={{ fontSize: '2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}><Heart className="saffron fill-saffron" size={24} /> Social Philosophy</h2>
          <p className="c-text" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
            Mr. Rakeshwar Pandey strongly believes that a leader’s responsibility extends far beyond administrative and union discussions. True leadership lies in empowering the weakest sections of society, providing access to qualitative education, health facilities, and livelihood resources.
          </p>
          <p className="c-text" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
            He speaks regularly at management colleges, leadership seminars, and labor conventions, advocating for social responsibility, CSR integration, and educational welfare. His hands-on social engagements reflect a lifetime of commitment to grassroots development.
          </p>
        </div>
      </div>

      {/* Areas of Engagement */}
      <div className="areas-engagement" style={{ marginBottom: '60px' }}>
        <h2 className="section-title" style={{ fontSize: '2.2rem', marginBottom: '32px' }}>Areas of Engagement</h2>
        
        <div className="grid-3">
          <div className="engagement-card glass-card" style={{ padding: '28px' }}>
            <Award className="saffron" size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '12px' }}>Educational Leadership</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Serves as the <strong>Chairman of Tinplate Mahila Maha Vidyalay</strong> (Women’s Degree College) and <strong>Bal Gyam Peeth High School</strong> in Jamshedpur, helping shape primary and higher education opportunities for poor girls and boys.
            </p>
          </div>

          <div className="engagement-card glass-card" style={{ padding: '28px' }}>
            <Heart className="green" size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '12px' }}>Healthcare Support</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Coordinates with Jamshedpur Eye Hospital and Meherbai Tata Memorial Hospital (MTMH) to run free health camps, diagnostic tests, and subsidize cancer/eye surgeries for low-income industrial laborers.
            </p>
          </div>

          <div className="engagement-card glass-card" style={{ padding: '28px' }}>
            <CheckCircle className="saffron" size={32} style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: '600', marginBottom: '12px' }}>Disaster Relief & Welfare</h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              Runs annual winter blanket distributions, aids disaster relief initiatives, and provides scholarship support for students from tribal and rural areas of East Singhbhum and Bhabhua districts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
