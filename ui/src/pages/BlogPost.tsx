import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, Eye, ThumbsUp, Home as HomeIcon, MessageSquare, Send, Heart } from 'lucide-react';
import { apiUrl, uploadUrl } from '../config/api';

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

const mockPost: BlogPost = {
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
};

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Comment Form States
  const [commenterName, setCommenterName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentMessage, setCommentMessage] = useState('');

  // Like State
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

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
              .filter((c: any) => c.is_approved)
              .map((c: any) => ({
                id: c.id,
                author_name: c.author_name,
                comment_text: c.comment_text,
                date: new Date(c.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
              }))
          };
          setPost(formatted);
          setLikesCount(formatted.likes);
        } else {
          setPost(mockPost);
          setLikesCount(mockPost.likes);
        }
        setLoading(false);
      })
      .catch(() => {
        setPost(mockPost);
        setLikesCount(mockPost.likes);
        setLoading(false);
      });
  }, [id]);

  const handleLike = async () => {
    if (liked) return;
    setLiked(true);
    setLikesCount(prev => prev + 1);

    try {
      await fetch(apiUrl(`/blogs/${id}/like`), { method: 'POST' });
    } catch (err) {
      // Ignore background errors
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commenterName || !commentText) return;

    setSubmittingComment(true);
    setCommentMessage('');

    try {
      const response = await fetch(apiUrl(`/blogs/${id}/comments`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          author_name: commenterName,
          comment_text: commentText
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
    return <div className="text-center section-padding" style={{ paddingTop: '150px' }}>Loading article...</div>;
  }

  if (!post) {
    return (
      <div className="text-center section-padding" style={{ paddingTop: '150px' }}>
        <h2>Post Not Found</h2>
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
        <article className="blog-main-content glass-card">
          <div className="blog-detail-header">
            <h1 className="blog-detail-title">{post.title}</h1>
            <div className="blog-detail-meta">
              <span className="blog-date"><Calendar size={14} /> {post.date}</span>
              <span className="blog-views"><Eye size={14} /> {post.views} Views</span>
              <button 
                onClick={handleLike} 
                className={`blog-like-btn ${liked ? 'liked' : ''}`}
                disabled={liked}
              >
                <Heart size={14} className={liked ? 'fill-saffron' : ''} /> {likesCount} Likes
              </button>
            </div>
          </div>

          <div className="blog-detail-img-wrapper">
            <img src={post.image || '/img/58.jpg'} alt={post.title} className="blog-detail-img" />
          </div>

          <div className="blog-detail-body">
            {post.description.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="blog-paragraph">{paragraph}</p>
            ))}
          </div>

          {/* Likes Footer */}
          <div className="blog-detail-footer">
            <button 
              onClick={handleLike} 
              className={`btn btn-like-large ${liked ? 'liked' : ''}`}
              disabled={liked}
            >
              <ThumbsUp size={18} /> {liked ? 'Liked!' : 'Like this post'} ({likesCount})
            </button>
          </div>
        </article>

        {/* Comments Section */}
        <div className="blog-comments-section glass-card">
          <h3 className="comments-section-title"><MessageSquare size={20} /> Comments ({post.comments.length})</h3>
          
          <div className="comments-list">
            {post.comments.length === 0 ? (
              <p className="no-comments-text">No comments yet. Be the first to share your thoughts!</p>
            ) : (
              post.comments.map((comment) => (
                <div key={comment.id} className="comment-item glass-card">
                  <div className="comment-meta">
                    <span className="comment-author">{comment.author_name}</span>
                    <span className="comment-date">{comment.date}</span>
                  </div>
                  <p className="comment-text">{comment.comment_text}</p>
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <div className="comment-form-wrapper">
            <h4>Leave a Comment</h4>
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Your Name"
                  value={commenterName}
                  onChange={(e) => setCommenterName(e.target.value)}
                  required
                  disabled={submittingComment}
                  className="form-input"
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
                />
              </div>
              
              {commentMessage && (
                <p className="comment-status-message" style={{ color: 'var(--color-saffron-light)', fontSize: '0.9rem', marginBottom: '12px' }}>
                  {commentMessage}
                </p>
              )}

              <button type="submit" disabled={submittingComment} className="btn btn-green btn-sm">
                {submittingComment ? 'Submitting...' : 'Post Comment'} <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
