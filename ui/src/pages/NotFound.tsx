import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Home, 
  ArrowLeft, 
  BookOpen, 
  Newspaper, 
  Clock, 
  Image, 
  UserCheck, 
  Compass 
} from 'lucide-react';
import './NotFound.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found-page" id="not-found-container">
      {/* Background ambient light effects */}
      <div className="not-found-ambient-glow glow-1"></div>
      <div className="not-found-ambient-glow glow-2"></div>

      <div className="not-found-card glassmorphism">
        <div className="not-found-badge">
          <Compass className="spin-slow-icon" size={18} />
          <span>Error 404</span>
        </div>

        <h1 className="not-found-title">
          4<span className="gradient-number">0</span>4
        </h1>

        <h2 className="not-found-subtitle">Page Not Found</h2>
        
        <p className="not-found-description">
          The page you are looking for might have been moved, renamed, or is temporarily unavailable. Let's get you back on track!
        </p>

        {/* Primary Action Buttons */}
        <div className="not-found-actions">
          <Link to="/" className="btn-primary-home" id="btn-return-home">
            <Home size={18} />
            <span>Return to Homepage</span>
          </Link>
          <button 
            type="button" 
            onClick={() => navigate(-1)} 
            className="btn-secondary-back"
            id="btn-go-back"
          >
            <ArrowLeft size={18} />
            <span>Go Back</span>
          </button>
        </div>

        {/* Quick Navigation Directory */}
        <div className="not-found-directory">
          <h3 className="directory-title">Or Explore Popular Sections</h3>
          <div className="directory-grid">
            <Link to="/" className="directory-card" id="dir-link-home">
              <Home className="dir-icon" size={20} />
              <div className="dir-info">
                <h4>Homepage</h4>
                <p>Overview & Leader Vision</p>
              </div>
            </Link>

            <Link to="/biography" className="directory-card" id="dir-link-biography">
              <UserCheck className="dir-icon" size={20} />
              <div className="dir-info">
                <h4>Biography</h4>
                <p>Life story & Values</p>
              </div>
            </Link>

            <Link to="/news" className="directory-card" id="dir-link-news">
              <Newspaper className="dir-icon" size={20} />
              <div className="dir-info">
                <h4>Latest News</h4>
                <p>Updates & Press</p>
              </div>
            </Link>

            <Link to="/blog" className="directory-card" id="dir-link-blog">
              <BookOpen className="dir-icon" size={20} />
              <div className="dir-info">
                <h4>Articles & Blogs</h4>
                <p>Insights & Essays</p>
              </div>
            </Link>

            <Link to="/timeline" className="directory-card" id="dir-link-timeline">
              <Clock className="dir-icon" size={20} />
              <div className="dir-info">
                <h4>Timeline</h4>
                <p>Milestones & Journey</p>
              </div>
            </Link>

            <Link to="/gallery" className="directory-card" id="dir-link-gallery">
              <Image className="dir-icon" size={20} />
              <div className="dir-info">
                <h4>Photo Gallery</h4>
                <p>Events & Media</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
