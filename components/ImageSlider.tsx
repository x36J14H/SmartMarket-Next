'use client';

import { useRef, useEffect } from 'react';
import { motion, useMotionValue, animate } from 'motion/react';

interface ImageSliderProps {
  images: string[];
  activeIndex: number;
  onIndexChange: (idx: number) => void;
  alt: string;
}

export function ImageSlider({ images, activeIndex, onIndexChange, alt }: ImageSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const isDragging = useRef(false);
  const startX = useRef(0);
  const lastClientX = useRef(0);
  const lastTime = useRef(0);
  const velocity = useRef(0);

  const snapTo = (idx: number) => {
    const slideW = containerRef.current?.offsetWidth ?? 0;
    animate(x, -idx * slideW, { type: 'spring', stiffness: 380, damping: 38, restDelta: 0.5 });
  };

  useEffect(() => { snapTo(activeIndex); }, [activeIndex]);

  const handlePointerDown = (e: React.PointerEvent) => {
    x.stop();
    isDragging.current = true;
    startX.current = e.clientX - x.get();
    lastClientX.current = e.clientX;
    lastTime.current = e.timeStamp;
    velocity.current = 0;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const el = containerRef.current;
    if (!el) return;

    const dt = e.timeStamp - lastTime.current;
    if (dt > 0) velocity.current = (e.clientX - lastClientX.current) / dt;
    lastClientX.current = e.clientX;
    lastTime.current = e.timeStamp;

    const slideW = el.offsetWidth;
    const rawX = e.clientX - startX.current;
    const minX = -(images.length - 1) * slideW;
    const maxX = 0;

    // Hard stop at edges — no elastic, no bounce
    x.set(Math.max(minX, Math.min(maxX, rawX)));
  };

  const handlePointerUp = () => {
    if (!isDragging.current) return;
    isDragging.current = false;

    const el = containerRef.current;
    if (!el) return;
    const slideW = el.offsetWidth;

    const v = velocity.current;
    const VELOCITY_THRESHOLD = 0.3;
    const DRAG_THRESHOLD = slideW * 0.2;
    const currentX = x.get();

    let newIdx = activeIndex;

    if (v < -VELOCITY_THRESHOLD) {
      newIdx = Math.min(activeIndex + 1, images.length - 1);
    } else if (v > VELOCITY_THRESHOLD) {
      newIdx = Math.max(activeIndex - 1, 0);
    } else {
      const dragged = currentX - (-activeIndex * slideW);
      if (dragged < -DRAG_THRESHOLD) newIdx = Math.min(activeIndex + 1, images.length - 1);
      else if (dragged > DRAG_THRESHOLD) newIdx = Math.max(activeIndex - 1, 0);
    }

    if (newIdx !== activeIndex) onIndexChange(newIdx);
    else snapTo(activeIndex);
  };

  return (
    <div
      ref={containerRef}
      className="relative flex-1 overflow-hidden aspect-[3/4] cursor-grab active:cursor-grabbing select-none touch-pan-y"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <motion.div
        style={{ x, width: `${images.length * 100}%` }}
        className="flex h-full will-change-transform"
      >
        {images.map((img, idx) => (
          <div key={idx} className="h-full shrink-0" style={{ width: `${100 / images.length}%` }}>
            <img
              src={img}
              alt={alt}
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
              draggable={false}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}
