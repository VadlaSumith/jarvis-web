//declare global {
  //interface Window {
    //webkitSpeechRecognition: any;
  //}
//}
// --- Add these custom types manually ---
type SpeechRecognitionAlternative = {
  transcript: string;
  confidence: number;
};

type SpeechRecognitionResult = {
  isFinal: boolean;
  length: number;
  [index: number]: SpeechRecognitionAlternative;
};

interface SpeechRecognitionEventLike extends Event {
  results: {
    [index: number]: SpeechRecognitionResult;
    length: number;
  };
}

// --- Your Hook ---
export function useSpeech() {
  const isSpeechSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const isRecognitionSupported = typeof window !== 'undefined' && 'webkitSpeechRecognition' in window;

  const speak = (text: string) => {
    if (!isSpeechSupported) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  };
  const listen = (onResult: (text: string) => void, onEnd?: () => void) => {
    if (!isRecognitionSupported) return;
    //const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const SpeechRecognition = window.webkitSpeechRecognition;
    //const SpeechRecognition = (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: SpeechRecognitionEventLike) => {
    const transcript = event.results[0][0].transcript;
    onResult(transcript);
    };

    recognition.onerror = () => onResult('');
    recognition.onend = onEnd || (() => {});
    recognition.start();
  };

  return { speak, listen, isSpeechSupported, isRecognitionSupported };
}
