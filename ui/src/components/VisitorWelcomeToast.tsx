import React from 'react';
import { useVisitor } from '../context/VisitorContext';
import { Smile, X } from 'lucide-react';

export default function VisitorWelcomeToast() {
  const { welcomeToast, dismissToast } = useVisitor();

  if (!welcomeToast) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9990,
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        backdropFilter: 'blur(12px)',
        color: '#fff',
        padding: '12px 22px',
        borderRadius: '30px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 153, 51, 0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        maxWidth: '90vw',
        animation: 'slideUpToast 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards'
      }}
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#FF9933',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          flexShrink: 0
        }}
      >
        <Smile size={18} />
      </div>

      <span style={{ fontSize: '0.92rem', fontWeight: '500', letterSpacing: '0.01em' }}>
        {welcomeToast}
      </span>

      <button
        onClick={dismissToast}
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255, 255, 255, 0.6)',
          cursor: 'pointer',
          padding: '2px',
          marginLeft: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%'
        }}
        title="Dismiss"
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideUpToast {
          0% {
            opacity: 0;
            transform: translate(-50%, 40px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translate(-50%, 0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
