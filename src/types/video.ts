export interface VideoGeneration {
  id: string;
  prompt: string;
  videoUrl: string;
  thumbnailUrl?: string;
  status: 'generating' | 'completed' | 'failed';
  createdAt: string;
  duration?: number;
  aspectRatio?: string;
  quality?: string;
  model: string;
  errorMessage?: string;
}

export interface GenerationRequest {
  prompt: string;
  duration?: number;
  aspectRatio?: '16:9' | '9:16' | '1:1' | '4:3';
  quality?: 'standard' | 'high' | 'premium';
  model?: string;
}

export interface GenerationResponse {
  id: string;
  status: 'generating' | 'completed' | 'failed';
  videoUrl?: string;
  thumbnailUrl?: string;
  estimatedTime?: number;
  errorMessage?: string;
}

export interface VideoHistory {
  generations: VideoGeneration[];
  totalCount: number;
  lastUpdated: string;
}

export interface AppSettings {
  systemPrompt: string;
  defaultDuration: number;
  defaultAspectRatio: '16:9' | '9:16' | '1:1' | '4:3';
  defaultQuality: 'standard' | 'high' | 'premium';
  autoDownload: boolean;
  maxHistoryItems: number;
}

export interface GenerationStatus {
  id: string;
  status: 'generating' | 'completed' | 'failed';
  progress?: number;
  estimatedTimeRemaining?: number;
  currentStep?: string;
}