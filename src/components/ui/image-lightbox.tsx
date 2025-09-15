'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  src: string;
  alt: string;
  title?: string;
  showNavigation?: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
}

export function ImageLightbox({
  isOpen,
  onClose,
  src,
  alt,
  title,
  showNavigation = false,
  onPrevious,
  onNext,
}: ImageLightboxProps) {
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (showNavigation && e.key === 'ArrowLeft' && onPrevious) {
        onPrevious();
      } else if (showNavigation && e.key === 'ArrowRight' && onNext) {
        onNext();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeydown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeydown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose, showNavigation, onPrevious, onNext]);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4',
        'animate-in fade-in duration-200',
      )}
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-white hover:text-gray-300 transition-colors"
        aria-label="Close image"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Navigation buttons */}
      {showNavigation && onPrevious && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrevious();
          }}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors bg-black/30 rounded-full"
          aria-label="Previous image"
        >
          <ChevronLeft className="h-8 w-8" />
        </button>
      )}

      {showNavigation && onNext && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 text-white hover:text-gray-300 transition-colors bg-black/30 rounded-full"
          aria-label="Next image"
        >
          <ChevronRight className="h-8 w-8" />
        </button>
      )}

      {/* Image container */}
      <div
        className="relative max-h-[90vh] max-w-[90vw] bg-white rounded-lg overflow-hidden shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative">
          <Image
            src={src}
            alt={alt}
            width={800}
            height={600}
            className="max-h-[80vh] w-auto object-contain"
            priority
          />
          {title && (
            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white p-4">
              <p className="text-lg font-medium">{title}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
