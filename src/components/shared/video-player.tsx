'use client';

import { useState, useRef } from 'react';
import { Play, Pause, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VideoPlayerProps {
  src: string;
  highResSrc: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({
  src,
  highResSrc,
  poster,
  className,
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div
      className={cn(
        'relative rounded-2xl overflow-hidden border border-colonial-navy/10 mx-auto shadow-md',
        className,
      )}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={
          poster ||
          '/images/placeholders/placeholder.svg?height=1920&width=1080'
        }
        onEnded={() => setIsPlaying(false)}
        onClick={togglePlay}
        playsInline // Better mobile experience
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      <div className="absolute inset-0 flex items-center justify-center">
        {!isPlaying && (
          <Button
            onClick={togglePlay}
            className="rounded-full bg-colonial-navy/70 hover:bg-colonial-navy text-colonial-parchment w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center"
          >
            <Play className="h-6 w-6 sm:h-8 sm:w-8" />
            <span className="sr-only">Play video</span>
          </Button>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-4 bg-gradient-to-t from-colonial-navy/80 to-transparent flex justify-between items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={togglePlay}
          className="text-colonial-parchment hover:text-colonial-gold hover:bg-transparent text-xs sm:text-sm"
        >
          {isPlaying ? (
            <>
              <Pause className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Pause</span>
            </>
          ) : (
            <>
              <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Play</span>
            </>
          )}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          asChild
          className="text-colonial-parchment hover:text-colonial-gold hover:bg-transparent text-xs sm:text-sm"
        >
          <a href={highResSrc} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">High Resolution</span>
            <span className="sm:hidden">HD</span>
          </a>
        </Button>
      </div>
    </div>
  );
}
