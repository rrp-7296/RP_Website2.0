import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Eye, ThumbsUp, ChevronLeft, ChevronRight, Home as HomeIcon } from 'lucide-react';
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

export default function BlogList() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const limit = 6;

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl(`/blogs?page=${currentPage}&limit=${limit}`))
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
          setTotalPages(data.total_pages || 1);
        } else {
          setBlogs(mockBlogs);
          setTotalPages(1);
        }
        setLoading(false);
      })
      .catch(() => {
        setBlogs(mockBlogs);
        setTotalPages(1);
        setLoading(false);
      });
  }, [currentPage]);

  const getBlogCategory = (post: BlogPost) => {
    if (post.id === 1 || post.title.toLowerCase().includes('union') || post.title.toLowerCase().includes('labor')) {
      return "Union Engagements";
    }
    if (post.id === 2 || post.title.toLowerCase().includes('education') || post.title.toLowerCase().includes('rural')) {
      return "Education & Welfare";
    }
    if (post.id === 3 || post.title.toLowerCase().includes('industrial') || post.title.toLowerCase().includes('growth')) {
      return "Industrial Relations";
    }
    return "Insights & News";
  };

  // Helper to split blogs into 3 columns for asymmetrical staggered editorial view
  const getColumns = () => {
    const col1: BlogPost[] = [];
    const col2: BlogPost[] = [];
    const col3: BlogPost[] = [];

    blogs.forEach((post, index) => {
      if (index % 3 === 0) col1.push(post);
      else if (index % 3 === 1) col2.push(post);
      else col3.push(post);
    });

    return { col1, col2, col3 };
  };

  const { col1, col2, col3 } = getColumns();

  return (
    <div className="blog-list-page page-container container section-padding" style={{ paddingTop: '120px' }}>
      <div className="page-breadcrumbs">
        <Link to="/"><HomeIcon size={16} /> Home</Link>
        <span>/</span>
        <span className="current">Blogs</span>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '80px 0', color: 'var(--text-muted)' }}>Loading blog posts...</div>
      ) : (
        <>
          <div className="blog-editorial-grid">
            {/* Column 1: Banner Block + Staggered Cards */}
            <div className="blog-editorial-column">
              <div className="blog-editorial-banner">
                <span className="blog-banner-eyebrow">NEWS & INSIGHTS</span>
                <h1 className="blog-banner-title">Insights</h1>
                <p className="blog-banner-desc">
                  Thoughts, articles, and coverage regarding industrial policies, trade unions, and social work.
                </p>
              </div>

              {col1.map((post) => (
                <Link to={`/blog/${post.id}`} key={post.id} className="blog-editorial-card">
                  <div className="blog-card-category">{getBlogCategory(post)}</div>
                  <div className="blog-card-img-container">
                    <img src={post.image || '/img/58.jpg'} alt={post.title} loading="lazy" />
                  </div>
                  <h3 className="blog-card-heading">{post.title}</h3>
                  <div className="blog-card-meta">
                    <span>{post.date}</span>
                    <span>|</span>
                    <span>{post.views} Views</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Column 2 */}
            <div className="blog-editorial-column">
              {col2.map((post) => (
                <Link to={`/blog/${post.id}`} key={post.id} className="blog-editorial-card">
                  <div className="blog-card-category">{getBlogCategory(post)}</div>
                  <div className="blog-card-img-container">
                    <img src={post.image || '/img/58.jpg'} alt={post.title} loading="lazy" />
                  </div>
                  <h3 className="blog-card-heading">{post.title}</h3>
                  <div className="blog-card-meta">
                    <span>{post.date}</span>
                    <span>|</span>
                    <span>{post.views} Views</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Column 3 */}
            <div className="blog-editorial-column">
              {col3.map((post) => (
                <Link to={`/blog/${post.id}`} key={post.id} className="blog-editorial-card">
                  <div className="blog-card-category">{getBlogCategory(post)}</div>
                  <div className="blog-card-img-container">
                    <img src={post.image || '/img/58.jpg'} alt={post.title} loading="lazy" />
                  </div>
                  <h3 className="blog-card-heading">{post.title}</h3>
                  <div className="blog-card-meta">
                    <span>{post.date}</span>
                    <span>|</span>
                    <span>{post.views} Views</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {totalPages > 1 && (
            <div className="pagination-controls glass-card">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="pagination-btn"
              >
                <ChevronLeft size={16} /> Previous
              </button>
              
              <div className="pagination-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`pagination-number ${currentPage === pageNum ? 'active' : ''}`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="pagination-btn"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
