import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin } from './SocialIcons';

const slides = [
  "Mr. Rakeshwar Pandey is a prominent social and political leader associated with the Indian National Congress Party.",
  "He joined the trade union movement as a young worker in 1986 and was first elected General Secretary of Tisco Mazdoor Union in 1988.",
  "Currently, he is the Union President of more than two dozen group of companies (including Tata group companies) in Jamshedpur and other parts of India.",
  "He serves as the President of the Indian National Trade Union Congress (INTUC), Jharkhand branch, fighting for the rights and welfare of the labor community."
];

// Ashoka Chakra SVG with 24 spokes
function AshokaSVG({ size = 400 }: { size?: number }) {
  const spokes = Array.from({ length: 24 }, (_, i) => i * 15);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className="hero-chakra"
      aria-hidden="true"
    >
      <circle cx="100" cy="100" r="90" fill="none" stroke="currentColor" strokeWidth="5" />
      <circle cx="100" cy="100" r="12" fill="currentColor" />
      <circle cx="100" cy="100" r="65" fill="none" stroke="currentColor" strokeWidth="2" />
      {spokes.map(angle => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 100 + 14 * Math.cos(rad);
        const y1 = 100 + 14 * Math.sin(rad);
        const x2 = 100 + 65 * Math.cos(rad);
        const y2 = 100 + 65 * Math.sin(rad);
        return (
          <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="currentColor" strokeWidth="2" />
        );
      })}
    </svg>
  );
}

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleScrollDown = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="home" className="hero-section">
      {/* Animated gradient orbs */}
      <div className="hero-orb hero-orb-saffron" aria-hidden="true" />
      <div className="hero-orb hero-orb-green" aria-hidden="true" />

      <div className="container">
        <div className="hero-container grid-2">
          {/* LEFT — Content */}
          <div className="hero-content animate-slide-left">
            {/* Tricolor pill */}
            <div style={{ marginBottom: '24px' }}>
              <div className="tricolor-badge" role="text" aria-label="INTUC Jharkhand President">
                <span className="tc-s">INTUC</span>
                <span className="tc-w">Jharkhand</span>
                <span className="tc-g">President</span>
              </div>
            </div>

            {/* Eyebrow */}
            <div className="hero-eyebrow">
              <div className="hero-eyebrow-line" aria-hidden="true" />
              <span className="hero-eyebrow-text">Social Leader &amp; Trade Union Champion</span>
            </div>

            {/* Name */}
            <h1 className="hero-title">
              <span className="name-saffron">Rakeshwar</span>
              <span className="name-green">Pandey</span>
            </h1>

            <p className="hero-role">President, Indian National Trade Union Congress (INTUC) — Jharkhand</p>

            {/* Rotating quote carousel */}
            <div className="hero-carousel" aria-live="polite" aria-label="About Rakeshwar Pandey">
              <p className="carousel-text">"{slides[activeSlide]}"</p>
              <div className="carousel-indicators" role="tablist" aria-label="Slide indicators">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator-dot ${index === activeSlide ? 'active' : ''}`}
                    onClick={() => setActiveSlide(index)}
                    role="tab"
                    aria-selected={index === activeSlide}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* CTA + Socials */}
            <div className="hero-actions">
              <a href="#about" onClick={(e) => handleScrollDown(e, 'about')} className="btn btn-saffron btn-lg">
                Know More <ArrowRight size={18} />
              </a>
              <a href="#contact" onClick={(e) => handleScrollDown(e, 'contact')} className="btn btn-outline">
                Get in Touch
              </a>
              <div className="hero-socials" aria-label="Social Media Links">
                <a href="https://www.facebook.com/profile.php?id=100006933303863" target="_blank" rel="noopener noreferrer" className="social-icon-btn facebook" title="Facebook" aria-label="Facebook">
                  <Facebook size={18} />
                </a>
                <a href="https://twitter.com/RakeshwarPandey" target="_blank" rel="noopener noreferrer" className="social-icon-btn twitter" title="Twitter / X" aria-label="Twitter">
                  <Twitter size={18} />
                </a>
                <a href="https://www.instagram.com/rakeshwar.pandey/?hl=en" target="_blank" rel="noopener noreferrer" className="social-icon-btn instagram" title="Instagram" aria-label="Instagram">
                  <Instagram size={18} />
                </a>
                <a href="https://www.linkedin.com/in/rakeshwar-pandey-88b35b54/" target="_blank" rel="noopener noreferrer" className="social-icon-btn linkedin" title="LinkedIn" aria-label="LinkedIn">
                  <Linkedin size={18} />
                </a>
              </div>
            </div>

            {/* Stats bar */}
            <div className="hero-stats" role="list" aria-label="Career Statistics">
              <div className="hero-stat-item" role="listitem">
                <div className="hero-stat-num">35+</div>
                <div className="hero-stat-label">Years Service</div>
              </div>
              <div className="hero-stat-item" role="listitem">
                <div className="hero-stat-num">24+</div>
                <div className="hero-stat-label">Unions Led</div>
              </div>
              <div className="hero-stat-item" role="listitem">
                <div className="hero-stat-num">50K+</div>
                <div className="hero-stat-label">Workers Helped</div>
              </div>
              <div className="hero-stat-item" role="listitem">
                <div className="hero-stat-num">1986</div>
                <div className="hero-stat-label">Active Since</div>
              </div>
            </div>
          </div>

          {/* RIGHT — Portrait */}
          <div className="hero-image-container animate-slide-right">
            {/* Rotating Ashoka Chakra watermark */}
            <AshokaSVG size={420} />

            {/* Portrait frame with tricolor bottom bar */}
            <div className="hero-portrait-frame">
              <img
                src="/img/test01.png"
                alt="Rakeshwar Pandey — President, INTUC Jharkhand"
                className="hero-portrait"
                loading="eager"
              />
              <div className="hero-portrait-bar" aria-hidden="true">
                <div className="bar-s" />
                <div className="bar-w" />
                <div className="bar-g" />
              </div>
            </div>

            {/* Floating info cards */}
            <div className="float-card hero-float-1" aria-hidden="true">
              <div className="float-card-label">Latest Achievement</div>
              <div className="float-card-val">Wage Revision ✅</div>
            </div>
            <div className="float-card hero-float-2" style={{ animationDelay: '-2s' }} aria-hidden="true">
              <div className="float-card-label">Member Since</div>
              <div className="float-card-val">1986</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
