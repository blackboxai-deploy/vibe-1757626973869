"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isGenerating?: boolean;
  placeholder?: string;
}

const PROMPT_SUGGESTIONS = [
  "A serene mountain landscape at sunrise with golden light",
  "A futuristic city with flying cars and neon lights",
  "Ocean waves crashing against rocky cliffs in slow motion",
  "A cozy coffee shop with warm lighting and people reading",
  "Space exploration with astronauts floating in zero gravity",
  "A magical forest with glowing fireflies and mystical creatures",
  "Time-lapse of a flower blooming in a garden",
  "An abstract visualization of music with flowing colors"
];

export function PromptInput({ 
  value, 
  onChange, 
  onSubmit, 
  isGenerating = false,
  placeholder = "Describe the video you want to generate in detail..."
}: PromptInputProps) {
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      if (value.trim() && !isGenerating) {
        onSubmit();
      }
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Video Description</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className="text-gray-400 hover:text-white"
              >
                {showSuggestions ? "Hide Examples" : "Show Examples"}
              </Button>
            </div>
            
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={placeholder}
              className="min-h-[120px] resize-none bg-black/20 border-white/20 text-white placeholder:text-gray-400 focus:border-purple-500/50 focus:ring-purple-500/20"
              disabled={isGenerating}
            />
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {value.length > 0 && (
                  <span>{value.length} characters • </span>
                )}
                Press Cmd/Ctrl + Enter to generate
              </div>
              
              <Button
                onClick={onSubmit}
                disabled={!value.trim() || isGenerating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium px-8"
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Generating...
                  </>
                ) : (
                  "Generate Video"
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {showSuggestions && (
        <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
          <CardContent className="p-6">
            <h4 className="text-sm font-medium text-gray-300 mb-3">Example Prompts</h4>
            <div className="flex flex-wrap gap-2">
              {PROMPT_SUGGESTIONS.map((suggestion, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="cursor-pointer bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition-colors px-3 py-1"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Badge>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Click any example to use as your prompt, or combine ideas to create something unique.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}