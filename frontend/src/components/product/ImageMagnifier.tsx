'use client';

import { useState, useRef, useCallback } from 'react';

interface Props {
  src: string;
  alt: string;
  zoom?: number; // zoom multiplier, default 5
}

export default function ImageMagnifier({ src, alt, zoom = 5 }: Props) {
  const [showLens, setShowLens] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });
  const imgRef = useRef<HTMLImageElement>(null);

  const LENS_SIZE = 120; // px

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const img = imgRef.current;
    if (!img) return;

    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Clamp lens within image
    const lensX = Math.max(LENS_SIZE / 2, Math.min(x, rect.width - LENS_SIZE / 2));
    const lensY = Math.max(LENS_SIZE / 2, Math.min(y, rect.height - LENS_SIZE / 2));

    // Background position for the zoomed pane
    const bgX = ((lensX / rect.width) * 100);
    const bgY = ((lensY / rect.height) * 100);

    setLensPos({ x: lensX - LENS_SIZE / 2, y: lensY - LENS_SIZE / 2 });
    setBgPos({ x: bgX, y: bgY });
  }, []);

  return (
    <div className="relative w-full h-full group" style={{ cursor: 'crosshair' }}>
      {/* Main image */}
      <div
        className="relative w-full h-full"
        onMouseEnter={() => setShowLens(true)}
        onMouseLeave={() => setShowLens(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className="object-contain p-6 w-full h-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder.png';
          }}
          draggable={false}
        />

        {/* Lens overlay */}
        {showLens && (
          <div
            className="absolute border-2 border-primary-400 bg-primary-100/30 pointer-events-none"
            style={{
              width: LENS_SIZE,
              height: LENS_SIZE,
              left: lensPos.x,
              top: lensPos.y,
            }}
          />
        )}
      </div>

      {/* Zoomed preview panel — appears to the left (LTR: right) */}
      {showLens && (
        <div
          className="absolute top-0 right-0 translate-x-full border border-slate-200 shadow-2xl rounded-xl overflow-hidden bg-white z-50 pointer-events-none"
          style={{
            width: 400,
            height: 400,
            marginRight: '-408px',  // gap between image and panel
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${src})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${zoom * 100}%`,
              backgroundPosition: `${bgPos.x}% ${bgPos.y}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}
