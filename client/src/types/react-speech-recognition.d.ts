declare module 'react-speech-recognition' {
  interface SpeechRecognition {
    startListening: (options?: { continuous?: boolean }) => void;
    stopListening: () => void;
    abortListening: () => void;
    browserSupportsSpeechRecognition: boolean;
  }

  interface SpeechRecognitionOptions {
    continuous?: boolean;
    language?: string;
  }

  interface SpeechRecognitionHook {
    transcript: string;
    listening: boolean;
    resetTranscript: () => void;
    browserSupportsSpeechRecognition: boolean;
    isMicrophoneAvailable: boolean;
  }

  function useSpeechRecognition(): SpeechRecognitionHook;

  const SpeechRecognition: SpeechRecognition;

  export { useSpeechRecognition };
  export default SpeechRecognition;
}