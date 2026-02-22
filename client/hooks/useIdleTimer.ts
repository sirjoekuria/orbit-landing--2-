import { useState, useEffect, useCallback } from 'react';

interface UseIdleTimerProps {
    timeout: number; // in milliseconds
    onIdle: () => void;
}

export const useIdleTimer = ({ timeout, onIdle }: UseIdleTimerProps) => {
    const [isIdle, setIsIdle] = useState(false);

    const handleActivity = useCallback(() => {
        setIsIdle(false);
    }, []);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        const setupTimer = () => {
            timeoutId = setTimeout(() => {
                setIsIdle(true);
                onIdle();
            }, timeout);
        };

        const resetTimer = () => {
            clearTimeout(timeoutId);
            handleActivity();
            setupTimer();
        };

        // Events to track user activity
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click',
        ];

        events.forEach((event) => {
            window.addEventListener(event, resetTimer);
        });

        setupTimer();

        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, resetTimer);
            });
            clearTimeout(timeoutId);
        };
    }, [timeout, onIdle, handleActivity]);

    return isIdle;
};
