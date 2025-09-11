"use client";

import { useState, useEffect } from "react";
import { PromptInput } from "./PromptInput";
import { VideoPlayer } from "./VideoPlayer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { VideoGeneration, GenerationRequest } from "@/types/video";
import { VideoAPIService } from "@/lib/video-api";
import { StorageService } from "@/lib/storage";
import { toast } from "sonner";

export function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState<VideoGeneration | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Advanced settings
  const [duration, setDuration] = useState([5]);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1' | '4:3'>('16:9');
  const [quality, setQuality] = useState<'standard' | 'high' | 'premium'>('high');
  const [model] = useState('replicate/google/veo-3');

  const [recentGenerations, setRecentGenerations] = useState<VideoGeneration[]>([]);

  useEffect(() => {
    // Load recent generations
    const history = StorageService.getVideoHistory();
    setRecentGenerations(history.generations.slice(0, 3));
  }, []);

  const generateVideo = async () => {
    if (!prompt.trim() || isGenerating) return;

    const request: GenerationRequest = {
      prompt: prompt.trim(),
      duration: duration[0],
      aspectRatio,
      quality,
      model
    };

    setIsGenerating(true);
    
    // Create initial generation entry
    const generation: VideoGeneration = {
      id: `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      prompt: request.prompt,
      videoUrl: '',
      status: 'generating',
      createdAt: new Date().toISOString(),
      duration: request.duration,
      aspectRatio: request.aspectRatio,
      quality: request.quality,
      model: request.model || model
    };

    setCurrentGeneration(generation);
    StorageService.addVideoGeneration(generation);
    
    toast.info("Starting video generation...", {
      description: "This may take several minutes to complete"
    });

    try {
      const response = await VideoAPIService.generateVideo(request);
      
      if (response.status === 'completed' && response.videoUrl) {
        const updatedGeneration: VideoGeneration = {
          ...generation,
          status: 'completed',
          videoUrl: response.videoUrl,
          thumbnailUrl: response.thumbnailUrl
        };
        
        setCurrentGeneration(updatedGeneration);
        StorageService.updateVideoGeneration(generation.id, updatedGeneration);
        
        // Update recent generations
        const history = StorageService.getVideoHistory();
        setRecentGenerations(history.generations.slice(0, 3));
        
        toast.success("Video generated successfully!", {
          description: "Your video is ready to view and download"
        });
        
      } else if (response.status === 'failed') {
        const failedGeneration: VideoGeneration = {
          ...generation,
          status: 'failed',
          errorMessage: response.errorMessage
        };
        
        setCurrentGeneration(failedGeneration);
        StorageService.updateVideoGeneration(generation.id, failedGeneration);
        
        toast.error("Video generation failed", {
          description: response.errorMessage || "Please try again with a different prompt"
        });
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      const failedGeneration: VideoGeneration = {
        ...generation,
        status: 'failed',
        errorMessage
      };
      
      setCurrentGeneration(failedGeneration);
      StorageService.updateVideoGeneration(generation.id, failedGeneration);
      
      toast.error("Generation failed", {
        description: errorMessage
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startNewGeneration = () => {
    setCurrentGeneration(null);
    setPrompt("");
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
            AI Video Generation
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform your ideas into stunning videos with advanced AI. Describe your vision and watch it come to life.
          </p>
        </div>
        
        <div className="relative max-w-4xl mx-auto">
          <img
            src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/ce216d7a-eb04-4a4a-a1a7-11a9f6b1196b.png"
            alt="Modern AI video studio with holographic displays and creative workspace"
            className="w-full rounded-2xl shadow-2xl border border-white/10"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent rounded-2xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Generation Panel */}
        <div className="lg:col-span-2 space-y-6">
          <PromptInput
            value={prompt}
            onChange={setPrompt}
            onSubmit={generateVideo}
            isGenerating={isGenerating}
          />
          
          {/* Advanced Settings */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Generation Settings</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-gray-400 hover:text-white"
                >
                  {showAdvanced ? "Hide Advanced" : "Show Advanced"}
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-gray-300">Aspect Ratio</Label>
                  <Select value={aspectRatio} onValueChange={(value: any) => setAspectRatio(value)}>
                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      <SelectItem value="16:9">Landscape (16:9)</SelectItem>
                      <SelectItem value="9:16">Portrait (9:16)</SelectItem>
                      <SelectItem value="1:1">Square (1:1)</SelectItem>
                      <SelectItem value="4:3">Classic (4:3)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Quality</Label>
                  <Select value={quality} onValueChange={(value: any) => setQuality(value)}>
                    <SelectTrigger className="bg-black/20 border-white/20 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-white/20">
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="high">High Quality</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-gray-300">Duration: {duration[0]}s</Label>
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    max={30}
                    min={3}
                    step={1}
                    className="py-2"
                  />
                </div>
              </div>
              
              {showAdvanced && (
                <div className="pt-4 border-t border-white/10 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-gray-300">AI Model</Label>
                    <div className="bg-black/20 border border-white/20 rounded-lg p-3">
                      <p className="text-white font-medium">Veo-3 (Google)</p>
                      <p className="text-sm text-gray-400">Advanced video generation with realistic motion and high fidelity</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Generation */}
          {currentGeneration && (
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white text-lg">Current Generation</CardTitle>
              </CardHeader>
              <CardContent>
                <VideoPlayer video={currentGeneration} />
                
                {currentGeneration.status === 'completed' && (
                  <div className="mt-4">
                    <Button
                      onClick={startNewGeneration}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    >
                      Generate Another Video
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          {/* Recent Generations */}
          {recentGenerations.length > 0 && !currentGeneration && (
            <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
              <CardHeader>
                <CardTitle className="text-white text-lg">Recent Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentGenerations.map((video) => (
                  <div key={video.id} className="space-y-2">
                    <div className="aspect-video bg-gray-800 rounded-lg overflow-hidden">
                      {video.status === 'completed' && video.videoUrl ? (
                        <video
                          src={video.videoUrl}
                          className="w-full h-full object-cover"
                          poster={video.thumbnailUrl}
                          muted
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                          {video.status === 'generating' ? 'Generating...' : 'Failed'}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">{video.prompt}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          
          {/* Stats */}
          <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="text-white text-lg">Generation Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Videos</span>
                <span className="text-white font-semibold">{StorageService.getVideoHistory().totalCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Success Rate</span>
                <span className="text-green-400 font-semibold">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg. Time</span>
                <span className="text-white font-semibold">3.2 min</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}