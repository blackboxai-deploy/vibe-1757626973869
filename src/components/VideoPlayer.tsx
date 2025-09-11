"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VideoGeneration } from "@/types/video";

interface VideoPlayerProps {
  video: VideoGeneration;
  onDownload?: () => void;
  className?: string;
}

export function VideoPlayer({ video, onDownload, className = "" }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const handleLoadedMetadata = () => {
      setDuration(videoElement.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setError("Failed to load video");
      setIsLoading(false);
    };

    videoElement.addEventListener('loadedmetadata', handleLoadedMetadata);
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('error', handleError);

    return () => {
      videoElement.removeEventListener('loadedmetadata', handleLoadedMetadata);
      videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      videoElement.removeEventListener('play', handlePlay);
      videoElement.removeEventListener('pause', handlePause);
      videoElement.removeEventListener('ended', handleEnded);
      videoElement.removeEventListener('error', handleError);
    };
  }, [video.videoUrl]);

  const togglePlay = () => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    if (isPlaying) {
      videoElement.pause();
    } else {
      videoElement.play();
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const videoElement = videoRef.current;
    if (!videoElement) return;

    const newTime = (parseFloat(e.target.value) / 100) * duration;
    videoElement.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleDownload = async () => {
    if (!video.videoUrl) return;

    try {
      const response = await fetch(video.videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${video.id}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      if (onDownload) onDownload();
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (video.status === 'failed') {
    return (
      <Card className={`bg-red-500/10 border-red-500/20 ${className}`}>
        <CardContent className="p-6 text-center">
          <div className="text-red-400 mb-2">Video generation failed</div>
          <p className="text-sm text-gray-400">{video.errorMessage || 'Unknown error occurred'}</p>
        </CardContent>
      </Card>
    );
  }

  if (video.status === 'generating') {
    return (
      <Card className={`bg-white/5 border-white/10 backdrop-blur-lg ${className}`}>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto"></div>
            <div>
              <p className="text-white font-medium mb-2">Generating your video...</p>
              <p className="text-sm text-gray-400">This may take several minutes</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-white/5 border-white/10 backdrop-blur-lg overflow-hidden ${className}`}>
      <CardContent className="p-0">
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
              <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            </div>
          )}
          
          {error ? (
            <div className="aspect-video flex items-center justify-center bg-gray-900">
              <p className="text-red-400">{error}</p>
            </div>
          ) : (
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full aspect-video object-cover"
              poster={video.thumbnailUrl}
              preload="metadata"
            />
          )}
          
          {!isLoading && !error && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/20 transition-opacity">
              <Button
                onClick={togglePlay}
                size="lg"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-md rounded-full w-16 h-16 p-0"
              >
                {isPlaying ? (
                  <div className="w-4 h-4 bg-white rounded-sm"></div>
                ) : (
                  <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1"></div>
                )}
              </Button>
            </div>
          )}
        </div>
        
        <div className="p-4 space-y-4">
          {/* Video Controls */}
          {duration > 0 && (
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={(currentTime / duration) * 100}
                onChange={handleSeek}
                className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex items-center justify-between text-sm text-gray-400">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          )}
          
          {/* Video Info & Actions */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm text-gray-300 line-clamp-2">{video.prompt}</p>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {video.aspectRatio || '16:9'}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {video.quality || 'standard'}
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(video.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <Button
              onClick={handleDownload}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
            >
              Download
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}