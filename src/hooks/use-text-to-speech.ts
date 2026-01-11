import { useState, useEffect, useCallback } from 'react';

interface UseTextToSpeechProps {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: any) => void;
}

export function useTextToSpeech({ onStart, onEnd, onError }: UseTextToSpeechProps = {}) {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            const loadVoices = () => {
                const availableVoices = window.speechSynthesis.getVoices();
                setVoices(availableVoices);
                // Try to find a good English voice
                const englishVoice = availableVoices.find(
                    v => v.name.includes('Google US English') || v.name.includes('Samantha') || v.lang.startsWith('en')
                );
                if (englishVoice) setSelectedVoice(englishVoice);
            };

            loadVoices();
            window.speechSynthesis.onvoiceschanged = loadVoices;
        }
    }, []);

    const speak = useCallback((text: string) => {
        if (typeof window === 'undefined' || !window.speechSynthesis) return;

        // Cancel any current speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        if (selectedVoice) utterance.voice = selectedVoice;

        // Configure for a more natural pace
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onstart = () => {
            setIsSpeaking(true);
            onStart?.();
        };

        utterance.onend = () => {
            setIsSpeaking(false);
            onEnd?.();
        };

        utterance.onerror = (e) => {
            setIsSpeaking(false);
            onError?.(e);
            console.error("TTS Error:", e);
        };

        window.speechSynthesis.speak(utterance);
    }, [selectedVoice, onStart, onEnd, onError]);

    const stop = useCallback(() => {
        if (typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    }, []);

    return {
        speak,
        stop,
        isSpeaking,
        voices,
        selectedVoice,
        setSelectedVoice
    };
}
