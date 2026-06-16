import { Award, Globe, Briefcase, Heart, Users, MapPin } from 'lucide-react';

const stats = [
  { num: '35+', label: 'Years of Service', icon: <Award size={22} /> },
  { num: '24+', label: 'Unions Represented', icon: <Briefcase size={22} /> },
  { num: '30+', label: 'Countries Visited', icon: <Globe size={22} /> },
  { num: '50K+', label: 'Workers Benefited', icon: <Users size={22} /> },
];

const achievementsList = [
  {
    icon: <Award size={24} />,
    title: 'INTUC Jharkhand President',
    description: 'Serving as the elected President of the Indian National Trade Union Congress (INTUC), Jharkhand branch — championing workers\' rights across the state.',
    color: 'saffron',
  },
  {
    icon: <Globe size={24} />,
    title: 'International Forums',
    description: 'Represented Indian workers at the International Labor Conference in Geneva and the IndustriAll Base Metal Steering Committee in Pittsburgh, USA.',
    color: 'green',
  },
  {
    icon: <MapPin size={24} />,
    title: 'Global Representation',
    description: 'Traveled to 30+ countries including USA, China, Brazil, Switzerland, Japan, and Germany — representing the Indian labor force at global summits.',
    color: 'saffron',
  },
  {
    icon: <Briefcase size={24} />,
    title: 'Two Decades of Leadership',
    description: 'Union President of 24+ group companies including Tata Steel for over 20 years continuously — a record of sustained dedication.',
    color: 'green',
  },
  {
    icon: <Heart size={24} />,
    title: 'Active Social Leader',
    description: 'Deeply engaged with NGOs, hospitals, schools and colleges — providing support, training, and educational aid to underprivileged communities.',
    color: 'saffron',
  },
  {
    icon: <Users size={24} />,
    title: 'Workers\' Champion',
    description: 'Successfully negotiated wage revisions, improved working conditions, and secured employee benefits for thousands of workers across Jharkhand.',
    color: 'green',
  },
];

export default function Achievements() {
  return (
    <section id="achievements" className="achievements-section section-padding">
      <div className="container">
        {/* Header */}
        <div className="section-header">
          <div className="section-eyebrow">
            <div className="eyebrow-line" aria-hidden="true" />
            Key Achievements
            <div className="eyebrow-line" aria-hidden="true" />
          </div>
          <h2 className="section-title">
            Milestones of <span className="highlight">Leadership</span>
          </h2>
          <div className="section-divider" aria-hidden="true">
            <div className="divider-line divider-saffron" />
            <div className="divider-dot" />
            <div className="divider-line divider-green" />
          </div>
          <p className="section-subtitle">
            Highlights of trade union leadership, international advocacy, and commitment to labor welfare spanning over 35 years.
          </p>
        </div>

        {/* Stats Bar */}
        <div className="grid-4" style={{ marginBottom: '64px' }}>
          {stats.map((s, i) => (
            <div key={i} className="achievement-card" style={{ textAlign: 'center', padding: '28px 20px' }}>
              <div className="achievement-icon">{s.icon}</div>
              <div className="achievement-num">{s.num}</div>
              <div className="achievement-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Achievement Cards Grid */}
        <div className="grid-3">
          {achievementsList.map((item, index) => (
            <div
              key={index}
              className={`achievement-card card-${item.color}-border`}
              style={{ padding: '28px 24px' }}
            >
              <div
                className="achievement-icon"
                style={item.color === 'green' ? {
                  background: 'var(--green-pale)',
                  color: 'var(--green)',
                } : {}}
              >
                {item.icon}
              </div>
              <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '10px' }}>
                {item.title}
              </h3>
              <p style={{ fontSize: '0.87rem', color: 'var(--text-muted)', lineHeight: '1.7' }}>
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
