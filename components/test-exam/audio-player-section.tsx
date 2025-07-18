'use client';

import React, { useContext, useEffect, useRef, useState } from 'react';
import { removeAudio } from '@/actions/test-exam/audio-removal';
import { uploadAudio } from '@/actions/test-exam/audio-upload';
import { Pause, Play, Upload, Volume2, X } from 'lucide-react';
import { toast } from 'sonner';
import { ExamContext } from '@/global/exam-context';
import { Button } from '@/components/ui/button';

interface AudioPlayerSectionProps {
  assessment: {
    id: string;
    audioPath?: string | null;
  };
}

const AudioPlayerSection: React.FC<AudioPlayerSectionProps> = ({
  assessment
}) => {
  const { mode } = useContext(ExamContext);
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isUploading, setIsUploading] = useState(false);

  const isEditMode = mode === 'edit';

  // Auto-play audio when component mounts in simulation/test mode
  useEffect(() => {
    if (!isEditMode && assessment.audioPath && audioRef.current) {
      const playAudio = async () => {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
        } catch (error) {
          console.error('Error auto-playing audio:', error);
        }
      };
      playAudio();
    }
  }, [isEditMode, assessment.audioPath]);

  // Early return check - must be after ALL hooks
  if (!assessment.audioPath && !isEditMode) {
    return null; // Don't show anything if no audio in simulation/test mode
  }

  const handlePlayPause = () => {
    // Only allow play/pause in edit mode
    if (isEditMode && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const newTime = parseFloat(e.target.value);
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('audio', file);
    formData.append('assessmentId', assessment.id);

    try {
      const result = await uploadAudio(formData);
      toast.success('Audio uploaded successfully');
      // Reload the page to get the updated audio path
      window.location.reload();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload audio');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAudio = async () => {
    try {
      await removeAudio(assessment.id);
      toast.success('Audio removed successfully');
      window.location.reload();
    } catch (error) {
      console.error('Remove error:', error);
      toast.error('Failed to remove audio');
    }
  };

  return (
    <div className="bg-background border border-border p-4 rounded-lg mb-4">
      {/* Edit Mode - Full Controls */}
      {isEditMode && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Audio Player
            </h3>
            {assessment.audioPath && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveAudio}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-2" />
                Remove Audio
              </Button>
            )}
          </div>

          {!assessment.audioPath ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                Upload audio file for this assessment
              </p>
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? 'Uploading...' : 'Choose Audio File'}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Supported formats: MP3, WAV, OGG, M4A (Max 50MB)
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <audio
                ref={audioRef}
                src={assessment.audioPath}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                preload="metadata"
              />

              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePlayPause}
                  className="flex items-center space-x-2"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </Button>

                <div className="flex-1 flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {formatTime(currentTime)}
                  </span>
                  <input
                    type="range"
                    min="0"
                    max={duration || 0}
                    value={currentTime}
                    onChange={handleSeek}
                    className="flex-1 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-muted-foreground">
                    {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Simulation/Test Mode - Audio Only Label with Volume Control */}
      {!isEditMode && assessment.audioPath && (
        <div className="flex items-center justify-center py-3 space-x-6">
          <audio
            ref={audioRef}
            src={assessment.audioPath}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={() => setIsPlaying(false)}
            preload="metadata"
          />

          <div className="flex items-center space-x-2">
            <div
              className={`h-2 w-2 rounded-full ${isPlaying ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}
            />
            <span className="text-sm text-muted-foreground">
              {isPlaying ? 'Audio Playing' : 'Audio Loaded'}
            </span>
          </div>

          {/* Volume Control for Practice/Simulation Mode */}
          <div className="flex items-center space-x-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-20 h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
              title={`Volume: ${Math.round(volume * 100)}%`}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioPlayerSection;
