import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, ChevronLeft, ChevronRight } from 'lucide-react';

const bioCarousel = [
  "/img/bio/b1.jpg",
  "/img/bio/b3.jpg",
  "/img/bio/b7.jpg",
  "/img/bio/ec02.jpg"
];

export default function BiographyPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % bioCarousel.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="biography-page page-container container section-padding" style={{ paddingTop: '120px' }}>
      <div className="page-breadcrumbs">
        <Link to="/"><HomeIcon size={16} /> Home</Link>
        <span>/</span>
        <span className="current">Biography</span>
      </div>

      <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '3rem' }}>Biography</h1>
        <p className="section-subtitle" style={{ margin: '0' }}>A close look into the personal background and foundational philosophy of Rakeshwar Pandey.</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '48px' }}>
        {/* Carousel Side */}
        <div className="biography-carousel-side">
          <div className="bio-slider glass-card" style={{ position: 'relative', overflow: 'hidden', height: '400px', borderRadius: '12px' }}>
            <img 
              src={bioCarousel[activeSlide]} 
              alt={`Biography slide ${activeSlide + 1}`} 
              className="bio-slide-img" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <button 
              className="carousel-nav prev" 
              onClick={() => setActiveSlide(prev => (prev > 0 ? prev - 1 : bioCarousel.length - 1))}
              style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              className="carousel-nav next" 
              onClick={() => setActiveSlide(prev => (prev + 1) % bioCarousel.length)}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer' }}
            >
              <ChevronRight size={24} />
            </button>
            <div className="carousel-dots-indicator" style={{ position: 'absolute', bottom: '15px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
              {bioCarousel.map((_, i) => (
                <span 
                  key={i} 
                  className={`dot-indicator ${i === activeSlide ? 'active' : ''}`}
                  onClick={() => setActiveSlide(i)}
                  style={{ width: '10px', height: '10px', borderRadius: '50%', background: i === activeSlide ? 'var(--saffron)' : 'rgba(255,255,255,0.5)', cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Narrative Side */}
        <div className="biography-text-side glass-card" style={{ padding: '32px' }}>
          <h2 className="sub-title" style={{ fontSize: '2.5rem', marginBottom: '20px', fontFamily: 'Outfit, sans-serif', fontWeight: '600' }}>Personal Journey</h2>
          <p className="c-text" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
            Rakeshwar Pandey was born on 14th January 1960 into a farmer’s family at village Lahuribari, District Bhabhua, Bihar. His parents, Sri Vashishtha Pandey and Shrimati Lalita Devi, raised him to value integrity, diligence, and public service. Being the eldest among his siblings, he took up responsibilities early in life.
          </p>
          <p className="c-text" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
            He is married to Shrimati Sita Pandey, who has been his constant pillar of support throughout his intense public life. Together, they are blessed with three daughters: Jyoti, Dr. Prity, and Reeti.
          </p>
          <p className="c-text" style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.7' }}>
            Mr. Pandey is an active and feisty trade union leader who spends a large part of his day listening to grievances, resolving employer conflicts, and advocating for fair wages. He strongly believes that workers and industries are not rivals but are complementary forces. They need to coordinate and coexist for the sustainable growth and betterment of society.
          </p>
          
          <div style={{ marginTop: '32px' }}>
            <Link to="/education-career" className="btn btn-saffron">
              View Education & Career Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
