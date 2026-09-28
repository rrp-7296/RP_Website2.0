import React, { useState, useRef } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react';
import { uploadUrl } from '../config/api';

interface ImageSliderProps {
  images?: string[];
  image?: string;
  altTitle?: string;
  aspectRatio?: string;
  className?: string;
}

export default function ImageSlider({
  images = [],
  image,
  altTitle = 'Image',
  aspectRatio = '16/9',
  className = ''
}: ImageSliderProps) {
  // Normalize images array
  const imageList: string[] = Array.isArray(images) && images.length > 0 
    ? images 
    : (image ? [image] : []);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);

  if (imageList.length === 0) {
    return null;
  }

  // Format image URL
  const getFullUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : uploadUrl(path);
  };

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diffX = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diffX) > 40) {
      if (diffX > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  // If only 1 image, render clean single image
  if (imageList.length === 1) {
    const singleUrl = getFullUrl(imageList[0]);
    return (
      <>
        <div 
          className={`image-single-container ${className}`}
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: aspectRatio,
            borderRadius: '12px',
            overflow: 'hidden',
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <img
            src={singleUrl}
            alt={altTitle}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              cursor: 'pointer',
              display: 'block'
            }}
            onClick={() => setIsLightboxOpen(true)}
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <button
            onClick={() => setIsLightboxOpen(true)}
            title="Expand Fullscreen"
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
          >
            <Maximize2 size={16} />
          </button>
        </div>

        {/* Lightbox Modal */}
        {isLightboxOpen && (
          <div 
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              backdropFilter: 'blur(10px)',
              zIndex: 99999,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255, 255, 255, 0.1)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={24} />
            </button>
            <img 
              src={singleUrl} 
              alt={altTitle} 
              style={{
                maxWidth: '90vw',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)'
              }}
            />
          </div>
        )}
      </>
    );
  }

  const currentUrl = getFullUrl(imageList[currentIndex]);

  return (
    <>
      <div 
        className={`image-slider-wrapper ${className}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: aspectRatio,
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 12px 32px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Main Active Image */}
        <img
          src={currentUrl}
          alt={`${altTitle} ${currentIndex + 1}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            cursor: 'pointer',
            transition: 'all 0.3s ease-in-out',
            display: 'block'
          }}
          onClick={() => setIsLightboxOpen(true)}
        />

        {/* Counter Badge */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '12px',
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          color: '#ff9933',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '0.8rem',
          fontWeight: '600',
          border: '1px solid rgba(255, 153, 51, 0.3)',
          backdropFilter: 'blur(6px)'
        }}>
          {currentIndex + 1} / {imageList.length}
        </div>

        {/* Fullscreen Expand Button */}
        <button
          onClick={() => setIsLightboxOpen(true)}
          title="Expand Fullscreen"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            color: '#fff',
            border: 'none',
            borderRadius: '50%',
            width: '34px',
            height: '34px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Maximize2 size={16} />
        </button>

        {/* Nav Arrows */}
        <button
          onClick={handlePrev}
          aria-label="Previous Image"
          style={{
            position: 'absolute',
            top: '50%',
            left: '12px',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.2s ease',
            zIndex: 2
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ff9933';
            e.currentTarget.style.color = '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          <ChevronLeft size={22} />
        </button>

        <button
          onClick={handleNext}
          aria-label="Next Image"
          style={{
            position: 'absolute',
            top: '50%',
            right: '12px',
            transform: 'translateY(-50%)',
            backgroundColor: 'rgba(15, 23, 42, 0.7)',
            color: '#ffffff',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            backdropFilter: 'blur(6px)',
            transition: 'all 0.2s ease',
            zIndex: 2
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#ff9933';
            e.currentTarget.style.color = '#0f172a';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.7)';
            e.currentTarget.style.color = '#ffffff';
          }}
        >
          <ChevronRight size={22} />
        </button>

        {/* Pagination Dots */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          backgroundColor: 'rgba(15, 23, 42, 0.65)',
          padding: '6px 14px',
          borderRadius: '20px',
          backdropFilter: 'blur(6px)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {imageList.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              aria-label={`Go to slide ${idx + 1}`}
              style={{
                width: idx === currentIndex ? '20px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: idx === currentIndex ? '#ff9933' : 'rgba(255, 255, 255, 0.4)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
            />
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.92)',
            backdropFilter: 'blur(12px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <X size={26} />
          </button>

          {/* Lightbox Nav */}
          <button
            onClick={handlePrev}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <ChevronLeft size={32} />
          </button>

          <img 
            src={currentUrl} 
            alt={`${altTitle} ${currentIndex + 1}`} 
            style={{
              maxWidth: '85vw',
              maxHeight: '80vh',
              objectFit: 'contain',
              borderRadius: '12px',
              boxShadow: '0 25px 50px -12px rgba(0,0,0,0.9)'
            }}
          />

          <button
            onClick={handleNext}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#fff',
              border: 'none',
              borderRadius: '50%',
              width: '50px',
              height: '50px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10
            }}
          >
            <ChevronRight size={32} />
          </button>

          {/* Thumbnail row in Lightbox */}
          <div 
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '20px',
              maxWidth: '90vw',
              overflowX: 'auto',
              padding: '8px'
            }}
          >
            {imageList.map((path, idx) => (
              <img
                key={idx}
                src={getFullUrl(path)}
                alt={`Thumb ${idx + 1}`}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  width: '60px',
                  height: '45px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  border: idx === currentIndex ? '2px solid #ff9933' : '2px solid transparent',
                  opacity: idx === currentIndex ? 1 : 0.6,
                  transition: 'all 0.2s ease'
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
