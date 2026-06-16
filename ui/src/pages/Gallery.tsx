import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home as HomeIcon, ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';
import { apiUrl, uploadUrl } from '../config/api';

interface GalleryImage {
  id: number;
  filename: string;
  tag: string;
  caption: string;
}

const staticTags = [
  { value: "all", label: "All Photos" },
  { value: "international", label: "International Delegations" },
  { value: "intuc", label: "INTUC Leadership" },
  { value: "union", label: "Union Engagements" },
  { value: "press", label: "Press & Media" },
  { value: "timeline", label: "Timeline Events" },
  { value: "others", label: "Welfare & Social Work" }
];

const fallbackImages: GalleryImage[] = [
  { id: 1, filename: "/gallery/g1.jpg", tag: "union", caption: "Union general body meeting at Adityapur industrial area." },
  { id: 2, filename: "/gallery/g2.jpg", tag: "intuc", caption: "Jharkhand INTUC delegation presenting demands to labor commissioner." },
  { id: 3, filename: "/gallery/g3.jpg", tag: "international", caption: "Representing Indian labor federation at base metal steering committee meeting." },
  { id: 4, filename: "/gallery/g4.jpg", tag: "press", caption: "Press conference briefing regarding the wage revision settlement." },
  { id: 5, filename: "/gallery/g5.jpg", tag: "union", caption: "Tata Power Employees Union committee members with president Rakeshwar Pandey." },
  { id: 6, filename: "/gallery/g6.jpg", tag: "others", caption: "Distributing winter packages to poor families in local villages." },
  { id: 7, filename: "/gallery/g7.jpg", tag: "international", caption: "Attending international labor assembly in Geneva, Switzerland." },
  { id: 8, filename: "/gallery/g8.jpg", tag: "intuc", caption: "Greeting congress leaders and central trade union members." },
  { id: 9, filename: "/gallery/g9.jpg", tag: "union", caption: "TRF Labor Union annual general meeting address." },
  { id: 10, filename: "/gallery/g10.jpg", tag: "press", caption: "Newspaper clipping covering protest against contract labor exploitation." },
  { id: 11, filename: "/gallery/g11.jpg", tag: "timeline", caption: "Inauguration ceremony of computer education wing at high school." },
  { id: 12, filename: "/gallery/g12.jpg", tag: "union", caption: "Golmuri Tinplate Workers Union central committee group photo." }
];

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [selectedTag, setSelectedTag] = useState('all');
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(apiUrl(`/gallery?tag=${selectedTag}`))
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        if (data && data.length > 0) {
          const formatted = data.map((img: any) => ({
            id: img.id,
            filename: img.filename.startsWith('http') ? img.filename : uploadUrl(img.filename),
            tag: img.tag,
            caption: img.caption || ''
          }));
          setImages(formatted);
        } else {
          // Filter fallback images locally
          const filtered = selectedTag === 'all' 
            ? fallbackImages 
            : fallbackImages.filter(img => img.tag === selectedTag);
          setImages(filtered);
        }
        setLoading(false);
      })
      .catch(() => {
        const filtered = selectedTag === 'all' 
          ? fallbackImages 
          : fallbackImages.filter(img => img.tag === selectedTag);
        setImages(filtered);
        setLoading(false);
      });
  }, [selectedTag]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  };

  // Helper to group images by tag
  const getGroupedImages = () => {
    const groups: { [key: string]: GalleryImage[] } = {};
    images.forEach(img => {
      const tagKey = img.tag.toLowerCase();
      if (!groups[tagKey]) {
        groups[tagKey] = [];
      }
      groups[tagKey].push(img);
    });
    return groups;
  };

  const renderGalleryContent = () => {
    if (images.length === 0) {
      return (
        <div className="text-center" style={{ padding: '60px 0', color: 'var(--text-secondary)' }}>
          No images found in this category.
        </div>
      );
    }

    if (selectedTag !== 'all') {
      const currentTagLabel = staticTags.find(t => t.value === selectedTag)?.label || selectedTag.toUpperCase();
      return (
        <div className="gallery-category-section">
          <div className="gallery-category-header">
            <h2 className="gallery-category-title">{currentTagLabel}</h2>
            <div className="gallery-category-line"></div>
          </div>
          <div className="gallery-grid-modern">
            {images.map((img, idx) => (
              <div key={img.id} className="gallery-item-modern glass-card" onClick={() => setLightboxIndex(idx)}>
                <div className="gallery-img-wrapper">
                  <img src={img.filename} alt={img.caption} className="gallery-img" loading="lazy" />
                  <div className="gallery-hover-overlay">
                    <ZoomIn size={28} className="zoom-icon" />
                    <span className="gallery-hover-tag saffron">{img.tag}</span>
                  </div>
                </div>
                {img.caption && (
                  <div className="gallery-caption-box">
                    <p className="gallery-caption-text">{img.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Otherwise render all sections grouped
    const grouped = getGroupedImages();
    const activeSections = staticTags.filter(t => t.value !== 'all' && grouped[t.value]?.length > 0);

    return (
      <>
        {activeSections.map((t) => (
          <div key={t.value} className="gallery-category-section">
            <div className="gallery-category-header">
              <h2 className="gallery-category-title">{t.label}</h2>
              <div className="gallery-category-line"></div>
            </div>
            <div className="gallery-grid-modern">
              {grouped[t.value].map((img) => {
                const globalIdx = images.findIndex(item => item.id === img.id);
                return (
                  <div key={img.id} className="gallery-item-modern glass-card" onClick={() => setLightboxIndex(globalIdx)}>
                    <div className="gallery-img-wrapper">
                      <img src={img.filename} alt={img.caption} className="gallery-img" loading="lazy" />
                      <div className="gallery-hover-overlay">
                        <ZoomIn size={28} className="zoom-icon" />
                        <span className="gallery-hover-tag saffron">{img.tag}</span>
                      </div>
                    </div>
                    {img.caption && (
                      <div className="gallery-caption-box">
                        <p className="gallery-caption-text">{img.caption}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="gallery-page page-container container section-padding" style={{ paddingTop: '120px' }}>
      <div className="page-breadcrumbs">
        <Link to="/"><HomeIcon size={16} /> Home</Link>
        <span>/</span>
        <span className="current">Gallery</span>
      </div>

      <div className="section-header" style={{ textAlign: 'left', marginBottom: '32px' }}>
        <h1 className="section-title" style={{ fontSize: '3rem' }}>Photo Gallery</h1>
        <p className="section-subtitle" style={{ margin: '0' }}>Visual coverage of trade union movements, rallies, events, and philanthropic visits.</p>
      </div>

      {/* Filter Nav */}
      <div className="gallery-filter-nav glass-card">
        {staticTags.map((tag) => (
          <button
            key={tag.value}
            className={`filter-btn ${selectedTag === tag.value ? 'active' : ''}`}
            onClick={() => setSelectedTag(tag.value)}
          >
            {tag.label === "All Photos" ? "All Categories" : tag.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center" style={{ padding: '60px 0', color: 'var(--text-muted)' }}>Loading gallery photos...</div>
      ) : (
        renderGalleryContent()
      )}

      {/* Lightbox Modal */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <div className="lightbox-overlay" onClick={() => setLightboxIndex(null)}>
          <button className="lightbox-close" onClick={() => setLightboxIndex(null)}>
            <X size={32} />
          </button>
          
          <button className="lightbox-nav prev" onClick={handlePrevImage}>
            <ChevronLeft size={32} />
          </button>
          
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <img 
              src={images[lightboxIndex].filename} 
              alt={images[lightboxIndex].caption} 
              className="lightbox-main-img" 
            />
            <div className="lightbox-footer">
              <span className="lightbox-tag saffron">{images[lightboxIndex].tag.toUpperCase()}</span>
              <p className="lightbox-caption">{images[lightboxIndex].caption}</p>
              <span className="lightbox-counter">{lightboxIndex + 1} / {images.length}</span>
            </div>
          </div>
          
          <button className="lightbox-nav next" onClick={handleNextImage}>
            <ChevronRight size={32} />
          </button>
        </div>
      )}
    </div>
  );
}
