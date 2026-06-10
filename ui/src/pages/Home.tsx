import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import Achievements from '../components/Achievements';
import TimelinePreview from '../components/TimelinePreview';
import NewsPreview from '../components/NewsPreview';
import Newsletter from '../components/Newsletter';
import BlogPreview from '../components/BlogPreview';
import Contact from '../components/Contact';

export default function Home() {
  return (
    <div className="homepage-content">
      <Hero />
      <div className="section-divider"></div>
      <About />
      <div className="section-divider"></div>
      <Achievements />
      <div className="section-divider"></div>
      <TimelinePreview />
      <div className="section-divider"></div>
      <NewsPreview />
      <div className="section-divider"></div>
      <Newsletter />
      <div className="section-divider"></div>
      <BlogPreview />
      <div className="section-divider"></div>
      <Contact />
    </div>
  );
}
