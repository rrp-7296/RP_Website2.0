import React from 'react';
import { Award, Globe, Briefcase, Heart } from 'lucide-react';

const achievementsList = [
  {
    title: "INTUC Jharkhand President",
    description: "Serving as the elected President of the Indian National Trade Union Congress (INTUC), Jharkhand branch.",
    image: "/img/53.jpg",
    icon: <Award className="card-icon saffron" />
  },
  {
    title: "International Forums",
    description: "Represented Indian workers at the International Labor Conference in Geneva and the IndustriAll Base Metal Steering Committee in Pittsburgh.",
    image: "/img/43.jpg",
    icon: <Globe className="card-icon green" />
  },
  {
    title: "Global Representation",
    description: "Has traveled to over 30 countries (including USA, China, Brazil, Switzerland, Japan, Germany) representing the Indian labor force in global summits.",
    image: "/img/02.jpg",
    icon: <Globe className="card-icon saffron" />
  },
  {
    title: "Two Decades of Leadership",
    description: "Serves as the Union President of over two dozen group of companies (including Tata group companies) for around 20 years continuously.",
    image: "/img/ec02.jpg",
    icon: <Briefcase className="card-icon green" />
  },
  {
    title: "Active Social Leader",
    description: "Engages deeply with NGOs, schools, and hospitals to provide support, leadership training, and educational aid to underprivileged children.",
    image: "/img/g37.jpg",
    icon: <Heart className="card-icon saffron" />
  }
];

export default function Achievements() {
  return (
    <section id="achievements" className="achievements-section section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Key Achievements</h2>
          <div className="section-bar"></div>
          <p className="section-subtitle">Highlights of trade union leadership, international advocacy, and commitment to labor welfare.</p>
        </div>

        <div className="achievements-grid">
          {achievementsList.map((item, index) => (
            <div key={index} className="achievement-card glass-card">
              <div className="achievement-img-wrapper">
                <img src={item.image} alt={item.title} className="achievement-img" />
                <div className="achievement-overlay"></div>
                <div className="achievement-icon-badge">
                  {item.icon}
                </div>
              </div>
              <div className="achievement-body">
                <h3 className="achievement-card-title">{item.title}</h3>
                <p className="achievement-card-text">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
