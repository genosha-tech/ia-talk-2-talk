import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface AudioControlsProps {
  isProcessing: boolean;
  isPlayingAudio: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export default function AudioControls({
  isProcessing,
  isPlayingAudio,
  onStartRecording,
  onStopRecording,
}: AudioControlsProps) {
  const [isRecording, setIsRecording] = useState(false);

  // Reset recording state when processing or audio playback starts
  useEffect(() => {
    if (isProcessing || isPlayingAudio) {
      setIsRecording(false);
    }
  }, [isProcessing, isPlayingAudio]);

  // Auto-start recording only if not already recording
  useEffect(() => {
    if (!isPlayingAudio && !isProcessing && !isRecording) {
      console.log("Conditions met for auto-recording");
      handleToggleRecording();
    }
  }, [isPlayingAudio, isProcessing]);

  const handleToggleRecording = () => {
    if (isRecording) {
      console.log("Stopping recording via toggle");
      onStopRecording();
      setIsRecording(false);
    } else if (!isProcessing && !isPlayingAudio) {
      console.log("Starting recording via toggle");
      onStartRecording();
      setIsRecording(true);
    } else {
      console.log("Cannot toggle recording:", { isProcessing, isPlayingAudio });
    }
  };

  return (
    <div className="flex justify-center items-center gap-4">
      <Button
        variant={isRecording ? "destructive" : "default"}
        size="lg"
        className={`rounded-full w-16 h-16 ${isRecording ? 'animate-pulse' : ''}`}
        onClick={handleToggleRecording}
        disabled={isProcessing || isPlayingAudio}
      >
        {isProcessing ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-6 w-6" />
        ) : (
          <Mic className="h-6 w-6" />
        )}
      </Button>
    </div>
  );
}