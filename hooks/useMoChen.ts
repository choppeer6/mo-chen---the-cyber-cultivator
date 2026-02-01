import { useState, useEffect, useCallback } from 'react';
import { Message, Role, Language } from '../types';
import { INITIAL_MESSAGES } from '../constants';
import { sendMessageToMoChen, analyzeArtifact } from '../services/geminiService';

// ImageCapture is an experimental API, declaring it here to satisfy TypeScript
declare class ImageCapture {
  constructor(track: MediaStreamTrack);
  grabFrame(): Promise<ImageBitmap>;
}

export const useMoChen = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [affinity, setAffinity] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedAffinity = localStorage.getItem('mo_chen_affinity');
    const savedMessages = localStorage.getItem('mo_chen_messages');
    const savedLanguage = localStorage.getItem('mo_chen_language') as Language;

    if (savedAffinity) setAffinity(parseInt(savedAffinity, 10));
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'zh')) {
      setLanguage(savedLanguage);
    }
    
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      // Default to English messages initially unless user switches
      const initial: Message[] = INITIAL_MESSAGES['en'].map((text, idx) => ({
        id: `init-${idx}`,
        role: Role.MODEL,
        text,
        timestamp: Date.now() + idx * 1000
      }));
      setMessages(initial);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('mo_chen_affinity', affinity.toString());
    localStorage.setItem('mo_chen_messages', JSON.stringify(messages));
    localStorage.setItem('mo_chen_language', language);
  }, [affinity, messages, language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const increaseAffinity = (amount: number) => {
    setAffinity(prev => Math.min(100, prev + amount));
  };

  const addMessage = (role: Role, text: string, type: 'text' | 'analysis_result' = 'text') => {
      setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role,
          text,
          timestamp: Date.now(),
          type
      }]);
  };

  const sendMessage = useCallback(async (text: string) => {
    addMessage(Role.USER, text);
    setIsLoading(true);
    setTimeout(() => setIsSpeaking(true), 500);

    try {
      const responseText = await sendMessageToMoChen(messages, text, affinity, language);
      addMessage(Role.MODEL, responseText);
      increaseAffinity(2);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsSpeaking(false), 2000);
    }
  }, [messages, affinity, language]);

  const sendFile = useCallback(async (file: File) => {
    const userText = language === 'zh' ? `[呈上法宝: ${file.name}]` : `[Presented Artifact: ${file.name}]`;
    addMessage(Role.USER, userText);
    setIsLoading(true);

    try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Data = (reader.result as string).split(',')[1];
            const analysis = await analyzeArtifact(file.type, base64Data, affinity, 'file', language);
            addMessage(Role.MODEL, analysis, 'analysis_result');
            increaseAffinity(5);
            setIsLoading(false);
        };
    } catch (e) {
        setIsLoading(false);
    }
  }, [affinity, language]);

  const captureScreen = useCallback(async () => {
      try {
          const stream = await navigator.mediaDevices.getDisplayMedia({ 
              video: { width: 1280, height: 720 }, 
              audio: false 
          });
          
          const track = stream.getVideoTracks()[0];
          const imageCapture = new ImageCapture(track);
          const bitmap = await imageCapture.grabFrame();
          
          const canvas = document.createElement('canvas');
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error("Canvas error");
          
          ctx.drawImage(bitmap, 0, 0);
          const base64Url = canvas.toDataURL('image/jpeg', 0.8);
          const base64Data = base64Url.split(',')[1];
          
          track.stop();

          const userText = language === 'zh' ? "[开启神识扫视幻境]" : "[Invoked Divine Sense on Screen]";
          addMessage(Role.USER, userText);
          setIsLoading(true);

          const analysis = await analyzeArtifact('image/jpeg', base64Data, affinity, 'screen', language);
          addMessage(Role.MODEL, analysis, 'analysis_result');
          increaseAffinity(8); 
      } catch (err) {
          console.error("Screen capture failed:", err);
      } finally {
          setIsLoading(false);
      }
  }, [affinity, language]);

  return {
    messages,
    affinity,
    isLoading,
    isSpeaking,
    language,
    toggleLanguage,
    sendMessage,
    sendFile,
    captureScreen
  };
};