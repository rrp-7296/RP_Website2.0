import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Eye, ThumbsUp, Home as HomeIcon, MessageSquare, Send, Heart } from 'lucide-react';
import { apiUrl, uploadUrl } from '../config/api';
import ShareButtons from '../components/ShareButtons';
import { useVisitor } from '../context/VisitorContext';


interface Comment {
  id: number;
  author_name: string;
  comment_text: string;
  date: string;
}

interface BlogPost {
  id: number;
  title: string;
  description: string;
  image?: string;
  date: string;
  views: number;
  likes: number;
  comments: Comment[];
}

const mockPostsList: BlogPost[] = [
  {
    id: 1,
    title: "The Role of Trade Unions in the Post-Pandemic Era",
    description: "Analyzing the shifting paradigms of worker rights, safety standards, and collective bargaining agreements in the wake of global industrial disruption. Unions must adapt to keep workers safe and ensure fair wages. Mr. Pandey spoke extensively on the importance of building robust safety infrastructure and revising compensation structures to align with inflation.\n\nWorkers and industries are not rivals, but are to help each other. They need to coordinate and coexist for the growth and betterment of society. In Jamshedpur, our unions have set a standard by cooperating with Tata Steel and other allied groups, ensuring zero production disruption while maintaining progressive hikes in wages.",
    image: "/img/58.jpg",
    date: "2026-05-20",
    views: 142,
    likes: 48,
    comments: [
      {
        id: 1,
        author_name: "Amit Sharma",
        comment_text: "Very insightful thoughts on labor-industry relationship. Coexistence is indeed the key to progress.",
        date: "2026-05-21"
      },
      {
        id: 2,
        author_name: "Surendra Singh",
        comment_text: "Outstanding work by the union in ensuring welfare during critical times.",
        date: "2026-05-22"
      }
    ]
  },
  {
    id: 2,
    title: "Empowering Rural Jharkhand Through Education",
    description: "An overview of local initiatives, charity schools, and vocational training centers aimed at providing quality learning tools and bridging the digital divide for rural youths in Jamshedpur and surrounding districts.\n\nEducation is the most powerful weapon which you can use to change the world. By setting up community learning zones and partnering with local technology providers, we have brought smart classes to over 15 villages, empowering students with modern digital skills.",
    image: "/img/g7.jpg",
    date: "2026-04-15",
    views: 95,
    likes: 36,
    comments: [
      {
        id: 1,
        author_name: "Rajesh Kumar",
        comment_text: "Bridging the digital divide is so crucial for our youngsters in rural areas.",
        date: "2026-04-16"
      }
    ]
  },
  {
    id: 3,
    title: "Industrial Growth and Labor Coexistence",
    description: "Labor and industry are not rivals, but two wheels of the same chariot. Exploration of how collaborative union-management policies drive long-term productivity and ensure shared prosperity.\n\nFor industrial growth to be sustainable, it must be inclusive. When workers are treated as stakeholders, productivity naturally rises, and conflicts decrease.",
    image: "/img/ec02.jpg",
    date: "2026-03-30",
    views: 120,
    likes: 54,
    comments: []
  }
];

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Comment Form States
  const [commenterName, setCommenterName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMessage, setCommentMessage] = useState('');

  const { visitor, requireVisitor, saveVisitor } = useVisitor();

  // Like State
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Auto-fill commenter name if visitor profile exists
  useEffect(() => {
    if (visitor && visitor.name && !commenterName) {
      setCommenterName(visitor.name);
    }
  }, [visitor]);

  const getBlogCategory = (p: BlogPost) => {
    if (p.id === 1 || p.title.toLowerCase().includes('union') || p.title.toLowerCase().includes('labor')) {
      return "Union Engagements";
    }
    if (p.id === 2 || p.title.toLowerCase().includes('education') || p.title.toLowerCase().includes('rural')) {
      return "Education & Welfare";
    }
    if (p.id === 3 || p.title.toLowerCase().includes('industrial') || p.title.toLowerCase().includes('growth')) {
      return "Industrial Relations";
    }
    return "Insights & News";
  };

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl(`/blogs/${id}`))
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data) {
          const formatted: BlogPost = {
            id: data.id,
            title: data.title,
            description: data.description || '',
            image: data.image ? uploadUrl(data.image) : undefined,
            date: data.date ? new Date(data.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Recent',
            views: data.views || 0,
            likes: data.likes || 0,
            comments: (data.comments || [])
              .map((c: any) => ({
                id: c.id,
                author_name: c.name || c.author_name || 'Anonymous',
                comment_text: c.comment || c.comment_text || '',
                date: c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Recent'
              }))
          };
          setPost(formatted);
          setLikesCount(formatted.likes);
        } else {
          const found = mockPostsList.find(p => p.id === Number(id)) || mockPostsList[0];
          setPost(found);
          setLikesCount(found.likes);
        }
        setLoading(false);
      })
      .catch(() => {
        const found = mockPostsList.find(p => p.id === Number(id)) || mockPostsList[0];
        setPost(found);
        setLikesCount(found.likes);
        setLoading(false);
      });
  }, [id]);

  const handleLike = () => {
    if (liked) return;
    requireVisitor(async (prof) => {
      setLiked(true);
      setLikesCount(prev => prev + 1);

      try {
        await fetch(apiUrl(`/blogs/${id}/like`), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: prof.name })
        });
      } catch (err) {
        // Ignore background errors
      }
    });
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commenterName || !commentText) return;

    // Save profile to visitor profile if not saved
    saveVisitor({
      name: commenterName.trim(),
      email: visitor?.email,
      phone: visitor?.phone
    });

    setSubmittingComment(true);
    setCommentMessage('');

    try {
      const response = await fetch(apiUrl(`/blogs/${id}/comments`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: commenterName,
          comment: commentText
        })
      });

      if (response.ok) {
        setCommenterName('');
        setCommentText('');
        setCommentMessage('Your comment has been submitted and is awaiting administrator approval.');
      } else {
        setCommentMessage('Failed to submit comment. Please try again.');
      }
    } catch (err) {
      setCommentMessage('Error connecting to the server. Please try again.');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return <div className="text-center section-padding" style={{ paddingTop: '150px', color: 'var(--text-muted)' }}>Loading article...</div>;
  }

  if (!post) {
    return (
      <div className="text-center section-padding" style={{ paddingTop: '150px' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>Post Not Found</h2>
        <Link to="/blog" className="btn btn-saffron" style={{ marginTop: '20px' }}>Back to Blogs</Link>
      </div>
    );
  }

  return (
    <div className="blog-post-page page-container container section-padding" style={{ paddingTop: '120px' }}>
      <div className="page-breadcrumbs">
        <Link to="/"><HomeIcon size={16} /> Home</Link>
        <span>/</span>
        <Link to="/blog">Blogs</Link>
        <span>/</span>
        <span className="current">{post.title.length > 25 ? `${post.title.substring(0, 25)}...` : post.title}</span>
      </div>

      <div className="blog-detail-layout">
        {/* Main Content Column */}
        <article className="blog-main-content glass-card" style={{ padding: '32px' }}>
          <div className="blog-post-detail-header">
            <span className="blog-post-detail-category">{getBlogCategory(post)}</span>
            <h1 className="blog-post-detail-title">{post.title}</h1>
            <div className="blog-post-detail-meta">
              <span className="blog-date"><Calendar size={14} /> {post.date}</span>
              <span className="blog-views"><Eye size={14} /> {post.views} Views</span>
              <button 
                onClick={handleLike} 
                className={`blog-post-like-btn ${liked ? 'liked' : ''}`}
                disabled={liked}
              >
                <Heart size={14} className={liked ? 'fill-saffron' : ''} /> {likesCount} Likes
              </button>
            </div>
          </div>

          <div className="blog-post-detail-img-wrapper">
            <img src={post.image || '/img/58.jpg'} alt={post.title} className="blog-post-detail-img" />
          </div>

          <div className="blog-post-detail-body">
            {post.description.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Likes & Share Footer */}

          <div className="blog-detail-footer" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <button 
              onClick={handleLike} 
              className={`btn btn-saffron ${liked ? 'liked' : ''}`}
              disabled={liked}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
            >
              <ThumbsUp size={18} /> {liked ? 'Liked!' : 'Like this post'} ({likesCount})
            </button>
            <ShareButtons title={post.title} url={`https://rakeshwarpandey.com/share/blog/${post.id}`} />
          </div>

        </article>

        {/* Comments Section */}
        <div className="comments-section-card glass-card">
          <h3 className="comments-section-title"><MessageSquare size={20} /> Comments ({post.comments.length})</h3>
          
          <div className="comments-list-layout">
            {post.comments.length === 0 ? (
              <p className="no-comments-text" style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>No comments yet. Be the first to share your thoughts!</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="comment-item-card">
                  <div className="comment-item-header">
                    <span className="comment-item-author">{comment.author_name}</span>
                    <span className="comment-item-date">{comment.date}</span>
                  </div>
                  <p className="comment-item-text">{comment.comment_text}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <div className="comment-form-wrapper" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', marginTop: '24px' }}>
            <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '16px', color: 'var(--text-primary)' }}>Leave a Comment</h4>
            <form onSubmit={handleCommentSubmit} className="comment-form" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  required
                  disabled={submittingComment}
                  className="form-input"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)' }}
                />
              </div>
              <div className="form-group">
                <textarea
                  placeholder="Share your thoughts..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  rows={4}
                  disabled={submittingComment}
                  className="form-input"
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-body)', color: 'var(--text-primary)', resize: 'vertical' }}
                />
              </div>
              
              {commentMessage && (
                <p className="comment-status-message" style={{ color: 'var(--saffron)', fontSize: '0.9rem' }}>
                  {commentMessage}
                </p>
              )}

              <button type="submit" disabled={submittingComment} className="btn btn-green btn-sm" style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                {submittingComment ? 'Submitting...' : 'Post Comment'} <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
