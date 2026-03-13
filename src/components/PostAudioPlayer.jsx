import { useState, useEffect, useRef, useCallback } from 'react';

function stripMarkdown(text) {
    return text
        .replace(/```[\s\S]*?```/g, '')       // code blocks
        .replace(/`([^`]+)`/g, '$1')           // inline code
        .replace(/!\[.*?\]\(.*?\)/g, '')       // images
        .replace(/\[([^\]]+)\]\(.*?\)/g, '$1') // links → text only
        .replace(/^#{1,6}\s+/gm, '')           // headings
        .replace(/(\*\*|__)(.*?)\1/g, '$2')    // bold
        .replace(/(\*|_)(.*?)\1/g, '$2')       // italic
        .replace(/~~(.*?)~~/g, '$1')           // strikethrough
        .replace(/^\s*[-*+]\s+/gm, '')         // unordered lists
        .replace(/^\s*\d+\.\s+/gm, '')         // ordered lists
        .replace(/^\s*>\s+/gm, '')             // blockquotes
        .replace(/^---+$/gm, '')               // horizontal rules
        .replace(/\|/g, ' ')                   // table pipes
        .replace(/<[^>]+>/g, '')               // HTML tags
        .replace(/\n{2,}/g, '\n')              // collapse blank lines
        .trim();
}

const noop = () => {};
const DISABLED = { status: 'idle', progress: 0, play: noop, pause: noop, stop: noop, supported: false };

function useSpeechSynthesis(text) {
    const [status, setStatus] = useState('idle'); // idle | playing | paused
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);
    const startTimeRef = useRef(null);
    const estimatedDurationRef = useRef(0);

    const supported = typeof window !== 'undefined' && !!window.speechSynthesis;

    const cleanText = stripMarkdown(text || '');

    const getVoice = useCallback(() => {
        if (!supported) return null;
        const voices = window.speechSynthesis.getVoices();
        const english = voices.filter(v => v.lang.startsWith('en'));
        const natural = english.find(v => /natural|enhanced|premium/i.test(v.name));
        return natural || english[0] || voices[0] || null;
    }, [supported]);

    const trackProgress = useCallback(() => {
        intervalRef.current = setInterval(() => {
            if (startTimeRef.current && estimatedDurationRef.current > 0) {
                const elapsed = (Date.now() - startTimeRef.current) / 1000;
                const pct = Math.min(100, (elapsed / estimatedDurationRef.current) * 100);
                setProgress(Math.round(pct));
            }
        }, 500);
    }, []);

    const stop = useCallback(() => {
        if (!supported) return;
        window.speechSynthesis.cancel();
        clearInterval(intervalRef.current);
        setStatus('idle');
        setProgress(0);
        startTimeRef.current = null;
    }, [supported]);

    const play = useCallback(() => {
        if (!supported) return;

        if (status === 'paused') {
            window.speechSynthesis.resume();
            setStatus('playing');
            trackProgress();
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voice = getVoice();
        if (voice) utterance.voice = voice;
        utterance.rate = 1;
        utterance.pitch = 1;

        // Estimate duration: ~150 words per minute
        const wordCount = cleanText.split(/\s+/).length;
        estimatedDurationRef.current = (wordCount / 150) * 60;

        utterance.onend = () => {
            clearInterval(intervalRef.current);
            setStatus('idle');
            setProgress(100);
            startTimeRef.current = null;
        };

        utterance.onerror = () => {
            clearInterval(intervalRef.current);
            setStatus('idle');
            setProgress(0);
            startTimeRef.current = null;
        };

        startTimeRef.current = Date.now();
        window.speechSynthesis.speak(utterance);
        setStatus('playing');
        trackProgress();
    }, [supported, status, cleanText, getVoice, trackProgress]);

    const pause = useCallback(() => {
        if (!supported) return;
        window.speechSynthesis.pause();
        clearInterval(intervalRef.current);
        setStatus('paused');
    }, [supported]);

    useEffect(() => {
        return () => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            clearInterval(intervalRef.current);
        };
    }, [supported]);

    if (!supported) return DISABLED;

    return { status, progress, play, pause, stop, supported: true };
}

function PostAudioPlayer({ text }) {
    const { status, progress, play, pause, stop, supported } = useSpeechSynthesis(text);

    if (!supported) return null;

    return (
        <div className="post-audio-player">
            <div className="post-audio-player__icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
            </div>
            <span className="post-audio-player__label">Listen to this post</span>

            <div className="post-audio-player__controls">
                {status === 'playing' ? (
                    <button onClick={pause} className="post-audio-player__btn" aria-label="Pause" title="Pause">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="6" y="4" width="4" height="16" />
                            <rect x="14" y="4" width="4" height="16" />
                        </svg>
                    </button>
                ) : (
                    <button onClick={play} className="post-audio-player__btn post-audio-player__btn--play" aria-label="Play" title="Play">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5,3 19,12 5,21" />
                        </svg>
                    </button>
                )}
                {status !== 'idle' && (
                    <button onClick={stop} className="post-audio-player__btn" aria-label="Stop" title="Stop">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <rect x="4" y="4" width="16" height="16" rx="2" />
                        </svg>
                    </button>
                )}
            </div>

            {status !== 'idle' && (
                <div className="post-audio-player__progress">
                    <div className="post-audio-player__progress-bar" style={{ width: `${progress}%` }} />
                </div>
            )}
        </div>
    );
}

export default PostAudioPlayer;
