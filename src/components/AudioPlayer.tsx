// src/components/AudioPlayer.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { getStoriesByEntity, generateAudioFromText } from '../services/storiesApi';
import { Story } from '../types/StoryTypes';
import { Card, CardContent } from "@/components/ui/card"; // Removed unused CardHeader, CardTitle
import AudioControls from './AudioControls'; // Import the new component

interface AudioPlayerProps {
  entityType: Story['entity_type'];
  entityId: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ entityType, entityId }) => {
  const { language, t } = useLanguage();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoadingStories, setIsLoadingStories] = useState(true);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStory, setCurrentStory] = useState<Story | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTextOpen, setIsTextOpen] = useState(false); // State to control Accordion

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Effect to fetch stories when entityType or entityId changes
  useEffect(() => {
    const fetchStories = async () => {
      setIsLoadingStories(true);
      setError(null);
      setStories([]);
      setCurrentStory(null);
      setAudioUrl(null);
      setIsTextOpen(false); // Close text accordion on new entity
      if(audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

      if (!entityId || !entityType) {
          console.error('AudioPlayer: Missing entityId or entityType', { entityType, entityId });
          setIsLoadingStories(false);
          return;
      }

      try {
        const fetchedStories = await getStoriesByEntity(entityType, entityId);
        setStories(fetchedStories);
        // If fetchedStories is empty, the component will eventually return null
      } catch (err) {
        console.error(`AudioPlayer: Failed to fetch stories for ${entityType} ${entityId}:`, err);
        setError(t('error_loading_stories') || 'Failed to load stories.');
        setStories([]); // Ensure stories is empty on error
      } finally {
        setIsLoadingStories(false);
      }
    };

    fetchStories();
  }, [entityType, entityId, t]);

  // Effect to find the story for the current language
  useEffect(() => {
      if (isLoadingStories || stories.length === 0) {
          // Don't process if still loading or no stories fetched
          setCurrentStory(null);
          setAudioUrl(null);
          setError(null); // Clear previous language errors
          setIsTextOpen(false);
          return;
      }

      const storyForLanguage = stories.find(story => story.text_content?.[language]);

      if (!storyForLanguage) {
          // No story found for the current language
          console.log(`No story found for language: ${language}`);
          setCurrentStory(null);
          setAudioUrl(null);
          // Don't set an error here, let the render logic handle returning null
          setError(null); // Clear previous errors
          setIsTextOpen(false);
      } else {
          setCurrentStory(storyForLanguage);
          // Check if audio_url exists for the current language
          const existingAudioUrl = storyForLanguage.audio_url?.[language];
          setAudioUrl(existingAudioUrl || null);
          setError(null); // Clear error if a story is found
          console.log(`Story found for language ${language}. Audio URL: ${existingAudioUrl || 'None'}`);
      }

      // Reset playback state when language changes or story changes
      if(audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
      }
      setIsPlaying(false);
      setCurrentTime(0);
      setDuration(0);

  }, [stories, language, isLoadingStories]); // Depend on stories, language, and loading state

  // Effect to load audio source when audioUrl changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
        audio.pause();
        audio.currentTime = 0;
        setIsPlaying(false); // Reset state on new load
        if (audioUrl) {
            audio.src = audioUrl;
            audio.load(); // Load the new audio source
            console.log('Audio source set and loading:', audioUrl);
        } else {
            audio.removeAttribute('src');
            setDuration(0); // Reset duration if no audioUrl
            console.log('Audio source removed.');
        }
    }
  }, [audioUrl]);

  // -- Memoized Audio Event Handlers --
  const handleLoadedMetadata = useCallback(() => {
      const audio = audioRef.current;
      if (audio) {
        console.log('handleLoadedMetadata callback fired');
        setDuration(audio.duration);
        setCurrentTime(audio.currentTime);
        console.log('Duration set to:', audio.duration);
      }
  }, [setDuration, setCurrentTime]);

  const handleTimeUpdate = useCallback(() => {
      const audio = audioRef.current;
      if (audio) {
         // console.log('handleTimeUpdate callback fired', audio.currentTime);
         setCurrentTime(audio.currentTime);
      }
  }, [setCurrentTime]);

  const handleEnded = useCallback(() => {
      console.log('handleEnded callback fired');
      setIsPlaying(false);
  }, [setIsPlaying]);

  const handlePlay = useCallback(() => {
      console.log('handlePlay callback fired');
      setIsPlaying(true);
  }, [setIsPlaying]);

  const handlePause = useCallback(() => {
      console.log('handlePause callback fired');
      setIsPlaying(false);
  }, [setIsPlaying]);

  const handleCanPlayThrough = useCallback(() => {
      console.log('handleCanPlayThrough callback fired: Audio is ready to play.');
      // Attempt to play if audioUrl is set (meaning it was likely just loaded/generated)
      const audio = audioRef.current;
      // Attempt to play only if audioRef exists, has a src, and isn't already playing
      // Check if audio play was intended (e.g., after generation)
      if(audio && audio.src && !isPlaying && !audio.paused && isLoadingAudio === false) {
         console.log('Attempting to play from canplaythrough');
         audio.play().then(() => {
             console.log('Playback started from canplaythrough');
         }).catch(err => {
            console.error('Error playing from canplaythrough:', err);
         });
      }
  }, [audioUrl, isPlaying, isLoadingAudio]); // Depend on audioUrl, isPlaying, isLoadingAudio

  const handleError = useCallback((e: Event) => {
      const audio = audioRef.current;
      console.error('handleError callback fired:', audio?.error, e);
      let errorMessage = t('failed_to_play_audio') || 'Failed to play audio.';
      switch (audio?.error?.code) {
        case MediaError.MEDIA_ERR_ABORTED: errorMessage = 'Audio playback aborted.'; break;
        case MediaError.MEDIA_ERR_NETWORK: errorMessage = 'A network error caused the audio download to fail.'; break;
        case MediaError.MEDIA_ERR_DECODE: errorMessage = 'The audio playback was aborted due to a corruption problem or because the audio used features the browser did not support.'; break;
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: errorMessage = 'The audio could not be loaded, either because the server or network failed or because the format is not supported.'; break;
        default: errorMessage = t('failed_to_play_audio') || 'Failed to play audio.'; break;
      }
      setError(errorMessage);
      setIsPlaying(false);
      setIsLoadingAudio(false); // Ensure loading state is off on error
  }, [t, setError, setIsPlaying, setIsLoadingAudio]);

  // Effect to attach/detach audio event listeners using memoized handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    console.log('Attaching audio event listeners with useCallback handlers.');

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplaythrough', handleCanPlayThrough);

    return () => {
      console.log('Cleaning up audio event listeners (useCallback handlers).');
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
    };
  // Include the memoized handlers in the dependency array
  }, [handleLoadedMetadata, handleTimeUpdate, handleEnded, handlePlay, handlePause, handleError, handleCanPlayThrough]);

  const generateAndPlayAudio = useCallback(async () => {
      const audio = audioRef.current;
      if (isLoadingAudio || !currentStory || !currentStory.text_content?.[language] || !audio) {
          console.log('Generate audio called but prerequisites not met.', { isLoadingAudio, currentStory: !!currentStory, hasText: !!currentStory?.text_content?.[language], hasAudioRef: !!audio });
          return false; // Indicate failure
      }

      setIsLoadingAudio(true);
      setError(null);
      console.log('Starting audio generation...');

      try {
          const ttsLanguageCode = language;
          const textToSynthesize = currentStory.text_content[language];
          console.log('Attempting to generate audio for:', { storyId: currentStory.id, language, entityType, entityId });
          const generatedUrl = await generateAudioFromText(
              currentStory.id,
              textToSynthesize,
              ttsLanguageCode,
              entityType,
              entityId
          );
          console.log('Generated URL:', generatedUrl);

          if (generatedUrl) {
              setAudioUrl(generatedUrl);
              console.log('audioUrl state updated after generation.');
              return true; // Indicate success
          } else {
              console.error('AudioPlayer: generateAudioFromText returned null.');
              setError(t('failed_to_generate_audio') || 'Failed to generate audio.');
              return false;
          }
      } catch (err) {
          console.error("AudioPlayer: Failed to generate audio:", err);
          setError(t('failed_to_generate_audio') || 'Failed to generate audio.');
          return false;
      } finally {
          setIsLoadingAudio(false);
          console.log('Finished audio generation attempt.');
      }
  }, [isLoadingAudio, currentStory, language, entityType, entityId, t, setAudioUrl, setIsLoadingAudio, setError]);

  const handlePlayPause = useCallback(async () => {
      const audio = audioRef.current;
      if (!audio || !currentStory) return;

      if (isLoadingAudio || isLoadingStories) {
          console.log('Play/Pause clicked but loading is in progress.');
          return;
      }

      console.log('handlePlayPause called.', { isPlaying, audioUrl });

      if (!audioUrl) {
          if (currentStory.text_content?.[language]) {
               console.log('No audioUrl on play click, initiating generation...');
               await generateAndPlayAudio();
               // Playback attempt is handled by the 'canplaythrough' listener after generation
          } else {
               console.warn('AudioPlayer: Play clicked but no audioUrl and no text_content for language.', language);
               setError(t('no_audio_or_text_for_language') || `No audio or text available for language: ${language}`);
          }
      } else {
          console.log(isPlaying ? 'Pausing existing audio...' : 'Playing existing audio...', { audioUrl, isPlaying });
          if (isPlaying) {
              audio.pause();
              // The 'pause' event listener will set isPlaying to false
          } else {
               const playPromise = audio.play();
               if (playPromise !== undefined) {
                  playPromise.catch(err => {
                     // Ignore AbortError which can happen if play is interrupted quickly
                     if (err.name !== 'AbortError') {
                       console.error('Error playing existing audio:', err);
                       setError(t('failed_to_play_audio') || 'Failed to play audio.');
                       setIsPlaying(false); // Correct state if play fails
                     } else {
                       console.log('Play interrupted (likely by pause or new load).');
                     }
                  });
                  // The 'play' event listener will set isPlaying to true
               } else {
                   console.warn('Audio play() did not return a promise.');
                   // Manually set isPlaying in case event doesn't fire (older browsers)
                   setIsPlaying(true);
               }
          }
      }
  }, [isPlaying, audioUrl, currentStory, language, generateAndPlayAudio, t, isLoadingAudio, isLoadingStories, setError, setIsPlaying]);

  const formatTime = (time: number) => {
    if (isNaN(time) || time === Infinity) return '0:00'; // Handle NaN or Infinity duration
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  const handleSeek = (event: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (audio) {
      const seekTime = parseFloat(event.target.value);
      audio.currentTime = Math.max(0, Math.min(seekTime, duration || 0));
      console.log('Seeked to:', audio.currentTime);
    }
  };

   const toggleTextAccordion = useCallback(() => {
       if (currentStory?.text_content?.[language]) {
            console.log('Toggling text accordion.');
            setIsTextOpen(prev => !prev);
       }
   }, [currentStory, language]);

  // Get the title and text content
  const storyTitle = (currentStory?.title?.[language] ?? currentStory?.title?.['en']) ?? (t('audio_story') || 'Audio Story');
  const textContent = currentStory?.text_content?.[language];

  // --- Render Logic ---

  // 1. Initial Loading State
  if (isLoadingStories) {
    return (
        <Card className="w-full">
            <CardContent className="text-center text-gray-500 p-4">
                {t('loading_stories') || 'Loading stories...'}
            </CardContent>
        </Card>
    );
  }

  // 2. No Stories Found (or error fetching)
  if (stories.length === 0) {
      console.log("No stories found for this entity. Rendering null.");
      // Optionally show an error card if there was a fetch error
      if (error && !isLoadingStories) {
           return (
            <Card className="w-full border-red-400 bg-red-50">
                <CardContent className="text-red-600 p-4 text-center">
                    {error} {/* Display specific fetch error */} 
                </CardContent>
            </Card>
           );
      }
      return null; // Render nothing if no stories were fetched successfully
  }

  // 3. Stories found, but none for the current language (currentStory is null)
  if (!currentStory) {
      console.log(`No story available for language ${language}. Rendering null.`);
      // Don't show an error here, just hide the player
      return null;
  }

  // 4. Story found for the language, but it has neither audio nor text to generate from
  if (!textContent && !audioUrl) {
       console.log(`Story found for ${language}, but has no text content and no audio URL. Rendering null.`);
       // Optionally show a specific message card if needed, but for now, hide
       return null;
  }

  // 5. Ready to render the player
  console.log('Rendering AudioControls.');
  return (
    <Card className="w-full">
        <AudioControls
            storyTitle={storyTitle}
            textContent={textContent}
            audioUrl={audioUrl}
            isPlaying={isPlaying}
            isLoadingAudio={isLoadingAudio}
            currentTime={currentTime}
            duration={duration}
            isTextOpen={isTextOpen}
            handlePlayPause={handlePlayPause}
            handleSeek={handleSeek}
            toggleTextAccordion={toggleTextAccordion}
            formatTime={formatTime}
            error={error && audioUrl ? error : null} // Only pass playback errors
        />
        {/* Hidden audio element remains here for logic */}
        <audio ref={audioRef} />
    </Card>
  );
};

export default AudioPlayer;
