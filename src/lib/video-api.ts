import { GenerationRequest, GenerationResponse } from '@/types/video';

const API_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const DEFAULT_MODEL = 'replicate/google/veo-3';

const headers = {
  'CustomerId': 'cus_SsWJLlY2Jk4fhE',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
} as const;

export class VideoAPIService {
  static async generateVideo(request: GenerationRequest): Promise<GenerationResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: request.model || DEFAULT_MODEL,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Handle the API response and extract video URL
      const videoUrl = this.extractVideoUrl(data);
      
      return {
        id: this.generateId(),
        status: videoUrl ? 'completed' : 'generating',
        videoUrl,
        estimatedTime: request.duration || 5
      };
    } catch (error) {
      console.error('Video generation failed:', error);
      return {
        id: this.generateId(),
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  private static buildPrompt(request: GenerationRequest): string {
    let prompt = request.prompt;
    
    // Add technical specifications to the prompt
    const specs = [];
    if (request.duration) specs.push(`Duration: ${request.duration} seconds`);
    if (request.aspectRatio) specs.push(`Aspect ratio: ${request.aspectRatio}`);
    if (request.quality) specs.push(`Quality: ${request.quality}`);
    
    if (specs.length > 0) {
      prompt += `\n\nTechnical specifications: ${specs.join(', ')}`;
    }
    
    return prompt;
  }

  private static extractVideoUrl(apiResponse: any): string | undefined {
    try {
      // Handle different response formats from the API
      if (apiResponse.choices?.[0]?.message?.content) {
        const content = apiResponse.choices[0].message.content;
        
        // If content is a URL, return it directly
        if (content.startsWith('http') && (content.includes('.mp4') || content.includes('video'))) {
          return content;
        }
        
        // If content contains a URL, extract it
        const urlMatch = content.match(/(https?:\/\/[^\s]+\.mp4)/);
        if (urlMatch) {
          return urlMatch[1];
        }
      }
      
      // Check if response directly contains a URL
      if (typeof apiResponse === 'string' && apiResponse.startsWith('http')) {
        return apiResponse;
      }
      
      return undefined;
    } catch (error) {
      console.error('Error extracting video URL:', error);
      return undefined;
    }
  }

  private static generateId(): string {
    return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static async checkGenerationStatus(id: string): Promise<GenerationResponse> {
    // In a real implementation, this would check the status of an ongoing generation
    // For now, we'll simulate status checking
    return {
      id,
      status: 'generating',
      estimatedTime: 300 // 5 minutes
    };
  }

  static createThumbnail(videoUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.currentTime = 1; // Capture frame at 1 second
      
      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          reject(new Error('Failed to get canvas context'));
        }
      };
      
      video.onerror = () => reject(new Error('Failed to load video for thumbnail'));
      video.src = videoUrl;
    });
  }
}