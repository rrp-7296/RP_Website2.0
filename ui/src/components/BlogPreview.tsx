import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Eye, ThumbsUp } from 'lucide-react';
import { apiUrl, uploadUrl } from '../config/api';

interface BlogPost {
  id: number;
  title: string;
  description: string;
  image?: string;
  date: string;
  views: number;
  likes: number;
}

const mockBlogs: BlogPost[] = [
  {
    id: 1,
    title: "The Role of Trade Unions in the Post-Pandemic Era",
    description: "Analyzing the shifting paradigms of worker rights, safety standards, and collective bargaining agreements in the wake of global industrial disruption. Unions must adapt to keep workers safe and ensure fair wages.",
    image: "/img/58.jpg",
    date: "2026-05-20",
    views: 142,
    likes: 48
  },
  {
    id: 2,
    title: "Empowering Rural Jharkhand Through Education",
    description: "An overview of local initiatives, charity schools, and vocational training centers aimed at providing quality learning tools and bridging the digital divide for rural youths in Jamshedpur and surrounding districts.",
    image: "/img/g7.jpg",
    date: "2026-04-15",
    views: 95,
    likes: 36
  },
  {
    id: 3,
    title: "Industrial Growth and Labor Coexistence",
    description: "Labor and industry are not rivals, but two wheels of the same chariot. Exploration of how collaborative union-management policies drive long-term productivity and ensure shared prosperity.",
    image: "/img/ec02.jpg",
    date: "2026-03-30",
    views: 120,
    likes: 54
  }
];

export default function BlogPreview() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(apiUrl('/blogs?page=1&limit=3'))
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data && data.items && data.items.length > 0) {
          const formatted = data.items.map((item: any) => ({
            id: item.id,
            title: item.title,
            description: item.description || '',
            image: item.image ? uploadUrl(item.image) : undefined,
            date: item.date ? new Date(item.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent',
            views: item.views || 0,
            likes: item.likes || 0
          }));
          setBlogs(formatted);
        } else {
          setBlogs(mockBlogs);
        }
        setLoading(false);
      })
      .catch(() => {
        setBlogs(mockBlogs);
        setLoading(false);
      });
  }, []);

  return (
    <section id="blog" className="blog-section section-padding">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Latest Blogs</h2>
          <div className="section-bar"></div>
          <p className="section-subtitle">Read written pieces, opinion columns, and articles detailing trade union strategy and social development goals.</p>
        </div>

        {loading ? (
          <div className="text-center">Loading blogs...</div>
        ) : (
          <div className="blogs-grid grid-3">
            {blogs.map((post) => (
              <div key={post.id} className="blog-card glass-card">
                <div className="blog-card-img-wrapper">
                  <img src={post.image || '/img/58.jpg'} alt={post.title} className="blog-card-img" />
                </div>
                <div className="blog-card-body">
                  <div className="blog-meta">
                    <span className="blog-date"><Calendar size={12} /> {post.date}</span>
                    <div className="blog-stats">
                      <span><Eye size={12} /> {post.views}</span>
                      <span><ThumbsUp size={12} /> {post.likes}</span>
                    </div>
                  </div>
                  <h3 className="blog-card-title">{post.title}</h3>
                  <p className="blog-card-excerpt">
                    {post.description.length > 120 ? `${post.description.substring(0, 120)}...` : post.description}
                  </p>
                  <Link to={`/blog/${post.id}`} className="btn btn-outline btn-sm blog-card-btn">
                    Read More <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="section-footer-actions text-center">
          <Link to="/blog" className="btn btn-saffron">
            View All Blogs <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
