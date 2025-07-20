'use client';

import type React from 'react';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface AccessibleAudioPlayerProps {
  src: string;
  title: string;
  description?: string;
  className?: string;
}

export function AccessibleAudioPlayer({
  src,
  title,
  description,
  className,
}: AccessibleAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [audioSrc, setAudioSrc] = useState(src);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarId = `progress-${Math.random().toString(36).substring(2, 9)}`;
  const volumeId = `volume-${Math.random().toString(36).substring(2, 9)}`;

  // Format time in MM:SS format
  const formatTime = (time: number) => {
    if (isNaN(time)) return '00:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Process the audio source path
  useEffect(() => {
    // Let's handle the path - use the original for now as we might need to special case audio files
    setAudioSrc(src);
  }, [src]);

  // Handle play/pause
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Handle mute toggle
  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    if (audioRef.current && newVolume !== undefined) {
      audioRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
        audioRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        audioRef.current.muted = false;
      }
    }
  };

  // Handle time update
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // Handle seeking
  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    if (audioRef.current && newTime !== undefined) {
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  // Handle metadata loaded
  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  // Handle audio ended
  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  };

  // Keyboard accessibility for play/pause
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      togglePlay();
    }
  };

  return (
    <div
      className={cn(
        'bg-colonial-parchment/90 border border-colonial-navy/20 rounded-lg p-4 shadow-sm',
        className,
      )}
      role="region"
      aria-label={`Audio player: ${title}`}
    >
      <div className="mb-3">
        <h3
          className="text-lg font-medium text-colonial-navy"
          id={`audio-title-${progressBarId}`}
        >
          {title}
        </h3>
        {description && (
          <p
            className="text-sm text-colonial-navy/70 mt-1"
            id={`audio-description-${progressBarId}`}
          >
            {description}
          </p>
        )}
      </div>

      <audio
        ref={audioRef}
        src={audioSrc}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        aria-labelledby={`audio-title-${progressBarId}`}
        aria-describedby={
          description ? `audio-description-${progressBarId}` : undefined
        }
        preload="metadata"
        className="hidden"
      />

      <div className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-full"
            onClick={togglePlay}
            onKeyDown={handleKeyDown}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            aria-pressed={isPlaying}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>

          <div className="flex-1 flex items-center space-x-2">
            <span className="text-xs text-colonial-navy/70 w-10 text-right">
              {formatTime(currentTime)}
            </span>

            <Slider
              id={progressBarId}
              value={[currentTime]}
              min={0}
              max={duration || 100}
              step={0.1}
              onValueChange={handleSeek}
              aria-label="Audio progress"
              aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
              className="flex-1"
            />

            <span className="text-xs text-colonial-navy/70 w-10">
              {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={toggleMute}
              aria-label={isMuted ? 'Unmute' : 'Mute'}
              aria-pressed={isMuted}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            <Slider
              id={volumeId}
              value={[isMuted ? 0 : volume]}
              min={0}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              aria-label="Volume"
              aria-valuetext={`Volume ${Math.round((isMuted ? 0 : volume) * 100)}%`}
              className="w-20"
            />
          </div>
        </div>
      </div>
    </div>
  );
}