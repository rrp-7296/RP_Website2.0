import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, BookOpen, Heart, ArrowRight } from 'lucide-react';

type TabKey = 'bio' | 'edu' | 'social';

const tabsContent = {
  bio: {
    title: 'Biography',
    eyebrow: 'Personal Background',
    subtitle: 'A Life Dedicated to Public Service',
    description: 'Rakeshwar Pandey was born on 14th January 1960 in a farmer\'s family at village Lahuribari, District Bhabhua Bihar, to Sri Vashishtha Pandey and Shrimati Lalita Devi. He is the eldest amongst his siblings. He is married to Sita Pandey. They are gifted with three daughters named Jyoti, Dr Prity and Reeti.',
    image: '/img/02.jpg',
    link: '/biography',
    icon: <User size={18} />,
  },
  edu: {
    title: 'Education & Career',
    eyebrow: 'Professional Journey',
    subtitle: 'From Apprentice to National Trade Union Leader',
    description: 'Mr. Pandey started his career with Tata Steel Growth Shop as Apprentice. Since the beginning of his career, he was interested and involved in causes of workers and laborers. Subsequently he got associated with INTUC (Indian National Trade Union Congress), and fought for the welfare of the worker community.',
    image: '/img/g7.jpg',
    link: '/education-career',
    icon: <BookOpen size={18} />,
  },
  social: {
    title: 'Leader Beyond Politics',
    eyebrow: 'Social Commitment',
    subtitle: 'Commitment to Philanthropy and Social Causes',
    description: 'Mr. Pandey speaks on various social, management, leadership and labor related topics. His active social work reflects his sincere endeavors and deep commitment to social causes. Mr. Pandey is very actively engaged with NGOs, Hospitals, schools, and colleges for the underprivileged.',
    image: '/img/g37.jpg',
    link: '/leader-beyond-politics',
    icon: <Heart size={18} />,
  },
};

export default function About() {
  const [activeTab, setActiveTab] = useState<TabKey>('bio');

  const tab = tabsContent[activeTab];

  return (
    <section id="about" className="about-section section-padding">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="section-eyebrow">
            <div className="eyebrow-line" aria-hidden="true" />
            About Me
            <div className="eyebrow-line" aria-hidden="true" />
          </div>
          <h2 className="section-title">
            The Man Behind the <span className="highlight">Movement</span>
          </h2>
          <div className="section-divider" aria-hidden="true">
            <div className="divider-line divider-saffron" />
            <div className="divider-dot" />
            <div className="divider-line divider-green" />
          </div>
          <p className="section-subtitle">
            Get to know the background, career achievements, and social commitment of Rakeshwar Pandey.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="about-tabs-container">
          <div className="about-tabs-nav" role="tablist" aria-label="About sections">
            {(Object.keys(tabsContent) as TabKey[]).map(key => (
              <button
                key={key}
                className={`tab-nav-btn ${activeTab === key ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
                role="tab"
                aria-selected={activeTab === key}
                aria-controls={`tabpanel-${key}`}
                id={`tab-${key}`}
              >
                {tabsContent[key].icon}
                <span>{tabsContent[key].title}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div
            className="about-tab-panel"
            role="tabpanel"
            id={`tabpanel-${activeTab}`}
            aria-labelledby={`tab-${activeTab}`}
          >
            <div className="tab-grid grid-2">
              <div className="tab-text-side">
                <p className="tab-pane-eyebrow">{tab.eyebrow}</p>
                <h3 className="tab-pane-title">{tab.title}</h3>
                <h4 className="tab-pane-subtitle">{tab.subtitle}</h4>
                <p className="tab-pane-description">{tab.description}</p>
                <div className="tab-actions">
                  <Link to={tab.link} className="btn btn-saffron">
                    Read Full Details <ArrowRight size={16} />
                  </Link>
                  <Link to={tab.link} className="btn btn-outline" style={{ marginLeft: '12px' }}>
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="tab-image-side">
                <div className="tab-image-wrapper">
                  <img
                    src={tab.image}
                    alt={tab.title}
                    className="tab-image"
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
