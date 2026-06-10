import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Facebook, Twitter, Instagram, Linkedin } from './SocialIcons';

const slides = [
  "Mr. Rakeshwar Pandey is a prominent social and political leader associated with the Indian National Congress Party.",
  "He joined the trade union movement as a young worker in 1986 and was first elected General Secretary of Tisco Mazdoor Union in 1988.",
  "Currently, he is the Union President of more than two dozen group of companies (including Tata group companies) in Jamshedpur and other parts of India.",
  "He serves as the President of the Indian National Trade Union Congress (INTUC), Jharkhand branch, fighting for the rights and welfare of the labor community."
];

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handleLearnMoreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const element = document.getElementById('about');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="hero-section section-padding">
      <div className="container hero-container grid-2">
        <div className="hero-content animate-fade-in">
          <h5 className="hero-subtitle">Hello I'm</h5>
          <h1 className="hero-title">Rakeshwar Pandey</h1>
          <h2 className="hero-role">President, Jharkhand INTUC</h2>
          
          <div className="hero-carousel glass-card">
            <div className="carousel-slide">
              <p className="carousel-text">{slides[activeSlide]}</p>
            </div>
            <div className="carousel-indicators">
              {slides.map((_, index) => (
                <button
                  key={index}
                  className={`indicator-dot ${index === activeSlide ? 'active' : ''}`}
                  onClick={() => setActiveSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="hero-actions">
            <a href="#about" onClick={handleLearnMoreClick} className="btn btn-saffron">
              Know More <ArrowRight size={16} />
            </a>
            <div className="hero-socials">
              <a href="https://www.facebook.com/profile.php?id=100006933303863" target="_blank" rel="noopener noreferrer" className="social-icon-btn facebook" title="Facebook">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com/RakeshwarPandey" target="_blank" rel="noopener noreferrer" className="social-icon-btn twitter" title="Twitter / X">
                <Twitter size={20} />
              </a>
              <a href="https://www.instagram.com/rakeshwar.pandey/?hl=en" target="_blank" rel="noopener noreferrer" className="social-icon-btn instagram" title="Instagram">
                <Instagram size={20} />
              </a>
              <a href="https://www.linkedin.com/in/rakeshwar-pandey-88b35b54/" target="_blank" rel="noopener noreferrer" className="social-icon-btn linkedin" title="LinkedIn">
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="hero-image-container">
          <div className="hero-image-wrapper glass-card">
            <img src="/img/test01.png" alt="Rakeshwar Pandey" className="hero-portrait" />
          </div>
          <div className="hero-accent-circle circle-saffron"></div>
          <div className="hero-accent-circle circle-green"></div>
        </div>
      </div>
    </section>
  );
}
