interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
  AudioContext: any;
  webkitAudioContext: any;
}

export class SpeechHandler {
  private recognition: any;
  private isListening: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor(onResult: (text: string) => void) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      throw new Error('Speech recognition not supported in this browser');
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    this.recognition.lang = 'es-ES';

    this.recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      console.log('Speech recognized:', text);
      this.retryCount = 0;
      onResult(text);
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' && this.retryCount < this.maxRetries) {
        console.log(`No speech detected, retrying (${this.retryCount + 1}/${this.maxRetries})`);
        this.retryCount++;
        this.restartListening();
      } else {
        this.isListening = false;
      }
    };

    this.recognition.onend = () => {
      console.log('Speech recognition ended');
      this.isListening = false;
    };
  }

  private restartListening() {
    setTimeout(() => {
      if (this.retryCount < this.maxRetries) {
        this.actuallyStartListening();
      }
    }, 100);
  }

  startListening() {
    this.retryCount = 0;
    if (this.isListening) {
      try {
        console.log('Already listening, stopping first');
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping existing recognition:', error);
      }
      this.isListening = false;
      setTimeout(() => this.actuallyStartListening(), 100);
    } else {
      this.actuallyStartListening();
    }
  }

  private actuallyStartListening() {
    if (!this.isListening) {
      try {
        console.log('Starting speech recognition');
        this.recognition.start();
        this.isListening = true;
      } catch (error) {
        console.error('Error starting speech recognition:', error);
        this.isListening = false;
        throw error;
      }
    }
  }

  stopListening() {
    this.retryCount = this.maxRetries; // Prevent further auto-retries
    if (this.isListening) {
      try {
        console.log('Stopping speech recognition');
        this.recognition.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
      } finally {
        this.isListening = false;
      }
    }
  }
}

let audioContext: AudioContext | null = null;

export async function playAudio(arrayBuffer: ArrayBuffer): Promise<void> {
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      throw new Error('AudioContext not supported in this browser');
    }
    audioContext = new AudioContextClass();
  }

  return new Promise((resolve, reject) => {
    try {
      console.log('Starting audio playback');
      audioContext!.decodeAudioData(arrayBuffer)
        .then(audioBuffer => {
          const source = audioContext!.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext!.destination);

          source.onended = () => {
            console.log('Audio playback ended');
            resolve();
          };

          source.start(0);
        })
        .catch(error => {
          console.error('Error decoding audio:', error);
          reject(error);
        });
    } catch (error) {
      console.error('Error playing audio:', error);
      reject(error);
    }
  });
}