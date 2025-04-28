// src/components/AudioControls.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem } from "@/components/ui/accordion";
import { Play, Pause, Loader2 } from 'lucide-react';

interface AudioControlsProps {
  storyTitle: string;
  textContent: string | undefined;
  audioUrl: string | null;
  isPlaying: boolean;
  isLoadingAudio: boolean;
  currentTime: number;
  duration: number;
  isTextOpen: boolean;
  handlePlayPause: () => void;
  handleSeek: (event: React.ChangeEvent<HTMLInputElement>) => void;
  toggleTextAccordion: () => void;
  formatTime: (time: number) => string;
  error: string | null; // Pass error state for display
}

const AudioControls: React.FC<AudioControlsProps> = ({
  storyTitle,
  textContent,
  audioUrl,
  isPlaying,
  isLoadingAudio,
  currentTime,
  duration,
  isTextOpen,
  handlePlayPause,
  handleSeek,
  toggleTextAccordion,
  formatTime,
  error
}) => {
  return (
    <CardContent className="flex flex-col space-y-2 p-4">
      {/* Top row: Title, Play/Pause button, and time display */}
      <div className="flex items-center space-x-2 w-full">
        {/* Title - clickable to toggle text */}
        <div
          className={`flex-1 text-lg font-semibold leading-none tracking-tight ${textContent ? 'cursor-pointer' : 'cursor-default'}`}
          onClick={textContent ? toggleTextAccordion : undefined} // Only clickable if text exists
        >
          {storyTitle}
        </div>

        {/* Play/Pause/Loading Button */}
        <Button
          onClick={handlePlayPause}
          disabled={isLoadingAudio || (!audioUrl && !textContent)} // Basic disabled logic, parent handles more complex cases
          size="icon"
          className="flex-shrink-0"
        >
          {isLoadingAudio ? <Loader2 className="h-4 w-4 animate-spin" /> : (isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />)}
        </Button>

        {/* Current time and Duration */}
        {audioUrl && (
          <div className="text-sm text-gray-600 flex-shrink-0 min-w-[80px] text-right">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        )}
      </div>

      {/* Seek bar - only show if audioUrl exists */}
      {audioUrl && (
        <div className="flex items-center w-full">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 accent-blue-600 h-1 cursor-pointer"
            disabled={!audioUrl || duration === 0}
            aria-label="Audio seek bar"
          />
        </div>
      )}

      {/* Collapsible Text Content */}
      {textContent && (
        <Accordion
          type="single"
          collapsible
          value={isTextOpen ? "text-content" : undefined}
          onValueChange={(value) => { if (value === 'text-content' || !value) toggleTextAccordion(); }}
          className="w-full pt-2"
        >
          <AccordionItem value="text-content" className="border-none">
            {/* AccordionTrigger is removed */}
            <AccordionContent className="pt-0 text-sm text-gray-700 italic whitespace-pre-wrap">
              {/* Added whitespace-pre-wrap to respect line breaks */} 
              {textContent}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Display playback-specific errors below controls if audioUrl exists */}
      {error && audioUrl && <div className="text-red-600 text-sm mt-2 text-center">{error}</div>}
    </CardContent>
  );
};

export default AudioControls;
