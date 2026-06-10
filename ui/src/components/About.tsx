import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, BookOpen, Heart, ArrowRight } from 'lucide-react';

type TabKey = 'bio' | 'edu' | 'social';

export default function About() {
  const [activeTab, setActiveTab] = useState<TabKey>('bio');

  const tabsContent = {
    bio: {
      title: 'Biography',
      subtitle: 'A Life Dedicated to Public Service',
      description: 'Rakeshwar Pandey was born on 14th January 1960 in a farmer’s family at village Lahuribari, District Bhabhua Bihar, to Sri Vashishtha Pandey and Shrimati Lalita Devi. He is the eldest amongst his siblings. He is married to Sita Pandey. They are gifted with three daughters named Jyoti, Dr Prity and Reeti.',
      image: '/img/02.jpg',
      link: '/biography',
      icon: <User size={20} />
    },
    edu: {
      title: 'Education & Career',
      subtitle: 'From Apprentice to National Trade Union Leader',
      description: 'Mr. Pandey started his career with Tata Steel Growth Shop as Apprentice. Since the beginning of his career, he was interested and involved in causes of workers and laborers. Subsequently he got associated with INTUC (Indian National Trade Union Congress), and fought for the welfare of the worker community.',
      image: '/img/g7.jpg',
      link: '/education-career',
      icon: <BookOpen size={20} />
    },
    social: {
      title: 'Leader Beyond Politics',
      subtitle: 'Commitment to Philanthropy and Social Causes',
      description: 'Mr. Pandey speaks on various social, management, leadership and labor related topics. His active social work reflects his sincere endeavors and deep commitment to social causes. Mr. Pandey is very actively engaged with NGOs, Hospitals, schools, and colleges for the underprivileged.',
      image: '/img/g37.jpg',
      link: '/leader-beyond-politics',
      icon: <Heart size={20} />
    }
  };

  return (
    <section id="about" className="about-section section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">About Me</h2>
          <div className="section-bar"></div>
          <p className="section-subtitle">Get to know the background, career achievements, and social commitment of Rakeshwar Pandey.</p>
        </div>

        <div className="about-tabs-container">
          {/* Tab Navigation */}
          <div className="about-tabs-nav glass-card">
            {(Object.keys(tabsContent) as TabKey[]).map((key) => (
              <button
                key={key}
                className={`tab-nav-btn ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
              >
                {tabsContent[key].icon}
                <span>{tabsContent[key].title}</span>
              </button>
            ))}
          </div>

          {/* Tab Content Panels */}
          <div className="about-tab-panel glass-card">
            <div className="tab-grid grid-2">
              <div className="tab-text-side">
                <h3 className="tab-pane-title">{tabsContent[activeTab].title}</h3>
                <h4 className="tab-pane-subtitle">{tabsContent[activeTab].subtitle}</h4>
                <p className="tab-pane-description">{tabsContent[activeTab].description}</p>
                <div className="tab-actions">
                  <Link to={tabsContent[activeTab].link} className="btn btn-green">
                    Read Full Details <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="tab-image-side">
                <div className="tab-image-wrapper">
                  <img src={tabsContent[activeTab].image} alt={tabsContent[activeTab].title} className="tab-image" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
