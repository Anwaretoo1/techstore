'use client';

import { useState, useRef } from 'react';

interface Props {
  src: string;
  alt: string;
  zoom?: number;
}

const LENS_SIZE = 120;
const PREVIEW_SIZE = 420;

export default function ImageMagnifier({ src, alt, zoom = 5 }: Props) {
  const [active, setActive] = useState(false);
  const [lensPos, setLensPos] = useState({ x: 0, y: 0 });
  const [bgPos, setBgPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    // Mouse position relative to container
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Clamp lens center within container bounds
    const clampedX = Math.max(LENS_SIZE / 2, Math.min(mouseX, rect.width - LENS_SIZE / 2));
    const clampedY = Math.max(LENS_SIZE / 2, Math.min(mouseY, rect.height - LENS_SIZE / 2));

    // Lens top-left position
    setLensPos({ x: clampedX - LENS_SIZE / 2, y: clampedY - LENS_SIZE / 2 });

    // Fraction of cursor position (0→1)
    const fracX = clampedX / rect.width;
    const fracY = clampedY / rect.height;

    // Preview background is zoom × PREVIEW_SIZE
    const bgW = zoom * PREVIEW_SIZE;
    const bgH = zoom * PREVIEW_SIZE;

    // Offset: center the hovered point in the preview panel
    const rawBgX = fracX * bgW - PREVIEW_SIZE / 2;
    const rawBgY = fracY * bgH - PREVIEW_SIZE / 2;

    setBgPos({
      x: Math.max(0, Math.min(rawBgX, bgW - PREVIEW_SIZE)),
      y: Math.max(0, Math.min(rawBgY, bgH - PREVIEW_SIZE)),
    });
  };

  return (
    <div className="relative w-full h-full">
      {/* Main image */}
      <div
        ref={containerRef}
        className="relative w-full h-full"
        style={{ cursor: 'crosshair' }}
        onMouseEnter={() => setActive(true)}
        onMouseLeave={() => setActive(false)}
        onMouseMove={handleMouseMove}
      >
        <img
          src={src}
          alt={alt}
          className="object-contain p-6 w-full h-full select-none"
          draggable={false}
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/placeholder.png';
          }}
        />

        {/* Lens box */}
        {active && (
          <div
            className="absolute pointer-events-none border-2 border-primary-500 bg-primary-100/20"
            style={{
              width: LENS_SIZE,
              height: LENS_SIZE,
              left: lensPos.x,
              top: lensPos.y,
            }}
          />
        )}
      </div>

      {/* Zoomed preview panel (RTL: appears to the left of the image) */}
      {active && (
        <div
          className="absolute top-0 border border-slate-200 shadow-2xl rounded-xl overflow-hidden bg-white z-50 pointer-events-none"
          style={{
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            right: `calc(100% + 12px)`,
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundImage: `url(${src})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: `${zoom * PREVIEW_SIZE}px ${zoom * PREVIEW_SIZE}px`,
              backgroundPosition: `-${bgPos.x}px -${bgPos.y}px`,
            }}
          />
        </div>
      )}
    </div>
  );
}
