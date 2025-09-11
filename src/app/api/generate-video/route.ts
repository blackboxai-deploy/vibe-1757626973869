import { NextRequest, NextResponse } from 'next/server';
import { GenerationRequest, GenerationResponse } from '@/types/video';

const API_ENDPOINT = 'https://oi-server.onrender.com/chat/completions';
const DEFAULT_MODEL = 'replicate/google/veo-3';

const headers = {
  'CustomerId': 'cus_SsWJLlY2Jk4fhE',
  'Content-Type': 'application/json',
  'Authorization': 'Bearer xxx'
} as const;

export async function POST(request: NextRequest) {
  try {
    const body: GenerationRequest = await request.json();
    
    // Validate request
    if (!body.prompt?.trim()) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Build the prompt with specifications
    let prompt = body.prompt.trim();
    
    const specs = [];
    if (body.duration) specs.push(`Duration: ${body.duration} seconds`);
    if (body.aspectRatio) specs.push(`Aspect ratio: ${body.aspectRatio}`);
    if (body.quality) specs.push(`Quality: ${body.quality}`);
    
    if (specs.length > 0) {
      prompt += `\n\nTechnical specifications: ${specs.join(', ')}`;
    }

    // Make API request to video generation service
    const apiResponse = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: body.model || DEFAULT_MODEL,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('API request failed:', apiResponse.status, errorText);
      
      return NextResponse.json({
        id: generateId(),
        status: 'failed',
        errorMessage: `API request failed: ${apiResponse.status} ${apiResponse.statusText}`
      } as GenerationResponse);
    }

    const apiData = await apiResponse.json();
    
    // Extract video URL from response
    const videoUrl = extractVideoUrl(apiData);
    
    const response: GenerationResponse = {
      id: generateId(),
      status: videoUrl ? 'completed' : 'generating',
      videoUrl,
      estimatedTime: body.duration || 5
    };

    return NextResponse.json(response);
    
  } catch (error) {
    console.error('Video generation error:', error);
    
    const response: GenerationResponse = {
      id: generateId(),
      status: 'failed',
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    
    return NextResponse.json(response, { status: 500 });
  }
}

function extractVideoUrl(apiResponse: any): string | undefined {
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

function generateId(): string {
  return `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}