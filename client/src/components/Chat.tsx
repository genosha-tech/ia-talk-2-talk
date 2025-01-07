import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSendMessage } from "@/lib/openai";
import { synthesizeSpeech } from "@/lib/elevenlabs";
import { playAudio, SpeechHandler } from "@/lib/speech";
import ChatMessage from "@/components/ChatMessage";
import AudioControls from "@/components/AudioControls";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const conversationStarted = useRef(false);
  const speechHandler = useRef<SpeechHandler>();
  const sendMessage = useSendMessage();

  useEffect(() => {
    const startConversation = async () => {
      if (conversationStarted.current) return;
      conversationStarted.current = true;

      try {
        setIsProcessing(true);
        const initialPrompt = "Preséntate de forma breve y pregunta nombre, edad y ubicación.";
        const response = await sendMessage.mutateAsync(initialPrompt);
        const welcomeMessage = { role: "assistant" as const, content: response.message };
        setMessages([welcomeMessage]);

        await playAudioWithState(response.message);
      } catch (error) {
        console.error("Error starting conversation:", error);
      } finally {
        setIsProcessing(false);
      }
    };

    startConversation();
  }, []);

  const playAudioWithState = async (text: string) => {
    if (isPlaying) {
      console.log("Already playing audio, skipping");
      return;
    }

    try {
      setIsPlaying(true);
      console.log("Starting audio playback");
      const audioBuffer = await synthesizeSpeech(text);
      await playAudio(audioBuffer);
    } catch (error) {
      console.error("Error playing audio:", error);
    } finally {
      console.log("Audio playback finished, enabling microphone");
      setIsPlaying(false);
    }
  };

  const handleNewMessage = async (text: string) => {
    if (isProcessing || isPlaying) {
      console.log("Still processing or playing, ignoring new message");
      return;
    }

    try {
      setIsProcessing(true);
      setMessages(prev => [...prev, { role: "user", content: text }]);

      const response = await sendMessage.mutateAsync(text);
      const newMessage = { role: "assistant" as const, content: response.message };
      setMessages(prev => [...prev, newMessage]);

      await playAudioWithState(response.message);
    } catch (error) {
      console.error("Error processing message:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartRecording = () => {
    try {
      console.log("Starting recording");
      if (!speechHandler.current) {
        speechHandler.current = new SpeechHandler(handleNewMessage);
      }
      if (!isProcessing && !isPlaying && speechHandler.current) {
        speechHandler.current.startListening();
      }
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const handleStopRecording = () => {
    try {
      console.log("Stopping recording");
      if (speechHandler.current) {
        speechHandler.current.stopListening();
      }
    } catch (error) {
      console.error("Error stopping recording:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 flex flex-col items-center">
      <motion.h1 
        className="text-5xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-lg"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
      >
        Genosha + Chequeado Demo
      </motion.h1>

      <Card className="w-full max-w-2xl h-[80vh] flex flex-col relative overflow-hidden">
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />

        <ScrollArea className="flex-1 p-4">
          <AnimatePresence mode="popLayout">
            {messages.map((message, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <ChatMessage message={message} />
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>

        <div className="p-4 border-t">
          <AudioControls
            isProcessing={isProcessing}
            isPlayingAudio={isPlaying}
            onStartRecording={handleStartRecording}
            onStopRecording={handleStopRecording}
          />
        </div>
      </Card>
    </div>
  );
}