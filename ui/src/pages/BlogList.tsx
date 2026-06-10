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

  return (
    <div className="blog-list-page page-container container section-padding" style={{ paddingTop: '120px' }}>
      <div className="page-breadcrumbs">
        <Link to="/"><HomeIcon size={16} /> Home</Link>
        <span>/</span>
        <span className="current">Blogs</span>
      </div>

      <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '3rem' }}>All Blog Posts</h1>
        <p className="section-subtitle" style={{ margin: '0' }}>Browse and read articles detailing trade union strategy, labor laws, and social leader diaries.</p>
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '60px 0' }}>Loading blog posts...</div>
      ) : (
        <>
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
                    {post.description.length > 150 ? `${post.description.substring(0, 150)}...` : post.description}
                  </p>
                  <Link to={`/blog/${post.id}`} className="btn btn-outline btn-sm blog-card-btn" style={{ marginTop: 'auto' }}>
                    Read Full Article
                  </Link>
                </div>
              </div>
            ))}
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
