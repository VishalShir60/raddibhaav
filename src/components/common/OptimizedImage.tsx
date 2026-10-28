'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Image as ImageIcon } from 'lucide-react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  containerClassName?: string;
}

/**
 * Reusable accessible image component with skeleton shimmer loader,
 * automatic Next.js image optimization, lazy loading, and error fallback.
 */
export function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = 'object-cover w-full h-full',
  containerClassName = 'relative overflow-hidden bg-slate-100',
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // If source is a data URI (client-side compressed preview) or raw local SVG
  const isDataOrSvg = src.startsWith('data:') || src.endsWith('.svg');

  if (error || !src) {
    return (
      <div
        className={`${containerClassName} flex flex-col items-center justify-center text-slate-400 p-2 text-center`}
        role="img"
        aria-label={alt}
      >
        <ImageIcon className="w-6 h-6 mb-1 text-slate-300" aria-hidden="true" />
        <span className="text-[10px] font-bold text-slate-400">Scrap Photo</span>
      </div>
    );
  }

  return (
    <div className={containerClassName}>
      {/* Skeleton Shimmer Placeholder */}
      {!loaded && (
        <div 
          className="absolute inset-0 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 animate-pulse z-10"
          aria-hidden="true" 
        />
      )}

      {isDataOrSvg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      ) : (
        <Image
          src={src}
          alt={alt}
          fill={fill}
          width={!fill ? width || 400 : undefined}
          height={!fill ? height || 300 : undefined}
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
    </div>
  );
}
