"use client";

import { useState, useEffect } from "react";
import { VideoPlayer } from "./VideoPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { VideoGeneration } from "@/types/video";
import { StorageService } from "@/lib/storage";

interface VideoGalleryProps {
  videos?: VideoGeneration[];
  showSearch?: boolean;
  maxItems?: number;
  title?: string;
}

export function VideoGallery({ 
  videos, 
  showSearch = true, 
  maxItems = 10,
  title = "Your Generated Videos" 
}: VideoGalleryProps) {
  const [displayVideos, setDisplayVideos] = useState<VideoGeneration[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<VideoGeneration | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  useEffect(() => {
    const loadVideos = () => {
      if (videos) {
        setDisplayVideos(videos);
      } else {
        const history = StorageService.getVideoHistory();
        setDisplayVideos(history.generations);
      }
    };

    loadVideos();
    
    // Refresh videos when storage changes
    const handleStorageChange = () => loadVideos();
    window.addEventListener('storage', handleStorageChange);
    
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [videos]);

  const filteredAndSortedVideos = displayVideos
    .filter(video => {
      if (!searchQuery) return true;
      return video.prompt.toLowerCase().includes(searchQuery.toLowerCase()) ||
             video.id.toLowerCase().includes(searchQuery.toLowerCase());
    })
    .sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    })
    .slice(0, maxItems);

  const handleDeleteVideo = (videoId: string) => {
    StorageService.deleteVideoGeneration(videoId);
    setDisplayVideos(prev => prev.filter(v => v.id !== videoId));
    if (selectedVideo?.id === videoId) {
      setSelectedVideo(null);
    }
  };

  const getStatusBadge = (status: VideoGeneration['status']) => {
    const variants = {
      generating: { variant: "secondary" as const, color: "bg-blue-500/20 text-blue-400", text: "Generating" },
      completed: { variant: "secondary" as const, color: "bg-green-500/20 text-green-400", text: "Completed" },
      failed: { variant: "destructive" as const, color: "bg-red-500/20 text-red-400", text: "Failed" }
    };
    
    const config = variants[status];
    return (
      <Badge variant={config.variant} className={config.color}>
        {config.text}
      </Badge>
    );
  };

  if (displayVideos.length === 0) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
        <CardContent className="p-12 text-center">
          <div className="space-y-4">
            <img
              src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/596d3f98-cb7d-48d8-ae6f-a2f49fe3767e.png"
              alt="Empty state illustration showing a modern creative studio setup"
              className="mx-auto rounded-lg opacity-50"
            />
            <div>
              <h3 className="text-xl font-semibold text-white mb-2">No videos yet</h3>
              <p className="text-gray-400">Your generated videos will appear here once you create them.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">{title}</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
                className="bg-white/10 border-white/20 hover:bg-white/20 text-white text-xs"
              >
                Sort by {sortBy === 'newest' ? 'Oldest' : 'Newest'}
              </Button>
              <Badge variant="secondary" className="bg-white/10 text-gray-300">
                {displayVideos.length} videos
              </Badge>
            </div>
          </div>
          
          {showSearch && (
            <div className="pt-2">
              <Input
                placeholder="Search videos by prompt or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-black/20 border-white/20 text-white placeholder:text-gray-400"
              />
            </div>
          )}
        </CardHeader>

        <CardContent className="p-6 pt-0">
          {selectedVideo ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Playing Video</h4>
                <Button
                  variant="ghost"
                  onClick={() => setSelectedVideo(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Back to Gallery
                </Button>
              </div>
              <VideoPlayer
                video={selectedVideo}
                onDownload={() => {}}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredAndSortedVideos.map((video) => (
                <div
                  key={video.id}
                  className="group cursor-pointer"
                  onClick={() => video.status === 'completed' && setSelectedVideo(video)}
                >
                  <Card className="bg-white/5 border-white/10 hover:border-white/20 transition-all duration-200 group-hover:scale-[1.02]">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {/* Video Thumbnail */}
                        <div className="relative aspect-video bg-gray-800 rounded-lg overflow-hidden">
                          {video.status === 'completed' && video.videoUrl ? (
                            <video
                              src={video.videoUrl}
                              className="w-full h-full object-cover"
                              poster={video.thumbnailUrl}
                              muted
                              onMouseEnter={(e) => e.currentTarget.play()}
                              onMouseLeave={(e) => e.currentTarget.pause()}
                            />
                          ) : video.status === 'generating' ? (
                            <div className="flex items-center justify-center h-full">
                              <div className="w-8 h-8 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <p className="text-red-400 text-sm">Generation failed</p>
                            </div>
                          )}
                          
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(video.status)}
                          </div>
                        </div>
                        
                        {/* Video Info */}
                        <div className="space-y-2">
                          <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed">
                            {video.prompt}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                {video.aspectRatio || '16:9'}
                              </Badge>
                              <Badge variant="outline" className="text-xs border-white/20 text-gray-400">
                                {video.quality || 'standard'}
                              </Badge>
                            </div>
                            <span className="text-gray-500">
                              {new Date(video.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500 font-mono">
                              ID: {video.id.slice(-8)}
                            </span>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteVideo(video.id);
                              }}
                              className="text-gray-500 hover:text-red-400 text-xs h-6 px-2"
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
          
          {filteredAndSortedVideos.length === 0 && searchQuery && (
            <div className="text-center py-8">
              <p className="text-gray-400">No videos found matching "{searchQuery}"</p>
              <Button
                variant="ghost"
                onClick={() => setSearchQuery("")}
                className="mt-2 text-gray-400 hover:text-white"
              >
                Clear search
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}